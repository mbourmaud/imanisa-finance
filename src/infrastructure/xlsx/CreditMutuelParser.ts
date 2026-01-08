import * as XLSX from 'xlsx';
import { TransactionType } from '@domain/transaction/TransactionType';
import { TransactionCategory } from '@domain/transaction/TransactionCategory';
import type { ParsedTransaction } from './XlsxParser';

export class CreditMutuelParser {
	parse(buffer: ArrayBuffer): ParsedTransaction[] {
		const workbook = XLSX.read(buffer, { type: 'array' });
		const transactions: ParsedTransaction[] = [];

		for (const sheetName of workbook.SheetNames) {
			if (sheetName.startsWith('Cpt ')) {
				const sheet = workbook.Sheets[sheetName];
				const sheetTransactions = this.parseSheet(sheet);
				transactions.push(...sheetTransactions);
			}
		}

		return transactions;
	}

	private parseSheet(sheet: XLSX.WorkSheet): ParsedTransaction[] {
		const transactions: ParsedTransaction[] = [];
		const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

		for (let row = 5; row <= range.e.r; row++) {
			const dateCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
			const descCell = sheet[XLSX.utils.encode_cell({ r: row, c: 2 })];
			const debitCell = sheet[XLSX.utils.encode_cell({ r: row, c: 3 })];
			const creditCell = sheet[XLSX.utils.encode_cell({ r: row, c: 4 })];

			if (!dateCell || !descCell) continue;

			const date = this.parseDate(dateCell);
			if (!date) continue;

			const description = String(descCell.v || '').trim();
			if (!description) continue;

			const debit = debitCell?.v ? Number(debitCell.v) : 0;
			const credit = creditCell?.v ? Number(creditCell.v) : 0;

			if (!debit && !credit) continue;

			const amount = credit || Math.abs(debit);
			const isCredit = credit !== 0;

			const type = isCredit ? TransactionType.INCOME : TransactionType.EXPENSE;
			const category = this.categorize(description);

			transactions.push({
				date,
				description,
				amount,
				type,
				category
			});
		}

		return transactions;
	}

	private parseDate(cell: XLSX.CellObject): Date | null {
		if (!cell || cell.v === undefined) return null;

		if (typeof cell.v === 'number') {
			const epoch = new Date(1899, 11, 30);
			return new Date(epoch.getTime() + cell.v * 86400000);
		}

		return null;
	}

	private categorize(description: string): TransactionCategory | null {
		const desc = description.toUpperCase();

		if (desc.includes('SALAIRE') || desc.includes('VIR SEPA') && desc.includes('EMERIA')) {
			return TransactionCategory.SALARY;
		}
		if (desc.includes('PRLV SEPA') && desc.includes('LOYER')) {
			return TransactionCategory.HOUSING;
		}
		if (desc.includes('EDF') || desc.includes('ENGIE') || desc.includes('GAZ')) {
			return TransactionCategory.UTILITIES;
		}
		if (desc.includes('FREE') || desc.includes('ORANGE') || desc.includes('BOUYGUES') || desc.includes('SFR')) {
			return TransactionCategory.SUBSCRIPTIONS;
		}
		if (desc.includes('CARREFOUR') || desc.includes('LECLERC') || desc.includes('AUCHAN') || desc.includes('LIDL') || desc.includes('FRANPRIX')) {
			return TransactionCategory.GROCERIES;
		}
		if (desc.includes('UBER EATS') || desc.includes('DELIVEROO') || desc.includes('JUST EAT')) {
			return TransactionCategory.RESTAURANTS;
		}
		if (desc.includes('UBER') && !desc.includes('EATS')) {
			return TransactionCategory.TRANSPORT;
		}
		if (desc.includes('NAVIGO') || desc.includes('SNCF') || desc.includes('RATP')) {
			return TransactionCategory.TRANSPORT;
		}
		if (desc.includes('AMAZON')) {
			return TransactionCategory.SHOPPING;
		}
		if (desc.includes('NETFLIX') || desc.includes('SPOTIFY') || desc.includes('APPLE.COM') || desc.includes('DISNEY')) {
			return TransactionCategory.SUBSCRIPTIONS;
		}
		if (desc.includes('PHARMACIE') || desc.includes('MEDECIN') || desc.includes('DOCTEUR')) {
			return TransactionCategory.HEALTH;
		}
		if (desc.includes('ASSURANCE') || desc.includes('ALLIANZ') || desc.includes('AXA') || desc.includes('MAIF')) {
			return TransactionCategory.INSURANCE;
		}
		if (desc.includes('ECH PRET') || desc.includes('MODULIMMO')) {
			return TransactionCategory.LOAN_PAYMENT;
		}
		if (desc.includes('IMPOT') || desc.includes('DGFIP') || desc.includes('TRESOR')) {
			return TransactionCategory.TAXES;
		}
		if (desc.includes('VIREMENT') && (desc.includes('LIVRET') || desc.includes('EPARGNE'))) {
			return TransactionCategory.SAVINGS;
		}
		if (desc.includes('REVOLUT') || desc.includes('LYDIA')) {
			return TransactionCategory.TRANSFER;
		}

		return null;
	}
}
