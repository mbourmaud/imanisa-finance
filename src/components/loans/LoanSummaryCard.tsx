import { Card, CardContent, Flex } from '@/components'
import { formatMoney } from '@/shared/utils'

interface LoanSummaryCardProps {
	totalMonthly: number
	capitalPayment: number
	insurancePayment: number
}

/**
 * Summary card showing total monthly loan payments
 */
export function LoanSummaryCard({
	totalMonthly,
	capitalPayment,
	insurancePayment,
}: LoanSummaryCardProps) {
	return (
		<Card className="border-border/60 bg-muted/20">
			<CardContent className="pt-6">
				<Flex direction="row" justify="between" align="center">
					<Flex direction="col" gap="xs">
						<span className="font-medium">Total mensuel</span>
						<span className="text-sm text-muted-foreground">
							Tous crédits confondus
						</span>
					</Flex>
					<Flex direction="col" gap="xs" align="end">
						<span className="text-3xl font-semibold tabular-nums">
							{formatMoney(totalMonthly)}
						</span>
						<span className="text-sm text-muted-foreground">
							{formatMoney(capitalPayment)} capital + {formatMoney(insurancePayment)}{' '}
							assurance
						</span>
					</Flex>
				</Flex>
			</CardContent>
		</Card>
	)
}
