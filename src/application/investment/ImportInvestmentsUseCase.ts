import type { InvestmentSource } from '@domain/investment/InvestmentSource';
import { InvestmentSourceType } from '@domain/investment/InvestmentSourceType';
import { InvestmentPosition } from '@domain/investment/InvestmentPosition';
import { InvestmentTransaction } from '@domain/investment/InvestmentTransaction';
import type { ParsedPosition } from '@domain/investment/ParsedPosition';
import type { ParsedInvestmentTransaction } from '@domain/investment/ParsedInvestmentTransaction';
import { UniqueId } from '@domain/shared/UniqueId';
import { InvestmentParserFactory } from './InvestmentParserFactory';
import { CalculateCryptoPositionsUseCase } from './CalculateCryptoPositionsUseCase';
import type { InvestmentRepositoryImpl } from '@infrastructure/repositories/InvestmentRepository';

/**
 * Result of an investment import operation
 */
export interface ImportInvestmentsResult {
	/** Number of positions imported/updated */
	positions: number;
	/** Number of transactions imported */
	transactions: number;
	/** Error messages encountered during import */
	errors: string[];
}

/**
 * Use case for importing investment data from XLSX/CSV files.
 *
 * Responsibilities:
 * - Parse file content using the appropriate parser (based on source.parserKey)
 * - For PEA/AV: upsert positions (replace old positions with new snapshot)
 * - For Crypto: append transactions + recalculate positions from all transactions
 * - Update source.lastSyncAt timestamp after successful import
 */
export class ImportInvestmentsUseCase {
	private readonly cryptoCalculator: CalculateCryptoPositionsUseCase;

	constructor(private readonly investmentRepository: InvestmentRepositoryImpl) {
		this.cryptoCalculator = new CalculateCryptoPositionsUseCase();
	}

	/**
	 * Import investment data from file content for a given source.
	 *
	 * @param sourceId The ID of the investment source
	 * @param content The raw file content (ArrayBuffer for XLSX, string for CSV)
	 * @returns ImportInvestmentsResult with counts and errors
	 */
	async execute(
		sourceId: UniqueId,
		content: ArrayBuffer | string
	): Promise<ImportInvestmentsResult> {
		const errors: string[] = [];

		// 1. Get the investment source
		const source = await this.investmentRepository.findSourceById(sourceId);
		if (!source) {
			return { positions: 0, transactions: 0, errors: ['Investment source not found'] };
		}

		// 2. Parse file using appropriate parser
		const parser = InvestmentParserFactory.createParser(source.parserKey);

		// 3. Handle differently based on source type
		let result: ImportInvestmentsResult;

		if (source.type === InvestmentSourceType.CRYPTO) {
			// Crypto: parse transactions → append new → recalculate positions
			result = await this.handleCryptoImport(source, parser, content, errors);
		} else {
			// PEA/AV/CTO: parse positions → upsert (replace old)
			result = await this.handlePositionsImport(source, parser, content, errors);
		}

		// 4. Update last sync timestamp on source
		source.markSynced();
		try {
			await this.investmentRepository.saveSource(source);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			result.errors.push(`Warning: Failed to update sync timestamp: ${message}`);
		}

		return result;
	}

	/**
	 * Handle import for position-based sources (PEA, Assurance-Vie, CTO).
	 * These sources provide a snapshot of positions, so we:
	 * 1. Delete existing positions for the source
	 * 2. Create new positions from the parsed data
	 */
	private async handlePositionsImport(
		source: InvestmentSource,
		parser: ReturnType<typeof InvestmentParserFactory.createParser>,
		content: ArrayBuffer | string,
		errors: string[]
	): Promise<ImportInvestmentsResult> {
		// Parse positions from file
		let parsedPositions: ParsedPosition[];
		try {
			parsedPositions = parser.parsePositions(content);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown parsing error';
			return { positions: 0, transactions: 0, errors: [`Failed to parse file: ${message}`] };
		}

		if (parsedPositions.length === 0) {
			return { positions: 0, transactions: 0, errors: ['No positions found in file'] };
		}

		// Delete existing positions for this source
		try {
			await this.investmentRepository.deletePositionsBySourceId(source.id);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			return {
				positions: 0,
				transactions: 0,
				errors: [`Failed to clear existing positions: ${message}`]
			};
		}

		// Create and save new positions
		let savedCount = 0;
		for (const parsed of parsedPositions) {
			const positionResult = this.createPositionFromParsed(parsed, source.id);

			if (positionResult.isSuccess) {
				try {
					await this.investmentRepository.savePosition(positionResult.value);
					savedCount++;
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Unknown error';
					errors.push(`Failed to save position ${parsed.symbol}: ${message}`);
				}
			} else {
				errors.push(`Invalid position ${parsed.symbol}: ${positionResult.error}`);
			}
		}

		return { positions: savedCount, transactions: 0, errors };
	}

