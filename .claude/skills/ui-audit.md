# UI Audit Skill

Audit the codebase for UI architecture violations.

## Usage

```
/ui-audit
```

## What It Does

Scans the codebase for violations of:
1. `className` in pages
2. Inline `style={{}}` (except CSS variables)
3. Forbidden imports (Flex, Icon wrapper)
4. Wrong file naming conventions

## Execution Steps

### Step 1: Check className in Pages

```bash
grep -rn "className=" src/app/ --include="*.tsx" | grep -v "layout.tsx" | grep -v "loading.tsx" | grep -v "error.tsx"
```

Any results = violation.

### Step 2: Check Inline Styles

```bash
grep -rn "style={{" src/ --include="*.tsx"
```

Filter out valid CSS variable patterns:
- `style={{ '--var': value } as CSSProperties}` = OK
- `style={{ backgroundColor: x }}` = VIOLATION

### Step 3: Check Forbidden Imports

```bash
# Icon wrapper (should use lucide-react directly)
grep -rn "from.*components/ui/icon" src/

# Flex wrapper (should use Tailwind)
grep -rn "import.*Flex" src/
```

### Step 4: Check File Naming

```bash
# ui/ should be kebab-case
ls src/components/ui/*.tsx | xargs -I {} basename {} | grep -E "^[A-Z]"

# feature/ should be PascalCase
find src/components -type f -name "*.tsx" -not -path "*/ui/*" | xargs -I {} basename {} | grep -E "^[a-z].*[A-Z]"
```

## Output Format

```markdown
# UI Audit Report

## Summary
- Total violations: X
- className in pages: X
- Inline styles: X
- Forbidden imports: X
- Naming issues: X

## className in Pages
| File | Line | Code |
|------|------|------|
| src/app/dashboard/page.tsx | 15 | `<div className="flex">` |

## Inline Styles
| File | Line | Issue |
|------|------|-------|
| src/components/accounts/MemberChip.tsx | 36 | `style={{ backgroundColor }}` |

## Forbidden Imports
| File | Import |
|------|--------|
| src/components/auth/AuthErrorCard.tsx | `from '@/components/ui/icon'` |

## Recommended Fixes
1. Extract `className` from pages into components
2. Replace `style={{ backgroundColor }}` with CSS variable pattern
3. Import icons directly from `lucide-react`
```

## Quick Fix Commands

```bash
# Run lint to catch some violations
npm run lint:ui

# Find all style={{}} for manual review
grep -rn "style={{" src/ --include="*.tsx" -A 1 -B 1
```
