import { Button, Card, Flex } from '@/components'
import type { ReactNode } from 'react'

interface PositionsSectionProps {
	children: ReactNode
	onViewAll?: () => void
}

/**
 * Section containing the positions list with header
 */
export function PositionsSection({ children, onViewAll }: PositionsSectionProps) {
	return (
		<Card padding="lg">
			<Flex direction="row" justify="between" className="mb-4">
				<Flex direction="col" gap="xs">
					<h3 className="text-lg font-bold tracking-tight">Positions</h3>
					<span className="text-sm text-muted-foreground">
						Toutes vos positions d&apos;investissement
					</span>
				</Flex>
				<Button variant="outline" size="sm" onClick={onViewAll}>
					Voir tout
				</Button>
			</Flex>
			<Flex direction="col" gap="sm">
				{children}
			</Flex>
		</Card>
	)
}
