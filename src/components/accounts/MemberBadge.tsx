'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { AccountMember } from './account-types'

export interface MemberBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	member: Pick<AccountMember, 'name' | 'color' | 'ownerShare'>
	showShare?: boolean
}

export const MemberBadge = forwardRef<HTMLDivElement, MemberBadgeProps>(
	({ className, member, showShare = true, ...props }, ref) => {
		const initials = member.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)

		const memberColor = member.color || '#6366f1'
		const colorStyle = { '--member-color': memberColor } as React.CSSProperties

		return (
			<div
				ref={ref}
				data-slot="member-badge"
				className={cn('inline-flex items-center gap-1.5 text-xs', className)}
				style={colorStyle}
				{...props}
			>
				<div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--member-color)] text-[10px] font-medium text-white">
					{initials}
				</div>
				{showShare && member.ownerShare < 100 && (
					<span className="text-muted-foreground">{member.ownerShare}%</span>
				)}
			</div>
		)
	},
)
MemberBadge.displayName = 'MemberBadge'
