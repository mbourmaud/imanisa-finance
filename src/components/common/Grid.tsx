'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * @deprecated Use CSS grid directly or <Flex wrap="wrap">
 */
type GridCols = 1 | 2 | 3 | 4 | 5 | 6
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

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

interface ResponsiveConfig {
	sm?: GridCols
	md?: GridCols
	lg?: GridCols
}

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
	cols?: GridCols
	gap?: GridGap
	smCols?: GridCols
	mdCols?: GridCols
	lgCols?: GridCols
	responsive?: ResponsiveConfig
}

/**
 * @deprecated Use CSS grid directly or <Flex wrap="wrap">
 */
const Grid = forwardRef<HTMLDivElement, GridProps>(
	({ cols = 1, gap = 'md', smCols, mdCols, lgCols, responsive, className, children, ...props }, ref) => {
		const sm = responsive?.sm ?? smCols
		const md = responsive?.md ?? mdCols
		const lg = responsive?.lg ?? lgCols

		return (
			<div
				ref={ref}
				className={cn(
					'grid',
					colsClasses[cols],
					gapClasses[gap],
					sm && `sm:${colsClasses[sm]}`,
					md && `md:${colsClasses[md]}`,
					lg && `lg:${colsClasses[lg]}`,
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

export { Grid }
export type { GridProps, GridCols, GridGap }
