# Performance Optimizations

## React Optimizations

### useMemo for expensive calculations

```tsx
// ✅ Good - memoize derived calculations
const totalBalance = useMemo(() => {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}, [accounts]);

// ❌ Bad - recalculate on every render
const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
```

### useCallback for handlers passed as props

```tsx
// ✅ Good - stable reference
const handleSelect = useCallback((id: string) => {
  setSelectedIds(prev => [...prev, id]);
}, []);

<AccountList onSelect={handleSelect} />
```

### Avoid unnecessary re-renders

```tsx
// ❌ Bad - new object on every render
<AccountCard style={{ marginTop: 10 }} />

// ✅ Good - stable object or className
<AccountCard className="mt-2.5" />
```

## Next.js Optimizations

### Dynamic imports for code splitting

```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

### Image optimization

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

## TanStack Query Optimizations

### Stale time to avoid unnecessary refetch

```typescript
useQuery({
  queryKey: ['banks'],
  queryFn: fetchBanks,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Placeholder data for instant UX

```typescript
useQuery({
  queryKey: accountKeys.detail(id),
  queryFn: () => fetchAccount(id),
  placeholderData: () => {
    return queryClient
      .getQueryData<Account[]>(accountKeys.lists())
      ?.find(a => a.id === id);
  },
});
```

### Prefetch for anticipated navigation

```tsx
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: accountKeys.detail(account.id),
    queryFn: () => fetchAccount(account.id),
  });
};

<Link href={`/accounts/${id}`} onMouseEnter={handleMouseEnter}>
```

## Debugging

### TanStack Query DevTools

DevTools are automatically enabled in development. Click the React Query logo to:
- See all queries and their state
- Manually invalidate queries
- View cache

### Prisma Logging

```typescript
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
console.table(accounts.map(a => ({ id: a.id, name: a.name })));
```
