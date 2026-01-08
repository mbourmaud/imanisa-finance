import type { PriceQuote, PriceService } from './types';

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

export const ETF_TICKERS = {
	SP500_AMUNDI_PEA: 'PE500.PA',
	MSCI_WORLD_AMUNDI: 'CW8.PA'
} as const;

export const ISIN_TO_TICKER: Record<string, string> = {
	'FR0011871128': ETF_TICKERS.SP500_AMUNDI_PEA,
	'FR0010315770': ETF_TICKERS.MSCI_WORLD_AMUNDI
};

interface YahooChartResponse {
	chart: {
		result: Array<{
			meta: {
				regularMarketPrice: number;
				currency: string;
				previousClose: number;
				symbol: string;
			};
		}> | null;
		error: { code: string; description: string } | null;
	};
}

export class YahooFinanceService implements PriceService {
	async getQuote(ticker: string): Promise<PriceQuote | null> {
		try {
			const url = `${YAHOO_BASE_URL}/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; ImanisaFinance/1.0)'
				}
			});

			if (!response.ok) {
				console.error(`Yahoo Finance error: ${response.status}`);
				return null;
			}

			const data: YahooChartResponse = await response.json();

			if (!data.chart.result || data.chart.result.length === 0) {
				return null;
			}

			const meta = data.chart.result[0].meta;
			const price = meta.regularMarketPrice;
			const previousClose = meta.previousClose;
			const change = price - previousClose;
			const changePercent = (change / previousClose) * 100;

			return {
				ticker: meta.symbol,
				price,
				currency: meta.currency,
				change,
				changePercent,
				updatedAt: new Date()
			};
		} catch (error) {
			console.error(`Failed to fetch quote for ${ticker}:`, error);
			return null;
		}
	}

	async getQuotes(tickers: string[]): Promise<Map<string, PriceQuote>> {
		const results = new Map<string, PriceQuote>();
		const promises = tickers.map(async (ticker) => {
			const quote = await this.getQuote(ticker);
			if (quote) {
				results.set(ticker, quote);
			}
		});
		await Promise.all(promises);
		return results;
	}

	async getQuoteByISIN(isin: string): Promise<PriceQuote | null> {
		const ticker = ISIN_TO_TICKER[isin];
		if (!ticker) {
			console.error(`No ticker mapping for ISIN: ${isin}`);
			return null;
		}
		return this.getQuote(ticker);
	}
}
