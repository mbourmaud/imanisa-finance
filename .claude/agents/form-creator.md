# Form Creator Agent

Create forms using the **official shadcn/ui + TanStack Form + Valibot** pattern.

> Reference: https://ui.shadcn.com/docs/forms/tanstack-form

## When to Use

- Creating new forms for any entity
- Adding form validation with Valibot

## File Structure

```
src/features/{feature}/
├── forms/
│   └── {entity}-form-schema.ts   # Valibot schema
└── components/
    └── {Entity}FormSheet.tsx     # Form UI component
```

## Step 1: Valibot Schema

Location: `src/features/{feature}/forms/{entity}-form-schema.ts`

```typescript
import * as v from 'valibot'

export const entityFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Le nom est requis'),
    v.maxLength(100, 'Maximum 100 caractères')
  ),
  email: v.pipe(
    v.string(),
    v.email('Adresse email invalide')
  ),
  type: v.picklist(['A', 'B'], 'Type invalide'),
  amount: v.optional(
    v.pipe(v.number(), v.minValue(0, 'Le montant ne peut pas être négatif'))
  ),
})

export type EntityFormValues = v.InferOutput<typeof entityFormSchema>
```

## Step 2: Form Component

Location: `src/features/{feature}/components/{Entity}FormSheet.tsx`

```tsx
'use client'

import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { entityFormSchema } from '../forms/entity-form-schema'
import { useCreateEntityMutation } from '../hooks/use-entities-query'

interface EntityFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntityFormSheet({ open, onOpenChange }: EntityFormSheetProps) {
  const createMutation = useCreateEntityMutation()

  const form = useForm({
    defaultValues: {
      name: '',
      type: 'A' as const,
    },
    validators: {
      onSubmit: entityFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value)
      toast.success('Créé avec succès')
      onOpenChange(false)
    },
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouveau</SheetTitle>
        </SheetHeader>

        <form
          id="entity-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="entity-name">Nom</FieldLabel>
                    <Input
                      id="entity-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>

        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
          <Button type="submit" form="entity-form">
            Créer
          </Button>
        </Field>
      </SheetContent>
    </Sheet>
  )
}
```

## Field Patterns

### Text Input

```tsx
<form.Field
  name="fieldName"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor="field-id">Label</FieldLabel>
        <Input
          id="field-id"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    )
  }}
/>
```

### Select

```tsx
<form.Field
  name="type"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor="type">Type</FieldLabel>
        <Select
          name={field.name}
          value={field.state.value}
          onValueChange={field.handleChange}
        >
          <SelectTrigger id="type" aria-invalid={isInvalid}>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Option A</SelectItem>
            <SelectItem value="B">Option B</SelectItem>
          </SelectContent>
        </Select>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    )
  }}
/>
```

### Checkbox

```tsx
<form.Field
  name="accepted"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field orientation="horizontal" data-invalid={isInvalid}>
        <Checkbox
          id="accepted"
          name={field.name}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked === true)}
        />
        <FieldLabel htmlFor="accepted" className="font-normal">
          J'accepte les conditions
        </FieldLabel>
      </Field>
    )
  }}
/>
```

### Switch

```tsx
<form.Field
  name="notifications"
  children={(field) => (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldTitle>Notifications</FieldTitle>
        <FieldDescription>Recevoir les notifications par email</FieldDescription>
      </FieldContent>
      <Switch
        id="notifications"
        name={field.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
    </Field>
  )}
/>
```

## Critical Rules

1. **ALWAYS use `useForm` from `@tanstack/react-form`**
2. **ALWAYS use `mutateAsync`** in onSubmit - NOT `mutate`
3. **ALWAYS use shadcn `Field` components** from `@/components/ui/field`
4. **NEVER use `useState` for form data**
5. **Validation messages in French**
6. **`data-invalid` on Field** + `aria-invalid` on input
7. **`children` prop** on `form.Field` (not render function)
8. **Unique `id` on every input** linked to `FieldLabel` via `htmlFor`

## Valibot Quick Reference

```typescript
v.string()                                  // String type
v.number()                                  // Number type
v.boolean()                                 // Boolean type
v.pipe(v.string(), v.minLength(1, 'Msg'))   // String with min length
v.pipe(v.string(), v.email('Msg'))          // Email
v.picklist(['A', 'B'], 'Msg')              // Enum
v.optional(v.string())                      // Optional
v.array(v.string())                         // Array
v.pipe(v.number(), v.minValue(0, 'Msg'))    // Number with min
```
