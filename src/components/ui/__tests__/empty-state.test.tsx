import { render, within } from '@testing-library/react';
import { Inbox, Search } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import {
	EmptyState,
	EmptyStateError,
	EmptyStateNoAccounts,
	EmptyStateNoResults,
	EmptyStateNoTransactions,
} from '../empty-state';

describe('EmptyState', () => {
	it('renders with required props', () => {
		const { container } = render(<EmptyState title="No items found" />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).toBeInTheDocument();
		expect(within(emptyState as HTMLElement).getByText('No items found')).toBeInTheDocument();
	});

	it('renders with description', () => {
		const { container } = render(
			<EmptyState title="No items" description="Add some items to get started" />,
		);
		const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement;
		expect(within(emptyState).getByText('Add some items to get started')).toBeInTheDocument();
	});

	it('renders with icon', () => {
		const { container } = render(<EmptyState title="No results" icon={Search} />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders with iconElement', () => {
		const { container } = render(
			<EmptyState title="No items" iconElement={<span data-testid="custom-icon">🎉</span>} />,
		);
		const icon = container.querySelector('[data-testid="custom-icon"]');
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveTextContent('🎉');
	});

	it('renders with size sm', () => {
		const { container } = render(<EmptyState title="Small" size="sm" icon={Search} />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).toHaveClass('py-8');
		const iconContainer = container.querySelector('.h-16.w-16');
		expect(iconContainer).toBeInTheDocument();
	});

	it('renders with size md (default)', () => {
		const { container } = render(<EmptyState title="Medium" size="md" icon={Search} />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).toHaveClass('py-12');
		const iconContainer = container.querySelector('.h-20.w-20');
		expect(iconContainer).toBeInTheDocument();
	});

	it('renders with size lg', () => {
		const { container } = render(<EmptyState title="Large" size="lg" icon={Search} />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).toHaveClass('py-16');
		const iconContainer = container.querySelector('.h-24.w-24');
		expect(iconContainer).toBeInTheDocument();
	});

	it('renders with variant default', () => {
		const { container } = render(<EmptyState title="Default" variant="default" />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).not.toHaveClass('glass-card');
	});

	it('renders with variant card', () => {
		const { container } = render(<EmptyState title="Card" variant="card" />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).toHaveClass('glass-card', 'p-8');
	});

	it('renders with variant inline', () => {
		const { container } = render(<EmptyState title="Inline" variant="inline" />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).toHaveClass('flex-row', 'text-left');
	});

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
		);
		const actionBtn = container.querySelector('[data-testid="action-btn"]');
		expect(actionBtn).toBeInTheDocument();
		expect(actionBtn).toHaveTextContent('Add Item');
	});

	it('accepts custom className', () => {
		const { container } = render(<EmptyState title="Custom" className="custom-class" />);
		const emptyState = container.querySelector('[data-slot="empty-state"]');
		expect(emptyState).toHaveClass('custom-class');
	});

	it('renders complete empty state with all features', () => {
		const { container } = render(
			<EmptyState
				icon={Inbox}
				title="Your inbox is empty"
				description="When you receive messages, they will appear here."
				size="lg"
				variant="card"
				action={
					<button type="button" data-testid="compose-btn">
						Compose
					</button>
				}
			/>,
		);

		const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement;
		expect(emptyState).toHaveClass('glass-card', 'p-8');
		expect(container.querySelector('svg')).toBeInTheDocument();
		expect(within(emptyState).getByText('Your inbox is empty')).toBeInTheDocument();
		expect(
			within(emptyState).getByText('When you receive messages, they will appear here.'),
		).toBeInTheDocument();
		expect(container.querySelector('[data-testid="compose-btn"]')).toBeInTheDocument();
	});
});

describe('EmptyState Presets', () => {
	describe('EmptyStateNoAccounts', () => {
		it('renders with correct content', () => {
			const { container } = render(<EmptyStateNoAccounts />);
			const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement;
			expect(within(emptyState).getByText('Aucun compte')).toBeInTheDocument();
			expect(within(emptyState).getByText(/pas encore ajouté de compte/)).toBeInTheDocument();
			expect(within(emptyState).getByText('🏦')).toBeInTheDocument();
		});

		it('accepts action prop', () => {
			const { container } = render(
				<EmptyStateNoAccounts
					action={
						<button type="button" data-testid="add-account">
							Ajouter
						</button>
					}
				/>,
			);
			expect(container.querySelector('[data-testid="add-account"]')).toBeInTheDocument();
		});
	});

	describe('EmptyStateNoTransactions', () => {
		it('renders with correct content', () => {
			const { container } = render(<EmptyStateNoTransactions />);
			const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement;
			expect(within(emptyState).getByText('Aucune transaction')).toBeInTheDocument();
			expect(within(emptyState).getByText(/pas encore de transactions/)).toBeInTheDocument();
			expect(within(emptyState).getByText('📄')).toBeInTheDocument();
		});
	});

	describe('EmptyStateNoResults', () => {
		it('renders with correct content', () => {
			const { container } = render(<EmptyStateNoResults />);
			const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement;
			expect(within(emptyState).getByText('Aucun résultat')).toBeInTheDocument();
			expect(within(emptyState).getByText(/correspond à votre recherche/)).toBeInTheDocument();
			expect(within(emptyState).getByText('🔍')).toBeInTheDocument();
		});
	});

	describe('EmptyStateError', () => {
		it('renders with correct content', () => {
			const { container } = render(<EmptyStateError />);
			const emptyState = container.querySelector('[data-slot="empty-state"]') as HTMLElement;
			expect(within(emptyState).getByText('Une erreur est survenue')).toBeInTheDocument();
			expect(within(emptyState).getByText(/Impossible de charger/)).toBeInTheDocument();
			expect(within(emptyState).getByText('⚠️')).toBeInTheDocument();
		});

		it('accepts action prop for retry', () => {
			const { container } = render(
				<EmptyStateError
					action={
						<button type="button" data-testid="retry">
							Réessayer
						</button>
					}
				/>,
			);
			expect(container.querySelector('[data-testid="retry"]')).toBeInTheDocument();
		});
	});
});

describe('EmptyState accessibility', () => {
	it('has heading element for title', () => {
		const { container } = render(<EmptyState title="Empty" />);
		const heading = container.querySelector('h3');
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent('Empty');
	});

	it('has paragraph element for description', () => {
		const { container } = render(<EmptyState title="Empty" description="No items" />);
		const paragraph = container.querySelector('p');
		expect(paragraph).toBeInTheDocument();
		expect(paragraph).toHaveTextContent('No items');
	});
});
