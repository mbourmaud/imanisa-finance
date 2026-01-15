/**
 * Scraper Scheduler Service
 * Handles automatic scheduling and retry logic for data scrapers
 */

import cron, { type ScheduledTask } from 'node-cron';
import { BinanceService } from '@infrastructure/scrapers/BinanceService';
import {
	createCEPersoService,
	createCESCIService,
	type CEScraperData
} from '@infrastructure/scrapers/CaisseEpargneService';
import { TelegramService } from './utils/telegram';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { env } from '$env/dynamic/private';

const DB_PATH = process.env.DATABASE_PATH || './data/imanisa.db';

interface RetryConfig {
	maxAttempts: number;
	delaysMs: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxAttempts: 3,
	delaysMs: [
		5 * 60 * 1000, // 5 minutes after 1st failure
		15 * 60 * 1000, // 15 minutes after 2nd failure
		30 * 60 * 1000 // 30 minutes after 3rd failure (not used, but kept for consistency)
	]
};

// 2FA retry configuration
const TWO_FA_RETRY_DELAY_MS = 2.5 * 60 * 1000; // 2.5 minutes after mobile validation detection

interface SchedulerConfig {
	binanceCron: string;
	ceCron: string;
	enabled: boolean;
}

let schedulerInstance: ScraperScheduler | null = null;

export class ScraperScheduler {
	private tasks: Map<string, ScheduledTask> = new Map();
	private config: SchedulerConfig;
	private telegram: TelegramService;

	constructor(config?: Partial<SchedulerConfig>) {
		this.config = {
			binanceCron: config?.binanceCron || process.env.SCRAPER_CRON || '0 8 * * 1', // Default: Monday 8:00 AM
			ceCron: config?.ceCron || process.env.CE_SCRAPER_CRON || '0 7 * * 1', // Default: Monday 7:00 AM
			enabled: config?.enabled ?? true
		};

		const telegramToken = env?.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
		const telegramChatId = env?.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
		this.telegram = new TelegramService(telegramToken, telegramChatId);
	}

	/**
	 * Start all scheduled tasks
	 */
	start(): void {
		if (!this.config.enabled) {
			console.log('[Scheduler] Scheduler is disabled');
			return;
		}

		this.scheduleBinance();
		this.scheduleCE();
		console.log('[Scheduler] All tasks scheduled');
	}

	/**
	 * Stop all scheduled tasks
	 */
	stop(): void {
		for (const [name, task] of this.tasks) {
			task.stop();
			console.log(`[Scheduler] Stopped task: ${name}`);
		}
		this.tasks.clear();
	}

	/**
	 * Schedule Binance scraper
	 */
	private scheduleBinance(): void {
		const cronExpression = this.config.binanceCron;

		if (!cron.validate(cronExpression)) {
			console.error(`[Scheduler] Invalid cron expression for Binance: ${cronExpression}`);
			return;
		}

		const task = cron.schedule(cronExpression, async () => {
			console.log('[Scheduler] Running scheduled Binance sync...');
			await this.runBinanceScrapeWithRetry();
		});

		this.tasks.set('binance', task);
		console.log(`[Scheduler] Binance scraper scheduled: ${cronExpression}`);
	}

