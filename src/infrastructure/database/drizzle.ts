import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import * as schema from './schema';

let client: Client | null = null;
let drizzleDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

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

export function getDb() {
	if (!drizzleDb) {
		drizzleDb = drizzle(getLibSQLClient(), { schema });
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
