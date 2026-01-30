/**
 * @deprecated Use `useForm` from `@tanstack/react-form` directly with shadcn Field components.
 * See `.claude/rules/tanstack.md` for the new pattern.
 */

import {
	createFormHook,
	createFormHookContexts,
	type FieldApi,
	type FormApi,
} from '@tanstack/react-form';

// Create the form and field contexts
const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

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
