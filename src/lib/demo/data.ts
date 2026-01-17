/**
 * Demo data for DEMO_MODE
 * In-memory data that simulates a real database
 */

import type { AccountType } from '@/features/accounts/types';
import type { TransactionType } from '@/features/transactions/types';
import { dayjs } from '@/shared/utils/date';

// ===========================================
// TYPE DEFINITIONS FOR DEMO DATA
// ===========================================
interface DemoAccount {
	id: string;
	name: string;
	type: AccountType;
	bankId: string;
	balance: number;
	currency: string;
	ownerId: string;
	ownerShare: number;
	isActive: boolean;
	lastSyncAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

interface DemoTransaction {
	id: string;
	accountId: string;
	type: TransactionType;
	amount: number;
	currency: string;
	description: string;
	categoryId: string | null;
	date: Date;
	isReconciled: boolean;
	isInternal: boolean;
	linkedTransactionId: string | null;
	metadata: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

// ===========================================
// OWNERS & ENTITIES
// ===========================================
export const demoOwners = [
	{
		id: 'owner-001',
		name: 'Mathieu',
		type: 'individual' as const,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
	{
		id: 'owner-002',
		name: 'Ninon',
		type: 'individual' as const,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
];

export const demoEntities = [
	{
		id: 'entity-all',
		name: 'Patrimoine familial',
		type: 'family' as const,
		ownerIds: ['owner-001', 'owner-002'],
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
	{
		id: 'entity-001',
		name: 'Mathieu',
		type: 'individual' as const,
		ownerIds: ['owner-001'],
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
	{
		id: 'entity-002',
		name: 'Ninon',
		type: 'individual' as const,
		ownerIds: ['owner-002'],
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
];

// ===========================================
// BANKS
// ===========================================
export const demoBanks = [
	{
		id: 'bank-001',
		name: 'Crédit Mutuel',
		logoUrl: null,
		country: 'FR',
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
	{
		id: 'bank-002',
		name: 'BNP Paribas',
		logoUrl: null,
		country: 'FR',
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
	{
		id: 'bank-003',
		name: 'Bourse Direct',
		logoUrl: null,
		country: 'FR',
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
	{
		id: 'bank-004',
		name: 'Linxea',
		logoUrl: null,
		country: 'FR',
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
	{
		id: 'bank-005',
		name: 'La Banque Postale',
		logoUrl: null,
		country: 'FR',
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01'),
	},
];

// ===========================================
// ACCOUNTS
// ===========================================
export const demoAccounts: DemoAccount[] = [
	// Checking accounts
	{
		id: 'account-001',
		name: 'Compte principal',
		type: 'checking' as const,
		bankId: 'bank-001',
		balance: 2450.32,
		currency: 'EUR',
		ownerId: 'owner-001',
		ownerShare: 100,
		isActive: true,
		lastSyncAt: new Date(),
		createdAt: new Date('2023-01-15'),
		updatedAt: new Date(),
	},
	{
		id: 'account-002',
		name: 'Compte joint',
		type: 'checking' as const,
		bankId: 'bank-002',
		balance: 1234.56,
		currency: 'EUR',
		ownerId: 'owner-001',
		ownerShare: 50,
		isActive: true,
		lastSyncAt: new Date(),
		createdAt: new Date('2023-02-01'),
		updatedAt: new Date(),
	},
	// Savings accounts
	{
		id: 'account-003',
		name: 'Livret A',
		type: 'savings' as const,
		bankId: 'bank-001',
		balance: 22950.0,
		currency: 'EUR',
		ownerId: 'owner-001',
		ownerShare: 100,
		isActive: true,
		lastSyncAt: new Date(),
		createdAt: new Date('2023-01-15'),
		updatedAt: new Date(),
	},
	{
		id: 'account-004',
		name: 'LDDS',
		type: 'savings' as const,
		bankId: 'bank-001',
		balance: 12000.0,
		currency: 'EUR',
		ownerId: 'owner-001',
		ownerShare: 100,
		isActive: true,
		lastSyncAt: new Date(),
		createdAt: new Date('2023-01-15'),
		updatedAt: new Date(),
	},
	{
		id: 'account-005',
		name: 'LEP',
		type: 'savings' as const,
		bankId: 'bank-005',
		balance: 7700.0,
		currency: 'EUR',
		ownerId: 'owner-002',
		ownerShare: 100,
		isActive: true,
		lastSyncAt: new Date(),
		createdAt: new Date('2023-03-01'),
		updatedAt: new Date(),
	},
	// Investment accounts
	{
		id: 'account-006',
		name: 'PEA',
		type: 'investment' as const,
		bankId: 'bank-003',
		balance: 45200.0,
		currency: 'EUR',
		ownerId: 'owner-001',
		ownerShare: 100,
		isActive: true,
		lastSyncAt: new Date(),
		createdAt: new Date('2023-01-20'),
		updatedAt: new Date(),
	},
	{
		id: 'account-007',
		name: 'Assurance-vie',
		type: 'investment' as const,
		bankId: 'bank-004',
		balance: 32100.0,
		currency: 'EUR',
		ownerId: 'owner-001',
		ownerShare: 100,
		isActive: true,
		lastSyncAt: new Date(),
		createdAt: new Date('2023-02-15'),
		updatedAt: new Date(),
	},
];

// ===========================================
// CATEGORIES
// ===========================================
export const demoCategories = [
	{ id: 'cat-001', name: 'Alimentation', icon: '🛒', color: '#22c55e', type: 'expense' as const },
	{ id: 'cat-002', name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' as const },
	{ id: 'cat-003', name: 'Logement', icon: '🏠', color: '#f59e0b', type: 'expense' as const },
	{ id: 'cat-004', name: 'Loisirs', icon: '🎬', color: '#ec4899', type: 'expense' as const },
	{ id: 'cat-005', name: 'Santé', icon: '💊', color: '#ef4444', type: 'expense' as const },
	{ id: 'cat-006', name: 'Shopping', icon: '🛍️', color: '#8b5cf6', type: 'expense' as const },
	{ id: 'cat-007', name: 'Restaurants', icon: '🍽️', color: '#f97316', type: 'expense' as const },
	{ id: 'cat-008', name: 'Abonnements', icon: '📱', color: '#06b6d4', type: 'expense' as const },
	{ id: 'cat-009', name: 'Salaire', icon: '💰', color: '#22c55e', type: 'income' as const },
	{ id: 'cat-010', name: 'Dividendes', icon: '📈', color: '#3b82f6', type: 'income' as const },
	{ id: 'cat-011', name: 'Loyers perçus', icon: '🏢', color: '#f59e0b', type: 'income' as const },
	{
		id: 'cat-012',
		name: 'Virement interne',
		icon: '↔️',
		color: '#6b7280',
		type: 'transfer' as const,
	},
];

// ===========================================
// TRANSACTIONS
// ===========================================
function generateTransactions(): DemoTransaction[] {
	const transactions = [];
	const now = dayjs();

	// Generate 3 months of transactions
	for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
		const month = now.subtract(monthOffset, 'month');

		// Salaire (income)
		transactions.push({
			id: `tx-salary-${monthOffset}`,
			accountId: 'account-001',
			type: 'income' as const,
			amount: 3200.0,
			currency: 'EUR',
			description: 'Virement salaire',
			categoryId: 'cat-009',
			date: month.date(5).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(5).toDate(),
			updatedAt: month.date(5).toDate(),
		});

		// Loyer (expense)
		transactions.push({
			id: `tx-rent-${monthOffset}`,
			accountId: 'account-001',
			type: 'expense' as const,
			amount: -950.0,
			currency: 'EUR',
			description: 'Loyer appartement',
			categoryId: 'cat-003',
			date: month.date(7).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(7).toDate(),
			updatedAt: month.date(7).toDate(),
		});

		// Courses (expense)
		transactions.push({
			id: `tx-grocery-${monthOffset}-1`,
			accountId: 'account-001',
			type: 'expense' as const,
			amount: -127.43,
			currency: 'EUR',
			description: 'Carrefour',
			categoryId: 'cat-001',
			date: month.date(10).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(10).toDate(),
			updatedAt: month.date(10).toDate(),
		});

		transactions.push({
			id: `tx-grocery-${monthOffset}-2`,
			accountId: 'account-001',
			type: 'expense' as const,
			amount: -89.21,
			currency: 'EUR',
			description: 'Leclerc',
			categoryId: 'cat-001',
			date: month.date(18).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(18).toDate(),
			updatedAt: month.date(18).toDate(),
		});

		// Transport (expense)
		transactions.push({
			id: `tx-transport-${monthOffset}`,
			accountId: 'account-001',
			type: 'expense' as const,
			amount: -75.0,
			currency: 'EUR',
			description: 'Navigo mensuel',
			categoryId: 'cat-002',
			date: month.date(1).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(1).toDate(),
			updatedAt: month.date(1).toDate(),
		});

		// Restaurant (expense)
		transactions.push({
			id: `tx-resto-${monthOffset}`,
			accountId: 'account-001',
			type: 'expense' as const,
			amount: -45.8,
			currency: 'EUR',
			description: 'Restaurant Le Petit Zinc',
			categoryId: 'cat-007',
			date: month.date(15).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(15).toDate(),
			updatedAt: month.date(15).toDate(),
		});

		// Abonnements (expense)
		transactions.push({
			id: `tx-netflix-${monthOffset}`,
			accountId: 'account-001',
			type: 'expense' as const,
			amount: -17.99,
			currency: 'EUR',
			description: 'Netflix',
			categoryId: 'cat-008',
			date: month.date(12).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(12).toDate(),
			updatedAt: month.date(12).toDate(),
		});

		transactions.push({
			id: `tx-spotify-${monthOffset}`,
			accountId: 'account-001',
			type: 'expense' as const,
			amount: -10.99,
			currency: 'EUR',
			description: 'Spotify',
			categoryId: 'cat-008',
			date: month.date(14).toDate(),
			isReconciled: true,
			isInternal: false,
			linkedTransactionId: null,
			metadata: {},
			createdAt: month.date(14).toDate(),
			updatedAt: month.date(14).toDate(),
		});

		// Virement épargne (internal transfer)
		transactions.push({
			id: `tx-savings-out-${monthOffset}`,
			accountId: 'account-001',
			type: 'transfer' as const,
			amount: -500.0,
			currency: 'EUR',
			description: 'Virement vers Livret A',
			categoryId: 'cat-012',
			date: month.date(6).toDate(),
			isReconciled: true,
			isInternal: true,
			linkedTransactionId: `tx-savings-in-${monthOffset}`,
			metadata: {},
			createdAt: month.date(6).toDate(),
			updatedAt: month.date(6).toDate(),
		});

		transactions.push({
			id: `tx-savings-in-${monthOffset}`,
			accountId: 'account-003',
			type: 'transfer' as const,
			amount: 500.0,
			currency: 'EUR',
			description: 'Virement depuis Compte principal',
			categoryId: 'cat-012',
			date: month.date(6).toDate(),
			isReconciled: true,
			isInternal: true,
			linkedTransactionId: `tx-savings-out-${monthOffset}`,
			metadata: {},
			createdAt: month.date(6).toDate(),
			updatedAt: month.date(6).toDate(),
		});
	}

	// Sort by date descending
	return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const demoTransactions = generateTransactions();

// ===========================================
// REAL ESTATE PROPERTIES
// ===========================================
export const demoProperties = [
	{
		id: 'property-001',
		name: 'Appartement Paris 11e',
		type: 'Appartement',
		address: '42 Rue de la Roquette, 75011 Paris',
		purchasePrice: 450000,
		currentValue: 520000,
		monthlyRent: 1500,
		monthlyCharges: 250,
		loanRemaining: 320000,
		ownership: 100,
		tenants: 1,
		surface: 55,
		purchaseDate: new Date('2019-06-15'),
		createdAt: new Date('2019-06-15'),
		updatedAt: new Date(),
	},
	{
		id: 'property-002',
		name: 'Studio Lyon 3e',
		type: 'Studio',
		address: '15 Rue Paul Bert, 69003 Lyon',
		purchasePrice: 180000,
		currentValue: 210000,
		monthlyRent: 650,
		monthlyCharges: 100,
		loanRemaining: 95000,
		ownership: 50,
		tenants: 1,
		surface: 25,
		purchaseDate: new Date('2021-03-20'),
		createdAt: new Date('2021-03-20'),
		updatedAt: new Date(),
	},
	{
		id: 'property-003',
		name: 'Résidence Principale',
		type: 'Maison',
		address: '8 Allée des Tilleuls, 69006 Lyon',
		purchasePrice: 380000,
		currentValue: 420000,
		monthlyRent: 0,
		monthlyCharges: 150,
		loanRemaining: 280000,
		ownership: 100,
		tenants: 0,
		surface: 120,
		purchaseDate: new Date('2020-09-01'),
		createdAt: new Date('2020-09-01'),
		updatedAt: new Date(),
	},
];

// ===========================================
// LOANS
// ===========================================
export const demoLoans = [
	{
		id: 'loan-001',
		name: 'Crédit Appartement Paris',
		type: 'immobilier' as const,
		bank: 'Crédit Mutuel',
		initialAmount: 400000,
		remainingAmount: 320000,
		monthlyPayment: 1850,
		interestRate: 1.2,
		startDate: new Date('2019-06-15'),
		endDate: new Date('2039-06-15'),
		insurance: 45,
		propertyId: 'property-001',
		createdAt: new Date('2019-06-15'),
		updatedAt: new Date(),
	},
	{
		id: 'loan-002',
		name: 'Crédit Studio Lyon',
		type: 'immobilier' as const,
		bank: 'LCL',
		initialAmount: 160000,
		remainingAmount: 95000,
		monthlyPayment: 720,
		interestRate: 1.5,
		startDate: new Date('2021-03-20'),
		endDate: new Date('2041-03-20'),
		insurance: 25,
		propertyId: 'property-002',
		createdAt: new Date('2021-03-20'),
		updatedAt: new Date(),
	},
	{
		id: 'loan-003',
		name: 'Crédit Résidence Principale',
		type: 'immobilier' as const,
		bank: 'BNP Paribas',
		initialAmount: 350000,
		remainingAmount: 280000,
		monthlyPayment: 1520,
		interestRate: 1.35,
		startDate: new Date('2020-09-01'),
		endDate: new Date('2045-09-01'),
		insurance: 50,
		propertyId: 'property-003',
		createdAt: new Date('2020-09-01'),
		updatedAt: new Date(),
	},
	{
		id: 'loan-004',
		name: 'Crédit Auto',
		type: 'auto' as const,
		bank: 'Cetelem',
		initialAmount: 25000,
		remainingAmount: 8500,
		monthlyPayment: 450,
		interestRate: 4.5,
		startDate: new Date('2022-01-15'),
		endDate: new Date('2027-01-15'),
		insurance: 15,
		propertyId: null,
		createdAt: new Date('2022-01-15'),
		updatedAt: new Date(),
	},
];

// ===========================================
// INVESTMENTS
// ===========================================
export const demoInvestmentPositions = [
	{
		id: 'inv-001',
		accountId: 'account-006',
		symbol: 'CW8',
		name: 'Amundi MSCI World',
		type: 'ETF' as const,
		quantity: 50,
		averageCost: 420.5,
		currentPrice: 485.2,
		currency: 'EUR',
		lastPriceUpdate: new Date(),
		createdAt: new Date('2023-02-01'),
		updatedAt: new Date(),
	},
	{
		id: 'inv-002',
		accountId: 'account-006',
		symbol: 'PAEEM',
		name: 'Amundi MSCI Emerging Markets',
		type: 'ETF' as const,
		quantity: 100,
		averageCost: 22.3,
		currentPrice: 24.8,
		currency: 'EUR',
		lastPriceUpdate: new Date(),
		createdAt: new Date('2023-03-15'),
		updatedAt: new Date(),
	},
	{
		id: 'inv-003',
		accountId: 'account-006',
		symbol: 'BNP',
		name: 'BNP Paribas',
		type: 'Stock' as const,
		quantity: 30,
		averageCost: 52.4,
		currentPrice: 58.9,
		currency: 'EUR',
		lastPriceUpdate: new Date(),
		createdAt: new Date('2023-04-10'),
		updatedAt: new Date(),
	},
	{
		id: 'inv-004',
		accountId: 'account-007',
		symbol: 'FONDS-EUROS',
		name: 'Fonds Euros Suravenir',
		type: 'Fund' as const,
		quantity: 1,
		averageCost: 25000,
		currentPrice: 26500,
		currency: 'EUR',
		lastPriceUpdate: new Date(),
		createdAt: new Date('2023-02-15'),
		updatedAt: new Date(),
	},
	{
		id: 'inv-005',
		accountId: 'account-007',
		symbol: 'LYXOR-SP500',
		name: 'Lyxor S&P 500 ETF',
		type: 'ETF' as const,
		quantity: 20,
		averageCost: 250.0,
		currentPrice: 280.0,
		currency: 'EUR',
		lastPriceUpdate: new Date(),
		createdAt: new Date('2023-05-01'),
		updatedAt: new Date(),
	},
];

// ===========================================
// BUDGET RULES
// ===========================================
export const demoBudgetRules = [
	{
		id: 'budget-001',
		categoryId: 'cat-001',
		monthlyLimit: 400,
		alertThreshold: 80,
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date(),
	},
	{
		id: 'budget-002',
		categoryId: 'cat-002',
		monthlyLimit: 150,
		alertThreshold: 80,
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date(),
	},
	{
		id: 'budget-003',
		categoryId: 'cat-004',
		monthlyLimit: 200,
		alertThreshold: 75,
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date(),
	},
	{
		id: 'budget-004',
		categoryId: 'cat-007',
		monthlyLimit: 150,
		alertThreshold: 80,
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date(),
	},
	{
		id: 'budget-005',
		categoryId: 'cat-008',
		monthlyLimit: 100,
		alertThreshold: 90,
		isActive: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date(),
	},
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get bank name by ID
 */
export function getBankName(bankId: string): string {
	return demoBanks.find((b) => b.id === bankId)?.name ?? 'Banque inconnue';
}

/**
 * Get category by ID
 */
export function getCategory(categoryId: string | null) {
	if (!categoryId) return null;
	return demoCategories.find((c) => c.id === categoryId) ?? null;
}

/**
 * Get account with bank info
 */
export function getAccountWithBank(accountId: string) {
	const account = demoAccounts.find((a) => a.id === accountId);
	if (!account) return null;

	return {
		...account,
		bankName: getBankName(account.bankId),
	};
}
