import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AccountData, AccountMember } from '../AccountCard';
import {
	AccountCard,
	AccountCardList,
	AccountCardSkeleton,
	AccountIcon,
	AccountTypeBadge,
	MemberBadge,
} from '../AccountCard';

// Mock account data
const mockAccount: AccountData = {
	id: 'acc-1',
	name: 'Compte Principal',
	type: 'CHECKING',
	balance: 1234.56,
	currency: 'EUR',
	bank: {
		id: 'bank-1',
		name: 'Crédit Mutuel',
		color: '#0066b3',
		shortName: 'CM',
	},
};

const mockSavingsAccount: AccountData = {
	id: 'acc-2',
	name: 'Livret A',
	type: 'SAVINGS',
	balance: 5000,
	currency: 'EUR',
	bank: {
		id: 'bank-2',
		name: 'BNP Paribas',
		color: '#00a651',
		shortName: 'BNP',
	},
};

const mockNegativeAccount: AccountData = {
	id: 'acc-3',
	name: 'Crédit Auto',
	type: 'LOAN',
	balance: -15000,
	currency: 'EUR',
	bank: null,
};

const mockMember: AccountMember = {
	id: 'member-1',
	name: 'Jean Dupont',
	color: '#6366f1',
	ownerShare: 50,
};

const mockAccountWithMembers: AccountData = {
	...mockAccount,
	members: [mockMember, { id: 'member-2', name: 'Marie Dupont', color: '#f43f5e', ownerShare: 50 }],
};

describe('AccountIcon', () => {
	it('renders with account data', () => {
		const { container } = render(<AccountIcon account={mockAccount} />);
		const icon = container.querySelector('[data-slot="account-icon"]');
		expect(icon).toBeInTheDocument();
	});

	it('renders with bank color when showBankColor is true', () => {
		const { container } = render(<AccountIcon account={mockAccount} showBankColor />);
		const icon = container.querySelector('[data-slot="account-icon"]');
		expect(icon).toHaveStyle({ backgroundColor: '#0066b320' });
	});

	it('renders without bank color when showBankColor is false', () => {
		const { container } = render(<AccountIcon account={mockAccount} showBankColor={false} />);
		const icon = container.querySelector('[data-slot="account-icon"]');
		expect(icon).not.toHaveStyle({ backgroundColor: '#0066b320' });
	});

	it('renders with size sm', () => {
		const { container } = render(<AccountIcon account={mockAccount} size="sm" />);
		const icon = container.querySelector('[data-slot="account-icon"]');
		expect(icon).toHaveClass('h-8', 'w-8');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<AccountIcon account={mockAccount} size="md" />);
		const icon = container.querySelector('[data-slot="account-icon"]');
		expect(icon).toHaveClass('h-10', 'w-10');
	});

	it('renders with size lg', () => {
		const { container } = render(<AccountIcon account={mockAccount} size="lg" />);
		const icon = container.querySelector('[data-slot="account-icon"]');
		expect(icon).toHaveClass('h-12', 'w-12');
	});

	it('accepts custom className', () => {
		const { container } = render(<AccountIcon account={mockAccount} className="custom-class" />);
		const icon = container.querySelector('[data-slot="account-icon"]');
		expect(icon).toHaveClass('custom-class');
	});
});

describe('AccountTypeBadge', () => {
	it('renders with account type', () => {
		const { container } = render(<AccountTypeBadge type="CHECKING" />);
		const badge = container.querySelector('[data-slot="account-type-badge"]');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveTextContent('Courant');
	});

	it('renders savings type', () => {
		const { container } = render(<AccountTypeBadge type="SAVINGS" />);
		const badge = container.querySelector('[data-slot="account-type-badge"]');
		expect(badge).toHaveTextContent('Épargne');
	});

	it('renders investment type', () => {
		const { container } = render(<AccountTypeBadge type="INVESTMENT" />);
		const badge = container.querySelector('[data-slot="account-type-badge"]');
		expect(badge).toHaveTextContent('Invest');
	});

	it('renders with variant default', () => {
		const { container } = render(<AccountTypeBadge type="CHECKING" variant="default" />);
		const badge = container.querySelector('[data-slot="account-type-badge"]');
		expect(badge).toHaveClass('bg-muted');
	});

	it('renders with variant subtle', () => {
		const { container } = render(<AccountTypeBadge type="CHECKING" variant="subtle" />);
		const badge = container.querySelector('[data-slot="account-type-badge"]');
		expect(badge).not.toHaveClass('bg-muted');
	});

	it('accepts custom className', () => {
		const { container } = render(<AccountTypeBadge type="CHECKING" className="custom-class" />);
		const badge = container.querySelector('[data-slot="account-type-badge"]');
		expect(badge).toHaveClass('custom-class');
	});
});

