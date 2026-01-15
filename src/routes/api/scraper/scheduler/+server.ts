import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScheduler, initScheduler } from '$lib/scraper/scheduler';

let schedulerInitialized = false;

/**
 * GET /api/scraper/scheduler
 * Get scheduler status and optionally initialize it
 */
export const GET: RequestHandler = async ({ url }) => {
	const init = url.searchParams.get('init') === 'true';

	if (init && !schedulerInitialized) {
		const cronExpression = process.env.SCRAPER_CRON || '0 8 * * 1';
		initScheduler({ binanceCron: cronExpression });
		schedulerInitialized = true;
		console.log('[API] Scheduler initialized');
	}

	const scheduler = getScheduler();
	const status = scheduler.getStatus();

	return json({
		success: true,
		initialized: schedulerInitialized,
		cronExpression: process.env.SCRAPER_CRON || '0 8 * * 1',
		...status
	});
};

/**
 * POST /api/scraper/scheduler
 * Control the scheduler (start/stop)
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const action = body.action as string;

	const scheduler = getScheduler();

	switch (action) {
		case 'start':
			if (!schedulerInitialized) {
				const cronExpression = process.env.SCRAPER_CRON || '0 8 * * 1';
				initScheduler({ binanceCron: cronExpression });
				schedulerInitialized = true;
			} else {
				scheduler.start();
			}
			return json({ success: true, message: 'Scheduler started' });

		case 'stop':
			scheduler.stop();
			return json({ success: true, message: 'Scheduler stopped' });

		case 'trigger':
			const source = body.source as string;
			if (!source) {
				return json({ success: false, error: 'Source required' }, { status: 400 });
			}
			// Run async, don't wait
			scheduler.triggerSync(source).catch(console.error);
			return json({ success: true, message: `Sync triggered for ${source}` });

		default:
			return json({ success: false, error: 'Invalid action' }, { status: 400 });
	}
};
