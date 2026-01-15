import type { PageServerLoad } from './$types';
import { execute } from '@infrastructure/database/turso';
import { YahooFinanceService } from '@infrastructure/prices/YahooFinanceService';
import { CoinGeckoService } from '@infrastructure/prices/CoinGeckoService';

interface Owner {
	id: string;
	name: string;
	type: string;
}

interface Account {
	id: string;
	owner_id: string;
	name: string;
	account_number: string | null;
	bank: string;
	type: string;
	balance: number;
}

interface Position {
	id: string;
	account_id: string;
	name: string;
	isin: string | null;
	ticker: string | null;
	asset_type: string;
	quantity: number;
	pru: number;
	current_price: number | null;
	fees_total: number;
}

interface Loan {
	id: string;
	owner_id: string;
	property_id: string | null;
	name: string;
	bank: string;
	type: string;
	initial_amount: number;
	remaining_amount: number;
	rate: number;
	monthly_payment: number;
}

interface Property {
	id: string;
	owner_id: string;
	name: string;
	address: string | null;
	city: string | null;
	purchase_price: number;
	current_value: number;
}

interface Transaction {
	id: string;
	account_id: string;
	date: string;
	description: string;
	amount: number;
	type: string;
	category: string | null;
}

const yahooService = new YahooFinanceService();
const coinGeckoService = new CoinGeckoService();

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const currentMonth = new Date().toISOString().slice(0, 7);

		const [ownersResult, accountsResult, positionsResult, loansResult, propertiesResult, transactionsResult, allTransactionsResult] = await Promise.all([
			execute('SELECT * FROM owners'),
			execute('SELECT * FROM accounts ORDER BY bank, name'),
			execute('SELECT * FROM positions'),
			execute('SELECT * FROM loans'),
			execute('SELECT * FROM properties'),
			execute(`SELECT * FROM transactions WHERE date LIKE ? || '%' ORDER BY date DESC LIMIT 100`, [currentMonth]),
			execute(`SELECT date, SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_change FROM transactions GROUP BY date ORDER BY date DESC`)
		]);

		const owners = ownersResult.rows as unknown as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));
		const accounts = accountsResult.rows as unknown as Account[];
		const positions = positionsResult.rows as unknown as Position[];
		const loans = loansResult.rows as unknown as Loan[];
		const properties = propertiesResult.rows as unknown as Property[];
		const transactions = transactionsResult.rows as unknown as Transaction[];
		const allTransactions = allTransactionsResult.rows as unknown as { date: string; net_change: number }[];

		const etfTickers = positions
			.filter((p) => p.asset_type !== 'crypto' && p.ticker)
			.map((p) => p.ticker!);
		const cryptoTickers = positions
			.filter((p) => p.asset_type === 'crypto' && p.ticker)
			.map((p) => p.ticker!.toLowerCase());

		const [etfPrices, cryptoPrices] = await Promise.all([
			etfTickers.length > 0 ? yahooService.getQuotes(etfTickers) : Promise.resolve(new Map()),
			cryptoTickers.length > 0 ? coinGeckoService.getQuotes(cryptoTickers) : Promise.resolve(new Map())
		]);

		const positionsWithPrices = positions.map((pos) => {
			let currentPrice = pos.current_price;

			if (pos.ticker) {
				const quote = etfPrices.get(pos.ticker) || cryptoPrices.get(pos.ticker.toLowerCase());
				if (quote) {
					currentPrice = quote.price;
				}
			}

			const currentValue = currentPrice ? pos.quantity * currentPrice : 0;
			const investedValue = pos.quantity * pos.pru;
			const gain = currentValue - investedValue;
			const gainPercent = investedValue > 0 ? (gain / investedValue) * 100 : 0;

			return {
				...pos,
				currentPrice,
				currentValue,
				investedValue,
				gain,
				gainPercent
			};
		});

		const liquidAssets = accounts
			.filter((a) => a.type === 'checking' || a.type === 'savings')
			.reduce((sum, a) => sum + a.balance, 0);

		const investmentAssets = positionsWithPrices.reduce((sum, p) => sum + (p.currentValue || 0), 0);
		const realEstateValue = properties.reduce((sum, p) => sum + (p.current_value || 0), 0);
		const totalDebts = loans.reduce((sum, l) => sum + l.remaining_amount, 0);
		const netWorth = liquidAssets + investmentAssets + realEstateValue - totalDebts;

		const netWorthHistory: { date: string; value: number }[] = [];
		let runningNetWorth = netWorth;
		const today = new Date().toISOString().slice(0, 10);

		netWorthHistory.push({ date: today, value: runningNetWorth });

		for (const tx of allTransactions) {
			runningNetWorth -= tx.net_change;
			netWorthHistory.push({ date: tx.date, value: runningNetWorth });
		}

		netWorthHistory.reverse();

		const monthlyIncome = transactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);

		const monthlyExpense = transactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		const accountsWithOwner = accounts.map((acc) => ({
			...acc,
			owner: ownerMap.get(acc.owner_id)
		}));

		const positionsWithOwner = positionsWithPrices.map((pos) => {
			const account = accounts.find((a) => a.id === pos.account_id);
			return {
				...pos,
				owner_id: account?.owner_id,
				owner: account ? ownerMap.get(account.owner_id) : undefined
			};
		});

		const loansWithOwner = loans.map((loan) => ({
			...loan,
			owner: ownerMap.get(loan.owner_id)
		}));

		const transactionsWithOwner = transactions.map((tx) => {
			const account = accounts.find((a) => a.id === tx.account_id);
			return {
				...tx,
				owner_id: account?.owner_id,
				owner: account ? ownerMap.get(account.owner_id) : undefined
			};
		});

		const banksSummary = accountsWithOwner.reduce((acc, account) => {
			if (!acc[account.bank]) {
				acc[account.bank] = { name: account.bank, accounts: [], total: 0 };
			}
			acc[account.bank].accounts.push(account);
			acc[account.bank].total += account.balance;
			return acc;
		}, {} as Record<string, { name: string; accounts: (Account & { owner?: Owner })[]; total: number }>);

		const byCategory = [
			{ label: 'Liquidités', value: liquidAssets, color: '#3B82F6' },
			{ label: 'Investissements', value: investmentAssets, color: '#10B981' },
			{ label: 'Immobilier', value: realEstateValue, color: '#F59E0B' }
		].filter((c) => c.value > 0);

		return {
			user: locals.user,
			owners,
			summary: {
				netWorth,
				liquidAssets,
				investmentAssets,
				realEstateValue,
				totalDebts
			},
			accounts: accountsWithOwner,
			positions: positionsWithOwner,
			loans: loansWithOwner,
			properties,
			banks: Object.values(banksSummary),
			byCategory,
			budget: {
				income: monthlyIncome,
				expense: monthlyExpense,
				balance: monthlyIncome - monthlyExpense
			},
			recentTransactions: transactionsWithOwner.slice(0, 20),
			prices: {
				etf: Object.fromEntries(etfPrices),
				crypto: Object.fromEntries(cryptoPrices)
			},
			netWorthHistory
		};
	} catch {
		return getEmptyData(locals.user?.name);
	}
};

function getEmptyData(userName?: string) {
	return {
		user: { name: userName || 'Utilisateur' },
		owners: [],
		summary: {
			netWorth: 0,
			liquidAssets: 0,
			investmentAssets: 0,
			realEstateValue: 0,
			totalDebts: 0
		},
		accounts: [],
		positions: [],
		loans: [],
		properties: [],
		banks: [],
		byCategory: [],
		budget: { income: 0, expense: 0, balance: 0 },
		recentTransactions: [],
		prices: { etf: {}, crypto: {} },
		netWorthHistory: []
	};
}
