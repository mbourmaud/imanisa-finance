import { describe, it, expect } from 'vitest';
import { TransactionType, TransactionTypeLabels } from './TransactionType';

describe('TransactionType', () => {
	describe('enum values', () => {
		it('should have all expected transaction types', () => {
			expect(Object.values(TransactionType)).toMatchInlineSnapshot(`
				[
				  "INCOME",
				  "EXPENSE",
				  "TRANSFER",
				]
			`);
		});

		it('should have 3 transaction types', () => {
			expect(Object.keys(TransactionType)).toHaveLength(3);
		});
	});

	describe('TransactionTypeLabels', () => {
		it('should have label for each transaction type', () => {
			const types = Object.values(TransactionType);
			types.forEach((type) => {
				expect(TransactionTypeLabels[type]).toBeDefined();
				expect(typeof TransactionTypeLabels[type]).toBe('string');
			});
		});

		it('should have French labels', () => {
			expect(TransactionTypeLabels[TransactionType.INCOME]).toBe('Revenu');
			expect(TransactionTypeLabels[TransactionType.EXPENSE]).toBe('Dépense');
			expect(TransactionTypeLabels[TransactionType.TRANSFER]).toBe('Virement');
		});

		it('should map all labels correctly', () => {
			expect(TransactionTypeLabels).toMatchInlineSnapshot(`
				{
				  "EXPENSE": "Dépense",
				  "INCOME": "Revenu",
				  "TRANSFER": "Virement",
				}
			`);
		});
	});
});
