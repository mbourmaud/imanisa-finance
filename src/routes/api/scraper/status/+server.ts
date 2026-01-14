import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DATABASE_PATH || './data/imanisa.db';

interface SyncStatusRow {
	id: string;
	source: string;
	last_sync_at: string | null;
	last_sync_status: string;
	last_error: string | null;
	total_syncs: number;
	successful_syncs: number;
	created_at: string;
	updated_at: string;
}

interface SyncStatusResponse {
	source: string;
	lastSyncAt: string | null;
	lastSyncStatus: 'success' | 'failure' | 'pending' | 'running';
	lastError: string | null;
	totalSyncs: number;
	successfulSyncs: number;
	successRate: number;
	daysSinceLastSync: number | null;
	isStale: boolean;
}

function getDaysSince(dateStr: string | null): number | null {
	if (!dateStr) return null;
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export const GET: RequestHandler = async ({ url }) => {
	const source = url.searchParams.get('source');

	let db: Database.Database | null = null;

	try {
		db = new Database(DB_PATH, { readonly: true });

		let rows: SyncStatusRow[];

		if (source) {
			const row = db.prepare('SELECT * FROM sync_status WHERE source = ?').get(source) as SyncStatusRow | undefined;
			rows = row ? [row] : [];
		} else {
			rows = db.prepare('SELECT * FROM sync_status ORDER BY source').all() as SyncStatusRow[];
		}

		const statuses: SyncStatusResponse[] = rows.map((row) => {
			const daysSinceLastSync = getDaysSince(row.last_sync_at);
			const isStale = daysSinceLastSync !== null && daysSinceLastSync > 7;
			const successRate = row.total_syncs > 0 ? (row.successful_syncs / row.total_syncs) * 100 : 0;

			return {
				source: row.source,
				lastSyncAt: row.last_sync_at,
				lastSyncStatus: row.last_sync_status as 'success' | 'failure' | 'pending' | 'running',
				lastError: row.last_error,
				totalSyncs: row.total_syncs,
				successfulSyncs: row.successful_syncs,
				successRate: Math.round(successRate),
				daysSinceLastSync,
				isStale
			};
		});

		// Add default sources if not present
		const knownSources = ['Binance', 'Caisse Epargne Perso', 'Caisse Epargne SCI'];
		const existingSources = new Set(statuses.map((s) => s.source));

		for (const src of knownSources) {
			if (!existingSources.has(src)) {
				statuses.push({
					source: src,
					lastSyncAt: null,
					lastSyncStatus: 'pending',
					lastError: null,
					totalSyncs: 0,
					successfulSyncs: 0,
					successRate: 0,
					daysSinceLastSync: null,
					isStale: true
				});
			}
		}

		// Sort by source name
		statuses.sort((a, b) => a.source.localeCompare(b.source));

		return json({
			success: true,
			statuses,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		return json(
			{
				success: false,
				error: errorMessage,
				statuses: []
			},
			{ status: 500 }
		);
	} finally {
		db?.close();
	}
};
