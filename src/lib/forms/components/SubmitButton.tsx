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

import { useFormContext } from '../form-context';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

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

	// Subscribe to form state
	const canSubmit = form.useStore((state) => state.canSubmit);
	const isSubmitting = form.useStore((state) => state.isSubmitting);
	const isValidating = form.useStore((state) => state.isValidating);

	const isDisabled = forceDisabled || !canSubmit || isSubmitting || isValidating;
	const showLoader = isSubmitting || isValidating;

	return (
		<Button
			type="submit"
			disabled={isDisabled}
			className={cn(className)}
			{...props}
		>
			{showLoader && (
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			)}
			{showLoader && loadingText ? loadingText : children}
		</Button>
	);
}
