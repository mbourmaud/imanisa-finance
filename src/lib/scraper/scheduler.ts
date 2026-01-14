/**
 * Scraper Scheduler Service
 * Handles automatic scheduling and retry logic for data scrapers
 */

import cron, { type ScheduledTask } from 'node-cron';
import { BinanceService } from '@infrastructure/scrapers/BinanceService';
import { TelegramService } from './utils/telegram';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { env } from '$env/dynamic/private';

const DB_PATH = process.env.DATABASE_PATH || './data/imanisa.db';

interface RetryConfig {
	maxAttempts: number;
	baseDelayMs: number;
	maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxAttempts: 3,
	baseDelayMs: 5 * 60 * 1000, // 5 minutes
	maxDelayMs: 30 * 60 * 1000 // 30 minutes
};

interface SchedulerConfig {
	binanceCron: string;
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

				// Failed - notify and maybe retry
				const error = result.error || 'Unknown error';
				await this.telegram.notifyScraperFailure(source, error, attempt, config.maxAttempts);

				if (attempt < config.maxAttempts) {
					// Calculate exponential backoff delay
					const delay = Math.min(config.baseDelayMs * Math.pow(2, attempt - 1), config.maxDelayMs);
					console.log(`[Scheduler] Waiting ${delay / 1000}s before retry...`);
					await this.sleep(delay);
				}
			}

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
	 * Manually trigger a sync for a specific source
	 */
	async triggerSync(source: string): Promise<boolean> {
		switch (source.toLowerCase()) {
			case 'binance':
				return this.runBinanceScrapeWithRetry();
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

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
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
