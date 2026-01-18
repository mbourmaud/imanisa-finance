'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// =============================================================================
// CHECKBOX SIZE VARIANTS
// =============================================================================

type CheckboxSize = 'sm' | 'md' | 'lg';

const checkboxSizeClasses: Record<CheckboxSize, string> = {
	sm: 'h-3.5 w-3.5',
	md: 'h-4 w-4',
	lg: 'h-5 w-5',
};

const checkboxIconSizeClasses: Record<CheckboxSize, string> = {
	sm: 'h-2.5 w-2.5',
	md: 'h-3 w-3',
	lg: 'h-3.5 w-3.5',
};

// =============================================================================
// CHECKBOX COMPONENT
// =============================================================================

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
	/** Size variant */
	size?: CheckboxSize;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
	({ className, size = 'md', ...props }, ref) => (
		<CheckboxPrimitive.Root
			ref={ref}
			data-slot="checkbox"
			className={cn(
				// Base styles
				'peer shrink-0 rounded-sm border border-primary ring-offset-background',
				// Focus styles
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				// Disabled styles
				'disabled:cursor-not-allowed disabled:opacity-50',
				// Checked styles
				'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
				'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
				// Animation
				'transition-colors duration-150',
				// Size variant
				checkboxSizeClasses[size],
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className={cn('flex items-center justify-center text-current')}
			>
				{props.checked === 'indeterminate' ? (
					<Minus className={checkboxIconSizeClasses[size]} />
				) : (
					<Check className={checkboxIconSizeClasses[size]} />
				)}
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
export type { CheckboxProps, CheckboxSize };
