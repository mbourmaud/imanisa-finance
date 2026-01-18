/**
 * Member Repository
 * Handles data access for household members
 */

import type { Member } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export interface MemberWithAccounts extends Member {
	accountMembers: {
		id: string;
		ownerShare: number;
		account: {
			id: string;
			name: string;
			balance: number;
			bank: {
				id: string;
				name: string;
				color: string;
			};
		};
	}[];
}

export interface CreateMemberDTO {
	name: string;
	color?: string;
	avatarUrl?: string;
}

export interface UpdateMemberDTO {
	name?: string;
	color?: string;
	avatarUrl?: string;
}

/**
 * Member repository
 */
export const memberRepository = {
	/**
	 * Get all members
	 */
	async getAll(): Promise<Member[]> {
		return prisma.member.findMany({
			orderBy: { createdAt: 'asc' },
		});
	},

	/**
	 * Get all members with their account associations
	 */
	async getAllWithAccounts(): Promise<MemberWithAccounts[]> {
		return prisma.member.findMany({
			include: {
				accountMembers: {
					include: {
						account: {
							select: {
								id: true,
								name: true,
								balance: true,
								bank: {
									select: {
										id: true,
										name: true,
										color: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'asc' },
		});
	},

	/**
	 * Get a single member by ID
	 */
	async getById(id: string): Promise<Member | null> {
		return prisma.member.findUnique({
			where: { id },
		});
	},

	/**
	 * Get a single member by ID with account associations
	 */
	async getByIdWithAccounts(id: string): Promise<MemberWithAccounts | null> {
		return prisma.member.findUnique({
			where: { id },
			include: {
				accountMembers: {
					include: {
						account: {
							select: {
								id: true,
								name: true,
								balance: true,
								bank: {
									select: {
										id: true,
										name: true,
										color: true,
									},
								},
							},
						},
					},
				},
			},
		});
	},

	/**
	 * Create a new member
	 */
	async create(data: CreateMemberDTO): Promise<Member> {
		return prisma.member.create({
			data: {
				name: data.name,
				color: data.color,
				avatarUrl: data.avatarUrl,
			},
		});
	},

	/**
	 * Update a member
	 */
	async update(id: string, data: UpdateMemberDTO): Promise<Member> {
		return prisma.member.update({
			where: { id },
			data,
		});
	},

	/**
	 * Delete a member
	 */
	async delete(id: string): Promise<void> {
		await prisma.member.delete({
			where: { id },
		});
	},

	/**
	 * Get member count
	 */
	async count(): Promise<number> {
		return prisma.member.count();
	},

	/**
	 * Link a user to a member
	 */
	async linkUser(memberId: string, userId: string): Promise<Member> {
		return prisma.member.update({
			where: { id: memberId },
			data: {
				user: {
					connect: { id: userId },
				},
			},
		});
	},

	/**
	 * Unlink a user from a member
	 */
	async unlinkUser(memberId: string): Promise<Member> {
		return prisma.member.update({
			where: { id: memberId },
			data: {
				user: {
					disconnect: true,
				},
			},
		});
	},
};
