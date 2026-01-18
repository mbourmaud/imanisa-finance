'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from '@/components'

// =============================================================================
// TYPES
// =============================================================================

type IconBoxSize = 'sm' | 'md' | 'lg'
type IconBoxVariant = 'default' | 'primary' | 'muted' | 'custom'
type IconBoxRounded = 'md' | 'lg' | 'xl' | 'full'

// =============================================================================
// STYLE MAPS
// =============================================================================

const sizeClasses: Record<IconBoxSize, { container: string; icon: string }> = {
	sm: { container: 'h-8 w-8', icon: 'h-4 w-4' },
	md: { container: 'h-10 w-10', icon: 'h-5 w-5' },
	lg: { container: 'h-12 w-12', icon: 'h-6 w-6' },
}

const roundedClasses: Record<IconBoxRounded, string> = {
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl',
	full: 'rounded-full',
}

const variantClasses: Record<IconBoxVariant, { container: string; icon: string }> = {
	default: {
		container: 'bg-background',
		icon: 'text-foreground',
	},
	primary: {
		container: 'bg-primary/10',
		icon: 'text-primary',
	},
	muted: {
		container: 'bg-muted',
		icon: 'text-muted-foreground',
	},
	custom: {
		container: '',
		icon: '',
	},
}

// =============================================================================
// ICON BOX COMPONENT
// =============================================================================

interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Icon component to render */
	icon: LucideIcon
	/** Size of the icon box */
	size?: IconBoxSize
	/** Visual variant */
	variant?: IconBoxVariant
	/** Border radius */
	rounded?: IconBoxRounded
	/** Custom background color (for variant="custom") */
	bgColor?: string
	/** Custom icon color (for variant="custom") */
	iconColor?: string
}

/**
 * A container for icons with configurable background and sizing.
 */
const IconBox = forwardRef<HTMLDivElement, IconBoxProps>(
	(
		{
			icon: Icon,
			size = 'md',
			variant = 'primary',
			rounded = 'xl',
			bgColor,
			iconColor,
			className,
			...props
		},
		ref,
	) => {
		const isCustom = variant === 'custom'

		return (
			<div
				ref={ref}
				data-slot="icon-box"
				className={cn(
					'flex items-center justify-center',
					sizeClasses[size].container,
					roundedClasses[rounded],
					!isCustom && variantClasses[variant].container,
					className,
				)}
				style={isCustom ? { backgroundColor: bgColor } : undefined}
				{...props}
			>
				<Icon
					className={cn(
						sizeClasses[size].icon,
						!isCustom && variantClasses[variant].icon,
					)}
					style={isCustom ? { color: iconColor } : undefined}
				/>
			</div>
		)
	},
)
IconBox.displayName = 'IconBox'

// =============================================================================
// EXPORTS
// =============================================================================

export { IconBox }
export type { IconBoxProps, IconBoxSize, IconBoxVariant, IconBoxRounded }