	/**
	 * Handle import for crypto sources (Binance, etc.).
	 * Crypto sources provide transaction history, so we:
	 * 1. Parse new transactions from the file
	 * 2. Deduplicate against existing transactions
	 * 3. Append new transactions
	 * 4. Recalculate positions from all transactions
	 */
	private async handleCryptoImport(
		source: InvestmentSource,
		parser: ReturnType<typeof InvestmentParserFactory.createParser>,
		content: ArrayBuffer | string,
		errors: string[]
	): Promise<ImportInvestmentsResult> {
		// Parse transactions from file
		let parsedTransactions: ParsedInvestmentTransaction[];
		try {
			parsedTransactions = parser.parseTransactions(content);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown parsing error';
			return { positions: 0, transactions: 0, errors: [`Failed to parse file: ${message}`] };
		}

		if (parsedTransactions.length === 0) {
			return { positions: 0, transactions: 0, errors: ['No transactions found in file'] };
		}

		// Get existing transactions for deduplication
		const existingTransactions = await this.investmentRepository.findTransactionsBySourceId(
			source.id
		);
		const existingSignatures = this.buildTransactionSignatureSet(existingTransactions);

		// Append new transactions (deduplicated)
		let savedTxCount = 0;
		for (const parsed of parsedTransactions) {
			const signature = this.buildParsedTransactionSignature(parsed);

			if (existingSignatures.has(signature)) {
				// Skip duplicate
				continue;
			}

			const txResult = this.createTransactionFromParsed(parsed, source.id);

			if (txResult.isSuccess) {
				try {
					await this.investmentRepository.saveTransaction(txResult.value);
					savedTxCount++;
					// Add to set to avoid duplicates within same import
					existingSignatures.add(signature);
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Unknown error';
					errors.push(`Failed to save transaction: ${message}`);
				}
			} else {
				errors.push(`Invalid transaction: ${txResult.error}`);
			}
		}

		// Recalculate positions from all transactions
		const allTransactions = await this.investmentRepository.findTransactionsBySourceId(source.id);

		// Delete existing positions and recalculate
		await this.investmentRepository.deletePositionsBySourceId(source.id);

		let savedPosCount = 0;
		try {
			const newPositions = await this.cryptoCalculator.execute(allTransactions, source.id);

			for (const position of newPositions) {
				await this.investmentRepository.savePosition(position);
				savedPosCount++;
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			errors.push(`Failed to calculate crypto positions: ${message}`);
		}

		return { positions: savedPosCount, transactions: savedTxCount, errors };
	}

	/**
	 * Create a domain InvestmentPosition from parsed data.
	 */
	private createPositionFromParsed(
		parsed: ParsedPosition,
		sourceId: UniqueId
	): { isSuccess: true; value: InvestmentPosition } | { isSuccess: false; error: string } {
		const result = InvestmentPosition.create({
			sourceId,
			symbol: parsed.symbol,
			isin: parsed.isin ?? null,
			quantity: parsed.quantity,
			avgBuyPrice: parsed.avgBuyPrice,
			currentPrice: parsed.currentPrice,
			currentValue: parsed.currentValue,
			gainLoss: parsed.gainLoss,
			gainLossPercent: parsed.gainLossPercent
		});

		if (result.isSuccess) {
			return { isSuccess: true, value: result.value };
		} else {
			return { isSuccess: false, error: result.error };
		}
	}

	/**
	 * Create a domain InvestmentTransaction from parsed data.
	 */
	private createTransactionFromParsed(
		parsed: ParsedInvestmentTransaction,
		sourceId: UniqueId
	): { isSuccess: true; value: InvestmentTransaction } | { isSuccess: false; error: string } {
		const result = InvestmentTransaction.create({
			sourceId,
			date: parsed.date,
			symbol: parsed.symbol,
			type: parsed.type,
			quantity: parsed.quantity,
			pricePerUnit: parsed.pricePerUnit,
			totalAmount: parsed.totalAmount,
			fee: parsed.fee
		});

		if (result.isSuccess) {
			return { isSuccess: true, value: result.value };
		} else {
			return { isSuccess: false, error: result.error };
		}
	}

	/**
	 * Build a signature for a transaction to use for deduplication.
	 * Format: "YYYY-MM-DD|symbol|type|quantity|total"
	 */
	private buildTransactionSignature(tx: InvestmentTransaction): string {
		const dateStr = tx.date.toISOString().split('T')[0];
		const roundedQty = Math.round(tx.quantity * 100000000) / 100000000;
		const roundedTotal = Math.round(tx.totalAmount * 100) / 100;
		return `${dateStr}|${tx.symbol.toUpperCase()}|${tx.type}|${roundedQty}|${roundedTotal}`;
	}

	/**
	 * Build a signature for a parsed transaction.
	 */
	private buildParsedTransactionSignature(parsed: ParsedInvestmentTransaction): string {
		const dateStr = parsed.date.toISOString().split('T')[0];
		const roundedQty = Math.round(parsed.quantity * 100000000) / 100000000;
		const roundedTotal = Math.round(parsed.totalAmount * 100) / 100;
		return `${dateStr}|${parsed.symbol.toUpperCase()}|${parsed.type}|${roundedQty}|${roundedTotal}`;
	}

	/**
	 * Build a set of signatures from existing transactions for fast lookup.
	 */
	private buildTransactionSignatureSet(transactions: InvestmentTransaction[]): Set<string> {
		const signatures = new Set<string>();
		for (const tx of transactions) {
			signatures.add(this.buildTransactionSignature(tx));
		}
		return signatures;
	}
}
