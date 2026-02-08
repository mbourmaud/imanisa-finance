'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Entity type for filtering data.
 * - "family" = all members (no filter)
 * - "individual" = a single member, memberId is the real DB member ID
 */
export interface Entity {
	id: string
	name: string
	type: 'family' | 'individual'
	/** Real member IDs from the database */
	memberIds: string[]
}

/**
 * Entity Store state interface
 */
interface EntityState {
	entities: Entity[]
	selectedEntityId: string
	selectedEntity: Entity | null

	// Actions
	setSelectedEntity: (entityId: string) => void
	setEntities: (entities: Entity[]) => void
	getSelectedMemberId: () => string | undefined
}

/**
 * Global Entity store for filtering data by owner/entity.
 *
 * Entities are populated dynamically from real members via useEntitySync().
 * The store starts empty and gets hydrated once members are loaded.
 */
export const useEntityStore = create<EntityState>()(
	devtools(
		persist(
			(set, get) => ({
				entities: [],
				selectedEntityId: 'family',

				get selectedEntity() {
					const state = get()
					return state.entities.find((e) => e.id === state.selectedEntityId) ?? null
				},

				setSelectedEntity: (entityId) => {
					set({ selectedEntityId: entityId })
				},

				setEntities: (entities) => {
					// Never reset selectedEntityId here — persist middleware may not
					// have rehydrated yet. Invalid selection is handled by the getter.
					set({ entities })
				},

				/**
				 * Returns the real member ID when an individual is selected,
				 * or undefined for the family (all) view.
				 */
				getSelectedMemberId: () => {
					const state = get()
					const entity = state.entities.find((e) => e.id === state.selectedEntityId)
					if (!entity || entity.type === 'family') return undefined
					return entity.memberIds[0]
				},
			}),
			{
				name: 'entity-store',
				partialize: (state) => ({
					selectedEntityId: state.selectedEntityId,
				}),
			},
		),
		{ name: 'entity-store' },
	),
)
