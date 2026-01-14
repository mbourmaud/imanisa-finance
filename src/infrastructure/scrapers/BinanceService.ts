/**
 * Binance API Service
 * Fetches account balances using official Binance API (read-only)
 */

import crypto from 'crypto';
import type { BinanceBalance, BinanceScraperData, ScraperResult } from './types';

interface BinanceConfig {
	apiKey: string;
	apiSecret: string;
}

interface BinanceSpotBalance {
	asset: string;
	free: string;
	locked: string;
}

interface BinanceAccountInfo {
	balances: BinanceSpotBalance[];
}

interface BinanceEarnPosition {
	asset: string;
	amount: string;
	amountInBTC: string;
}

interface BinanceSimpleEarnResponse {
	total: number;
	rows: BinanceEarnPosition[];
}

interface BinanceTickerPrice {
	symbol: string;
	price: string;
}

const BINANCE_BASE_URL = 'https://api.binance.com';

export class BinanceService {
	private config: BinanceConfig | null = null;

	constructor(apiKey?: string, apiSecret?: string) {
		if (apiKey && apiSecret) {
			this.config = { apiKey, apiSecret };
		}
	}

	isConfigured(): boolean {
		return this.config !== null;
	}

	private sign(queryString: string): string {
		if (!this.config) throw new Error('Binance not configured');
		return crypto.createHmac('sha256', this.config.apiSecret).update(queryString).digest('hex');
	}

	private async request<T>(
		endpoint: string,
		params: Record<string, string> = {},
		signed = false
	): Promise<T> {
		if (!this.config) throw new Error('Binance not configured');

		const url = new URL(endpoint, BINANCE_BASE_URL);

		if (signed) {
			params.timestamp = Date.now().toString();
			params.recvWindow = '5000';
		}

		const queryString = new URLSearchParams(params).toString();

		if (signed) {
			const signature = this.sign(queryString);
			url.search = `${queryString}&signature=${signature}`;
		} else if (queryString) {
			url.search = queryString;
		}

		const response = await fetch(url.toString(), {
			headers: {
				'X-MBX-APIKEY': this.config.apiKey
			}
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(`Binance API error: ${error.msg || response.statusText}`);
		}

		return response.json();
	}

	async getSpotBalances(): Promise<BinanceBalance[]> {
		const accountInfo = await this.request<BinanceAccountInfo>('/api/v3/account', {}, true);

		return accountInfo.balances
			.map((b) => ({
				asset: b.asset,
				free: parseFloat(b.free),
				locked: parseFloat(b.locked),
				total: parseFloat(b.free) + parseFloat(b.locked)
			}))
			.filter((b) => b.total > 0);
	}

	async getEarnBalances(): Promise<BinanceBalance[]> {
		try {
			// Simple Earn Flexible positions
			const flexibleResponse = await this.request<BinanceSimpleEarnResponse>(
				'/sapi/v1/simple-earn/flexible/position',
				{ size: '100' },
				true
			);

			const balances: BinanceBalance[] = [];

			if (flexibleResponse.rows) {
				for (const pos of flexibleResponse.rows) {
					const amount = parseFloat(pos.amount);
					if (amount > 0) {
						balances.push({
							asset: pos.asset,
							free: amount,
							locked: 0,
							total: amount
						});
					}
				}
			}

			// Simple Earn Locked positions
			try {
				const lockedResponse = await this.request<BinanceSimpleEarnResponse>(
					'/sapi/v1/simple-earn/locked/position',
					{ size: '100' },
					true
				);

				if (lockedResponse.rows) {
					for (const pos of lockedResponse.rows) {
						const amount = parseFloat(pos.amount);
						if (amount > 0) {
							const existing = balances.find((b) => b.asset === pos.asset);
							if (existing) {
								existing.locked += amount;
								existing.total += amount;
							} else {
								balances.push({
									asset: pos.asset,
									free: 0,
									locked: amount,
									total: amount
								});
							}
						}
					}
				}
			} catch {
				// Locked earn might not be available, continue without it
			}

			return balances;
		} catch (error) {
			console.warn('[Binance] Could not fetch earn balances:', error);
			return [];
		}
	}

	async getPrices(assets: string[]): Promise<Map<string, number>> {
		const prices = new Map<string, number>();

		// Get all ticker prices
		const tickers = await this.request<BinanceTickerPrice[]>('/api/v3/ticker/price');

		// Build a map for quick lookup
		const tickerMap = new Map<string, number>();
		for (const t of tickers) {
			tickerMap.set(t.symbol, parseFloat(t.price));
		}

		// Get EUR conversion rate via USDT
		const eurUsdtPrice = tickerMap.get('EURUSDT') || 1;
		const usdtEurRate = 1 / eurUsdtPrice;

		for (const asset of assets) {
			if (asset === 'EUR') {
				prices.set(asset, 1);
				continue;
			}

			if (asset === 'USDT') {
				prices.set(asset, usdtEurRate);
				continue;
			}

			// Try direct EUR pair first
			const eurPair = `${asset}EUR`;
			if (tickerMap.has(eurPair)) {
				prices.set(asset, tickerMap.get(eurPair)!);
				continue;
			}

			// Try via USDT
			const usdtPair = `${asset}USDT`;
			if (tickerMap.has(usdtPair)) {
				prices.set(asset, tickerMap.get(usdtPair)! * usdtEurRate);
				continue;
			}

			// Try via BTC
			const btcPair = `${asset}BTC`;
			const btcEurPrice = tickerMap.get('BTCEUR');
			if (tickerMap.has(btcPair) && btcEurPrice) {
				prices.set(asset, tickerMap.get(btcPair)! * btcEurPrice);
			}
		}

		return prices;
	}

	async scrape(): Promise<ScraperResult<BinanceScraperData>> {
		const source = 'Binance';

		if (!this.isConfigured()) {
			return {
				success: false,
				source,
				error: 'Binance API not configured',
				timestamp: new Date()
			};
		}

		try {
			console.log('[Binance] Fetching spot balances...');
			const spotBalances = await this.getSpotBalances();

			console.log('[Binance] Fetching earn balances...');
			const earnBalances = await this.getEarnBalances();

			// Merge balances
			const allAssets = new Set([
				...spotBalances.map((b) => b.asset),
				...earnBalances.map((b) => b.asset)
			]);

			console.log('[Binance] Fetching prices for', allAssets.size, 'assets...');
			const prices = await this.getPrices(Array.from(allAssets));

			// Calculate total in EUR
			let totalInEur = 0;

			for (const balance of spotBalances) {
				const price = prices.get(balance.asset) || 0;
				totalInEur += balance.total * price;
			}

			for (const balance of earnBalances) {
				const price = prices.get(balance.asset) || 0;
				totalInEur += balance.total * price;
			}

			console.log(`[Binance] Total value: ${totalInEur.toFixed(2)} EUR`);

			return {
				success: true,
				source,
				data: {
					spotBalances,
					earnBalances,
					totalInEur,
					prices
				},
				timestamp: new Date()
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('[Binance] Scrape failed:', errorMessage);

			return {
				success: false,
				source,
				error: errorMessage,
				timestamp: new Date()
			};
		}
	}
}
