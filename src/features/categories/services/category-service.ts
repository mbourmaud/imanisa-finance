/**
 * Category Service
 * API client for categories, rules, categorization, and recurring patterns
 */

import type {
	CategorizationStats,
	CategorizeTransactionInput,
	Category,
	CategoryRule,
	CreateCategoryInput,
	CreateCategoryRuleInput,
	RecurringPattern,
} from '../types';

export const categoryService = {
	// ---- Categories ----

	async getAll(): Promise<Category[]> {
		const response = await fetch('/api/categories');
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de charger les catégories');
		}
		return response.json();
	},

	async getById(id: string): Promise<Category> {
		const response = await fetch(`/api/categories/${id}`);
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Catégorie introuvable');
		}
		return response.json();
	},

	async create(input: CreateCategoryInput): Promise<Category> {
		const response = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de créer la catégorie');
		}
		return response.json();
	},

	async update(id: string, input: Partial<CreateCategoryInput>): Promise<Category> {
		const response = await fetch(`/api/categories/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de modifier la catégorie');
		}
		return response.json();
	},

	async delete(id: string): Promise<void> {
		const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de supprimer la catégorie');
		}
	},

	// ---- Rules ----

	async getRules(): Promise<CategoryRule[]> {
		const response = await fetch('/api/categories/rules');
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de charger les règles');
		}
		return response.json();
	},

	async createRule(input: CreateCategoryRuleInput): Promise<CategoryRule> {
		const response = await fetch('/api/categories/rules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de créer la règle');
		}
		return response.json();
	},

	// ---- Categorization ----

	async categorizeTransaction(
		transactionId: string,
		input: CategorizeTransactionInput,
	): Promise<{ success: boolean; ruleCreated: boolean }> {
		const response = await fetch(`/api/transactions/${transactionId}/categorize`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de catégoriser la transaction');
		}
		return response.json();
	},

	async runCategorization(
		accountId?: string,
	): Promise<{ success: boolean; stats: CategorizationStats }> {
		const response = await fetch('/api/categorization/run', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ accountId }),
		});
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Erreur lors de la catégorisation');
		}
		return response.json();
	},

	// ---- Recurring Patterns ----

	async getRecurringPatterns(): Promise<RecurringPattern[]> {
		const response = await fetch('/api/recurring-patterns');
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Impossible de charger les récurrences');
		}
		return response.json();
	},

	async detectRecurringPatterns(): Promise<{
		detected: number;
		created: number;
		updated: number;
	}> {
		const response = await fetch('/api/recurring-patterns/detect', {
			method: 'POST',
		});
		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			throw new Error(data.error || 'Erreur lors de la détection');
		}
		return response.json();
	},
};
