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

export interface BankFilters {
	memberId?: string
}

const bankService = {
	async getAll(filters?: BankFilters): Promise<BanksResponse> {
		const params = new URLSearchParams()
		if (filters?.memberId) params.set('memberId', filters.memberId)
		const url = params.toString() ? `/api/banks?${params}` : '/api/banks'
		const response = await fetch(url)
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
export function useBanksQuery(filters?: BankFilters) {
	return useQuery({
		queryKey: [...bankKeys.list(), { filters }],
		queryFn: () => bankService.getAll(filters),
	})
}

/**
 * Invalidate banks query — use after mutations affecting banks
 */
export function useInvalidateBanks() {
	const queryClient = useQueryClient()
	return () => queryClient.invalidateQueries({ queryKey: bankKeys.list() })
}
