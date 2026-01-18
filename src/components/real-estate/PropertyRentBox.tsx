import { Flex } from '@/components'

interface PropertyRentBoxProps {
	rentAmount: number
	rentCharges?: number | null
	formatCurrency: (amount: number) => string
}

/**
 * Rental info display box
 */
export function PropertyRentBox({ rentAmount, rentCharges, formatCurrency }: PropertyRentBoxProps) {
	return (
		<div className="rounded-xl bg-emerald-500/10 p-3">
			<Flex direction="row" justify="between">
				<Flex direction="col" gap="xs">
					<span className="text-xs text-emerald-600 dark:text-emerald-400">Loyer mensuel</span>
					<span className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
						{formatCurrency(rentAmount)}
					</span>
				</Flex>
				{rentCharges && (
					<Flex direction="col" gap="xs" align="end">
						<span className="text-xs text-muted-foreground">Net de charges</span>
						<span className="font-medium tabular-nums">{formatCurrency(rentAmount - rentCharges)}</span>
					</Flex>
				)}
			</Flex>
		</div>
	)
}
