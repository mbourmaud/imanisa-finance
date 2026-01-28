# Form Creator Agent

Create forms following TanStack Form + Valibot patterns.

## Trigger

Use this agent when:
- Creating new forms
- Adding form validation
- Setting up form mutations

## Architecture

```
src/features/{feature}/
├── forms/
│   └── {entity}-form-schema.ts   # Valibot schema
├── hooks/
│   └── use-{entity}-form.ts      # Form hook
└── components/
    └── {Entity}FormSheet.tsx     # Form UI
```

## Templates

### 1. Valibot Schema

Location: `src/features/{feature}/forms/{entity}-form-schema.ts`

```typescript
import * as v from 'valibot'

export const accountFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Le nom est requis'),
    v.maxLength(100, 'Le nom ne peut pas dépasser 100 caractères')
  ),
  type: v.picklist(
    ['CHECKING', 'SAVINGS', 'INVESTMENT', 'LOAN'],
    'Type de compte invalide'
  ),
  balance: v.optional(
    v.pipe(
      v.number(),
      v.minValue(0, 'Le solde ne peut pas être négatif')
    )
  ),
  bankId: v.pipe(
    v.string(),
    v.minLength(1, 'La banque est requise')
  ),
})

export type AccountFormValues = v.InferOutput<typeof accountFormSchema>
```

### 2. Form Hook

Location: `src/features/{feature}/hooks/use-{entity}-form.ts`

```typescript
import { useAppForm } from '@/lib/forms'
import { accountFormSchema, type AccountFormValues } from '../forms/account-form-schema'
import { useCreateAccountMutation } from './use-accounts-query'

interface UseAccountFormOptions {
  defaultValues?: Partial<AccountFormValues>
  onSuccess?: () => void
}

export function useAccountForm({ defaultValues, onSuccess }: UseAccountFormOptions = {}) {
  const createMutation = useCreateAccountMutation()

  const form = useAppForm({
    defaultValues: {
      name: '',
      type: 'CHECKING' as const,
      balance: 0,
      bankId: '',
      ...defaultValues,
    },
    validators: {
      onChange: accountFormSchema,
    },
    onSubmit: async ({ value }) => {
      // ALWAYS use mutateAsync, not mutate
      await createMutation.mutateAsync(value)
      onSuccess?.()
    },
  })

  return {
    form,
    isSubmitting: createMutation.isPending,
    error: createMutation.error,
  }
}
```

### 3. Form Component

Location: `src/features/{feature}/components/{Entity}FormSheet.tsx`

```tsx
'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAccountForm } from '../hooks/use-account-form'
import { getErrorMessage } from '@/shared/utils/error'

interface AccountFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountFormSheet({ open, onOpenChange }: AccountFormSheetProps) {
  const { form, isSubmitting, error } = useAccountForm({
    onSuccess: () => onOpenChange(false),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouveau compte</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4 mt-6"
        >
          {/* Global error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}

          {/* Fields */}
          <form.AppField name="name">
            {(field) => <field.TextField label="Nom du compte" />}
          </form.AppField>

          <form.AppField name="type">
            {(field) => (
              <field.SelectField
                label="Type"
                options={[
                  { value: 'CHECKING', label: 'Compte courant' },
                  { value: 'SAVINGS', label: 'Épargne' },
                  { value: 'INVESTMENT', label: 'Investissement' },
                  { value: 'LOAN', label: 'Prêt' },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="balance">
            {(field) => <field.NumberField label="Solde initial" />}
          </form.AppField>

          {/* Submit */}
          <form.AppForm>
            <form.SubmitButton disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le compte'}
            </form.SubmitButton>
          </form.AppForm>
        </form>
      </SheetContent>
    </Sheet>
  )
}
```

## Valibot Cheat Sheet

| Zod | Valibot |
|-----|---------|
| `z.string()` | `v.string()` |
| `z.number()` | `v.number()` |
| `z.string().min(1)` | `v.pipe(v.string(), v.minLength(1))` |
| `z.string().email()` | `v.pipe(v.string(), v.email())` |
| `z.object({...})` | `v.object({...})` |
| `z.enum(['a', 'b'])` | `v.picklist(['a', 'b'])` |
| `z.optional(...)` | `v.optional(...)` |
| `z.infer<typeof schema>` | `v.InferOutput<typeof schema>` |

## Critical Rules

1. **ALWAYS use TanStack Form** - Never manual `useState` for forms
2. **ALWAYS use `mutateAsync`** - Not `mutate`, for proper loading tracking
3. **Validation messages in French** - User-facing text
4. **One hook per entity** - `useAccountForm`, `useMemberForm`
5. **Schema separate from hook** - Reusable validation

## Error Messages Pattern

```typescript
// French, user-friendly messages
v.minLength(1, 'Le nom est requis')
v.email('Adresse email invalide')
v.minValue(0, 'Le montant ne peut pas être négatif')
v.maxLength(100, 'Maximum 100 caractères')
```
