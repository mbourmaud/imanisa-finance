'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
type HeadingColor = 'default' | 'muted' | 'primary'
type HeadingWeight = 'medium' | 'semibold' | 'bold'

// =============================================================================
// STYLE MAPS
// =============================================================================

const sizeClasses: Record<HeadingSize, string> = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
	xl: 'text-xl',
	'2xl': 'text-2xl',
	'3xl': 'text-3xl',
	'4xl': 'text-4xl',
}

const colorClasses: Record<HeadingColor, string> = {
	default: 'text-foreground',
	muted: 'text-muted-foreground',
	primary: 'text-primary',
}

const weightClasses: Record<HeadingWeight, string> = {
	medium: 'font-medium',
	semibold: 'font-semibold',
	bold: 'font-bold',
}

// Default sizes for each heading level
const levelDefaultSizes: Record<HeadingLevel, HeadingSize> = {
	1: '3xl',
	2: '2xl',
	3: 'xl',
	4: 'lg',
	5: 'md',
	6: 'sm',
}

// =============================================================================
// HEADING COMPONENT
// =============================================================================

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
	/** Semantic heading level (1-6) */
	level?: HeadingLevel
	/** Override the default size for this level */
	size?: HeadingSize
	/** Font weight */
	weight?: HeadingWeight
	/** Text color variant */
	color?: HeadingColor
	/** Add tracking-tight for tighter letter spacing */
	tracking?: 'normal' | 'tight'
	/** Truncate with ellipsis */
	truncate?: boolean
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
	(
		{
			className,
			level = 2,
			size,
			weight = 'semibold',
			color = 'default',
			tracking = 'normal',
			truncate = false,
			children,
			...props
		},
		ref,
	) => {
		const Component = `h${level}` as const
		const resolvedSize = size ?? levelDefaultSizes[level]

		return (
			<Component
				ref={ref}
				data-slot="heading"
				className={cn(
					sizeClasses[resolvedSize],
					weightClasses[weight],
					colorClasses[color],
					tracking === 'tight' && 'tracking-tight',
					truncate && 'truncate',
					className,
				)}
				{...props}
			>
				{children}
			</Component>
		)
	},
)
Heading.displayName = 'Heading'

// =============================================================================
// EXPORTS
// =============================================================================

export { Heading }
export type { HeadingProps, HeadingLevel, HeadingSize, HeadingColor, HeadingWeight }
