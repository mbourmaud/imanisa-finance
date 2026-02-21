# TanStack Patterns (Query, Form, Table)

## TanStack Query (Data Fetching)

### Query Key Factory Pattern

Always use a factory for cache keys:

```typescript
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: TransactionFilters, pagination?: TransactionPagination) =>
    [...transactionKeys.lists(), { filters, pagination }] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
}
```

### Query Hooks

One hook = one query, explicit naming:

```typescript
export function useTransactionsQuery(filters, pagination) {
  return useQuery({
    queryKey: transactionKeys.list(filters, pagination),
    queryFn: () => transactionService.getAll(filters, pagination),
  })
}
```

### Mutations with Invalidation

```typescript
export function useCreateTransactionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}
```

### TanStack Query vs Zustand

| Use Case | TanStack Query | Zustand |
|----------|----------------|---------|
| Server data (fetch/cache) | ✅ | ❌ |
| UI state (modals, sidebar) | ❌ | ✅ |
| Element selection | ❌ | ✅ |
| Local filters | ❌ | ✅ |
| Server-side pagination | ✅ | ❌ |

---

## TanStack Form + shadcn/ui Field Pattern

> **Reference**: https://ui.shadcn.com/docs/forms/tanstack-form

### Architecture Overview

We use the **official shadcn/ui TanStack Form integration**. This means:

- `useForm` from `@tanstack/react-form` directly
- `Field`, `FieldGroup`, `FieldError`, `FieldLabel` from `@/components/ui/field`
- `Input`, `Select`, `Checkbox`, `Switch` from `@/components/ui/`
- Valibot for validation schemas

### File Structure

```
src/features/[feature]/
├── forms/
│   └── [entity]-form-schema.ts   # Valibot schema
├── components/
│   └── [Entity]FormSheet.tsx     # Form UI component
└── hooks/
    └── use-[entities]-query.ts   # Query + mutations
```

### 1. Valibot Schema

```typescript
// src/features/accounts/forms/account-form-schema.ts
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
})

export type AccountFormValues = v.InferOutput<typeof accountFormSchema>
```

### 2. Form Component (shadcn Field Pattern)

```tsx
// src/features/accounts/components/AccountFormSheet.tsx
'use client'

import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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

import { accountFormSchema } from '../forms/account-form-schema'
import { useCreateAccountMutation } from '../hooks/use-accounts-query'

interface AccountFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountFormSheet({ open, onOpenChange }: AccountFormSheetProps) {
  const createMutation = useCreateAccountMutation()

  const form = useForm({
    defaultValues: {
      name: '',
      type: 'CHECKING' as const,
      balance: 0,
    },
    validators: {
      onSubmit: accountFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value)
      toast.success('Compte créé avec succès')
      onOpenChange(false)
    },
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouveau compte</SheetTitle>
        </SheetHeader>

        <form
          id="account-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            {/* Text field */}
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="account-name">
                      Nom du compte
                    </FieldLabel>
                    <Input
                      id="account-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Mon compte courant"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            {/* Select field */}
            <form.Field
              name="type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="account-type">
                      Type de compte
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        id="account-type"
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHECKING">Compte courant</SelectItem>
                        <SelectItem value="SAVINGS">Épargne</SelectItem>
                        <SelectItem value="INVESTMENT">Investissement</SelectItem>
                        <SelectItem value="LOAN">Prêt</SelectItem>
                      </SelectContent>
                    </Select>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Réinitialiser
          </Button>
          <Button type="submit" form="account-form">
            Créer le compte
          </Button>
        </Field>
      </SheetContent>
    </Sheet>
  )
}
```

### Key Pattern: Field with Validation

Every field follows this structure:

```tsx
<form.Field
  name="fieldName"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor="unique-id">Label en français</FieldLabel>
        <Input
          id="unique-id"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        <FieldDescription>Texte d'aide optionnel</FieldDescription>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    )
  }}
/>
```

### Available Field Components

| shadcn Component | Use Case |
|-----------------|----------|
| `Field` | Container for a single field (handles error state) |
| `FieldGroup` | Container for multiple fields (spacing) |
| `FieldLabel` | Label element linked to input via `htmlFor` |
| `FieldDescription` | Help text below label |
| `FieldError` | Validation error display (accepts `errors` prop) |
| `FieldSet` | HTML fieldset for grouped fields |
| `FieldLegend` | Legend for a FieldSet |
| `FieldSeparator` | Visual separator between field groups |
| `FieldContent` | Wrapper for label + description in horizontal layout |
| `FieldTitle` | Non-label title text for a field |
| `InputGroup` | Group input with addons (icons, buttons) |

### Field Orientations

```tsx
// Vertical (default) - label above input
<Field>...</Field>

// Horizontal - label and input side by side
<Field orientation="horizontal">...</Field>

// Responsive - vertical on mobile, horizontal on desktop
<Field orientation="responsive">...</Field>
```

### Form Rules - CRITICAL

1. **ALWAYS use `useForm` from `@tanstack/react-form`** - No manual `useState` for form data
2. **ALWAYS use `mutateAsync`** in onSubmit (not `mutate`) for proper error handling
3. **ALWAYS use shadcn `Field` components** - Not custom field wrappers
4. **Valibot for schemas** - Always in a separate file
5. **Validation messages in French** - User-facing text
6. **One schema per entity** - `accountFormSchema`, `memberFormSchema`
7. **`data-invalid` on Field** + `aria-invalid` on input for error state styling
8. **`children` prop** (not render function) on `form.Field`

### NEVER Do This

```typescript
// ❌ FORBIDDEN - Manual form state with useState
function MyForm() {
  const [name, setName] = useState('')
  const [errors, setErrors] = useState({})
  const handleSubmit = async () => { /* manual validation... */ }
}

// ✅ REQUIRED - Official shadcn + TanStack Form pattern
import { useForm } from '@tanstack/react-form'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const form = useForm({ ... })
<form.Field
  name="name"
  children={(field) => (
    <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
      <FieldLabel htmlFor="name">Nom</FieldLabel>
      <Input
        id="name"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.isTouched && !field.state.meta.isValid && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  )}
/>
```

---

## TanStack Table

### Column Definitions

```typescript
import type { ColumnDef } from '@tanstack/react-table'

export function createTransactionColumns(): ColumnDef<Transaction>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Montant</div>,
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.original.amount)}</div>
      ),
    },
  ]
}
```

### Table Instance

```typescript
const table = useReactTable({
  data,
  columns,
  state: { sorting, rowSelection, pagination },
  onSortingChange: setSorting,
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  enableRowSelection: true,
  manualPagination: true,
  pageCount: totalPages,
})
```

---

## Valibot Cheat Sheet (not Zod!)

| Zod | Valibot |
|-----|---------|
| `z.string()` | `v.string()` |
| `z.number()` | `v.number()` |
| `z.string().min(1)` | `v.pipe(v.string(), v.minLength(1))` |
| `z.string().email()` | `v.pipe(v.string(), v.email())` |
| `z.object({...})` | `v.object({...})` |
| `z.enum(['a', 'b'])` | `v.picklist(['a', 'b'])` |
| `z.optional(z.string())` | `v.optional(v.string())` |
| `z.infer<typeof schema>` | `v.InferOutput<typeof schema>` |
| `z.boolean()` | `v.boolean()` |
| `z.array(z.string())` | `v.array(v.string())` |
| `z.string().refine(...)` | `v.pipe(v.string(), v.check(...))` |
