import type { LucideIcon } from '@/components'
import { Flex } from '@/components'

interface PropertyInfoItemProps {
	icon: LucideIcon
	label: string
	value: string | number | null
}

/**
 * Info item with icon and label
 */
export function PropertyInfoItem({ icon: Icon, label, value }: PropertyInfoItemProps) {
	return (
		<Flex direction="col" align="center">
			<Flex direction="row" gap="xs" className="text-muted-foreground">
				<Icon className="h-3.5 w-3.5" />
				<span className="text-xs">{label}</span>
			</Flex>
			<span className="mt-1 font-medium">{value ?? '-'}</span>
		</Flex>
	)
}
