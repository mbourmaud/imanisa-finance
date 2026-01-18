'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type GridCols = 1 | 2 | 3 | 4 | 5 | 6
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// =============================================================================
// STYLE MAPS
// =============================================================================

const colsClasses: Record<GridCols, string> = {
	1: 'grid-cols-1',
	2: 'grid-cols-2',
	3: 'grid-cols-3',
	4: 'grid-cols-4',
	5: 'grid-cols-5',
	6: 'grid-cols-6',
}

const gapClasses: Record<GridGap, string> = {
	none: 'gap-0',
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
}

// =============================================================================
// GRID COMPONENT
// =============================================================================

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Number of columns */
	cols?: GridCols
	/** Gap between items */
	gap?: GridGap
	/** Responsive: columns for sm breakpoint */
	smCols?: GridCols
	/** Responsive: columns for md breakpoint */
	mdCols?: GridCols
	/** Responsive: columns for lg breakpoint */
	lgCols?: GridCols
}

/**
 * CSS Grid layout component with responsive columns.
 */
const Grid = forwardRef<HTMLDivElement, GridProps>(
	(
		{
			cols = 1,
			gap = 'md',
			smCols,
			mdCols,
			lgCols,
			className,
			children,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				data-slot="grid"
				className={cn(
					'grid',
					colsClasses[cols],
					gapClasses[gap],
					smCols && `sm:${colsClasses[smCols]}`,
					mdCols && `md:${colsClasses[mdCols]}`,
					lgCols && `lg:${colsClasses[lgCols]}`,
					className,
				)}
				{...props}
			>
				{children}
			</div>
		)
	},
)
Grid.displayName = 'Grid'

// =============================================================================
// EXPORTS
// =============================================================================

export { Grid }
export type { GridProps, GridCols, GridGap }
