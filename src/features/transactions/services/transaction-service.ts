/**
 * Transaction API service layer
 */

import type { PaginatedResponse } from '@/shared/types';
import type {
	CreateTransactionInput,
	Transaction,
	TransactionFilters,
	TransactionPagination,
	TransactionSummary,
	UpdateTransactionInput,
} from '../types';

const API_BASE = '/api/transactions';

export const transactionService = {
	/**
	 * Fetch transactions with pagination and filters
	 */
	async getAll(
		filters?: TransactionFilters,
		pagination?: TransactionPagination,
	): Promise<PaginatedResponse<Transaction>> {
		const params = new URLSearchParams();

		if (filters?.accountId) params.set('accountId', filters.accountId);
		if (filters?.memberId) params.set('memberId', filters.memberId);
		if (filters?.type) params.set('type', filters.type);
		if (filters?.categoryId) params.set('categoryId', filters.categoryId);
		if (filters?.startDate) params.set('startDate', filters.startDate.toISOString());
		if (filters?.endDate) params.set('endDate', filters.endDate.toISOString());
		if (filters?.minAmount !== undefined) params.set('minAmount', String(filters.minAmount));
		if (filters?.maxAmount !== undefined) params.set('maxAmount', String(filters.maxAmount));
		if (filters?.search) params.set('search', filters.search);
		if (filters?.isReconciled !== undefined)
			params.set('isReconciled', String(filters.isReconciled));
		if (filters?.excludeInternal) params.set('excludeInternal', 'true');

		if (pagination?.page) params.set('page', String(pagination.page));
		if (pagination?.pageSize) params.set('pageSize', String(pagination.pageSize));

		const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Failed to fetch transactions');
		}

		return response.json();
	},

	/**
	 * Fetch a single transaction by ID
	 */
	async getById(id: string): Promise<Transaction> {
		const response = await fetch(`${API_BASE}/${id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch transaction');
		}

		return response.json();
	},

	/**
	 * Create a new transaction
	 */
	async create(input: CreateTransactionInput): Promise<Transaction> {
		const response = await fetch(API_BASE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			throw new Error('Failed to create transaction');
		}

		return response.json();
	},

	/**
	 * Update an existing transaction
	 */
	async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			throw new Error('Failed to update transaction');
		}

		return response.json();
	},

	/**
	 * Delete a transaction
	 */
	async delete(id: string): Promise<void> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Failed to delete transaction');
		}
	},

	/**
	 * Get transaction summary with filters
	 */
	async getSummary(filters?: TransactionFilters): Promise<TransactionSummary> {
		const params = new URLSearchParams();
		if (filters?.startDate) params.set('startDate', filters.startDate.toISOString());
		if (filters?.endDate) params.set('endDate', filters.endDate.toISOString());
		if (filters?.accountId) params.set('accountId', filters.accountId);
		if (filters?.memberId) params.set('memberId', filters.memberId);
		if (filters?.type) params.set('type', filters.type);
		if (filters?.categoryId) params.set('categoryId', filters.categoryId);
		if (filters?.search) params.set('search', filters.search);
		if (filters?.excludeInternal) params.set('excludeInternal', 'true');

		const url = params.toString() ? `${API_BASE}/summary?${params}` : `${API_BASE}/summary`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Failed to fetch transaction summary');
		}

		return response.json();
	},

	/**
	 * Build export URL for CSV download with current filters
	 */
	getExportUrl(filters?: TransactionFilters): string {
		const params = new URLSearchParams()
		if (filters?.accountId) params.set('accountId', filters.accountId)
		if (filters?.memberId) params.set('memberId', filters.memberId)
		if (filters?.type) params.set('type', filters.type)
		if (filters?.categoryId) params.set('categoryId', filters.categoryId)
		if (filters?.startDate) params.set('startDate', filters.startDate.toISOString())
		if (filters?.endDate) params.set('endDate', filters.endDate.toISOString())
		if (filters?.search) params.set('search', filters.search)
		if (filters?.excludeInternal) params.set('excludeInternal', 'true')

		const query = params.toString()
		return query ? `${API_BASE}/export?${query}` : `${API_BASE}/export`
	},

	/**
	 * Bulk categorize transactions
	 */
	async bulkCategorize(transactionIds: string[], categoryId: string): Promise<void> {
		const response = await fetch(`${API_BASE}/bulk-categorize`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ transactionIds, categoryId }),
		});

		if (!response.ok) {
			throw new Error('Failed to categorize transactions');
		}
	},

	/**
	 * Bulk delete transactions
	 */
	async bulkDelete(transactionIds: string[]): Promise<void> {
		const response = await fetch(`${API_BASE}/bulk-delete`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ transactionIds }),
		});

		if (!response.ok) {
			throw new Error('Impossible de supprimer les transactions');
		}
	},

	/**
	 * Mark transactions as reconciled
	 */
	async reconcile(transactionIds: string[]): Promise<void> {
		const response = await fetch(`${API_BASE}/reconcile`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ transactionIds }),
		});

		if (!response.ok) {
			throw new Error('Failed to reconcile transactions');
		}
	},
};
