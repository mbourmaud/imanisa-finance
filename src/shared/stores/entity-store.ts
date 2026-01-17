'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { demoEntities } from '@/lib/demo';

/**
 * Entity type for filtering data
 */
export interface Entity {
	id: string;
	name: string;
	type: 'family' | 'individual';
	ownerIds: string[];
}

/**
 * Entity Store state interface
 */
interface EntityState {
	// Available entities
	entities: Entity[];

	// Currently selected entity
	selectedEntityId: string;

	// Computed
	selectedEntity: Entity | null;

	// Actions
	setSelectedEntity: (entityId: string) => void;
	getOwnerIds: () => string[];
}

/**
 * Global Entity store for filtering data by owner/entity
 */
export const useEntityStore = create<EntityState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state - use demo entities
				entities: demoEntities as Entity[],
				selectedEntityId: 'entity-all', // Default to family view

				// Computed getter
				get selectedEntity() {
					const state = get();
					return state.entities.find((e) => e.id === state.selectedEntityId) ?? null;
				},

				// Actions
				setSelectedEntity: (entityId) => {
					set({ selectedEntityId: entityId });
				},

				getOwnerIds: () => {
					const state = get();
					const entity = state.entities.find((e) => e.id === state.selectedEntityId);
					return entity?.ownerIds ?? [];
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
);
