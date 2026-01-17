'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TEXTAREA SIZE VARIANTS
// =============================================================================

type TextareaSize = 'sm' | 'md' | 'lg';
type TextareaVariant = 'default' | 'glass';

const textareaSizeClasses: Record<TextareaSize, string> = {
	sm: 'min-h-[80px] px-2.5 py-1.5 text-xs',
	md: 'min-h-[100px] px-3 py-2 text-sm',
	lg: 'min-h-[120px] px-4 py-3 text-base',
};

const textareaVariantClasses: Record<TextareaVariant, string> = {
	default: 'border-input bg-transparent dark:bg-input/30',
	glass: 'border-border/50 bg-background/50 backdrop-blur-sm',
};

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================

interface TextareaProps extends React.ComponentProps<'textarea'> {
	/** Size variant */
	size?: TextareaSize;
	/** Visual variant */
	variant?: TextareaVariant;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, size = 'md', variant = 'default', ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				data-slot="textarea"
				className={cn(
					// Base styles
					'flex w-full rounded-md border shadow-xs transition-[color,box-shadow] resize-none outline-none',
					// Placeholder
					'placeholder:text-muted-foreground',
					// Focus styles
					'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
					// Error/invalid styles
					'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
					// Disabled styles
					'disabled:cursor-not-allowed disabled:opacity-50',
					// Size variant
					textareaSizeClasses[size],
					// Visual variant
					textareaVariantClasses[variant],
					className,
				)}
				{...props}
			/>
		);
	}
);
Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps, TextareaSize, TextareaVariant };
