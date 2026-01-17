# Imanisa Finance

Application de gestion financière familiale pour suivre les comptes bancaires, transactions, investissements et patrimoine immobilier.

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict, no ANY)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**:
  - **TanStack Query** - Data fetching, caching, mutations
  - **Zustand** - Client state (UI, selection, filters)
- **Forms**: TanStack Form + Zod validation
- **Tables**: TanStack Table (sorting, filtering, pagination, selection)

## Principes Architecturaux

### Clean Architecture & DDD

Le code suit les principes de Clean Architecture et Domain-Driven Design :

1. **Séparation des responsabilités** - Chaque couche a un rôle précis
2. **Dépendances vers l'intérieur** - Les couches externes dépendent des couches internes, jamais l'inverse
3. **Domain au centre** - La logique métier est isolée et ne dépend pas des frameworks

### Composants UI Réutilisables

**IMPORTANT** : Ne jamais utiliser de styles inline ou de Tailwind custom dans les pages.

- Créer des composants réutilisables dans `src/components/`
- Composer les pages uniquement avec des composants du design system
- Étendre shadcn/ui pour les besoins spécifiques
- Les composants encapsulent leur styling

```tsx
// ❌ Mauvais - styles inline dans la page
<div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white font-bold">
  {bank.shortName}
</div>

// ✅ Bon - composant réutilisable
<BankAvatar bank={bank} size="lg" />
```

## Architecture

```
src/
├── app/                    # Next.js App Router (UI layer)
│   ├── api/               # API Routes (Interface adapters)
│   ├── dashboard/         # Pages (composées de components)
│   └── login/
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── common/            # Composants génériques réutilisables
│   └── [feature]/         # Composants spécifiques par feature
├── domain/                # Domain layer (pure business logic)
│   ├── entities/          # Entités métier
│   ├── value-objects/     # Value objects
│   └── services/          # Domain services
├── features/              # Feature modules (Application layer)
│   └── import/            # Use cases, DTOs, mappers
├── lib/                   # Shared utilities
├── server/
│   └── repositories/      # Infrastructure layer (Prisma implementations)
└── shared/
    ├── constants/         # Configuration, enums
    └── utils/             # Pure utility functions
```

### Couches et Responsabilités

| Couche | Responsabilité | Exemples |
|--------|----------------|----------|
| **Domain** | Logique métier pure, entités, règles | `Transaction`, `Account`, calculs de solde |
| **Application** | Use cases, orchestration | `ImportTransactionsUseCase`, `CreateAccountUseCase` |
| **Infrastructure** | Accès données, services externes | Repositories Prisma, clients API |
| **Interface** | UI, API routes | Pages Next.js, composants React |

## Concepts Clés

### Membres vs Users
- **Member**: Membre du foyer (Isaac, Mathieu, Ninon) - peut ou non avoir un compte
- **User**: Compte Supabase Auth - lié optionnellement à un Member
- Tous les users connectés voient tous les comptes/membres

### Banques Supportées
Les banques sont des **constantes** dans `src/shared/constants/supported-banks.ts`, pas des entités en base.
Chaque compte a un `supportedBankKey` qui référence une banque supportée.

### Comptes et Titulaires
- Un compte peut avoir plusieurs titulaires (AccountMember junction table)
- Chaque titulaire a un pourcentage de propriété (ownerShare)

### Transactions et Déduplication
- Import CSV avec déduplication via contrainte unique `[accountId, date, amount, description]`
- Catégorisation manuelle ou automatique

## Commandes

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # ESLint
npx prisma studio    # Database GUI
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create migration
```

## Conventions

### Code Style
- Tabs pour l'indentation
- Single quotes pour les strings
- Pas de point-virgule en fin de ligne (selon config)
- Français pour l'UI, anglais pour le code
- Noms explicites et descriptifs (pas d'abréviations)

### Clean Code Principles

```typescript
// ❌ Mauvais
const d = new Date();
const calc = (a: number, b: number) => a * b / 100;

// ✅ Bon
const currentDate = new Date();
const calculateOwnershipPercentage = (amount: number, sharePercent: number) =>
  amount * sharePercent / 100;
