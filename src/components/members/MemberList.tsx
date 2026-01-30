'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { MemberAvatar, type MemberAvatarSize } from './MemberAvatar'
import type { MemberWithShare } from './member-types'

export interface MemberListProps extends React.HTMLAttributes<HTMLDivElement> {
	members: MemberWithShare[]
	size?: MemberAvatarSize
	showShare?: boolean
	variant?: 'vertical' | 'horizontal'
	interactive?: boolean
	onMemberClick?: (member: MemberWithShare) => void
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
				onMemberClick(member)
			}
		}

		const handleKeyDown = (e: React.KeyboardEvent, member: MemberWithShare) => {
			if (interactive && onMemberClick && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault()
				onMemberClick(member)
			}
		}

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
		)
	},
)
MemberList.displayName = 'MemberList'
