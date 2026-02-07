/**
 * Categorization Service Types
 * Shared types for the categorization pipeline
 */

export type CategorizationSource = 'RULE' | 'BANK' | 'AI' | 'TRANSFER';

export interface CategorizationResult {
	transactionId: string;
	categoryId: string;
	source: CategorizationSource;
	confidence: number;
	reasoning?: string;
}

export interface PipelineStats {
	total: number;
	ruleMatches: number;
	bankMatches: number;
	aiMatches: number;
	transferMatches: number;
	unmatched: number;
	duration: number;
	estimatedCost: number;
}

export interface TransactionForCategorization {
	id: string;
	description: string;
	amount: number;
	type: string;
	date: Date;
	bankCategory: string | null;
	accountId: string;
	isInternal: boolean;
}
