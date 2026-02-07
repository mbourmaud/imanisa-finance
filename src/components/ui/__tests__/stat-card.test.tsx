import { render, screen } from '@testing-library/react';
import { PiggyBank, TrendingUp, Users, Wallet } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { StatCard, StatCardGrid, StatCardSkeleton } from '../stat-card';

describe('StatCard', () => {
	it('renders with required props', () => {
		const { container } = render(<StatCard label="Total" value="$1,234" />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
		expect(screen.getByText('Total')).toBeInTheDocument();
		expect(screen.getByText('$1,234')).toBeInTheDocument();
	});

	it('renders with numeric value', () => {
		render(<StatCard label="Count" value={42} />);
		expect(screen.getByText('42')).toBeInTheDocument();
	});

	it('renders with variant default', () => {
		const { container } = render(<StatCard variant="default" label="Test" value="100" />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
	});

	it('renders with variant coral', () => {
		const { container } = render(<StatCard variant="coral" label="Coral" value="100" icon={Wallet} />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
		expect(screen.getByText('Coral')).toBeInTheDocument();
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	it('renders with variant teal', () => {
		const { container } = render(<StatCard variant="teal" label="Teal" value="200" icon={Wallet} />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
		expect(screen.getByText('Teal')).toBeInTheDocument();
	});

	it('renders with variant purple', () => {
		const { container } = render(<StatCard variant="purple" label="Purple" value="300" icon={Wallet} />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
		expect(screen.getByText('Purple')).toBeInTheDocument();
	});

	it('renders with variant gold', () => {
		const { container } = render(<StatCard variant="gold" label="Gold" value="400" icon={Wallet} />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
		expect(screen.getByText('Gold')).toBeInTheDocument();
	});

	it('renders with variant mint', () => {
		const { container } = render(<StatCard variant="mint" label="Mint" value="500" icon={Wallet} />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
		expect(screen.getByText('Mint')).toBeInTheDocument();
	});

	it('renders with icon', () => {
		const { container } = render(<StatCard label="Balance" value="$5,000" icon={Wallet} />);
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	it('renders with description', () => {
		render(<StatCard label="Revenue" value="$10,000" description="This month" />);
		expect(screen.getByText('This month')).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(<StatCard label="Test" value="100" className="custom-class" />);
		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toHaveClass('custom-class');
	});

	it('renders complete card with all features', () => {
		const { container } = render(
			<StatCard
				variant="coral"
				icon={TrendingUp}
				label="Total Revenue"
				value="$12,345"
				description="vs last month"
			/>,
		);

		const card = container.querySelector('[data-slot="stat-card"]');
		expect(card).toBeInTheDocument();
		expect(screen.getByText('Total Revenue')).toBeInTheDocument();
		expect(screen.getByText('$12,345')).toBeInTheDocument();
		expect(screen.getByText('vs last month')).toBeInTheDocument();
		expect(container.querySelector('svg')).toBeInTheDocument();
	});
});

describe('StatCardGrid', () => {
	it('renders with default 4 columns', () => {
		const { container } = render(
			<StatCardGrid>
				<StatCard label="A" value="1" />
				<StatCard label="B" value="2" />
			</StatCardGrid>,
		);
		const grid = container.querySelector('[data-slot="stat-card-grid"]');
		expect(grid).toBeInTheDocument();
		expect(grid).toHaveClass('grid', 'gap-4', 'lg:grid-cols-4');
	});

	it('renders with 2 columns', () => {
		const { container } = render(
			<StatCardGrid columns={2}>
				<StatCard label="A" value="1" />
				<StatCard label="B" value="2" />
			</StatCardGrid>,
		);
		const grid = container.querySelector('[data-slot="stat-card-grid"]');
		expect(grid).toHaveClass('sm:grid-cols-2');
		expect(grid).not.toHaveClass('lg:grid-cols-4');
	});

	it('renders with 3 columns', () => {
		const { container } = render(
			<StatCardGrid columns={3}>
				<StatCard label="A" value="1" />
				<StatCard label="B" value="2" />
				<StatCard label="C" value="3" />
			</StatCardGrid>,
		);
		const grid = container.querySelector('[data-slot="stat-card-grid"]');
		expect(grid).toHaveClass('lg:grid-cols-3');
	});

	it('accepts custom className', () => {
		const { container } = render(
			<StatCardGrid className="custom-grid">
				<StatCard label="A" value="1" />
			</StatCardGrid>,
		);
		const grid = container.querySelector('[data-slot="stat-card-grid"]');
		expect(grid).toHaveClass('custom-grid');
	});

	it('renders children', () => {
		render(
			<StatCardGrid>
				<StatCard label="Card 1" value="100" />
				<StatCard label="Card 2" value="200" />
				<StatCard label="Card 3" value="300" />
			</StatCardGrid>,
		);
		expect(screen.getByText('Card 1')).toBeInTheDocument();
		expect(screen.getByText('Card 2')).toBeInTheDocument();
		expect(screen.getByText('Card 3')).toBeInTheDocument();
	});
});

describe('StatCardSkeleton', () => {
	it('renders with default props', () => {
		const { container } = render(<StatCardSkeleton />);
		const skeleton = container.querySelector('[data-slot="stat-card-skeleton"]');
		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveClass('animate-pulse');
	});

	it('renders multiple skeletons', () => {
		const { container } = render(
			<>
				<StatCardSkeleton />
				<StatCardSkeleton />
			</>,
		);
		const skeletons = container.querySelectorAll('[data-slot="stat-card-skeleton"]');
		expect(skeletons).toHaveLength(2);
	});

	it('accepts custom className', () => {
		const { container } = render(<StatCardSkeleton className="custom-skeleton" />);
		const skeleton = container.querySelector('[data-slot="stat-card-skeleton"]');
		expect(skeleton).toHaveClass('custom-skeleton');
	});

	it('renders placeholder elements', () => {
		const { container } = render(<StatCardSkeleton />);
		// Should have bg-muted placeholder elements
		const placeholders = container.querySelectorAll('.bg-muted');
		expect(placeholders.length).toBeGreaterThan(0);
	});
});

describe('StatCard composition', () => {
	it('renders multiple cards in a grid', () => {
		const { container } = render(
			<StatCardGrid>
				<StatCard variant="coral" icon={Wallet} label="Account Balance" value="$10,500" />
				<StatCard variant="teal" icon={Users} label="Family Members" value="4" />
				<StatCard variant="purple" icon={PiggyBank} label="Total Savings" value="$2,300" />
				<StatCard variant="gold" icon={TrendingUp} label="Monthly Growth" value="12%" />
			</StatCardGrid>,
		);

		// Use container queries to avoid multiple element issues from previous tests
		const cards = container.querySelectorAll('[data-slot="stat-card"]');
		expect(cards).toHaveLength(4);
		expect(screen.getByText('Account Balance')).toBeInTheDocument();
		expect(screen.getByText('Family Members')).toBeInTheDocument();
		expect(screen.getByText('Total Savings')).toBeInTheDocument();
		expect(screen.getByText('Monthly Growth')).toBeInTheDocument();
	});
});
