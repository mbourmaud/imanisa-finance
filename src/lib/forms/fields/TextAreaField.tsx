'use client';

/**
 * @deprecated Use `Field` + `FieldLabel` + `Textarea` + `FieldError` from `@/components/ui/field`
 * with `form.Field` from `@tanstack/react-form` instead.
 * See `.claude/rules/tanstack.md` for the new pattern.
 */

import { Label } from '@/components/ui/label';
import { Textarea, type TextareaProps } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useFieldContext } from '../form-context';

interface TextAreaFieldProps extends Omit<TextareaProps, 'value' | 'onChange' | 'onBlur'> {
	/** Field label */
	label?: string;
	/** Help text displayed below the textarea */
	helpText?: string;
	/** Hide error messages */
	hideErrors?: boolean;
}

export function TextAreaField({
	label,
	helpText,
	hideErrors = false,
	className,
	id,
	...props
}: TextAreaFieldProps) {
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
			<Textarea
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
