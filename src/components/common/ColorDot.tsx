'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

type ColorDotSize = 'xs' | 'sm' | 'md' | 'lg'

// =============================================================================
// STYLE MAPS
// =============================================================================

const sizeClasses: Record<ColorDotSize, string> = {
	xs: 'h-1.5 w-1.5',
	sm: 'h-2 w-2',
	md: 'h-2.5 w-2.5',
	lg: 'h-3 w-3',
}

// =============================================================================
// COLOR DOT COMPONENT
// =============================================================================

interface ColorDotProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Color of the dot (CSS color value) */
	color: string
	/** Size of the dot */
	size?: ColorDotSize
}

/**
 * A small colored circular indicator.
 * Used for member colors, category colors, status indicators, etc.
 */
const ColorDot = forwardRef<HTMLDivElement, ColorDotProps>(
	({ color, size = 'sm', className, ...props }, ref) => {
		const colorStyle = { '--dot-color': color } as React.CSSProperties
		return (
			<div
				ref={ref}
				data-slot="color-dot"
				className={cn('rounded-full shrink-0 bg-[var(--dot-color)]', sizeClasses[size], className)}
				style={colorStyle}
				{...props}
			/>
		)
	},
)
ColorDot.displayName = 'ColorDot'

// =============================================================================
// EXPORTS
// =============================================================================

export { ColorDot }
export type { ColorDotProps, ColorDotSize }
