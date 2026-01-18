/**
 * User Repository
 * Handles data access for authenticated users
 */

import { prisma } from '@/lib/prisma'

export interface CreateUserDTO {
	id: string
	email: string
	name?: string | null
	avatarUrl?: string | null
}

export interface UpdateUserDTO {
	email?: string
	name?: string | null
	avatarUrl?: string | null
}

export interface User {
	id: string
	email: string
	name: string | null
	avatarUrl: string | null
	createdAt: Date
	memberId: string | null
}

/**
 * User repository
 */
export const userRepository = {
	/**
	 * Get a user by ID
	 */
	async getById(id: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { id },
		})
	},

	/**
	 * Get a user by email
	 */
	async getByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { email },
		})
	},

	/**
	 * Create a new user
	 */
	async create(data: CreateUserDTO): Promise<User> {
		return prisma.user.create({
			data: {
				id: data.id,
				email: data.email,
				name: data.name,
				avatarUrl: data.avatarUrl,
			},
		})
	},

	/**
	 * Update a user by ID
	 */
	async updateById(id: string, data: UpdateUserDTO): Promise<User> {
		return prisma.user.update({
			where: { id },
			data,
		})
	},

	/**
	 * Update a user by email (also updates the ID if needed)
	 */
	async updateByEmail(
		email: string,
		data: UpdateUserDTO & { id?: string },
	): Promise<User> {
		return prisma.user.update({
			where: { email },
			data,
		})
	},

	/**
	 * Upsert a user (sync from Supabase auth)
	 * This handles the case where a user may exist by email but with a different ID
	 */
	async syncFromAuth(
		supabaseId: string,
		email: string,
		name?: string | null,
		avatarUrl?: string | null,
	): Promise<User> {
		const existingUserById = await prisma.user.findUnique({
			where: { id: supabaseId },
		})
		const existingUserByEmail = email
			? await prisma.user.findUnique({ where: { email } })
			: null

		if (existingUserById) {
			// User exists with correct ID, update their info
			return prisma.user.update({
				where: { id: supabaseId },
				data: { email, name, avatarUrl },
			})
		}

		if (existingUserByEmail) {
			// User exists with different ID (from seed data), update to match Supabase
			return prisma.user.update({
				where: { email },
				data: { id: supabaseId, name, avatarUrl },
			})
		}

		// New user, create them
		return prisma.user.create({
			data: { id: supabaseId, email, name, avatarUrl },
		})
	},
}
