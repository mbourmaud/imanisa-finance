/**
 * Category Rule Repository
 * Data access for categorization rules
 */

import type { RuleMatchType } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export const categoryRuleRepository = {
	async getActiveRules() {
		return prisma.categoryRule.findMany({
			where: { isActive: true },
			include: {
				category: {
					select: { id: true, name: true },
				},
			},
			orderBy: { priority: 'desc' },
		});
	},

	async getAll() {
		return prisma.categoryRule.findMany({
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true },
				},
			},
			orderBy: { priority: 'desc' },
		});
	},

	async create(data: {
		pattern: string;
		categoryId: string;
		matchType?: RuleMatchType;
		priority?: number;
		sourceFilter?: string;
	}) {
		return prisma.categoryRule.create({
			data: {
				pattern: data.pattern,
				categoryId: data.categoryId,
				matchType: data.matchType ?? 'CONTAINS',
				priority: data.priority ?? 100,
				sourceFilter: data.sourceFilter,
				isActive: true,
			},
		});
	},

	async update(
		id: string,
		data: Partial<{
			pattern: string;
			categoryId: string;
			matchType: RuleMatchType;
			priority: number;
			sourceFilter: string | null;
			isActive: boolean;
		}>,
	) {
		return prisma.categoryRule.update({
			where: { id },
			data,
		});
	},

	async delete(id: string) {
		await prisma.categoryRule.delete({
			where: { id },
		});
	},

	/**
	 * Find or create a rule for a specific pattern
	 * Used when a manual categorization creates a new rule
	 */
	async upsertByPattern(pattern: string, categoryId: string, priority: number = 200) {
		// Look for existing rule with same pattern
		const existing = await prisma.categoryRule.findFirst({
			where: { pattern, isActive: true },
		});

		if (existing) {
			return prisma.categoryRule.update({
				where: { id: existing.id },
				data: { categoryId, priority },
			});
		}

		return prisma.categoryRule.create({
			data: {
				pattern,
				categoryId,
				matchType: 'EXACT',
				priority,
				isActive: true,
			},
		});
	},
};
