# Imanisa Finance

Family financial management application for tracking bank accounts, transactions, investments, and real estate assets.

## SECURITY - CRITICAL RULES

> **This repository is PUBLIC. NEVER commit sensitive data.**

### Files Forbidden in Git

- `.env`, `.env.local`, `.env.production` - Environment variables
- `.ralph/` - Ralph folder with test data (real transactions, names, amounts)
- `*.pem`, `*.key`, `*.crt` - Certificates and keys
- `credentials.json`, `secrets.json` - Secret files
- Screenshots with personal data

### Pre-Commit Checks

```bash
# Check that no secret is staged
git diff --cached | grep -E "(password|secret|api_key|token|DATABASE_URL|SUPABASE)" || echo "OK"

# Check added files
git status | grep -E "\.env|credential|secret|\.ralph"
```

### Data That Must Never Be Logged/Committed

- Database URLs with credentials
- Supabase, Vercel, GitHub tokens
- Real household member names in code (use placeholders)
- Real transaction/account amounts in tests
- Bank account numbers

### Required .gitignore

```gitignore
.env*
.ralph/
*.pem
*.key
credentials*.json
```

### In Case of Leak

If a secret was committed by mistake:
1. **Immediately revoke** the concerned secret (regenerate the token)
2. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
3. Force push after cleanup

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict, no ANY)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**:
  - **TanStack Query** - Data fetching, caching, mutations
  - **Zustand** - Client state (UI, selection, filters)
- **Forms**: TanStack Form + Valibot validation (migrated from Zod)
- **Tables**: TanStack Table (sorting, filtering, pagination, selection)
- **Charts**: Tremor (DonutChart, BarChart, AreaChart)

### Validation: Valibot (not Zod)

We use **Valibot** instead of Zod for schema validation. Valibot is:
- **Smaller bundle** (~1KB vs ~12KB for Zod)
- **Faster** runtime validation
- **Same API** concepts (easy migration from Zod)
- **TanStack Form compatible** natively (Standard Schema support, no adapter needed)

```tsx
// ❌ Don't use Zod
import { z } from 'zod';
const schema = z.object({ name: z.string().min(1) });

// ✅ Use Valibot
import * as v from 'valibot';
const schema = v.object({ name: v.pipe(v.string(), v.minLength(1)) });
```

**Migration cheat sheet:**
| Zod | Valibot |
|-----|---------|
| `z.string()` | `v.string()` |
| `z.number()` | `v.number()` |
| `z.boolean()` | `v.boolean()` |
| `z.string().min(1)` | `v.pipe(v.string(), v.minLength(1))` |
| `z.string().email()` | `v.pipe(v.string(), v.email())` |
| `z.object({...})` | `v.object({...})` |
| `z.array(z.string())` | `v.array(v.string())` |
| `z.enum(['a', 'b'])` | `v.picklist(['a', 'b'])` |
| `z.optional(z.string())` | `v.optional(v.string())` |
| `z.infer<typeof schema>` | `v.InferOutput<typeof schema>` |

## Architectural Principles

### Clean Architecture & DDD

The code follows Clean Architecture and Domain-Driven Design principles:

1. **Separation of concerns** - Each layer has a specific role
2. **Dependencies point inward** - Outer layers depend on inner layers, never the reverse
3. **Domain at the center** - Business logic is isolated and doesn't depend on frameworks

### Reusable UI Components

**IMPORTANT**: Never use inline styles or custom Tailwind in pages.

- Create reusable components in `src/components/`
- Compose pages only with design system components
- Extend shadcn/ui for specific needs
- Components encapsulate their styling

```tsx
// ❌ Bad - inline styles in page
<div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white font-bold">
  {bank.shortName}
</div>

// ✅ Good - reusable component
<BankAvatar bank={bank} size="lg" />
```

### FUNDAMENTAL UI RULE - Zero className in Pages

**Pages in `src/app/dashboard/` must NEVER use `className=`.**

