'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

// =============================================================================
// SWITCH SIZE VARIANTS
// =============================================================================

type SwitchSize = 'sm' | 'md' | 'lg';

const switchSizeClasses: Record<SwitchSize, string> = {
	sm: 'h-4 w-7',
	md: 'h-5 w-9',
	lg: 'h-6 w-11',
};

const switchThumbSizeClasses: Record<SwitchSize, string> = {
	sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
	md: 'h-4 w-4 data-[state=checked]:translate-x-4',
	lg: 'h-5 w-5 data-[state=checked]:translate-x-5',
};

// =============================================================================
// SWITCH COMPONENT
// =============================================================================

interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
	/** Size variant */
	size?: SwitchSize;
}

const Switch = forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
	({ className, size = 'md', ...props }, ref) => (
		<SwitchPrimitive.Root
			ref={ref}
			data-slot="switch"
			className={cn(
				// Base styles
				'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs',
				// Transition
				'transition-colors duration-200',
				// Focus styles
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				// Disabled styles
				'disabled:cursor-not-allowed disabled:opacity-50',
				// State styles
				'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
				// Size variant
				switchSizeClasses[size],
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					'pointer-events-none block rounded-full bg-background shadow-lg ring-0',
					'transition-transform duration-200',
					'data-[state=unchecked]:translate-x-0',
					switchThumbSizeClasses[size],
				)}
			/>
		</SwitchPrimitive.Root>
	),
);
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
export type { SwitchProps, SwitchSize };
