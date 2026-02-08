'use client'

import { useState } from 'react'
import { useMembersQuery } from '@/features/members/hooks/use-members-query'
import { useSelectedMemberId } from '@/shared/hooks'
import { usePropertiesQuery } from '..'

export function useRealEstatePage() {
	const memberId = useSelectedMemberId()
	const { data, isLoading, isError, error, refetch } = usePropertiesQuery(
		memberId ? { memberId } : undefined,
	)
	const { data: members = [] } = useMembersQuery()

	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	// Derived data from query
	const properties = data?.properties ?? []
	const summary = data?.summary ?? null

	return {
		// Query state
		properties,
		summary,
		isLoading,
		isError,
		error,
		refetch,

		// Members
		members,

		// Dialog state
		isDialogOpen,
		setIsDialogOpen,
	}
}
