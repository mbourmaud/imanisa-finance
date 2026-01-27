import { Card } from '@/components';
import type { ReactNode } from 'react';

interface PortfolioChartSectionProps {
	children: ReactNode;
}

/**
 * Section containing the portfolio performance chart with legend
 */
export function PortfolioChartSection({ children }: PortfolioChartSectionProps) {
	return (
		<Card padding="lg">
			<div className="flex justify-between mb-4">
				<div className="flex flex-col gap-1">
					<h3 className="text-lg font-bold tracking-tight">Évolution du portefeuille</h3>
					<span className="text-sm text-muted-foreground">Performance sur 12 mois</span>
				</div>
				<div className="flex gap-4">
					<div className="flex gap-2 items-center">
						<div className="h-2 w-4 rounded-sm bg-violet-500" />
						<span className="text-sm text-muted-foreground">Valeur</span>
					</div>
					<div className="flex gap-2 items-center">
						<div className="h-0 w-4 border-t-2 border-dashed border-muted-foreground" />
						<span className="text-sm text-muted-foreground">Investi</span>
					</div>
				</div>
			</div>
			{children}
		</Card>
	);
}
