import type { PageServerLoad } from './$types';
import { execute } from '@infrastructure/database/turso';
import { CoinGeckoService } from '@infrastructure/prices/CoinGeckoService';
import { YahooFinanceService } from '@infrastructure/prices/YahooFinanceService';

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
	ticker: string | null;
	asset_type: string;
	quantity: number;
	pru: number;
	current_price: number | null;
}

const coinGeckoService = new CoinGeckoService();
const yahooService = new YahooFinanceService();

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const [ownersResult, accountsResult, positionsResult] = await Promise.all([
			execute('SELECT * FROM owners'),
			execute('SELECT * FROM accounts ORDER BY bank, name'),
			execute('SELECT * FROM positions')
		]);

		const owners = ownersResult.rows as unknown as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));
		const accounts = accountsResult.rows as unknown as Account[];
		const positions = positionsResult.rows as unknown as Position[];

		const cryptoTickers = positions
			.filter((p) => p.asset_type === 'crypto' && p.ticker)
			.map((p) => p.ticker!.toLowerCase());
		const etfTickers = positions
			.filter((p) => p.asset_type !== 'crypto' && p.ticker)
			.map((p) => p.ticker!);

		const [cryptoPrices, etfPrices] = await Promise.all([
			cryptoTickers.length > 0 ? coinGeckoService.getQuotes(cryptoTickers) : new Map(),
			etfTickers.length > 0 ? yahooService.getQuotes(etfTickers) : new Map()
		]);

		const positionValues = new Map<string, number>();
		for (const pos of positions) {
			let price = pos.current_price || pos.pru;

			if (pos.ticker) {
				const livePrice =
					pos.asset_type === 'crypto'
						? cryptoPrices.get(pos.ticker.toLowerCase())
						: etfPrices.get(pos.ticker);
				if (livePrice) {
					price = livePrice.price;
				}
			}

			const value = pos.quantity * price;
			const currentTotal = positionValues.get(pos.account_id) || 0;
			positionValues.set(pos.account_id, currentTotal + value);
		}

		const investmentTypes = ['crypto', 'investment', 'pea', 'life_insurance'];
		const enrichedAccounts = accounts.map((acc) => {
			if (investmentTypes.includes(acc.type)) {
				const computedBalance = positionValues.get(acc.id) || 0;
				return { ...acc, balance: computedBalance };
			}
			return acc;
		});

		const accountsWithOwner = enrichedAccounts.map((acc) => ({
			...acc,
			owner: ownerMap.get(acc.owner_id)
		}));

		const banksSummary = accountsWithOwner.reduce(
			(acc, account) => {
				if (!acc[account.bank]) {
					acc[account.bank] = { name: account.bank, accounts: [], total: 0 };
				}
				acc[account.bank].accounts.push(account);
				acc[account.bank].total += account.balance;
				return acc;
			},
			{} as Record<string, { name: string; accounts: (Account & { owner?: Owner })[]; total: number }>
		);

		const totalBalance = enrichedAccounts.reduce((sum, a) => sum + a.balance, 0);

		return {
			user: locals.user,
			accounts: accountsWithOwner,
			banks: Object.values(banksSummary),
			totalBalance
		};
	} catch {
		return {
			user: locals.user,
			accounts: [],
			banks: [],
			totalBalance: 0
		};
	}
};
