import type { InvestmentTransaction } from '@domain/investment/InvestmentTransaction';
import { InvestmentPosition } from '@domain/investment/InvestmentPosition';
import { UniqueId } from '@domain/shared/UniqueId';

/**
 * CoinGecko price data for a cryptocurrency
 */
interface CoinGeckoPrice {
	[currencyKey: string]: number;
}

/**
 * CoinGecko API response format
 */
interface CoinGeckoPriceResponse {
	[coinId: string]: CoinGeckoPrice;
}

/**
 * Aggregated transaction data for a single symbol
 */
interface AggregatedCrypto {
	symbol: string;
	totalQuantity: number;
	totalSpent: number; // Sum of all buy amounts (for PRU calculation)
	totalFees: number;
}

/**
 * Calculated position with current market data
 */
export interface CalculatedCryptoPosition {
	symbol: string;
	quantity: number;
	avgBuyPrice: number;
	currentPrice: number;
	currentValue: number;
	gainLoss: number;
	gainLossPercent: number;
}

/**
 * Result of the calculation
 */
export interface CalculateCryptoPositionsResult {
	positions: CalculatedCryptoPosition[];
	errors: string[];
}

/**
 * Mapping from common crypto symbols to CoinGecko IDs
 */
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
	BTC: 'bitcoin',
	ETH: 'ethereum',
	USDT: 'tether',
	USDC: 'usd-coin',
	BNB: 'binancecoin',
	XRP: 'ripple',
	ADA: 'cardano',
	DOGE: 'dogecoin',
	SOL: 'solana',
	DOT: 'polkadot',
	MATIC: 'matic-network',
	AVAX: 'avalanche-2',
	LINK: 'chainlink',
	LTC: 'litecoin',
	UNI: 'uniswap',
	ATOM: 'cosmos',
	XLM: 'stellar',
	ALGO: 'algorand',
	FIL: 'filecoin',
	VET: 'vechain',
	AAVE: 'aave',
	MKR: 'maker',
	COMP: 'compound-governance-token',
	SUSHI: 'sushi',
	CRV: 'curve-dao-token'
};

/**
 * Use case for calculating crypto positions from transaction history.
 *
 * Responsibilities:
 * - Aggregate buy/sell transactions by symbol
 * - Calculate weighted average PRU (Prix de Revient Unitaire)
 * - Fetch current prices from CoinGecko API
 * - Calculate current value, gain/loss, and gain/loss percentage
 * - Handle sell transactions by reducing quantity
 */
export class CalculateCryptoPositionsUseCase {
	private readonly coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';

	/**
	 * Calculate crypto positions from a list of transactions
	 *
	 * @param transactions List of investment transactions to aggregate
	 * @param sourceId The source ID to associate with created positions
	 * @returns Array of InvestmentPosition domain entities
	 */
	async execute(
		transactions: InvestmentTransaction[],
		sourceId: UniqueId
	): Promise<InvestmentPosition[]> {
		const result = await this.calculatePositions(transactions);

		// Convert calculated positions to domain entities
		const positions: InvestmentPosition[] = [];

		for (const calc of result.positions) {
			const positionResult = InvestmentPosition.create(
				{
					sourceId,
					symbol: calc.symbol,
					isin: null, // Crypto doesn't have ISIN
					quantity: calc.quantity,
					avgBuyPrice: calc.avgBuyPrice,
					currentPrice: calc.currentPrice,
					currentValue: calc.currentValue,
					gainLoss: calc.gainLoss,
					gainLossPercent: calc.gainLossPercent
				}
			);

			if (positionResult.isSuccess) {
				positions.push(positionResult.value);
			}
		}

		return positions;
	}

