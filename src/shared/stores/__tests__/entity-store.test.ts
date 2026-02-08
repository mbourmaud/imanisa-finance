import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useEntityStore } from '../entity-store'

describe('useEntityStore', () => {
	beforeEach(() => {
		// Reset store state between tests
		useEntityStore.setState({
			entities: [
				{ id: 'family', name: 'Famille', type: 'family', memberIds: ['member-1', 'member-2'] },
				{ id: 'member-member-1', name: 'Alice', type: 'individual', memberIds: ['member-1'] },
				{ id: 'member-member-2', name: 'Bob', type: 'individual', memberIds: ['member-2'] },
			],
			selectedEntityId: 'family',
		})
	})

	describe('initial state', () => {
		it('should have default entity selected', () => {
			expect(useEntityStore.getState().selectedEntityId).toBe('family')
		})
	})

	describe('setSelectedEntity', () => {
		it('should update selected entity ID', () => {
			const { setSelectedEntity } = useEntityStore.getState()

			act(() => {
				setSelectedEntity('member-member-1')
			})

			expect(useEntityStore.getState().selectedEntityId).toBe('member-member-1')
		})
	})

	describe('setEntities', () => {
		it('should update entities and keep selection if valid', () => {
			const { setEntities } = useEntityStore.getState()

			act(() => {
				setEntities([
					{ id: 'family', name: 'Famille', type: 'family', memberIds: ['m-1'] },
					{ id: 'member-m-1', name: 'Charlie', type: 'individual', memberIds: ['m-1'] },
				])
			})

			expect(useEntityStore.getState().entities).toHaveLength(2)
			expect(useEntityStore.getState().selectedEntityId).toBe('family')
		})

		it('should reset to family if current selection becomes invalid', () => {
			useEntityStore.setState({ selectedEntityId: 'member-old' })

			act(() => {
				useEntityStore.getState().setEntities([
					{ id: 'family', name: 'Famille', type: 'family', memberIds: ['m-1'] },
					{ id: 'member-m-1', name: 'Charlie', type: 'individual', memberIds: ['m-1'] },
				])
			})

			expect(useEntityStore.getState().selectedEntityId).toBe('family')
		})
	})

	describe('getSelectedMemberId', () => {
		it('should return undefined for family entity', () => {
			const { getSelectedMemberId } = useEntityStore.getState()
			expect(getSelectedMemberId()).toBeUndefined()
		})

		it('should return member ID for individual entity', () => {
			const { setSelectedEntity, getSelectedMemberId } = useEntityStore.getState()

			act(() => {
				setSelectedEntity('member-member-1')
			})

			expect(useEntityStore.getState().getSelectedMemberId()).toBe('member-1')
		})

		it('should return undefined for non-existent entity', () => {
			useEntityStore.setState({ selectedEntityId: 'non-existent' })
			expect(useEntityStore.getState().getSelectedMemberId()).toBeUndefined()
		})
	})

	describe('persistence', () => {
		it('should persist selectedEntityId', () => {
			const { setSelectedEntity } = useEntityStore.getState()

			act(() => {
				setSelectedEntity('member-member-2')
			})

			expect(useEntityStore.getState().selectedEntityId).toBe('member-member-2')
		})
	})
})
