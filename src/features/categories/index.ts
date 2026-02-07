export {
	categoryKeys,
	useCategoriesQuery,
	useCategorizeTransactionMutation,
	useCategoryRulesQuery,
	useCreateCategoryMutation,
	useCreateCategoryRuleMutation,
	useDetectRecurringMutation,
	useRecurringPatternsQuery,
	useRunCategorizationMutation,
} from './hooks/use-categories-query';

export { categoryService } from './services/category-service';

export type {
	CategorizationStats,
	CategorizeTransactionInput,
	Category,
	CategoryRule,
	CreateCategoryInput,
	CreateCategoryRuleInput,
	RecurringPattern,
} from './types';
