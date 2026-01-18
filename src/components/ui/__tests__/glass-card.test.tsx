import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GlassCard, GlassCardContent, GlassCardFooter, GlassCardHeader } from '../glass-card';

describe('GlassCard', () => {
	it('renders with default props', () => {
		const { container } = render(<GlassCard>Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toBeInTheDocument();
		expect(card).toHaveClass('glass-card', 'p-6');
	});

	it('renders with variant default', () => {
		const { container } = render(<GlassCard variant="default">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('glass-card');
	});

	it('renders with variant elevated', () => {
		const { container } = render(<GlassCard variant="elevated">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('glass-card');
		// Elevated has shadow classes
		expect(card?.className).toContain('shadow');
	});

	it('renders with variant flat', () => {
		const { container } = render(<GlassCard variant="flat">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('rounded-2xl', 'border', 'bg-card/50', 'backdrop-blur-sm');
	});

	it('renders with variant interactive', () => {
		const { container } = render(<GlassCard variant="interactive">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('glass-card', 'cursor-pointer', 'transition-all', 'duration-200');
	});

	it('renders with padding sm', () => {
		const { container } = render(<GlassCard padding="sm">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('p-4');
	});

	it('renders with padding md (default)', () => {
		const { container } = render(<GlassCard padding="md">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('p-6');
	});

	it('renders with padding lg', () => {
		const { container } = render(<GlassCard padding="lg">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('p-8');
	});

	it('renders with accent coral', () => {
		const { container } = render(<GlassCard accent="coral">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('relative');
		expect(card?.className).toContain('before:');
	});

	it('renders with accent teal', () => {
		const { container } = render(<GlassCard accent="teal">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('relative');
	});

	it('renders with accent purple', () => {
		const { container } = render(<GlassCard accent="purple">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('relative');
	});

	it('renders with accent gold', () => {
		const { container } = render(<GlassCard accent="gold">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('relative');
	});

	it('renders with accent mint', () => {
		const { container } = render(<GlassCard accent="mint">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('relative');
	});

	it('renders with accent primary', () => {
		const { container } = render(<GlassCard accent="primary">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('relative');
	});

	it('accepts custom className', () => {
		const { container } = render(<GlassCard className="custom-class">Content</GlassCard>);
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('custom-class');
	});

	it('renders children', () => {
		render(
			<GlassCard>
				<span data-testid="child">Child content</span>
			</GlassCard>,
		);
		expect(screen.getByTestId('child')).toBeInTheDocument();
	});
});

describe('GlassCardHeader', () => {
	it('renders with default props', () => {
		const { container } = render(<GlassCardHeader>Header</GlassCardHeader>);
		const header = container.querySelector('[data-slot="glass-card-header"]');
		expect(header).toBeInTheDocument();
		expect(header).toHaveClass('flex', 'items-start', 'justify-between', 'gap-4', 'pb-4');
	});

	it('renders with title prop', () => {
		render(<GlassCardHeader title="Card Title" />);
		expect(screen.getByText('Card Title')).toBeInTheDocument();
		expect(screen.getByText('Card Title').tagName).toBe('H3');
	});

	it('renders with description prop', () => {
		render(<GlassCardHeader description="Card description" />);
		expect(screen.getByText('Card description')).toBeInTheDocument();
	});

	it('renders with title and description', () => {
		render(<GlassCardHeader title="Title" description="Description" />);
		expect(screen.getByText('Title')).toBeInTheDocument();
		expect(screen.getByText('Description')).toBeInTheDocument();
	});

	it('renders with action', () => {
		render(
			<GlassCardHeader
				title="Title"
				action={
					<button type="button" data-testid="action">
						Action
					</button>
				}
			/>,
		);
		expect(screen.getByTestId('action')).toBeInTheDocument();
	});

	it('renders children instead of props when provided', () => {
		render(
			<GlassCardHeader>
				<span data-testid="custom-header">Custom header content</span>
			</GlassCardHeader>,
		);
		expect(screen.getByTestId('custom-header')).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(<GlassCardHeader className="custom-class" />);
		const header = container.querySelector('[data-slot="glass-card-header"]');
		expect(header).toHaveClass('custom-class');
	});
});

describe('GlassCardContent', () => {
	it('renders with default props', () => {
		const { container } = render(<GlassCardContent>Content</GlassCardContent>);
		const content = container.querySelector('[data-slot="glass-card-content"]');
		expect(content).toBeInTheDocument();
	});

	it('renders children', () => {
		render(
			<GlassCardContent>
				<span data-testid="content">Body content</span>
			</GlassCardContent>,
		);
		expect(screen.getByTestId('content')).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(
			<GlassCardContent className="custom-class">Content</GlassCardContent>,
		);
		const content = container.querySelector('[data-slot="glass-card-content"]');
		expect(content).toHaveClass('custom-class');
	});
});

describe('GlassCardFooter', () => {
	it('renders with default props', () => {
		const { container } = render(<GlassCardFooter>Footer</GlassCardFooter>);
		const footer = container.querySelector('[data-slot="glass-card-footer"]');
		expect(footer).toBeInTheDocument();
		expect(footer).toHaveClass('flex', 'items-center', 'gap-2', 'pt-4');
	});

	it('renders children', () => {
		render(
			<GlassCardFooter>
				<span data-testid="footer">Footer content</span>
			</GlassCardFooter>,
		);
		expect(screen.getByTestId('footer')).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(
			<GlassCardFooter className="custom-class">Footer</GlassCardFooter>,
		);
		const footer = container.querySelector('[data-slot="glass-card-footer"]');
		expect(footer).toHaveClass('custom-class');
	});
});

describe('GlassCard composition', () => {
	it('renders complete card with all sub-components', () => {
		const { container } = render(
			<GlassCard variant="elevated" padding="lg" accent="coral">
				<GlassCardHeader title="Account Overview" description="Your financial summary" />
				<GlassCardContent>
					<p data-testid="main-content">Main content area</p>
				</GlassCardContent>
				<GlassCardFooter>
					<button type="button" data-testid="footer-button">
						View Details
					</button>
				</GlassCardFooter>
			</GlassCard>,
		);

		// Check main card
		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('glass-card', 'p-8', 'relative');

		// Check header
		expect(screen.getByText('Account Overview')).toBeInTheDocument();
		expect(screen.getByText('Your financial summary')).toBeInTheDocument();

		// Check content
		expect(screen.getByTestId('main-content')).toBeInTheDocument();

		// Check footer
		expect(screen.getByTestId('footer-button')).toBeInTheDocument();
	});

	it('works with interactive variant', () => {
		const { container } = render(
			<GlassCard variant="interactive">
				<GlassCardContent>Click me</GlassCardContent>
			</GlassCard>,
		);

		const card = container.querySelector('[data-slot="glass-card"]');
		expect(card).toHaveClass('cursor-pointer');
	});
});
