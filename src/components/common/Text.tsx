'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
type TextColor = 'default' | 'muted' | 'destructive' | 'success' | 'warning' | 'primary'
type TextAlign = 'left' | 'center' | 'right'

// =============================================================================
// STYLE MAPS
// =============================================================================

const sizeClasses: Record<TextSize, string> = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
	xl: 'text-xl',
	'2xl': 'text-2xl',
	'3xl': 'text-3xl',
}

const weightClasses: Record<TextWeight, string> = {
	normal: 'font-normal',
	medium: 'font-medium',
	semibold: 'font-semibold',
	bold: 'font-bold',
}

const colorClasses: Record<TextColor, string> = {
	default: 'text-foreground',
	muted: 'text-muted-foreground',
	destructive: 'text-destructive',
	success: 'text-emerald-600 dark:text-emerald-400',
	warning: 'text-amber-600 dark:text-amber-400',
	primary: 'text-primary',
}

const alignClasses: Record<TextAlign, string> = {
	left: 'text-left',
	center: 'text-center',
	right: 'text-right',
}

// =============================================================================
// TEXT COMPONENT
// =============================================================================

interface TextProps extends React.ComponentPropsWithoutRef<'span'> {
	/** Text size */
	size?: TextSize
	/** Font weight */
	weight?: TextWeight
	/** Text color variant */
	color?: TextColor
	/** Text alignment */
	align?: TextAlign
	/** Truncate with ellipsis */
	truncate?: boolean
	as?: 'p' | 'span' | 'div' | 'label'
}

const Text = forwardRef<HTMLSpanElement, TextProps>(
	({ className, size = 'md', weight = 'normal', color = 'default', align, truncate = false, as: _as, children, ...props }, ref) => {
		return (
			<span
				ref={ref}
				data-slot="text"
				className={cn(sizeClasses[size], weightClasses[weight], colorClasses[color], align && alignClasses[align], truncate && 'truncate', className)}
				{...props}
			>
				{children}
			</span>
		)
	},
)
Text.displayName = 'Text'

// =============================================================================
// EXPORTS
// =============================================================================

export { Text }
export type { TextProps, TextSize, TextWeight, TextColor, TextAlign }
