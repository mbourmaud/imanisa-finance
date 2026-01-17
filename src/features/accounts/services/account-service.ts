/**
 * Account API service layer
 * Handles all HTTP requests for accounts
 */

import type {
	Account,
	AccountFilters,
	AccountSummary,
	CreateAccountInput,
	UpdateAccountInput,
} from '../types';

const API_BASE = '/api/accounts';

export const accountService = {
	/**
	 * Fetch all accounts with optional filters
	 */
	async getAll(filters?: AccountFilters): Promise<Account[]> {
		const params = new URLSearchParams();
		if (filters?.type) params.set('type', filters.type);
		if (filters?.bankId) params.set('bankId', filters.bankId);
		if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
		if (filters?.search) params.set('search', filters.search);

		const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Failed to fetch accounts');
		}

		return response.json();
	},

	/**
	 * Fetch a single account by ID
	 */
	async getById(id: string): Promise<Account> {
		const response = await fetch(`${API_BASE}/${id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch account');
		}

		return response.json();
	},

	/**
	 * Create a new account
	 */
	async create(input: CreateAccountInput): Promise<Account> {
		const response = await fetch(API_BASE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			throw new Error('Failed to create account');
		}

		return response.json();
	},

	/**
	 * Update an existing account
	 */
	async update(id: string, input: UpdateAccountInput): Promise<Account> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			throw new Error('Failed to update account');
		}

		return response.json();
	},

	/**
	 * Delete an account
	 */
	async delete(id: string): Promise<void> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Failed to delete account');
		}
	},

	/**
	 * Get account summary (totals by type)
	 */
	async getSummary(): Promise<AccountSummary> {
		const response = await fetch(`${API_BASE}/summary`);

		if (!response.ok) {
			throw new Error('Failed to fetch account summary');
		}

		return response.json();
	},

	/**
	 * Sync account balance with bank
	 */
	async syncBalance(id: string): Promise<Account> {
		const response = await fetch(`${API_BASE}/${id}/sync`, {
			method: 'POST',
		});

		if (!response.ok) {
			throw new Error('Failed to sync account');
		}

		return response.json();
	},
};
