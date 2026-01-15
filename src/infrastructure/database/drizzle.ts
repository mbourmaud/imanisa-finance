import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema';

const __dirname = dirname(fileURLToPath(import.meta.url));

let client: Client | null = null;
let drizzleDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let initializationPromise: Promise<void> | null = null;

function getLibSQLClient(): Client {
	if (!client) {
		const tursoUrl = process.env.TURSO_URL;
		const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

		if (tursoUrl && tursoAuthToken) {
			client = createClient({
				url: tursoUrl,
				authToken: tursoAuthToken
			});
		} else {
			const dbPath = process.env.DATABASE_PATH || `${process.cwd()}/data/imanisa.db`;
			client = createClient({
				url: `file:${dbPath}`
			});
		}
	}
	return client;
}

async function initializeSchema(db: Client): Promise<void> {
	// Check if schema is already initialized by checking for a core table
	try {
		await db.execute('SELECT 1 FROM users LIMIT 1');
		// Schema already exists
		return;
	} catch {
		// Table doesn't exist, need to initialize schema
	}

	const schemaPath = join(__dirname, 'schema.sql');
	const schemaSql = readFileSync(schemaPath, 'utf-8');

	// Remove SQL comments (lines starting with --)
	const sqlWithoutComments = schemaSql
		.split('\n')
		.filter((line) => !line.trim().startsWith('--'))
		.join('\n');

	const statements = sqlWithoutComments
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	for (const stmt of statements) {
		try {
			await db.execute(stmt);
		} catch (error) {
			// Ignore "table already exists" or "index already exists" errors
			const errorMessage = String(error);
			if (errorMessage.includes('already exists')) {
				continue;
			}
			console.error('Failed to execute schema statement:', stmt.slice(0, 100));
			throw error;
		}
	}
}

export async function getDb() {
	const libsqlClient = getLibSQLClient();

	// Use a promise to prevent concurrent initializations
	if (!initializationPromise) {
		initializationPromise = initializeSchema(libsqlClient).catch((error) => {
			// Reset the promise so we can retry on next call
			initializationPromise = null;
			throw error;
		});
	}
	await initializationPromise;

	if (!drizzleDb) {
		drizzleDb = drizzle(libsqlClient, { schema });
	}
	return drizzleDb;
}

export function closeDb(): void {
	if (client) {
		client.close();
		client = null;
		drizzleDb = null;
	}
}

export { schema };
export type DrizzleDb = ReturnType<typeof getDb>;
