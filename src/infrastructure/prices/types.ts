export interface PriceQuote {
	ticker: string;
	price: number;
	currency: string;
	change: number;
	changePercent: number;
	updatedAt: Date;
}

export interface PriceService {
	getQuote(ticker: string): Promise<PriceQuote | null>;
	getQuotes(tickers: string[]): Promise<Map<string, PriceQuote>>;
}
