/**
 * Categorization Pipeline
 * Orchestrates the multi-step categorization process:
 * 1. Rule Engine (DB rules) → confidence 1.0
 * 2. Bank Category Mapping → confidence 0.7
 * 3. Claude AI (Haiku) → variable confidence
 * 4. Transfer Detection → confidence 0.9
 *
 * Never blocking: errors are caught and logged, import always succeeds
 */

import { prisma } from '@/lib/prisma';
import { categorizationLogRepository } from '@/server/repositories/categorization-log-repository';
import { applyAICategorization } from './ai-categorizer';
import { applyBankCategoryMapping } from './bank-category-mapper';
import { applyRuleEngine } from './rule-engine';
import { detectTransfers } from './transfer-detector';
import type { CategorizationResult, PipelineStats, TransactionForCategorization } from './types';

/**
 * Load uncategorized transactions from the database
 * Optionally filter by account ID (for post-import categorization)
 */
async function loadUncategorizedTransactions(
	accountId?: string,
): Promise<TransactionForCategorization[]> {
	return prisma.transaction.findMany({
		where: {
			transactionCategory: null,
			...(accountId && { accountId }),
		},
		select: {
			id: true,
			description: true,
			amount: true,
			type: true,
			date: true,
			bankCategory: true,
			accountId: true,
			isInternal: true,
		},
	});
}

/**
 * Apply categorization results to the database
 * Uses upsert to handle re-categorization
 */
async function applyResults(results: CategorizationResult[]): Promise<number> {
	let applied = 0;

	// Batch upserts for performance
	const batchSize = 100;
	for (let i = 0; i < results.length; i += batchSize) {
		const batch = results.slice(i, i + batchSize);

		for (const result of batch) {
			try {
				// Map our source type to the DB CategorySource enum
				const dbSource =
					result.source === 'RULE' || result.source === 'AI' || result.source === 'TRANSFER'
						? 'AUTO'
						: result.source === 'BANK'
							? 'BANK'
							: 'AUTO';

				await prisma.transactionCategory.upsert({
					where: { transactionId: result.transactionId },
					update: {
						categoryId: result.categoryId,
						source: dbSource,
						confidence: result.confidence,
					},
					create: {
						transactionId: result.transactionId,
						categoryId: result.categoryId,
						source: dbSource,
						confidence: result.confidence,
					},
				});
				applied++;
			} catch (error) {
				console.error(
					`[Pipeline] Failed to apply category for ${result.transactionId}:`,
					error instanceof Error ? error.message : error,
				);
			}
		}
	}

	return applied;
}

/**
 * Run the full categorization pipeline
 * @param accountId - Optional: only categorize transactions for this account
 * @returns Pipeline statistics
 */
export async function runCategorizationPipeline(accountId?: string): Promise<PipelineStats> {
	const startTime = Date.now();
	const stats: PipelineStats = {
		total: 0,
		ruleMatches: 0,
		bankMatches: 0,
		aiMatches: 0,
		transferMatches: 0,
		unmatched: 0,
		duration: 0,
		estimatedCost: 0,
	};

	try {
		// Load uncategorized transactions
		const transactions = await loadUncategorizedTransactions(accountId);
		stats.total = transactions.length;

		if (transactions.length === 0) {
			stats.duration = Date.now() - startTime;
			return stats;
		}

		console.log(`[Pipeline] Processing ${transactions.length} uncategorized transactions`);

		const categorized = new Set<string>();
		const allResults: CategorizationResult[] = [];

		// Step 1: Rule Engine
		try {
			const ruleResults = await applyRuleEngine(transactions);
			stats.ruleMatches = ruleResults.length;
			for (const r of ruleResults) {
				categorized.add(r.transactionId);
				allResults.push(r);
			}
			console.log(`[Pipeline] Rule engine: ${ruleResults.length} matches`);
		} catch (error) {
			console.error('[Pipeline] Rule engine failed:', error);
		}

		// Step 2: Bank Category Mapping (only for remaining)
		try {
			const remaining = transactions.filter((tx) => !categorized.has(tx.id));
			const bankResults = applyBankCategoryMapping(remaining);
			stats.bankMatches = bankResults.length;
			for (const r of bankResults) {
				categorized.add(r.transactionId);
				allResults.push(r);
			}
			console.log(`[Pipeline] Bank mapping: ${bankResults.length} matches`);
		} catch (error) {
			console.error('[Pipeline] Bank mapping failed:', error);
		}

		// Step 3: AI Categorization (only for remaining)
		try {
			const remaining = transactions.filter((tx) => !categorized.has(tx.id));
			if (remaining.length > 0) {
				const { results: aiResults, estimatedCost } = await applyAICategorization(remaining);
				stats.aiMatches = aiResults.length;
				stats.estimatedCost = estimatedCost;
				for (const r of aiResults) {
					categorized.add(r.transactionId);
					allResults.push(r);
				}
				console.log(`[Pipeline] AI: ${aiResults.length} matches`);
			}
		} catch (error) {
			console.error('[Pipeline] AI categorization failed:', error);
		}

		// Step 4: Transfer Detection (runs on all transactions, may re-categorize)
		try {
			const transferResults = await detectTransfers(transactions);
			stats.transferMatches = transferResults.length;
			// Transfers override previous categorizations
			for (const r of transferResults) {
				// Remove previous result if exists
				const existingIdx = allResults.findIndex((ar) => ar.transactionId === r.transactionId);
				if (existingIdx >= 0) {
					allResults[existingIdx] = r;
				} else {
					categorized.add(r.transactionId);
					allResults.push(r);
				}
			}
			console.log(`[Pipeline] Transfers: ${transferResults.length} detected`);
		} catch (error) {
			console.error('[Pipeline] Transfer detection failed:', error);
		}

		// Apply all results to database
		const applied = await applyResults(allResults);
		stats.unmatched = transactions.length - categorized.size;
		stats.duration = Date.now() - startTime;

		console.log(
			`[Pipeline] Completed in ${stats.duration}ms: ` +
				`${applied} categorized, ${stats.unmatched} unmatched`,
		);

		// Log results
		await categorizationLogRepository.create(stats);

		return stats;
	} catch (error) {
		stats.duration = Date.now() - startTime;
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[Pipeline] Fatal error:', errorMessage);

		await categorizationLogRepository.create({
			...stats,
			errorMessage,
		});

		return stats;
	}
}
