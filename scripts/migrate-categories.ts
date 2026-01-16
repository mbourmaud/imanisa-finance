/**
 * Migration script: Populate categories table from transactions.category
 * and link transactions via transaction_categories
 */

import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const dbPath = process.env.DATABASE_PATH || `${process.cwd()}/data/imanisa.db`;
const client = createClient({ url: `file:${dbPath}` });

// Default icons and colors for common categories
const categoryStyles: Record<string, { icon: string; color: string }> = {
	'Alimentation': { icon: '🍽️', color: '#F59E0B' },
	'Banque et assurances': { icon: '🏦', color: '#6366F1' },
	'Logement - maison': { icon: '🏠', color: '#8B5CF6' },
	'Loisirs et vacances': { icon: '🎉', color: '#EC4899' },
	'Transports': { icon: '🚗', color: '#3B82F6' },
	'Sante': { icon: '💊', color: '#10B981' },
	'Shopping et services': { icon: '🛍️', color: '#F472B6' },
	'Impots et taxes': { icon: '📋', color: '#EF4444' },
	'Revenus et rentrees d\'argent': { icon: '💰', color: '#22C55E' },
	'Prets': { icon: '🏛️', color: '#64748B' },
	'Transaction exclue': { icon: '🚫', color: '#94A3B8' },
	'A categoriser - rentree d\'argent': { icon: '❓', color: '#22C55E' },
	'A categoriser - sortie d\'argent': { icon: '❓', color: '#EF4444' },
	'Frais et extournes': { icon: '💸', color: '#F97316' },
	'Virement': { icon: '↔️', color: '#0EA5E9' },
	'Remise virement': { icon: '↩️', color: '#14B8A6' },
	'Prelevement SDD': { icon: '📤', color: '#A855F7' },
	'TRANSFER': { icon: '🔄', color: '#6B7280' },
	'INTEREST': { icon: '📈', color: '#84CC16' },
};

const defaultStyle = { icon: '📁', color: '#6B7280' };

async function migrate() {
	console.log('🚀 Starting category migration...\n');

	// 1. Get all unique categories from transactions
	const result = await client.execute(`
		SELECT DISTINCT category
		FROM transactions
		WHERE category IS NOT NULL AND category != ''
		ORDER BY category
	`);

	const rawCategories = result.rows.map(r => r.category as string);
	console.log(`Found ${rawCategories.length} unique category strings\n`);

	// 2. Parse into parent/child structure
	const categoryMap = new Map<string, string>(); // name -> id
	const parentCategories = new Set<string>();
	const childCategories: Array<{ parent: string; child: string }> = [];

	for (const cat of rawCategories) {
		if (cat.includes(' > ')) {
			const [parent, child] = cat.split(' > ');
			parentCategories.add(parent);
			childCategories.push({ parent, child });
		} else {
			parentCategories.add(cat);
		}
	}

	// 3. Clear existing data
	console.log('Clearing existing categories and links...');
	await client.execute('DELETE FROM transaction_categories');
	await client.execute('DELETE FROM categories');

	// 4. Insert parent categories
	console.log('\n📁 Creating parent categories...');
	for (const name of parentCategories) {
		const id = randomUUID();
		const style = categoryStyles[name] || defaultStyle;

		await client.execute({
			sql: `INSERT INTO categories (id, name, parent_id, icon, color) VALUES (?, ?, NULL, ?, ?)`,
			args: [id, name, style.icon, style.color]
		});

		categoryMap.set(name, id);
		console.log(`  ✓ ${name}`);
	}

	// 5. Insert child categories
	console.log('\n📂 Creating sub-categories...');
	for (const { parent, child } of childCategories) {
		const id = randomUUID();
		const parentId = categoryMap.get(parent);
		const parentStyle = categoryStyles[parent] || defaultStyle;

		await client.execute({
			sql: `INSERT INTO categories (id, name, parent_id, icon, color) VALUES (?, ?, ?, ?, ?)`,
			args: [id, child, parentId, parentStyle.icon, parentStyle.color]
		});

		// Store with full path for lookup
		categoryMap.set(`${parent} > ${child}`, id);
		console.log(`  ✓ ${parent} > ${child}`);
	}

	// 6. Link transactions to categories
	console.log('\n🔗 Linking transactions to categories...');

	const transactions = await client.execute(`
		SELECT id, category
		FROM transactions
		WHERE category IS NOT NULL AND category != ''
	`);

	let linked = 0;
	for (const tx of transactions.rows) {
		const txId = tx.id as string;
		const catString = tx.category as string;

		// Try to find exact match first (for "Parent > Child")
		let categoryId = categoryMap.get(catString);

		// If not found, try parent only
		if (!categoryId && !catString.includes(' > ')) {
			categoryId = categoryMap.get(catString);
		}

		if (categoryId) {
			await client.execute({
				sql: `INSERT INTO transaction_categories (transaction_id, category_id, source, confidence) VALUES (?, ?, 'bank', 1.0)`,
				args: [txId, categoryId]
			});
			linked++;
		}
	}

	console.log(`  ✓ Linked ${linked} transactions\n`);

	// 7. Summary
	const catCount = await client.execute('SELECT COUNT(*) as count FROM categories');
	const linkCount = await client.execute('SELECT COUNT(*) as count FROM transaction_categories');

	console.log('✅ Migration complete!');
	console.log(`   Categories: ${catCount.rows[0].count}`);
	console.log(`   Transaction links: ${linkCount.rows[0].count}`);

	client.close();
}

migrate().catch(console.error);
