import type { ReactNode } from 'react';

interface InvestmentSourceGridProps {
	children: ReactNode;
}

/**
 * Grid layout for investment source cards
 */
export function InvestmentSourceGrid({ children }: InvestmentSourceGridProps) {
	return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>;
}
