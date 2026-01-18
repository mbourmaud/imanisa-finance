# Testing Strategy

## Vue d'ensemble

| Type | Cible | Outil | Couverture |
|------|-------|-------|------------|
| **Unitaire** | Domain logic | Vitest | 100% du domain/ |
| **Intégration** | API Routes | Vitest + MSW | Routes critiques |
| **Composants** | UI Kit | Testing Library + Snapshots | 100% de ui/ |
| **E2E** | Parcours utilisateur | Playwright | Flows critiques |

---

## 1. Tests Unitaires - Domain Layer

**Cible :** `src/domain/` - Logique métier pure, sans dépendances externes.

### Structure

```
src/domain/
├── entities/
│   ├── Account.ts
│   └── Account.test.ts        # Test unitaire
├── services/
│   ├── BalanceCalculator.ts
│   └── BalanceCalculator.test.ts
└── value-objects/
    ├── Money.ts
    └── Money.test.ts
```

### Exemple : Entity

```typescript
// src/domain/entities/Account.test.ts
import { describe, it, expect } from 'vitest';
import { Account } from './Account';

describe('Account', () => {
  describe('calculateOwnerShare', () => {
    it('should calculate share based on ownership percentage', () => {
      const account = new Account({
        id: '1',
        name: 'Compte Joint',
        balance: 10000,
        ownershipPercentage: 50,
      });

      expect(account.calculateOwnerShare()).toBe(5000);
    });

    it('should return full balance for 100% ownership', () => {
      const account = new Account({
        id: '1',
        name: 'Compte Perso',
        balance: 10000,
        ownershipPercentage: 100,
      });

      expect(account.calculateOwnerShare()).toBe(10000);
    });
  });

  describe('isOverdrawn', () => {
    it('should return true when balance is negative', () => {
      const account = new Account({ id: '1', balance: -100 });
      expect(account.isOverdrawn()).toBe(true);
    });

    it('should return false when balance is positive', () => {
      const account = new Account({ id: '1', balance: 100 });
      expect(account.isOverdrawn()).toBe(false);
    });
  });
});
```

### Exemple : Value Object

```typescript
// src/domain/value-objects/Money.test.ts
import { describe, it, expect } from 'vitest';
import { Money } from './Money';

describe('Money', () => {
  it('should add two money values', () => {
    const a = new Money(100, 'EUR');
    const b = new Money(50, 'EUR');

    expect(a.add(b).amount).toBe(150);
  });

  it('should throw when adding different currencies', () => {
    const eur = new Money(100, 'EUR');
    const usd = new Money(50, 'USD');

    expect(() => eur.add(usd)).toThrow('Cannot add different currencies');
  });

  it('should format correctly', () => {
    const money = new Money(1234.56, 'EUR');
    expect(money.format('fr-FR')).toBe('1 234,56 €');
  });
});
```

### Règles

- **Aucune dépendance externe** (pas de fetch, pas de Prisma)
- **Pas de mocks** - Le domain doit être pur
- **Nommer clairement** les cas de test
- **Tester les edge cases** (0, négatif, null, undefined)

---

## 2. Tests d'Intégration - API Routes

**Cible :** `src/app/api/` - Routes API avec base de données mockée.

### Setup avec MSW

```typescript
// src/tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Exemple : Test API Route

```typescript
// src/app/api/accounts/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock du repository
vi.mock('@/server/repositories', () => ({
  accountRepository: {
    create: vi.fn(),
    findAll: vi.fn(),
  },
}));

// Mock de l'auth
vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(() => ({ id: 'user-1', email: 'test@example.com' })),
}));

import { accountRepository } from '@/server/repositories';

