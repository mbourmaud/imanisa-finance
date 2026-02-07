/**
 * AI Categorizer
 * Uses Claude Haiku to categorize transactions that couldn't be matched by rules
 */

import Anthropic from '@anthropic-ai/sdk';
import { categoryRuleRepository } from '@/server/repositories/category-rule-repository';
import type { CategorizationResult, TransactionForCategorization } from './types';

const BATCH_SIZE = 50;
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1;

// Category definitions for the prompt
const CATEGORY_DEFINITIONS = `
INCOME CATEGORIES (use only for positive amounts / income transactions):
- cat-salary: Salaire - Regular employment income, pay stubs
- cat-freelance: Freelance - Self-employment, consulting, freelance payments
- cat-dividends: Dividendes - Stock dividends, investment returns
- cat-rental-income: Revenus locatifs - Rental income from property
- cat-refund: Remboursement - Refunds, reimbursements, cashback
- cat-other-income: Autres revenus - Any other income not fitting above

EXPENSE CATEGORIES (use only for negative amounts / expense transactions):
- cat-housing: Logement - Rent, mortgage, property charges, syndic
- cat-utilities: Charges - Electricity, gas, water, phone, internet
- cat-groceries: Courses - Supermarkets, grocery stores, food shopping
- cat-restaurants: Restaurants - Dining out, food delivery, cafes
- cat-transport: Transport - Fuel, public transit, taxis, ride-sharing, tolls
- cat-health: Santé - Pharmacy, doctors, hospital, medical expenses
- cat-insurance: Assurance - All insurance premiums (home, car, health)
- cat-subscriptions: Abonnements - Streaming, apps, recurring digital services
- cat-shopping: Shopping - Clothing, electronics, general retail
- cat-leisure: Loisirs - Entertainment, sports, hobbies, cinema
- cat-travel: Voyages - Hotels, flights, vacation expenses
- cat-education: Éducation - School, courses, training, books
- cat-taxes: Impôts - Income tax, property tax, government fees (DGFIP)
- cat-fees: Frais bancaires - Bank fees, card fees, commissions
- cat-savings: Épargne - Savings account transfers, livret transfers
- cat-investment: Investissement - Investment purchases, brokerage transfers
- cat-loan-payment: Crédit - Loan repayments, mortgage installments (ECH PRET)
- cat-other-expense: Autres dépenses - Anything that doesn't fit above

SPECIAL:
- cat-transfer: Virement interne - Internal transfers between own accounts
`;

const FRENCH_BANKING_CONTEXT = `
French banking transaction patterns:
- "CB" = Carte Bancaire (card payment)
- "VIR" or "VIREMENT" = Bank transfer
- "PRLV" or "PRELEVEMENT" = Direct debit
- "ECH PRET" = Loan installment
- "DGFIP" = Tax authority
- "CHQ" = Check
- "RET DAB" = ATM withdrawal
- Dates in descriptions are DD.MM or DD/MM format
`;

interface AICategorizationItem {
	id: string;
	category: string;
	confidence: number;
	reasoning: string;
}

function buildSystemPrompt(existingRules: string[]): string {
	return `You are a French personal finance categorization assistant. Your job is to categorize bank transactions into the correct categories.

${CATEGORY_DEFINITIONS}

${FRENCH_BANKING_CONTEXT}

EXISTING MANUAL RULES (these patterns have been confirmed by the user):
${existingRules.length > 0 ? existingRules.join('\n') : '(none yet)'}

CRITICAL RULES:
1. Income transactions (positive amounts) MUST use income categories (cat-salary, cat-freelance, etc.)
2. Expense transactions (negative amounts) MUST use expense categories (cat-housing, cat-groceries, etc.)
3. If you're unsure, prefer cat-other-income or cat-other-expense over wrong categories
4. Confidence: 0.9 if very clear, 0.7-0.8 if somewhat clear, 0.5-0.6 if guessing
5. Use the existing manual rules as strong signals for similar patterns

Respond with a JSON array. Each object must have: id, category, confidence, reasoning.
No markdown, no code fences, just valid JSON.`;
}