```

- **Single Responsibility** : Une fonction/classe = une responsabilité
- **DRY** : Ne pas répéter la logique, extraire dans des fonctions/composants
- **Early Returns** : Sortir tôt des fonctions pour éviter les nesting
- **Immutabilité** : Préférer les opérations immutables

### Composants UI

**Structure d'un composant** :
```
src/components/
├── ui/                     # shadcn/ui (ne pas modifier directement)
├── common/                 # Composants génériques
│   ├── Avatar.tsx
│   ├── MoneyDisplay.tsx
│   ├── StatusBadge.tsx
│   └── EmptyState.tsx
├── accounts/               # Composants feature accounts
│   ├── AccountCard.tsx
│   ├── AccountHeader.tsx
│   └── AccountMemberBadge.tsx
└── banks/                  # Composants feature banks
    ├── BankAvatar.tsx
    ├── BankCard.tsx
    └── BankList.tsx
```

**Règles** :
- Utiliser shadcn/ui comme base (`@/components/ui/`)
- Créer des composants métier qui encapsulent le styling
- Props typées avec des interfaces explicites
- Pas de styles Tailwind custom dans les pages, uniquement dans les composants
- **JAMAIS** de `alert()`, `confirm()`, `prompt()` natifs - utiliser `AlertDialog` de shadcn/ui
- **Édition et paramètres** : Utiliser le composant `Sheet` (drawer) au lieu de modes inline ou modals. Les Sheet s'ouvrent sur le côté et offrent une meilleure UX sur mobile (100% width) et desktop (~400px).

### Patterns UI Préférés

**Sheet (Drawer) pour l'édition** :
```tsx
// ❌ Mauvais - édition inline qui casse le layout
{isEditing ? <EditForm /> : <ViewMode />}

// ✅ Bon - Sheet qui s'ouvre sur le côté
<Sheet open={isEditing} onOpenChange={setIsEditing}>
  <SheetContent side="right" className="w-full sm:w-[400px]">
    <SheetHeader>
      <SheetTitle>Modifier le compte</SheetTitle>
    </SheetHeader>
    <EditForm />
  </SheetContent>
</Sheet>
```

**Infinite Scroll pour les listes** :
```tsx
// Utiliser IntersectionObserver pour charger plus de données
const observerRef = useRef<IntersectionObserver | null>(null);
const loadMoreRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  observerRef.current = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );
  if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
  return () => observerRef.current?.disconnect();
}, [hasMore, isLoading, loadMore]);

