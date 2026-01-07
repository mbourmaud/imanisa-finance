import { json } from '@sveltejs/kit';
import { GoCardlessClient, formatTransaction } from '$lib/gocardless.js';
import * as db from '$lib/db.js';

export async function POST({ request, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = locals.user.id;
        const body = await request.json().catch(() => ({}));
        const accountId = body.account_id;
        
        const config = db.getGoCardlessConfig(userId);
        if (!config?.access_token) {
            return json({ error: 'GoCardless not configured' }, { status: 400 });
        }

        const client = new GoCardlessClient(config.secret_id, config.secret_key);
        client.restoreTokens(config);

        let accounts = [];
        if (accountId) {
            const account = db.getBankAccount(accountId, userId);
            if (account) accounts = [account];
        } else {
            accounts = db.getBankAccounts(userId).filter(a => a.gocardless_account_id);
        }

        const results = [];

        for (const account of accounts) {
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];

                const transactionsData = await client.getAccountTransactions(
                    account.gocardless_account_id,
                    dateFrom
                );

                const transactions = transactionsData?.transactions?.booked || [];
                const formattedTxns = transactions.map(t => 
                    formatTransaction(t, account.id)
                );

                if (formattedTxns.length > 0) {
                    db.insertTransactions(formattedTxns);
                }

                const balances = await client.getAccountBalances(account.gocardless_account_id);
                
                db.updateBankAccountSync(account.id);

                results.push({
                    account_id: account.id,
                    account_name: account.name,
                    transactions_count: formattedTxns.length,
                    balances: balances?.balances,
                    success: true
                });

            } catch (error) {
                results.push({
                    account_id: account.id,
                    account_name: account.name,
                    error: error.message,
                    success: false
                });
            }
        }

        return json({
            synced_at: new Date().toISOString(),
            results
        });

    } catch (error) {
        console.error('Sync error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
