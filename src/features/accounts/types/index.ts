/**
 * Account domain types
 */

export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';

export interface Account {
	id: string;
	name: string;
	type: AccountType;
	bankId: string;
	bankName: string;
	balance: number;
	currency: string;
	ownerId: string;
	ownerShare: number;
	isActive: boolean;
	lastSyncAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface AccountSummary {
	totalBalance: number;
	byType: Record<AccountType, number>;
	accountCount: number;
}

export interface CreateAccountInput {
	name: string;
	type: AccountType;
	bankId: string;
	initialBalance?: number;
	currency?: string;
}

export interface UpdateAccountInput {
	name?: string;
	type?: AccountType;
	isActive?: boolean;
	description?: string;
	accountNumber?: string;
	exportUrl?: string;
	initialBalance?: number;
	initialBalanceDate?: string;
}

export interface AccountFilters {
	type?: AccountType;
	bankId?: string;
	isActive?: boolean;
	search?: string;
}
