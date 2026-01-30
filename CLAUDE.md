# Imanisa Finance

Family financial management application for tracking bank accounts, transactions, investments, and real estate assets.

## Quick Reference

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # ESLint + Biome
npx prisma studio    # Database GUI
npx prisma generate  # Regenerate Prisma client
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict, **no ANY**)
- **Database**: PostgreSQL via Supabase + Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (server) + Zustand (client)
- **Forms**: TanStack Form + Valibot validation
- **Tables**: TanStack Table
- **Charts**: Tremor

## Architecture

```
src/
├── app/                    # Next.js App Router (pages, API routes)
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── common/            # Generic reusable components
│   └── [feature]/         # Feature-specific components
├── domain/                # Domain layer (entities, services)
├── features/              # Application layer (hooks, forms, use cases)
├── lib/                   # Shared utilities
├── server/repositories/   # Infrastructure layer (Prisma)
└── shared/                # Constants, utils
```

## Critical Rules

### Security (PUBLIC REPO!)
- **NEVER commit** `.env`, `.ralph/`, credentials, real data
- See `.claude/rules/security.md` for details

### UI Architecture
- **Zero className in pages** - Use shadcn + business components
- **Zero style={{}} anywhere** - Use Tailwind classes or CSS variables
- **Tailwind flex/grid** for layout - No custom Box, Stack, Row, Grid
- className allowed ONLY in `src/components/`
- See `.claude/rules/ui-architecture.md` for details

### Forms (TanStack Form + shadcn Field + Valibot)
- **ALWAYS use `useForm`** from `@tanstack/react-form` - No manual useState
- **ALWAYS use shadcn `Field` components** - `Field`, `FieldLabel`, `FieldError`, `FieldGroup`
- Always use `mutateAsync` (not `mutate`) in onSubmit
- Valibot schemas in separate files, messages in French
- **Old `useAppForm` pattern is deprecated** - Migrate to new pattern
- See `.claude/rules/tanstack.md` for patterns

### State Management
- **TanStack Query** for server data (API responses, mutations)
- **Zustand** for client-only state (UI, selection, preferences)
- **NEVER use Zustand for server data** - Use Query instead
- **Stores location**: `src/shared/stores/` for global UI state
- See `.claude/rules/zustand.md` for patterns

### Error Handling
- Messages d'erreur **toujours en français** et compréhensibles
- Jamais d'erreur technique exposée à l'utilisateur
- Utiliser `getErrorMessage()` pour extraire les messages
- See `.claude/rules/error-handling.md` for patterns

### Testing
- **Domain** : 100% couverture, tests unitaires purs
- **UI Kit** : 100% couverture, snapshots + comportement
- **API** : Tests d'intégration avec mocks
- **E2E** : Playwright pour les parcours critiques
- See `.claude/rules/testing.md` for patterns

### Code Style
- Tabs, single quotes, no semicolons
- French for UI, English for code
- Named exports matching filename
- See `.claude/rules/code-style.md` for details

## Detailed Documentation

All detailed patterns and examples are in `.claude/rules/`:

| File | Content |
|------|---------|
| `security.md` | Security rules for public repo |
| `ui-architecture.md` | shadcn/ui patterns, layout, Field components |
| `tanstack.md` | Query, Form (shadcn Field pattern), Table + Valibot |
| `zustand.md` | Client state management, when to use |
| `error-handling.md` | Messages FR, toast, ErrorState |
| `testing.md` | Unit, integration, snapshots, E2E |
| `code-style.md` | Naming, imports, commits |
| `api-patterns.md` | Routes, repositories, use cases |
| `performance.md` | React, Next.js, Query optimizations |
| `nextjs-patterns.md` | Server/Client components, caching, streaming |
| `shadcn-patterns.md` | CVA, composition, slot, accessibility |
| `tailwind-v4.md` | @theme, OKLCH, dynamic values, @utility |

## Agents & Skills

| Agent/Skill | Purpose |
|-------------|---------|
| `agents/form-creator.md` | Create forms (TanStack Form + shadcn Field + Valibot) |
| `agents/component-creator.md` | Create React components following patterns |
| `agents/ui-reviewer.md` | Review UI code for architecture compliance |
| `skills/form-scaffold.md` | Generate complete form files for an entity |
| `skills/ui-audit.md` | Audit codebase for UI violations |
| `skills/add-shadcn.md` | Install and configure shadcn components |
