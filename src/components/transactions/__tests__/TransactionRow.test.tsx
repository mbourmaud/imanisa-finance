import { render, within, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
	TransactionIcon,
	CategoryBadge,
	TransactionAmount,
	TransactionRow,
	TransactionList,
	TransactionRowSkeleton,
} from '../TransactionRow';
import type { TransactionData, TransactionCategory } from '../TransactionRow';

// Mock transaction data
const mockCategory: TransactionCategory = {
	id: 'cat-1',
	name: 'Courses',
	color: '#10b981',
};

const mockExpenseTransaction: TransactionData = {
	id: 'tx-1',
	description: 'Carrefour Market',
	amount: -125.40,
	currency: 'EUR',
	type: 'expense',
	date: new Date('2025-01-16'),
	category: mockCategory,
	accountName: 'Compte principal',
	isReconciled: false,
};

const mockIncomeTransaction: TransactionData = {
	id: 'tx-2',
	description: 'Virement Salaire',
	amount: 3200.00,
	currency: 'EUR',
	type: 'income',
	date: new Date('2025-01-15'),
	category: { id: 'cat-2', name: 'Revenus' },
	accountName: 'Compte principal',
	isReconciled: true,
};

const mockTransferTransaction: TransactionData = {
	id: 'tx-3',
	description: 'Virement vers Livret A',
	amount: -500.00,
	currency: 'EUR',
	type: 'transfer',
	date: new Date('2025-01-14'),
	category: null,
	accountName: 'Compte principal',
	isInternal: true,
};

describe('TransactionIcon', () => {
	it('renders with income type', () => {
		const { container } = render(<TransactionIcon type="income" />);
		const icon = container.querySelector('[data-slot="transaction-icon"]');
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveClass('bg-[oklch(0.55_0.15_145)]/10');
	});

	it('renders with expense type', () => {
		const { container } = render(<TransactionIcon type="expense" />);
		const icon = container.querySelector('[data-slot="transaction-icon"]');
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveClass('bg-muted/50');
	});

	it('renders with transfer type', () => {
		const { container } = render(<TransactionIcon type="transfer" />);
		const icon = container.querySelector('[data-slot="transaction-icon"]');
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveClass('bg-primary/10');
	});

	it('renders with size sm', () => {
		const { container } = render(<TransactionIcon type="expense" size="sm" />);
		const icon = container.querySelector('[data-slot="transaction-icon"]');
		expect(icon).toHaveClass('h-8', 'w-8');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<TransactionIcon type="expense" size="md" />);
		const icon = container.querySelector('[data-slot="transaction-icon"]');
		expect(icon).toHaveClass('h-10', 'w-10');
	});

	it('renders with size lg', () => {
		const { container } = render(<TransactionIcon type="expense" size="lg" />);
		const icon = container.querySelector('[data-slot="transaction-icon"]');
		expect(icon).toHaveClass('h-12', 'w-12');
	});

	it('accepts custom className', () => {
		const { container } = render(
			<TransactionIcon type="expense" className="custom-class" />
		);
		const icon = container.querySelector('[data-slot="transaction-icon"]');
		expect(icon).toHaveClass('custom-class');
	});
});

describe('CategoryBadge', () => {
	it('renders with category data', () => {
		const { container } = render(<CategoryBadge category={mockCategory} />);
		const badge = container.querySelector('[data-slot="category-badge"]');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveTextContent('Courses');
	});

	it('applies category color when provided', () => {
		const { container } = render(<CategoryBadge category={mockCategory} />);
		const badge = container.querySelector('[data-slot="category-badge"]');
		expect(badge).toHaveStyle({ backgroundColor: '#10b98120' });
	});

	it('renders with size sm (default)', () => {
		const { container } = render(<CategoryBadge category={mockCategory} size="sm" />);
		const badge = container.querySelector('[data-slot="category-badge"]');
		expect(badge).toHaveClass('text-xs');
	});

	it('renders with size md', () => {
		const { container } = render(<CategoryBadge category={mockCategory} size="md" />);
		const badge = container.querySelector('[data-slot="category-badge"]');
		expect(badge).toHaveClass('text-sm');
	});

	it('accepts custom className', () => {
		const { container } = render(
			<CategoryBadge category={mockCategory} className="custom-class" />
		);
		const badge = container.querySelector('[data-slot="category-badge"]');
		expect(badge).toHaveClass('custom-class');
	});
});