Styling goes through component **props**, not inline Tailwind classes.

```tsx
// ❌ FORBIDDEN - inline className in a page
<div className="flex items-center gap-4 p-6 bg-muted rounded-lg">
  <span className="text-sm text-muted-foreground">Label</span>
  <Button className="gap-1 hover:bg-primary">
    <Plus className="h-4 w-4" />
    Add
  </Button>
</div>

// ✅ CORRECT - use component props
<Box display="flex" align="center" gap="md" p="lg" bg="muted" rounded="lg">
  <Text size="sm" color="muted">Label</Text>
  <Button variant="primary" iconLeft="plus">
    Add
  </Button>
</Box>
```

#### Base Components (src/components/ui/)

| Component | Props | Replaces |
|-----------|-------|----------|
| `Box` | `p`, `m`, `bg`, `rounded`, `shadow`, `display` | `<div className="...">` |
| `Text` | `size`, `color`, `weight` | `<span>`, `<p>` with className |
| `Heading` | `level`, `size`, `color` | `<h1-h6>` with className |
| `Stack` | `gap`, `align` (VStack/HStack) | `<div className="flex flex-col gap-4">` |
| `Grid` | `cols`, `gap`, `responsive` | `<div className="grid grid-cols-3 gap-4">` |
| `Flex` | `direction`, `gap`, `align`, `justify` | `<div className="flex items-center">` |
| `Icon` | `name`, `size`, `color` | Direct import from lucide-react |

#### Strict Rules

1. **No lucide-react import in pages** - Use `<Icon name="plus" />`
2. **No `className` on UI components** - Use props
3. **No Tailwind classes in pages** - Everything is encapsulated in components
4. **Feature components compose UI components** - Clean hierarchy

#### Maximize shadcn/ui Usage

**BEFORE creating a new component, check if shadcn/ui already provides it.**

shadcn/ui offers a wide collection of components: Button, Card, Dialog, Sheet, Input, Select, Checkbox, Switch, Avatar, Badge, Tooltip, Popover, DropdownMenu, Table, Tabs, etc.

```bash
# Add a shadcn component
npx shadcn@latest add <component>
```

