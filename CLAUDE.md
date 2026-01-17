# Imanisa Finance

Application de gestion financière familiale pour suivre les comptes bancaires, transactions, investissements et patrimoine immobilier.

## Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict, no ANY)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React hooks (useState, useEffect, useCallback)

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

## Tests

Compte de test Playwright: `fr100828` / `1L0v31000niuM*`
