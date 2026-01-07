import { json } from '@sveltejs/kit';
import { parseBankCSV, parseInvestmentCSV, detectBankFormat, detectInvestmentFormat } from '$lib/csv-import.js';
import * as db from '$lib/db.js';

export async function POST({ request, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = locals.user.id;
        const formData = await request.formData();
        const file = formData.get('file');
        const importType = formData.get('type');
        const institution = formData.get('institution');
        const accountName = formData.get('account_name');

        if (!file) {
            return json({ error: 'No file provided' }, { status: 400 });
        }

        const content = await file.text();
        const filename = file.name;

        if (importType === 'bank') {
            const format = institution || detectBankFormat(content, filename);
            const transactions = parseBankCSV(content, format);

            if (transactions.length === 0) {
                return json({ error: 'No transactions found in file' }, { status: 400 });
            }

            const institutionNames = {
                'caisse_epargne': 'Caisse d\'Épargne',
                'cic': 'CIC',
                'revolut': 'Revolut'
            };
            const instName = institutionNames[format] || format;
            const accName = accountName || `${instName} - Compte courant`;

            let account = db.getBankAccountByName(accName, format, userId);
            
            if (!account) {
                const accountId = crypto.randomUUID();
                db.upsertBankAccount({
                    id: accountId,
                    user_id: userId,
                    name: accName,
                    institution: format,
                    iban: null,
                    currency: 'EUR',
                    account_type: 'checking',
                    balance: 0,
                    last_import_at: new Date().toISOString()
                });
                account = { id: accountId };
            }

            const txnsWithAccount = transactions.map(t => ({
                ...t,
                bank_account_id: account.id
            }));

            db.insertTransactions(txnsWithAccount);

            const lastTx = transactions.sort((a, b) => b.date.localeCompare(a.date))[0];
            const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
            db.updateBankAccountBalance(account.id, balance);

            return json({
                success: true,
                type: 'bank',
                detected_format: format,
                account_id: account.id,
                transactions_imported: transactions.length,
                balance: balance
            });

        } else {
            const format = institution || detectInvestmentFormat(content, filename);
            const positions = parseInvestmentCSV(content, format);

            if (positions.length === 0) {
                return json({ error: 'No positions found in file' }, { status: 400 });
            }

            const institutionNames = {
                'bourse_direct': 'Bourse Direct',
                'linxea': 'Linxea'
            };
            const instName = institutionNames[format] || format;
            const accName = accountName || instName;
            const accType = format === 'linxea' ? 'assurance_vie' : 'cto';

            let account = db.getInvestmentAccountByName(accName, format, userId);
            
            if (!account) {
                const accountId = crypto.randomUUID();
                db.createInvestmentAccount({
                    id: accountId,
                    user_id: userId,
                    name: accName,
                    institution: format,
                    account_type: accType
                });
                account = { id: accountId };
            }

            let imported = 0;
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
                type: 'investment',
                detected_format: format,
                account_id: account.id,
                positions_imported: imported,
                positions: positions.map(p => ({
                    symbol: p.symbol,
                    name: p.name,
                    quantity: p.quantity,
                    value: p.quantity * (p.last_price || 0)
                }))
            });
        }

    } catch (error) {
        console.error('Import error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}

export async function GET({ locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const bankAccounts = db.getBankAccounts(locals.user.id);
        const investmentAccounts = db.getInvestmentAccounts(locals.user.id);
        return json({ bank_accounts: bankAccounts, investment_accounts: investmentAccounts });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}
