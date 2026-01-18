'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// GRID COMPONENT
// =============================================================================
// CSS Grid layout component with responsive columns and gap tokens

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type PaddingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type GridAlign = 'start' | 'center' | 'end' | 'stretch';
type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Number of columns (1-12) */
	cols?: GridCols;
	/** Responsive columns for sm breakpoint */
	colsSm?: GridCols;
	/** Responsive columns for md breakpoint */
	colsMd?: GridCols;
	/** Responsive columns for lg breakpoint */
	colsLg?: GridCols;
	/** Responsive columns for xl breakpoint */
	colsXl?: GridCols;
	/** Gap size using design tokens */
	gap?: GapSize;
	/** Horizontal gap (overrides gap for column gaps) */
	gapX?: GapSize;
	/** Vertical gap (overrides gap for row gaps) */
	gapY?: GapSize;
	/** Padding (all sides) */
	p?: PaddingSize;
	/** Align items vertically within cells */
	alignItems?: GridAlign;
	/** Justify items horizontally within cells */
	justifyItems?: GridJustify;
	/** Fill available height */
	fullHeight?: boolean;
	/** Fill available width */
	fullWidth?: boolean;
}

const colsClasses: Record<GridCols, string> = {
	1: 'grid-cols-1',
	2: 'grid-cols-2',
	3: 'grid-cols-3',
	4: 'grid-cols-4',
	5: 'grid-cols-5',
	6: 'grid-cols-6',
	7: 'grid-cols-7',
	8: 'grid-cols-8',
	9: 'grid-cols-9',
	10: 'grid-cols-10',
	11: 'grid-cols-11',
	12: 'grid-cols-12',
};

const colsSmClasses: Record<GridCols, string> = {
	1: 'sm:grid-cols-1',
	2: 'sm:grid-cols-2',
	3: 'sm:grid-cols-3',
	4: 'sm:grid-cols-4',
	5: 'sm:grid-cols-5',
	6: 'sm:grid-cols-6',
	7: 'sm:grid-cols-7',
	8: 'sm:grid-cols-8',
	9: 'sm:grid-cols-9',
	10: 'sm:grid-cols-10',
	11: 'sm:grid-cols-11',
	12: 'sm:grid-cols-12',
};

const colsMdClasses: Record<GridCols, string> = {
	1: 'md:grid-cols-1',
	2: 'md:grid-cols-2',
	3: 'md:grid-cols-3',
	4: 'md:grid-cols-4',
	5: 'md:grid-cols-5',
	6: 'md:grid-cols-6',
	7: 'md:grid-cols-7',
	8: 'md:grid-cols-8',
	9: 'md:grid-cols-9',
	10: 'md:grid-cols-10',
	11: 'md:grid-cols-11',
	12: 'md:grid-cols-12',
};

const colsLgClasses: Record<GridCols, string> = {
	1: 'lg:grid-cols-1',
	2: 'lg:grid-cols-2',
	3: 'lg:grid-cols-3',
	4: 'lg:grid-cols-4',
	5: 'lg:grid-cols-5',
	6: 'lg:grid-cols-6',
	7: 'lg:grid-cols-7',
	8: 'lg:grid-cols-8',
	9: 'lg:grid-cols-9',
	10: 'lg:grid-cols-10',
	11: 'lg:grid-cols-11',
	12: 'lg:grid-cols-12',
};

const colsXlClasses: Record<GridCols, string> = {
	1: 'xl:grid-cols-1',
	2: 'xl:grid-cols-2',
	3: 'xl:grid-cols-3',
	4: 'xl:grid-cols-4',
	5: 'xl:grid-cols-5',
	6: 'xl:grid-cols-6',
	7: 'xl:grid-cols-7',
	8: 'xl:grid-cols-8',
	9: 'xl:grid-cols-9',
	10: 'xl:grid-cols-10',
	11: 'xl:grid-cols-11',
	12: 'xl:grid-cols-12',
};

const gapClasses: Record<GapSize, string> = {
	none: 'gap-0',
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
	'2xl': 'gap-12',
};

const gapXClasses: Record<GapSize, string> = {
	none: 'gap-x-0',
	xs: 'gap-x-1',
	sm: 'gap-x-2',
	md: 'gap-x-4',
	lg: 'gap-x-6',
	xl: 'gap-x-8',
	'2xl': 'gap-x-12',
};

const gapYClasses: Record<GapSize, string> = {
	none: 'gap-y-0',
	xs: 'gap-y-1',
	sm: 'gap-y-2',
	md: 'gap-y-4',
	lg: 'gap-y-6',
	xl: 'gap-y-8',
	'2xl': 'gap-y-12',
};

const paddingClasses: Record<PaddingSize, string> = {
	none: 'p-0',
	xs: 'p-1',
	sm: 'p-2',
	md: 'p-4',
	lg: 'p-6',
	xl: 'p-8',
	'2xl': 'p-12',
};

const alignItemsClasses: Record<GridAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
};

const justifyItemsClasses: Record<GridJustify, string> = {
	start: 'justify-items-start',
	center: 'justify-items-center',
	end: 'justify-items-end',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
};

const Grid = forwardRef<HTMLDivElement, GridProps>(
	(
		{
			className,
			cols = 1,
			colsSm,
			colsMd,
			colsLg,
			colsXl,
			gap = 'md',
			gapX,
			gapY,
			p,
			alignItems,
			justifyItems,
			fullHeight,
			fullWidth,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					'grid',
					colsClasses[cols],
					colsSm && colsSmClasses[colsSm],
					colsMd && colsMdClasses[colsMd],
					colsLg && colsLgClasses[colsLg],
					colsXl && colsXlClasses[colsXl],
					!gapX && !gapY && gapClasses[gap],
					gapX && gapXClasses[gapX],
					gapY && gapYClasses[gapY],
					p && paddingClasses[p],
					alignItems && alignItemsClasses[alignItems],
					justifyItems && justifyItemsClasses[justifyItems],
					fullHeight && 'h-full',
					fullWidth && 'w-full',
					className,
				)}
				{...props}
			/>
		);
	},
);
Grid.displayName = 'Grid';

export { Grid };
export type { GridProps, GridCols, GapSize, PaddingSize, GridAlign, GridJustify };
