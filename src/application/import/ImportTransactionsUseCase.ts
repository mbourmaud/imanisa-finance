import type { DataSourceRepository } from '@domain/import/DataSourceRepository';
import type { ParsedTransaction } from '@domain/import/ParsedTransaction';
import type { TransactionRepository } from '@domain/transaction/TransactionRepository';
import type { CategoryRepository } from '@domain/budget/CategoryRepository';
import { Transaction } from '@domain/transaction/Transaction';
import { TransactionType } from '@domain/transaction/TransactionType';
import { UniqueId } from '@domain/shared/UniqueId';
import { ParserFactory } from './ParserFactory';
import {
	AutoCategorizationService,
	type TransactionForCategorization
} from '@application/budget/AutoCategorizationService';
import { CategorySource } from '@domain/budget/TransactionCategoryAssignment';

/**
 * Categorization statistics for import result
 */
export interface CategorizationStats {
	/** Number of transactions categorized by bank category */
	byBank: number;
	/** Number of transactions categorized by auto rules */
	byRule: number;
	/** Number of transactions that could not be categorized */
	uncategorized: number;
}

/**
 * Result of an import operation
 */
export interface ImportResult {
	/** Number of transactions successfully imported */
	imported: number;
	/** Number of transactions skipped (duplicates) */
	skipped: number;
	/** Error messages encountered during import */
	errors: string[];
	/** Categorization statistics (if categorization was performed) */
	categorization?: CategorizationStats;
}

/**
 * Use case for importing transactions from a CSV file into the system.
 *
 * Responsibilities:
 * - Parse CSV content using the appropriate parser (based on DataSource.parserKey)
 * - Deduplicate transactions (skip if same date+amount+description already exists)
 * - Transform ParsedTransaction DTOs into domain Transaction entities
 * - Persist new transactions to the database
 * - Update DataSource.lastSyncAt timestamp
 */
export class ImportTransactionsUseCase {
	private categorizationService: AutoCategorizationService | null = null;

	constructor(
		private readonly dataSourceRepository: DataSourceRepository,
		private readonly transactionRepository: TransactionRepository,
		private readonly categoryRepository?: CategoryRepository
	) {
		// Initialize categorization service if category repository is provided
		if (categoryRepository) {
			this.categorizationService = new AutoCategorizationService(
				categoryRepository,
				transactionRepository
			);
		}
	}

	/**
	 * Import transactions from CSV content for a given data source
	 *
	 * @param dataSourceId The ID of the data source to import into
	 * @param csvContent The raw CSV file content
	 * @returns ImportResult with counts and errors
	 */
	async execute(dataSourceId: UniqueId, csvContent: string): Promise<ImportResult> {
		const errors: string[] = [];

		// 1. Get the data source
		const dataSource = await this.dataSourceRepository.findById(dataSourceId);
		if (!dataSource) {
			return { imported: 0, skipped: 0, errors: ['Data source not found'] };
		}

		// 2. Check that we have a linked account
		if (!dataSource.linkedAccountId) {
			return {
				imported: 0,
				skipped: 0,
				errors: ['Data source has no linked account. Please configure the linked account first.']
			};
		}

		// 3. Parse CSV using appropriate parser
		const parser = ParserFactory.createParser(dataSource.parserKey);
		let parsedTransactions: ParsedTransaction[];

		try {
			parsedTransactions = parser.parse(csvContent);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown parsing error';
			return { imported: 0, skipped: 0, errors: [`Failed to parse CSV: ${message}`] };
		}

		if (parsedTransactions.length === 0) {
			return { imported: 0, skipped: 0, errors: ['No transactions found in CSV file'] };
		}

		// 4. Get existing transactions for deduplication
		const existingTransactions = await this.transactionRepository.findByAccountId(
			dataSource.linkedAccountId
		);
		const existingSignatures = this.buildSignatureSet(existingTransactions);

		// 5. Filter duplicates and transform to domain entities
		// Store parsed data alongside transaction for categorization
		const newTransactions: Array<{ transaction: Transaction; parsed: ParsedTransaction }> = [];
		let skippedCount = 0;

		for (const parsed of parsedTransactions) {
			const signature = this.buildTransactionSignature(
				parsed.date,
				parsed.amount,
				parsed.description
			);

			if (existingSignatures.has(signature)) {
				skippedCount++;
				continue;
			}

			// Transform ParsedTransaction to domain Transaction
			const transactionResult = this.createTransaction(parsed, dataSource.linkedAccountId);

			if (transactionResult.isSuccess) {
				newTransactions.push({ transaction: transactionResult.value, parsed });
				// Add to existing signatures to avoid duplicates within the same import
				existingSignatures.add(signature);
			} else {
				errors.push(`Failed to create transaction: ${transactionResult.error}`);
			}
		}

		// 6. Save new transactions
		const transactionsToSave = newTransactions.map((t) => t.transaction);
		if (transactionsToSave.length > 0) {
			try {
				await this.transactionRepository.saveMany(transactionsToSave);
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown database error';
				return {
					imported: 0,
					skipped: skippedCount,
					errors: [...errors, `Failed to save transactions: ${message}`]
				};
			}
		}

		// 7. Auto-categorize imported transactions
		let categorizationStats: CategorizationStats | undefined;
		if (this.categorizationService && newTransactions.length > 0) {
			categorizationStats = await this.categorizeTransactions(
				newTransactions,
				dataSource.parserKey
			);
			// Log categorization results
			const totalCategorized = categorizationStats.byBank + categorizationStats.byRule;
			if (totalCategorized > 0 || categorizationStats.uncategorized > 0) {
				const summary = [
					`Categorization: ${totalCategorized} categorized`,
					`(${categorizationStats.byBank} by bank, ${categorizationStats.byRule} by rule)`,
					`${categorizationStats.uncategorized} uncategorized`
				].join(' ');
				errors.push(`Info: ${summary}`);
			}
		}

		// 8. Update last sync timestamp on data source
		dataSource.markSynced();
		try {
			await this.dataSourceRepository.save(dataSource);
		} catch (error) {
			// Non-fatal: log but don't fail the import
			const message = error instanceof Error ? error.message : 'Unknown error';
			errors.push(`Warning: Failed to update sync timestamp: ${message}`);
		}

		return {
			imported: newTransactions.length,
			skipped: skippedCount,
			errors,
			categorization: categorizationStats
		};
	}

