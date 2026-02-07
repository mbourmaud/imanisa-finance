/**
 * Rule Engine
 * Matches transaction descriptions against categorization rules
 * Priority: EXACT → STARTS_WITH → CONTAINS → REGEX
 */

import { categoryRuleRepository } from '@/server/repositories/category-rule-repository';
import type { CategorizationResult, TransactionForCategorization } from './types';

/**
 * Normalize a description for matching:
 * uppercase, trim, remove accents, collapse whitespace
 */
export function normalizeDescription(description: string): string {
	return description
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toUpperCase()
		.trim()
		.replace(/\s+/g, ' ');
}

interface LoadedRule {
	id: string;
	pattern: string;
	normalizedPattern: string;
	matchType: string;
	categoryId: string;
	priority: number;
}

let cachedRules: LoadedRule[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

async function loadRules(): Promise<LoadedRule[]> {
	const now = Date.now();
	if (cachedRules && now - cacheTimestamp < CACHE_TTL) {
		return cachedRules;
	}

	const rules = await categoryRuleRepository.getActiveRules();
	cachedRules = rules.map((rule) => ({
		id: rule.id,
		pattern: rule.pattern,
		normalizedPattern: normalizeDescription(rule.pattern),
		matchType: rule.matchType,
		categoryId: rule.categoryId,
		priority: rule.priority,
	}));
	cacheTimestamp = now;
	return cachedRules;
}

/**
 * Clear the rules cache (call after rule modifications)
 */
export function clearRuleCache(): void {
	cachedRules = null;
	cacheTimestamp = 0;
}

function matchRule(normalizedDescription: string, rule: LoadedRule): boolean {
	switch (rule.matchType) {
		case 'EXACT':
			return normalizedDescription === rule.normalizedPattern;
		case 'STARTS_WITH':
			return normalizedDescription.startsWith(rule.normalizedPattern);
		case 'CONTAINS':
			return normalizedDescription.includes(rule.normalizedPattern);
		case 'REGEX':
			try {
				return new RegExp(rule.pattern, 'i').test(normalizedDescription);
			} catch {
				return false;
			}
		default:
			return false;
	}
}

/**
 * Apply rule engine to a list of transactions
 * Returns categorization results for matched transactions
 */
export async function applyRuleEngine(
	transactions: TransactionForCategorization[],
): Promise<CategorizationResult[]> {
	const rules = await loadRules();
	const results: CategorizationResult[] = [];

	for (const tx of transactions) {
		const normalized = normalizeDescription(tx.description);

		// Rules are already sorted by priority DESC
		// First match wins
		for (const rule of rules) {
			if (matchRule(normalized, rule)) {
				results.push({
					transactionId: tx.id,
					categoryId: rule.categoryId,
					source: 'RULE',
					confidence: 1.0,
				});
				break;
			}
		}
	}

	return results;
}
