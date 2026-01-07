import { redirect } from '@sveltejs/kit';
import { GoCardlessClient, formatTransaction } from '$lib/gocardless.js';
import * as db from '$lib/db.js';

export async function GET({ url, cookies }) {
    const ref = url.searchParams.get('ref');
    const userId = cookies.get('gc_user_id');
    
    if (!ref) {
        throw redirect(302, '/?error=missing_reference');
    }

    if (!userId) {
        throw redirect(302, '/login?error=session_expired');
    }

    try {
        const config = db.getGoCardlessConfig(userId);
        if (!config) {
            throw redirect(302, '/settings?error=not_configured');
        }

        const client = new GoCardlessClient(config.secret_id, config.secret_key);
        client.restoreTokens(config);

        const requisition = await client.getRequisition(ref);

        if (requisition.status !== 'LN') {
            throw redirect(302, `/?error=bank_connection_failed&status=${requisition.status}`);
        }

        for (const accountId of requisition.accounts) {
            const accountData = await client.getFullAccountData(accountId);
            
            const details = accountData.details?.account || {};
            db.upsertBankAccount({
                id: accountId,
                user_id: userId,
                name: details.name || details.ownerName || 'Compte bancaire',
                institution: requisition.institution_id,
                iban: details.iban,
                currency: details.currency || 'EUR',
                account_type: details.cashAccountType || 'checking',
                gocardless_account_id: accountId,
                gocardless_requisition_id: requisition.id
            });

            const transactions = accountData.transactions?.transactions?.booked || [];
            const formattedTxns = transactions.map(t => formatTransaction(t, accountId));
            
            if (formattedTxns.length > 0) {
                db.insertTransactions(formattedTxns);
            }

            db.updateBankAccountSync(accountId);
        }

        cookies.delete('gc_user_id', { path: '/' });
        throw redirect(302, '/?success=bank_connected');

    } catch (error) {
        if (error.status === 302) throw error;
        console.error('Callback error:', error);
        throw redirect(302, `/?error=${encodeURIComponent(error.message)}`);
    }
}
