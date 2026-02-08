/**
 * Transaction domain types
 */

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionCategoryInfo {
	transactionId: string;
	categoryId: string;
	source: string;
	confidence: number;
	category: {
		id: string;
		name: string;
		icon: string;
		color: string;
	};
}

export interface Transaction {
	id: string;
	accountId: string;
	type: TransactionType;
	amount: number;
	currency: string;
	description: string;
	date: Date;
	bankCategory: string | null;
	isInternal: boolean;
	importedAt: string | null;
	transactionCategory: TransactionCategoryInfo | null;
	account: {
		id: string;
		name: string;
		type: string;
		bank: {
			id: string;
			name: string;
			color: string;
			logo: string | null;
		};
		accountMembers: {
			ownerShare: number;
			member: {
				id: string;
				name: string;
				color: string | null;
				avatarUrl: string | null;
			};
		}[];
	};
}

export interface InternalTransfersSummary {
	toSavings: number
	toInvestment: number
	toLoanRepayment: number
	toOther: number
	total: number
}

export interface TransactionSummary {
	totalIncome: number
	totalExpenses: number
	netFlow: number
	transactionCount: number
	byCategory: CategorySummary[]
	internalTransfers: InternalTransfersSummary
	savingsRate: number
}

export interface RecurringPattern {
	id: string
	description: string
	amount: number
	frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
	occurrenceCount: number
	lastSeenAt: string | null
	isActive: boolean
	account: { id: string; name: string } | null
	category: { id: string; name: string; icon: string; color: string } | null
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
	memberId?: string;
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
