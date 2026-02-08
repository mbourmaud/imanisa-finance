'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { MemberAvatar } from '@/components/members/MemberAvatar'
import type { AccountMember } from './account-types'

export interface MemberBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	member: Pick<AccountMember, 'id' | 'name' | 'color' | 'avatarUrl' | 'ownerShare'>
	showShare?: boolean
}

export const MemberBadge = forwardRef<HTMLDivElement, MemberBadgeProps>(
	({ className, member, showShare = true, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="member-badge"
				className={cn('inline-flex items-center gap-1.5 text-xs', className)}
				{...props}
			>
				<MemberAvatar member={member} size="xs" />
				{showShare && member.ownerShare < 100 && (
					<span className="text-muted-foreground">{member.ownerShare}%</span>
				)}
			</div>
		)
	},
)
MemberBadge.displayName = 'MemberBadge'
