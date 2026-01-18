/**
 * TanStack Form Integration
 *
 * This module provides a pre-configured TanStack Form setup with shadcn/ui components.
 *
 * EXPORTS:
 * - useAppForm: Main form hook for creating forms
 * - fieldContext, formContext: React contexts for form/field state
 * - useFieldContext, useFormContext: Hooks to access form/field state in components
 * - Field components: TextField, SelectField, NumberField, TextAreaField
 * - Form components: SubmitButton, FormActions, FieldError
 */

export { FieldError } from './components/FieldError';
export { FormActions } from './components/FormActions';
// Form components
export { SubmitButton } from './components/SubmitButton';
export { NumberField } from './fields/NumberField';
export { SelectField } from './fields/SelectField';
export { TextAreaField } from './fields/TextAreaField';
// Field components
export { TextField } from './fields/TextField';
// Re-export types
export type { FieldApi, FormApi } from './form-context';
// Form context and hooks
export {
	fieldContext,
	formContext,
	useAppForm,
	useFieldContext,
	useFormContext,
} from './form-context';
