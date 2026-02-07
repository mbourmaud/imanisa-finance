/**
 * Recurring Pattern Repository
 * Data access for detected recurring transaction patterns (subscriptions, loans, etc.)
 */

import type { RecurringFrequency } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export const recurringPatternRepository = {
	async getAll() {
		return prisma.recurringPattern.findMany({
			where: { isActive: true },
			include: {
				account: { select: { id: true, name: true } },
				category: { select: { id: true, name: true, icon: true, color: true } },
			},
			orderBy: { lastSeenAt: 'desc' },
		});
	},

	async create(data: {
		description: string;
		normalizedDescription: string;
		amount: number;
		frequency: RecurringFrequency;
		tolerancePercent?: number;
		accountId?: string;
		categoryId?: string;
		occurrenceCount: number;
		lastSeenAt?: Date;
	}) {
		return prisma.recurringPattern.create({
			data: {
				description: data.description,
				normalizedDescription: data.normalizedDescription,
				amount: data.amount,
				frequency: data.frequency,
				tolerancePercent: data.tolerancePercent ?? 10,
				accountId: data.accountId,
				categoryId: data.categoryId,
				occurrenceCount: data.occurrenceCount,
				lastSeenAt: data.lastSeenAt ?? new Date(),
				isActive: true,
			},
		});
	},

	async upsertByDescription(
		normalizedDescription: string,
		data: {
			description: string;
			amount: number;
			frequency: RecurringFrequency;
			accountId?: string;
			categoryId?: string;
			occurrenceCount: number;
			lastSeenAt: Date;
		},
	) {
		const existing = await prisma.recurringPattern.findFirst({
			where: { normalizedDescription, isActive: true },
		});

		if (existing) {
			return prisma.recurringPattern.update({
				where: { id: existing.id },
				data: {
					amount: data.amount,
					frequency: data.frequency,
					occurrenceCount: data.occurrenceCount,
					lastSeenAt: data.lastSeenAt,
					categoryId: data.categoryId,
				},
			});
		}

		return prisma.recurringPattern.create({
			data: {
				description: data.description,
				normalizedDescription,
				amount: data.amount,
				frequency: data.frequency,
				accountId: data.accountId,
				categoryId: data.categoryId,
				occurrenceCount: data.occurrenceCount,
				lastSeenAt: data.lastSeenAt,
				isActive: true,
			},
		});
	},

	async delete(id: string) {
		await prisma.recurringPattern.update({
			where: { id },
			data: { isActive: false },
		});
	},
};
