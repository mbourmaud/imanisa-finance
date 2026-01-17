/**
 * Transaction domain types
 */

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
	id: string;
	accountId: string;
	accountName: string;
	type: TransactionType;
	amount: number;
	currency: string;
	description: string;
	category: string | null;
	categoryId: string | null;
	date: Date;
	isReconciled: boolean;
	isInternal: boolean;
	linkedTransactionId: string | null;
	metadata: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

export interface TransactionSummary {
	totalIncome: number;
	totalExpenses: number;
	netFlow: number;
	transactionCount: number;
	byCategory: CategorySummary[];
}

export interface CategorySummary {
	categoryId: string;
	categoryName: string;
	amount: number;
	count: number;
	percentage: number;
}

export interface CreateTransactionInput {
	accountId: string;
	type: TransactionType;
	amount: number;
	description: string;
	categoryId?: string;
	date: Date;
}

export interface UpdateTransactionInput {
	type?: TransactionType;
	amount?: number;
	description?: string;
	categoryId?: string | null;
	date?: Date;
	isReconciled?: boolean;
}

export interface TransactionFilters {
	accountId?: string;
	type?: TransactionType;
	categoryId?: string;
	startDate?: Date;
	endDate?: Date;
	minAmount?: number;
	maxAmount?: number;
	search?: string;
	isReconciled?: boolean;
	excludeInternal?: boolean;
}

export interface TransactionPagination {
	page: number;
	pageSize: number;
}
