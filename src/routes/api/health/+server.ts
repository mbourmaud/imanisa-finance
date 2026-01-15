import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

interface SyncStatusRow {
	source: string;
	last_sync_at: string | null;
	last_sync_status: string;
}

interface HealthResponse {
	status: 'healthy' | 'unhealthy';
	timestamp: string;
	database: {
		status: 'connected' | 'disconnected' | 'query_failed';
		error?: string;
	};
	lastSync: {
		source: string;
		syncedAt: string | null;
		status: string;
	} | null;
	telegram: {
		configured: boolean;
	};
}

export const GET: RequestHandler = async () => {
	const dbPath = env.DATABASE_PATH || './data/imanisa.db';
	let db: Database.Database | null = null;

	try {
		db = new Database(dbPath, { readonly: true });

		// Test database connection
		const dbTest = db.prepare('SELECT 1 as ok').get() as { ok: number } | undefined;
		if (dbTest?.ok !== 1) {
			return json(
				{
					status: 'unhealthy',
					timestamp: new Date().toISOString(),
					database: { status: 'query_failed' },
					lastSync: null,
					telegram: { configured: false }
				} satisfies HealthResponse,
				{ status: 500 }
			);
		}

		// Get last sync status
		const lastSyncRow = db
			.prepare(
				`SELECT source, last_sync_at, last_sync_status
				 FROM sync_status
				 ORDER BY last_sync_at DESC
				 LIMIT 1`
			)
			.get() as SyncStatusRow | undefined;

		const lastSync = lastSyncRow
			? {
					source: lastSyncRow.source,
					syncedAt: lastSyncRow.last_sync_at,
					status: lastSyncRow.last_sync_status
				}
			: null;

		// Check Telegram configuration
		const telegramConfigured = !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);

		const response: HealthResponse = {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			database: { status: 'connected' },
			lastSync,
			telegram: { configured: telegramConfigured }
		};

		return json(response);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		return json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				database: {
					status: 'disconnected',
					error: errorMessage
				},
				lastSync: null,
				telegram: { configured: false }
			} satisfies HealthResponse,
			{ status: 500 }
		);
	} finally {
		db?.close();
	}
};
