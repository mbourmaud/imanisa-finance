'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type RowGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type RowAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type RowJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
type RowWrap = 'nowrap' | 'wrap' | 'wrap-reverse'

// =============================================================================
// STYLE MAPS
// =============================================================================

const gapClasses: Record<RowGap, string> = {
	none: 'gap-0',
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
	'2xl': 'gap-12',
}

const alignClasses: Record<RowAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
}

const justifyClasses: Record<RowJustify, string> = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
}

const wrapClasses: Record<RowWrap, string> = {
	nowrap: 'flex-nowrap',
	wrap: 'flex-wrap',
	'wrap-reverse': 'flex-wrap-reverse',
}

// =============================================================================
// ROW COMPONENT
// =============================================================================

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Gap between items */
	gap?: RowGap
	/** Alignment of items on the cross axis */
	align?: RowAlign
	/** Justification of items on the main axis */
	justify?: RowJustify
	/** Wrap behavior */
	wrap?: RowWrap
	/** Render as a different element */
	as?: 'div' | 'section' | 'article' | 'nav' | 'header' | 'footer' | 'ul' | 'ol' | 'li'
}

const Row = forwardRef<HTMLDivElement, RowProps>(
	(
		{
			className,
			gap = 'md',
			align = 'center',
			justify = 'start',
			wrap = 'nowrap',
			as: Component = 'div',
			children,
			...props
		},
		ref,
	) => {
		return (
			<Component
				ref={ref}
				data-slot="row"
				className={cn(
					'flex flex-row',
					gapClasses[gap],
					alignClasses[align],
					justifyClasses[justify],
					wrapClasses[wrap],
					className,
				)}
				{...props}
			>
				{children}
			</Component>
		)
	},
)
Row.displayName = 'Row'

// =============================================================================
// EXPORTS
// =============================================================================

export { Row }
export type { RowProps, RowGap, RowAlign, RowJustify, RowWrap }
