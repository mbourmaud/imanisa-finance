'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// SHARED TYPES
// =============================================================================

type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type PaddingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const gapClasses: Record<GapSize, string> = {
	none: 'gap-0',
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
	'2xl': 'gap-12',
};

const justifyClasses: Record<JustifyContent, string> = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
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

// =============================================================================
// VSTACK COMPONENT
// =============================================================================
// Vertical stack with consistent gap, horizontal alignment, and justify

type VStackAlign = 'start' | 'center' | 'end' | 'stretch';

interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Gap size using design tokens */
	gap?: GapSize;
	/** Horizontal alignment of children (items-*) */
	align?: VStackAlign;
	/** Vertical distribution of children (justify-*) */
	justify?: JustifyContent;
	/** Padding (all sides) */
	p?: PaddingSize;
	/** Whether to allow wrapping */
	wrap?: boolean;
	/** Fill available height */
	fullHeight?: boolean;
	/** Fill available width */
	fullWidth?: boolean;
	/** Flex grow (flex-1) */
	grow?: boolean;
	/** Prevent shrinking (flex-shrink-0) */
	shrink?: boolean;
	/** Allow text truncation (min-w-0) */
	minW0?: boolean;
}

const alignClasses: Record<VStackAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
};

const VStack = forwardRef<HTMLDivElement, VStackProps>(
	(
		{
			className,
			gap = 'md',
			align,
			justify,
			p,
			wrap,
			fullHeight,
			fullWidth,
			grow,
			shrink,
			minW0,
			...props
		},
		ref
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					'flex flex-col',
					gapClasses[gap],
					align && alignClasses[align],
					justify && justifyClasses[justify],
					p && paddingClasses[p],
					wrap && 'flex-wrap',
					fullHeight && 'h-full',
					fullWidth && 'w-full',
					grow && 'flex-1',
					shrink === false && 'shrink-0',
					minW0 && 'min-w-0',
					className
				)}
				{...props}
			/>
		);
	}
);
VStack.displayName = 'VStack';

// =============================================================================
// HSTACK COMPONENT
// =============================================================================
// Horizontal stack with consistent gap, vertical alignment, and justify

type HStackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Gap size using design tokens */
	gap?: GapSize;
	/** Vertical alignment of children (items-*) */
	align?: HStackAlign;
	/** Horizontal distribution of children (justify-*) */
	justify?: JustifyContent;
	/** Padding (all sides) */
	p?: PaddingSize;
	/** Whether to wrap children */
	wrap?: boolean;
	/** Fill available height */
	fullHeight?: boolean;
	/** Fill available width */
	fullWidth?: boolean;
	/** Flex grow (flex-1) */
	grow?: boolean;
	/** Prevent shrinking (flex-shrink-0) */
	shrink?: boolean;
	/** Allow text truncation (min-w-0) */
	minW0?: boolean;
}

const hstackAlignClasses: Record<HStackAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
};

const HStack = forwardRef<HTMLDivElement, HStackProps>(
	(
		{
			className,
			gap = 'md',
			align = 'center',
			justify,
			p,
			wrap = false,
			fullHeight,
			fullWidth,
			...props
		},
		ref
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					'flex flex-row',
					gapClasses[gap],
					hstackAlignClasses[align],
					justify && justifyClasses[justify],
					p && paddingClasses[p],
					wrap && 'flex-wrap',
					fullHeight && 'h-full',
					fullWidth && 'w-full',
					className
				)}
				{...props}
			/>
		);
	}
);
HStack.displayName = 'HStack';

export { VStack, HStack };
export type {
	VStackProps,
	HStackProps,
	GapSize,
	VStackAlign,
	HStackAlign,
	JustifyContent,
	PaddingSize,
};
