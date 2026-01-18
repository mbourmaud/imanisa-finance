import { Flex, type LucideIcon } from '@/components'

interface LoanInfoBoxProps {
	icon: LucideIcon
	label: string
	value: string
	sublabel?: string
}

/**
 * Info box displaying a loan metric (mensualité, taux, durée, etc.)
 */
export function LoanInfoBox({ icon: Icon, label, value, sublabel }: LoanInfoBoxProps) {
	return (
		<Flex direction="col" gap="xs" className="bg-muted/30 rounded-xl p-3">
			<Flex direction="row" gap="sm" className="text-muted-foreground">
				<Icon className="h-3.5 w-3.5" />
				<span className="text-xs">{label}</span>
			</Flex>
			<span className="font-semibold tabular-nums">{value}</span>
			{sublabel && (
				<span className="text-xs text-muted-foreground">{sublabel}</span>
			)}
		</Flex>
	)
}
