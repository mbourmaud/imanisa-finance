/**
 * Prisma Seed Script
 * Seeds the database with initial data: banks and household members
 */

import { PrismaClient, BankType } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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
