'use client';

import type * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormItemContextValue = {
	id: string;
	name: string;
	error?: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 * Minimal interface for TanStack Form field state.
 * Used to display validation errors in form components.
 */
interface FormFieldState {
	name: string;
	state: {
		meta: {
			errors?: Array<string | { message?: string }>;
		};
	};
}

interface FormItemProps extends React.ComponentProps<'div'> {
	field?: FormFieldState;
}

function FormItem({ className, field, children, ...props }: FormItemProps) {
	const id = React.useId();
	const firstError = field?.state.meta.errors?.[0];
	const error =
		typeof firstError === 'string'
			? firstError
			: (firstError as { message?: string } | undefined)?.message;

	return (
		<FormItemContext.Provider value={{ id, name: field?.name ?? '', error }}>
			<div data-slot="form-item" className={cn('grid gap-2', className)} {...props}>
				{children}
			</div>
		</FormItemContext.Provider>
	);
}

function useFormField() {
	const context = React.useContext(FormItemContext);
	if (!context) {
		throw new Error('useFormField should be used within <FormItem>');
	}
	return {
		id: context.id,
		name: context.name,
		error: context.error,
		formItemId: `${context.id}-form-item`,
		formDescriptionId: `${context.id}-form-item-description`,
		formMessageId: `${context.id}-form-item-message`,
	};
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
	const { error, formItemId } = useFormField();

	return (
		<Label
			data-slot="form-label"
			data-error={!!error}
			className={cn('data-[error=true]:text-destructive', className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

	return (
		<Slot
			data-slot="form-control"
			id={formItemId}
			aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
			aria-invalid={!!error}
			{...props}
		/>
	);
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
	const { formDescriptionId } = useFormField();

	return (
		<p
			data-slot="form-description"
			id={formDescriptionId}
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	);
}

function FormMessage({ className, children, ...props }: React.ComponentProps<'p'>) {
	const { error, formMessageId } = useFormField();
	const body = error ?? children;

	if (!body) {
		return null;
	}

	return (
		<p
			data-slot="form-message"
			id={formMessageId}
			className={cn('text-destructive text-sm', className)}
			{...props}
		>
			{body}
		</p>
	);
}

export { useFormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