	/**
	 * Calculate positions and return raw data (useful for testing or direct use)
	 */
	async calculatePositions(
		transactions: InvestmentTransaction[]
	): Promise<CalculateCryptoPositionsResult> {
		const errors: string[] = [];

		// 1. Aggregate transactions by symbol
		const aggregated = this.aggregateTransactionsBySymbol(transactions);

		// Filter out positions with zero or negative quantity
		const nonZeroPositions = Array.from(aggregated.values()).filter(
			(agg) => agg.totalQuantity > 0
		);

		if (nonZeroPositions.length === 0) {
			return { positions: [], errors };
		}

		// 2. Fetch current prices from CoinGecko
		const symbols = nonZeroPositions.map((p) => p.symbol);
		let prices: Map<string, number>;

		try {
			prices = await this.fetchCurrentPrices(symbols);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			errors.push(`Failed to fetch current prices: ${message}`);
			// Return positions with 0 current price if API fails
			prices = new Map(symbols.map((s) => [s, 0]));
		}

		// 3. Calculate positions with current values
		const positions: CalculatedCryptoPosition[] = nonZeroPositions.map((agg) => {
			// PRU moyen = totalSpent / totalQuantity
			const avgBuyPrice = agg.totalQuantity > 0 ? agg.totalSpent / agg.totalQuantity : 0;
			const currentPrice = prices.get(agg.symbol) ?? 0;
			const currentValue = agg.totalQuantity * currentPrice;
			const invested = agg.totalQuantity * avgBuyPrice;
			const gainLoss = currentValue - invested;
			const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

			return {
				symbol: agg.symbol,
				quantity: this.round(agg.totalQuantity, 8), // Crypto can have many decimal places
				avgBuyPrice: this.round(avgBuyPrice, 2),
				currentPrice: this.round(currentPrice, 2),
				currentValue: this.round(currentValue, 2),
				gainLoss: this.round(gainLoss, 2),
				gainLossPercent: this.round(gainLossPercent, 2)
			};
		});

		// Add warning for symbols without prices
		for (const pos of positions) {
			if (pos.currentPrice === 0) {
				errors.push(`No price found for ${pos.symbol}`);
			}
		}

		return { positions, errors };
	}

	/**
	 * Aggregate transactions by symbol, calculating total quantity and weighted cost
	 *
	 * For buys: add quantity and totalAmount
	 * For sells: subtract quantity and reduce totalSpent proportionally
	 */
	private aggregateTransactionsBySymbol(
		transactions: InvestmentTransaction[]
	): Map<string, AggregatedCrypto> {
		const aggregated = new Map<string, AggregatedCrypto>();

		// Sort transactions by date to process in chronological order
		const sorted = [...transactions].sort(
			(a, b) => a.date.getTime() - b.date.getTime()
		);

		for (const tx of sorted) {
			const symbol = tx.symbol.toUpperCase();
			let agg = aggregated.get(symbol);

			if (!agg) {
				agg = {
					symbol,
					totalQuantity: 0,
					totalSpent: 0,
					totalFees: 0
				};
				aggregated.set(symbol, agg);
			}

			if (tx.type === 'buy') {
				// Add to position
				agg.totalQuantity += tx.quantity;
				agg.totalSpent += tx.totalAmount;
				agg.totalFees += tx.fee;
			} else if (tx.type === 'sell') {
				// Calculate the cost basis being removed
				// Use FIFO-like logic: reduce totalSpent proportionally
				if (agg.totalQuantity > 0) {
					const avgCost = agg.totalSpent / agg.totalQuantity;
					const soldQuantity = Math.min(tx.quantity, agg.totalQuantity);
					agg.totalQuantity -= soldQuantity;
					agg.totalSpent -= soldQuantity * avgCost;
				}
			}
		}

		return aggregated;
	}

	/**
	 * Fetch current prices from CoinGecko API
	 *
	 * @param symbols Array of crypto symbols (e.g., ["BTC", "ETH"])
	 * @returns Map of symbol to current price in EUR
	 */
	async fetchCurrentPrices(symbols: string[]): Promise<Map<string, number>> {
		const prices = new Map<string, number>();

		// Map symbols to CoinGecko IDs
		const coinIds: string[] = [];
		const idToSymbol = new Map<string, string>();

		for (const symbol of symbols) {
			const id = this.getCoinGeckoId(symbol);
			if (id) {
				coinIds.push(id);
				idToSymbol.set(id, symbol);
			}
		}

		if (coinIds.length === 0) {
			return prices;
		}

		// CoinGecko API: GET /simple/price?ids=bitcoin,ethereum&vs_currencies=eur
		const url = new URL(`${this.coinGeckoBaseUrl}/simple/price`);
		url.searchParams.set('ids', coinIds.join(','));
		url.searchParams.set('vs_currencies', 'eur');

		const response = await fetch(url.toString());

		if (!response.ok) {
			throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
		}

		const data: CoinGeckoPriceResponse = await response.json();

		// Map prices back to symbols
		for (const [id, priceData] of Object.entries(data)) {
			const symbol = idToSymbol.get(id);
			if (symbol && priceData.eur !== undefined) {
				prices.set(symbol, priceData.eur);
			}
		}

		return prices;
	}

	/**
	 * Get CoinGecko ID for a crypto symbol
	 */
	private getCoinGeckoId(symbol: string): string | undefined {
		return SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];
	}

	/**
	 * Round a number to specified decimal places
	 */
	private round(value: number, decimals: number): number {
		const factor = Math.pow(10, decimals);
		return Math.round(value * factor) / factor;
	}
}
