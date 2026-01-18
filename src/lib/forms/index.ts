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
export { NumberField } from './fields/NumberField';
export { TextAreaField } from './fields/TextAreaField';

// Form components
export { SubmitButton } from './components/SubmitButton';
export { FormActions } from './components/FormActions';
export { FieldError } from './components/FieldError';

// Re-export types
export type { FormApi, FieldApi } from './form-context';
