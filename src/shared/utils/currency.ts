/**
 * Currency utilities using Dinero.js v2
 */

import { CHF, EUR, GBP, USD } from '@dinero.js/currencies';
import {
	add,
	allocate,
	dinero,
	isNegative,
	isPositive,
	isZero,
	multiply,
	subtract,
	toDecimal,
} from 'dinero.js';

// Currency configurations
export const currencies = {
	EUR,
	USD,
	GBP,
	CHF,
} as const;

export type CurrencyCode = keyof typeof currencies;

/**
 * Create a Dinero money object from a number (cents)
 */
export function money(amount: number, currency: CurrencyCode = 'EUR') {
	return dinero({ amount: Math.round(amount * 100), currency: currencies[currency] });
}

/**
 * Create a Dinero money object from cents
 */
export function moneyFromCents(cents: number, currency: CurrencyCode = 'EUR') {
	return dinero({ amount: cents, currency: currencies[currency] });
}

/**
 * Format money for display
 */
export function formatMoney(
	amount: number,
	currency: CurrencyCode = 'EUR',
	locale = 'fr-FR',
): string {
	const d = money(amount, currency);

	return toDecimal(d, ({ value, currency }) =>
		new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency.code,
		}).format(Number(value)),
	);
}

/**
 * Format money without decimals (compact)
 */
export function formatMoneyCompact(
	amount: number,
	currency: CurrencyCode = 'EUR',
	locale = 'fr-FR',
): string {
	const d = money(amount, currency);

	return toDecimal(d, ({ value, currency }) =>
		new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency.code,
			maximumFractionDigits: 0,
		}).format(Number(value)),
	);
}

/**
 * Format money in short notation (K, M for large amounts)
 */
export function formatMoneyShort(
	amount: number,
	currency: CurrencyCode = 'EUR',
	locale = 'fr-FR',
): string {
	const absAmount = Math.abs(amount);

	// Use compact notation for amounts >= 100K
	if (absAmount >= 100000) {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currencies[currency].code,
			notation: 'compact',
			maximumFractionDigits: 1,
		}).format(amount);
	}

	// Use normal formatting for smaller amounts but without decimals for >= 1000
	if (absAmount >= 1000) {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currencies[currency].code,
			maximumFractionDigits: 0,
		}).format(amount);
	}

	return formatMoney(amount, currency, locale);
}

/**
 * Format money with sign prefix (+/-)
 */
export function formatMoneyWithSign(
	amount: number,
	currency: CurrencyCode = 'EUR',
	locale = 'fr-FR',
): string {
	const prefix = amount >= 0 ? '+' : '';
	return prefix + formatMoney(amount, currency, locale);
}

/**
 * Add two money amounts
 */
export function addMoney(a: number, b: number, currency: CurrencyCode = 'EUR'): number {
	const result = add(money(a, currency), money(b, currency));
	return Number(toDecimal(result));
}

/**
 * Subtract money amounts
 */
export function subtractMoney(a: number, b: number, currency: CurrencyCode = 'EUR'): number {
	const result = subtract(money(a, currency), money(b, currency));
	return Number(toDecimal(result));
}

/**
 * Multiply money by a factor
 */
export function multiplyMoney(
	amount: number,
	factor: number,
	currency: CurrencyCode = 'EUR',
): number {
	const result = multiply(money(amount, currency), factor);
	return Number(toDecimal(result));
}

/**
 * Allocate money across multiple recipients (e.g., 60/40 split)
 */
export function allocateMoney(
	amount: number,
	ratios: number[],
	currency: CurrencyCode = 'EUR',
): number[] {
	const results = allocate(money(amount, currency), ratios);
	return results.map((d) => Number(toDecimal(d)));
}

/**
 * Check if amount is zero
 */
export function isMoneyZero(amount: number, currency: CurrencyCode = 'EUR'): boolean {
	return isZero(money(amount, currency));
}

/**
 * Check if amount is positive
 */
export function isMoneyPositive(amount: number, currency: CurrencyCode = 'EUR'): boolean {
	return isPositive(money(amount, currency));
}

/**
 * Check if amount is negative
 */
export function isMoneyNegative(amount: number, currency: CurrencyCode = 'EUR'): boolean {
	return isNegative(money(amount, currency));
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1, showSign = false): string {
	const formatted = value.toFixed(decimals);
	const sign = showSign && value > 0 ? '+' : '';
	return `${sign}${formatted}%`;
}

/**
 * Calculate percentage change
 */
export function percentChange(current: number, previous: number): number {
	if (previous === 0) return current === 0 ? 0 : 100;
	return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Calculate percentage of total
 */
export function percentOfTotal(value: number, total: number): number {
	if (total === 0) return 0;
	return (value / total) * 100;
}

/**
 * Sum an array of amounts
 */
export function sumAmounts(amounts: number[], currency: CurrencyCode = 'EUR'): number {
	if (amounts.length === 0) return 0;

	let total = money(0, currency);
	for (const amount of amounts) {
		total = add(total, money(amount, currency));
	}
	return Number(toDecimal(total));
}
