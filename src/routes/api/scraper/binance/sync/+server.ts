import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { BinanceService } from '@infrastructure/scrapers/BinanceService';
import { TelegramService } from '$lib/scraper/utils/telegram';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.DATABASE_PATH || './data/imanisa.db';

interface SyncStatusRow {
	id: string;
	source: string;
	last_sync_at: string | null;
	last_sync_status: string;
	last_error: string | null;
}

function getOrCreateSyncStatus(db: Database.Database, source: string): SyncStatusRow {
	const existing = db.prepare('SELECT * FROM sync_status WHERE source = ?').get(source) as SyncStatusRow | undefined;

	if (existing) {
		return existing;
	}

	const id = `sync-${randomUUID()}`;
	db.prepare(`
		INSERT INTO sync_status (id, source, last_sync_status, created_at, updated_at)
		VALUES (?, ?, 'pending', datetime('now'), datetime('now'))
	`).run(id, source);

	return db.prepare('SELECT * FROM sync_status WHERE source = ?').get(source) as SyncStatusRow;
}

function updateSyncStatus(
	db: Database.Database,
	source: string,
	status: 'success' | 'failure' | 'running',
	error?: string
): void {
	const now = new Date().toISOString();

	if (status === 'running') {
		db.prepare(`
			UPDATE sync_status
			SET last_sync_status = ?, updated_at = ?
			WHERE source = ?
		`).run(status, now, source);
	} else {
		db.prepare(`
			UPDATE sync_status
			SET last_sync_at = ?,
				last_sync_status = ?,
				last_error = ?,
				total_syncs = total_syncs + 1,
				successful_syncs = successful_syncs + CASE WHEN ? = 'success' THEN 1 ELSE 0 END,
				updated_at = ?
			WHERE source = ?
		`).run(now, status, error || null, status, now, source);
	}
}

export const POST: RequestHandler = async () => {
	const apiKey = env.BINANCE_API_KEY;
	const apiSecret = env.BINANCE_API_SECRET;
	const telegramToken = env.TELEGRAM_BOT_TOKEN;
	const telegramChatId = env.TELEGRAM_CHAT_ID;

	if (!apiKey || !apiSecret) {
		return json(
			{
				success: false,
				error: 'Binance API not configured. Set BINANCE_API_KEY and BINANCE_API_SECRET in .env'
			},
			{ status: 400 }
		);
	}

	const binance = new BinanceService(apiKey, apiSecret);
	const telegram = new TelegramService(telegramToken, telegramChatId);

	let db: Database.Database | null = null;

	try {
		db = new Database(DB_PATH);
		const source = 'Binance';

		// Initialize sync status
		getOrCreateSyncStatus(db, source);
		updateSyncStatus(db, source, 'running');

		// Notify start
		await telegram.notifyScraperStart(source);

		// Run scraper
		const result = await binance.scrape();

		if (result.success && result.data) {
			// Update sync status
			updateSyncStatus(db, source, 'success');

			// Build summary for notification
			const spotTotal = result.data.spotBalances.reduce((sum, b) => {
				const price = result.data!.prices.get(b.asset) || 0;
				return sum + b.total * price;
			}, 0);

			const earnTotal = result.data.earnBalances.reduce((sum, b) => {
				const price = result.data!.prices.get(b.asset) || 0;
				return sum + b.total * price;
			}, 0);

			const details = [
				`Spot: ${spotTotal.toFixed(2)} EUR (${result.data.spotBalances.length} assets)`,
				`Earn: ${earnTotal.toFixed(2)} EUR (${result.data.earnBalances.length} assets)`,
				`Total: ${result.data.totalInEur.toFixed(2)} EUR`
			].join('\n');

			await telegram.notifyScraperSuccess(source, details);

			return json({
				success: true,
				data: {
					spotBalances: result.data.spotBalances,
					earnBalances: result.data.earnBalances,
					totalInEur: result.data.totalInEur,
					assetsCount: result.data.spotBalances.length + result.data.earnBalances.length
				},
				timestamp: result.timestamp
			});
		} else {
			// Update sync status with error
			updateSyncStatus(db, source, 'failure', result.error);
			await telegram.notifyScraperFailure(source, result.error || 'Unknown error', 1, 1);

			return json(
				{
					success: false,
					error: result.error,
					timestamp: result.timestamp
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		if (db) {
			updateSyncStatus(db, 'Binance', 'failure', errorMessage);
		}

		await telegram.notifyScraperFailure('Binance', errorMessage, 1, 1);

		return json(
			{
				success: false,
				error: errorMessage
			},
			{ status: 500 }
		);
	} finally {
		db?.close();
	}
};
