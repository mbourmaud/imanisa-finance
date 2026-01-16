/**
 * DTO representing a parsed investment position from a broker file.
 * This is an intermediate format that will be converted to InvestmentPosition entity.
 */
export interface ParsedPosition {
	/** Asset symbol/ticker (e.g., "MSCI WORLD", "CW8") */
	symbol: string;
	/** ISIN code if available */
	isin?: string;
	/** Number of units/shares held */
	quantity: number;
	/** Average buy price (Prix de Revient Unitaire) */
	avgBuyPrice: number;
	/** Current market price per unit */
	currentPrice: number;
	/** Total current value (quantity * currentPrice) */
	currentValue: number;
	/** Gain/loss in currency (currentValue - invested) */
	gainLoss: number;
	/** Gain/loss as percentage */
	gainLossPercent: number;
	/** Currency (default EUR) */
	currency?: string;
	/** Market identifier code (e.g., "XPAR" for Euronext Paris) */
	mic?: string;
	/** Full asset name if different from symbol */
	name?: string;
	/** Raw category from broker (e.g., "ETF", "Actions", "Obligations") */
	rawCategory?: string;
}
