import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { YahooFinanceService, ETF_TICKERS } from '@infrastructure/prices/YahooFinanceService';
import { CoinGeckoService, CRYPTO_IDS } from '@infrastructure/prices/CoinGeckoService';

const yahooService = new YahooFinanceService();
const coinGeckoService = new CoinGeckoService();

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type');
	const ticker = url.searchParams.get('ticker');

	if (type === 'etf') {
		if (ticker) {
			const quote = await yahooService.getQuote(ticker);
			return json({ quote });
		}

		const quotes = await yahooService.getQuotes([ETF_TICKERS.SP500_AMUNDI_PEA, ETF_TICKERS.MSCI_WORLD_AMUNDI]);
		return json({
			quotes: Object.fromEntries(quotes)
		});
	}

	if (type === 'crypto') {
		if (ticker) {
			const quote = await coinGeckoService.getQuote(ticker.toLowerCase());
			return json({ quote });
		}

		const quotes = await coinGeckoService.getQuotes([CRYPTO_IDS.BTC, CRYPTO_IDS.ETH]);
		return json({
			quotes: Object.fromEntries(quotes)
		});
	}

	const [etfQuotes, cryptoQuotes] = await Promise.all([
		yahooService.getQuotes([ETF_TICKERS.SP500_AMUNDI_PEA, ETF_TICKERS.MSCI_WORLD_AMUNDI]),
		coinGeckoService.getQuotes([CRYPTO_IDS.BTC, CRYPTO_IDS.ETH])
	]);

	return json({
		etf: Object.fromEntries(etfQuotes),
		crypto: Object.fromEntries(cryptoQuotes)
	});
};
