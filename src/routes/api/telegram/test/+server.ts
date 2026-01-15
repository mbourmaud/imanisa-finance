import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { TelegramService } from '$lib/scraper/utils/telegram';

export const POST: RequestHandler = async () => {
	const botToken = env.TELEGRAM_BOT_TOKEN;
	const chatId = env.TELEGRAM_CHAT_ID;

	if (!botToken || !chatId) {
		return json(
			{
				success: false,
				error: 'Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env'
			},
			{ status: 400 }
		);
	}

	const telegram = new TelegramService(botToken, chatId);

	const success = await telegram.sendMessage(
		`🧪 <b>Test de notification</b>\n\nimanisa-finance est correctement configuré !\nHeure: ${new Date().toLocaleTimeString('fr-FR')}`
	);

	if (success) {
		return json({ success: true, message: 'Test notification sent successfully' });
	}

	return json({ success: false, error: 'Failed to send test notification' }, { status: 500 });
};
