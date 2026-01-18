/**
 * TanStack Form Integration
 *
 * This module provides a pre-configured TanStack Form setup with shadcn/ui components.
 *
 * EXPORTS:
 * - useAppForm: Main form hook for creating forms
 * - fieldContext, formContext: React contexts for form/field state
 * - useFieldContext, useFormContext: Hooks to access form/field state in components
 * - Field components: TextField, SelectField, NumberField, TextAreaField (to be added)
 * - Form components: SubmitButton, FormActions, FieldError (to be added)
 */

// Form context and hooks
export {
	fieldContext,
	formContext,
	useFieldContext,
	useFormContext,
	useAppForm,
} from './form-context';

// Field components
export { TextField } from './fields/TextField';
export { SelectField } from './fields/SelectField';

// Re-export types
export type { FormApi, FieldApi } from './form-context';
