#!/usr/bin/env node

/**
 * Script de synchronisation bancaire
 * 
 * À exécuter via cron pour une synchro automatique :
 * 
 * # Synchro quotidienne à 7h
 * 0 7 * * * cd /path/to/finary-lite && node scripts/sync-banks.js
 * 
 * # Ou hebdomadaire le lundi
 * 0 7 * * 1 cd /path/to/finary-lite && node scripts/sync-banks.js
 */

import { GoCardlessClient, formatTransaction } from '../src/lib/gocardless.js';
import * as db from '../src/lib/db.js';

async function syncAllBanks() {
    console.log('🔄 Starting bank sync...');
    console.log('Time:', new Date().toISOString());

    const config = db.getGoCardlessConfig();
    
    if (!config?.secret_id || !config?.secret_key) {
        console.error('❌ GoCardless not configured');
        process.exit(1);
    }

    const client = new GoCardlessClient(config.secret_id, config.secret_key);
    
    if (config.access_token) {
        client.restoreTokens(config);
    }

    const accounts = db.getBankAccounts().filter(a => a.gocardless_account_id);
    
    if (accounts.length === 0) {
        console.log('⚠️ No bank accounts to sync');
        process.exit(0);
    }

    console.log(`📋 Found ${accounts.length} accounts to sync`);

    let successCount = 0;
    let errorCount = 0;

    for (const account of accounts) {
        try {
            console.log(`\n🏦 Syncing: ${account.name} (${account.institution})`);

            // Get transactions from last 30 days
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
                console.log(`   ✅ ${formattedTxns.length} transactions imported`);
            } else {
                console.log('   ℹ️ No new transactions');
            }

            // Get balances
            const balances = await client.getAccountBalances(account.gocardless_account_id);
            if (balances?.balances?.[0]) {
                const balance = balances.balances[0];
                console.log(`   💰 Balance: ${balance.balanceAmount.amount} ${balance.balanceAmount.currency}`);
            }

            db.updateBankAccountSync(account.id);
            successCount++;

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            errorCount++;
        }

        // Rate limit respect
        await new Promise(r => setTimeout(r, 1000));
    }

    // Save net worth snapshot
    const totals = db.calculateTotals();
    db.insertNetWorthSnapshot({
        date: new Date().toISOString().split('T')[0],
        bank_total: totals.bank_total,
        investment_total: totals.investment_total,
        total: totals.total,
        breakdown: JSON.stringify({
            bank_accounts: accounts.map(a => ({ id: a.id, name: a.name })),
            synced_at: new Date().toISOString()
        })
    });

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Sync complete: ${successCount} success, ${errorCount} errors`);
    console.log(`💰 Total net worth: ${totals.total.toFixed(2)} EUR`);
}

syncAllBanks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
