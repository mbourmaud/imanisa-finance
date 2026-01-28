# UI Reviewer Agent

Review UI code for compliance with project architecture rules.

## Trigger

Use this agent when:
- Reviewing PR/MR changes to components
- Auditing existing UI code
- Before merging UI-related changes

## Checklist

### 1. No className in Pages

```bash
# Check for violations
grep -rn "className=" src/app/ --include="*.tsx" | grep -v "layout.tsx"
```

Pages in `src/app/` must NEVER use `className=`. Use shadcn + business components.

### 2. No Inline Styles

```bash
# Check for style={{}} violations
grep -rn "style={{" src/ --include="*.tsx" | grep -v "as.*CSSProperties"
```

**Allowed:** `style={{ '--var': value } as CSSProperties}` for CSS variables
**Forbidden:** `style={{ backgroundColor: x, width: y }}`

### 3. Correct File Naming

| Location | Convention |
|----------|------------|
| `src/components/ui/` | kebab-case (`button.tsx`) |
| `src/components/[feature]/` | PascalCase (`AccountCard.tsx`) |

### 4. No Lucide Re-exports

```bash
# Icons should be imported directly from lucide-react
grep -rn "from.*components/ui/icon" src/
```

Use `import { Plus } from 'lucide-react'` directly.

### 5. No Custom Layout Primitives

```bash
# Check for forbidden components
grep -rn "import.*Flex\|import.*Stack\|import.*Box\|import.*Grid" src/
```

Use Tailwind classes directly: `flex gap-4 items-center`

### 6. CVA for Variants

Components with variants must use `cva`:

```typescript
// ✅ Good
const buttonVariants = cva('base-classes', { variants: {...} })

// ❌ Bad
className={isActive ? 'active-classes' : 'inactive-classes'}
```

### 7. Proper Dynamic Styling

```tsx
// ✅ Correct - CSS variable
<div
  style={{ '--color': dynamicColor } as CSSProperties}
  className="bg-[var(--color)]"
/>

// ❌ Wrong - Inline style
<div style={{ backgroundColor: dynamicColor }} />
```

## Output Format

```markdown
## UI Review Results

### ✅ Passed
- No className in pages
- No inline styles

### ❌ Violations Found

#### style={{}} in src/components/accounts/MemberChip.tsx:36
```tsx
style={{ backgroundColor: memberColor }}
```
**Fix:** Use CSS variable pattern

#### className in src/app/dashboard/page.tsx:15
```tsx
<div className="flex gap-4">
```
**Fix:** Extract to component or use existing shadcn component
```

## Commands

```bash
# Run full audit
npm run lint:ui

# Check specific patterns
grep -rn "style={{" src/ --include="*.tsx"
grep -rn "className=" src/app/ --include="*.tsx"
```
