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
- **Charts**: Tremor (DonutChart, BarChart, AreaChart)

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

## Charts avec Tremor

On utilise **Tremor** pour les graphiques (pas Recharts ni shadcn/charts). API simple et déclarative.

### Composants disponibles

Nos composants wrappent Tremor dans `src/components/charts/` :

```tsx
import { DonutChart, ChartLegend } from '@/components/charts/pie-chart';
import { IncomeExpenseBarChart } from '@/components/charts/bar-chart';
import { PatrimonyAreaChart, InvestmentPerformanceChart } from '@/components/charts/area-chart';
```

### Usage DonutChart

```tsx
const data = [
  { name: 'Alimentation', value: 450, color: '#10b981' },
  { name: 'Transport', value: 200, color: '#3b82f6' },
  { name: 'Loisirs', value: 150, color: '#8b5cf6' },
];

<DonutChart data={data} className="h-72" />
<ChartLegend items={data} total={800} />
```

### Usage BarChart

```tsx
const data = [
  { label: 'Jan', income: 3500, expenses: 2800 },
  { label: 'Fév', income: 3200, expenses: 2600 },
];

<IncomeExpenseBarChart data={data} className="h-72" />
```

### Usage AreaChart

```tsx
// Patrimoine simple
const data = [
  { date: '2024-01', value: 50000, label: 'Jan' },
  { date: '2024-02', value: 52000, label: 'Fév' },
];

<PatrimonyAreaChart data={data} className="h-72" />

// Performance investissement (valeur vs investi)
const investData = [
  { date: '2024-01', value: 10500, invested: 10000, label: 'Jan' },
  { date: '2024-02', value: 11200, invested: 10500, label: 'Fév' },
];

<InvestmentPerformanceChart data={investData} className="h-72" />
```

### Couleurs Tremor

Tremor utilise des noms de couleurs prédéfinis : `emerald`, `rose`, `indigo`, `slate`, `amber`, `cyan`, etc.

```tsx
<BarChart colors={['emerald', 'rose']} />
```

## Design Guidelines (Vercel Style)

### Principes Visuels

L'application suit les **Vercel Web Interface Guidelines** :

- **Minimalisme** - Pas de clutter visuel, chaque élément a une raison d'être
- **Whitespace généreux** - Laisser respirer les éléments (`space-y-6`, `gap-4`, `p-6`)
- **Bordures subtiles** - Utiliser `border-border/60` au lieu de `border-border`
- **Couleurs muted** - Texte secondaire en `text-muted-foreground`
- **Hiérarchie typographique claire** - Titres en `font-semibold`, descriptions en `text-sm text-muted-foreground`
- **Mobile-first** - Toujours designer pour mobile d'abord

### Patterns Visuels

```tsx
// ❌ Mauvais - trop de bordures, pas assez d'espace
<Card className="border p-2">
  <h3 className="font-bold text-lg">Titre</h3>
  <p className="text-gray-500">Description</p>
</Card>

// ✅ Bon - subtil et aéré
<Card className="border-border/60">
  <CardHeader className="pb-4">
    <CardTitle className="text-lg font-medium">Titre</CardTitle>
    <p className="text-sm text-muted-foreground">Description</p>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* contenu */}
  </CardContent>
</Card>
```

### Stat Cards Pattern

```tsx
<div className="stat-card">
  <div className="stat-card-content">
    <div className="stat-card-text">
      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Label</p>
      <p className="stat-card-value">{formatMoney(value)}</p>
    </div>
    <div className="stat-card-icon">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
  </div>
</div>
```

### Responsive Breakpoints

- Mobile: `< 640px` (default)
- Tablet: `sm:` (640px+)
- Desktop: `lg:` (1024px+)
- Large: `xl:` (1280px+)

```tsx
// Grid responsive
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

// Texte responsive
<p className="text-xs sm:text-sm">

// Padding responsive
<div className="p-4 sm:p-6">
```

## Gestion des Erreurs et Validation

### Validation API (Early Returns)

```typescript
// src/app/api/accounts/route.ts
export async function POST(request: Request) {
  // 1. Auth check
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body: CreateAccountInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 3. Validate required fields
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // 4. Business logic
  try {
    const account = await accountRepository.create(body);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Failed to create account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
```

### Gestion des Erreurs TanStack Query

```tsx
function AccountsList() {
  const { data, isLoading, isError, error } = useAccountsQuery();

  if (isLoading) {
    return <LoadingState message="Chargement des comptes..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Erreur de chargement"
        message={error?.message || 'Une erreur est survenue'}
        onRetry={() => queryClient.invalidateQueries({ queryKey: accountKeys.all })}
      />
    );
  }

  if (!data?.length) {
    return <EmptyState title="Aucun compte" action={<CreateAccountButton />} />;
  }

  return <AccountsGrid accounts={data} />;
}
```

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Succès
toast.success('Compte créé avec succès');

// Erreur
toast.error('Échec de la création du compte');

// Avec action
toast.success('Transaction supprimée', {
  action: {
    label: 'Annuler',
    onClick: () => undoDelete(),
  },
});

