'use client'

import { Button, Loader2, X } from '@/components'
import { MemberAvatar } from '@/components/members/MemberAvatar'

interface MemberChipProps {
	memberId: string
	memberName: string
	memberColor: string | null
	isRemoving?: boolean
	onRemove: () => void
	disabled?: boolean
}

/**
 * Chip displaying a member with avatar and remove button
 */
export function MemberChip({
	memberId,
	memberName,
	memberColor,
	isRemoving = false,
	onRemove,
	disabled = false,
}: MemberChipProps) {
	return (
		<div
			className={`flex items-center gap-1 pl-1.5 pr-1 py-1 text-sm rounded-md bg-muted transition-opacity ${
				isRemoving ? 'opacity-50' : ''
			}`}
		>
			{isRemoving ? (
				<div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted">
					<Loader2 className="h-3 w-3 animate-spin" />
				</div>
			) : (
				<MemberAvatar
					member={{ id: memberId, name: memberName, color: memberColor }}
					size="xs"
				/>
			)}
			<span className="font-medium">{memberName}</span>
			<Button
				variant="ghost"
				size="icon"
				onClick={onRemove}
				disabled={disabled || isRemoving}
				className="h-5 w-5 rounded text-muted-foreground transition-all hover:text-foreground"
			>
				<X className="h-3 w-3" />
			</Button>
		</div>
	)
}
