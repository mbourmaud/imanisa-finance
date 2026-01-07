import { json } from '@sveltejs/kit';
import { updateAllPrices, fetchYahooPrice, searchYahooSymbol } from '$lib/prices.js';
import * as db from '$lib/db.js';

// POST: Met à jour les prix de toutes les positions
export async function POST({ request }) {
    try {
        const { symbols } = await request.json() || {};
        
        let positions;
        if (symbols && symbols.length > 0) {
            // Mise à jour de symboles spécifiques
            positions = db.getAllPositions().filter(p => symbols.includes(p.symbol));
        } else {
            // Toutes les positions
            positions = db.getAllPositions();
        }

        if (positions.length === 0) {
            return json({ message: 'No positions to update' });
        }

        const results = await updateAllPrices(positions);

        // Sauvegarde les nouveaux prix
        const today = new Date().toISOString().split('T')[0];
        let updated = 0;
        let failed = 0;

        for (const result of results) {
            if (result.updated && result.price) {
                db.updatePositionPrice(result.symbol, result.price);
                db.insertPrice(result.symbol, today, result.price, 'yahoo');
                updated++;
            } else {
                failed++;
            }
        }

        return json({
            success: true,
            updated_at: new Date().toISOString(),
            total_positions: positions.length,
            prices_updated: updated,
            prices_failed: failed,
            results
        });

    } catch (error) {
        console.error('Price update error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}

// GET: Recherche un symbole ou récupère un prix
export async function GET({ url }) {
    const action = url.searchParams.get('action');
    const symbol = url.searchParams.get('symbol');
    const query = url.searchParams.get('q');

    try {
        if (action === 'search' && query) {
            const results = await searchYahooSymbol(query);
            return json({ results });
        }

        if (action === 'price' && symbol) {
            const price = await fetchYahooPrice(symbol);
            if (!price) {
                return json({ error: 'Symbol not found' }, { status: 404 });
            }
            return json(price);
        }

        if (action === 'history' && symbol) {
            const history = db.getPriceHistory(symbol, 30);
            return json({ symbol, history });
        }

        return json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}