describe('TransactionAmount', () => {
	it('renders income with positive sign', () => {
		const { container } = render(
			<TransactionAmount amount={100} type="income" showSign />
		);
		const amount = container.querySelector('[data-slot="transaction-amount"]');
		expect(amount).toBeInTheDocument();
		expect(amount).toHaveTextContent('+');
		expect(amount).toHaveClass('value-positive');
	});

	it('renders expense with negative sign', () => {
		const { container } = render(
			<TransactionAmount amount={-100} type="expense" showSign />
		);
		const amount = container.querySelector('[data-slot="transaction-amount"]');
		expect(amount).toHaveTextContent('-');
	});

	it('renders without sign when showSign is false', () => {
		const { container } = render(
			<TransactionAmount amount={100} type="income" showSign={false} />
		);
		const amount = container.querySelector('[data-slot="transaction-amount"]');
		expect(amount?.textContent).not.toMatch(/^\+/);
	});

	it('renders with size sm', () => {
		const { container } = render(
			<TransactionAmount amount={100} type="income" size="sm" />
		);
		const amount = container.querySelector('[data-slot="transaction-amount"]');
		expect(amount).toHaveClass('text-sm');
	});

	it('renders with size lg', () => {
		const { container } = render(
			<TransactionAmount amount={100} type="income" size="lg" />
		);
		const amount = container.querySelector('[data-slot="transaction-amount"]');
		expect(amount).toHaveClass('text-lg');
	});

	it('accepts custom className', () => {
		const { container } = render(
			<TransactionAmount amount={100} type="income" className="custom-class" />
		);
		const amount = container.querySelector('[data-slot="transaction-amount"]');
		expect(amount).toHaveClass('custom-class');
	});
});

describe('TransactionRow', () => {
	it('renders with required props', () => {
		const { container } = render(<TransactionRow transaction={mockExpenseTransaction} />);
		const row = container.querySelector('[data-slot="transaction-row"]');
		expect(row).toBeInTheDocument();
		expect(within(row as HTMLElement).getByText('Carrefour Market')).toBeInTheDocument();
	});

	it('shows category and account', () => {
		const { container } = render(
			<TransactionRow
				transaction={mockExpenseTransaction}
				showCategory
				showAccount
			/>
		);
		const row = container.querySelector('[data-slot="transaction-row"]') as HTMLElement;
		expect(within(row).getByText('Courses')).toBeInTheDocument();
		expect(within(row).getByText('Compte principal')).toBeInTheDocument();
	});

	it('hides category when showCategory is false', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} showCategory={false} />
		);
		const row = container.querySelector('[data-slot="transaction-row"]') as HTMLElement;
		expect(within(row).queryByText('Courses')).not.toBeInTheDocument();
	});

	it('hides account when showAccount is false', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} showAccount={false} />
		);
		const row = container.querySelector('[data-slot="transaction-row"]') as HTMLElement;
		expect(within(row).queryByText('Compte principal')).not.toBeInTheDocument();
	});

	it('shows reconciled badge for reconciled transactions', () => {
		const { container } = render(<TransactionRow transaction={mockIncomeTransaction} />);
		const badge = container.querySelector('[data-slot="reconciled-badge"]');
		expect(badge).toBeInTheDocument();
	});

	it('hides reconciled badge for non-reconciled transactions', () => {
		const { container } = render(<TransactionRow transaction={mockExpenseTransaction} />);
		const badge = container.querySelector('[data-slot="reconciled-badge"]');
		expect(badge).not.toBeInTheDocument();
	});

	it('renders with variant compact', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} variant="compact" />
		);
		const row = container.querySelector('[data-slot="transaction-row"]');
		expect(row).toHaveClass('p-3');
	});

	it('renders with variant default', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} variant="default" />
		);
		const row = container.querySelector('[data-slot="transaction-row"]');
		expect(row).toHaveClass('p-4');
	});

	it('renders with variant detailed', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} variant="detailed" />
		);
		const row = container.querySelector('[data-slot="transaction-row"]');
		expect(row).toHaveClass('p-5');
		// Should show category badge in detailed variant
		const categoryBadge = container.querySelector('[data-slot="category-badge"]');
		expect(categoryBadge).toBeInTheDocument();
	});

	it('renders with selectable checkbox', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} selectable />
		);
		const checkbox = container.querySelector('[data-slot="checkbox"]');
		expect(checkbox).toBeInTheDocument();
	});

	it('calls onSelectChange when checkbox clicked', () => {
		const handleSelect = vi.fn();
		const { container } = render(
			<TransactionRow
				transaction={mockExpenseTransaction}
				selectable
				onSelectChange={handleSelect}
			/>
		);
		const checkbox = container.querySelector('[data-slot="checkbox"]') as HTMLElement;
		fireEvent.click(checkbox);
		expect(handleSelect).toHaveBeenCalledWith(true);
	});

	it('renders with interactive prop', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} interactive />
		);
		const row = container.querySelector('[data-slot="transaction-row"]');
		expect(row).toHaveClass('cursor-pointer');
		expect(row).toHaveAttribute('role', 'button');
	});

	it('calls onTransactionClick when clicked', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<TransactionRow
				transaction={mockExpenseTransaction}
				interactive
				onTransactionClick={handleClick}
			/>
		);
		const row = container.querySelector('[data-slot="transaction-row"]') as HTMLElement;
		fireEvent.click(row);
		expect(handleClick).toHaveBeenCalled();
	});

	it('shows selected state', () => {
		const { container } = render(
			<TransactionRow
				transaction={mockExpenseTransaction}
				selectable
				selected
			/>
		);
		const row = container.querySelector('[data-slot="transaction-row"]');
		expect(row).toHaveClass('bg-muted/50');
	});

	it('accepts custom className', () => {
		const { container } = render(
			<TransactionRow transaction={mockExpenseTransaction} className="custom-class" />
		);
		const row = container.querySelector('[data-slot="transaction-row"]');
		expect(row).toHaveClass('custom-class');
	});
});

