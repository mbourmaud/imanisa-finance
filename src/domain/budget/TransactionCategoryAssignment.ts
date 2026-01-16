import type { UniqueId } from '@domain/shared/UniqueId';

/**
 * Source of the category assignment
 */
export enum CategorySource {
	/** Category provided by bank (CE, Boursorama) */
	BANK = 'bank',
	/** Category assigned automatically by regex rule */
	AUTO = 'auto',
	/** Category assigned manually by user */
	MANUAL = 'manual',
}

export const CategorySourceLabels: Record<CategorySource, string> = {
	[CategorySource.BANK]: 'Banque',
	[CategorySource.AUTO]: 'Automatique',
	[CategorySource.MANUAL]: 'Manuel',
};

/**
 * Represents the assignment of a category to a transaction.
 * This is a value object (no identity) linking transaction to category.
 */
export interface TransactionCategoryAssignment {
	/** Transaction ID */
	transactionId: UniqueId;
	/** Assigned category ID */
	categoryId: UniqueId;
	/** Source of the assignment */
	source: CategorySource;
	/** Confidence score (0-1): 1.0 for bank/manual, 0.8 for regex exact match, 0.5 for partial */
	confidence: number;
	/** Date when the assignment was made */
	assignedAt: Date;
}

/**
 * Create a new transaction category assignment
 */
export function createTransactionCategoryAssignment(props: {
	transactionId: UniqueId;
	categoryId: UniqueId;
	source: CategorySource;
	confidence?: number;
}): TransactionCategoryAssignment {
	return {
		transactionId: props.transactionId,
		categoryId: props.categoryId,
		source: props.source,
		confidence: props.confidence ?? getDefaultConfidence(props.source),
		assignedAt: new Date(),
	};
}

/**
 * Get default confidence based on source
 */
function getDefaultConfidence(source: CategorySource): number {
	switch (source) {
		case CategorySource.BANK:
		case CategorySource.MANUAL:
			return 1.0;
		case CategorySource.AUTO:
			return 0.8;
		default:
			return 0.5;
	}
}

/**
 * Check if an assignment can be overwritten by another source
 * Manual assignments should never be overwritten automatically
 */
export function canOverwrite(
	existing: TransactionCategoryAssignment,
	newSource: CategorySource,
): boolean {
	// Manual assignments are protected
	if (existing.source === CategorySource.MANUAL) {
		return false;
	}

	// Bank assignments can be overwritten by manual only
	if (existing.source === CategorySource.BANK) {
		return newSource === CategorySource.MANUAL;
	}

	// Auto assignments can be overwritten by manual or bank
	if (existing.source === CategorySource.AUTO) {
		return newSource === CategorySource.MANUAL || newSource === CategorySource.BANK;
	}

	return true;
}
