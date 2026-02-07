/**
 * Category feature types
 */

export interface Category {
	id: string;
	name: string;
	icon: string;
	color: string;
	parentId: string | null;
	_count?: {
		transactionCategories: number;
		rules: number;
	};
}

export interface CategoryRule {
	id: string;
	pattern: string;
	matchType: 'EXACT' | 'CONTAINS' | 'STARTS_WITH' | 'REGEX';
	priority: number;
	sourceFilter: string | null;
	isActive: boolean;
	categoryId: string;
	category: {
		id: string;
		name: string;
		icon: string;
		color: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface RecurringPattern {
	id: string;
	description: string;
	normalizedDescription: string;
	amount: number;
	frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
	tolerancePercent: number;
	occurrenceCount: number;
	isActive: boolean;
	lastSeenAt: string | null;
	account: { id: string; name: string } | null;
	category: { id: string; name: string; icon: string; color: string } | null;
	createdAt: string;
	updatedAt: string;
}

export interface CategorizationStats {
	total: number;
	ruleMatches: number;
	bankMatches: number;
	aiMatches: number;
	transferMatches: number;
	unmatched: number;
	duration: number;
	estimatedCost: number;
}

export interface CreateCategoryInput {
	name: string;
	icon?: string;
	color?: string;
	parentId?: string;
}

export interface CreateCategoryRuleInput {
	pattern: string;
	categoryId: string;
	matchType?: 'EXACT' | 'CONTAINS' | 'STARTS_WITH' | 'REGEX';
	priority?: number;
}

export interface CategorizeTransactionInput {
	categoryId: string;
	createRule?: boolean;
}