	/**
	 * Run Binance scrape with retry logic
	 */
	async runBinanceScrapeWithRetry(config: RetryConfig = DEFAULT_RETRY_CONFIG): Promise<boolean> {
		const source = 'Binance';
		const apiKey = env?.BINANCE_API_KEY || process.env.BINANCE_API_KEY;
		const apiSecret = env?.BINANCE_API_SECRET || process.env.BINANCE_API_SECRET;

		if (!apiKey || !apiSecret) {
			console.error('[Scheduler] Binance API not configured');
			return false;
		}

		const binance = new BinanceService(apiKey, apiSecret);
		let db: Database.Database | null = null;

		try {
			db = new Database(DB_PATH);

			// Ensure sync status exists
			this.getOrCreateSyncStatus(db, source);
			this.updateSyncStatus(db, source, 'running');

			// Notify start
			await this.telegram.notifyScraperStart(source);

			// Attempt with retries
			const errors: string[] = [];
			for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
				console.log(`[Scheduler] Binance scrape attempt ${attempt}/${config.maxAttempts}`);

				const result = await binance.scrape();

				if (result.success && result.data) {
					// Success!
					this.updateSyncStatus(db, source, 'success');

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

					await this.telegram.notifyScraperSuccess(source, details);
					console.log(`[Scheduler] Binance scrape successful: ${result.data.totalInEur.toFixed(2)} EUR`);
					return true;
				}

				// Failed - log error for debugging
				const error = result.error || 'Unknown error';
				errors.push(`Tentative ${attempt}: ${error}`);
				console.error(`[Scheduler] Binance scrape failed (attempt ${attempt}/${config.maxAttempts}): ${error}`);

				if (attempt < config.maxAttempts) {
					// Use progressive delays: 5min, 15min, 30min
					const delay = config.delaysMs[attempt - 1];
					console.log(`[Scheduler] Waiting ${delay / 1000 / 60} minutes before retry...`);
					await this.sleep(delay);
				}
			}

			// All retries exhausted - notify Telegram only after final failure
			const errorSummary = errors.join('\n');
			console.error(`[Scheduler] Binance scrape failed after ${config.maxAttempts} attempts:\n${errorSummary}`);
			await this.telegram.notifyScraperFailure(source, errorSummary, config.maxAttempts, config.maxAttempts);

			// All retries exhausted
			this.updateSyncStatus(db, source, 'failure', 'Max retries exceeded');
			console.error('[Scheduler] Binance scrape failed after all retries');
			return false;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('[Scheduler] Binance scrape error:', errorMessage);

			if (db) {
				this.updateSyncStatus(db, source, 'failure', errorMessage);
			}

			await this.telegram.notifyScraperFailure(source, errorMessage, 1, 1);
			return false;
		} finally {
			db?.close();
		}
	}

	/**
	 * Schedule CE (Caisse d'Épargne) scrapers
	 */
	private scheduleCE(): void {
		const cronExpression = this.config.ceCron;

		if (!cron.validate(cronExpression)) {
			console.error(`[Scheduler] Invalid cron expression for CE: ${cronExpression}`);
			return;
		}

		const task = cron.schedule(cronExpression, async () => {
			console.log('[Scheduler] Running scheduled CE sync...');
			// Run both CE Perso and CE SCI in sequence (to avoid rate limiting)
			await this.runCEPersoScrapeWithRetry();
			await this.runCESCIScrapeWithRetry();
		});

		this.tasks.set('ce', task);
		console.log(`[Scheduler] CE scrapers scheduled: ${cronExpression}`);
	}

	/**
	 * Run CE Perso scrape with retry logic
	 */
	async runCEPersoScrapeWithRetry(config: RetryConfig = DEFAULT_RETRY_CONFIG): Promise<boolean> {
		const source = 'CE Perso';
		const username = env?.CE_PERSO_USERNAME || process.env.CE_PERSO_USERNAME;
		const password = env?.CE_PERSO_PASSWORD || process.env.CE_PERSO_PASSWORD;

		if (!username || !password) {
			console.log('[Scheduler] CE Perso not configured, skipping');
			return false;
		}

		const ceService = createCEPersoService(username, password);
		let db: Database.Database | null = null;

		try {
			db = new Database(DB_PATH);

			// Ensure sync status exists
			this.getOrCreateSyncStatus(db, source);
			this.updateSyncStatus(db, source, 'running');

			// Notify start
			await this.telegram.notifyScraperStart(source);

			// Attempt with retries
			const errors: string[] = [];
			for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
				console.log(`[Scheduler] CE Perso scrape attempt ${attempt}/${config.maxAttempts}`);

				const result = await ceService.scrape();

				if (result.success && result.data) {
					// Success!
					this.updateSyncStatus(db, source, 'success');

					const accountsSummary = result.data.accounts
						.map((acc) => `${acc.name}: ${acc.balance.toFixed(2)} EUR`)
						.join('\n');

					const details = [
						`Comptes: ${result.data.accounts.length}`,
						accountsSummary,
						`Total: ${result.data.totalBalance.toFixed(2)} EUR`
					].join('\n');

					await this.telegram.notifyScraperSuccess(source, details);
					console.log(`[Scheduler] CE Perso scrape successful: ${result.data.totalBalance.toFixed(2)} EUR`);
					return true;
				}

				// Check for 2FA requirement - schedule automatic retry
				if (result.data && this.isCEDataWith2FA(result.data)) {
					console.log('[Scheduler] CE Perso requires mobile validation');
					this.updateSyncStatus(db, source, 'pending_2fa', 'Validation mobile requise');

					// Schedule automatic retry after 2FA delay
					const delayMinutes = TWO_FA_RETRY_DELAY_MS / 1000 / 60;
					await this.telegram.notify2FARequired(source, true, delayMinutes);
					this.schedule2FARetry('CE Perso', () => this.executeCEPersoScrapeOnce());

					return false;
				}

				// Failed - log error for debugging
				const error = result.error || 'Unknown error';
				errors.push(`Tentative ${attempt}: ${error}`);
				console.error(`[Scheduler] CE Perso scrape failed (attempt ${attempt}/${config.maxAttempts}): ${error}`);

				if (attempt < config.maxAttempts) {
					const delay = config.delaysMs[attempt - 1];
					console.log(`[Scheduler] Waiting ${delay / 1000 / 60} minutes before retry...`);
					await this.sleep(delay);
				}
			}

			// All retries exhausted
			const errorSummary = errors.join('\n');
			console.error(`[Scheduler] CE Perso scrape failed after ${config.maxAttempts} attempts:\n${errorSummary}`);
			await this.telegram.notifyScraperFailure(source, errorSummary, config.maxAttempts, config.maxAttempts);

			this.updateSyncStatus(db, source, 'failure', 'Max retries exceeded');
			return false;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('[Scheduler] CE Perso scrape error:', errorMessage);

			if (db) {
				this.updateSyncStatus(db, source, 'failure', errorMessage);
			}

			await this.telegram.notifyScraperFailure(source, errorMessage, 1, 1);
			return false;
		} finally {
			db?.close();
		}
	}

	/**
	 * Run CE SCI scrape with retry logic
	 */
	async runCESCIScrapeWithRetry(config: RetryConfig = DEFAULT_RETRY_CONFIG): Promise<boolean> {
		const source = 'CE SCI';
		const username = env?.CE_SCI_USERNAME || process.env.CE_SCI_USERNAME;
		const password = env?.CE_SCI_PASSWORD || process.env.CE_SCI_PASSWORD;

		if (!username || !password) {
			console.log('[Scheduler] CE SCI not configured, skipping');
			return false;
		}

		const ceService = createCESCIService(username, password);
		let db: Database.Database | null = null;

		try {
			db = new Database(DB_PATH);

			// Ensure sync status exists
			this.getOrCreateSyncStatus(db, source);
			this.updateSyncStatus(db, source, 'running');

			// Notify start
			await this.telegram.notifyScraperStart(source);

			// Attempt with retries
			const errors: string[] = [];
			for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
				console.log(`[Scheduler] CE SCI scrape attempt ${attempt}/${config.maxAttempts}`);

				const result = await ceService.scrape();

				if (result.success && result.data) {
					// Success!
					this.updateSyncStatus(db, source, 'success');

					const accountsSummary = result.data.accounts
						.map((acc) => `${acc.name}: ${acc.balance.toFixed(2)} EUR`)
						.join('\n');

					const details = [
						`Comptes: ${result.data.accounts.length}`,
						accountsSummary,
						`Total: ${result.data.totalBalance.toFixed(2)} EUR`
					].join('\n');

					await this.telegram.notifyScraperSuccess(source, details);
					console.log(`[Scheduler] CE SCI scrape successful: ${result.data.totalBalance.toFixed(2)} EUR`);
					return true;
				}

				// Check for 2FA requirement - schedule automatic retry
				if (result.data && this.isCEDataWith2FA(result.data)) {
					console.log('[Scheduler] CE SCI requires mobile validation');
					this.updateSyncStatus(db, source, 'pending_2fa', 'Validation mobile requise');

					// Schedule automatic retry after 2FA delay
					const delayMinutes = TWO_FA_RETRY_DELAY_MS / 1000 / 60;
					await this.telegram.notify2FARequired(source, true, delayMinutes);
					this.schedule2FARetry('CE SCI', () => this.executeCESCIScrapeOnce());

					return false;
				}

				// Failed - log error for debugging
				const error = result.error || 'Unknown error';
				errors.push(`Tentative ${attempt}: ${error}`);
				console.error(`[Scheduler] CE SCI scrape failed (attempt ${attempt}/${config.maxAttempts}): ${error}`);

				if (attempt < config.maxAttempts) {
					const delay = config.delaysMs[attempt - 1];
					console.log(`[Scheduler] Waiting ${delay / 1000 / 60} minutes before retry...`);
					await this.sleep(delay);
				}
			}

			// All retries exhausted
			const errorSummary = errors.join('\n');
			console.error(`[Scheduler] CE SCI scrape failed after ${config.maxAttempts} attempts:\n${errorSummary}`);
			await this.telegram.notifyScraperFailure(source, errorSummary, config.maxAttempts, config.maxAttempts);

			this.updateSyncStatus(db, source, 'failure', 'Max retries exceeded');
			return false;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('[Scheduler] CE SCI scrape error:', errorMessage);

			if (db) {
				this.updateSyncStatus(db, source, 'failure', errorMessage);
			}

			await this.telegram.notifyScraperFailure(source, errorMessage, 1, 1);
			return false;
		} finally {
			db?.close();
		}
	}

	/**
	 * Type guard for CE data with 2FA requirement
	 */
	private isCEDataWith2FA(data: unknown): data is CEScraperData & { requires2FA: true } {
		return (
			typeof data === 'object' &&
			data !== null &&
			'requires2FA' in data &&
			(data as Record<string, unknown>).requires2FA === true
		);
	}

	/**
	 * Manually trigger a sync for a specific source
	 */
	async triggerSync(source: string): Promise<boolean> {
		switch (source.toLowerCase()) {
			case 'binance':
				return this.runBinanceScrapeWithRetry();
			case 'ce-perso':
			case 'ce_perso':
				return this.runCEPersoScrapeWithRetry();
			case 'ce-sci':
			case 'ce_sci':
				return this.runCESCIScrapeWithRetry();
			default:
				console.error(`[Scheduler] Unknown source: ${source}`);
				return false;
		}
	}

	/**
	 * Get scheduler status
	 */
	getStatus(): { tasks: Array<{ name: string; nextRun: Date | null }> } {
		const tasks: Array<{ name: string; nextRun: Date | null }> = [];

		for (const [name] of this.tasks) {
			tasks.push({
				name,
				nextRun: null // node-cron doesn't expose next run time easily
			});
		}

		return { tasks };
	}

	private getOrCreateSyncStatus(db: Database.Database, source: string): void {
		const existing = db.prepare('SELECT id FROM sync_status WHERE source = ?').get(source);

		if (!existing) {
			const id = `sync-${randomUUID()}`;
			db.prepare(`
				INSERT INTO sync_status (id, source, last_sync_status, created_at, updated_at)
				VALUES (?, ?, 'pending', datetime('now'), datetime('now'))
			`).run(id, source);
		}
	}

	private updateSyncStatus(
		db: Database.Database,
		source: string,
		status: 'success' | 'failure' | 'running' | 'pending_2fa',
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

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Schedule a 2FA retry after mobile validation
	 * This is called when 2FA is detected to automatically retry after a delay
	 */
	private schedule2FARetry(
		source: 'CE Perso' | 'CE SCI',
		retryFn: () => Promise<boolean>
	): void {
		const delayMinutes = TWO_FA_RETRY_DELAY_MS / 1000 / 60;
		console.log(`[Scheduler] Scheduling 2FA retry for ${source} in ${delayMinutes} minutes`);

		setTimeout(async () => {
			console.log(`[Scheduler] Executing 2FA retry for ${source}`);
			let db: Database.Database | null = null;

			try {
				db = new Database(DB_PATH);
				this.updateSyncStatus(db, source, 'running');

				const success = await retryFn();

				if (success) {
					console.log(`[Scheduler] 2FA retry successful for ${source}`);
				} else {
					console.log(`[Scheduler] 2FA retry failed for ${source}`);
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				console.error(`[Scheduler] 2FA retry error for ${source}:`, errorMessage);

				if (db) {
					this.updateSyncStatus(db, source, 'failure', errorMessage);
				}
				await this.telegram.notify2FARetryFailure(source, errorMessage);
			} finally {
				db?.close();
			}
		}, TWO_FA_RETRY_DELAY_MS);
	}

	/**
	 * Execute a single CE Perso scrape attempt (for 2FA retry)
	 */
	private async executeCEPersoScrapeOnce(): Promise<boolean> {
		const source = 'CE Perso';
		const username = env?.CE_PERSO_USERNAME || process.env.CE_PERSO_USERNAME;
		const password = env?.CE_PERSO_PASSWORD || process.env.CE_PERSO_PASSWORD;

		if (!username || !password) {
			console.log('[Scheduler] CE Perso not configured');
			return false;
		}

		const ceService = createCEPersoService(username, password);
		let db: Database.Database | null = null;

		try {
			db = new Database(DB_PATH);
			const result = await ceService.scrape();

			if (result.success && result.data && !this.isCEDataWith2FA(result.data)) {
				this.updateSyncStatus(db, source, 'success');

				const accountsSummary = result.data.accounts
					.map((acc) => `${acc.name}: ${acc.balance.toFixed(2)} EUR`)
					.join('\n');

				const details = [
					`Comptes: ${result.data.accounts.length}`,
					accountsSummary,
					`Total: ${result.data.totalBalance.toFixed(2)} EUR`
				].join('\n');

				await this.telegram.notify2FARetrySuccess(source, details);
				console.log(`[Scheduler] CE Perso 2FA retry successful: ${result.data.totalBalance.toFixed(2)} EUR`);
				return true;
			}

			// Still requires 2FA or failed
			const error = result.error || 'Validation mobile toujours requise ou échec';
			this.updateSyncStatus(db, source, 'failure', error);
			await this.telegram.notify2FARetryFailure(source, error);
			return false;
		} finally {
			db?.close();
		}
	}

	/**
	 * Execute a single CE SCI scrape attempt (for 2FA retry)
	 */
	private async executeCESCIScrapeOnce(): Promise<boolean> {
		const source = 'CE SCI';
		const username = env?.CE_SCI_USERNAME || process.env.CE_SCI_USERNAME;
		const password = env?.CE_SCI_PASSWORD || process.env.CE_SCI_PASSWORD;

		if (!username || !password) {
			console.log('[Scheduler] CE SCI not configured');
			return false;
		}

		const ceService = createCESCIService(username, password);
		let db: Database.Database | null = null;

		try {
			db = new Database(DB_PATH);
			const result = await ceService.scrape();

			if (result.success && result.data && !this.isCEDataWith2FA(result.data)) {
				this.updateSyncStatus(db, source, 'success');

				const accountsSummary = result.data.accounts
					.map((acc) => `${acc.name}: ${acc.balance.toFixed(2)} EUR`)
					.join('\n');

				const details = [
					`Comptes: ${result.data.accounts.length}`,
					accountsSummary,
					`Total: ${result.data.totalBalance.toFixed(2)} EUR`
				].join('\n');

				await this.telegram.notify2FARetrySuccess(source, details);
				console.log(`[Scheduler] CE SCI 2FA retry successful: ${result.data.totalBalance.toFixed(2)} EUR`);
				return true;
			}

			// Still requires 2FA or failed
			const error = result.error || 'Validation mobile toujours requise ou échec';
			this.updateSyncStatus(db, source, 'failure', error);
			await this.telegram.notify2FARetryFailure(source, error);
			return false;
		} finally {
			db?.close();
		}
	}
}

/**
 * Get or create the singleton scheduler instance
 */
export function getScheduler(config?: Partial<SchedulerConfig>): ScraperScheduler {
	if (!schedulerInstance) {
		schedulerInstance = new ScraperScheduler(config);
	}
	return schedulerInstance;
}

/**
 * Initialize and start the scheduler
 * Call this from your server initialization
 */
export function initScheduler(config?: Partial<SchedulerConfig>): ScraperScheduler {
	const scheduler = getScheduler(config);
	scheduler.start();
	return scheduler;
}
