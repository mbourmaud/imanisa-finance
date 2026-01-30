'use client';

/**
 * @deprecated Use `DialogFooter` from `@/components/ui/dialog` for dialog forms,
 * or compose buttons directly in your form component.
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
