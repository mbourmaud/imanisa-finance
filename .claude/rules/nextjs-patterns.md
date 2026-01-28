# Next.js 16 App Router Best Practices

## Server vs Client Components

### Default Rule

**Everything is a Server Component by default.** Add `'use client'` only when necessary.

| Server Components | Client Components |
|-------------------|-------------------|
| Data fetching from DB/API | Interactive UI (buttons, forms) |
| Static content | Browser APIs (localStorage) |
| SEO-critical elements | Event handlers (onClick) |
| Backend resources | React hooks (useState, useEffect) |
| Sensitive data (API keys) | Third-party client libraries |

### Component Composition Pattern

```tsx
// ✅ Server Component (default) - fetches data
async function AccountsPage() {
  const accounts = await prisma.account.findMany()

  return (
    <div>
      <AccountsList accounts={accounts} />
      <AddAccountButton />  {/* Client Component */}
    </div>
  )
}

// ✅ Client Component - only for interactivity
'use client'
function AddAccountButton() {
  const [isOpen, setIsOpen] = useState(false)
  return <Button onClick={() => setIsOpen(true)}>Add</Button>
}
```

### Critical Rules

1. **Move Client Components to leaf nodes** - Keep them small at the edges
2. **`'use client'` marks the boundary** - Everything imported becomes client-side
3. **Pass Server Components as children** - They won't be converted
4. **Props must be serializable** - No functions, only data

---

## Data Fetching

### In Server Components (Direct)

```tsx
// No useEffect, no useState needed!
async function AccountsPage() {
  const accounts = await prisma.account.findMany()
  return <AccountsList accounts={accounts} />
}
```

### Server Actions (Mutations)

```tsx
// actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createAccount(formData: FormData) {
  const name = formData.get('name') as string

  await prisma.account.create({ data: { name } })

  revalidatePath('/accounts')
}

// Component
export function CreateAccountForm() {
  return (
    <form action={createAccount}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

### TanStack Query Integration

```tsx
// Server Component with prefetch
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

export default async function AccountsPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountsList />  {/* Client Component using useQuery */}
    </HydrationBoundary>
  )
}
```

---

## Streaming & Suspense

### Route-Level Loading

```tsx
// app/accounts/loading.tsx
export default function Loading() {
  return <AccountsSkeleton />
}
```

### Granular Suspense

```tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <>
      {/* Static shell renders immediately */}
      <Header />
      <Sidebar />

      {/* Dynamic content streams in parallel */}
      <Suspense fallback={<AccountsSkeleton />}>
        <AccountsSection />
      </Suspense>

      <Suspense fallback={<TransactionsSkeleton />}>
        <RecentTransactions />
      </Suspense>
    </>
  )
}
```

---

## Cache Components (Next.js 16)

```tsx
// Opt-in caching with 'use cache'
async function CachedAccounts() {
  'use cache'

  const accounts = await prisma.account.findMany()
  return <AccountsGrid accounts={accounts} />
}

// Configure cache behavior
import { cacheLife, cacheTag } from 'next/cache'

async function AccountDetails({ id }: { id: string }) {
  'use cache'
  cacheLife('hours')
  cacheTag(`account-${id}`)

  const account = await fetchAccount(id)
  return <AccountCard account={account} />
}
```

---

## Route Parameters (TypeScript)

```tsx
// app/accounts/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function AccountPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { tab } = await searchParams

  const account = await fetchAccount(id)
  return <AccountDetails account={account} activeTab={tab} />
}
```

---

## Anti-Patterns to Avoid

### 1. Context in Server Components

```tsx
// ❌ WRONG - Context doesn't work in Server Components
export default function ServerPage() {
  const user = useContext(UserContext)  // Will fail!
}

// ✅ CORRECT - Fetch on server
export default async function ServerPage() {
  const user = await getUser()
}
```

### 2. Unnecessary Client Components

```tsx
// ❌ WRONG - No interactivity needed
'use client'
export function StaticHeader() {
  return <header>My App</header>
}

// ✅ CORRECT - Keep as Server Component
export function StaticHeader() {
  return <header>My App</header>
}
```

### 3. Data Waterfalls

```tsx
// ❌ WRONG - Sequential fetches
async function Dashboard() {
  const user = await fetchUser()
  const accounts = await fetchAccounts(user.id)  // Waits for user
}

// ✅ CORRECT - Parallel fetches
async function Dashboard() {
  const [user, accounts] = await Promise.all([
    fetchUser(),
    fetchAccounts(),
  ])
}

// ✅ BETTER - Streaming with Suspense
function Dashboard() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>
      <Suspense fallback={<AccountsSkeleton />}>
        <AccountsSection />
      </Suspense>
    </>
  )
}
```

### 4. Everything in app/

```
// ❌ WRONG
app/
├── components/
├── hooks/
├── utils/

// ✅ CORRECT
src/
├── app/           # Only routes
├── components/
├── lib/
├── features/
```

---

## File Structure

```
src/
├── app/                    # ONLY routes and layouts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/             # Route group
│   ├── (dashboard)/        # Route group
│   └── api/                # Route Handlers
├── components/
│   ├── ui/                 # shadcn base (kebab-case)
│   └── [feature]/          # Feature components (PascalCase)
├── features/               # Feature modules
├── lib/                    # Utilities
├── domain/                 # Business logic
└── server/                 # Server-only code
```

### Special Files

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI |
| `layout.tsx` | Shared UI (persists) |
| `loading.tsx` | Loading state |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint |

---

## Turbopack (Default in v16)

```bash
# Default behavior
npm run dev  # Uses Turbopack

# Opt-out if needed
next dev --webpack
```

Benefits:
- 2-5x faster production builds
- 10x faster Fast Refresh
- Zero configuration for common use cases
