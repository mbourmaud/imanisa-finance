'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { MemberAvatar, type MemberAvatarSize, sizeClasses } from './MemberAvatar'
import type { MemberData } from './member-types'

export interface MemberAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	members: MemberData[]
	size?: MemberAvatarSize
	max?: number
	spacing?: 'tight' | 'normal'
}

const spacingClasses: Record<'tight' | 'normal', string> = {
	tight: '-space-x-2',
	normal: '-space-x-1',
}

const zIndexClasses = ['z-10', 'z-9', 'z-8', 'z-7', 'z-6', 'z-5', 'z-4', 'z-3', 'z-2', 'z-1']

export const MemberAvatarGroup = forwardRef<HTMLDivElement, MemberAvatarGroupProps>(
	({ className, members, size = 'sm', max = 4, spacing = 'tight', ...props }, ref) => {
		const visibleMembers = members.slice(0, max)
		const remainingCount = members.length - max

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
						className={cn('relative', zIndexClasses[index] || 'z-0')}
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
		)
	},
)
MemberAvatarGroup.displayName = 'MemberAvatarGroup'