	/**
	 * Categorize newly imported transactions using the AutoCategorizationService.
	 * Passes rawCategory (if available) and parserKey for bank category mapping.
	 *
	 * @param transactions List of transactions with their parsed data
	 * @param parserKey The parser key (bank identifier) for category mapping
	 * @returns Categorization statistics
	 */
	private async categorizeTransactions(
		transactions: Array<{ transaction: Transaction; parsed: ParsedTransaction }>,
		parserKey: import('@domain/import/CSVParser').ParserKey
	): Promise<CategorizationStats> {
		const stats: CategorizationStats = {
			byBank: 0,
			byRule: 0,
			uncategorized: 0
		};

		if (!this.categorizationService) {
			stats.uncategorized = transactions.length;
			return stats;
		}

		for (const { transaction, parsed } of transactions) {
			const txForCategorization: TransactionForCategorization = {
				id: transaction.id,
				description: transaction.description,
				rawCategory: parsed.rawCategory,
				parserKey
			};

			try {
				const assignment = await this.categorizationService.categorizeAndSave(txForCategorization);
				if (assignment) {
					if (assignment.source === CategorySource.BANK) {
						stats.byBank++;
					} else if (assignment.source === CategorySource.AUTO) {
						stats.byRule++;
					}
				} else {
					stats.uncategorized++;
				}
			} catch (error) {
				// Non-fatal: log error but continue with next transaction
				stats.uncategorized++;
			}
		}

		return stats;
	}

	/**
	 * Build a signature for a transaction to use for deduplication
	 * Format: "YYYY-MM-DD|amount|description"
	 */
	private buildTransactionSignature(date: Date, amount: number, description: string): string {
		const dateStr = date.toISOString().split('T')[0];
		// Round amount to 2 decimal places to avoid floating point comparison issues
		const roundedAmount = Math.round(amount * 100) / 100;
		// Normalize description: trim and lowercase for comparison
		const normalizedDesc = description.trim().toLowerCase();
		return `${dateStr}|${roundedAmount}|${normalizedDesc}`;
	}

	/**
	 * Build a set of signatures from existing transactions for fast lookup
	 */
	private buildSignatureSet(transactions: Transaction[]): Set<string> {
		const signatures = new Set<string>();
		for (const tx of transactions) {
			// Get the signed amount based on transaction type
			const signedAmount =
				tx.type === TransactionType.EXPENSE ? -tx.amount.amount : tx.amount.amount;
			const signature = this.buildTransactionSignature(tx.date, signedAmount, tx.description);
			signatures.add(signature);
		}
		return signatures;
	}

	/**
	 * Create a domain Transaction from a ParsedTransaction
	 */
	private createTransaction(
		parsed: ParsedTransaction,
		accountId: UniqueId
	): { isSuccess: true; value: Transaction } | { isSuccess: false; error: string } {
		// Determine transaction type based on amount sign
		const type = parsed.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

		const result = Transaction.create({
			accountId,
			type,
			amount: parsed.amount, // Transaction.create takes absolute value
			description: parsed.description,
			date: parsed.date,
			category: null // Category mapping will be done in a future US
		});

		if (result.isSuccess) {
			return { isSuccess: true, value: result.value };
		} else {
			return { isSuccess: false, error: result.error };
		}
	}
}
