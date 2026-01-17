'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// GAP SIZE TYPE (shared)
// =============================================================================

type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const gapClasses: Record<GapSize, string> = {
	none: 'gap-0',
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
	'2xl': 'gap-12',
};

// =============================================================================
// VSTACK COMPONENT
// =============================================================================
// Vertical stack with consistent gap and horizontal alignment

type VStackAlign = 'start' | 'center' | 'end' | 'stretch';

interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Gap size using design tokens */
	gap?: GapSize;
	/** Horizontal alignment of children */
	align?: VStackAlign;
}

const alignClasses: Record<VStackAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
};

const VStack = forwardRef<HTMLDivElement, VStackProps>(
	({ className, gap = 'md', align, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					'flex flex-col',
					gapClasses[gap],
					align && alignClasses[align],
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
// Horizontal stack with consistent gap and vertical alignment

type HStackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Gap size using design tokens */
	gap?: GapSize;
	/** Vertical alignment of children */
	align?: HStackAlign;
	/** Whether to wrap children */
	wrap?: boolean;
}

const hstackAlignClasses: Record<HStackAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
};

const HStack = forwardRef<HTMLDivElement, HStackProps>(
	({ className, gap = 'md', align = 'center', wrap = false, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					'flex flex-row',
					gapClasses[gap],
					hstackAlignClasses[align],
					wrap && 'flex-wrap',
					className
				)}
				{...props}
			/>
		);
	}
);
HStack.displayName = 'HStack';

export { VStack, HStack };
export type { VStackProps, HStackProps, GapSize, VStackAlign, HStackAlign };
