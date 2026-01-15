import type { Category } from './Category';
import type { CategoryRule } from './CategoryRule';
import type { TransactionCategoryAssignment } from './TransactionCategoryAssignment';
import type { UniqueId } from '@domain/shared/UniqueId';

/**
 * Repository interface for Category and related entities persistence.
 * Implemented in infrastructure layer.
 */
export interface CategoryRepository {
	// ========== Category CRUD ==========

	/**
	 * Find all categories
	 */
	findAllCategories(): Promise<Category[]>;

	/**
	 * Find a category by ID
	 */
	findCategoryById(id: UniqueId): Promise<Category | null>;

	/**
	 * Find root categories (those without parent)
	 */
	findRootCategories(): Promise<Category[]>;

	/**
	 * Find child categories of a parent
	 */
	findChildCategories(parentId: UniqueId): Promise<Category[]>;

	/**
	 * Save (create or update) a category
	 */
	saveCategory(category: Category): Promise<void>;

	/**
	 * Delete a category by ID
	 */
	deleteCategory(id: UniqueId): Promise<void>;

	// ========== CategoryRule CRUD ==========

	/**
	 * Find all category rules
	 */
	findAllRules(): Promise<CategoryRule[]>;

	/**
	 * Find active rules ordered by priority (highest first)
	 */
	findActiveRulesByPriority(): Promise<CategoryRule[]>;

	/**
	 * Find a rule by ID
	 */
	findRuleById(id: UniqueId): Promise<CategoryRule | null>;

	/**
	 * Find rules for a specific category
	 */
	findRulesByCategoryId(categoryId: UniqueId): Promise<CategoryRule[]>;

	/**
	 * Save (create or update) a rule
	 */
	saveRule(rule: CategoryRule): Promise<void>;

	/**
	 * Delete a rule by ID
	 */
	deleteRule(id: UniqueId): Promise<void>;

	// ========== TransactionCategoryAssignment CRUD ==========

	/**
	 * Find assignment for a transaction
	 */
	findAssignmentByTransactionId(
		transactionId: UniqueId
	): Promise<TransactionCategoryAssignment | null>;

	/**
	 * Find all assignments for a category (useful for stats)
	 */
	findAssignmentsByCategoryId(categoryId: UniqueId): Promise<TransactionCategoryAssignment[]>;

	/**
	 * Save (create or update) an assignment
	 */
	saveAssignment(assignment: TransactionCategoryAssignment): Promise<void>;

	/**
	 * Delete an assignment
	 */
	deleteAssignment(transactionId: UniqueId): Promise<void>;

	/**
	 * Find transactions without category assignment
	 */
	findUnassignedTransactionIds(): Promise<UniqueId[]>;

	/**
	 * Count transactions per category for a date range
	 */
	countTransactionsByCategory(
		startDate: Date,
		endDate: Date
	): Promise<Map<string, { count: number; totalAmount: number }>>;
}
