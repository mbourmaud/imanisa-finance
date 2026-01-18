import { render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
	BalanceDisplay,
	MoneyDifference,
	MoneyDisplay,
	MoneyPercentChange,
	MoneySplit,
} from '../MoneyDisplay';

describe('MoneyDisplay', () => {
	it('renders with default props', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toBeInTheDocument();
		expect(display).toHaveClass('number-display');
	});

	it('formats amount in EUR', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} currency="EUR" />);
		const display = container.querySelector('[data-slot="money-display"]');
		// French locale uses non-breaking space and €
		expect(display?.textContent).toMatch(/1[\s\u00A0]234,56[\s\u00A0]€/);
	});

	it('formats amount in USD', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} currency="USD" locale="en-US" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display?.textContent).toMatch(/\$1,234\.56/);
	});

	it('renders with format compact', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} format="compact" />);
		const display = container.querySelector('[data-slot="money-display"]');
		// Compact format should show without decimals
		expect(display?.textContent).toMatch(/1[\s\u00A0]235[\s\u00A0]€/);
	});

	it('renders with format short', () => {
		const { container } = render(<MoneyDisplay amount={150000} format="short" />);
		const display = container.querySelector('[data-slot="money-display"]');
		// Short format uses compact notation for large amounts
		expect(display?.textContent).toMatch(/k|K|150/);
	});

	it('renders with format withSign', () => {
		const { container } = render(<MoneyDisplay amount={100} format="withSign" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display?.textContent).toMatch(/\+/);
	});

	it('renders with size xs', () => {
		const { container } = render(<MoneyDisplay amount={100} size="xs" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('text-xs');
	});

	it('renders with size sm', () => {
		const { container } = render(<MoneyDisplay amount={100} size="sm" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('text-sm');
	});

	it('renders with size lg', () => {
		const { container } = render(<MoneyDisplay amount={100} size="lg" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('text-lg');
	});

	it('renders with size xl', () => {
		const { container } = render(<MoneyDisplay amount={100} size="xl" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('text-xl');
	});

	it('renders with size 2xl', () => {
		const { container } = render(<MoneyDisplay amount={100} size="2xl" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('text-2xl');
	});

	it('renders with variant positive', () => {
		const { container } = render(<MoneyDisplay amount={100} variant="positive" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('value-positive');
	});

	it('renders with variant negative', () => {
		const { container } = render(<MoneyDisplay amount={100} variant="negative" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('value-negative');
	});

	it('renders with variant neutral', () => {
		const { container } = render(<MoneyDisplay amount={100} variant="neutral" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('text-muted-foreground');
	});

	it('auto-colors positive amounts when autoColor is true', () => {
		const { container } = render(<MoneyDisplay amount={100} autoColor />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('value-positive');
	});

	it('auto-colors negative amounts when autoColor is true', () => {
		const { container } = render(<MoneyDisplay amount={-100} autoColor />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('value-negative');
	});

	it('auto-colors zero amounts as neutral when autoColor is true', () => {
		const { container } = render(<MoneyDisplay amount={0} autoColor />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('text-muted-foreground');
	});

	it('renders with different weights', () => {
		const { container: c1 } = render(<MoneyDisplay amount={100} weight="normal" />);
		expect(c1.querySelector('[data-slot="money-display"]')).toHaveClass('font-normal');

		const { container: c2 } = render(<MoneyDisplay amount={100} weight="semibold" />);
		expect(c2.querySelector('[data-slot="money-display"]')).toHaveClass('font-semibold');

		const { container: c3 } = render(<MoneyDisplay amount={100} weight="bold" />);
		expect(c3.querySelector('[data-slot="money-display"]')).toHaveClass('font-bold');
	});

	it('accepts custom className', () => {
		const { container } = render(<MoneyDisplay amount={100} className="custom-class" />);
		const display = container.querySelector('[data-slot="money-display"]');
		expect(display).toHaveClass('custom-class');
	});
});

describe('MoneyDifference', () => {
	it('renders positive amount with plus sign', () => {
		const { container } = render(<MoneyDifference amount={100} />);
		const display = container.querySelector('[data-slot="money-difference"]');
		expect(display).toBeInTheDocument();
		expect(display?.textContent).toMatch(/\+/);
		expect(display).toHaveClass('value-positive');
	});

	it('renders negative amount', () => {
		const { container } = render(<MoneyDifference amount={-100} />);
		const display = container.querySelector('[data-slot="money-difference"]');
		expect(display).toHaveClass('value-negative');
	});

	it('renders zero amount as neutral', () => {
		const { container } = render(<MoneyDifference amount={0} />);
		const display = container.querySelector('[data-slot="money-difference"]');
		expect(display).toHaveClass('text-muted-foreground');
	});

	it('shows icon when showIcon is true', () => {
		const { container } = render(<MoneyDifference amount={100} showIcon />);
		const display = container.querySelector('[data-slot="money-difference"]');
		expect(display?.textContent).toMatch(/▲/);
	});

	it('shows down icon for negative amounts', () => {
		const { container } = render(<MoneyDifference amount={-100} showIcon />);
		const display = container.querySelector('[data-slot="money-difference"]');
		expect(display?.textContent).toMatch(/▼/);
	});

	it('accepts custom className', () => {
		const { container } = render(<MoneyDifference amount={100} className="custom-class" />);
		const display = container.querySelector('[data-slot="money-difference"]');
		expect(display).toHaveClass('custom-class');
	});
});

describe('MoneyPercentChange', () => {
	it('renders positive percentage', () => {
		const { container } = render(<MoneyPercentChange value={15.5} />);
		const display = container.querySelector('[data-slot="money-percent-change"]');
		expect(display).toBeInTheDocument();
		expect(display?.textContent).toContain('+15.5%');
		expect(display).toHaveClass('value-positive');
	});

	it('renders negative percentage', () => {
		const { container } = render(<MoneyPercentChange value={-10.2} />);
		const display = container.querySelector('[data-slot="money-percent-change"]');
		expect(display?.textContent).toContain('-10.2%');
		expect(display).toHaveClass('value-negative');
	});

	it('renders zero percentage as neutral', () => {
		const { container } = render(<MoneyPercentChange value={0} />);
		const display = container.querySelector('[data-slot="money-percent-change"]');
		expect(display).toHaveClass('text-muted-foreground');
	});

	it('shows icon when showIcon is true', () => {
		const { container } = render(<MoneyPercentChange value={10} showIcon />);
		const display = container.querySelector('[data-slot="money-percent-change"]');
		expect(display?.textContent).toMatch(/▲/);
	});

	it('uses custom decimals', () => {
		const { container } = render(<MoneyPercentChange value={15.567} decimals={2} />);
		const display = container.querySelector('[data-slot="money-percent-change"]');
		expect(display?.textContent).toContain('15.57%');
	});

	it('accepts custom className', () => {
		const { container } = render(<MoneyPercentChange value={10} className="custom-class" />);
		const display = container.querySelector('[data-slot="money-percent-change"]');
		expect(display).toHaveClass('custom-class');
	});
});

describe('BalanceDisplay', () => {
	it('renders with amount', () => {
		const { container } = render(<BalanceDisplay amount={10000} />);
		const display = container.querySelector('[data-slot="balance-display"]');
		expect(display).toBeInTheDocument();
	});

	it('shows label when provided', () => {
		const { container } = render(<BalanceDisplay amount={10000} label="Solde total" />);
		const display = container.querySelector('[data-slot="balance-display"]') as HTMLElement;
		expect(within(display).getByText('Solde total')).toBeInTheDocument();
	});

	it('renders with size md', () => {
		const { container } = render(<BalanceDisplay amount={10000} size="md" />);
		const display = container.querySelector('[data-slot="balance-display"]');
		const amount = display?.querySelector('p:last-of-type');
		expect(amount).toHaveClass('text-2xl');
	});

	it('renders with size lg (default)', () => {
		const { container } = render(<BalanceDisplay amount={10000} size="lg" />);
		const display = container.querySelector('[data-slot="balance-display"]');
		const amount = display?.querySelector('p:last-of-type');
		expect(amount).toHaveClass('text-3xl');
	});

	it('renders with size xl', () => {
		const { container } = render(<BalanceDisplay amount={10000} size="xl" />);
		const display = container.querySelector('[data-slot="balance-display"]');
		const amount = display?.querySelector('p:last-of-type');
		expect(amount).toHaveClass('text-4xl');
	});

	it('shows change when showChange is true and previousAmount provided', () => {
		const { container } = render(
			<BalanceDisplay amount={12000} previousAmount={10000} showChange />,
		);
		const display = container.querySelector('[data-slot="balance-display"]') as HTMLElement;
		// Should show both money difference and percent change
		expect(display.querySelector('[data-slot="money-difference"]')).toBeInTheDocument();
		expect(display.querySelector('[data-slot="money-percent-change"]')).toBeInTheDocument();
	});

	it('does not show change when showChange is false', () => {
		const { container } = render(
			<BalanceDisplay amount={12000} previousAmount={10000} showChange={false} />,
		);
		const display = container.querySelector('[data-slot="balance-display"]') as HTMLElement;
		expect(display.querySelector('[data-slot="money-difference"]')).not.toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(<BalanceDisplay amount={10000} className="custom-class" />);
		const display = container.querySelector('[data-slot="balance-display"]');
		expect(display).toHaveClass('custom-class');
	});
});

describe('MoneySplit', () => {
	const mockSplits = [
		{ id: '1', name: 'Jean', amount: 600, percent: 60 },
		{ id: '2', name: 'Marie', amount: 400, percent: 40 },
	];

	it('renders split breakdown', () => {
		const { container } = render(<MoneySplit total={1000} splits={mockSplits} />);
		const display = container.querySelector('[data-slot="money-split"]');
		expect(display).toBeInTheDocument();
	});

	it('shows all members', () => {
		const { container } = render(<MoneySplit total={1000} splits={mockSplits} />);
		const display = container.querySelector('[data-slot="money-split"]') as HTMLElement;
		expect(within(display).getByText('Jean')).toBeInTheDocument();
		expect(within(display).getByText('Marie')).toBeInTheDocument();
	});

	it('shows total', () => {
		const { container } = render(<MoneySplit total={1000} splits={mockSplits} />);
		const display = container.querySelector('[data-slot="money-split"]') as HTMLElement;
		expect(within(display).getByText('Total')).toBeInTheDocument();
	});

	it('shows percentages when showPercent is true', () => {
		const { container } = render(<MoneySplit total={1000} splits={mockSplits} showPercent />);
		const display = container.querySelector('[data-slot="money-split"]') as HTMLElement;
		expect(within(display).getByText('(60%)')).toBeInTheDocument();
		expect(within(display).getByText('(40%)')).toBeInTheDocument();
	});

	it('hides percentages when showPercent is false', () => {
		const { container } = render(
			<MoneySplit total={1000} splits={mockSplits} showPercent={false} />,
		);
		const display = container.querySelector('[data-slot="money-split"]') as HTMLElement;
		expect(within(display).queryByText('(60%)')).not.toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(
			<MoneySplit total={1000} splits={mockSplits} className="custom-class" />,
		);
		const display = container.querySelector('[data-slot="money-split"]');
		expect(display).toHaveClass('custom-class');
	});
});
