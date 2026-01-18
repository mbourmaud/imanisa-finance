import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SupportedBank } from '@/shared/constants/supported-banks';
import { BankAvatar, BankCard, BankCardGrid, BankCardList } from '../BankCard';

// Mock bank data
const mockBank: SupportedBank = {
	key: 'credit_mutuel',
	name: 'Crédit Mutuel',
	shortName: 'CM',
	color: '#0066b3',
	type: 'bank',
	parserKey: 'credit_mutuel',
	supportedFormats: ['CSV'],
	defaultExportUrl: 'https://www.creditmutuel.fr/',
};

const mockInvestmentBank: SupportedBank = {
	key: 'binance',
	name: 'Binance',
	shortName: 'BN',
	color: '#f0b90b',
	textColor: '#000000',
	type: 'investment',
	parserKey: 'binance',
	supportedFormats: ['CSV'],
	defaultExportUrl: 'https://www.binance.com/',
};

describe('BankAvatar', () => {
	it('renders with bank data', () => {
		const { container } = render(<BankAvatar bank={mockBank} />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toBeInTheDocument();
		expect(avatar).toHaveTextContent('CM');
	});

	it('renders with custom color', () => {
		const { container } = render(<BankAvatar bank={mockBank} />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toHaveStyle({ backgroundColor: '#0066b3' });
	});

	it('renders with custom text color', () => {
		const { container } = render(<BankAvatar bank={mockInvestmentBank} />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toHaveStyle({ color: '#000000' });
	});

	it('renders with size sm', () => {
		const { container } = render(<BankAvatar bank={mockBank} size="sm" />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toHaveClass('h-8', 'w-8');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<BankAvatar bank={mockBank} size="md" />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toHaveClass('h-10', 'w-10');
	});

	it('renders with size lg', () => {
		const { container } = render(<BankAvatar bank={mockBank} size="lg" />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toHaveClass('h-12', 'w-12');
	});

	it('renders with size xl', () => {
		const { container } = render(<BankAvatar bank={mockBank} size="xl" />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toHaveClass('h-14', 'w-14');
	});

	it('renders with logo URL', () => {
		const { container } = render(
			<BankAvatar bank={mockBank} logoUrl="https://example.com/logo.png" />,
		);
		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
	});

	it('accepts custom className', () => {
		const { container } = render(<BankAvatar bank={mockBank} className="custom-class" />);
		const avatar = container.querySelector('[data-slot="bank-avatar"]');
		expect(avatar).toHaveClass('custom-class');
	});
});

describe('BankCard', () => {
	it('renders with required props', () => {
		const { container } = render(<BankCard bank={mockBank} />);
		const card = container.querySelector('[data-slot="bank-card"]');
		expect(card).toBeInTheDocument();
		expect(card).toHaveClass('glass-card');
		expect(within(card as HTMLElement).getByText('Crédit Mutuel')).toBeInTheDocument();
	});

	it('renders with account count', () => {
		const { container } = render(<BankCard bank={mockBank} accountCount={3} />);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		expect(within(card).getByText('3 comptes')).toBeInTheDocument();
	});

	it('renders with zero accounts', () => {
		const { container } = render(<BankCard bank={mockBank} accountCount={0} />);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		expect(within(card).getByText('Aucun compte')).toBeInTheDocument();
	});

	it('renders with single account', () => {
		const { container } = render(<BankCard bank={mockBank} accountCount={1} />);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		expect(within(card).getByText('1 compte')).toBeInTheDocument();
	});

	it('renders with total balance', () => {
		const { container } = render(<BankCard bank={mockBank} totalBalance="1 234,56 €" />);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		expect(within(card).getByText('1 234,56 €')).toBeInTheDocument();
	});

	it('renders with variant compact', () => {
		const { container } = render(<BankCard bank={mockBank} variant="compact" />);
		const card = container.querySelector('[data-slot="bank-card"]');
		expect(card).toHaveClass('p-3');
	});

	it('renders with variant default', () => {
		const { container } = render(<BankCard bank={mockBank} variant="default" />);
		const card = container.querySelector('[data-slot="bank-card"]');
		expect(card).toHaveClass('p-4');
	});

	it('renders with variant detailed', () => {
		const { container } = render(<BankCard bank={mockBank} variant="detailed" />);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		expect(within(card).getByText('Formats: CSV')).toBeInTheDocument();
	});

	it('renders investment badge for investment bank', () => {
		const { container } = render(<BankCard bank={mockInvestmentBank} />);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		expect(within(card).getByText('Invest')).toBeInTheDocument();
	});

	it('renders with interactive prop', () => {
		const { container } = render(<BankCard bank={mockBank} interactive />);
		const card = container.querySelector('[data-slot="bank-card"]');
		expect(card).toHaveClass('cursor-pointer');
		expect(card).toHaveAttribute('role', 'button');
		expect(card).toHaveAttribute('tabIndex', '0');
	});

	it('calls onBankClick when clicked', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<BankCard bank={mockBank} interactive onBankClick={handleClick} />,
		);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		fireEvent.click(card);
		expect(handleClick).toHaveBeenCalled();
	});

	it('calls onBankClick on Enter key', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<BankCard bank={mockBank} interactive onBankClick={handleClick} />,
		);
		const card = container.querySelector('[data-slot="bank-card"]') as HTMLElement;
		fireEvent.keyDown(card, { key: 'Enter' });
		expect(handleClick).toHaveBeenCalled();
	});

	it('shows chevron when interactive', () => {
		const { container } = render(<BankCard bank={mockBank} interactive />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('shows external link when showExternalLink is true', () => {
		const { container } = render(<BankCard bank={mockBank} showExternalLink />);
		const link = container.querySelector('a[target="_blank"]');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', mockBank.defaultExportUrl);
	});

	it('accepts custom className', () => {
		const { container } = render(<BankCard bank={mockBank} className="custom-class" />);
		const card = container.querySelector('[data-slot="bank-card"]');
		expect(card).toHaveClass('custom-class');
	});
});

describe('BankCardList', () => {
	const mockBanks = [
		{ bank: mockBank, accountCount: 2 },
		{ bank: mockInvestmentBank, accountCount: 1 },
	];

	it('renders list of bank cards', () => {
		const { container } = render(<BankCardList banks={mockBanks} />);
		const list = container.querySelector('[data-slot="bank-card-list"]');
		expect(list).toBeInTheDocument();
		const cards = container.querySelectorAll('[data-slot="bank-card"]');
		expect(cards).toHaveLength(2);
	});

	it('passes variant to all cards', () => {
		const { container } = render(<BankCardList banks={mockBanks} variant="compact" />);
		const cards = container.querySelectorAll('[data-slot="bank-card"]');
		cards.forEach((card) => {
			expect(card).toHaveClass('p-3');
		});
	});

	it('passes interactive to all cards', () => {
		const { container } = render(<BankCardList banks={mockBanks} interactive />);
		const cards = container.querySelectorAll('[data-slot="bank-card"]');
		cards.forEach((card) => {
			expect(card).toHaveClass('cursor-pointer');
		});
	});

	it('calls onBankClick with correct bank', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<BankCardList banks={mockBanks} interactive onBankClick={handleClick} />,
		);
		const cards = container.querySelectorAll('[data-slot="bank-card"]');
		fireEvent.click(cards[1]);
		expect(handleClick).toHaveBeenCalledWith(mockInvestmentBank);
	});

	it('accepts custom className', () => {
		const { container } = render(<BankCardList banks={mockBanks} className="custom-list" />);
		const list = container.querySelector('[data-slot="bank-card-list"]');
		expect(list).toHaveClass('custom-list');
	});
});

describe('BankCardGrid', () => {
	const mockBanks = [
		{ bank: mockBank, accountCount: 2 },
		{ bank: mockInvestmentBank, accountCount: 1 },
	];

	it('renders grid of bank cards', () => {
		const { container } = render(<BankCardGrid banks={mockBanks} />);
		const grid = container.querySelector('[data-slot="bank-card-grid"]');
		expect(grid).toBeInTheDocument();
		expect(grid).toHaveClass('grid');
		const cards = container.querySelectorAll('[data-slot="bank-card"]');
		expect(cards).toHaveLength(2);
	});

	it('renders with 2 columns', () => {
		const { container } = render(<BankCardGrid banks={mockBanks} columns={2} />);
		const grid = container.querySelector('[data-slot="bank-card-grid"]');
		expect(grid).toHaveClass('sm:grid-cols-2');
	});

	it('renders with 3 columns (default)', () => {
		const { container } = render(<BankCardGrid banks={mockBanks} columns={3} />);
		const grid = container.querySelector('[data-slot="bank-card-grid"]');
		expect(grid).toHaveClass('lg:grid-cols-3');
	});

	it('renders with 4 columns', () => {
		const { container } = render(<BankCardGrid banks={mockBanks} columns={4} />);
		const grid = container.querySelector('[data-slot="bank-card-grid"]');
		expect(grid).toHaveClass('lg:grid-cols-4');
	});

	it('uses compact variant for cards', () => {
		const { container } = render(<BankCardGrid banks={mockBanks} />);
		const cards = container.querySelectorAll('[data-slot="bank-card"]');
		cards.forEach((card) => {
			expect(card).toHaveClass('p-3');
		});
	});

	it('accepts custom className', () => {
		const { container } = render(<BankCardGrid banks={mockBanks} className="custom-grid" />);
		const grid = container.querySelector('[data-slot="bank-card-grid"]');
		expect(grid).toHaveClass('custom-grid');
	});
});
