import { eq, desc, isNull } from 'drizzle-orm';
import { getDb, schema } from '@infrastructure/database/drizzle';
import { execute } from '@infrastructure/database/turso';
import {
	Category,
	CategoryRule,
	type TransactionCategoryAssignment,
	CategorySource,
	type CategoryRepository
} from '@domain/budget';
import { UniqueId } from '@domain/shared/UniqueId';

type CategoryRow = typeof schema.categories.$inferSelect;
type CategoryRuleRow = typeof schema.categoryRules.$inferSelect;
type TransactionCategoryRow = typeof schema.transactionCategories.$inferSelect;

// =====================================================
// MAPPERS - Category
// =====================================================

function categoryToDomain(row: CategoryRow): Category {
	const result = Category.reconstitute(
		{
			name: row.name,
			parentId: row.parentId ? UniqueId.fromString(row.parentId) : null,
			icon: row.icon,
			color: row.color,
			createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
		},
		UniqueId.fromString(row.id)
	);

	if (result.isFailure) {
		throw new Error(`Failed to reconstitute Category: ${result.error}`);
	}

	return result.value;
}

function categoryToPersistence(category: Category): typeof schema.categories.$inferInsert {
	return {
		id: category.id.toString(),
		name: category.name,
		parentId: category.parentId?.toString() ?? null,
		icon: category.icon,
		color: category.color,
		createdAt: category.createdAt.toISOString()
	};
}

// =====================================================
// MAPPERS - CategoryRule
// =====================================================

function ruleToDomain(row: CategoryRuleRow): CategoryRule {
	const result = CategoryRule.reconstitute(
		{
			categoryId: UniqueId.fromString(row.categoryId),
			pattern: row.pattern,
			priority: row.priority,
			source: row.sourceFilter,
			isActive: row.isActive === 1,
			createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
		},
		UniqueId.fromString(row.id)
	);

	if (result.isFailure) {
		throw new Error(`Failed to reconstitute CategoryRule: ${result.error}`);
	}

	return result.value;
}

function ruleToPersistence(rule: CategoryRule): typeof schema.categoryRules.$inferInsert {
	return {
		id: rule.id.toString(),
		categoryId: rule.categoryId.toString(),
		pattern: rule.pattern,
		priority: rule.priority,
		sourceFilter: rule.source,
		isActive: rule.isActive ? 1 : 0,
		createdAt: rule.createdAt.toISOString()
	};
}

// =====================================================
// MAPPERS - TransactionCategoryAssignment
// =====================================================

function assignmentToDomain(row: TransactionCategoryRow): TransactionCategoryAssignment {
	return {
		transactionId: UniqueId.fromString(row.transactionId),
		categoryId: UniqueId.fromString(row.categoryId),
		source: row.source as CategorySource,
		confidence: row.confidence,
		assignedAt: row.assignedAt ? new Date(row.assignedAt) : new Date()
	};
}

function assignmentToPersistence(
	assignment: TransactionCategoryAssignment
): typeof schema.transactionCategories.$inferInsert {
	return {
		transactionId: assignment.transactionId.toString(),
		categoryId: assignment.categoryId.toString(),
		source: assignment.source,
		confidence: assignment.confidence,
		assignedAt: assignment.assignedAt.toISOString()
	};
}

// =====================================================
// REPOSITORY IMPLEMENTATION
// =====================================================

/**
 * Drizzle ORM implementation of CategoryRepository
 */
export class CategoryRepositoryImpl implements CategoryRepository {
	// ========== Category CRUD ==========

	async findAllCategories(): Promise<Category[]> {
		const db = getDb();
		const rows = await db.select().from(schema.categories).orderBy(schema.categories.name);
		return rows.map(categoryToDomain);
	}

