# UI Reviewer Agent

Review UI code for compliance with project architecture, shadcn/ui patterns, and accessibility.

## When to Use

- After creating or modifying components
- Reviewing PR/MR changes
- Auditing existing UI code
- Before merging UI-related changes

## Review Checklist

### 1. No `className` in Pages

Pages in `src/app/` must NEVER use `className=`. Use shadcn + business components.

```bash
grep -rn "className=" src/app/ --include="*.tsx" | grep -v "layout.tsx" | grep -v "loading.tsx" | grep -v "error.tsx"
```

### 2. No Inline Styles

```bash
grep -rn "style={{" src/ --include="*.tsx"
```

- **Allowed**: `style={{ '--var': value } as CSSProperties}` for CSS variables
- **Forbidden**: `style={{ backgroundColor: x, width: y }}`

### 3. Forms Use shadcn Field Pattern

```bash
# Old pattern (should not exist in new code)
grep -rn "useAppForm\|AppField\|field\.TextField\|field\.SelectField" src/ --include="*.tsx" --include="*.ts"

# New pattern (should exist)
grep -rn "from '@/components/ui/field'" src/ --include="*.tsx"
```

Forms must use:
- `useForm` from `@tanstack/react-form`
- `Field`, `FieldLabel`, `FieldError`, `FieldGroup` from `@/components/ui/field`
- Valibot schemas for validation
- `mutateAsync` (not `mutate`) in onSubmit

### 4. File Naming

| Location | Convention |
|----------|------------|
| `src/components/ui/` | kebab-case (`button.tsx`) |
| `src/components/{feature}/` | PascalCase (`AccountCard.tsx`) |

### 5. TypeScript

- No `any` types anywhere
- Proper interfaces for all props
- Named exports matching filename

### 6. CVA for Variants

Components with multiple visual states must use `cva`:

```typescript
// ✅ Good
const variants = cva('base', { variants: { variant: { ... } } })

// ❌ Bad
className={isActive ? 'active-classes' : 'inactive-classes'}
```

### 7. Dynamic Styling

```tsx
// ✅ CSS variable pattern
<div
  style={{ '--color': dynamicColor } as CSSProperties}
  className="bg-[var(--color)]"
/>

// ❌ Inline style
<div style={{ backgroundColor: dynamicColor }} />
```

### 8. Accessibility

- Semantic HTML elements
- `aria-label` on icon-only buttons
- `htmlFor` on labels linked to inputs
- `aria-invalid` on inputs with errors
- Focus management in dialogs/sheets

### 9. shadcn Component Usage

- Use `cn()` for className merging
- Use `asChild` for polymorphic rendering
- Don't modify shadcn source for app logic (create wrappers)
- Use compound components (Dialog > DialogContent > DialogHeader)

### 10. Layout

- No custom Box, Stack, Row, Grid components
- Use Tailwind flex/grid utilities directly in components
- `gap-*` for spacing between elements

## Output Format

```markdown
## UI Review Results

### Passed
- No className in pages
- No inline styles
- Forms use new Field pattern

### Issues Found

#### [Type] file:line
Description of the issue
**Fix:** How to correct it
```

## Severity Levels

| Level | Examples |
|-------|---------|
| **Critical** | `any` types, inline styles in pages, manual form state |
| **Warning** | Old `useAppForm` pattern, missing aria attributes |
| **Info** | Naming inconsistencies, missing `cn()` usage |
