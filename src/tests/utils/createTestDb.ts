/**
 * Test Database Helper
 *
 * Creates an isolated in-memory SQLite database for testing.
 * Each test can get a fresh database instance without affecting others.
 *
 * Usage:
 *   const { db, cleanup } = await createTestDb();
 *   // ... run tests ...
 *   await cleanup();
 */

import { createClient, type Client } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@infrastructure/database/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface TestDatabase {
	/** Raw libsql client for direct SQL queries */
	client: Client;
	/** Drizzle ORM instance with schema */
	db: ReturnType<typeof drizzle<typeof schema>>;
	/** Cleanup function to close the database */
	cleanup: () => Promise<void>;
}

/**
 * Create a fresh in-memory database for testing
 *
 * @param options.seed - Optional function to seed initial data
 * @returns Test database instance with cleanup function
 */
export async function createTestDb(options?: {
	seed?: (db: ReturnType<typeof drizzle<typeof schema>>) => Promise<void>;
}): Promise<TestDatabase> {
	// Create in-memory database with unique identifier to avoid collisions
	const client = createClient({
		url: ':memory:'
	});

	// Initialize schema
	await initializeSchema(client);

	// Create Drizzle instance
	const db = drizzle(client, { schema });

	// Run seed function if provided
	if (options?.seed) {
		await options.seed(db);
	}

	// Return database with cleanup function
	return {
		client,
		db,
		cleanup: async () => {
			client.close();
		}
	};
}

/**
 * Remove SQL comments from a string
 */
function removeComments(sql: string): string {
	// Remove single-line comments (-- ...)
	return sql
		.split('\n')
		.filter((line) => !line.trim().startsWith('--'))
		.join('\n');
}

/**
 * Initialize the database schema from SQL file
 */
async function initializeSchema(client: Client): Promise<void> {
	// Read schema.sql from infrastructure/database
	const schemaPath = join(__dirname, '../../infrastructure/database/schema.sql');
	let schemaSql = readFileSync(schemaPath, 'utf-8');

	// Remove comment lines first
	schemaSql = removeComments(schemaSql);

	// Split into individual statements
	const statements = schemaSql
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	// Separate CREATE TABLE statements from CREATE INDEX statements
	// This ensures tables are created before indexes that reference them
	const tableStatements = statements.filter((s) => s.toUpperCase().startsWith('CREATE TABLE'));
	const indexStatements = statements.filter((s) => s.toUpperCase().startsWith('CREATE INDEX'));
	const otherStatements = statements.filter(
		(s) => !s.toUpperCase().startsWith('CREATE TABLE') && !s.toUpperCase().startsWith('CREATE INDEX')
	);

	// Execute CREATE TABLE first
	for (const stmt of tableStatements) {
		try {
			await client.execute(stmt);
		} catch (error) {
			console.error('Failed to execute table statement:', stmt.slice(0, 100));
			throw error;
		}
	}

	// Then execute CREATE INDEX
	for (const stmt of indexStatements) {
		try {
			await client.execute(stmt);
		} catch (error) {
			console.error('Failed to execute index statement:', stmt.slice(0, 100));
			throw error;
		}
	}

	// Execute any other statements (triggers, etc.)
	for (const stmt of otherStatements) {
		try {
			await client.execute(stmt);
		} catch (error) {
			console.error('Failed to execute statement:', stmt.slice(0, 100));
			throw error;
		}
	}
}

/**
 * Create test fixtures helper
 *
 * Provides common test data factories for entities, properties, loans, etc.
 */
