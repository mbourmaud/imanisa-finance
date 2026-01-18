# Zustand - Client State Management

## When to Use Zustand vs TanStack Query

| Data Type | Use | Example |
|-----------|-----|---------|
| **Server data** (API responses) | ❌ TanStack Query | Accounts, transactions, members |
| **UI state** (modals, sidebar) | ✅ Zustand | Sidebar collapsed, modal open |
| **User preferences** (persisted) | ✅ Zustand | Theme, selected entity, filters |
| **Element selection** | ✅ Zustand | Selected rows, bulk actions |
| **Form state** | ❌ TanStack Form | Form inputs, validation |
| **Pagination/filters** | ❌ TanStack Query or URL | Page number, search query |

## CRITICAL: Never Use Zustand For Server Data

```typescript
// ❌ NEVER DO THIS - Server data in Zustand
const useAccountStore = create((set) => ({
  accounts: [],
  isLoading: false,
  fetchAccounts: async () => {
    set({ isLoading: true });
    const data = await fetch('/api/accounts');
    set({ accounts: data, isLoading: false });
  },
}));

// ✅ CORRECT - Use TanStack Query for server data
export function useAccountsQuery() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: () => accountService.getAll(),
  });
}
```

**Why?** TanStack Query provides:
- Automatic caching and cache invalidation
- Background refetching
- Loading/error states
- Optimistic updates
- Deduplication of requests

## Correct Zustand Patterns

### 1. Global UI State

```typescript
// src/shared/stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
    }),
    { name: 'ui-store' }
  )
);
```

### 2. User Preferences (Persisted)

```typescript
// src/shared/stores/entity-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EntityState {
  selectedEntityId: string | null;
  setSelectedEntity: (id: string | null) => void;
}

export const useEntityStore = create<EntityState>()(
  persist(
    (set) => ({
      selectedEntityId: null,
      setSelectedEntity: (id) => set({ selectedEntityId: id }),
    }),
    { name: 'entity-store' }
  )
);
```

### 3. Element Selection (for bulk actions)

```typescript
// src/features/transactions/stores/selection-store.ts
import { create } from 'zustand';

interface SelectionState {
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

export const useTransactionSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: new Set(),
  toggle: (id) => set((s) => {
    const next = new Set(s.selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    return { selectedIds: next };
  }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clear: () => set({ selectedIds: new Set() }),
  isSelected: (id) => get().selectedIds.has(id),
}));
```

## Store Structure

```
src/shared/stores/
├── index.ts           # Barrel export for all shared stores
├── ui-store.ts        # Global UI state (sidebar, command palette)
└── entity-store.ts    # User preferences (selected entity)

src/features/[feature]/stores/
└── selection-store.ts # Feature-specific selection state (optional)
```

### Barrel Export Pattern

```typescript
// src/shared/stores/index.ts
export { useUIStore } from './ui-store'
export { useEntityStore } from './entity-store'

// Usage in components
import { useUIStore, useEntityStore } from '@/shared/stores'
```

## Best Practices

### DO ✅

- Use Zustand for **pure client state** that doesn't come from the server
- Use `persist` middleware for user preferences
- Keep stores small and focused
- Use TypeScript for type safety
- Enable devtools in development

### DON'T ❌

- **Never fetch API data in Zustand** - Use TanStack Query
- **Never duplicate server state** - Query is the source of truth
- **Never use Zustand for form state** - Use TanStack Form
- **Don't create huge monolithic stores** - Split by concern

## Using Zustand with TanStack Query

When you need both selection (Zustand) and data (Query):

```tsx
function TransactionList() {
  // Server data from TanStack Query
  const { data: transactions, isLoading } = useTransactionsQuery();

  // UI selection from Zustand
  const { selectedIds, toggle, clear } = useTransactionSelectionStore();

  // Mutation for bulk action
  const deleteMutation = useDeleteTransactionsMutation();

  const handleBulkDelete = async () => {
    await deleteMutation.mutateAsync([...selectedIds]);
    clear(); // Clear selection after delete
  };

  if (isLoading) return <Skeleton />;

  return (
    <>
      <BulkActions
        count={selectedIds.size}
        onDelete={handleBulkDelete}
      />
      {transactions.map((t) => (
        <TransactionRow
          key={t.id}
          transaction={t}
          selected={selectedIds.has(t.id)}
          onSelect={() => toggle(t.id)}
        />
      ))}
    </>
  );
}
```

## Migration Note

The codebase currently has legacy Zustand stores (`useTransactionStore`, `useAccountStore`) that mix server and client state. These should be migrated:

1. **Remove server data fetching** from these stores
2. **Use TanStack Query hooks** for data (`useTransactionsQuery`, `useAccountsQuery`)
3. **Keep only UI state** in Zustand (selection, modal visibility)
4. **Or move UI state to component `useState`** if it's local

The modern TanStack Query hooks already exist and should be preferred.
