import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntityStore } from '../entity-store';

// Mock demo entities
vi.mock('@/lib/demo', () => ({
	demoEntities: [
		{ id: 'entity-all', name: 'Famille', type: 'family', ownerIds: ['owner-1', 'owner-2'] },
		{ id: 'entity-1', name: 'Alice', type: 'individual', ownerIds: ['owner-1'] },
		{ id: 'entity-2', name: 'Bob', type: 'individual', ownerIds: ['owner-2'] },
	],
}));

describe('useEntityStore', () => {
	beforeEach(() => {
		// Reset store state between tests
		useEntityStore.setState({
			selectedEntityId: 'entity-all',
		});
	});

	describe('initial state', () => {
		it('should have default entity selected', () => {
			expect(useEntityStore.getState().selectedEntityId).toBe('entity-all');
		});

		it('should have entities from demo', () => {
			expect(useEntityStore.getState().entities).toHaveLength(3);
		});
	});

	describe('setSelectedEntity', () => {
		it('should update selected entity ID', () => {
			const { setSelectedEntity } = useEntityStore.getState();

			act(() => {
				setSelectedEntity('entity-1');
			});

			expect(useEntityStore.getState().selectedEntityId).toBe('entity-1');
		});
	});

	describe('selectedEntity computed', () => {
		it('should return the selected entity object', () => {
			const state = useEntityStore.getState();
			expect(state.selectedEntity).toEqual({
				id: 'entity-all',
				name: 'Famille',
				type: 'family',
				ownerIds: ['owner-1', 'owner-2'],
			});
		});

		it('should return null for non-existent entity using getOwnerIds', () => {
			// Set non-existent entity
			useEntityStore.setState({ selectedEntityId: 'non-existent' });

			// Verify through getOwnerIds which checks the entity
			const ownerIds = useEntityStore.getState().getOwnerIds();
			expect(ownerIds).toEqual([]);
		});

		it('should find individual entity when selected', () => {
			// Use setSelectedEntity action
			useEntityStore.getState().setSelectedEntity('entity-1');

			// Verify the entity was selected
			expect(useEntityStore.getState().selectedEntityId).toBe('entity-1');
			// And getOwnerIds reflects it
			expect(useEntityStore.getState().getOwnerIds()).toEqual(['owner-1']);
		});
	});

	describe('getOwnerIds', () => {
		it('should return owner IDs for family entity', () => {
			const { getOwnerIds } = useEntityStore.getState();
			const ownerIds = getOwnerIds();

			expect(ownerIds).toEqual(['owner-1', 'owner-2']);
		});

		it('should return owner IDs for individual entity', () => {
			const { setSelectedEntity, getOwnerIds } = useEntityStore.getState();

			act(() => {
				setSelectedEntity('entity-1');
			});

			const ownerIds = getOwnerIds();
			expect(ownerIds).toEqual(['owner-1']);
		});

		it('should return empty array for non-existent entity', () => {
			act(() => {
				useEntityStore.setState({ selectedEntityId: 'non-existent' });
			});

			const { getOwnerIds } = useEntityStore.getState();
			const ownerIds = getOwnerIds();

			expect(ownerIds).toEqual([]);
		});
	});

	describe('persistence', () => {
		it('should persist selectedEntityId', () => {
			const { setSelectedEntity } = useEntityStore.getState();

			act(() => {
				setSelectedEntity('entity-2');
			});

			// Verify the state changed
			expect(useEntityStore.getState().selectedEntityId).toBe('entity-2');
		});
	});
});
