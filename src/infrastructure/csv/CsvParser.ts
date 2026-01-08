import { TransactionType } from '@domain/transaction/TransactionType';
import { TransactionCategory } from '@domain/transaction/TransactionCategory';

export interface ParsedTransaction {
	date: Date;
	description: string;
	amount: number;
	type: TransactionType;
	category: TransactionCategory | null;
}

export interface CsvParser {
	parse(content: string): ParsedTransaction[];
}

export function parseCSV(content: string, delimiter: string = ';'): string[][] {
	const lines = content.trim().split('\n');
	return lines.map((line) => {
		const result: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === delimiter && !inQuotes) {
				result.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}
		result.push(current.trim());
		return result;
	});
}

export function parseAmount(value: string): number {
	const cleaned = value
		.replace(/\s/g, '')
		.replace(',', '.')
		.replace(/[^0-9.-]/g, '');
	return parseFloat(cleaned) || 0;
}

export function parseDate(value: string, format: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'DD/MM/YYYY'): Date {
	const cleaned = value.trim();
	
	if (format === 'DD/MM/YYYY') {
		const [day, month, year] = cleaned.split('/').map(Number);
		return new Date(year, month - 1, day);
	}
	
	if (format === 'YYYY-MM-DD') {
		return new Date(cleaned);
	}
	
	if (format === 'MM/DD/YYYY') {
		const [month, day, year] = cleaned.split('/').map(Number);
		return new Date(year, month - 1, day);
	}
	
	return new Date(cleaned);
}
