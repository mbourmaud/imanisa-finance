import { createClient, type Client, type ResultSet, type InArgs } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let client: Client | null = null;
let initialized = false;

export async function getDatabase(): Promise<Client> {
	if (!client) {
		const tursoUrl = process.env.TURSO_URL;
		const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

		if (tursoUrl && tursoAuthToken) {
			client = createClient({
				url: tursoUrl,
				authToken: tursoAuthToken
			});
		} else {
			const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'imanisa.db');
			client = createClient({
				url: `file:${dbPath}`
			});
		}
	}

	if (!initialized) {
		await initializeSchema(client);
		initialized = true;
	}

	return client;
}

async function initializeSchema(db: Client): Promise<void> {
	const schemaPath = join(__dirname, 'schema.sql');
	const schema = readFileSync(schemaPath, 'utf-8');

	const statements = schema
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !s.startsWith('--'));

	for (const stmt of statements) {
		try {
			await db.execute(stmt);
		} catch (error) {
			console.error('Failed to execute schema statement:', stmt.slice(0, 100));
			throw error;
		}
	}
}

export async function closeDatabase(): Promise<void> {
	if (client) {
		client.close();
		client = null;
		initialized = false;
	}
}

export async function execute(sql: string, args?: InArgs): Promise<ResultSet> {
	const db = await getDatabase();
	return db.execute({ sql, args: args || [] });
}

export async function executeMany(statements: Array<{ sql: string; args?: InArgs }>): Promise<void> {
	const db = await getDatabase();
	await db.batch(statements.map((s) => ({ sql: s.sql, args: s.args || [] })));
}

export type { Client, ResultSet, InArgs };