**Workflow:**
1. **Need a component?** → First search in [shadcn/ui](https://ui.shadcn.com/docs/components)
2. **shadcn has it?** → Install it with `npx shadcn@latest add`
3. **Customization needed?** → Wrap the shadcn component in `src/components/ui/` with our props
4. **shadcn doesn't have it?** → Create a custom component based on Radix UI

```tsx
// ❌ Bad - create a component from scratch
export function CustomCard({ ... }) {
  return <div className="rounded-lg border p-4">...</div>
}

// ✅ Good - use and wrap shadcn
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AccountCard({ account }) {
  return (
    <Card>
      <CardHeader>
        <Heading level={3}>{account.name}</Heading>
      </CardHeader>
      <CardContent>
        <MoneyDisplay amount={account.balance} />
      </CardContent>
    </Card>
  );
}
```

**Available shadcn components:**
- Layout: Card, Dialog, Sheet, Drawer, Popover, Tooltip
- Forms: Input, Textarea, Select, Checkbox, Switch, RadioGroup, Slider
- Navigation: Tabs, NavigationMenu, Breadcrumb, Pagination
- Data: Table, DataTable, Avatar, Badge, Progress
- Feedback: Alert, AlertDialog, Toast (Sonner)
- Actions: Button, DropdownMenu, ContextMenu, Command

#### Verification with ESLint

We have **custom ESLint rules** that enforce these UI architecture rules:

```bash
# Run UI linting (enforces our rules)
npm run lint:ui

# This will fail if:
# 1. className is used in src/app/ or src/features/
# 2. Direct imports from @/components/ui/ outside src/components/
```

**ESLint Rules:**
- `local/no-inline-classname` - ERROR: className not allowed in pages/features
- `local/no-direct-shadcn-import` - ERROR: Import from @/components/ui/* only in src/components/

The `npm run check` command runs both Biome and these ESLint rules.

## Architecture

```
src/
├── app/                    # Next.js App Router (UI layer)
│   ├── api/               # API Routes (Interface adapters)
│   ├── dashboard/         # Pages (composed of components)
│   └── login/
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── common/            # Generic reusable components
│   └── [feature]/         # Feature-specific components
├── domain/                # Domain layer (pure business logic)
│   ├── entities/          # Business entities
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

### Layers and Responsibilities

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| **Domain** | Pure business logic, entities, rules | `Transaction`, `Account`, balance calculations |
| **Application** | Use cases, orchestration | `ImportTransactionsUseCase`, `CreateAccountUseCase` |
| **Infrastructure** | Data access, external services | Prisma repositories, API clients |
| **Interface** | UI, API routes | Next.js pages, React components |

## Key Concepts

### Members vs Users
- **Member**: Household member (Isaac, Mathieu, Ninon) - may or may not have an account
- **User**: Supabase Auth account - optionally linked to a Member
- All connected users see all accounts/members

### Supported Banks
Banks are **constants** in `src/shared/constants/supported-banks.ts`, not database entities.
Each account has a `supportedBankKey` that references a supported bank.

### Accounts and Holders
- An account can have multiple holders (AccountMember junction table)
- Each holder has an ownership percentage (ownerShare)

### Transactions and Deduplication
- CSV import with deduplication via unique constraint `[accountId, date, amount, description]`
- Manual or automatic categorization

## Commands

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
- Tabs for indentation
- Single quotes for strings
- No semicolons at end of line (per config)
- French for UI, English for code
- Explicit and descriptive names (no abbreviations)

### Clean Code Principles

```typescript
// ❌ Bad
const d = new Date();
const calc = (a: number, b: number) => a * b / 100;

// ✅ Good
const currentDate = new Date();
const calculateOwnershipPercentage = (amount: number, sharePercent: number) =>
  amount * sharePercent / 100;
```

- **Single Responsibility**: One function/class = one responsibility
- **DRY**: Don't repeat logic, extract into functions/components
- **Early Returns**: Exit functions early to avoid nesting
- **Immutability**: Prefer immutable operations

### UI Components

**Component structure**:
```
src/components/
├── ui/                     # shadcn/ui (don't modify directly)
├── common/                 # Generic components
│   ├── Avatar.tsx
│   ├── MoneyDisplay.tsx
│   ├── StatusBadge.tsx
│   └── EmptyState.tsx
├── accounts/               # Account feature components
│   ├── AccountCard.tsx
│   ├── AccountHeader.tsx
│   └── AccountMemberBadge.tsx
└── banks/                  # Bank feature components
    ├── BankAvatar.tsx
    ├── BankCard.tsx
    └── BankList.tsx
```

**Rules**:
- Use shadcn/ui as base (`@/components/ui/`)
- Create business components that encapsulate styling
- Typed props with explicit interfaces
- No custom Tailwind styles in pages, only in components
- **NEVER** native `alert()`, `confirm()`, `prompt()` - use shadcn's `AlertDialog`
- **Editing and settings**: Use `Sheet` component (drawer) instead of inline modes or modals. Sheets open from the side and offer better UX on mobile (100% width) and desktop (~400px).

### Preferred UI Patterns

**Sheet (Drawer) for editing**:
```tsx
// ❌ Bad - inline editing that breaks layout
{isEditing ? <EditForm /> : <ViewMode />}

// ✅ Good - Sheet that opens from the side
<Sheet open={isEditing} onOpenChange={setIsEditing}>
  <SheetContent side="right" className="w-full sm:w-[400px]">
    <SheetHeader>
      <SheetTitle>Edit Account</SheetTitle>
    </SheetHeader>
    <EditForm />
  </SheetContent>
</Sheet>
```

**Infinite Scroll for lists**:
```tsx
// Use IntersectionObserver to load more data
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

// In JSX
<div ref={loadMoreRef} className="h-4" /> {/* Trigger element */}
```

### API Routes
- Pattern: `/api/[resource]/route.ts` for CRUD
- Pattern: `/api/[resource]/[id]/route.ts` for single resource operations
- Input validation with early returns
- Always return JSON with appropriate status
- Use Use Cases for complex business logic

### Repositories (Infrastructure Layer)
- All Prisma interaction goes through repositories
- Repositories return domain entities, not Prisma types
- Centralized export via `src/server/repositories/index.ts`

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

## Important Prisma Types

```typescript
enum AccountType {
  CHECKING    // Checking account
  SAVINGS     // Savings
  INVESTMENT  // Investment
  LOAN        // Loan
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

## TanStack Patterns

### TanStack Query (Data Fetching)

**Query Key Factory Pattern** - Always use a factory for cache keys:

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

**Query Hooks** - One hook = one query, explicit naming:

```typescript
// ✅ Good - dedicated hooks
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

**Mutations with Invalidation**:

```typescript
export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionService.create(input),
    onSuccess: () => {
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Invalidate summary too
      queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
    },
  });
}
```

**Optimistic Updates** - For responsive UX:

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

**When to use what**:

| Use Case | TanStack Query | Zustand |
|----------|----------------|---------|
| Server data (fetch/cache) | ✅ | ❌ |
| UI state (modals, sidebar) | ❌ | ✅ |
| Element selection | ❌ | ✅ |
| Local filters | ❌ | ✅ |
| Server-side pagination | ✅ | ❌ |
| Server-side sort/filter | ✅ | ❌ |

**Coexistence** - Both can work together:

```typescript
// Zustand store for UI
const useTransactionUIStore = create((set) => ({
  selectedIds: [],
  isCreateModalOpen: false,
  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((i) => i !== id)
      : [...state.selectedIds, id],
  })),
}));

