/**
 * Bank Repository
 * Handles data access for Bank records
 */

import { prisma } from '@/lib/prisma';
import type { BankType } from '@prisma/client';

export interface Bank {
	id: string;
	name: string;
	logo: string | null;
	color: string;
	description: string | null;
	type: BankType;
	parserKey: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface BankWithAccountCount extends Bank {
	_count: {
		accounts: number;
	};
}

export interface CreateBankDTO {
	name: string;
	logo?: string;
	color: string;
	description?: string;
	type: BankType;
	parserKey: string;
}

export interface UpdateBankDTO {
	name?: string;
	logo?: string | null;
	color?: string;
	description?: string | null;
	parserKey?: string;
}

export const bankRepository = {
	/**
	 * Get all banks
	 */
	async getAll(): Promise<BankWithAccountCount[]> {
		return prisma.bank.findMany({
			include: {
				_count: {
					select: { accounts: true },
				},
			},
			orderBy: [{ type: 'asc' }, { name: 'asc' }],
		});
	},

	/**
	 * Get banks by type
	 */
	async getByType(type: BankType): Promise<BankWithAccountCount[]> {
		return prisma.bank.findMany({
			where: { type },
			include: {
				_count: {
					select: { accounts: true },
				},
			},
			orderBy: { name: 'asc' },
		});
	},

	/**
	 * Get a bank by ID
	 */
	async getById(id: string): Promise<Bank | null> {
		return prisma.bank.findUnique({
			where: { id },
		});
	},

	/**
	 * Get a bank by parser key
	 */
	async getByParserKey(parserKey: string): Promise<Bank | null> {
		return prisma.bank.findFirst({
			where: { parserKey },
		});
	},

	/**
	 * Create a new bank
	 */
	async create(data: CreateBankDTO): Promise<Bank> {
		return prisma.bank.create({
			data,
		});
	},

	/**
	 * Update a bank
	 */
	async update(id: string, data: UpdateBankDTO): Promise<Bank> {
		return prisma.bank.update({
			where: { id },
			data,
		});
	},

	/**
	 * Delete a bank (only if no accounts linked)
	 */
	async delete(id: string): Promise<void> {
		await prisma.bank.delete({
			where: { id },
		});
	},
};
