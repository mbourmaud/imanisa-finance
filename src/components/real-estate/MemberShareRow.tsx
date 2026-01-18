import { Button, Flex, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, X } from '@/components'

interface Member {
	id: string
	name: string
	color: string | null
}

interface MemberShareRowProps {
	memberId: string
	ownershipShare: number
	members: Member[]
	availableMembers: Member[]
	onMemberChange: (memberId: string) => void
	onShareChange: (share: number) => void
	onRemove: () => void
}

/**
 * Row for member ownership share input
 */
export function MemberShareRow({
	memberId,
	ownershipShare,
	members,
	availableMembers,
	onMemberChange,
	onShareChange,
	onRemove,
}: MemberShareRowProps) {
	const member = members.find((m) => m.id === memberId)

	return (
		<Flex direction="row" gap="md" className="rounded-lg bg-muted/30 p-3">
			<div
				className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
				style={{ backgroundColor: member?.color || '#6b7280' }}
			>
				{member?.name.charAt(0).toUpperCase()}
			</div>
			<Select value={memberId} onValueChange={onMemberChange}>
				<SelectTrigger className="flex-1">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{availableMembers.map((m) => (
						<SelectItem key={m.id} value={m.id}>
							{m.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Flex direction="row" gap="sm" align="center">
				<Input
					type="number"
					min="0"
					max="100"
					className="w-20"
					value={ownershipShare}
					onChange={(e) => onShareChange(Number.parseInt(e.target.value, 10) || 0)}
				/>
				<span className="text-sm text-muted-foreground">%</span>
			</Flex>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="h-8 w-8 flex-shrink-0"
				onClick={onRemove}
			>
				<X className="h-4 w-4" />
			</Button>
		</Flex>
	)
}
