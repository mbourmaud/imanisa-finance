import { Card, Flex } from '@/components'
import type { ReactNode } from 'react'

interface PortfolioChartSectionProps {
	children: ReactNode
}

/**
 * Section containing the portfolio performance chart with legend
 */
export function PortfolioChartSection({ children }: PortfolioChartSectionProps) {
	return (
		<Card padding="lg">
			<Flex direction="row" justify="between" className="mb-4">
				<Flex direction="col" gap="xs">
					<h3 className="text-lg font-bold tracking-tight">
						Évolution du portefeuille
					</h3>
					<span className="text-sm text-muted-foreground">
						Performance sur 12 mois
					</span>
				</Flex>
				<Flex direction="row" gap="md">
					<Flex direction="row" gap="sm" align="center">
						<div className="h-2 w-4 rounded-sm bg-violet-500" />
						<span className="text-sm text-muted-foreground">Valeur</span>
					</Flex>
					<Flex direction="row" gap="sm" align="center">
						<div className="h-0 w-4 border-t-2 border-dashed border-muted-foreground" />
						<span className="text-sm text-muted-foreground">Investi</span>
					</Flex>
				</Flex>
			</Flex>
			{children}
		</Card>
	)
}