describe('MemberBadge', () => {
	it('renders with member data', () => {
		const { container } = render(<MemberBadge member={mockMember} />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).toBeInTheDocument();
	});

	it('shows member initials', () => {
		const { container } = render(<MemberBadge member={mockMember} />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).toHaveTextContent('JD');
	});

	it('shows ownership share when less than 100%', () => {
		const { container } = render(<MemberBadge member={mockMember} showShare />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).toHaveTextContent('50%');
	});

	it('hides share when showShare is false', () => {
		const { container } = render(<MemberBadge member={mockMember} showShare={false} />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).not.toHaveTextContent('50%');
	});

	it('hides share when ownerShare is 100%', () => {
		const fullOwner = { ...mockMember, ownerShare: 100 };
		const { container } = render(<MemberBadge member={fullOwner} showShare />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).not.toHaveTextContent('100%');
	});

	it('applies member color', () => {
		const { container } = render(<MemberBadge member={mockMember} />);
		const avatar = container.querySelector('.rounded-full');
		expect(avatar).toHaveStyle({ backgroundColor: '#6366f1' });
	});

	it('accepts custom className', () => {
		const { container } = render(<MemberBadge member={mockMember} className="custom-class" />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).toHaveClass('custom-class');
	});
});

describe('AccountCard', () => {
	it('renders with required props', () => {
		const { container } = render(<AccountCard account={mockAccount} />);
		const card = container.querySelector('[data-slot="account-card"]');
		expect(card).toBeInTheDocument();
		expect(card).toHaveClass('glass-card');
		expect(within(card as HTMLElement).getByText('Compte Principal')).toBeInTheDocument();
	});

	it('renders balance formatted as currency', () => {
		const { container } = render(<AccountCard account={mockAccount} />);
		const card = container.querySelector('[data-slot="account-card"]') as HTMLElement;
		expect(within(card).getByText(/1\s*235\s*€/)).toBeInTheDocument();
	});

	it('renders negative balance with value-negative class', () => {
		const { container } = render(<AccountCard account={mockNegativeAccount} />);
		const card = container.querySelector('[data-slot="account-card"]') as HTMLElement;
		const balance = card.querySelector('.value-negative');
		expect(balance).toBeInTheDocument();
	});

	it('renders with variant compact', () => {
		const { container } = render(<AccountCard account={mockAccount} variant="compact" />);
		const card = container.querySelector('[data-slot="account-card"]');
		expect(card).toHaveClass('p-3');
	});

	it('renders with variant default', () => {
		const { container } = render(<AccountCard account={mockAccount} variant="default" />);
		const card = container.querySelector('[data-slot="account-card"]');
		expect(card).toHaveClass('p-4');
	});

	it('renders with variant detailed', () => {
		const { container } = render(<AccountCard account={mockAccount} variant="detailed" />);
		const card = container.querySelector('[data-slot="account-card"]');
		expect(card).toHaveClass('p-5');
	});

	it('shows bank name when showBank is true', () => {
		const { container } = render(<AccountCard account={mockAccount} showBank />);
		const card = container.querySelector('[data-slot="account-card"]') as HTMLElement;
		expect(within(card).getByText('Crédit Mutuel')).toBeInTheDocument();
	});

	it('hides bank name when showBank is false', () => {
		const { container } = render(<AccountCard account={mockAccount} showBank={false} />);
		const card = container.querySelector('[data-slot="account-card"]') as HTMLElement;
		expect(within(card).queryByText('Crédit Mutuel')).not.toBeInTheDocument();
	});

	it('shows type badge when showType is true', () => {
		const { container } = render(<AccountCard account={mockAccount} showType />);
		const typeBadge = container.querySelector('[data-slot="account-type-badge"]');
		expect(typeBadge).toBeInTheDocument();
	});

	it('hides type badge when showType is false', () => {
		const { container } = render(<AccountCard account={mockAccount} showType={false} />);
		const typeBadge = container.querySelector('[data-slot="account-type-badge"]');
		expect(typeBadge).not.toBeInTheDocument();
	});

	it('shows members when showMembers is true and variant is detailed', () => {
		const { container } = render(
			<AccountCard account={mockAccountWithMembers} variant="detailed" showMembers />,
		);
		const memberBadges = container.querySelectorAll('[data-slot="member-badge"]');
		expect(memberBadges).toHaveLength(2);
	});

	it('hides members when showMembers is false', () => {
		const { container } = render(
			<AccountCard account={mockAccountWithMembers} variant="detailed" showMembers={false} />,
		);
		const memberBadges = container.querySelectorAll('[data-slot="member-badge"]');
		expect(memberBadges).toHaveLength(0);
	});

	it('renders with interactive prop', () => {
		const { container } = render(<AccountCard account={mockAccount} interactive />);
		const card = container.querySelector('[data-slot="account-card"]');
		expect(card).toHaveClass('cursor-pointer');
		expect(card).toHaveAttribute('role', 'button');
		expect(card).toHaveAttribute('tabIndex', '0');
	});

	it('calls onAccountClick when clicked', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<AccountCard account={mockAccount} interactive onAccountClick={handleClick} />,
		);
		const card = container.querySelector('[data-slot="account-card"]') as HTMLElement;
		fireEvent.click(card);
		expect(handleClick).toHaveBeenCalled();
	});

	it('calls onAccountClick on Enter key', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<AccountCard account={mockAccount} interactive onAccountClick={handleClick} />,
		);
		const card = container.querySelector('[data-slot="account-card"]') as HTMLElement;
		fireEvent.keyDown(card, { key: 'Enter' });
		expect(handleClick).toHaveBeenCalled();
	});

	it('shows chevron when interactive', () => {
		const { container } = render(<AccountCard account={mockAccount} interactive />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(<AccountCard account={mockAccount} className="custom-class" />);
		const card = container.querySelector('[data-slot="account-card"]');
		expect(card).toHaveClass('custom-class');
	});
});

