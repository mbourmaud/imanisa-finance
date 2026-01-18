import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MemberData, MemberWithShare } from '../MemberAvatar';
import {
	MemberAvatar,
	MemberAvatarGroup,
	MemberAvatarWithName,
	MemberBadge,
	MemberList,
	MemberSelector,
} from '../MemberAvatar';

// Mock member data
const mockMember: MemberData = {
	id: 'member-1',
	name: 'Jean Dupont',
	color: '#6366f1',
};

const mockMemberWithAvatar: MemberData = {
	id: 'member-2',
	name: 'Marie Dupont',
	color: '#f43f5e',
	avatarUrl: 'https://example.com/avatar.jpg',
};

const mockMemberNoColor: MemberData = {
	id: 'member-3',
	name: 'Pierre Martin',
	color: null,
};

const mockMemberWithShare: MemberWithShare = {
	...mockMember,
	ownerShare: 50,
};

const mockMembers: MemberData[] = [
	mockMember,
	mockMemberWithAvatar,
	mockMemberNoColor,
	{ id: 'member-4', name: 'Sophie Bernard', color: '#10b981' },
	{ id: 'member-5', name: 'Luc Moreau', color: '#f59e0b' },
];

describe('MemberAvatar', () => {
	it('renders with member data', () => {
		const { container } = render(<MemberAvatar member={mockMember} />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toBeInTheDocument();
	});

	it('displays member initials', () => {
		const { container } = render(<MemberAvatar member={mockMember} />);
		const avatar = container.querySelector('[data-slot="member-avatar"]') as HTMLElement;
		expect(within(avatar).getByText('JD')).toBeInTheDocument();
	});

	it('renders with avatarUrl member and shows fallback', () => {
		// Radix Avatar only renders img after successful load, so in jsdom we see the fallback
		const { container } = render(<MemberAvatar member={mockMemberWithAvatar} />);
		const avatar = container.querySelector('[data-slot="member-avatar"]') as HTMLElement;
		const fallback = container.querySelector('[data-slot="avatar-fallback"]');
		// Avatar should render
		expect(avatar).toBeInTheDocument();
		// Fallback should show initials (in jsdom, image doesn't load)
		expect(fallback).toBeInTheDocument();
		expect(within(avatar).getByText('MD')).toBeInTheDocument();
	});

	it('renders with size xs', () => {
		const { container } = render(<MemberAvatar member={mockMember} size="xs" />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toHaveClass('h-5', 'w-5');
	});

	it('renders with size sm', () => {
		const { container } = render(<MemberAvatar member={mockMember} size="sm" />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toHaveClass('h-6', 'w-6');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<MemberAvatar member={mockMember} size="md" />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toHaveClass('h-8', 'w-8');
	});

	it('renders with size lg', () => {
		const { container } = render(<MemberAvatar member={mockMember} size="lg" />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toHaveClass('h-10', 'w-10');
	});

	it('renders with size xl', () => {
		const { container } = render(<MemberAvatar member={mockMember} size="xl" />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toHaveClass('h-12', 'w-12');
	});

	it('applies member color to background', () => {
		const { container } = render(<MemberAvatar member={mockMember} />);
		const fallback = container.querySelector('[data-slot="avatar-fallback"]');
		expect(fallback).toHaveStyle({ backgroundColor: '#6366f1' });
	});

	it('uses default color when member has no color', () => {
		const { container } = render(<MemberAvatar member={mockMemberNoColor} colorIndex={0} />);
		const fallback = container.querySelector('[data-slot="avatar-fallback"]');
		// First default color is #6366f1
		expect(fallback).toHaveStyle({ backgroundColor: '#6366f1' });
	});

	it('renders with border when showBorder is true', () => {
		const { container } = render(<MemberAvatar member={mockMember} showBorder />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toHaveClass('ring-2', 'ring-background');
	});

	it('accepts custom className', () => {
		const { container } = render(<MemberAvatar member={mockMember} className="custom-class" />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toHaveClass('custom-class');
	});
});

describe('MemberAvatarWithName', () => {
	it('renders with member data', () => {
		const { container } = render(<MemberAvatarWithName member={mockMember} />);
		const component = container.querySelector('[data-slot="member-avatar-with-name"]');
		expect(component).toBeInTheDocument();
	});

	it('displays member name', () => {
		const { container } = render(<MemberAvatarWithName member={mockMember} />);
		const component = container.querySelector(
			'[data-slot="member-avatar-with-name"]',
		) as HTMLElement;
		expect(within(component).getByText('Jean Dupont')).toBeInTheDocument();
	});

	it('displays description when provided', () => {
		const { container } = render(
			<MemberAvatarWithName member={mockMember} description="Administrateur" />,
		);
		const component = container.querySelector(
			'[data-slot="member-avatar-with-name"]',
		) as HTMLElement;
		expect(within(component).getByText('Administrateur')).toBeInTheDocument();
	});

	it('contains member avatar', () => {
		const { container } = render(<MemberAvatarWithName member={mockMember} />);
		const avatar = container.querySelector('[data-slot="member-avatar"]');
		expect(avatar).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(
			<MemberAvatarWithName member={mockMember} className="custom-class" />,
		);
		const component = container.querySelector('[data-slot="member-avatar-with-name"]');
		expect(component).toHaveClass('custom-class');
	});
});

describe('MemberBadge', () => {
	it('renders with member data', () => {
		const { container } = render(<MemberBadge member={mockMemberWithShare} />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).toBeInTheDocument();
	});

	it('displays first name in default variant', () => {
		const { container } = render(<MemberBadge member={mockMemberWithShare} variant="default" />);
		const badge = container.querySelector('[data-slot="member-badge"]') as HTMLElement;
		expect(within(badge).getByText('Jean')).toBeInTheDocument();
	});

	it('shows ownership share when less than 100%', () => {
		const { container } = render(<MemberBadge member={mockMemberWithShare} showShare />);
		const badge = container.querySelector('[data-slot="member-badge"]') as HTMLElement;
		expect(within(badge).getByText('50%')).toBeInTheDocument();
	});

	it('hides share when showShare is false', () => {
		const { container } = render(<MemberBadge member={mockMemberWithShare} showShare={false} />);
		const badge = container.querySelector('[data-slot="member-badge"]') as HTMLElement;
		expect(within(badge).queryByText('50%')).not.toBeInTheDocument();
	});

	it('hides share when ownerShare is 100%', () => {
		const fullOwner: MemberWithShare = { ...mockMember, ownerShare: 100 };
		const { container } = render(<MemberBadge member={fullOwner} showShare />);
		const badge = container.querySelector('[data-slot="member-badge"]') as HTMLElement;
		expect(within(badge).queryByText('100%')).not.toBeInTheDocument();
	});

	it('renders with variant compact', () => {
		const { container } = render(<MemberBadge member={mockMemberWithShare} variant="compact" />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).not.toHaveClass('bg-muted/50');
	});

	it('renders with variant default', () => {
		const { container } = render(<MemberBadge member={mockMemberWithShare} variant="default" />);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).toHaveClass('bg-muted/50', 'rounded-full', 'px-2');
	});

	it('accepts custom className', () => {
		const { container } = render(
			<MemberBadge member={mockMemberWithShare} className="custom-class" />,
		);
		const badge = container.querySelector('[data-slot="member-badge"]');
		expect(badge).toHaveClass('custom-class');
	});
});

describe('MemberAvatarGroup', () => {
	it('renders group of avatars', () => {
		const { container } = render(<MemberAvatarGroup members={mockMembers} />);
		const group = container.querySelector('[data-slot="member-avatar-group"]');
		expect(group).toBeInTheDocument();
	});

	it('displays max number of avatars (default 4)', () => {
		const { container } = render(<MemberAvatarGroup members={mockMembers} />);
		const avatars = container.querySelectorAll('[data-slot="member-avatar"]');
		expect(avatars).toHaveLength(4);
	});

	it('displays custom max number of avatars', () => {
		const { container } = render(<MemberAvatarGroup members={mockMembers} max={2} />);
		const avatars = container.querySelectorAll('[data-slot="member-avatar"]');
		expect(avatars).toHaveLength(2);
	});

	it('shows overflow count when members exceed max', () => {
		const { container } = render(<MemberAvatarGroup members={mockMembers} max={3} />);
		const overflow = container.querySelector('[data-slot="member-avatar-overflow"]');
		expect(overflow).toBeInTheDocument();
		expect(overflow).toHaveTextContent('+2');
	});

	it('does not show overflow when all members fit', () => {
		const { container } = render(<MemberAvatarGroup members={mockMembers.slice(0, 2)} max={4} />);
		const overflow = container.querySelector('[data-slot="member-avatar-overflow"]');
		expect(overflow).not.toBeInTheDocument();
	});

	it('renders with tight spacing', () => {
		const { container } = render(<MemberAvatarGroup members={mockMembers} spacing="tight" />);
		const group = container.querySelector('[data-slot="member-avatar-group"]');
		expect(group).toHaveClass('-space-x-2');
	});

	it('renders with normal spacing', () => {
		const { container } = render(<MemberAvatarGroup members={mockMembers} spacing="normal" />);
		const group = container.querySelector('[data-slot="member-avatar-group"]');
		expect(group).toHaveClass('-space-x-1');
	});

	it('accepts custom className', () => {
		const { container } = render(
			<MemberAvatarGroup members={mockMembers} className="custom-class" />,
		);
		const group = container.querySelector('[data-slot="member-avatar-group"]');
		expect(group).toHaveClass('custom-class');
	});
});

describe('MemberList', () => {
	const mockMembersWithShare: MemberWithShare[] = [
		{ ...mockMember, ownerShare: 50 },
		{ ...mockMemberWithAvatar, ownerShare: 50 },
	];

	it('renders list of members', () => {
		const { container } = render(<MemberList members={mockMembersWithShare} />);
		const list = container.querySelector('[data-slot="member-list"]');
		expect(list).toBeInTheDocument();
	});

	it('displays member names', () => {
		const { container } = render(<MemberList members={mockMembersWithShare} />);
		const list = container.querySelector('[data-slot="member-list"]') as HTMLElement;
		expect(within(list).getByText('Jean Dupont')).toBeInTheDocument();
		expect(within(list).getByText('Marie Dupont')).toBeInTheDocument();
	});

	it('shows ownership share when showShare is true', () => {
		const { container } = render(<MemberList members={mockMembersWithShare} showShare />);
		const list = container.querySelector('[data-slot="member-list"]') as HTMLElement;
		const shares = within(list).getAllByText('50% de propriété');
		expect(shares).toHaveLength(2);
	});

	it('hides ownership share when showShare is false', () => {
		const { container } = render(<MemberList members={mockMembersWithShare} showShare={false} />);
		const list = container.querySelector('[data-slot="member-list"]') as HTMLElement;
		expect(within(list).queryByText('50% de propriété')).not.toBeInTheDocument();
	});

	it('renders with vertical variant', () => {
		const { container } = render(<MemberList members={mockMembersWithShare} variant="vertical" />);
		const list = container.querySelector('[data-slot="member-list"]');
		expect(list).toHaveClass('flex-col');
	});

	it('renders with horizontal variant', () => {
		const { container } = render(
			<MemberList members={mockMembersWithShare} variant="horizontal" />,
		);
		const list = container.querySelector('[data-slot="member-list"]');
		expect(list).toHaveClass('flex-wrap');
	});

	it('calls onMemberClick when interactive', () => {
		const handleClick = vi.fn();
		const { container } = render(
			<MemberList members={mockMembersWithShare} interactive onMemberClick={handleClick} />,
		);
		const list = container.querySelector('[data-slot="member-list"]') as HTMLElement;
		const memberItems = within(list).getAllByRole('button');
		fireEvent.click(memberItems[0]);
		expect(handleClick).toHaveBeenCalledWith(mockMembersWithShare[0]);
	});

	it('accepts custom className', () => {
		const { container } = render(
			<MemberList members={mockMembersWithShare} className="custom-class" />,
		);
		const list = container.querySelector('[data-slot="member-list"]');
		expect(list).toHaveClass('custom-class');
	});
});

describe('MemberSelector', () => {
	it('renders selector with members', () => {
		const { container } = render(<MemberSelector members={mockMembers} selectedIds={[]} />);
		const selector = container.querySelector('[data-slot="member-selector"]');
		expect(selector).toBeInTheDocument();
	});

	it('displays all members as buttons', () => {
		const { container } = render(<MemberSelector members={mockMembers} selectedIds={[]} />);
		const selector = container.querySelector('[data-slot="member-selector"]') as HTMLElement;
		const buttons = within(selector).getAllByRole('button');
		expect(buttons).toHaveLength(5);
	});

	it('shows selected state for selected members', () => {
		const { container } = render(
			<MemberSelector members={mockMembers} selectedIds={['member-1']} />,
		);
		const selector = container.querySelector('[data-slot="member-selector"]') as HTMLElement;
		const buttons = within(selector).getAllByRole('button');
		expect(buttons[0]).toHaveClass('border-primary');
	});

	it('calls onSelectionChange when member clicked (multiple mode)', () => {
		const handleChange = vi.fn();
		const { container } = render(
			<MemberSelector
				members={mockMembers}
				selectedIds={['member-1']}
				onSelectionChange={handleChange}
				multiple
			/>,
		);
		const selector = container.querySelector('[data-slot="member-selector"]') as HTMLElement;
		const buttons = within(selector).getAllByRole('button');

		// Click to add second member
		fireEvent.click(buttons[1]);
		expect(handleChange).toHaveBeenCalledWith(['member-1', 'member-2']);
	});

	it('removes member when clicking selected (multiple mode)', () => {
		const handleChange = vi.fn();
		const { container } = render(
			<MemberSelector
				members={mockMembers}
				selectedIds={['member-1', 'member-2']}
				onSelectionChange={handleChange}
				multiple
			/>,
		);
		const selector = container.querySelector('[data-slot="member-selector"]') as HTMLElement;
		const buttons = within(selector).getAllByRole('button');

		// Click to remove first member
		fireEvent.click(buttons[0]);
		expect(handleChange).toHaveBeenCalledWith(['member-2']);
	});

	it('replaces selection in single mode', () => {
		const handleChange = vi.fn();
		const { container } = render(
			<MemberSelector
				members={mockMembers}
				selectedIds={['member-1']}
				onSelectionChange={handleChange}
				multiple={false}
			/>,
		);
		const selector = container.querySelector('[data-slot="member-selector"]') as HTMLElement;
		const buttons = within(selector).getAllByRole('button');

		// Click to select different member
		fireEvent.click(buttons[1]);
		expect(handleChange).toHaveBeenCalledWith(['member-2']);
	});

	it('deselects in single mode when clicking selected', () => {
		const handleChange = vi.fn();
		const { container } = render(
			<MemberSelector
				members={mockMembers}
				selectedIds={['member-1']}
				onSelectionChange={handleChange}
				multiple={false}
			/>,
		);
		const selector = container.querySelector('[data-slot="member-selector"]') as HTMLElement;
		const buttons = within(selector).getAllByRole('button');

		// Click selected member to deselect
		fireEvent.click(buttons[0]);
		expect(handleChange).toHaveBeenCalledWith([]);
	});

	it('accepts custom className', () => {
		const { container } = render(
			<MemberSelector members={mockMembers} selectedIds={[]} className="custom-class" />,
		);
		const selector = container.querySelector('[data-slot="member-selector"]');
		expect(selector).toHaveClass('custom-class');
	});
});
