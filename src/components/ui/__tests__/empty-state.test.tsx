import { render, within } from '@testing-library/react'
import { Inbox, Search } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from '../empty-state'

describe('EmptyState', () => {
	it('renders with required props', () => {
		const { container } = render(<EmptyState title="No items found" />)
		const emptyState = container.querySelector('[data-slot="empty-state"]')
		expect(emptyState).toBeInTheDocument()
		expect(within(emptyState as HTMLElement).getByText('No items found')).toBeInTheDocument()
	})

	it('renders with description', () => {
		const { container } = render(
			<EmptyState title="No items" description="Add some items to get started" />,
		)
		const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement
		expect(within(emptyState).getByText('Add some items to get started')).toBeInTheDocument()
	})

	it('renders with icon', () => {
		const { container } = render(<EmptyState title="No results" icon={Search} />)
		const svg = container.querySelector('svg')
		expect(svg).toBeInTheDocument()
	})

	it('renders with iconElement', () => {
		const { container } = render(
			<EmptyState title="No items" iconElement={<span data-testid="custom-icon">🎉</span>} />,
		)
		const icon = container.querySelector('[data-testid="custom-icon"]')
		expect(icon).toBeInTheDocument()
		expect(icon).toHaveTextContent('🎉')
	})

	it('renders with action', () => {
		const { container } = render(
			<EmptyState
				title="No items"
				action={
					<button type="button" data-testid="action-btn">
						Add Item
					</button>
				}
			/>,
		)
		const actionBtn = container.querySelector('[data-testid="action-btn"]')
		expect(actionBtn).toBeInTheDocument()
		expect(actionBtn).toHaveTextContent('Add Item')
	})

	it('accepts custom className', () => {
		const { container } = render(<EmptyState title="Custom" className="custom-class" />)
		const emptyState = container.querySelector('[data-slot="empty-state"]')
		expect(emptyState).toHaveClass('custom-class')
	})

	it('renders complete empty state with all features', () => {
		const { container } = render(
			<EmptyState
				icon={Inbox}
				title="Your inbox is empty"
				description="When you receive messages, they will appear here."
				action={
					<button type="button" data-testid="compose-btn">
						Compose
					</button>
				}
			/>,
		)

		const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement
		expect(container.querySelector('svg')).toBeInTheDocument()
		expect(within(emptyState).getByText('Your inbox is empty')).toBeInTheDocument()
		expect(
			within(emptyState).getByText('When you receive messages, they will appear here.'),
		).toBeInTheDocument()
		expect(container.querySelector('[data-testid="compose-btn"]')).toBeInTheDocument()
	})
})

describe('EmptyState accessibility', () => {
	it('has heading element for title', () => {
		const { container } = render(<EmptyState title="Empty" />)
		const heading = container.querySelector('h3')
		expect(heading).toBeInTheDocument()
		expect(heading).toHaveTextContent('Empty')
	})

	it('has paragraph element for description', () => {
		const { container } = render(<EmptyState title="Empty" description="No items" />)
		const paragraph = container.querySelector('p')
		expect(paragraph).toBeInTheDocument()
		expect(paragraph).toHaveTextContent('No items')
	})
})
