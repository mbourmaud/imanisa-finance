/**
 * Prisma Seed Script
 * Seeds the database with initial data: banks, household members, categories, and rules
 */

import { PrismaClient, BankType, type RuleMatchType } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Supported banks with parsers
const BANKS = [
	// Banques
	{
		id: 'bank-credit-mutuel',
		name: 'Crédit Mutuel',
		color: '#0066b3',
		type: BankType.BANK,
		parserKey: 'credit_mutuel',
		description: 'Crédit Mutuel et CIC',
	},
	{
		id: 'bank-cic',
		name: 'CIC',
		color: '#c8102e',
		type: BankType.BANK,
		parserKey: 'credit_mutuel', // Same parser as Crédit Mutuel
		description: null,
	},
	{
		id: 'bank-caisse-epargne',
		name: "Caisse d'Épargne",
		color: '#e4002b',
		type: BankType.BANK,
		parserKey: 'caisse_epargne',
		description: 'Caisse d\'Épargne Particuliers',
	},
	{
		id: 'bank-caisse-epargne-pro',
		name: "Caisse d'Épargne Pro",
		color: '#c4001e',
		type: BankType.BANK,
		parserKey: 'caisse_epargne_entreprise',
		description: 'Caisse d\'Épargne Entreprises',
	},
	{
		id: 'bank-boursorama',
		name: 'Boursorama',
		color: '#ff6600',
		type: BankType.BANK,
		parserKey: 'boursorama',
		description: null,
	},
	// Investissements
	{
		id: 'bank-bourse-direct',
		name: 'Bourse Direct',
		color: '#1a5f2a',
		type: BankType.INVESTMENT,
		parserKey: 'bourse_direct',
		description: null,
	},
	{
		id: 'bank-linxea',
		name: 'Linxea',
		color: '#0052cc',
		type: BankType.INVESTMENT,
		parserKey: 'linxea',
		description: 'Assurance vie',
	},
	{
		id: 'bank-binance',
		name: 'Binance',
		color: '#f0b90b',
		type: BankType.INVESTMENT,
		parserKey: 'binance',
		description: 'Crypto',
	},
];

// Household members
const MEMBERS = [
	{ id: 'member-isaac', name: 'Isaac', color: '#3B82F6' },
	{ id: 'member-mathieu', name: 'Mathieu', color: '#10B981' },
	{ id: 'member-ninon', name: 'Ninon', color: '#F59E0B' },
];

// Categories aligned with TransactionCategory enum
const CATEGORIES = [
	// Income — greens, teals, blues, purples
	{ id: 'cat-salary', name: 'Salaire', icon: 'wallet', color: '#059669' },
	{ id: 'cat-freelance', name: 'Freelance', icon: 'briefcase', color: '#0891B2' },
	{ id: 'cat-dividends', name: 'Dividendes', icon: 'trending-up', color: '#7C3AED' },
	{ id: 'cat-rental-income', name: 'Revenus locatifs', icon: 'key', color: '#2563EB' },
	{ id: 'cat-refund', name: 'Remboursement', icon: 'undo-2', color: '#0D9488' },
	{ id: 'cat-other-income', name: 'Autres revenus', icon: 'banknote', color: '#6D28D9' },
	// Expenses — reds, oranges, pinks, indigos, cyans (all vibrant, no greys)
	{ id: 'cat-housing', name: 'Logement', icon: 'home', color: '#DC2626' },
	{ id: 'cat-utilities', name: 'Charges', icon: 'lightbulb', color: '#EA580C' },
	{ id: 'cat-groceries', name: 'Courses', icon: 'shopping-cart', color: '#D97706' },
	{ id: 'cat-restaurants', name: 'Restaurants', icon: 'utensils', color: '#B45309' },
	{ id: 'cat-transport', name: 'Transport', icon: 'car', color: '#1D4ED8' },
	{ id: 'cat-health', name: 'Santé', icon: 'heart-pulse', color: '#DB2777' },
	{ id: 'cat-insurance', name: 'Assurance', icon: 'shield', color: '#4F46E5' },
	{ id: 'cat-subscriptions', name: 'Abonnements', icon: 'tv', color: '#9333EA' },
	{ id: 'cat-shopping', name: 'Shopping', icon: 'shopping-bag', color: '#C026D3' },
	{ id: 'cat-leisure', name: 'Loisirs', icon: 'gamepad-2', color: '#E11D48' },
	{ id: 'cat-travel', name: 'Voyages', icon: 'plane', color: '#0284C7' },
	{ id: 'cat-education', name: 'Éducation', icon: 'book-open', color: '#0369A1' },
	{ id: 'cat-taxes', name: 'Impôts', icon: 'landmark', color: '#B91C1C' },
	{ id: 'cat-fees', name: 'Frais bancaires', icon: 'building', color: '#BE185D' },
	{ id: 'cat-savings', name: 'Épargne', icon: 'piggy-bank', color: '#16A34A' },
	{ id: 'cat-investment', name: 'Investissement', icon: 'bar-chart-3', color: '#15803D' },
	{ id: 'cat-loan-payment', name: 'Crédit', icon: 'landmark', color: '#9F1239' },
	{ id: 'cat-other-expense', name: 'Autres dépenses', icon: 'package', color: '#7E22CE' },
	// Special
	{ id: 'cat-transfer', name: 'Virement interne', icon: 'arrow-left-right', color: '#6366F1' },
];

