'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

// =============================================================================
// STYLE MAPS
// =============================================================================

const gapClasses: Record<StackGap, string> = {
	none: 'gap-0',
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
	'2xl': 'gap-12',
}

const alignClasses: Record<StackAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
}

const justifyClasses: Record<StackJustify, string> = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
}

// =============================================================================
// STACK COMPONENT
// =============================================================================

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Gap between items */
	gap?: StackGap
	/** Alignment of items on the cross axis */
	align?: StackAlign
	/** Justification of items on the main axis */
	justify?: StackJustify
	/** Render as a different element */
	as?: 'div' | 'section' | 'article' | 'main' | 'nav' | 'aside' | 'ul' | 'ol'
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
	(
		{
			className,
			gap = 'md',
			align = 'stretch',
			justify = 'start',
			as: Component = 'div',
			children,
			...props
		},
		ref,
	) => {
		return (
			<Component
				ref={ref}
				data-slot="stack"
				className={cn(
					'flex flex-col',
					gapClasses[gap],
					alignClasses[align],
					justifyClasses[justify],
					className,
				)}
				{...props}
			>
				{children}
			</Component>
		)
	},
)
Stack.displayName = 'Stack'

// =============================================================================
// EXPORTS
// =============================================================================

export { Stack }
export type { StackProps, StackGap, StackAlign, StackJustify }
