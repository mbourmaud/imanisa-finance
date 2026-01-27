import type { ReactNode } from 'react';

interface ImportFormGridProps {
	formCard: ReactNode;
	statsCard: ReactNode;
}

/**
 * Two-column responsive grid for the import page
 * Left: Upload form card
 * Right: Stats card
 */
export function ImportFormGrid({ formCard, statsCard }: ImportFormGridProps) {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{formCard}
			{statsCard}
		</div>
	);
}
