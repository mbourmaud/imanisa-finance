'use client'

import { useEffect } from 'react'
import { useMembersQuery } from '@/features/members'
import { type Entity, useEntityStore } from '@/shared/stores'

/**
 * Syncs the entity store with real members from the database.
 *
 * Builds entities dynamically:
 * - One "family" entity (all members)
 * - One "individual" entity per member (real member ID)
 *
 * Call this once in the app layout so it runs on every page.
 */
export function useEntitySync() {
	const { data: members } = useMembersQuery()
	const setEntities = useEntityStore((s) => s.setEntities)

	useEffect(() => {
		if (!members || members.length === 0) return

		const allMemberIds = members.map((m) => m.id)

		const entities: Entity[] = [
			{
				id: 'family',
				name: 'Patrimoine familial',
				type: 'family',
				memberIds: allMemberIds,
			},
			...members.map((m) => ({
				id: `member-${m.id}`,
				name: m.name,
				type: 'individual' as const,
				memberIds: [m.id],
			})),
		]

		setEntities(entities)
	}, [members, setEntities])
}