// Loading promise
toast.promise(createAccount(data), {
  loading: 'Création en cours...',
  success: 'Compte créé !',
  error: 'Échec de la création',
});
```

## Import/Export Patterns

### Barrel Exports (index.ts)

Chaque feature doit avoir un `index.ts` qui exporte tout :

```typescript
// src/features/accounts/index.ts

// Hooks
export {
  accountKeys,
  useAccountsQuery,
  useAccountQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} from './hooks/use-accounts-query';

// Types
export type {
  Account,
  AccountWithDetails,
  CreateAccountInput,
  UpdateAccountInput,
} from './types';

// Services (si nécessaire côté client)
export { accountService } from './services/account-service';
```

### Imports dans les Pages

```typescript
// ✅ Bon - import depuis le barrel
import { useAccountsQuery, useCreateAccountMutation, type Account } from '@/features/accounts';

// ❌ Mauvais - import direct des fichiers internes
import { useAccountsQuery } from '@/features/accounts/hooks/use-accounts-query';
import type { Account } from '@/features/accounts/types';
```

### Structure d'une Feature

```
src/features/accounts/
├── hooks/
│   └── use-accounts-query.ts    # TanStack Query hooks
├── services/
│   └── account-service.ts       # API calls (fetch)
├── types/
│   └── index.ts                 # TypeScript types
├── components/                  # (optionnel) Composants spécifiques
│   └── AccountCard.tsx
└── index.ts                     # Barrel export
```

## Conventions de Commit

### Format

```
<type>: <description courte>

[corps optionnel]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactoring sans changement de comportement |
| `chore` | Tâches de maintenance (deps, config) |
| `docs` | Documentation uniquement |
| `style` | Formatage, pas de changement de code |
| `test` | Ajout/modification de tests |
| `perf` | Amélioration de performance |

### Exemples

```bash
feat: add transaction categorization
fix: resolve duplicate import on CSV upload
refactor: extract AccountCard component
chore: upgrade TanStack Query to v5
docs: update README with setup instructions
```

### Règles

- Message en **anglais**
- Première lettre en **minuscule**
- Pas de point final
- Impératif présent ("add" pas "added")
- Max 72 caractères pour la première ligne

## Performance

### React Optimizations

**useMemo pour calculs coûteux** :

```tsx
// ✅ Bon - mémoïser les calculs dérivés
const totalBalance = useMemo(() => {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}, [accounts]);

// ❌ Mauvais - recalcul à chaque render
const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
```

**useCallback pour les handlers passés en props** :

```tsx
// ✅ Bon - stable reference
const handleSelect = useCallback((id: string) => {
  setSelectedIds(prev => [...prev, id]);
}, []);

<AccountList onSelect={handleSelect} />
```

**Éviter les re-renders inutiles** :

```tsx
// ❌ Mauvais - nouvel objet à chaque render
<AccountCard style={{ marginTop: 10 }} />

// ✅ Bon - objet stable ou className
<AccountCard className="mt-2.5" />
```

### Next.js Optimizations

**Dynamic imports pour code splitting** :

```tsx
import dynamic from 'next/dynamic';

// Charger le composant lourd seulement quand nécessaire
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Si le composant utilise window/document
});
```

**Image optimization** :

```tsx
import Image from 'next/image';

<Image
  src={bank.logo}
  alt={bank.name}
  width={40}
  height={40}
  className="rounded-lg"
/>
```

### TanStack Query Optimizations

**Stale time pour éviter refetch inutiles** :

```typescript
useQuery({
  queryKey: ['banks'],
  queryFn: fetchBanks,
  staleTime: 5 * 60 * 1000, // 5 minutes - données qui changent peu
});
```

**Placeholder data pour UX instantanée** :

```typescript
useQuery({
  queryKey: accountKeys.detail(id),
  queryFn: () => fetchAccount(id),
  placeholderData: () => {
    // Utiliser les données de la liste si disponibles
    return queryClient
      .getQueryData<Account[]>(accountKeys.lists())
      ?.find(a => a.id === id);
  },
});
```

**Prefetch pour navigation anticipée** :

```tsx
function AccountCard({ account }: { account: Account }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch les détails au survol
    queryClient.prefetchQuery({
      queryKey: accountKeys.detail(account.id),
      queryFn: () => fetchAccount(account.id),
    });
  };

  return (
    <Link
      href={`/dashboard/accounts/${account.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* ... */}
    </Link>
  );
}
```

## Debugging

### TanStack Query DevTools

Les DevTools sont automatiquement activés en développement. Cliquer sur le logo React Query en bas à droite pour :
- Voir toutes les queries et leur état
- Invalider manuellement des queries
- Voir le cache

### Prisma Logging

Activer les logs SQL en développement :

```typescript
// src/lib/prisma.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});
```

### Console Patterns

```typescript
// Préfixer les logs pour filtrage facile
console.log('[AccountRepository]', 'Creating account:', data);
console.error('[API/accounts]', 'Failed to fetch:', error);

// Utiliser console.table pour les arrays
console.table(accounts.map(a => ({ id: a.id, name: a.name, balance: a.balance })));
```
