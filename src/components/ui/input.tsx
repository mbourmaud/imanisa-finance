'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// INPUT SIZE VARIANTS
// =============================================================================

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default';

const inputSizeClasses: Record<InputSize, string> = {
	sm: 'h-9 px-2.5 py-1 text-sm',
	md: 'h-10 px-3 py-2 text-base',
	lg: 'h-12 px-4 py-2.5 text-base',
};

const inputVariantClasses: Record<InputVariant, string> = {
	default: 'border-input bg-transparent dark:bg-input/30',
};

// =============================================================================
// INPUT COMPONENT
// =============================================================================

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
	/** Size variant */
	size?: InputSize;
	/** Visual variant */
	variant?: InputVariant;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type, size = 'md', variant = 'default', ...props }, ref) => {
		return (
			<input
				type={type}
				ref={ref}
				data-slot="input"
				className={cn(
					// Base styles
					'w-full min-w-0 rounded-md border shadow-xs transition-[color,box-shadow] outline-none',
					// File input styles
					'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
					// Placeholder and selection
					'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
					// Focus styles
					'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
					// Error/invalid styles
					'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
					// Disabled styles
					'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
					// Size variant
					inputSizeClasses[size],
					// Visual variant
					inputVariantClasses[variant],
					className,
				)}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
export type { InputProps, InputSize, InputVariant };
