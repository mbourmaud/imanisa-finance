/**
 * Transfer Detector
 * Identifies internal transfers between accounts by matching
 * transactions with same amount, opposite types, within ±3 days
 */

import { prisma } from '@/lib/prisma';
import type { CategorizationResult, TransactionForCategorization } from './types';

const TRANSFER_CATEGORY_ID = 'cat-transfer';
const DATE_TOLERANCE_DAYS = 3;

/**
 * Detect internal transfers among uncategorized transactions
 * Matches pairs: same |amount|, opposite types (INCOME/EXPENSE), within ±3 days, different accounts
 */
export async function detectTransfers(
	transactions: TransactionForCategorization[],
): Promise<CategorizationResult[]> {
	const results: CategorizationResult[] = [];
	const matched = new Set<string>();

	// Group by absolute amount for faster matching
	const byAmount = new Map<number, TransactionForCategorization[]>();
	for (const tx of transactions) {
		const absAmount = Math.abs(tx.amount);
		const group = byAmount.get(absAmount) ?? [];
		group.push(tx);
		byAmount.set(absAmount, group);
	}

	// Also load recent transactions from other accounts for cross-account matching
	const accountIds = [...new Set(transactions.map((tx) => tx.accountId))];
	if (accountIds.length === 0) return results;

	// Get date range from current transactions
	const dates = transactions.map((tx) => tx.date.getTime());
	const minDate = new Date(Math.min(...dates) - DATE_TOLERANCE_DAYS * 86_400_000);
	const maxDate = new Date(Math.max(...dates) + DATE_TOLERANCE_DAYS * 86_400_000);

	// Load potential matches from other accounts
	const otherAccountTxs = await prisma.transaction.findMany({
		where: {
			accountId: { notIn: accountIds },
			date: { gte: minDate, lte: maxDate },
			isInternal: false,
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

	// Add other account transactions to the amount groups
	for (const tx of otherAccountTxs) {
		const absAmount = Math.abs(tx.amount);
		const group = byAmount.get(absAmount) ?? [];
		group.push(tx);
		byAmount.set(absAmount, group);
	}

	// Find matching pairs
	for (const [, group] of byAmount) {
		if (group.length < 2) continue;

		const incomes = group.filter((tx) => tx.type === 'INCOME');
		const expenses = group.filter((tx) => tx.type === 'EXPENSE');

		for (const income of incomes) {
			if (matched.has(income.id)) continue;

			for (const expense of expenses) {
				if (matched.has(expense.id)) continue;
				if (income.accountId === expense.accountId) continue;

				// Check date tolerance
				const daysDiff = Math.abs(income.date.getTime() - expense.date.getTime()) / 86_400_000;
				if (daysDiff > DATE_TOLERANCE_DAYS) continue;

				// Match found
				matched.add(income.id);
				matched.add(expense.id);

				// Only categorize transactions that are in our input set
				const inputIds = new Set(transactions.map((tx) => tx.id));

				if (inputIds.has(income.id)) {
					results.push({
						transactionId: income.id,
						categoryId: TRANSFER_CATEGORY_ID,
						source: 'TRANSFER',
						confidence: 0.9,
						reasoning: `Matched with expense in another account (±${daysDiff.toFixed(0)}d)`,
					});
				}

				if (inputIds.has(expense.id)) {
					results.push({
						transactionId: expense.id,
						categoryId: TRANSFER_CATEGORY_ID,
						source: 'TRANSFER',
						confidence: 0.9,
						reasoning: `Matched with income in another account (±${daysDiff.toFixed(0)}d)`,
					});
				}

				break; // One match per income transaction
			}
		}
	}

	// Also flag transactions from our input that match isInternal pattern
	await flagInternalTransactions(results);

	return results;
}

/**
 * Mark matched transactions as internal in the database
 */
async function flagInternalTransactions(results: CategorizationResult[]): Promise<void> {
	const transferIds = results.map((r) => r.transactionId);
	if (transferIds.length === 0) return;

	await prisma.transaction.updateMany({
		where: { id: { in: transferIds } },
		data: { isInternal: true },
	});
}
