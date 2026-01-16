/**
 * DTO representing a parsed investment transaction from a broker file.
 * This is an intermediate format that will be converted to InvestmentTransaction entity.
 */
export interface ParsedInvestmentTransaction {
	/** Transaction date */
	date: Date;
	/** Asset symbol/ticker */
	symbol: string;
	/** Transaction type */
	type: 'buy' | 'sell';
	/** Number of units traded */
	quantity: number;
	/** Price per unit at transaction time */
	pricePerUnit: number;
	/** Total transaction amount (quantity * pricePerUnit) */
	totalAmount: number;
	/** Transaction fees */
	fee: number;
	/** Currency (default EUR) */
	currency?: string;
	/** Transaction status (for filtering failed transactions) */
	status?: 'successful' | 'failed' | 'pending';
	/** Broker-specific transaction ID */
	transactionId?: string;
	/** Payment method (for crypto: card, bank transfer, etc.) */
	paymentMethod?: string;
}
