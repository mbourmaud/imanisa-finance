#!/usr/bin/env node

/**
 * Script de mise à jour des prix
 * 
 * À exécuter via cron :
 * 
 * # Màj quotidienne à 18h (après clôture des marchés EU)
 * 0 18 * * 1-5 cd /path/to/finary-lite && node scripts/sync-prices.js
 */

import { updateAllPrices } from '../src/lib/prices.js';
import * as db from '../src/lib/db.js';

async function updatePrices() {
    console.log('📈 Starting price update...');
    console.log('Time:', new Date().toISOString());

    const positions = db.getAllPositions();
    
    if (positions.length === 0) {
        console.log('⚠️ No positions to update');
        process.exit(0);
    }

    console.log(`📋 Found ${positions.length} positions`);

    const results = await updateAllPrices(positions);
    const today = new Date().toISOString().split('T')[0];

    let updated = 0;
    let failed = 0;

    for (const result of results) {
        if (result.updated && result.price) {
            db.updatePositionPrice(result.symbol, result.price);
            db.insertPrice(result.symbol, today, result.price, 'yahoo');
            console.log(`   ✅ ${result.symbol}: ${result.price} ${result.currency}`);
            updated++;
        } else {
            console.log(`   ❌ ${result.symbol}: ${result.error || 'Failed'}`);
            failed++;
        }
    }

    // Save net worth snapshot
    const totals = db.calculateTotals();
    db.insertNetWorthSnapshot({
        date: today,
        bank_total: totals.bank_total,
        investment_total: totals.investment_total,
        total: totals.total,
        breakdown: JSON.stringify({
            positions_updated: updated,
            positions_failed: failed,
            updated_at: new Date().toISOString()
        })
    });

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Price update complete: ${updated} updated, ${failed} failed`);
    console.log(`💰 Investment total: ${totals.investment_total.toFixed(2)} EUR`);
    console.log(`💰 Total net worth: ${totals.total.toFixed(2)} EUR`);
}

updatePrices().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