// Query hook for data
function TransactionList() {
  const { data, isLoading } = useTransactionsQuery();
  const { selectedIds, toggleSelection } = useTransactionUIStore();
  // ...
}
```

### TanStack Table

**Column Definitions** - Strict typing with ColumnDef:

```typescript
import type { ColumnDef } from '@tanstack/react-table';

export function createTransactionColumns(options?: ColumnOptions): ColumnDef<Transaction>[] {
  return [
    // Selection column
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
    // Data column
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
      sortingFn: 'datetime',
    },
    // Column with accessor function
    {
      accessorFn: (row) => row.amount,
      id: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className={cn('text-right', row.original.type === 'income' && 'text-emerald-600')}>
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
  ];
}
```

**Table Instance** - Configure useReactTable:

```typescript
const table = useReactTable({
  data,
  columns,
  state: { sorting, rowSelection, pagination },
  // Handlers (use Updater pattern)
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
  manualPagination: true, // If server-side pagination
  pageCount: totalPages,
});
```

**DataTable Component** - Reusable component in `src/components/ui/data-table.tsx`:

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
  emptyMessage="No transactions found"
/>
```

### TanStack Form

**Form Setup with Valibot**:

TanStack Form supports **Standard Schema** natively - no adapter needed for Valibot v1.0.0+.

```typescript
import { useForm } from '@tanstack/react-form';
import * as v from 'valibot';

const transactionSchema = v.object({
  amount: v.pipe(v.number(), v.minValue(0.01, 'Amount must be positive')),
  description: v.pipe(v.string(), v.minLength(1, 'Description required')),
  date: v.date(),
  categoryId: v.optional(v.string()),
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
      onChange: transactionSchema,  // Direct schema, no adapter needed
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
            <Label htmlFor={field.name}>Amount</Label>
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
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        )}
      />
    </form>
  );
}
```

