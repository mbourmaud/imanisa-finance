import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { execute } from '@infrastructure/database/turso';
import { YahooFinanceService } from '@infrastructure/prices/YahooFinanceService';
import { CoinGeckoService } from '@infrastructure/prices/CoinGeckoService';

interface Account {
	id: string;
	name: string;
	bank: string;
	type: string;
	balance: number;
}

interface Position {
	id: string;
	name: string;
	ticker: string | null;
	asset_type: string;
	quantity: number;
	pru: number;
	current_price: number | null;
}

interface Loan {
	id: string;
	name: string;
	bank: string;
	initial_amount: number;
	remaining_amount: number;
	rate: number;
	monthly_payment: number;
}

interface Property {
	id: string;
	name: string;
	address: string | null;
	city: string | null;
	purchase_price: number;
	current_value: number;
}

const yahooService = new YahooFinanceService();
const coinGeckoService = new CoinGeckoService();

export const GET: RequestHandler = async () => {
	const [accountsResult, positionsResult, loansResult, propertiesResult] = await Promise.all([
		execute('SELECT * FROM accounts'),
		execute('SELECT * FROM positions'),
		execute('SELECT * FROM loans'),
		execute('SELECT * FROM properties')
	]);

	const accounts = accountsResult.rows as unknown as Account[];
	const positions = positionsResult.rows as unknown as Position[];
	const loans = loansResult.rows as unknown as Loan[];
	const properties = propertiesResult.rows as unknown as Property[];

	const [etfPrices, cryptoPrices] = await Promise.all([
		yahooService.getQuotes(['PE500.PA', 'CW8.PA']),
		coinGeckoService.getQuotes(['bitcoin', 'ethereum'])
	]);

	const positionsWithPrices = positions.map((pos) => {
		let currentPrice = pos.current_price;
		let currentValue = 0;

		if (pos.ticker) {
			const quote = etfPrices.get(pos.ticker) || cryptoPrices.get(pos.ticker.toLowerCase());
			if (quote) {
				currentPrice = quote.price;
			}
		}

		if (currentPrice) {
			currentValue = pos.quantity * currentPrice;
		}

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

	return json({
		summary: {
			netWorth,
			liquidAssets,
			investmentAssets,
			realEstateValue,
			totalDebts
		},
		accounts,
		positions: positionsWithPrices,
		loans,
		properties,
		prices: {
			etf: Object.fromEntries(etfPrices),
			crypto: Object.fromEntries(cryptoPrices)
		}
	});
};