// Dans le JSX
<div ref={loadMoreRef} className="h-4" /> {/* Trigger element */}
```

### API Routes
- Pattern: `/api/[resource]/route.ts` pour CRUD
- Pattern: `/api/[resource]/[id]/route.ts` pour opérations sur une ressource
- Validation des inputs avec early returns
- Toujours retourner JSON avec status approprié
- Utiliser les Use Cases pour la logique métier complexe

### Repositories (Infrastructure Layer)
- Toute interaction avec Prisma passe par les repositories
- Les repositories retournent des entités du domaine, pas des types Prisma
- Export centralisé via `src/server/repositories/index.ts`

### Use Cases (Application Layer)
```typescript
// src/features/accounts/use-cases/create-account.ts
export class CreateAccountUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private memberRepository: MemberRepository
  ) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    // Validation
    // Business logic
    // Persistence
  }
}
```

## Types Prisma Importants

```typescript
enum AccountType {
  CHECKING    // Compte courant
  SAVINGS     // Épargne
  INVESTMENT  // Investissement
  LOAN        // Prêt
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

## TanStack Patterns

### TanStack Query (Data Fetching)

**Query Key Factory Pattern** - Toujours utiliser un factory pour les clés de cache :

```typescript
// src/features/transactions/hooks/use-transactions-query.ts
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: TransactionFilters, pagination?: TransactionPagination) =>
    [...transactionKeys.lists(), { filters, pagination }] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};
```

**Hooks Query** - Un hook = une query, nommage explicite :

```typescript
// ✅ Bon - hooks dédiés
export function useTransactionsQuery(filters, pagination) {
  return useQuery({
    queryKey: transactionKeys.list(filters, pagination),
    queryFn: () => transactionService.getAll(filters, pagination),
  });
}

export function useTransactionQuery(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  });
}
```

**Mutations avec Invalidation** :

```typescript
export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionService.create(input),
    onSuccess: () => {
      // Invalider les listes pour refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Invalider le summary aussi
      queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
    },
  });
}
```

**Optimistic Updates** - Pour une UX réactive :

```typescript
useMutation({
  mutationFn: createTransaction,
  onMutate: async (newTransaction) => {
    await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
    const previous = queryClient.getQueryData(transactionKeys.lists());
    queryClient.setQueryData(transactionKeys.lists(), (old) => ({
      ...old,
      items: [optimisticItem, ...old.items],
    }));
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(transactionKeys.lists(), context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
  },
});
```

### TanStack Query vs Zustand

**Quand utiliser quoi** :

| Cas d'usage | TanStack Query | Zustand |
|-------------|----------------|---------|
| Données serveur (fetch/cache) | ✅ | ❌ |
| État UI (modals, sidebar) | ❌ | ✅ |
| Sélection d'éléments | ❌ | ✅ |
| Filtres locaux | ❌ | ✅ |
| Pagination serveur | ✅ | ❌ |
| Tri/filtre côté serveur | ✅ | ❌ |

**Coexistence** - Les deux peuvent cohabiter :

```typescript
// Store Zustand pour l'UI
const useTransactionUIStore = create((set) => ({
  selectedIds: [],
  isCreateModalOpen: false,
  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((i) => i !== id)
      : [...state.selectedIds, id],
  })),
}));

// Hook Query pour les données
function TransactionList() {
  const { data, isLoading } = useTransactionsQuery();
  const { selectedIds, toggleSelection } = useTransactionUIStore();
  // ...
}
```

### TanStack Table

**Column Definitions** - Typage strict avec ColumnDef :

```typescript
import type { ColumnDef } from '@tanstack/react-table';

export function createTransactionColumns(options?: ColumnOptions): ColumnDef<Transaction>[] {
  return [
    // Colonne de sélection
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
    },
    // Colonne de données
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
      sortingFn: 'datetime',
    },
    // Colonne avec accessor function
    {
      accessorFn: (row) => row.amount,
      id: 'amount',
      header: () => <div className="text-right">Montant</div>,
      cell: ({ row }) => (
        <div className={cn('text-right', row.original.type === 'income' && 'text-emerald-600')}>
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
  ];
}
```

**Table Instance** - Configurer useReactTable :

```typescript
const table = useReactTable({
  data,
  columns,
  state: { sorting, rowSelection, pagination },
  // Handlers (utilisent le pattern Updater)
  onSortingChange: setSorting,
  onRowSelectionChange: setRowSelection,
  onPaginationChange: setPagination,
  // Row models
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  // Options
  enableRowSelection: true,
  manualPagination: true, // Si pagination serveur
  pageCount: totalPages,
});
```

**DataTable Component** - Composant réutilisable dans `src/components/ui/data-table.tsx` :

```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  manualPagination
  pagination={pagination}
  onPaginationChange={handlePaginationChange}
  pageCount={totalPages}
  sorting={sorting}
  onSortingChange={setSorting}
  enableRowSelection
  rowSelection={rowSelection}
  onRowSelectionChange={handleRowSelectionChange}
  emptyMessage="Aucune transaction trouvée"
/>
```

### TanStack Form

**Form Setup avec Zod** :

```typescript
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string().min(1, 'Description requise'),
  date: z.date(),
  categoryId: z.string().optional(),
});

function TransactionForm() {
  const form = useForm({
    defaultValues: {
      amount: 0,
      description: '',
      date: new Date(),
      categoryId: undefined,
    },
    validators: {
      onChange: transactionSchema,
    },
    onSubmit: async ({ value }) => {
      await createTransaction(value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field
        name="amount"
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Montant</Label>
            <Input
              id={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        )}
      />
    </form>
  );
}
```

**Field Info Helper** :

```typescript
function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid && (
        <p className="text-sm text-destructive">
          {field.state.meta.errors.join(', ')}
        </p>
      )}
      {field.state.meta.isValidating && (
        <p className="text-sm text-muted-foreground">Validation...</p>
      )}
    </>
  );
}
```

## Tests

Compte de test Playwright: `fr100828` / `1L0v31000niuM*`
