# Imanisa Finance

Application de gestion financière familiale - suivi des comptes bancaires, transactions, budget, immobilier et investissements.

## Stack Technique

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Base de données**: PostgreSQL (Supabase)
- **ORM**: Prisma 6
- **UI**: Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query (server state), Zustand (UI state)
- **Tables**: TanStack Table
- **Auth**: Supabase Auth (Google OAuth)
- **Linting**: Biome

## Architecture

```
src/
├── app/                    # Next.js App Router (pages, API routes)
├── components/             # UI components (shadcn/ui)
├── features/               # Feature modules (accounts, imports, members, etc.)
│   └── [feature]/
│       ├── hooks/          # TanStack Query hooks
│       ├── types/          # TypeScript types
│       └── index.ts        # Barrel exports
├── lib/                    # Utilities (prisma, supabase, auth)
├── server/                 # Server-side code
│   └── repositories/       # Data access layer (Prisma)
└── shared/                 # Shared utilities and constants
```

## Getting Started

### Prérequis

- Node.js 22+
- PostgreSQL (ou compte Supabase)

### Installation

```bash
npm install
```

### Configuration

Créer un fichier `.env` avec :

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Base de données

```bash
npx prisma db push
npx prisma generate
```

### Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

## Fonctionnalités

- **Comptes bancaires** - Gestion multi-comptes avec support multi-propriétaires
- **Transactions** - Import CSV avec déduplication, catégorisation
- **Budget** - Suivi des dépenses par catégorie
- **Immobilier** - Gestion des biens, prêts, assurances, charges
- **Investissements** - Suivi du portefeuille
