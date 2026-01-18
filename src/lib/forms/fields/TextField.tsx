'use client';

/**
 * TextField Component
 *
 * A text input field component that integrates with TanStack Form
 * using shadcn/ui Input and Label components.
 *
 * USAGE:
 * ```tsx
 * <form.AppField name="email">
 *   {(field) => <TextField label="Email" placeholder="you@example.com" />}
 * </form.AppField>
 * ```
 */

import { Input, type InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useFieldContext } from '../form-context';

interface TextFieldProps extends Omit<InputProps, 'value' | 'onChange' | 'onBlur'> {
	/** Field label */
	label?: string;
	/** Help text displayed below the input */
	helpText?: string;
	/** Hide error messages (useful for inline errors elsewhere) */
	hideErrors?: boolean;
}

export function TextField({
	label,
	helpText,
	hideErrors = false,
	className,
	id,
	...props
}: TextFieldProps) {
	const field = useFieldContext<string>();
	const { name, state } = field;
	const { value, meta } = state;
	const { errors, isTouched } = meta;

	const fieldId = id || name;
	const hasError = isTouched && errors.length > 0;
	const errorMessage = hasError ? errors[0] : null;

	return (
		<div className="flex flex-col gap-2">
			{label && (
				<Label htmlFor={fieldId} className={cn(hasError && 'text-destructive')}>
					{label}
				</Label>
			)}
			<Input
				id={fieldId}
				name={name}
				value={value || ''}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				aria-invalid={hasError}
				aria-describedby={hasError ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
				className={cn(hasError && 'border-destructive focus-visible:ring-destructive', className)}
				{...props}
			/>
			{!hideErrors && hasError && (
				<p id={`${fieldId}-error`} className="text-sm text-destructive" role="alert">
					{typeof errorMessage === 'string' ? errorMessage : 'Invalid value'}
				</p>
			)}
			{helpText && !hasError && (
				<p id={`${fieldId}-help`} className="text-sm text-muted-foreground">
					{helpText}
				</p>
			)}
		</div>
	);
}
