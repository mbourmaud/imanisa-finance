/**
 * Recurring Transaction Detector
 * Identifies recurring patterns (subscriptions, loans, etc.) by analyzing
 * transaction history for repeated descriptions with regular intervals
 */

import type { RecurringFrequency } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { recurringPatternRepository } from '@/server/repositories/recurring-pattern-repository';
import { normalizeDescription } from './rule-engine';

const MIN_OCCURRENCES = 3;
const LOOKBACK_MONTHS = 6;
const AMOUNT_TOLERANCE = 0.1; // ±10%
const INTERVAL_STD_DEV_THRESHOLD = 0.2; // std dev < 20% of mean interval

interface DetectedPattern {
	description: string;
	normalizedDescription: string;
	amount: number;
	frequency: RecurringFrequency;
	occurrenceCount: number;
	lastSeenAt: Date;
	accountId: string;
	categoryId: string | null;
}

interface TransactionGroup {
	description: string;
	normalizedDescription: string;
	transactions: {
		id: string;
		amount: number;
		date: Date;
		accountId: string;
		categoryId: string | null;
	}[];
}

function detectFrequency(intervalDays: number): RecurringFrequency | null {
	// Weekly: ~7 days (±2)
	if (intervalDays >= 5 && intervalDays <= 9) return 'WEEKLY';
	// Monthly: ~30 days (±5)
	if (intervalDays >= 25 && intervalDays <= 35) return 'MONTHLY';
	// Quarterly: ~90 days (±15)
	if (intervalDays >= 75 && intervalDays <= 105) return 'QUARTERLY';
	// Annual: ~365 days (±30)
	if (intervalDays >= 335 && intervalDays <= 395) return 'ANNUAL';
	return null;
}

function standardDeviation(values: number[]): number {
	if (values.length < 2) return 0;
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const squaredDiffs = values.map((v) => (v - mean) ** 2);
	return Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length);
}

function meanValue(values: number[]): number {
	return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Detect recurring transaction patterns
 * Analyzes the last 6 months of transactions to find patterns
 */
export async function detectRecurringPatterns(): Promise<DetectedPattern[]> {
	const lookbackDate = new Date();
	lookbackDate.setMonth(lookbackDate.getMonth() - LOOKBACK_MONTHS);

	// Load all transactions in the lookback window
	const transactions = await prisma.transaction.findMany({
		where: {
			date: { gte: lookbackDate },
			isInternal: false,
		},
		select: {
			id: true,
			description: true,
			amount: true,
			date: true,
			accountId: true,
			transactionCategory: {
				select: { categoryId: true },
			},
		},
		orderBy: { date: 'asc' },
	});

	// Group by normalized description
	const groups = new Map<string, TransactionGroup>();

	for (const tx of transactions) {
		const normalized = normalizeDescription(tx.description);
		const existing = groups.get(normalized);

		if (existing) {
			existing.transactions.push({
				id: tx.id,
				amount: tx.amount,
				date: tx.date,
				accountId: tx.accountId,
				categoryId: tx.transactionCategory?.categoryId ?? null,
			});
		} else {
			groups.set(normalized, {
				description: tx.description,
				normalizedDescription: normalized,
				transactions: [
					{
						id: tx.id,
						amount: tx.amount,
						date: tx.date,
						accountId: tx.accountId,
						categoryId: tx.transactionCategory?.categoryId ?? null,
					},
				],
			});
		}
	}

	// Analyze each group for recurring patterns
	const patterns: DetectedPattern[] = [];

	for (const [, group] of groups) {
		if (group.transactions.length < MIN_OCCURRENCES) continue;

		const txs = group.transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

		// Check amount tolerance: all amounts within ±10% of the mean
		const amounts = txs.map((tx) => Math.abs(tx.amount));
		const avgAmount = meanValue(amounts);
		const allWithinTolerance = amounts.every(
			(a) => Math.abs(a - avgAmount) / avgAmount <= AMOUNT_TOLERANCE,
		);
		if (!allWithinTolerance) continue;

		// Calculate intervals between consecutive transactions
		const intervals: number[] = [];
		for (let i = 1; i < txs.length; i++) {
			const days = (txs[i].date.getTime() - txs[i - 1].date.getTime()) / 86_400_000;
			intervals.push(days);
		}

		if (intervals.length === 0) continue;

		const avgInterval = meanValue(intervals);
		const stdDev = standardDeviation(intervals);

		// Check regularity: std dev < 20% of mean
		if (avgInterval > 0 && stdDev / avgInterval > INTERVAL_STD_DEV_THRESHOLD) continue;

		// Determine frequency
		const frequency = detectFrequency(avgInterval);
		if (!frequency) continue;

		// Use the most common categoryId
		const categoryId = txs.find((tx) => tx.categoryId)?.categoryId ?? null;

		patterns.push({
			description: group.description,
			normalizedDescription: group.normalizedDescription,
			amount: avgAmount,
			frequency,
			occurrenceCount: txs.length,
			lastSeenAt: txs[txs.length - 1].date,
			accountId: txs[0].accountId,
			categoryId,
		});
	}

	return patterns;
}

/**
 * Run recurring detection and persist results
 */
export async function runRecurringDetection(): Promise<{
	detected: number;
	created: number;
	updated: number;
}> {
	const patterns = await detectRecurringPatterns();
	let created = 0;
	let updated = 0;

	for (const pattern of patterns) {
		const existing = await prisma.recurringPattern.findFirst({
			where: {
				normalizedDescription: pattern.normalizedDescription,
				isActive: true,
			},
		});

		if (existing) {
			await recurringPatternRepository.upsertByDescription(pattern.normalizedDescription, {
				description: pattern.description,
				amount: pattern.amount,
				frequency: pattern.frequency,
				accountId: pattern.accountId,
				categoryId: pattern.categoryId ?? undefined,
				occurrenceCount: pattern.occurrenceCount,
				lastSeenAt: pattern.lastSeenAt,
			});
			updated++;
		} else {
			await recurringPatternRepository.create({
				description: pattern.description,
				normalizedDescription: pattern.normalizedDescription,
				amount: pattern.amount,
				frequency: pattern.frequency,
				accountId: pattern.accountId,
				categoryId: pattern.categoryId ?? undefined,
				occurrenceCount: pattern.occurrenceCount,
				lastSeenAt: pattern.lastSeenAt,
			});
			created++;
		}
	}

	return {
		detected: patterns.length,
		created,
		updated,
	};
}
