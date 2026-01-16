/**
 * Test script: Verify all CSV parsers handle signs correctly
 */

import { readFileSync } from 'fs';
import { CaisseEpargneParser } from '../src/infrastructure/parsers/CaisseEpargneParser';
import { CreditMutuelParser } from '../src/infrastructure/parsers/CreditMutuelParser';
import { BoursoramaParser } from '../src/infrastructure/parsers/BoursoramaParser';

const testFiles = [
	{
		name: 'Caisse d\'Épargne',
		path: 'src/tests/fixtures/csv/caisse_epargne.csv',
		parser: new CaisseEpargneParser()
	},
	{
		name: 'Crédit Mutuel',
		path: 'src/tests/fixtures/csv/credit_mutuel.csv',
		parser: new CreditMutuelParser()
	},
	{
		name: 'Boursorama',
		path: 'src/tests/fixtures/csv/boursorama.csv',
		parser: new BoursoramaParser()
	}
];

console.log('🧪 Testing CSV Parsers - Sign Verification\n');
console.log('Expected: Dépenses = NÉGATIF, Revenus = POSITIF\n');
console.log('='.repeat(80));

for (const test of testFiles) {
	console.log(`\n📄 ${test.name}`);
	console.log('-'.repeat(40));

	try {
		const content = readFileSync(test.path, 'utf-8');
		const transactions = test.parser.parse(content);

		if (transactions.length === 0) {
			console.log('  ⚠️  No transactions parsed');
			continue;
		}

		for (const tx of transactions) {
			const sign = tx.amount >= 0 ? '➕' : '➖';
			const type = tx.amount >= 0 ? 'REVENU' : 'DÉPENSE';
			const amountStr = tx.amount.toFixed(2).padStart(10);

			// Check if sign matches expected based on description/category
			let expectedType = 'UNKNOWN';
			const desc = tx.description.toLowerCase();
			const cat = (tx.rawCategory || '').toLowerCase();

			if (desc.includes('salaire') || desc.includes('virement') && !desc.includes('vers') ||
			    desc.includes('remboursement') || cat.includes('revenu') || cat.includes('salaire')) {
				expectedType = 'REVENU';
			} else if (desc.includes('carrefour') || desc.includes('leclerc') || desc.includes('loyer') ||
			           desc.includes('prlv') || desc.includes('cb ') || desc.includes('retrait') ||
			           desc.includes('netflix') || desc.includes('uber') || desc.includes('pharmacie') ||
			           cat.includes('alimentation') || cat.includes('logement')) {
				expectedType = 'DÉPENSE';
			}

			const status = (type === expectedType || expectedType === 'UNKNOWN') ? '✅' : '❌';

			console.log(`  ${status} ${sign} ${amountStr} € | ${tx.description.slice(0, 35).padEnd(35)} | ${type}`);

			if (status === '❌') {
				console.log(`     ⚠️  Expected: ${expectedType}`);
			}
		}

		// Summary
		const positives = transactions.filter(t => t.amount > 0).length;
		const negatives = transactions.filter(t => t.amount < 0).length;
		console.log(`\n  📊 Summary: ${positives} positifs, ${negatives} négatifs`);

	} catch (error) {
		console.log(`  ❌ Error: ${error}`);
	}
}

console.log('\n' + '='.repeat(80));
console.log('Done!\n');
