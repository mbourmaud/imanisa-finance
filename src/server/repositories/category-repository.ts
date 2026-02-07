/**
 * Category Repository
 * Data access for transaction categories
 */

import { prisma } from '@/lib/prisma';

export const categoryRepository = {
	async getAll() {
		return prisma.category.findMany({
			include: {
				_count: {
					select: { transactionCategories: true, rules: true },
				},
			},
			orderBy: { name: 'asc' },
		});
	},

	async getById(id: string) {
		return prisma.category.findUnique({
			where: { id },
			include: {
				rules: { orderBy: { priority: 'desc' } },
				_count: {
					select: { transactionCategories: true },
				},
			},
		});
	},

	async create(data: { name: string; icon?: string; color?: string; parentId?: string }) {
		return prisma.category.create({
			data: {
				name: data.name,
				icon: data.icon ?? '📁',
				color: data.color ?? '#808080',
				parentId: data.parentId,
			},
		});
	},

	async update(
		id: string,
		data: Partial<{ name: string; icon: string; color: string; parentId: string | null }>,
	) {
		return prisma.category.update({
			where: { id },
			data,
		});
	},

	async delete(id: string) {
		await prisma.category.delete({
			where: { id },
		});
	},
};
