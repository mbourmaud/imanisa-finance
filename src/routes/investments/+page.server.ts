import type { PageServerLoad } from './$types';
import Database from 'better-sqlite3';
import { YahooFinanceService } from '@infrastructure/prices/YahooFinanceService';
import { CoinGeckoService } from '@infrastructure/prices/CoinGeckoService';

const DB_PATH = './data/imanisa.db';

interface Owner {
	id: string;
	name: string;
	type: string;
}

interface Account {
	id: string;
	owner_id: string;
	name: string;
	bank: string;
	type: string;
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

const yahooService = new YahooFinanceService();
const coinGeckoService = new CoinGeckoService();

export const load: PageServerLoad = async ({ locals }) => {
	let db: Database.Database | null = null;

	try {
		db = new Database(DB_PATH, { readonly: true });
	} catch {
		return {
			user: locals.user,
			positions: [],
			totalValue: 0,
			totalGain: 0,
			totalGainPercent: 0
		};
	}

	try {
		const owners = db.prepare('SELECT * FROM owners').all() as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));

		const accounts = db.prepare('SELECT * FROM accounts').all() as Account[];
		const positions = db.prepare('SELECT * FROM positions').all() as Position[];

		const etfTickers = positions
			.filter((p) => p.ticker && p.asset_type === 'etf')
			.map((p) => p.ticker as string);
		const cryptoIds = positions
			.filter((p) => p.ticker && p.asset_type === 'crypto')
			.map((p) => p.ticker?.toLowerCase() as string);

		const [etfPrices, cryptoPrices] = await Promise.all([
			etfTickers.length > 0 ? yahooService.getQuotes(etfTickers) : Promise.resolve(new Map()),
			cryptoIds.length > 0 ? coinGeckoService.getQuotes(cryptoIds) : Promise.resolve(new Map())
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

			const account = accounts.find((a) => a.id === pos.account_id);

			return {
				...pos,
				currentPrice,
				currentValue,
				investedValue,
				gain,
				gainPercent,
				owner_id: account?.owner_id,
				owner: account ? ownerMap.get(account.owner_id) : undefined,
				accountName: account?.name,
				bank: account?.bank
			};
		});

		const totalValue = positionsWithPrices.reduce((sum, p) => sum + p.currentValue, 0);
		const totalInvested = positionsWithPrices.reduce((sum, p) => sum + p.investedValue, 0);
		const totalGain = totalValue - totalInvested;
		const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

		const byAssetType = positionsWithPrices.reduce(
			(acc, pos) => {
				const type = pos.asset_type || 'other';
				if (!acc[type]) {
					acc[type] = { positions: [], totalValue: 0, totalGain: 0 };
				}
				acc[type].positions.push(pos);
				acc[type].totalValue += pos.currentValue;
				acc[type].totalGain += pos.gain;
				return acc;
			},
			{} as Record<
				string,
				{
					positions: typeof positionsWithPrices;
					totalValue: number;
					totalGain: number;
				}
			>
		);

		return {
			user: locals.user,
			positions: positionsWithPrices,
			byAssetType,
			totalValue,
			totalInvested,
			totalGain,
			totalGainPercent
		};
	} finally {
		db?.close();
	}
};
