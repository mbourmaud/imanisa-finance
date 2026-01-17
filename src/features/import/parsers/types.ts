/**
 * Parser types for bank imports
 */

export interface ParsedTransaction {
	date: Date;
	description: string;
	amount: number;
	type: 'INCOME' | 'EXPENSE';
	bankCategory?: string;
	reference?: string;
	rawData?: Record<string, unknown>;
}

export interface ParsedPosition {
	symbol: string;
	isin?: string;
	name?: string;
	quantity: number;
	avgBuyPrice: number;
	currentPrice: number;
	currentValue: number;
	gainLoss: number;
	gainLossPercent: number;
	rawData?: Record<string, unknown>;
}

export interface ParseResult {
	success: boolean;
	transactions?: ParsedTransaction[];
	positions?: ParsedPosition[];
	errors?: string[];
	warnings?: string[];
}

export interface Parser {
	bankKey: string;
	name: string;
	supportedMimeTypes: string[];
	parse(content: string | ArrayBuffer, mimeType: string): Promise<ParseResult>;
}
