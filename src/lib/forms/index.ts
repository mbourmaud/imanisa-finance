/**
 * @deprecated This entire module is deprecated. Use `useForm` from `@tanstack/react-form`
 * with shadcn Field components (`Field`, `FieldLabel`, `FieldError` from `@/components/ui/field`)
 * instead. See `.claude/rules/tanstack.md` for the new pattern.
 *
 * Old pattern (deprecated):
 * ```tsx
 * import { useAppForm, TextField } from '@/lib/forms'
 * ```
 *
 * New pattern:
 * ```tsx
 * import { useForm } from '@tanstack/react-form'
 * import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
 * import { Input } from '@/components/ui/input'
 * ```
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
