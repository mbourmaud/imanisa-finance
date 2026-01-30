# Form Scaffold Skill

Generate a complete TanStack Form + shadcn/ui form for a given entity.

## Usage

```
/form-scaffold [entity-name] [fields]
```

Examples:
```
/form-scaffold account name,type,balance
/form-scaffold member name,email,role
/form-scaffold transaction date,amount,description,category
```

## What It Generates

### 1. Valibot Schema

File: `src/features/{entity}/forms/{entity}-form-schema.ts`

```typescript
import * as v from 'valibot'

export const {entity}FormSchema = v.object({
  // Fields based on input
})

export type {Entity}FormValues = v.InferOutput<typeof {entity}FormSchema>
```

### 2. Form Component

File: `src/features/{entity}/components/{Entity}FormSheet.tsx`

Uses the official shadcn/ui + TanStack Form pattern:
- `useForm` from `@tanstack/react-form`
- `Field`, `FieldLabel`, `FieldError`, `FieldGroup` from `@/components/ui/field`
- Standard shadcn input components (`Input`, `Select`, `Checkbox`, etc.)
- Valibot schema for validation
- `mutateAsync` for submission

## Field Type Mapping

| Field hint | Valibot type | shadcn component |
|------------|-------------|-----------------|
| `name`, `title`, `description` | `v.pipe(v.string(), v.minLength(1))` | `Input` |
| `email` | `v.pipe(v.string(), v.email())` | `Input` type="email" |
| `amount`, `balance`, `price` | `v.number()` | `Input` type="number" |
| `date` | `v.string()` | `Input` type="date" |
| `type`, `status`, `category` | `v.picklist([...])` | `Select` |
| `active`, `enabled` | `v.boolean()` | `Switch` |
| `notes`, `comment` | `v.optional(v.string())` | `Textarea` |

## Validation Messages (French)

```typescript
v.minLength(1, 'Ce champ est requis')
v.email('Adresse email invalide')
v.minValue(0, 'Le montant ne peut pas être négatif')
v.maxLength(100, 'Maximum 100 caractères')
```

## After Generation

1. Verify the schema matches the API/Prisma model
2. Add the mutation hook if it doesn't exist
3. Wire up the form in the feature's page
4. Test form validation