describe('AccountCardList', () => {
	const mockAccounts = [{ account: mockAccount }, { account: mockSavingsAccount }];

	it('renders list of account cards', () => {
		const { container } = render(<AccountCardList accounts={mockAccounts} />);
		const list = container.querySelector('[data-slot="account-card-list"]');
		expect(list).toBeInTheDocument();
		const cards = container.querySelectorAll('[data-slot="account-card"]');
		expect(cards).toHaveLength(2);
	});

	it('passes variant to all cards', () => {
		const { container } = render(<AccountCardList accounts={mockAccounts} variant="compact" />);
		const cards = container.querySelectorAll('[data-slot="account-card"]');
		cards.forEach((card) => {
			expect(card).toHaveClass('p-3');
		});
	});

	it('passes interactive to all cards', () => {
		const { container } = render(<AccountCardList accounts={mockAccounts} interactive />);
		const cards = container.querySelectorAll('[data-slot="account-card"]');
		cards.forEach((card) => {
			expect(card).toHaveClass('cursor-pointer');
		});
	});

	it('calls onAccountClick with correct account', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<AccountCardList accounts={mockAccounts} interactive onAccountClick={handleClick} />,
		);
		const cards = container.querySelectorAll('[data-slot="account-card"]');
		fireEvent.click(cards[1]);
		expect(handleClick).toHaveBeenCalledWith(mockSavingsAccount);
	});

	it('accepts custom className', () => {
		const { container } = render(
			<AccountCardList accounts={mockAccounts} className="custom-list" />,
		);
		const list = container.querySelector('[data-slot="account-card-list"]');
		expect(list).toHaveClass('custom-list');
	});
});

describe('AccountCardSkeleton', () => {
	it('renders with default props', () => {
		const { container } = render(<AccountCardSkeleton />);
		const skeleton = container.querySelector('[data-slot="account-card-skeleton"]');
		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveClass('glass-card', 'animate-pulse');
	});

	it('renders with variant compact', () => {
		const { container } = render(<AccountCardSkeleton variant="compact" />);
		const skeleton = container.querySelector('[data-slot="account-card-skeleton"]');
		expect(skeleton).toHaveClass('p-3');
	});

	it('renders with variant detailed', () => {
		const { container } = render(<AccountCardSkeleton variant="detailed" />);
		const skeleton = container.querySelector('[data-slot="account-card-skeleton"]');
		expect(skeleton).toHaveClass('p-5');
	});

	it('accepts custom className', () => {
		const { container } = render(<AccountCardSkeleton className="custom-skeleton" />);
		const skeleton = container.querySelector('[data-slot="account-card-skeleton"]');
		expect(skeleton).toHaveClass('custom-skeleton');
	});

	it('renders placeholder elements', () => {
		const { container } = render(<AccountCardSkeleton />);
		const placeholders = container.querySelectorAll('.bg-muted');
		expect(placeholders.length).toBeGreaterThan(0);
	});
});
