import type { CsvParser, ParsedTransaction } from '../CsvParser';
import { parseCSV, parseAmount, parseDate } from '../CsvParser';
import { TransactionType } from '@domain/transaction/TransactionType';
import { TransactionCategory } from '@domain/transaction/TransactionCategory';

const CATEGORY_MAP: Record<string, TransactionCategory> = {
	'Revenus et rentrees d\'argent': TransactionCategory.SALARY,
	'Salaires': TransactionCategory.SALARY,
	'Alimentation': TransactionCategory.GROCERIES,
	'Restaurant': TransactionCategory.RESTAURANTS,
	'Restauration rapide': TransactionCategory.RESTAURANTS,
	'Hyper/supermarche': TransactionCategory.GROCERIES,
	'Transports': TransactionCategory.TRANSPORT,
	'Transports en commun': TransactionCategory.TRANSPORT,
	'Taxis et VTC': TransactionCategory.TRANSPORT,
	'Trains, avions et ferrys': TransactionCategory.TRAVEL,
	'Logement - maison': TransactionCategory.HOUSING,
	'Internet et telephonie': TransactionCategory.SUBSCRIPTIONS,
	'Energie eau, gaz, electricite, fioul': TransactionCategory.UTILITIES,
	'Banque et assurances': TransactionCategory.INSURANCE,
	'Frais bancaires': TransactionCategory.FEES,
	'Sante': TransactionCategory.HEALTH,
	'Pharmacie': TransactionCategory.HEALTH,
	'Consultation medicale': TransactionCategory.HEALTH,
	'Shopping et services': TransactionCategory.SHOPPING,
	'Vetements et chaussures': TransactionCategory.SHOPPING,
	'High-Tech/Electromenager': TransactionCategory.SHOPPING,
	'Loisirs et vacances': TransactionCategory.LEISURE,
	'Video, Musique et jeux': TransactionCategory.SUBSCRIPTIONS,
	'Expo, musee, cinema': TransactionCategory.LEISURE,
	'Sport, Gym et Equipement': TransactionCategory.LEISURE,
	'Bar': TransactionCategory.LEISURE,
	'Hotel': TransactionCategory.TRAVEL,
	'Livres, Magazines': TransactionCategory.LEISURE,
	'Impots et taxes': TransactionCategory.TAXES,
	'Transaction exclue': TransactionCategory.TRANSFER,
	'Virement interne': TransactionCategory.TRANSFER
};

export class CaisseEpargneParser implements CsvParser {
	parse(content: string): ParsedTransaction[] {
		const rows = parseCSV(content, ';');
		const transactions: ParsedTransaction[] = [];

		if (rows.length === 0) return transactions;

		const header = rows[0];
		const colIndex = this.getColumnIndices(header);

		for (let i = 1; i < rows.length; i++) {
			const row = rows[i];
			if (row.length < 5) continue;

			const dateStr = row[colIndex.date];
			const labelSimple = row[colIndex.labelSimple] || '';
			const labelFull = row[colIndex.labelFull] || '';
			const debitStr = row[colIndex.debit];
			const creditStr = row[colIndex.credit];
			const category = row[colIndex.category] || '';
			const subcategory = row[colIndex.subcategory] || '';

			if (!dateStr) continue;

			const debit = debitStr ? parseAmount(debitStr) : 0;
			const credit = creditStr ? parseAmount(creditStr) : 0;

			if (!debit && !credit) continue;

			const amount = credit || debit;
			const isCredit = credit !== 0;

			let type = TransactionType.EXPENSE;
			if (isCredit) {
				type = TransactionType.INCOME;
			}
			if (category === 'Transaction exclue' || subcategory === 'Virement interne') {
				type = TransactionType.TRANSFER;
			}

			const mappedCategory = this.mapCategory(category, subcategory);

			transactions.push({
				date: parseDate(dateStr, 'DD/MM/YYYY'),
				description: labelSimple || labelFull,
				amount: Math.abs(amount),
				type,
				category: mappedCategory
			});
		}

		return transactions;
	}

	private getColumnIndices(header: string[]): {
		date: number;
		labelSimple: number;
		labelFull: number;
		debit: number;
		credit: number;
		category: number;
		subcategory: number;
	} {
		return {
			date: 0,
			labelSimple: 1,
			labelFull: 2,
			debit: 8,
			credit: 9,
			category: 6,
			subcategory: 7
		};
	}

	private mapCategory(category: string, subcategory: string): TransactionCategory | null {
		if (CATEGORY_MAP[subcategory]) {
			return CATEGORY_MAP[subcategory];
		}
		if (CATEGORY_MAP[category]) {
			return CATEGORY_MAP[category];
		}
		return null;
	}
}
