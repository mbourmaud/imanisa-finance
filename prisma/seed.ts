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
	// Income
	{ id: 'cat-salary', name: 'Salaire', icon: '💰', color: '#10B981' },
	{ id: 'cat-freelance', name: 'Freelance', icon: '💼', color: '#34D399' },
	{ id: 'cat-dividends', name: 'Dividendes', icon: '📈', color: '#6EE7B7' },
	{ id: 'cat-rental-income', name: 'Revenus locatifs', icon: '🏠', color: '#A7F3D0' },
	{ id: 'cat-refund', name: 'Remboursement', icon: '↩️', color: '#D1FAE5' },
	{ id: 'cat-other-income', name: 'Autres revenus', icon: '💵', color: '#ECFDF5' },
	// Expenses
	{ id: 'cat-housing', name: 'Logement', icon: '🏠', color: '#EF4444' },
	{ id: 'cat-utilities', name: 'Charges', icon: '💡', color: '#F97316' },
	{ id: 'cat-groceries', name: 'Courses', icon: '🛒', color: '#FB923C' },
	{ id: 'cat-restaurants', name: 'Restaurants', icon: '🍽️', color: '#FDBA74' },
	{ id: 'cat-transport', name: 'Transport', icon: '🚗', color: '#3B82F6' },
	{ id: 'cat-health', name: 'Santé', icon: '🏥', color: '#EC4899' },
	{ id: 'cat-insurance', name: 'Assurance', icon: '🛡️', color: '#8B5CF6' },
	{ id: 'cat-subscriptions', name: 'Abonnements', icon: '📱', color: '#6366F1' },
	{ id: 'cat-shopping', name: 'Shopping', icon: '🛍️', color: '#A855F7' },
	{ id: 'cat-leisure', name: 'Loisirs', icon: '🎮', color: '#D946EF' },
	{ id: 'cat-travel', name: 'Voyages', icon: '✈️', color: '#14B8A6' },
	{ id: 'cat-education', name: 'Éducation', icon: '📚', color: '#0EA5E9' },
	{ id: 'cat-taxes', name: 'Impôts', icon: '🏛️', color: '#64748B' },
	{ id: 'cat-fees', name: 'Frais bancaires', icon: '🏦', color: '#94A3B8' },
	{ id: 'cat-savings', name: 'Épargne', icon: '🐷', color: '#22C55E' },
	{ id: 'cat-investment', name: 'Investissement', icon: '📊', color: '#16A34A' },
	{ id: 'cat-loan-payment', name: 'Crédit', icon: '🏦', color: '#DC2626' },
	{ id: 'cat-other-expense', name: 'Autres dépenses', icon: '📦', color: '#CBD5E1' },
	// Special
	{ id: 'cat-transfer', name: 'Virement interne', icon: '🔄', color: '#9CA3AF' },
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
