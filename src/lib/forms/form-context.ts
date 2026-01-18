/**
 * TanStack Form Context Setup
 *
 * This file sets up the form hook pattern with createFormHookContexts for
 * integrating TanStack Form with shadcn/ui components.
 *
 * PATTERN:
 * 1. createFormHookContexts creates React contexts for form state and field state
 * 2. createFormHook creates a custom useForm hook that uses these contexts
 * 3. Components can use useFieldContext and useFormContext to access state
 *
 * USAGE:
 * ```tsx
 * // In a form component
 * const form = useAppForm({
 *   defaultValues: { name: '' },
 *   validators: { onChange: mySchema },
 *   onSubmit: async ({ value }) => { ... }
 * });
 *
 * // In field components
 * const field = useFieldContext();
 * const { errors, value, handleChange, handleBlur } = field.state;
 * ```
 */

import {
	createFormHookContexts,
	createFormHook,
	type FormApi,
	type FieldApi,
} from '@tanstack/react-form';

// Create the form and field contexts
const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

// Create the base form hook
const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	// Field components will be added here as we create them
	fieldComponents: {},
	// Form components will be added here as we create them
	formComponents: {},
});

export {
	// Contexts
	fieldContext,
	formContext,
	// Hooks
	useFieldContext,
	useFormContext,
	useAppForm,
};

// Re-export types for convenience
export type { FormApi, FieldApi };
