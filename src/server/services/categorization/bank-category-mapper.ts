/**
 * Bank Category Mapper
 * Maps bank-specific category strings (from CSV exports) to our category IDs
 * Currently supports Caisse d'Épargne category format
 */

import type { CategorizationResult, TransactionForCategorization } from './types';

/**
 * Mapping of Caisse d'Épargne bank categories to our category IDs
 * These come from the `bankCategory` field parsed from CSV exports
 */
const BANK_CATEGORY_MAP: Record<string, string> = {
	// Income
	Salaires: 'cat-salary',
	Revenus: 'cat-other-income',
	Remboursements: 'cat-refund',
	// Housing
	Loyer: 'cat-housing',
	Logement: 'cat-housing',
	// Utilities
	Telecom: 'cat-utilities',
	Telephone: 'cat-utilities',
	Internet: 'cat-utilities',
	Electricite: 'cat-utilities',
	Energie: 'cat-utilities',
	Eau: 'cat-utilities',
	// Groceries
	Alimentation: 'cat-groceries',
	Supermarche: 'cat-groceries',
	Courses: 'cat-groceries',
	// Transport
	Transport: 'cat-transport',
	Carburant: 'cat-transport',
	Essence: 'cat-transport',
	Peage: 'cat-transport',
	Parking: 'cat-transport',
	Automobile: 'cat-transport',
	// Restaurants
	Restauration: 'cat-restaurants',
	Restaurant: 'cat-restaurants',
	// Health
	Sante: 'cat-health',
	Pharmacie: 'cat-health',
	Medecin: 'cat-health',
	// Insurance
	Assurance: 'cat-insurance',
	Mutuelle: 'cat-insurance',
	// Shopping
	Shopping: 'cat-shopping',
	Habillement: 'cat-shopping',
	Vetements: 'cat-shopping',
	Electromenager: 'cat-shopping',
	// Leisure
	Loisirs: 'cat-leisure',
	Sport: 'cat-leisure',
	Culture: 'cat-leisure',
	// Education
	Education: 'cat-education',
	Formation: 'cat-education',
	// Taxes
	Impots: 'cat-taxes',
	Taxes: 'cat-taxes',
	// Fees
	'Frais bancaires': 'cat-fees',
	Frais: 'cat-fees',
	Agios: 'cat-fees',
	// Savings/Investments
	Epargne: 'cat-savings',
	Placement: 'cat-investment',
	// Subscriptions
	Abonnement: 'cat-subscriptions',
	Abonnements: 'cat-subscriptions',
	// Loan
	Credit: 'cat-loan-payment',
	Pret: 'cat-loan-payment',
	Emprunt: 'cat-loan-payment',
	// Transfer
	'Virement interne': 'cat-transfer',
	Virement: 'cat-transfer',
};

/**
 * Normalize a bank category for lookup:
 * remove accents, trim, title case
 */
function normalizeBankCategory(category: string): string {
	return category
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();
}

/**
 * Apply bank category mapping to uncategorized transactions
 * Only applies to transactions that have a bankCategory from CSV parsing
 */
export function applyBankCategoryMapping(
	transactions: TransactionForCategorization[],
): CategorizationResult[] {
	const results: CategorizationResult[] = [];

	for (const tx of transactions) {
		if (!tx.bankCategory) continue;

		const normalized = normalizeBankCategory(tx.bankCategory);
		const categoryId = BANK_CATEGORY_MAP[normalized];

		if (categoryId) {
			results.push({
				transactionId: tx.id,
				categoryId,
				source: 'BANK',
				confidence: 0.7,
			});
		}
	}

	return results;
}