**Field Info Helper**:

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
        <p className="text-sm text-muted-foreground">Validating...</p>
      )}
    </>
  );
}
```

## Tests

Playwright test account: `fr100828` / `1L0v31000niuM*`

## Charts with Tremor

We use **Tremor** for charts (not Recharts or shadcn/charts). Simple and declarative API.

### Available Components

Our components wrap Tremor in `src/components/charts/`:

```tsx
import { DonutChart, ChartLegend } from '@/components/charts/pie-chart';
import { IncomeExpenseBarChart } from '@/components/charts/bar-chart';
import { PatrimonyAreaChart, InvestmentPerformanceChart } from '@/components/charts/area-chart';
```

### DonutChart Usage

```tsx
const data = [
  { name: 'Food', value: 450, color: '#10b981' },
  { name: 'Transport', value: 200, color: '#3b82f6' },
  { name: 'Leisure', value: 150, color: '#8b5cf6' },
];

<DonutChart data={data} className="h-72" />
<ChartLegend items={data} total={800} />
```

### BarChart Usage

```tsx
const data = [
  { label: 'Jan', income: 3500, expenses: 2800 },
  { label: 'Feb', income: 3200, expenses: 2600 },
];

<IncomeExpenseBarChart data={data} className="h-72" />
```

### AreaChart Usage

```tsx
// Simple patrimony
const data = [
  { date: '2024-01', value: 50000, label: 'Jan' },
  { date: '2024-02', value: 52000, label: 'Feb' },
];

<PatrimonyAreaChart data={data} className="h-72" />

// Investment performance (value vs invested)
const investData = [
  { date: '2024-01', value: 10500, invested: 10000, label: 'Jan' },
  { date: '2024-02', value: 11200, invested: 10500, label: 'Feb' },
];

<InvestmentPerformanceChart data={investData} className="h-72" />
```

### Tremor Colors

Tremor uses predefined color names: `emerald`, `rose`, `indigo`, `slate`, `amber`, `cyan`, etc.

```tsx
<BarChart colors={['emerald', 'rose']} />
```

## Design Guidelines (Vercel Style)

### Visual Principles

The application follows **Vercel Web Interface Guidelines**:

- **Minimalism** - No visual clutter, every element has a purpose
- **Generous whitespace** - Let elements breathe (`space-y-6`, `gap-4`, `p-6`)
- **Subtle borders** - Use `border-border/60` instead of `border-border`
- **Muted colors** - Secondary text in `text-muted-foreground`
- **Clear typographic hierarchy** - Titles in `font-semibold`, descriptions in `text-sm text-muted-foreground`
- **Mobile-first** - Always design for mobile first

### Visual Patterns

```tsx
// ❌ Bad - too many borders, not enough space
<Card className="border p-2">
  <h3 className="font-bold text-lg">Title</h3>
  <p className="text-gray-500">Description</p>
</Card>

// ✅ Good - subtle and airy
<Card className="border-border/60">
  <CardHeader className="pb-4">
    <CardTitle className="text-lg font-medium">Title</CardTitle>
    <p className="text-sm text-muted-foreground">Description</p>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* content */}
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
// Responsive grid
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

// Responsive text
<p className="text-xs sm:text-sm">

// Responsive padding
<div className="p-4 sm:p-6">
```

## Error Handling and Validation

### API Validation (Early Returns)

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

### TanStack Query Error Handling

```tsx
function AccountsList() {
  const { data, isLoading, isError, error } = useAccountsQuery();

  if (isLoading) {
    return <LoadingState message="Loading accounts..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Loading Error"
        message={error?.message || 'An error occurred'}
        onRetry={() => queryClient.invalidateQueries({ queryKey: accountKeys.all })}
      />
    );
  }

  if (!data?.length) {
    return <EmptyState title="No accounts" action={<CreateAccountButton />} />;
  }

  return <AccountsGrid accounts={data} />;
}
```

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Account created successfully');

// Error
toast.error('Failed to create account');

// With action
toast.success('Transaction deleted', {
  action: {
    label: 'Undo',
    onClick: () => undoDelete(),
  },
});

// Loading promise
toast.promise(createAccount(data), {
  loading: 'Creating...',
  success: 'Account created!',
  error: 'Creation failed',
});
```