// Initial categorization rules for common French merchants/patterns
const INITIAL_RULES: {
	pattern: string
	categoryId: string
	matchType: RuleMatchType
	priority: number
}[] = [
	// Groceries
	{ pattern: 'FRANPRIX', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'CARREFOUR', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'LECLERC', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'MONOPRIX', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'LIDL', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'ALDI', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'AUCHAN', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'INTERMARCHE', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'PICARD', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'CASINO', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'BIOCOOP', categoryId: 'cat-groceries', matchType: 'CONTAINS', priority: 100 },
	// Transport
	{ pattern: 'SNCF', categoryId: 'cat-transport', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'RATP', categoryId: 'cat-transport', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'NAVIGO', categoryId: 'cat-transport', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'UBER', categoryId: 'cat-transport', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'BOLT', categoryId: 'cat-transport', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'TOTAL ENERGIES', categoryId: 'cat-transport', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'ESSENCE', categoryId: 'cat-transport', matchType: 'CONTAINS', priority: 100 },
	// Restaurants
	{ pattern: 'UBER EATS', categoryId: 'cat-restaurants', matchType: 'CONTAINS', priority: 110 },
	{ pattern: 'DELIVEROO', categoryId: 'cat-restaurants', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'JUST EAT', categoryId: 'cat-restaurants', matchType: 'CONTAINS', priority: 100 },
	// Subscriptions
	{ pattern: 'NETFLIX', categoryId: 'cat-subscriptions', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'SPOTIFY', categoryId: 'cat-subscriptions', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'AMAZON PRIME', categoryId: 'cat-subscriptions', matchType: 'CONTAINS', priority: 110 },
	{ pattern: 'DISNEY PLUS', categoryId: 'cat-subscriptions', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'CANAL+', categoryId: 'cat-subscriptions', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'APPLE.COM/BILL', categoryId: 'cat-subscriptions', matchType: 'CONTAINS', priority: 100 },
	// Shopping
	{ pattern: 'AMAZON', categoryId: 'cat-shopping', matchType: 'CONTAINS', priority: 90 },
	{ pattern: 'FNAC', categoryId: 'cat-shopping', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'DARTY', categoryId: 'cat-shopping', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'ZARA', categoryId: 'cat-shopping', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'H&M', categoryId: 'cat-shopping', matchType: 'CONTAINS', priority: 100 },
	// Taxes
	{ pattern: 'DGFIP', categoryId: 'cat-taxes', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'IMPOT', categoryId: 'cat-taxes', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'TRESOR PUBLIC', categoryId: 'cat-taxes', matchType: 'CONTAINS', priority: 100 },
	// Loan payments
	{ pattern: 'ECH PRET', categoryId: 'cat-loan-payment', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'ECHEANCE PRET', categoryId: 'cat-loan-payment', matchType: 'CONTAINS', priority: 100 },
	// Insurance
	{ pattern: 'MAIF', categoryId: 'cat-insurance', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'MACIF', categoryId: 'cat-insurance', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'AXA', categoryId: 'cat-insurance', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'ALLIANZ', categoryId: 'cat-insurance', matchType: 'CONTAINS', priority: 100 },
	// Health
	{ pattern: 'PHARMACIE', categoryId: 'cat-health', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'CPAM', categoryId: 'cat-health', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'AMELI', categoryId: 'cat-health', matchType: 'CONTAINS', priority: 100 },
	// Utilities
	{ pattern: 'EDF', categoryId: 'cat-utilities', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'ENGIE', categoryId: 'cat-utilities', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'VEOLIA', categoryId: 'cat-utilities', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'FREE MOBILE', categoryId: 'cat-utilities', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'ORANGE', categoryId: 'cat-utilities', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'SFR', categoryId: 'cat-utilities', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'BOUYGUES', categoryId: 'cat-utilities', matchType: 'CONTAINS', priority: 100 },
	// Fees
	{ pattern: 'FRAIS', categoryId: 'cat-fees', matchType: 'CONTAINS', priority: 90 },
	{ pattern: 'COMMISSION', categoryId: 'cat-fees', matchType: 'CONTAINS', priority: 90 },
	{ pattern: 'COTISATION CARTE', categoryId: 'cat-fees', matchType: 'CONTAINS', priority: 100 },
	// Housing
	{ pattern: 'LOYER', categoryId: 'cat-housing', matchType: 'CONTAINS', priority: 100 },
	{ pattern: 'SYNDIC', categoryId: 'cat-housing', matchType: 'CONTAINS', priority: 100 },
	// SCI payments (PRLV to property management company)
	{ pattern: 'SDC 21 RUE GUSTAVE CHARPENT', categoryId: 'cat-housing', matchType: 'CONTAINS', priority: 150 },
];

