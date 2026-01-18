# Code Style & Conventions

## Formatting

- **Tabs** for indentation
- **Single quotes** for strings
- **No semicolons** at end of line (per config)
- **French** for UI text, **English** for code
- **Explicit and descriptive names** (no abbreviations)

## Clean Code Principles

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
- **No ANY in TypeScript** - Always use proper types

## Component Naming Convention

**File name = Export name**

```tsx
// ✅ Good - Card.tsx exports Card
export function Card({ children }: CardProps) { ... }

// ❌ Bad - Card.tsx exports something else
export function MyCard() { ... }
export default function SomeCard() { ... }
```

**Rules:**
- Use **named exports** (not default exports)
- The primary export must match the filename exactly

## File Naming Convention

| Location | Convention | Examples |
|----------|------------|----------|
| `src/components/ui/` | **kebab-case** | `button.tsx`, `dropdown-menu.tsx` |
| `src/features/` | **PascalCase** | `AccountCard.tsx`, `BankList.tsx` |
| `src/components/[feature]/` | **PascalCase** | `TransactionRow.tsx` |

**Why?** shadcn uses kebab-case → allows `npx shadcn@latest add` without renaming

## Import/Export Patterns

### Barrel Exports (index.ts)

Each feature must have an `index.ts` that exports everything:

```typescript
// src/features/accounts/index.ts
export {
  accountKeys,
  useAccountsQuery,
  useCreateAccountMutation,
} from './hooks/use-accounts-query';

export type { Account, CreateAccountInput } from './types';
```

### Imports in Pages

```typescript
// ✅ Good - import from barrel
import { useAccountsQuery, type Account } from '@/features/accounts';

// ❌ Bad - direct import from internal files
import { useAccountsQuery } from '@/features/accounts/hooks/use-accounts-query';
```

## Commit Conventions

### Format

```
<type>: <short description>
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Refactoring without behavior change |
| `chore` | Maintenance tasks (deps, config) |
| `docs` | Documentation only |

### Rules

- Message in **English**
- First letter in **lowercase**
- No period at the end
- Present imperative ("add" not "added")
- Max 72 characters

### Examples

```bash
feat: add transaction categorization
fix: resolve duplicate import on CSV upload
refactor: extract AccountCard component
```
