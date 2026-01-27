import { Card, Flex, Progress } from '@/components'

interface BudgetProgressProps {
	totalBudget: number
	totalSpent: number
	formatCurrency: (amount: number) => string
}

/**
 * Budget progress bar with labels
 */
export function BudgetProgress({ totalBudget, totalSpent, formatCurrency }: BudgetProgressProps) {
	const remaining = totalBudget - totalSpent

	return (
		<Card padding="lg">
			<Flex direction="row" justify="between" align="center">
				<span className="font-medium">Progression du mois</span>
				<span className="text-sm text-muted-foreground">
					{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
				</span>
			</Flex>
			<Progress value={(totalSpent / totalBudget) * 100} className="mt-2 h-3" />
			<span className="mt-2 block text-xs text-muted-foreground">
				Il vous reste {remaining > 0 ? formatCurrency(remaining) : '0 €'} à dépenser ce mois
			</span>
		</Card>
	)
}
