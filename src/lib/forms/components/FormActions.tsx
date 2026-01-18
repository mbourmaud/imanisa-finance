'use client';

/**
 * FormActions Component
 *
 * A wrapper component for form action buttons (submit, cancel, etc.)
 * with consistent spacing and alignment.
 *
 * USAGE:
 * ```tsx
 * <FormActions>
 *   <Button type="button" variant="outline" onClick={onCancel}>
 *     Cancel
 *   </Button>
 *   <SubmitButton>Save</SubmitButton>
 * </FormActions>
 * ```
 */

import { cn } from '@/lib/utils';

interface FormActionsProps {
	children: React.ReactNode;
	/** Alignment of buttons */
	align?: 'left' | 'center' | 'right' | 'between';
	/** Additional className */
	className?: string;
}

const alignClasses = {
	left: 'justify-start',
	center: 'justify-center',
	right: 'justify-end',
	between: 'justify-between',
} as const;

export function FormActions({ children, align = 'right', className }: FormActionsProps) {
	return (
		<div className={cn('flex items-center gap-3 pt-4', alignClasses[align], className)}>
			{children}
		</div>
	);
}
