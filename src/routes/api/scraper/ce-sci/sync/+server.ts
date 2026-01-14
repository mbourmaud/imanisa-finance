import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { createCESCIService } from '@infrastructure/scrapers/CaisseEpargneService';
import { TelegramService } from '$lib/scraper/utils/telegram';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.DATABASE_PATH || './data/imanisa.db';
const SOURCE = 'CE SCI';

interface SyncStatusRow {
	id: string;
	source: string;
	last_sync_at: string | null;
	last_sync_status: string;
	last_error: string | null;
}

function getOrCreateSyncStatus(db: Database.Database, source: string): SyncStatusRow {
	const existing = db.prepare('SELECT * FROM sync_status WHERE source = ?').get(source) as
		| SyncStatusRow
		| undefined;

	if (existing) {
		return existing;
	}

	const id = `sync-${randomUUID()}`;
	db.prepare(
		`
		INSERT INTO sync_status (id, source, last_sync_status, created_at, updated_at)
		VALUES (?, ?, 'pending', datetime('now'), datetime('now'))
	`
	).run(id, source);

	return db.prepare('SELECT * FROM sync_status WHERE source = ?').get(source) as SyncStatusRow;
}

function updateSyncStatus(
	db: Database.Database,
	source: string,
	status: 'success' | 'failure' | 'running' | 'pending_2fa',
	error?: string
): void {
	const now = new Date().toISOString();

	if (status === 'running') {
		db.prepare(
			`
			UPDATE sync_status
			SET last_sync_status = ?, updated_at = ?
			WHERE source = ?
		`
		).run(status, now, source);
	} else {
		db.prepare(
			`
			UPDATE sync_status
			SET last_sync_at = ?,
				last_sync_status = ?,
				last_error = ?,
				total_syncs = total_syncs + 1,
				successful_syncs = successful_syncs + CASE WHEN ? = 'success' THEN 1 ELSE 0 END,
				updated_at = ?
			WHERE source = ?
		`
		).run(now, status, error || null, status, now, source);
	}
}

export const POST: RequestHandler = async () => {
	const username = env.CE_SCI_USERNAME;
	const password = env.CE_SCI_PASSWORD;
	const telegramToken = env.TELEGRAM_BOT_TOKEN;
	const telegramChatId = env.TELEGRAM_CHAT_ID;

	if (!username || !password) {
		return json(
			{
				success: false,
				error: 'CE SCI non configuré. Définissez CE_SCI_USERNAME et CE_SCI_PASSWORD dans .env'
			},
			{ status: 400 }
		);
	}

	const ceService = createCESCIService(username, password);
	const telegram = new TelegramService(telegramToken, telegramChatId);

	let db: Database.Database | null = null;

	try {
		db = new Database(DB_PATH);

		// Initialize sync status
		getOrCreateSyncStatus(db, SOURCE);
		updateSyncStatus(db, SOURCE, 'running');

		// Notify start
		await telegram.notifyScraperStart(SOURCE);

		// Run scraper
		const result = await ceService.scrape();

		if (result.success && result.data) {
			// Update sync status
			updateSyncStatus(db, SOURCE, 'success');

			// Build summary for notification
			const accountsSummary = result.data.accounts
				.map((acc) => `${acc.name}: ${acc.balance.toFixed(2)} ${acc.currency}`)
				.join('\n');

			const details = [
				`Comptes: ${result.data.accounts.length}`,
				accountsSummary,
				`Total: ${result.data.totalBalance.toFixed(2)} EUR`
			].join('\n');

			await telegram.notifyScraperSuccess(SOURCE, details);

			return json({
				success: true,
				data: {
					accounts: result.data.accounts,
					totalBalance: result.data.totalBalance,
					accountsCount: result.data.accounts.length
				},
				timestamp: result.timestamp
			});
		} else {
			// Check for 2FA requirement
			const requires2FA = result.data && 'requires2FA' in result.data && result.data.requires2FA;

			if (requires2FA) {
				// Special handling for 2FA - notify user
				updateSyncStatus(db, SOURCE, 'pending_2fa', 'Validation mobile requise');
				await telegram.notify2FARequired(SOURCE);

				return json(
					{
						success: false,
						error: 'Validation mobile requise - veuillez confirmer sur votre application',
						requires2FA: true,
						status: 'pending_2fa'
					},
					{ status: 202 } // Accepted but pending
				);
			}

			// Update sync status with error
			updateSyncStatus(db, SOURCE, 'failure', result.error);
			await telegram.notifyScraperFailure(SOURCE, result.error || 'Erreur inconnue', 1, 1);

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
		const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

		if (db) {
			updateSyncStatus(db, SOURCE, 'failure', errorMessage);
		}

		await telegram.notifyScraperFailure(SOURCE, errorMessage, 1, 1);

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
