# UI Audit Skill

Audit the codebase for UI architecture violations.

## Usage

```
/ui-audit
```

## What It Checks

### 1. `className` in Pages

Pages in `src/app/` must not use `className=`:

```bash
grep -rn "className=" src/app/ --include="*.tsx" | grep -v "layout.tsx" | grep -v "loading.tsx" | grep -v "error.tsx" | grep -v "not-found.tsx"
```

### 2. Inline Styles

```bash
grep -rn "style={{" src/ --include="*.tsx"
```

Filter results:
- `style={{ '--var': value } as CSSProperties}` = OK (CSS variable)
- `style={{ backgroundColor: x }}` = VIOLATION

### 3. Form Pattern

```bash
# Verify all forms use the correct pattern
grep -rn "from '@/components/ui/field'" src/ --include="*.tsx"
```

All forms must use:
- `useForm` from `@tanstack/react-form`
- `Field`, `FieldLabel`, `FieldError` from `@/components/ui/field`

### 4. Manual Form State

```bash
# Forms using useState instead of TanStack Form
grep -rn "useState.*form\|useState.*errors\|setErrors\|setFormData" src/ --include="*.tsx"
```

### 5. TypeScript `any`

```bash
grep -rn ": any\|as any\|<any>" src/ --include="*.ts" --include="*.tsx"
```

### 6. File Naming

```bash
# ui/ should be kebab-case
ls src/components/ui/*.tsx | xargs -I {} basename {} | grep -E "^[A-Z]"

# feature/ should be PascalCase
find src/components -type f -name "*.tsx" -not -path "*/ui/*" -not -path "*/__tests__/*" | xargs -I {} basename {} | grep -E "^[a-z]"
```

### 7. Icon Imports

```bash
# Should import from lucide-react directly
grep -rn "from.*components/ui/icon" src/ --include="*.tsx"
```

## Output Format

```markdown
# UI Audit Report

## Summary
- Total violations: X
- Critical: X (any, inline styles, manual forms)
- Warning: X (old patterns, naming)
- Info: X (suggestions)

## Critical

### [Type] file:line
Description
**Fix:** How to correct

## Warning

### [Type] file:line
Description
**Fix:** How to correct

## Recommendations
- List of suggested improvements
```

## Severity

| Level | What |
|-------|------|
| Critical | `any` types, inline styles, manual form state, className in pages |
| Warning | Manual `useState` for form state, naming issues |
| Info | Missing `cn()`, optimization opportunities |
