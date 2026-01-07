import { redirect } from '@sveltejs/kit';
import { GoCardlessClient, formatTransaction } from '$lib/gocardless.js';
import * as db from '$lib/db.js';

// Callback après authentification bancaire
export async function GET({ url }) {
    const ref = url.searchParams.get('ref');
    
    if (!ref) {
        return new Response('Missing requisition reference', { status: 400 });
    }

    try {
        const config = db.getGoCardlessConfig();
        const client = new GoCardlessClient(config.secret_id, config.secret_key);
        client.restoreTokens(config);

        // Récupère la requisition pour avoir les comptes
        const requisition = await client.getRequisition(ref);

        if (requisition.status !== 'LN') {
            // LN = Linked, la connexion a réussi
            throw redirect(302, `/?error=bank_connection_failed&status=${requisition.status}`);
        }

        // Pour chaque compte lié, récupère les infos et sauvegarde
        for (const accountId of requisition.accounts) {
            const accountData = await client.getFullAccountData(accountId);
            
            // Sauvegarde le compte
            const details = accountData.details?.account || {};
            db.upsertBankAccount({
                id: accountId,
                name: details.name || details.ownerName || 'Compte bancaire',
                institution: requisition.institution_id,
                iban: details.iban,
                currency: details.currency || 'EUR',
                account_type: details.cashAccountType || 'checking',
                gocardless_account_id: accountId,
                gocardless_requisition_id: requisition.id
            });

            // Sauvegarde les transactions
            const transactions = accountData.transactions?.transactions?.booked || [];
            const formattedTxns = transactions.map(t => formatTransaction(t, accountId));
            
            if (formattedTxns.length > 0) {
                db.insertTransactions(formattedTxns);
            }

            db.updateBankAccountSync(accountId);
        }

        // Redirige vers le dashboard avec succès
        throw redirect(302, '/?success=bank_connected');

    } catch (error) {
        if (error.status === 302) throw error; // C'est notre redirect
        console.error('Callback error:', error);
        throw redirect(302, `/?error=${encodeURIComponent(error.message)}`);
    }
}
