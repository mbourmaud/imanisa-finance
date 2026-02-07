/**
 * Categorization Log Repository
 * Audit trail for categorization pipeline runs
 */

import { prisma } from '@/lib/prisma';
import type { PipelineStats } from '@/server/services/categorization/types';

export const categorizationLogRepository = {
	async create(stats: PipelineStats & { errorMessage?: string }) {
		return prisma.categorizationLog.create({
			data: {
				transactionCount: stats.total,
				ruleMatches: stats.ruleMatches,
				bankMatches: stats.bankMatches,
				aiMatches: stats.aiMatches,
				transferMatches: stats.transferMatches,
				duration: stats.duration,
				estimatedCost: stats.estimatedCost,
				errorMessage: stats.errorMessage,
			},
		});
	},

	async getRecent(limit: number = 10) {
		return prisma.categorizationLog.findMany({
			orderBy: { createdAt: 'desc' },
			take: limit,
		});
	},
};
