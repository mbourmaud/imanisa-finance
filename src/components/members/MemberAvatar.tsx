'use client';

/**
 * MemberAvatar Component
 *
 * Feature component for displaying household member avatars.
 * Supports different sizes, custom colors, image avatars, and grouped display.
 */

import type * as React from 'react';
import { forwardRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Types

export interface MemberData {
	id: string;
	name: string;
	color?: string | null;
	avatarUrl?: string | null;
}

export interface MemberWithShare extends MemberData {
	ownerShare?: number;
}

// Helper functions

function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

function getContrastColor(bgColor: string): string {
	// Convert hex to RGB
	const hex = bgColor.replace('#', '');
	const r = Number.parseInt(hex.substring(0, 2), 16);
	const g = Number.parseInt(hex.substring(2, 4), 16);
	const b = Number.parseInt(hex.substring(4, 6), 16);

	// Calculate luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Default colors for members without custom colors

const defaultMemberColors = [
	'#6366f1', // Indigo
	'#f43f5e', // Rose
	'#10b981', // Emerald
	'#f59e0b', // Amber
	'#8b5cf6', // Violet
	'#06b6d4', // Cyan
	'#ec4899', // Pink
	'#14b8a6', // Teal
];

function getDefaultColor(index: number): string {
	return defaultMemberColors[index % defaultMemberColors.length];
}

// MemberAvatar Component

export type MemberAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<MemberAvatarSize, string> = {
	xs: 'h-5 w-5 text-[10px]',
	sm: 'h-6 w-6 text-xs',
	md: 'h-8 w-8 text-sm',
	lg: 'h-10 w-10 text-base',
	xl: 'h-12 w-12 text-lg',
};

export interface MemberAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
	member: MemberData;
	size?: MemberAvatarSize;
	colorIndex?: number;
	showBorder?: boolean;
}

export const MemberAvatar = forwardRef<HTMLSpanElement, MemberAvatarProps>(
	({ className, member, size = 'md', colorIndex = 0, showBorder = false, ...props }, ref) => {
		const initials = getInitials(member.name);
		const bgColor = member.color || getDefaultColor(colorIndex);
		const textColor = getContrastColor(bgColor);
		const colorStyle = {
			'--member-bg': bgColor,
			'--member-text': textColor,
		} as React.CSSProperties;

		return (
			<Avatar
				ref={ref}
				data-slot="member-avatar"
				className={cn(sizeClasses[size], showBorder && 'ring-2 ring-background', className)}
				style={colorStyle}
				{...props}
			>
				{member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
				<AvatarFallback className="font-medium bg-[var(--member-bg)] text-[var(--member-text)]">
					{initials}
				</AvatarFallback>
			</Avatar>
		);
	},
);
MemberAvatar.displayName = 'MemberAvatar';

// MemberAvatarWithName Component

export interface MemberAvatarWithNameProps extends React.HTMLAttributes<HTMLDivElement> {
	member: MemberData;
	size?: MemberAvatarSize;
	colorIndex?: number;
	description?: string;
}

export const MemberAvatarWithName = forwardRef<HTMLDivElement, MemberAvatarWithNameProps>(
	({ className, member, size = 'md', colorIndex = 0, description, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="member-avatar-with-name"
				className={cn('flex items-center gap-2', className)}
				{...props}
			>
				<MemberAvatar member={member} size={size} colorIndex={colorIndex} />
				<div className="min-w-0">
					<p className="font-medium truncate text-sm">{member.name}</p>
					{description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
				</div>
			</div>
		);
	},
);
MemberAvatarWithName.displayName = 'MemberAvatarWithName';

// MemberBadge Component (Full version - extends the one in AccountCard)

export interface MemberBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	member: MemberWithShare;
	size?: MemberAvatarSize;
	colorIndex?: number;
	showShare?: boolean;
	variant?: 'default' | 'compact';
}

export const MemberBadge = forwardRef<HTMLDivElement, MemberBadgeProps>(
	(
		{
			className,
			member,
			size = 'xs',
			colorIndex = 0,
			showShare = true,
			variant = 'default',
			...props
		},
		ref,
	) => {
		const hasPartialShare = member.ownerShare !== undefined && member.ownerShare < 100;

		return (
			<div
				ref={ref}
				data-slot="member-badge"
				className={cn(
					'inline-flex items-center gap-1.5',
					variant === 'default' && 'rounded-full bg-muted/50 px-2 py-0.5',
					className,
				)}
				{...props}
			>
				<MemberAvatar member={member} size={size} colorIndex={colorIndex} />
				{variant === 'default' && (
					<span className="text-xs font-medium truncate max-w-[80px]">
						{member.name.split(' ')[0]}
					</span>
				)}
				{showShare && hasPartialShare && (
					<span className="text-xs text-muted-foreground">{member.ownerShare}%</span>
				)}
			</div>
		);
	},
);
MemberBadge.displayName = 'MemberBadge';

// MemberAvatarGroup Component

export interface MemberAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	members: MemberData[];
	size?: MemberAvatarSize;
	max?: number;
	spacing?: 'tight' | 'normal';
}

const spacingClasses: Record<'tight' | 'normal', string> = {
	tight: '-space-x-2',
	normal: '-space-x-1',
};

export const MemberAvatarGroup = forwardRef<HTMLDivElement, MemberAvatarGroupProps>(
	({ className, members, size = 'sm', max = 4, spacing = 'tight', ...props }, ref) => {
		const visibleMembers = members.slice(0, max);
		const remainingCount = members.length - max;

		return (
			<div
				ref={ref}
				data-slot="member-avatar-group"
				className={cn('flex items-center', spacingClasses[spacing], className)}
				{...props}
			>
				{visibleMembers.map((member, index) => (
					<MemberAvatar
						key={member.id}
						member={member}
						size={size}
						colorIndex={index}
						showBorder
						className={cn('relative', `z-[${visibleMembers.length - index}]`)}
					/>
				))}
				{remainingCount > 0 && (
					<div
						data-slot="member-avatar-overflow"
						className={cn(
							'relative z-0 flex items-center justify-center rounded-full bg-muted ring-2 ring-background font-medium text-muted-foreground',
							sizeClasses[size],
						)}
					>
						+{remainingCount}
					</div>
				)}
			</div>
		);
	},
);
MemberAvatarGroup.displayName = 'MemberAvatarGroup';

// MemberList Component

export interface MemberListProps extends React.HTMLAttributes<HTMLDivElement> {
	members: MemberWithShare[];
	size?: MemberAvatarSize;
	showShare?: boolean;
	variant?: 'vertical' | 'horizontal';
	interactive?: boolean;
	onMemberClick?: (member: MemberWithShare) => void;
}

export const MemberList = forwardRef<HTMLDivElement, MemberListProps>(
	(
		{
			className,
			members,
			size = 'md',
			showShare = true,
			variant = 'vertical',
			interactive = false,
			onMemberClick,
			...props
		},
		ref,
	) => {
		const handleClick = (member: MemberWithShare) => {
			if (interactive && onMemberClick) {
				onMemberClick(member);
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent, member: MemberWithShare) => {
			if (interactive && onMemberClick && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				onMemberClick(member);
			}
		};

		return (
			<div
				ref={ref}
				data-slot="member-list"
				className={cn(
					variant === 'vertical' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2',
					className,
				)}
				{...props}
			>
				{members.map((member, index) => (
					<div
						key={member.id}
						className={cn(
							'flex items-center gap-2',
							variant === 'vertical' && 'w-full',
							interactive &&
								'cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors',
						)}
						onClick={() => handleClick(member)}
						onKeyDown={(e) => handleKeyDown(e, member)}
						role={interactive ? 'button' : undefined}
						tabIndex={interactive ? 0 : undefined}
					>
						<MemberAvatar member={member} size={size} colorIndex={index} />
						<div className="min-w-0 flex-1">
							<p className="font-medium truncate text-sm">{member.name}</p>
							{showShare && member.ownerShare !== undefined && (
								<p className="text-xs text-muted-foreground">{member.ownerShare}% de propriété</p>
							)}
						</div>
					</div>
				))}
			</div>
		);
	},
);
MemberList.displayName = 'MemberList';

// MemberSelector Component

export interface MemberSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
	members: MemberData[];
	selectedIds: string[];
	size?: MemberAvatarSize;
	onSelectionChange?: (selectedIds: string[]) => void;
	multiple?: boolean;
}

export const MemberSelector = forwardRef<HTMLDivElement, MemberSelectorProps>(
	(
		{ className, members, selectedIds, size = 'md', onSelectionChange, multiple = true, ...props },
		ref,
	) => {
		const handleToggle = (memberId: string) => {
			if (!onSelectionChange) return;

			if (multiple) {
				if (selectedIds.includes(memberId)) {
					onSelectionChange(selectedIds.filter((id) => id !== memberId));
				} else {
					onSelectionChange([...selectedIds, memberId]);
				}
			} else {
				onSelectionChange(selectedIds.includes(memberId) ? [] : [memberId]);
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent, memberId: string) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleToggle(memberId);
			}
		};

		return (
			<div
				ref={ref}
				data-slot="member-selector"
				className={cn('flex flex-wrap gap-2', className)}
				{...props}
			>
				{members.map((member, index) => {
					const isSelected = selectedIds.includes(member.id);
					return (
						<button
							key={member.id}
							type="button"
							onClick={() => handleToggle(member.id)}
							onKeyDown={(e) => handleKeyDown(e, member.id)}
							className={cn(
								'flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors',
								'border-2',
								isSelected
									? 'border-primary bg-primary/10 text-foreground'
									: 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted',
							)}
						>
							<MemberAvatar member={member} size={size} colorIndex={index} />
							<span className="text-sm font-medium">{member.name}</span>
						</button>
					);
				})}
			</div>
		);
	},
);
MemberSelector.displayName = 'MemberSelector';
