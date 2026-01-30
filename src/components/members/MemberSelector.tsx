'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { MemberAvatar, type MemberAvatarSize } from './MemberAvatar'
import type { MemberData } from './member-types'

export interface MemberSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
	members: MemberData[]
	selectedIds: string[]
	size?: MemberAvatarSize
	onSelectionChange?: (selectedIds: string[]) => void
	multiple?: boolean
}

export const MemberSelector = forwardRef<HTMLDivElement, MemberSelectorProps>(
	(
		{ className, members, selectedIds, size = 'md', onSelectionChange, multiple = true, ...props },
		ref,
	) => {
		const handleToggle = (memberId: string) => {
			if (!onSelectionChange) return

			if (multiple) {
				if (selectedIds.includes(memberId)) {
					onSelectionChange(selectedIds.filter((id) => id !== memberId))
				} else {
					onSelectionChange([...selectedIds, memberId])
				}
			} else {
				onSelectionChange(selectedIds.includes(memberId) ? [] : [memberId])
			}
		}

		const handleKeyDown = (e: React.KeyboardEvent, memberId: string) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				handleToggle(memberId)
			}
		}

		return (
			<div
				ref={ref}
				data-slot="member-selector"
				className={cn('flex flex-wrap gap-2', className)}
				{...props}
			>
				{members.map((member, index) => {
					const isSelected = selectedIds.includes(member.id)
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
					)
				})}
			</div>
		)
	},
)
MemberSelector.displayName = 'MemberSelector'