async function main() {
	console.log('Starting seed...\n');

	// Create banks
	console.log('Creating banks...');
	for (const bank of BANKS) {
		const created = await prisma.bank.upsert({
			where: { id: bank.id },
			update: {
				name: bank.name,
				color: bank.color,
				type: bank.type,
				parserKey: bank.parserKey,
				description: bank.description,
			},
			create: bank,
		});
		console.log(`  ✓ ${created.name} (${created.type})`);
	}

	// Create members
	console.log('\nCreating members...');
	for (const member of MEMBERS) {
		const created = await prisma.member.upsert({
			where: { id: member.id },
			update: { name: member.name, color: member.color },
			create: member,
		});
		console.log(`  ✓ ${created.name}`);
	}

	// Create categories
	console.log('\nCreating categories...');
	for (const category of CATEGORIES) {
		const created = await prisma.category.upsert({
			where: { id: category.id },
			update: {
				name: category.name,
				icon: category.icon,
				color: category.color,
			},
			create: category,
		});
		console.log(`  ✓ ${created.icon} ${created.name}`);
	}

	// Create initial categorization rules
	console.log('\nCreating categorization rules...');
	for (const rule of INITIAL_RULES) {
		// Use deterministic ID based on pattern to allow re-seeding
		const ruleId = `rule-${rule.pattern.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
		await prisma.categoryRule.upsert({
			where: { id: ruleId },
			update: {
				pattern: rule.pattern,
				categoryId: rule.categoryId,
				matchType: rule.matchType,
				priority: rule.priority,
			},
			create: {
				id: ruleId,
				pattern: rule.pattern,
				categoryId: rule.categoryId,
				matchType: rule.matchType,
				priority: rule.priority,
				isActive: true,
			},
		});
	}
	console.log(`  ✓ ${INITIAL_RULES.length} rules created`);

	console.log('\n✅ Seed completed successfully!');
}

main()
	.catch((e) => {
		console.error('Seed error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
