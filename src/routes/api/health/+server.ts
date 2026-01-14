import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
	const dbPath = env.DATABASE_PATH || './data/imanisa.db';

	try {
		const db = new Database(dbPath, { readonly: true });
		const result = db.prepare('SELECT 1 as ok').get() as { ok: number };
		db.close();

		if (result?.ok === 1) {
			return json({
				status: 'healthy',
				database: 'connected',
				timestamp: new Date().toISOString()
			});
		}

		return json({ status: 'unhealthy', database: 'query failed' }, { status: 500 });
	} catch (error) {
		return json(
			{
				status: 'unhealthy',
				database: 'disconnected',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
