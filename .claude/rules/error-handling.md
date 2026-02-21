# Error Handling - Restituer des erreurs propres

## Principe Fondamental

**L'utilisateur doit TOUJOURS comprendre ce qui s'est passé et quoi faire.**

```tsx
// ❌ JAMAIS - Erreur technique incompréhensible
toast.error("TypeError: Cannot read property 'id' of undefined");
toast.error("Failed to fetch");
toast.error("500 Internal Server Error");

// ✅ TOUJOURS - Message clair et actionnable
toast.error("Impossible de charger vos comptes. Vérifiez votre connexion.");
toast.error("Ce compte n'existe plus. Il a peut-être été supprimé.");
toast.error("Une erreur serveur est survenue. Réessayez dans quelques instants.");
```

---

## Utilitaire Central : getErrorMessage

```typescript
// src/shared/utils/error.ts
export function getErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue'
): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return fallback;
}
```

**Usage :**
```typescript
try {
  await createAccount(data);
} catch (error) {
  toast.error(getErrorMessage(error, "Impossible de créer le compte"));
}
```

---

## Erreurs API (Backend)

### Structure de réponse d'erreur

```typescript
// Toujours retourner un objet avec `error` et optionnellement `details`
return NextResponse.json(
  {
    error: "Message lisible par l'utilisateur",
    details: "Détails techniques pour le debug" // optionnel
  },
  { status: 400 }
);
```

### Codes HTTP et messages

| Code | Quand | Message type |
|------|-------|--------------|
| 400 | Validation échouée | "Le nom du compte est requis" |
| 401 | Non authentifié | "Veuillez vous reconnecter" |
| 403 | Non autorisé | "Vous n'avez pas accès à cette ressource" |
| 404 | Ressource introuvable | "Ce compte n'existe pas" |
| 409 | Conflit (doublon) | "Un compte avec ce nom existe déjà" |
| 500 | Erreur serveur | "Une erreur serveur est survenue" |

### Pattern API Route

```typescript
// src/app/api/accounts/route.ts
export async function POST(request: Request) {
  // 1. Auth
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Veuillez vous reconnecter" },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: CreateAccountInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Données invalides" },
      { status: 400 }
    );
  }

  // 3. Validation métier
  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "Le nom du compte est requis" },
      { status: 400 }
    );
  }

  // 4. Exécution
  try {
    const account = await accountRepository.create(body);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('[API/accounts] Create failed:', error);

    // Erreur Prisma connue (doublon)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Un compte avec ce nom existe déjà" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Impossible de créer le compte" },
      { status: 500 }
    );
  }
}
```

---

## Erreurs Frontend (TanStack Query)

### Dans les mutations

```typescript
export function useCreateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAccountInput) => {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // Propager le message d'erreur de l'API
        throw new Error(data.error || 'Impossible de créer le compte');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      toast.success('Compte créé avec succès');
    },
    onError: (error) => {
      // Le message est déjà propre grâce au throw ci-dessus
      toast.error(getErrorMessage(error));
    },
  });
}
```

### Dans les composants

```tsx
function AccountsList() {
  const { data, isLoading, isError, error, refetch } = useAccountsQuery();

  if (isLoading) {
    return <LoadingState message="Chargement des comptes..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Impossible de charger les comptes"
        message={getErrorMessage(error, "Vérifiez votre connexion")}
        action={
          <Button onClick={() => refetch()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="Aucun compte"
        description="Commencez par ajouter votre premier compte bancaire"
        action={<CreateAccountButton />}
      />
    );
  }

  return <AccountsGrid accounts={data} />;
}
```

---

## Erreurs Formulaires (TanStack Form + Valibot)

### Messages Valibot en français

```typescript
import * as v from 'valibot';

export const accountFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Le nom est requis'),
    v.maxLength(100, 'Le nom ne peut pas dépasser 100 caractères')
  ),
  email: v.pipe(
    v.string(),
    v.email('Adresse email invalide')
  ),
  balance: v.pipe(
    v.number(),
    v.minValue(0, 'Le solde ne peut pas être négatif')
  ),
});
```

### Affichage des erreurs de champ

Use the shadcn `FieldError` component from `@/components/ui/field`:

```tsx
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

<form.Field
  name="name"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor="name">Nom</FieldLabel>
        <Input id="name" value={field.state.value} ... />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
/>
```

### Erreur globale de formulaire

```tsx
function AccountForm() {
  const mutation = useCreateAccountMutation();
  const form = useForm({
    defaultValues: { name: '' },
    validators: { onSubmit: accountFormSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      {/* Erreur globale (mutation failed) */}
      {mutation.isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {getErrorMessage(mutation.error)}
          </AlertDescription>
        </Alert>
      )}

      {/* Champs avec shadcn Field */}
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="name">Nom</FieldLabel>
              <Input
                id="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
    </form>
  );
}
```

---

## Toast Notifications

### Patterns standards

```typescript
import { toast } from 'sonner';

// Succès simple
toast.success('Compte créé avec succès');

// Erreur simple
toast.error('Impossible de supprimer le compte');

// Avec action (undo)
toast.success('Transaction supprimée', {
  action: {
    label: 'Annuler',
    onClick: () => restoreTransaction(id),
  },
});

// Promise (loading → success/error)
toast.promise(deleteAccount(id), {
  loading: 'Suppression en cours...',
  success: 'Compte supprimé',
  error: (err) => getErrorMessage(err, 'Échec de la suppression'),
});
```

### Règles

- **Succès** : Court, confirme l'action ("Compte créé")
- **Erreur** : Explique le problème + solution si possible
- **Pas de jargon technique** : "Erreur réseau" pas "ECONNREFUSED"
- **Français** pour tous les messages utilisateur

---

## Composants d'état

### ErrorState

```tsx
// src/components/common/ErrorState.tsx
interface ErrorStateProps {
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function ErrorState({ title, message, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground mt-2">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

### EmptyState

```tsx
// src/components/common/EmptyState.tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

---

## Logging (Debug uniquement)

```typescript
// Préfixer les logs pour filtrage facile
console.error('[API/accounts]', 'Create failed:', error);
console.error('[AccountRepository]', 'Query failed:', error);

// En production, utiliser un service de logging (Sentry, etc.)
if (process.env.NODE_ENV === 'production') {
  // captureException(error);
}
```

---

## Checklist Error Handling

- [ ] Tous les messages d'erreur sont en **français**
- [ ] Aucun message technique exposé à l'utilisateur
- [ ] Chaque erreur explique **quoi faire** (réessayer, vérifier, contacter)
- [ ] Les erreurs API retournent `{ error: "message" }`
- [ ] Les mutations utilisent `onError` avec `toast.error`
- [ ] Les queries ont un fallback `<ErrorState />`
- [ ] Les formulaires affichent les erreurs de validation inline
- [ ] Les erreurs serveur sont loggées avec contexte
