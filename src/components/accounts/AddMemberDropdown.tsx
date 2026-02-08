'use client'

import { Button, Loader2, Plus } from '@/components'
import { MemberAvatar } from '@/components/members/MemberAvatar'

interface Member {
	id: string
	name: string
	color: string | null
}

interface AddMemberDropdownProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	availableMembers: Member[]
	onSelectMember: (memberId: string) => void
	isPending?: boolean
	pendingMemberId?: string
	pendingMemberName?: string
	pendingMemberColor?: string | null
	disabled?: boolean
}

/**
 * Dropdown for adding members to an account with inline button
 */
export function AddMemberDropdown({
	open,
	onOpenChange,
	availableMembers,
	onSelectMember,
	isPending = false,
	pendingMemberId,
	pendingMemberName,
	pendingMemberColor,
	disabled = false,
}: AddMemberDropdownProps) {
	return (
		<div className="relative">
			{/* Loading indicator when adding */}
			{isPending && pendingMemberId && (
				<div className="flex items-center gap-1 pl-1.5 pr-2 py-1 text-sm rounded-md bg-muted/50 animate-pulse">
					<div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted">
						<Loader2 className="h-3 w-3 animate-spin" />
					</div>
					<span className="font-medium text-muted-foreground">{pendingMemberName}</span>
				</div>
			)}

			{/* Add button */}
			{!isPending && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onOpenChange(!open)}
					disabled={disabled}
					className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm text-muted-foreground transition-all hover:text-foreground"
				>
					<Plus className="h-4 w-4" />
					Ajouter
				</Button>
			)}

			{/* Dropdown */}
			{open && (
				<div className="absolute top-full left-0 z-50 min-w-[180px] p-1 rounded-md border border-border shadow-lg bg-popover mt-1">
					{availableMembers.map((member) => (
						<Button
							key={member.id}
							variant="ghost"
							onClick={() => onSelectMember(member.id)}
							fullWidth
							className="flex items-center gap-2 px-2 py-1.5 rounded text-sm justify-start text-left transition-all"
						>
							<MemberAvatar
								member={{ id: member.id, name: member.name, color: member.color }}
								size="xs"
							/>
							<span>{member.name}</span>
						</Button>
					))}
					{availableMembers.length === 0 && (
						<span className="text-sm text-muted-foreground px-2 py-1">
							Tous les membres sont ajoutés
						</span>
					)}
				</div>
			)}
		</div>
	)
}