function buildUserMessage(transactions: TransactionForCategorization[]): string {
	const items = transactions.map((tx) => ({
		id: tx.id,
		description: tx.description,
		amount: tx.amount,
		type: tx.type,
		date: tx.date.toISOString().split('T')[0],
		bankCategory: tx.bankCategory,
	}));

	return `Categorize these ${items.length} transactions:\n${JSON.stringify(items, null, 2)}`;
}

async function callClaude(
	client: Anthropic,
	systemPrompt: string,
	userMessage: string,
): Promise<{ items: AICategorizationItem[]; inputTokens: number; outputTokens: number }> {
	const response = await client.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 4096,
		system: systemPrompt,
		messages: [{ role: 'user', content: userMessage }],
	});

	const text = response.content[0].type === 'text' ? response.content[0].text : '';

	// Parse JSON response - handle potential markdown fences
	const cleanText = text
		.replace(/```json?\n?/g, '')
		.replace(/```\n?/g, '')
		.trim();
	const items: AICategorizationItem[] = JSON.parse(cleanText);

	return {
		items,
		inputTokens: response.usage.input_tokens,
		outputTokens: response.usage.output_tokens,
	};
}

/**
 * Categorize transactions using Claude Haiku
 * Processes in batches of 50, with timeout and retry
 */
export async function applyAICategorization(
	transactions: TransactionForCategorization[],
): Promise<{ results: CategorizationResult[]; estimatedCost: number }> {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		console.warn('[AI Categorizer] ANTHROPIC_API_KEY not set, skipping AI categorization');
		return { results: [], estimatedCost: 0 };
	}

	const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS });
	const results: CategorizationResult[] = [];
	let totalInputTokens = 0;
	let totalOutputTokens = 0;

	// Load existing rules for context
	const rules = await categoryRuleRepository.getActiveRules();
	const rulePatterns = rules.map((r) => `- "${r.pattern}" → ${r.category.name} (${r.categoryId})`);
	const systemPrompt = buildSystemPrompt(rulePatterns);

	// Process in batches
	for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
		const batch = transactions.slice(i, i + BATCH_SIZE);
		const userMessage = buildUserMessage(batch);

		let attempt = 0;
		while (attempt <= MAX_RETRIES) {
			try {
				const { items, inputTokens, outputTokens } = await callClaude(
					client,
					systemPrompt,
					userMessage,
				);

				totalInputTokens += inputTokens;
				totalOutputTokens += outputTokens;

				// Valid category IDs set for validation
				const validCategories = new Set([
					'cat-salary',
					'cat-freelance',
					'cat-dividends',
					'cat-rental-income',
					'cat-refund',
					'cat-other-income',
					'cat-housing',
					'cat-utilities',
					'cat-groceries',
					'cat-restaurants',
					'cat-transport',
					'cat-health',
					'cat-insurance',
					'cat-subscriptions',
					'cat-shopping',
					'cat-leisure',
					'cat-travel',
					'cat-education',
					'cat-taxes',
					'cat-fees',
					'cat-savings',
					'cat-investment',
					'cat-loan-payment',
					'cat-other-expense',
					'cat-transfer',
				]);

				for (const item of items) {
					if (validCategories.has(item.category) && item.confidence > 0) {
						results.push({
							transactionId: item.id,
							categoryId: item.category,
							source: 'AI',
							confidence: Math.min(item.confidence, 0.95), // Cap AI confidence
							reasoning: item.reasoning,
						});
					}
				}

				break; // Success, exit retry loop
			} catch (error) {
				attempt++;
				if (attempt > MAX_RETRIES) {
					console.error(
						`[AI Categorizer] Failed batch ${i / BATCH_SIZE + 1} after ${MAX_RETRIES + 1} attempts:`,
						error instanceof Error ? error.message : error,
					);
				}
			}
		}
	}

	// Estimate cost (Haiku pricing: $0.25/MTok input, $1.25/MTok output)
	const estimatedCost =
		(totalInputTokens * 0.25) / 1_000_000 + (totalOutputTokens * 1.25) / 1_000_000;

	console.log(
		`[AI Categorizer] Categorized ${results.length}/${transactions.length} transactions, ` +
			`tokens: ${totalInputTokens}in/${totalOutputTokens}out, ` +
			`estimated cost: $${estimatedCost.toFixed(4)}`,
	);

	return { results, estimatedCost };
}
