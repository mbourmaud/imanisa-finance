import { TransactionType } from '@domain/transaction/TransactionType';
import { TransactionCategory } from '@domain/transaction/TransactionCategory';

export interface ParsedTransaction {
	date: Date;
	description: string;
	amount: number;
	type: TransactionType;
	category: TransactionCategory | null;
}

export interface ParsedPosition {
	name: string;
	isin: string | null;
	ticker: string | null;
	quantity: number;
	pru: number;
	currentPrice: number;
	currency: string;
}

export interface ParsedCryptoOrder {
	date: Date;
	crypto: string;
	quantity: number;
	price: number;
	fees: number;
	total: number;
	status: 'successful' | 'failed';
}

export interface XlsxParser<T> {
	parse(xmlContent: string, sharedStrings: string[]): T[];
}

export function extractSharedStrings(sharedStringsXml: string): string[] {
	const strings: string[] = [];
	const regex = /<t[^>]*>([^<]*)<\/t>/g;
	let match: RegExpExecArray | null = regex.exec(sharedStringsXml);
	while (match !== null) {
		strings.push(match[1]);
		match = regex.exec(sharedStringsXml);
	}
	return strings;
}

export function extractInlineString(cellXml: string): string | null {
	const match = cellXml.match(/<is><t>([^<]*)<\/t><\/is>/);
	return match ? match[1] : null;
}

export function extractCellValue(cellXml: string): string | null {
	const match = cellXml.match(/<v>([^<]*)<\/v>/);
	return match ? match[1] : null;
}

export function excelDateToJSDate(excelDate: number): Date {
	const epoch = new Date(1899, 11, 30);
	return new Date(epoch.getTime() + excelDate * 86400000);
}

export function parseAmount(value: string): number {
	const cleaned = value.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
	return parseFloat(cleaned) || 0;
}
