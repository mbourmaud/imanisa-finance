# Add shadcn Component Skill

Add a new shadcn/ui component to the project.

## Usage

```
/add-shadcn <component-name>
```

Examples:
```
/add-shadcn accordion
/add-shadcn alert-dialog
/add-shadcn calendar
/add-shadcn radio-group
```

## Steps

### 1. Install Component

```bash
npx shadcn@latest add <component-name> --yes
```

**Important:** Do NOT use `--overwrite` as it replaces customized components (like our `button.tsx` with `iconLeft`, `fullWidth` props).

If the CLI asks to overwrite an existing file, **decline** unless you intentionally want to reset to defaults.

### 2. Verify Installation

```bash
ls src/components/ui/<component-name>.tsx
```

### 3. Check for Type Errors

```bash
npx tsc --noEmit 2>&1 | head -20
```

If there are type conflicts (e.g., custom `size` prop vs native HTML `size`), fix the newly added component to match existing types.

### 4. Type Check Pass

Ensure `npx tsc --noEmit` passes with zero errors before proceeding.

## Available Components

Common components:
- `accordion`, `alert`, `alert-dialog`, `avatar`
- `badge`, `button`, `calendar`, `card`
- `checkbox`, `collapsible`, `command`, `context-menu`
- `dialog`, `dropdown-menu`, `field`, `hover-card`
- `input`, `input-group`, `label`, `menubar`
- `navigation-menu`, `popover`, `progress`, `radio-group`
- `scroll-area`, `select`, `separator`, `sheet`
- `skeleton`, `slider`, `switch`, `table`
- `tabs`, `textarea`, `toggle`, `tooltip`

## Customization After Install

### Add Variants (CVA)

```typescript
const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: '...',
      custom: '...',  // Add new variant
    },
  },
})
```

### Extend Props

```typescript
interface CustomProps extends React.ComponentProps<'div'> {
  customProp?: boolean
}
```

## Rules

- Filename stays **kebab-case** in `src/components/ui/`
- Use `cn()` for className merging
- Don't modify shadcn source for app logic - create wrapper components
- Run type check after every install
