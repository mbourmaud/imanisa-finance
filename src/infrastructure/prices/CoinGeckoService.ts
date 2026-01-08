import type { PriceQuote, PriceService } from './types';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const CRYPTO_IDS = {
	BTC: 'bitcoin',
	ETH: 'ethereum'
} as const;

interface CoinGeckoPrice {
	[coinId: string]: {
		eur: number;
		eur_24h_change: number;
	};
}

export class CoinGeckoService implements PriceService {
	async getQuote(coinId: string): Promise<PriceQuote | null> {
		try {
			const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=eur&include_24hr_change=true`;
			const response = await fetch(url, {
				headers: {
					Accept: 'application/json'
				}
			});

			if (!response.ok) {
				console.error(`CoinGecko error: ${response.status}`);
				return null;
			}

			const data: CoinGeckoPrice = await response.json();

			if (!data[coinId]) {
				return null;
			}

			const price = data[coinId].eur;
			const changePercent = data[coinId].eur_24h_change || 0;
			const change = (price * changePercent) / 100;

			return {
				ticker: coinId.toUpperCase(),
				price,
				currency: 'EUR',
				change,
				changePercent,
				updatedAt: new Date()
			};
		} catch (error) {
			console.error(`Failed to fetch quote for ${coinId}:`, error);
			return null;
		}
	}

	async getQuotes(coinIds: string[]): Promise<Map<string, PriceQuote>> {
		const results = new Map<string, PriceQuote>();

		try {
			const ids = coinIds.join(',');
			const url = `${COINGECKO_BASE_URL}/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`;
			const response = await fetch(url, {
				headers: {
					Accept: 'application/json'
				}
			});

			if (!response.ok) {
				return results;
			}

			const data: CoinGeckoPrice = await response.json();

			for (const coinId of coinIds) {
				if (data[coinId]) {
					const price = data[coinId].eur;
					const changePercent = data[coinId].eur_24h_change || 0;
					const change = (price * changePercent) / 100;

					results.set(coinId, {
						ticker: coinId.toUpperCase(),
						price,
						currency: 'EUR',
						change,
						changePercent,
						updatedAt: new Date()
					});
				}
			}
		} catch (error) {
			console.error('Failed to fetch crypto quotes:', error);
		}

		return results;
	}

	async getBTCPrice(): Promise<number | null> {
		const quote = await this.getQuote(CRYPTO_IDS.BTC);
		return quote?.price ?? null;
	}

	async getETHPrice(): Promise<number | null> {
		const quote = await this.getQuote(CRYPTO_IDS.ETH);
		return quote?.price ?? null;
	}
}
