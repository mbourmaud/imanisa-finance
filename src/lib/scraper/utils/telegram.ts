/**
 * Telegram notification service for scraper status updates
 */

interface TelegramConfig {
	botToken: string;
	chatId: string;
}

interface SendMessageOptions {
	parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
	disableNotification?: boolean;
}

export class TelegramService {
	private config: TelegramConfig | null = null;
	private baseUrl: string = '';

	constructor(botToken?: string, chatId?: string) {
		if (botToken && chatId) {
			this.config = { botToken, chatId };
			this.baseUrl = `https://api.telegram.org/bot${botToken}`;
		}
	}

	isConfigured(): boolean {
		return this.config !== null;
	}

	async sendMessage(text: string, options: SendMessageOptions = {}): Promise<boolean> {
		if (!this.config) {
			console.log('[Telegram] Not configured, skipping notification');
			return false;
		}

		try {
			const response = await fetch(`${this.baseUrl}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chat_id: this.config.chatId,
					text,
					parse_mode: options.parseMode || 'HTML',
					disable_notification: options.disableNotification || false
				})
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('[Telegram] Failed to send message:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('[Telegram] Error sending message:', error);
			return false;
		}
	}

	// Notification templates

	async notifyScraperStart(source: string): Promise<boolean> {
		return this.sendMessage(`🔄 <b>Scraper démarré</b>\n\nSource: ${source}\nHeure: ${this.formatTime()}`);
	}

	async notifyScraperSuccess(source: string, details: string): Promise<boolean> {
		return this.sendMessage(
			`✅ <b>Scrape réussi</b>\n\nSource: ${source}\n${details}\nHeure: ${this.formatTime()}`
		);
	}

	async notifyScraperFailure(source: string, error: string, attempt: number, maxAttempts: number): Promise<boolean> {
		const isFinal = attempt >= maxAttempts;
		const emoji = isFinal ? '❌' : '⚠️';
		const status = isFinal ? 'Échec final' : `Tentative ${attempt}/${maxAttempts}`;

		return this.sendMessage(
			`${emoji} <b>${status}</b>\n\nSource: ${source}\nErreur: ${error}\nHeure: ${this.formatTime()}`
		);
	}

	async notify2FARequired(source: string, retryScheduled: boolean = false, retryDelayMinutes?: number): Promise<boolean> {
		const retryInfo = retryScheduled && retryDelayMinutes
			? `\n⏰ Retry automatique dans ${retryDelayMinutes.toFixed(1)} min`
			: '';
		return this.sendMessage(
			`🔐 <b>Validation manuelle requise pour ${source}</b>\n\nAction: Veuillez confirmer sur votre application mobile${retryInfo}\nHeure: ${this.formatTime()}`,
			{ disableNotification: false } // Force notification for 2FA
		);
	}

	async notify2FARetrySuccess(source: string, details: string): Promise<boolean> {
		return this.sendMessage(
			`✅ <b>Retry après validation mobile réussi</b>\n\nSource: ${source}\n${details}\nHeure: ${this.formatTime()}`
		);
	}

	async notify2FARetryFailure(source: string, error: string): Promise<boolean> {
		return this.sendMessage(
			`❌ <b>Retry après validation mobile échoué</b>\n\nSource: ${source}\nErreur: ${error}\nHeure: ${this.formatTime()}`
		);
	}

	async notifyDailySummary(sources: Array<{ name: string; lastUpdate: Date | null; status: 'ok' | 'warning' | 'error' }>): Promise<boolean> {
		const lines = sources.map((s) => {
			const emoji = s.status === 'ok' ? '✅' : s.status === 'warning' ? '⚠️' : '❌';
			const date = s.lastUpdate ? this.formatDate(s.lastUpdate) : 'Jamais';
			return `${emoji} ${s.name}: ${date}`;
		});

		return this.sendMessage(`📊 <b>État des données</b>\n\n${lines.join('\n')}`);
	}

	private formatTime(): string {
		return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}

	private formatDate(date: Date): string {
		return date.toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
}

// Singleton instance - will be configured at runtime
let telegramInstance: TelegramService | null = null;

export function getTelegramService(): TelegramService {
	if (!telegramInstance) {
		// Will be initialized with env vars when imported server-side
		telegramInstance = new TelegramService();
	}
	return telegramInstance;
}

export function initTelegramService(botToken: string, chatId: string): TelegramService {
	telegramInstance = new TelegramService(botToken, chatId);
	return telegramInstance;
}
