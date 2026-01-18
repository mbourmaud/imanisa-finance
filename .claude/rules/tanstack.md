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
};
```

### Query Hooks

One hook = one query, explicit naming:

```typescript
export function useTransactionsQuery(filters, pagination) {
  return useQuery({
    queryKey: transactionKeys.list(filters, pagination),
    queryFn: () => transactionService.getAll(filters, pagination),
  });
}
```

### Mutations with Invalidation

```typescript
export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
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

## TanStack Form + Valibot

### Form Architecture

Each form follows this pattern:

```
src/features/[feature]/
├── forms/
│   └── [entity]-form-schema.ts   # Valibot schema
├── components/
│   └── [Entity]FormSheet.tsx     # Form component
└── hooks/
    └── use-[entities]-query.ts   # Query + mutations
```

### Schema with Valibot

```typescript
import * as v from 'valibot';

export const accountFormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Nom requis')),
  type: v.picklist(['CHECKING', 'SAVINGS', 'INVESTMENT', 'LOAN']),
  balance: v.optional(v.number()),
});

export type AccountFormValues = v.InferOutput<typeof accountFormSchema>;
```

### Form Hook with useAppForm

```typescript
import { useAppForm } from '@/lib/forms';

export function useAccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const createMutation = useCreateAccountMutation();

  const form = useAppForm({
    defaultValues: { name: '', type: 'CHECKING', balance: 0 },
    validators: { onChange: accountFormSchema },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
      onSuccess?.();
    },
  });

  return { form, isSubmitting: createMutation.isPending };
}
```

### Form Component

```tsx
export function AccountFormSheet({ open, onOpenChange }: Props) {
  const { form, isSubmitting } = useAccountForm({
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
          <form.AppField name="name">
            {(field) => <field.TextField label="Nom du compte" />}
          </form.AppField>

          <form.AppForm>
            <form.SubmitButton>Créer</form.SubmitButton>
          </form.AppForm>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

### Form Rules - CRITICAL

1. **ALWAYS use `mutateAsync`** in onSubmit (not `mutate`) for loading tracking
2. **Mappers obligatoires** - API → Form and Form → API, never direct binding
3. **One hook per entity** - `useAccountForm`, `useTransactionForm`
4. **Valibot schema** - onChange validation by default
5. **No local state** - Everything through TanStack Form (except isolated mini-inputs)

---

## TanStack Table

### Column Definitions

```typescript
import type { ColumnDef } from '@tanstack/react-table';

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
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.original.amount)}</div>
      ),
    },
  ];
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
});
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