export const testFixtures = {
	/**
	 * Create a test entity (person, SCI, etc.)
	 */
	entity: (overrides?: Partial<typeof schema.entities.$inferInsert>) => ({
		id: `entity-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		name: 'Test Entity',
		type: 'person' as const,
		email: 'test@example.com',
		color: '#FFD700',
		...overrides
	}),

	/**
	 * Create a test user
	 */
	user: (overrides?: Partial<typeof schema.users.$inferInsert>) => ({
		id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		email: `test-${Date.now()}@example.com`,
		name: 'Test User',
		created_at: new Date().toISOString(),
		...overrides
	}),

	/**
	 * Create a test bank
	 */
	bank: (userId: string, overrides?: Partial<typeof schema.banks.$inferInsert>) => ({
		id: `bank-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		user_id: userId,
		name: 'Test Bank',
		template: 'generic',
		created_at: new Date().toISOString(),
		...overrides
	}),

	/**
	 * Create a test account
	 */
	account: (bankId: string, overrides?: Partial<typeof schema.accounts.$inferInsert>) => ({
		id: `account-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		bank_id: bankId,
		name: 'Test Account',
		type: 'checking',
		balance: 1000,
		currency: 'EUR',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		...overrides
	}),

	/**
	 * Create a test transaction
	 */
	transaction: (accountId: string, overrides?: Partial<typeof schema.transactions.$inferInsert>) => ({
		id: `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		account_id: accountId,
		type: 'debit' as const,
		amount: 100,
		currency: 'EUR',
		description: 'Test Transaction',
		date: new Date().toISOString().split('T')[0],
		imported_at: new Date().toISOString(),
		...overrides
	}),

	/**
	 * Create a test property
	 */
	property: (overrides?: Partial<typeof schema.reProperties.$inferInsert>) => ({
		id: `property-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		name: 'Test Property',
		type: 'apartment' as const,
		category: 'rental_furnished' as const,
		address: '123 Test Street',
		city: 'Test City',
		postal_code: '75001',
		surface_m2: 50,
		purchase_price: 200000,
		estimated_value: 220000,
		...overrides
	}),

	/**
	 * Create a test loan
	 */
	loan: (propertyId?: string, overrides?: Partial<typeof schema.reLoans.$inferInsert>) => ({
		id: `loan-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		name: 'Test Loan',
		property_id: propertyId || null,
		bank_name: 'Test Bank',
		principal_amount: 150000,
		interest_rate: 1.5,
		duration_months: 240,
		start_date: '2020-01-01',
		monthly_payment: 650,
		current_balance: 130000,
		...overrides
	}),

	/**
	 * Create a test data source
	 */
	dataSource: (ownerEntityId: string, overrides?: Partial<typeof schema.dataSources.$inferInsert>) => ({
		id: `ds-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		name: 'Test Data Source',
		type: 'checking',
		owner_entity_id: ownerEntityId,
		url: 'https://example.com/export',
		format: 'csv',
		parser_key: 'credit_mutuel',
		...overrides
	}),

	/**
	 * Create a test investment source
	 */
	investmentSource: (ownerEntityId: string, overrides?: Partial<typeof schema.investmentSources.$inferInsert>) => ({
		id: `is-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		name: 'Test Investment Source',
		type: 'pea' as const,
		owner_entity_id: ownerEntityId,
		url: 'https://example.com/portfolio',
		format: 'xlsx',
		parser_key: 'bourse_direct' as const,
		...overrides
	}),

	/**
	 * Create a test investment position
	 */
	investmentPosition: (sourceId: string, overrides?: Partial<typeof schema.investmentPositions.$inferInsert>) => ({
		id: `pos-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		source_id: sourceId,
		symbol: 'TEST',
		isin: 'FR0000000000',
		quantity: 10,
		avg_buy_price: 100,
		current_price: 110,
		current_value: 1100,
		gain_loss: 100,
		gain_loss_percent: 10,
		last_updated: new Date().toISOString(),
		...overrides
	}),

	/**
	 * Create a test category
	 */
	category: (overrides?: Partial<typeof schema.categories.$inferInsert>) => ({
		id: `cat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		name: 'Test Category',
		icon: '📦',
		color: '#3B82F6',
		...overrides
	})
};
