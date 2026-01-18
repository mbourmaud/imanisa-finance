/**
 * Bank Import Parsers
 * Registry of all available parsers
 */

import { caisseEpargneParser } from './caisse-epargne';
import { creditMutuelParser } from './credit-mutuel';
import { genericParser } from './generic';
import type { ParseResult, Parser } from './types';

export type { ParsedPosition, ParsedTransaction, ParseResult, Parser } from './types';

/**
 * Registry of all available parsers
 * Key should match the bank's "template" field in the database
 */
const parsers: Map<string, Parser> = new Map([
	['credit_mutuel', creditMutuelParser],
	['Crédit Mutuel', creditMutuelParser],
	['CIC', creditMutuelParser],
	['caisse_epargne', caisseEpargneParser],
	['caisse_epargne_entreprise', caisseEpargneParser], // CE Pro uses same format
	["Caisse d'Épargne", caisseEpargneParser],
	["Caisse d'Épargne Pro", caisseEpargneParser],
	['other', genericParser],
]);

/**
 * Get a parser by bank key (template or name)
 * Falls back to generic parser if no specific parser found
 */
export function getParser(bankKey: string): Parser {
	// Try exact match first
	const exactMatch = parsers.get(bankKey);
	if (exactMatch) return exactMatch;

	// Try case-insensitive match
	const lowerKey = bankKey.toLowerCase();
	for (const [key, parser] of parsers.entries()) {
		if (key.toLowerCase() === lowerKey) return parser;
	}

	// Fallback to generic parser
	return genericParser;
}

/**
 * Get all available parsers
 */
export function getAllParsers(): Parser[] {
	return Array.from(parsers.values());
}

/**
 * Get parser info for a bank key
 */
export function getParserInfo(
	bankKey: string,
): { name: string; supportedMimeTypes: string[] } | null {
	const parser = parsers.get(bankKey);
	if (!parser) return null;

	return {
		name: parser.name,
		supportedMimeTypes: parser.supportedMimeTypes,
	};
}

/**
 * Parse content using the appropriate parser
 */
export async function parseImport(
	bankKey: string,
	content: string | ArrayBuffer,
	mimeType: string,
): Promise<ParseResult> {
	const parser = getParser(bankKey);

	if (!parser) {
		return {
			success: false,
			errors: [`No parser available for bank: ${bankKey}`],
		};
	}

	return parser.parse(content, mimeType);
}

/**
 * Bank templates with dedicated parsers
 * Use these as the "template" field when creating banks in the database
 */
export const BANK_TEMPLATES = [
	{ template: 'credit_mutuel', label: 'Crédit Mutuel / CIC', parser: 'Crédit Mutuel CSV' },
	{ template: 'caisse_epargne', label: "Caisse d'Épargne", parser: "Caisse d'Épargne CSV" },
	// Add more templates here as parsers are implemented
	// { template: 'boursorama', label: 'Boursorama', parser: 'Boursorama CSV' },
	// { template: 'bnp', label: 'BNP Paribas', parser: 'BNP CSV' },
] as const;
