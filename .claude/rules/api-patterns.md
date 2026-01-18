# API & Backend Patterns

## Architecture Overview

```
src/
├── app/api/             # API Routes (Interface layer)
├── domain/              # Domain layer (pure business logic)
│   ├── entities/        # Business entities
│   ├── value-objects/   # Value objects
│   └── services/        # Domain services
├── features/            # Application layer (use cases, hooks)
└── server/repositories/ # Infrastructure layer (Prisma)
```

### Layers and Responsibilities

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| **Domain** | Pure business logic | `Transaction`, `Account`, balance calculations |
| **Application** | Use cases, orchestration | `ImportTransactionsUseCase` |
| **Infrastructure** | Data access | Prisma repositories |
| **Interface** | UI, API routes | Next.js pages, API routes |

## API Routes

- Pattern: `/api/[resource]/route.ts` for CRUD
- Pattern: `/api/[resource]/[id]/route.ts` for single resource

### API Validation (Early Returns)

```typescript
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

## Repositories (Infrastructure Layer)

- All Prisma interaction goes through repositories
- Repositories return domain entities, not Prisma types
- Centralized export via `src/server/repositories/index.ts`

## Use Cases (Application Layer)

```typescript
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

## Feature Structure

```
src/features/accounts/
├── hooks/
│   └── use-accounts-query.ts    # TanStack Query hooks
├── services/
│   └── account-service.ts       # API calls (fetch)
├── forms/
│   └── account-form-schema.ts   # Valibot schemas
├── components/
│   └── AccountFormSheet.tsx     # Feature components
└── index.ts                     # Barrel export
```

## Error Handling

### Toast Notifications

```tsx
import { toast } from 'sonner';

toast.success('Account created successfully');
toast.error('Failed to create account');

toast.promise(createAccount(data), {
  loading: 'Creating...',
  success: 'Account created!',
  error: 'Creation failed',
});
```

### TanStack Query Error Handling

```tsx
const { data, isLoading, isError, error } = useAccountsQuery();

if (isLoading) return <LoadingState />;
if (isError) return <ErrorState message={error?.message} />;
if (!data?.length) return <EmptyState />;

return <AccountsGrid accounts={data} />;
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

## Key Domain Concepts

### Members vs Users
- **Member**: Household member - may or may not have an account
- **User**: Supabase Auth account - optionally linked to a Member

### Supported Banks
Banks are **constants** in `src/shared/constants/supported-banks.ts`, not database entities.

### Accounts and Holders
- An account can have multiple holders (AccountMember junction table)
- Each holder has an ownership percentage (ownerShare)

### Transactions and Deduplication
- CSV import with deduplication via unique constraint `[accountId, date, amount, description]`