describe('POST /api/accounts', () => {
  it('should create account with valid data', async () => {
    const mockAccount = { id: '1', name: 'Test Account', balance: 0 };
    vi.mocked(accountRepository.create).mockResolvedValue(mockAccount);

    const request = new NextRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Account', type: 'CHECKING' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Test Account');
  });

  it('should return 400 when name is missing', async () => {
    const request = new NextRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ type: 'CHECKING' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Le nom du compte est requis');
  });

  it('should return 401 when not authenticated', async () => {
    const { getUser } = await import('@/lib/auth');
    vi.mocked(getUser).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});

describe('GET /api/accounts', () => {
  it('should return all accounts for user', async () => {
    const mockAccounts = [
      { id: '1', name: 'Account 1' },
      { id: '2', name: 'Account 2' },
    ];
    vi.mocked(accountRepository.findAll).mockResolvedValue(mockAccounts);

    const request = new NextRequest('http://localhost/api/accounts');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
  });
});
```

### Règles

- **Mocker les repositories** (pas la DB directement)
- **Tester tous les status codes** (200, 400, 401, 404, 500)
- **Vérifier les messages d'erreur** en français
- **Tester l'authentification**

---

## 3. Tests Composants - UI Kit (100% couverture)

**Cible :** `src/components/ui/` - Tous les composants shadcn/ui wrappés.

### Structure

```
src/components/ui/
├── button.tsx
├── button.test.tsx       # Test + Snapshot
├── card.tsx
├── card.test.tsx
├── input.tsx
├── input.test.tsx
└── __snapshots__/        # Snapshots générés
    ├── button.test.tsx.snap
    └── card.test.tsx.snap
```

### Exemple : Test Button avec Snapshot

```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  // Snapshot pour chaque variant
  describe('snapshots', () => {
    it('renders default variant', () => {
      const { container } = render(<Button>Click me</Button>);
      expect(container).toMatchSnapshot();
    });

    it('renders destructive variant', () => {
      const { container } = render(
        <Button variant="destructive">Delete</Button>
      );
      expect(container).toMatchSnapshot();
    });

    it('renders outline variant', () => {
      const { container } = render(
        <Button variant="outline">Cancel</Button>
      );
      expect(container).toMatchSnapshot();
    });

    it('renders all sizes', () => {
      const { container } = render(
        <>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </>
      );
      expect(container).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(container).toMatchSnapshot();
    });

    it('renders with icon', () => {
      const { container } = render(
        <Button>
          <span data-testid="icon">+</span>
          Add
        </Button>
      );
      expect(container).toMatchSnapshot();
    });
  });

  // Tests comportementaux
  describe('behavior', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button disabled onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });
});
```

### Exemple : Test Input

```typescript
// src/components/ui/input.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  describe('snapshots', () => {
    it('renders default input', () => {
      const { container } = render(<Input placeholder="Enter text" />);
      expect(container).toMatchSnapshot();
    });

    it('renders all sizes', () => {
      const { container } = render(
        <>
          <Input size="sm" placeholder="Small" />
          <Input size="default" placeholder="Default" />
          <Input size="xl" placeholder="Extra Large" />
        </>
      );
      expect(container).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(<Input disabled placeholder="Disabled" />);
      expect(container).toMatchSnapshot();
    });

    it('renders with error state', () => {
      const { container } = render(
        <Input aria-invalid="true" placeholder="Error" />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Type here" />);

      const input = screen.getByPlaceholderText('Type here');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} />);
      await user.type(screen.getByRole('textbox'), 'test');

      expect(handleChange).toHaveBeenCalled();
    });
  });
});
```

### Règles UI Kit

- **100% des composants testés** - Aucune exception
- **Snapshot pour chaque variant/size** - Détecte les régressions visuelles
- **Tests comportementaux** - onClick, onChange, disabled
- **Mettre à jour les snapshots** avec `vitest -u` après changement intentionnel

---

## 4. Tests E2E - Playwright

**Cible :** Parcours utilisateur critiques.

### Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  use: {
    trace: 'on-first-retry',
  },
});
```

### Exemple : Test Login Flow

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    // Sélectionner un profil
    await page.click('[data-testid="profile-mathieu"]');

    // Attendre la redirection OAuth ou le dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
```

### Exemple : Test CRUD Account

```typescript
// e2e/accounts.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Accounts', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.click('[data-testid="profile-mathieu"]');
    await page.waitForURL(/dashboard/);
  });

  test('should create a new account', async ({ page }) => {
    await page.goto('/dashboard/banks');

    // Ouvrir le formulaire
    await page.click('text=Ajouter un compte');

    // Remplir le formulaire
    await page.fill('[name="name"]', 'Compte Test E2E');
    await page.selectOption('[name="type"]', 'CHECKING');

    // Soumettre
    await page.click('text=Créer');

    // Vérifier le succès
    await expect(page.locator('text=Compte créé')).toBeVisible();
    await expect(page.locator('text=Compte Test E2E')).toBeVisible();
  });

  test('should show error on invalid form', async ({ page }) => {
    await page.goto('/dashboard/banks');
    await page.click('text=Ajouter un compte');

    // Soumettre sans remplir
    await page.click('text=Créer');

    // Vérifier l'erreur
    await expect(page.locator('text=Le nom est requis')).toBeVisible();
  });
});
```

---

## Commandes

```bash
# Tous les tests
npm run test

# Tests unitaires uniquement
npm run test:unit

# Tests avec couverture
npm run test:coverage

# Mettre à jour les snapshots
npm run test -- -u

# Tests E2E
npm run test:e2e

# Tests E2E en mode UI
npm run test:e2e:ui
```

---

## Structure finale

```
src/
├── domain/
│   ├── entities/
│   │   ├── Account.ts
│   │   └── Account.test.ts      # Unitaire
│   └── services/
│       ├── BalanceCalculator.ts
│       └── BalanceCalculator.test.ts
├── app/api/
│   └── accounts/
│       ├── route.ts
│       └── route.test.ts        # Intégration
├── components/ui/
│   ├── button.tsx
│   ├── button.test.tsx          # Snapshot + Behavior
│   └── __snapshots__/
└── tests/
    ├── setup.ts                 # Config globale
    └── mocks/
        └── handlers.ts          # MSW handlers

e2e/
├── auth.spec.ts                 # E2E
├── accounts.spec.ts
└── transactions.spec.ts
```

---

## Objectifs de couverture

| Cible | Couverture min |
|-------|---------------|
| `src/domain/` | **100%** |
| `src/components/ui/` | **100%** |
| `src/app/api/` | **80%** |
| Global | **70%** |
