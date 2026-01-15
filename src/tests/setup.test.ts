/**
 * Test Setup Verification
 *
 * This test file verifies that the testing infrastructure is properly configured.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, testFixtures, type TestDatabase } from './utils';

describe('Test Infrastructure', () => {
	let testDb: TestDatabase;

	beforeAll(async () => {
		testDb = await createTestDb();
	});

	afterAll(async () => {
		await testDb.cleanup();
	});

	describe('Vitest Setup', () => {
		it('should run a basic test', () => {
			expect(1 + 1).toBe(2);
		});

		it('should have globals enabled', () => {
			// If globals are enabled, expect/describe/it are available without imports
			expect(typeof expect).toBe('function');
		});
	});

	describe('Test Database', () => {
		it('should create an in-memory database', () => {
			expect(testDb.client).toBeDefined();
			expect(testDb.db).toBeDefined();
		});

		it('should have schema tables created', async () => {
			// Query sqlite_master to verify tables exist
			const result = await testDb.client.execute(
				"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
			);

			const tableNames = result.rows.map((row) => row.name as string);

			// Check some key tables exist
			expect(tableNames).toContain('users');
			expect(tableNames).toContain('banks');
			expect(tableNames).toContain('accounts');
			expect(tableNames).toContain('transactions');
			expect(tableNames).toContain('entities');
			expect(tableNames).toContain('re_properties');
			expect(tableNames).toContain('re_loans');
			expect(tableNames).toContain('data_sources');
			expect(tableNames).toContain('investment_sources');
			expect(tableNames).toContain('categories');
		});

		it('should support basic CRUD operations', async () => {
			// Insert a test entity
			const entity = testFixtures.entity({
				id: 'test-entity-1',
				name: 'Test Person',
				type: 'person',
				color: '#FF0000'
			});

			await testDb.client.execute({
				sql: `INSERT INTO entities (id, name, type, color) VALUES (?, ?, ?, ?)`,
				args: [entity.id, entity.name, entity.type, entity.color]
			});

			// Read back
			const result = await testDb.client.execute({
				sql: 'SELECT * FROM entities WHERE id = ?',
				args: [entity.id]
			});

			expect(result.rows).toHaveLength(1);
			expect(result.rows[0].name).toBe('Test Person');

			// Delete
			await testDb.client.execute({
				sql: 'DELETE FROM entities WHERE id = ?',
				args: [entity.id]
			});

			// Verify deleted
			const afterDelete = await testDb.client.execute({
				sql: 'SELECT * FROM entities WHERE id = ?',
				args: [entity.id]
			});

			expect(afterDelete.rows).toHaveLength(0);
		});
	});

	describe('Test Fixtures', () => {
		it('should generate unique entity IDs', () => {
			const entity1 = testFixtures.entity();
			const entity2 = testFixtures.entity();

			expect(entity1.id).not.toBe(entity2.id);
		});

		it('should allow overriding fixture properties', () => {
			const entity = testFixtures.entity({
				name: 'Custom Name',
				type: 'sci'
			});

			expect(entity.name).toBe('Custom Name');
			expect(entity.type).toBe('sci');
		});

		it('should generate fixtures for all entity types', () => {
			// Entity
			const entity = testFixtures.entity();
			expect(entity.id).toContain('entity-');
			expect(entity.name).toBe('Test Entity');

			// User
			const user = testFixtures.user();
			expect(user.id).toContain('user-');
			expect(user.email).toContain('@example.com');

			// Bank
			const bank = testFixtures.bank('user-123');
			expect(bank.id).toContain('bank-');
			expect(bank.user_id).toBe('user-123');

			// Account
			const account = testFixtures.account('bank-123');
			expect(account.id).toContain('account-');
			expect(account.bank_id).toBe('bank-123');

			// Transaction
			const tx = testFixtures.transaction('account-123');
			expect(tx.id).toContain('tx-');
			expect(tx.account_id).toBe('account-123');

			// Property
			const property = testFixtures.property();
			expect(property.id).toContain('property-');
			expect(property.type).toBe('apartment');

			// Loan
			const loan = testFixtures.loan('property-123');
			expect(loan.id).toContain('loan-');
			expect(loan.property_id).toBe('property-123');

			// Data Source
			const dataSource = testFixtures.dataSource('entity-123');
			expect(dataSource.id).toContain('ds-');
			expect(dataSource.owner_entity_id).toBe('entity-123');

			// Investment Source
			const investmentSource = testFixtures.investmentSource('entity-123');
			expect(investmentSource.id).toContain('is-');
			expect(investmentSource.type).toBe('pea');

			// Investment Position
			const position = testFixtures.investmentPosition('source-123');
			expect(position.id).toContain('pos-');
			expect(position.source_id).toBe('source-123');

			// Category
			const category = testFixtures.category();
			expect(category.id).toContain('cat-');
			expect(category.name).toBe('Test Category');
		});
	});
});
