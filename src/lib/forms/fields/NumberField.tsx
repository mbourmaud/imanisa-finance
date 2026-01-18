'use client';

/**
 * NumberField Component
 *
 * A number input field component that integrates with TanStack Form
 * using shadcn/ui Input and Label components.
 *
 * USAGE:
 * ```tsx
 * <form.AppField name="amount">
 *   {(field) => <NumberField label="Amount" min={0} step={0.01} />}
 * </form.AppField>
 * ```
 */

import { Input, type InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useFieldContext } from '../form-context';

interface NumberFieldProps extends Omit<InputProps, 'value' | 'onChange' | 'onBlur' | 'type'> {
	/** Field label */
	label?: string;
	/** Help text displayed below the input */
	helpText?: string;
	/** Hide error messages */
	hideErrors?: boolean;
	/** Minimum value */
	min?: number;
	/** Maximum value */
	max?: number;
	/** Step increment */
	step?: number | 'any';
}

export function NumberField({
	label,
	helpText,
	hideErrors = false,
	className,
	id,
	min,
	max,
	step,
	...props
}: NumberFieldProps) {
	const field = useFieldContext<number | null | undefined>();
	const { name, state } = field;
	const { value, meta } = state;
	const { errors, isTouched } = meta;

	const fieldId = id || name;
	const hasError = isTouched && errors.length > 0;
	const errorMessage = hasError ? errors[0] : null;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		if (inputValue === '') {
			field.handleChange(null);
		} else {
			const numValue = Number.parseFloat(inputValue);
			if (!Number.isNaN(numValue)) {
				field.handleChange(numValue);
			}
		}
	};

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
				type="number"
				value={value ?? ''}
				onChange={handleChange}
				onBlur={field.handleBlur}
				min={min}
				max={max}
				step={step}
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
