'use client';

/**
 * SelectField Component
 *
 * A select field component that integrates with TanStack Form
 * using shadcn/ui Select components.
 *
 * USAGE:
 * ```tsx
 * <form.AppField name="status">
 *   {(field) => (
 *     <SelectField
 *       label="Status"
 *       placeholder="Select status"
 *       options={[
 *         { value: 'active', label: 'Active' },
 *         { value: 'inactive', label: 'Inactive' },
 *       ]}
 *     />
 *   )}
 * </form.AppField>
 * ```
 */

import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFieldContext } from '../form-context';

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface SelectFieldProps {
	/** Field label */
	label?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Available options */
	options: SelectOption[];
	/** Help text displayed below the select */
	helpText?: string;
	/** Hide error messages */
	hideErrors?: boolean;
	/** Additional className for the trigger */
	className?: string;
	/** Disable the select */
	disabled?: boolean;
}

export function SelectField({
	label,
	placeholder = 'Sélectionner...',
	options,
	helpText,
	hideErrors = false,
	className,
	disabled = false,
}: SelectFieldProps) {
	const field = useFieldContext<string>();
	const { name, state } = field;
	const { value, meta } = state;
	const { errors, isTouched } = meta;

	const fieldId = name;
	const hasError = isTouched && errors.length > 0;
	const errorMessage = hasError ? errors[0] : null;

	return (
		<div className="flex flex-col gap-2">
			{label && (
				<Label htmlFor={fieldId} className={cn(hasError && 'text-destructive')}>
					{label}
				</Label>
			)}
			<Select
				value={value || ''}
				onValueChange={(newValue) => {
					field.handleChange(newValue);
					// Trigger blur to mark as touched
					field.handleBlur();
				}}
				disabled={disabled}
			>
				<SelectTrigger
					id={fieldId}
					aria-invalid={hasError}
					aria-describedby={
						hasError ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined
					}
					className={cn(hasError && 'border-destructive focus:ring-destructive', className)}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{!hideErrors && hasError && (
				<p id={`${fieldId}-error`} className="text-sm text-destructive" role="alert">
					{typeof errorMessage === 'string' ? errorMessage : 'Invalid selection'}
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
