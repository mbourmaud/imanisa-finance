'use client'

import { useCallback, useState } from 'react'

import { useMembersQuery } from '@/features/members'
import { useBanksQuery, useInvalidateBanks } from './use-banks-query'
import type { Bank } from './use-banks-query'

export type { Bank }

export function useBanksPage() {
	const banksQuery = useBanksQuery()
	const membersQuery = useMembersQuery()
	const invalidateBanks = useInvalidateBanks()

	// Add account sheet state
	const [showAddAccount, setShowAddAccount] = useState(false)
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null)

	const handleAddAccountClick = useCallback((bank: Bank) => {
		setSelectedBank(bank)
		setShowAddAccount(true)
	}, [])

	const handleAccountCreated = useCallback(() => {
		invalidateBanks()
	}, [invalidateBanks])

	return {
		// Data
		data: banksQuery.data ?? null,
		members: membersQuery.data ?? [],
		isLoading: banksQuery.isLoading,
		isError: banksQuery.isError,
		error: banksQuery.error,

		// Add account sheet
		showAddAccount,
		setShowAddAccount,
		selectedBank,

		// Actions
		handleAddAccountClick,
		handleAccountCreated,
	}
}
