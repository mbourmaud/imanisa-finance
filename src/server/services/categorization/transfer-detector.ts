/**
 * Transfer Detector
 * Identifies internal transfers between accounts by matching
 * transactions with same amount, opposite types, within ±3 days.
 *
 * Smart categorization based on destination account type:
 * - CHECKING → cat-transfer (virement interne)
 * - SAVINGS → cat-savings (épargne)
 * - INVESTMENT → cat-investment (investissement)
 * - LOAN → cat-loan-payment (remboursement crédit)
 */

import type { AccountType } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import type { CategorizationResult, TransactionForCategorization } from './types'

const DATE_TOLERANCE_DAYS = 3

/**
 * Map account type to the appropriate category for the EXPENSE side
 * (where the money goes determines the category)
 */
const EXPENSE_CATEGORY_BY_ACCOUNT_TYPE: Record<AccountType, string> = {
	CHECKING: 'cat-transfer',
	SAVINGS: 'cat-savings',
	INVESTMENT: 'cat-investment',
	LOAN: 'cat-loan-payment',
}

/**
 * Map account type to the appropriate category for the INCOME side
 * (where the money comes from — if it's from savings/investment, it's a withdrawal)
 */
const INCOME_CATEGORY_BY_ACCOUNT_TYPE: Record<AccountType, string> = {
	CHECKING: 'cat-transfer',
	SAVINGS: 'cat-transfer',
	INVESTMENT: 'cat-transfer',
	LOAN: 'cat-transfer',
}

interface TransactionWithAccountType extends TransactionForCategorization {
	accountType?: AccountType
}

/**
 * Detect internal transfers among uncategorized transactions
 * Matches pairs: same |amount|, opposite types (INCOME/EXPENSE), within ±3 days, different accounts
 * Then assigns category based on destination account type
 */
export async function detectTransfers(
	transactions: TransactionForCategorization[],
): Promise<CategorizationResult[]> {
	const results: CategorizationResult[] = []
	const matched = new Set<string>()

	// Load account types for all involved accounts
	const accountIds = [...new Set(transactions.map((tx) => tx.accountId))]
	if (accountIds.length === 0) return results

	// Get date range from current transactions
	const dates = transactions.map((tx) => tx.date.getTime())
	const minDate = new Date(Math.min(...dates) - DATE_TOLERANCE_DAYS * 86_400_000)
	const maxDate = new Date(Math.max(...dates) + DATE_TOLERANCE_DAYS * 86_400_000)

	// Load potential matches from other accounts (include account type)
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
	})

	// Build account type lookup (for input + other accounts)
	const allAccountIds = [
		...accountIds,
		...new Set(otherAccountTxs.map((tx) => tx.accountId)),
	]
	const accounts = await prisma.account.findMany({
		where: { id: { in: allAccountIds } },
		select: { id: true, type: true },
	})
	const accountTypeMap = new Map<string, AccountType>(
		accounts.map((a) => [a.id, a.type]),
	)

	// Group by absolute amount for faster matching
	const byAmount = new Map<number, TransactionWithAccountType[]>()

	for (const tx of transactions) {
		const absAmount = Math.abs(tx.amount)
		const group = byAmount.get(absAmount) ?? []
		group.push({ ...tx, accountType: accountTypeMap.get(tx.accountId) })
		byAmount.set(absAmount, group)
	}

	for (const tx of otherAccountTxs) {
		const absAmount = Math.abs(tx.amount)
		const group = byAmount.get(absAmount) ?? []
		group.push({ ...tx, accountType: accountTypeMap.get(tx.accountId) })
		byAmount.set(absAmount, group)
	}

	// Find matching pairs
	const inputIds = new Set(transactions.map((tx) => tx.id))

	for (const [, group] of byAmount) {
		if (group.length < 2) continue

		const incomes = group.filter((tx) => tx.type === 'INCOME')
		const expenses = group.filter((tx) => tx.type === 'EXPENSE')

		for (const income of incomes) {
			if (matched.has(income.id)) continue

			for (const expense of expenses) {
				if (matched.has(expense.id)) continue
				if (income.accountId === expense.accountId) continue

				// Check date tolerance
				const daysDiff =
					Math.abs(income.date.getTime() - expense.date.getTime()) / 86_400_000
				if (daysDiff > DATE_TOLERANCE_DAYS) continue

				// Match found
				matched.add(income.id)
				matched.add(expense.id)

				// Determine categories based on account types
				// EXPENSE side: where is the money going? → income's account type
				const destinationAccountType = income.accountType ?? 'CHECKING'
				const expenseCategoryId =
					EXPENSE_CATEGORY_BY_ACCOUNT_TYPE[destinationAccountType]

				// INCOME side: where does the money come from? → expense's account type
				const sourceAccountType = expense.accountType ?? 'CHECKING'
				const incomeCategoryId =
					INCOME_CATEGORY_BY_ACCOUNT_TYPE[sourceAccountType]

				const dayLabel = `±${daysDiff.toFixed(0)}d`

				if (inputIds.has(income.id)) {
					const typeLabel =
						sourceAccountType !== 'CHECKING'
							? ` (depuis compte ${sourceAccountType.toLowerCase()})`
							: ''
					results.push({
						transactionId: income.id,
						categoryId: incomeCategoryId,
						source: 'TRANSFER',
						confidence: 0.9,
						reasoning: `Matched with expense in another account (${dayLabel})${typeLabel}`,
					})
				}

				if (inputIds.has(expense.id)) {
					const typeLabel =
						destinationAccountType !== 'CHECKING'
							? ` (vers compte ${destinationAccountType.toLowerCase()})`
							: ''
					results.push({
						transactionId: expense.id,
						categoryId: expenseCategoryId,
						source: 'TRANSFER',
						confidence: 0.9,
						reasoning: `Matched with income in another account (${dayLabel})${typeLabel}`,
					})
				}

				break // One match per income transaction
			}
		}
	}

	// Flag matched transactions as internal
	await flagInternalTransactions(results)

	return results
}

/**
 * Mark matched transactions as internal in the database
 */
async function flagInternalTransactions(
	results: CategorizationResult[],
): Promise<void> {
	const transferIds = results.map((r) => r.transactionId)
	if (transferIds.length === 0) return

	await prisma.transaction.updateMany({
		where: { id: { in: transferIds } },
		data: { isInternal: true },
	})
}
