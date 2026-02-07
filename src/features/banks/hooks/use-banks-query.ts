/**
 * TanStack Query hooks for banks
 *
 * These hooks provide data fetching and caching for banks and their accounts.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'

// =============================================================================
// TYPES
// =============================================================================

export interface AccountMember {
	id: string
	name: string
	ownerShare: number
	color?: string | null
}

export interface BankAccount {
	id: string
	name: string
	balance: number
	type: string
	members: AccountMember[]
}

export interface Bank {
	id: string
	name: string
	logo: string | null
	color: string
	description: string | null
	type: 'BANK' | 'INVESTMENT'
	parserKey: string
	accountCount: number
	totalBalance: number
	accounts: BankAccount[]
}

export interface BanksSummary {
	totalBanksUsed: number
	totalBanksAvailable: number
	totalAccounts: number
	totalBalance: number
}

export interface BanksResponse {
	banks: Bank[]
	bankAccounts: Bank[]
	investmentAccounts: Bank[]
	usedBanks: Bank[]
	summary: BanksSummary
}

// =============================================================================
// QUERY KEY FACTORY
// =============================================================================

export const bankKeys = {
	all: ['banks'] as const,
	list: () => [...bankKeys.all, 'list'] as const,
}

// =============================================================================
// API SERVICE
// =============================================================================

const bankService = {
	async getAll(): Promise<BanksResponse> {
		const response = await fetch('/api/banks')
		if (!response.ok) throw new Error('Impossible de charger les banques')
		return response.json()
	},
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to fetch all banks with their accounts
 */
export function useBanksQuery() {
	return useQuery({
		queryKey: bankKeys.list(),
		queryFn: () => bankService.getAll(),
	})
}

/**
 * Invalidate banks query — use after mutations affecting banks
 */
export function useInvalidateBanks() {
	const queryClient = useQueryClient()
	return () => queryClient.invalidateQueries({ queryKey: bankKeys.list() })
}
