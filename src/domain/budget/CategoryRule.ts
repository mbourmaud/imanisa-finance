import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';

interface CategoryRuleProps {
	/** Category ID this rule assigns transactions to */
	categoryId: UniqueId;
	/** Regex pattern to match against transaction description */
	pattern: string;
	/** Priority for rule ordering (higher = more important, checked first) */
	priority: number;
	/** Optional source filter - only apply rule to transactions from specific data sources */
	source: string | null;
	/** Whether this rule is active */
	isActive: boolean;
	/** Creation date */
	createdAt: Date;
}

/**
 * CategoryRule entity for automatic transaction categorization.
 * Rules are matched against transaction descriptions using regex patterns.
 * Higher priority rules are checked first.
 */
export class CategoryRule extends Entity<CategoryRuleProps> {
	private constructor(props: CategoryRuleProps, id?: UniqueId) {
		super(props, id);
	}

	get categoryId(): UniqueId {
		return this.props.categoryId;
	}

	get pattern(): string {
		return this.props.pattern;
	}

	get priority(): number {
		return this.props.priority;
	}

	get source(): string | null {
		return this.props.source;
	}

	get isActive(): boolean {
		return this.props.isActive;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	/**
	 * Test if a transaction description matches this rule's pattern
	 */
	matches(description: string): boolean {
		try {
			const regex = new RegExp(this.props.pattern, 'i');
			return regex.test(description);
		} catch {
			// Invalid regex pattern - should not happen if validated on create
			return false;
		}
	}

	/**
	 * Update rule properties
	 */
	update(props: { pattern?: string; priority?: number; isActive?: boolean }): Result<void> {
		if (props.pattern !== undefined) {
			// Validate regex pattern
			try {
				new RegExp(props.pattern);
				this.props.pattern = props.pattern;
			} catch {
				return Result.fail('Invalid regex pattern');
			}
		}
		if (props.priority !== undefined) {
			this.props.priority = props.priority;
		}
		if (props.isActive !== undefined) {
			this.props.isActive = props.isActive;
		}
		return Result.ok(undefined);
	}

	/**
	 * Deactivate the rule
	 */
	deactivate(): void {
		this.props.isActive = false;
	}

	/**
	 * Activate the rule
	 */
	activate(): void {
		this.props.isActive = true;
	}

	/**
	 * Create a new category rule
	 */
	static create(
		props: {
			categoryId: UniqueId;
			pattern: string;
			priority?: number;
			source?: string | null;
		},
		id?: UniqueId,
	): Result<CategoryRule> {
		if (!props.pattern || props.pattern.trim().length === 0) {
			return Result.fail('CategoryRule pattern is required');
		}

		// Validate regex pattern
		try {
			new RegExp(props.pattern);
		} catch {
			return Result.fail('Invalid regex pattern');
		}

		return Result.ok(
			new CategoryRule(
				{
					categoryId: props.categoryId,
					pattern: props.pattern.trim(),
					priority: props.priority ?? 0,
					source: props.source ?? null,
					isActive: true,
					createdAt: new Date(),
				},
				id,
			),
		);
	}

	/**
	 * Reconstitute a category rule from persistence
	 */
	static reconstitute(
		props: {
			categoryId: UniqueId;
			pattern: string;
			priority: number;
			source: string | null;
			isActive: boolean;
			createdAt: Date;
		},
		id: UniqueId,
	): Result<CategoryRule> {
		return Result.ok(
			new CategoryRule(
				{
					categoryId: props.categoryId,
					pattern: props.pattern,
					priority: props.priority,
					source: props.source,
					isActive: props.isActive,
					createdAt: props.createdAt,
				},
				id,
			),
		);
	}
}