## Import/Export Patterns

### Barrel Exports (index.ts)

Each feature must have an `index.ts` that exports everything:

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

// Services (if needed client-side)
export { accountService } from './services/account-service';
```

### Imports in Pages

```typescript
// ✅ Good - import from barrel
import { useAccountsQuery, useCreateAccountMutation, type Account } from '@/features/accounts';

// ❌ Bad - direct import from internal files
import { useAccountsQuery } from '@/features/accounts/hooks/use-accounts-query';
import type { Account } from '@/features/accounts/types';
```

### Feature Structure

```
src/features/accounts/
├── hooks/
│   └── use-accounts-query.ts    # TanStack Query hooks
├── services/
│   └── account-service.ts       # API calls (fetch)
├── types/
│   └── index.ts                 # TypeScript types
├── components/                  # (optional) Specific components
│   └── AccountCard.tsx
└── index.ts                     # Barrel export
```

## Commit Conventions

### Format

```
<type>: <short description>

[optional body]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Refactoring without behavior change |
| `chore` | Maintenance tasks (deps, config) |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `test` | Adding/modifying tests |
| `perf` | Performance improvement |

### Examples

```bash
feat: add transaction categorization
fix: resolve duplicate import on CSV upload
refactor: extract AccountCard component
chore: upgrade TanStack Query to v5
docs: update README with setup instructions
```

### Rules

- Message in **English**
- First letter in **lowercase**
- No period at the end
- Present imperative ("add" not "added")
- Max 72 characters for the first line

## Performance

### React Optimizations

**useMemo for expensive calculations**:

```tsx
// ✅ Good - memoize derived calculations
const totalBalance = useMemo(() => {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}, [accounts]);

// ❌ Bad - recalculate on every render
const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
```

**useCallback for handlers passed as props**:

```tsx
// ✅ Good - stable reference
const handleSelect = useCallback((id: string) => {
  setSelectedIds(prev => [...prev, id]);
}, []);

<AccountList onSelect={handleSelect} />
```

**Avoid unnecessary re-renders**:

```tsx
// ❌ Bad - new object on every render
<AccountCard style={{ marginTop: 10 }} />

// ✅ Good - stable object or className
<AccountCard className="mt-2.5" />
```

### Next.js Optimizations

**Dynamic imports for code splitting**:

```tsx
import dynamic from 'next/dynamic';

// Load heavy component only when needed
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // If component uses window/document
});
```

**Image optimization**:

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

**Stale time to avoid unnecessary refetch**:

```typescript
useQuery({
  queryKey: ['banks'],
  queryFn: fetchBanks,
  staleTime: 5 * 60 * 1000, // 5 minutes - data that changes infrequently
});
```

**Placeholder data for instant UX**:

```typescript
useQuery({
  queryKey: accountKeys.detail(id),
  queryFn: () => fetchAccount(id),
  placeholderData: () => {
    // Use data from list if available
    return queryClient
      .getQueryData<Account[]>(accountKeys.lists())
      ?.find(a => a.id === id);
  },
});
```

**Prefetch for anticipated navigation**:

```tsx
function AccountCard({ account }: { account: Account }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch details on hover
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

DevTools are automatically enabled in development. Click the React Query logo in the bottom right to:
- See all queries and their state
- Manually invalidate queries
- View cache

### Prisma Logging

Enable SQL logs in development:

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
// Prefix logs for easy filtering
console.log('[AccountRepository]', 'Creating account:', data);
console.error('[API/accounts]', 'Failed to fetch:', error);

// Use console.table for arrays
console.table(accounts.map(a => ({ id: a.id, name: a.name, balance: a.balance })));
```