	async findCategoryById(id: UniqueId): Promise<Category | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.categories)
			.where(eq(schema.categories.id, id.toString()))
			.limit(1);
		const row = rows[0];
		return row ? categoryToDomain(row) : null;
	}

	async findRootCategories(): Promise<Category[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.categories)
			.where(isNull(schema.categories.parentId))
			.orderBy(schema.categories.name);
		return rows.map(categoryToDomain);
	}

	async findChildCategories(parentId: UniqueId): Promise<Category[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.categories)
			.where(eq(schema.categories.parentId, parentId.toString()))
			.orderBy(schema.categories.name);
		return rows.map(categoryToDomain);
	}

	async saveCategory(category: Category): Promise<void> {
		const db = getDb();
		const data = categoryToPersistence(category);

		const existing = await this.findCategoryById(category.id);

		if (existing) {
			await db
				.update(schema.categories)
				.set({
					name: data.name,
					parentId: data.parentId,
					icon: data.icon,
					color: data.color
				})
				.where(eq(schema.categories.id, data.id));
		} else {
			await db.insert(schema.categories).values(data);
		}
	}

	async deleteCategory(id: UniqueId): Promise<void> {
		const db = getDb();
		await db.delete(schema.categories).where(eq(schema.categories.id, id.toString()));
	}

	// ========== CategoryRule CRUD ==========

	async findAllRules(): Promise<CategoryRule[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.categoryRules)
			.orderBy(desc(schema.categoryRules.priority));
		return rows.map(ruleToDomain);
	}

	async findActiveRulesByPriority(): Promise<CategoryRule[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.categoryRules)
			.where(eq(schema.categoryRules.isActive, 1))
			.orderBy(desc(schema.categoryRules.priority));
		return rows.map(ruleToDomain);
	}

	async findRuleById(id: UniqueId): Promise<CategoryRule | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.categoryRules)
			.where(eq(schema.categoryRules.id, id.toString()))
			.limit(1);
		const row = rows[0];
		return row ? ruleToDomain(row) : null;
	}

	async findRulesByCategoryId(categoryId: UniqueId): Promise<CategoryRule[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.categoryRules)
			.where(eq(schema.categoryRules.categoryId, categoryId.toString()))
			.orderBy(desc(schema.categoryRules.priority));
		return rows.map(ruleToDomain);
	}

	async saveRule(rule: CategoryRule): Promise<void> {
		const db = getDb();
		const data = ruleToPersistence(rule);

		const existing = await this.findRuleById(rule.id);

		if (existing) {
			await db
				.update(schema.categoryRules)
				.set({
					categoryId: data.categoryId,
					pattern: data.pattern,
					priority: data.priority,
					sourceFilter: data.sourceFilter,
					isActive: data.isActive
				})
				.where(eq(schema.categoryRules.id, data.id));
		} else {
			await db.insert(schema.categoryRules).values(data);
		}
	}

	async deleteRule(id: UniqueId): Promise<void> {
		const db = getDb();
		await db.delete(schema.categoryRules).where(eq(schema.categoryRules.id, id.toString()));
	}

	// ========== TransactionCategoryAssignment CRUD ==========

	async findAssignmentByTransactionId(
		transactionId: UniqueId
	): Promise<TransactionCategoryAssignment | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.transactionCategories)
			.where(eq(schema.transactionCategories.transactionId, transactionId.toString()))
			.limit(1);
		const row = rows[0];
		return row ? assignmentToDomain(row) : null;
	}

	async findAssignmentsByCategoryId(
		categoryId: UniqueId
	): Promise<TransactionCategoryAssignment[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.transactionCategories)
			.where(eq(schema.transactionCategories.categoryId, categoryId.toString()));
		return rows.map(assignmentToDomain);
	}

	async saveAssignment(assignment: TransactionCategoryAssignment): Promise<void> {
		const db = getDb();
		const data = assignmentToPersistence(assignment);

		const existing = await this.findAssignmentByTransactionId(assignment.transactionId);

		if (existing) {
			await db
				.update(schema.transactionCategories)
				.set({
					categoryId: data.categoryId,
					source: data.source,
					confidence: data.confidence,
					assignedAt: data.assignedAt
				})
				.where(eq(schema.transactionCategories.transactionId, data.transactionId));
		} else {
			await db.insert(schema.transactionCategories).values(data);
		}
	}

	async deleteAssignment(transactionId: UniqueId): Promise<void> {
		const db = getDb();
		await db
			.delete(schema.transactionCategories)
			.where(eq(schema.transactionCategories.transactionId, transactionId.toString()));
	}

	async findUnassignedTransactionIds(): Promise<UniqueId[]> {
		// Find transactions that don't have an assignment
		const result = await execute(
			`SELECT t.id
			FROM transactions t
			LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
			WHERE tc.transaction_id IS NULL
			ORDER BY t.date DESC`
		);

		return result.rows.map((row) => UniqueId.fromString(row.id as string));
	}

	async countTransactionsByCategory(
		startDate: Date,
		endDate: Date
	): Promise<Map<string, { count: number; totalAmount: number }>> {
		const startDateStr = startDate.toISOString().split('T')[0];
		const endDateStr = endDate.toISOString().split('T')[0];

		const result = await execute(
			`SELECT
				tc.category_id,
				COUNT(*) as count,
				SUM(t.amount) as total_amount
			FROM transaction_categories tc
			INNER JOIN transactions t ON tc.transaction_id = t.id
			WHERE t.date >= ? AND t.date <= ?
			GROUP BY tc.category_id`,
			[startDateStr, endDateStr]
		);

		const map = new Map<string, { count: number; totalAmount: number }>();
		for (const row of result.rows) {
			map.set(row.category_id as string, {
				count: row.count as number,
				totalAmount: row.total_amount as number
			});
		}

		return map;
	}
}
