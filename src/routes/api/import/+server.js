import { json } from '@sveltejs/kit';
import { autoParseCSV } from '$lib/csv-import.js';
import * as db from '$lib/db.js';

// POST: Import CSV de positions
export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const accountId = formData.get('account_id');
        const institution = formData.get('institution'); // 'bourse_direct' ou 'linxea'

        if (!file) {
            return json({ error: 'No file provided' }, { status: 400 });
        }

        const content = await file.text();
        const { source, positions } = autoParseCSV(content, file.name);

        if (positions.length === 0) {
            return json({ 
                error: 'No positions found in file',
                detected_source: source
            }, { status: 400 });
        }

        // Crée le compte si nécessaire
        let account;
        if (accountId) {
            account = db.getInvestmentAccounts().find(a => a.id === accountId);
        }

        if (!account) {
            // Crée un nouveau compte
            const newAccountId = crypto.randomUUID();
            db.createInvestmentAccount({
                id: newAccountId,
                name: institution === 'linxea' ? 'Linxea' : 'Bourse Direct',
                institution: institution || source,
                account_type: institution === 'linxea' ? 'assurance_vie' : 'cto'
            });
            account = { id: newAccountId };
        }

        // Import des positions
        let imported = 0;
        let updated = 0;

        for (const position of positions) {
            const positionId = `${account.id}_${position.symbol}`;
            
            db.upsertPosition({
                id: positionId,
                investment_account_id: account.id,
                symbol: position.symbol,
                name: position.name,
                quantity: position.quantity,
                average_cost: position.average_cost,
                currency: position.currency || 'EUR',
                asset_type: position.asset_type,
                last_price: position.last_price,
                last_price_date: new Date().toISOString().split('T')[0]
            });

            imported++;
        }

        return json({
            success: true,
            detected_source: source,
            account_id: account.id,
            positions_imported: imported,
            positions: positions.map(p => ({
                symbol: p.symbol,
                name: p.name,
                quantity: p.quantity,
                value: p.quantity * (p.last_price || 0)
            }))
        });

    } catch (error) {
        console.error('Import error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}

// GET: Liste les comptes d'investissement
export async function GET() {
    try {
        const accounts = db.getInvestmentAccounts();
        return json({ accounts });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}
