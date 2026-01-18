'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Input, Search } from '@/components'

// =============================================================================
// TYPES
// =============================================================================

type SearchInputSize = 'sm' | 'md' | 'lg'

// =============================================================================
// STYLE MAPS
// =============================================================================

const sizeClasses: Record<SearchInputSize, { wrapper: string; icon: string; input: string }> = {
	sm: {
		wrapper: '',
		icon: 'left-2.5 h-3.5 w-3.5',
		input: 'h-9 pl-8 rounded-lg',
	},
	md: {
		wrapper: '',
		icon: 'left-3 h-4 w-4',
		input: 'h-11 pl-10 rounded-xl',
	},
	lg: {
		wrapper: '',
		icon: 'left-4 h-5 w-5',
		input: 'h-12 pl-12 rounded-xl',
	},
}

// =============================================================================
// SEARCH INPUT COMPONENT
// =============================================================================

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
	/** Size of the search input */
	size?: SearchInputSize
	/** Minimum width for responsive layouts */
	minWidth?: string
}

/**
 * Search input with integrated search icon.
 */
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
	({ size = 'md', minWidth = '200px', className, style, ...props }, ref) => {
		const classes = sizeClasses[size]
		const containerStyle = { '--search-min-width': minWidth, ...style } as React.CSSProperties

		return (
			<div
				className={cn('relative flex-1 min-w-[var(--search-min-width)]', className)}
				style={containerStyle}
			>
				<Search
					className={cn(
						'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
						classes.icon,
					)}
				/>
				<Input
					ref={ref}
					className={classes.input}
					{...props}
				/>
			</div>
		)
	},
)
SearchInput.displayName = 'SearchInput'

// =============================================================================
// EXPORTS
// =============================================================================

export { SearchInput }
export type { SearchInputProps, SearchInputSize }
