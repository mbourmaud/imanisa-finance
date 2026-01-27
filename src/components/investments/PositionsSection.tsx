import { Button, Card } from '@/components';
import type { ReactNode } from 'react';

interface PositionsSectionProps {
	children: ReactNode;
	onViewAll?: () => void;
}

/**
 * Section containing the positions list with header
 */
export function PositionsSection({ children, onViewAll }: PositionsSectionProps) {
	return (
		<Card padding="lg">
			<div className="flex justify-between mb-4">
				<div className="flex flex-col gap-1">
					<h3 className="text-lg font-bold tracking-tight">Positions</h3>
					<span className="text-sm text-muted-foreground">
						Toutes vos positions d&apos;investissement
					</span>
				</div>
				<Button variant="outline" size="sm" onClick={onViewAll}>
					Voir tout
				</Button>
			</div>
			<div className="flex flex-col gap-2">{children}</div>
		</Card>
	);
}
