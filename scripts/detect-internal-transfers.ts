/**
 * Script to detect and categorize internal transfers
 *
 * Internal transfers are pairs of transactions with:
 * - Same date
 * - Same absolute amount (but opposite signs)
 * - Different accounts
 */

import { createClient } from '@libsql/client';

const dbPath = process.env.DATABASE_PATH || `${process.cwd()}/data/imanisa.db`;
const client = createClient({ url: `file:${dbPath}` });

async function detectAndCategorize() {
	console.log('🔍 Detecting internal transfers...\n');

	// Get the "Virement interne" category ID
	const catResult = await client.execute(`
		SELECT id FROM categories WHERE name = 'Virement interne'
	`);

	if (catResult.rows.length === 0) {
		console.log('❌ Category "Virement interne" not found!');
		return;
	}

	const internalTransferCategoryId = catResult.rows[0].id as string;
	console.log(`✓ Found category "Virement interne": ${internalTransferCategoryId}\n`);

	// Find all pairs of internal transfers
	const pairsResult = await client.execute(`
		SELECT DISTINCT
			t1.id as id1,
			t2.id as id2,
			t1.date,
			t1.description as desc1,
			t2.description as desc2,
			ABS(t1.amount) as amount,
			t1.account_id as acc1,
			t2.account_id as acc2
		FROM transactions t1
		JOIN transactions t2 ON
			t1.date = t2.date
			AND ABS(t1.amount) = ABS(t2.amount)
			AND t1.amount = -t2.amount
			AND t1.account_id != t2.account_id
			AND t1.id < t2.id
		WHERE ABS(t1.amount) >= 1
		ORDER BY t1.date DESC
	`);

	console.log(`Found ${pairsResult.rows.length} pairs of potential internal transfers\n`);

	if (pairsResult.rows.length === 0) {
		console.log('No internal transfers to categorize.');
		return;
	}

	// Collect all transaction IDs to categorize
	const transactionIds = new Set<string>();
	for (const row of pairsResult.rows) {
		transactionIds.add(row.id1 as string);
		transactionIds.add(row.id2 as string);
	}

	console.log(`Total transactions to categorize: ${transactionIds.size}\n`);

	// Check which ones are already categorized
	const existingResult = await client.execute(`
		SELECT transaction_id FROM transaction_categories
		WHERE transaction_id IN (${Array.from(transactionIds).map(() => '?').join(',')})
	`, Array.from(transactionIds));

	const alreadyCategorized = new Set(existingResult.rows.map(r => r.transaction_id as string));
	console.log(`Already categorized: ${alreadyCategorized.size}`);

	// Filter out already categorized
	const toCategorize = Array.from(transactionIds).filter(id => !alreadyCategorized.has(id));
	console.log(`New to categorize: ${toCategorize.length}\n`);

	if (toCategorize.length === 0) {
		console.log('All internal transfers are already categorized.');
		return;
	}

	// Insert category assignments
	let inserted = 0;
	for (const txId of toCategorize) {
		try {
			await client.execute({
				sql: `INSERT INTO transaction_categories (transaction_id, category_id, source, confidence)
				      VALUES (?, ?, 'auto', 0.9)`,
				args: [txId, internalTransferCategoryId]
			});
			inserted++;
		} catch (error) {
			// Ignore duplicates
		}
	}

	console.log(`✅ Categorized ${inserted} transactions as "Virement interne"\n`);

	// Show some examples
	console.log('Examples of detected transfers:');
	console.log('-'.repeat(80));

	for (const row of pairsResult.rows.slice(0, 10)) {
		console.log(`${row.date} | ${(row.amount as number).toFixed(2)}€`);
		console.log(`  ← ${(row.desc1 as string).slice(0, 40)} (${row.acc1})`);
		console.log(`  → ${(row.desc2 as string).slice(0, 40)} (${row.acc2})`);
		console.log('');
	}

	client.close();
}

detectAndCategorize().catch(console.error);
