'use client';

/**
 * FieldError Component
 *
 * A reusable error display component for form fields.
 * Only shows errors when field is touched and invalid.
 *
 * USAGE:
 * ```tsx
 * <form.AppField name="email">
 *   {(field) => (
 *     <>
 *       <Input {...} />
 *       <FieldError />
 *     </>
 *   )}
 * </form.AppField>
 * ```
 */

import { useFieldContext } from '../form-context';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
	/** Custom ID for the error element */
	id?: string;
	/** Additional className */
	className?: string;
	/** Show error even if not touched */
	showUntouched?: boolean;
}

/**
 * Extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
	if (typeof error === 'string') {
		return error;
	}
	if (error && typeof error === 'object') {
		if ('message' in error && typeof error.message === 'string') {
			return error.message;
		}
	}
	return 'Invalid value';
}

export function FieldError({
	id,
	className,
	showUntouched = false,
}: FieldErrorProps) {
	const field = useFieldContext();
	const { name, state } = field;
	const { meta } = state;
	const { errors, isTouched } = meta;

	// Only show error if touched (or forced) and has errors
	const shouldShow = (showUntouched || isTouched) && errors.length > 0;

	if (!shouldShow) {
		return null;
	}

	const errorMessage = getErrorMessage(errors[0]);
	const errorId = id || `${name}-error`;

	return (
		<p
			id={errorId}
			className={cn('text-sm text-destructive', className)}
			role="alert"
		>
			{errorMessage}
		</p>
	);
}
