'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// FLEX COMPONENT
// =============================================================================
// Flexbox layout component with direction, alignment, and gap tokens

type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';
type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type PaddingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Flex direction */
	direction?: FlexDirection;
	/** Responsive direction for sm breakpoint */
	directionSm?: FlexDirection;
	/** Responsive direction for md breakpoint */
	directionMd?: FlexDirection;
	/** Responsive direction for lg breakpoint */
	directionLg?: FlexDirection;
	/** Align items (cross-axis) */
	align?: FlexAlign;
	/** Justify content (main-axis) */
	justify?: FlexJustify;
	/** Flex wrap behavior */
	wrap?: FlexWrap;
	/** Gap size using design tokens */
	gap?: GapSize;
	/** Enable inline-flex instead of flex */
	inline?: boolean;
	/** Padding (all sides) */
	p?: PaddingSize;
	/** Fill available height */
	fullHeight?: boolean;
	/** Fill available width */
	fullWidth?: boolean;
	/** Flex grow (take remaining space) */
	grow?: boolean;
	/** Flex shrink (allow shrinking) */
	shrink?: boolean;
	/** Minimum width 0 (allows shrinking below content size) */
	minW0?: boolean;
}

const directionClasses: Record<FlexDirection, string> = {
	row: 'flex-row',
	'row-reverse': 'flex-row-reverse',
	col: 'flex-col',
	'col-reverse': 'flex-col-reverse',
};

const directionSmClasses: Record<FlexDirection, string> = {
	row: 'sm:flex-row',
	'row-reverse': 'sm:flex-row-reverse',
	col: 'sm:flex-col',
	'col-reverse': 'sm:flex-col-reverse',
};

const directionMdClasses: Record<FlexDirection, string> = {
	row: 'md:flex-row',
	'row-reverse': 'md:flex-row-reverse',
	col: 'md:flex-col',
	'col-reverse': 'md:flex-col-reverse',
};

const directionLgClasses: Record<FlexDirection, string> = {
	row: 'lg:flex-row',
	'row-reverse': 'lg:flex-row-reverse',
	col: 'lg:flex-col',
	'col-reverse': 'lg:flex-col-reverse',
};

const alignClasses: Record<FlexAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
};

const justifyClasses: Record<FlexJustify, string> = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
};

const wrapClasses: Record<FlexWrap, string> = {
	wrap: 'flex-wrap',
	nowrap: 'flex-nowrap',
	'wrap-reverse': 'flex-wrap-reverse',
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

const paddingClasses: Record<PaddingSize, string> = {
	none: 'p-0',
	xs: 'p-1',
	sm: 'p-2',
	md: 'p-4',
	lg: 'p-6',
	xl: 'p-8',
	'2xl': 'p-12',
};

const Flex = forwardRef<HTMLDivElement, FlexProps>(
	(
		{
			className,
			direction = 'row',
			directionSm,
			directionMd,
			directionLg,
			align,
			justify,
			wrap,
			gap = 'md',
			inline = false,
			p,
			fullHeight,
			fullWidth,
			grow,
			shrink,
			minW0,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					inline ? 'inline-flex' : 'flex',
					directionClasses[direction],
					directionSm && directionSmClasses[directionSm],
					directionMd && directionMdClasses[directionMd],
					directionLg && directionLgClasses[directionLg],
					align && alignClasses[align],
					justify && justifyClasses[justify],
					wrap && wrapClasses[wrap],
					gapClasses[gap],
					p && paddingClasses[p],
					fullHeight && 'h-full',
					fullWidth && 'w-full',
					grow && 'flex-1',
					shrink === false && 'flex-shrink-0',
					minW0 && 'min-w-0',
					className,
				)}
				{...props}
			/>
		);
	},
);
Flex.displayName = 'Flex';

export { Flex };
export type { FlexProps, FlexDirection, FlexAlign, FlexJustify, FlexWrap, GapSize, PaddingSize };
