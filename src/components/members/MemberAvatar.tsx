'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { MemberData, MemberWithShare } from './member-types'
import { getContrastColor, getDefaultColor, getInitials } from './member-utils'

// Re-export types and sub-components for backwards compatibility
export type { MemberData, MemberWithShare } from './member-types'
export type { MemberAvatarGroupProps } from './MemberAvatarGroup'
export { MemberAvatarGroup } from './MemberAvatarGroup'
export type { MemberListProps } from './MemberList'
export { MemberList } from './MemberList'
export type { MemberSelectorProps } from './MemberSelector'
export { MemberSelector } from './MemberSelector'

// MemberAvatar Component

export type MemberAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const sizeClasses: Record<MemberAvatarSize, string> = {
	xs: 'h-5 w-5 text-[10px]',
	sm: 'h-6 w-6 text-xs',
	md: 'h-8 w-8 text-sm',
	lg: 'h-10 w-10 text-base',
	xl: 'h-12 w-12 text-lg',
}

export interface MemberAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
	member: MemberData
	size?: MemberAvatarSize
	colorIndex?: number
	showBorder?: boolean
}

export const MemberAvatar = forwardRef<HTMLSpanElement, MemberAvatarProps>(
	({ className, member, size = 'md', colorIndex = 0, showBorder = false, ...props }, ref) => {
		const initials = getInitials(member.name)
		const bgColor = member.color || getDefaultColor(colorIndex)
		const textColor = getContrastColor(bgColor)
		const colorStyle = {
			'--member-bg': bgColor,
			'--member-text': textColor,
		} as React.CSSProperties

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
		)
	},
)
MemberAvatar.displayName = 'MemberAvatar'

// MemberAvatarWithName Component

export interface MemberAvatarWithNameProps extends React.HTMLAttributes<HTMLDivElement> {
	member: MemberData
	size?: MemberAvatarSize
	colorIndex?: number
	description?: string
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
		)
	},
)
MemberAvatarWithName.displayName = 'MemberAvatarWithName'

// MemberBadge Component

export interface MemberBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	member: MemberWithShare
	size?: MemberAvatarSize
	colorIndex?: number
	showShare?: boolean
	variant?: 'default' | 'compact'
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
		const hasPartialShare = member.ownerShare !== undefined && member.ownerShare < 100

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
		)
	},
)
MemberBadge.displayName = 'MemberBadge'
