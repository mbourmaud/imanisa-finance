'use client';

/**
 * SubmitButton Component
 *
 * A submit button that integrates with TanStack Form state.
 * Shows loading spinner when form is submitting and disables
 * when submitting or validating.
 *
 * USAGE:
 * ```tsx
 * <form.AppForm>
 *   {(form) => (
 *     <SubmitButton>Save</SubmitButton>
 *   )}
 * </form.AppForm>
 * ```
 */

import { useStore } from '@tanstack/react-store';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormContext } from '../form-context';

interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'disabled'> {
	/** Text to show when submitting */
	loadingText?: string;
	/** Force disable state (in addition to form state) */
	forceDisabled?: boolean;
}

export function SubmitButton({
	children,
	loadingText,
	forceDisabled = false,
	className,
	...props
}: SubmitButtonProps) {
	const form = useFormContext();

	// Subscribe to form state using the store
	const canSubmit = useStore(form.store, (state) => state.canSubmit);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
	const isValidating = useStore(form.store, (state) => state.isValidating);

	const isDisabled = forceDisabled || !canSubmit || isSubmitting || isValidating;
	const showLoader = isSubmitting || isValidating;

	return (
		<Button type="submit" disabled={isDisabled} className={cn(className)} {...props}>
			{showLoader && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			{showLoader && loadingText ? loadingText : children}
		</Button>
	);
}
