import { json } from '@sveltejs/kit';
import * as db from '$lib/db.js';

export async function GET({ locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = locals.user.id;
        const bankAccounts = db.getBankAccounts(userId);
        const investmentAccounts = db.getInvestmentAccounts(userId);
        const positions = db.getAllPositions(userId);
        const recentTransactions = db.getRecentTransactions(userId, 20);
        const netWorthHistory = db.getNetWorthHistory(userId, 30);
        const totals = db.calculateTotals(userId);

        const bankAccountsWithBalance = bankAccounts.map(account => {
            const transactions = db.getTransactions(account.id, 1);
            return {
                ...account,
                balance: transactions[0]?.amount || 0
            };
        });

        const investmentAccountsWithValue = investmentAccounts.map(account => {
            const accountPositions = positions.filter(p => p.investment_account_id === account.id);
            const totalValue = accountPositions.reduce((sum, p) => sum + (p.market_value || 0), 0);
            const totalPnL = accountPositions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
            return {
                ...account,
                total_value: totalValue,
                unrealized_pnl: totalPnL,
                positions_count: accountPositions.length
            };
        });

        const assetBreakdown = positions.reduce((acc, p) => {
            const type = p.asset_type || 'other';
            if (!acc[type]) acc[type] = 0;
            acc[type] += p.market_value || 0;
            return acc;
        }, {});

        return json({
            user: {
                name: locals.user.name,
                email: locals.user.email,
                picture: locals.user.picture
            },
            summary: {
                bank_total: totals.bank_total,
                investment_total: totals.investment_total,
                net_worth: totals.total
            },
            bank_accounts: bankAccountsWithBalance,
            investment_accounts: investmentAccountsWithValue,
            positions: positions,
            recent_transactions: recentTransactions,
            net_worth_history: netWorthHistory,
            asset_breakdown: assetBreakdown
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
