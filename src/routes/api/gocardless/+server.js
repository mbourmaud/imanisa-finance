import { json } from '@sveltejs/kit';
import { GoCardlessClient } from '$lib/gocardless.js';
import * as db from '$lib/db.js';

export async function GET({ url, locals, cookies }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = locals.user.id;
    const action = url.searchParams.get('action');
    const config = db.getGoCardlessConfig(userId);

    if (!config?.secret_id || !config?.secret_key) {
        if (action === 'status') {
            return json({ configured: false });
        }
        return json({ 
            error: 'GoCardless not configured',
            setup_required: true
        }, { status: 400 });
    }

    const client = new GoCardlessClient(config.secret_id, config.secret_key);
    if (config.access_token) {
        client.restoreTokens(config);
    }

    try {
        if (action === 'institutions') {
            const institutions = await client.getInstitutions('fr');
            const relevantBanks = institutions.filter(inst => {
                const name = inst.name.toLowerCase();
                return name.includes('caisse') || 
                       name.includes('epargne') ||
                       name.includes('cic') || 
                       name.includes('revolut');
            });

            return json({ 
                institutions: relevantBanks,
                all_count: institutions.length
            });
        }

        if (action === 'search') {
            const query = url.searchParams.get('q');
            const results = await client.findInstitution(query, 'fr');
            return json({ results });
        }

        if (action === 'status') {
            return json({ configured: true });
        }

        if (action === 'connect') {
            const institutionId = url.searchParams.get('institution_id');
            if (!institutionId) {
                return json({ error: 'institution_id required' }, { status: 400 });
            }

            cookies.set('gc_user_id', userId, { path: '/', httpOnly: true, maxAge: 600 });
            
            const redirectUrl = url.origin + '/api/gocardless/callback';
            const requisition = await client.createRequisition(institutionId, redirectUrl);

            return json({
                requisition_id: requisition.id,
                link: requisition.link
            });
        }

        return json({ error: 'Unknown action' }, { status: 400 });

    } catch (error) {
        console.error('GoCardless API error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}

export async function POST({ request, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { secret_id, secret_key } = await request.json();

        if (!secret_id || !secret_key) {
            return json({ error: 'secret_id and secret_key required' }, { status: 400 });
        }

        const client = new GoCardlessClient(secret_id, secret_key);
        const tokens = await client.authenticate();

        db.saveGoCardlessConfig({
            user_id: locals.user.id,
            secret_id,
            secret_key,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            access_expires_at: tokens.access_expires_at,
            refresh_expires_at: tokens.refresh_expires_at
        });

        return json({ 
            success: true, 
            message: 'GoCardless configured successfully',
            expires_at: tokens.access_expires_at
        });

    } catch (error) {
        console.error('GoCardless config error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