describe('TransactionList', () => {
	const mockTransactions = [
		mockExpenseTransaction,
		mockIncomeTransaction,
		mockTransferTransaction,
	];

	it('renders list of transactions', () => {
		const { container } = render(<TransactionList transactions={mockTransactions} />);
		const list = container.querySelector('[data-slot="transaction-list"]');
		expect(list).toBeInTheDocument();
		const rows = container.querySelectorAll('[data-slot="transaction-row"]');
		expect(rows).toHaveLength(3);
	});

	it('passes variant to all rows', () => {
		const { container } = render(
			<TransactionList transactions={mockTransactions} variant="compact" />
		);
		const rows = container.querySelectorAll('[data-slot="transaction-row"]');
		rows.forEach((row) => {
			expect(row).toHaveClass('p-3');
		});
	});

	it('handles selection change', () => {
		const handleSelectionChange = vi.fn();
		const { container } = render(
			<TransactionList
				transactions={mockTransactions}
				selectable
				selectedIds={[]}
				onSelectionChange={handleSelectionChange}
			/>
		);
		const checkboxes = container.querySelectorAll('[data-slot="checkbox"]');
		fireEvent.click(checkboxes[0]);
		expect(handleSelectionChange).toHaveBeenCalledWith(['tx-1']);
	});

	it('removes from selection when already selected', () => {
		const handleSelectionChange = vi.fn();
		const { container } = render(
			<TransactionList
				transactions={mockTransactions}
				selectable
				selectedIds={['tx-1', 'tx-2']}
				onSelectionChange={handleSelectionChange}
			/>
		);
		const checkboxes = container.querySelectorAll('[data-slot="checkbox"]');
		fireEvent.click(checkboxes[0]);
		expect(handleSelectionChange).toHaveBeenCalledWith(['tx-2']);
	});

	it('calls onTransactionClick with correct transaction', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<TransactionList
				transactions={mockTransactions}
				interactive
				onTransactionClick={handleClick}
			/>
		);
		const rows = container.querySelectorAll('[data-slot="transaction-row"]');
		fireEvent.click(rows[1]);
		expect(handleClick).toHaveBeenCalledWith(mockIncomeTransaction);
	});

	it('accepts custom className', () => {
		const { container } = render(
			<TransactionList transactions={mockTransactions} className="custom-class" />
		);
		const list = container.querySelector('[data-slot="transaction-list"]');
		expect(list).toHaveClass('custom-class');
	});
});

describe('TransactionRowSkeleton', () => {
	it('renders with default props', () => {
		const { container } = render(<TransactionRowSkeleton />);
		const skeleton = container.querySelector('[data-slot="transaction-row-skeleton"]');
		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveClass('animate-pulse');
	});

	it('renders with variant compact', () => {
		const { container } = render(<TransactionRowSkeleton variant="compact" />);
		const skeleton = container.querySelector('[data-slot="transaction-row-skeleton"]');
		expect(skeleton).toHaveClass('p-3');
	});

	it('renders with variant detailed', () => {
		const { container } = render(<TransactionRowSkeleton variant="detailed" />);
		const skeleton = container.querySelector('[data-slot="transaction-row-skeleton"]');
		expect(skeleton).toHaveClass('p-5');
	});

	it('accepts custom className', () => {
		const { container } = render(<TransactionRowSkeleton className="custom-class" />);
		const skeleton = container.querySelector('[data-slot="transaction-row-skeleton"]');
		expect(skeleton).toHaveClass('custom-class');
	});

	it('renders placeholder elements', () => {
		const { container } = render(<TransactionRowSkeleton />);
		const placeholders = container.querySelectorAll('.bg-muted');
		expect(placeholders.length).toBeGreaterThan(0);
	});
});
