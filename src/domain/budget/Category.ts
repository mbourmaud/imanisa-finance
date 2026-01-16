import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';

interface CategoryProps {
	/** Category name (e.g., "Alimentation", "Restaurant") */
	name: string;
	/** Parent category ID for hierarchical structure (null for root categories) */
	parentId: UniqueId | null;
	/** Icon identifier for UI display */
	icon: string;
	/** Color hex code for UI display */
	color: string;
	/** Creation date */
	createdAt: Date;
}

/**
 * Category entity for transaction categorization.
 * Supports hierarchical structure with parent/child relationships.
 * Root categories (parentId = null) are top-level categories.
 */
export class Category extends Entity<CategoryProps> {
	private constructor(props: CategoryProps, id?: UniqueId) {
		super(props, id);
	}

	get name(): string {
		return this.props.name;
	}

	get parentId(): UniqueId | null {
		return this.props.parentId;
	}

	get icon(): string {
		return this.props.icon;
	}

	get color(): string {
		return this.props.color;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	/**
	 * Check if this is a root category (no parent)
	 */
	get isRoot(): boolean {
		return this.props.parentId === null;
	}

	/**
	 * Update category properties
	 */
	update(props: { name?: string; icon?: string; color?: string }): void {
		if (props.name !== undefined) {
			this.props.name = props.name.trim();
		}
		if (props.icon !== undefined) {
			this.props.icon = props.icon;
		}
		if (props.color !== undefined) {
			this.props.color = props.color;
		}
	}

	/**
	 * Create a new category
	 */
	static create(
		props: {
			name: string;
			parentId?: UniqueId | null;
			icon: string;
			color: string;
		},
		id?: UniqueId,
	): Result<Category> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Category name is required');
		}

		if (!props.icon || props.icon.trim().length === 0) {
			return Result.fail('Category icon is required');
		}

		if (!props.color || !props.color.match(/^#[0-9A-Fa-f]{6}$/)) {
			return Result.fail('Category color must be a valid hex color (e.g., #FF5733)');
		}

		return Result.ok(
			new Category(
				{
					name: props.name.trim(),
					parentId: props.parentId ?? null,
					icon: props.icon.trim(),
					color: props.color,
					createdAt: new Date(),
				},
				id,
			),
		);
	}

	/**
	 * Reconstitute a category from persistence
	 */
	static reconstitute(
		props: {
			name: string;
			parentId: UniqueId | null;
			icon: string;
			color: string;
			createdAt: Date;
		},
		id: UniqueId,
	): Result<Category> {
		return Result.ok(
			new Category(
				{
					name: props.name,
					parentId: props.parentId,
					icon: props.icon,
					color: props.color,
					createdAt: props.createdAt,
				},
				id,
			),
		);
	}
}
