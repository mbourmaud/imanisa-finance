import type { ReactNode } from 'react'
import { Button, Flex, Pencil, Trash2 } from '@/components'

interface SettingsMemberRowProps {
	avatar: ReactNode
	name: string
	accountCount: number
	onEdit: () => void
	onDelete: () => void
	editDialog?: ReactNode
}

/**
 * Row displaying a household member with edit/delete actions
 */
export function SettingsMemberRow({
	avatar,
	name,
	accountCount,
	onEdit,
	onDelete,
	editDialog,
}: SettingsMemberRowProps) {
	return (
		<Flex
			direction="row"
			justify="between"
			align="center"
			className="rounded-xl bg-background/50 p-4 transition-colors"
		>
			<Flex direction="row" gap="md" align="center">
				{avatar}
				<Flex direction="col">
					<p className="font-medium">{name}</p>
					<p className="text-xs text-muted-foreground">
						{accountCount} compte{accountCount !== 1 ? 's' : ''}
					</p>
				</Flex>
			</Flex>
			<Flex direction="row" gap="md" align="center">
				<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
					<Pencil className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-destructive"
					onClick={onDelete}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
				{editDialog}
			</Flex>
		</Flex>
	)
}
