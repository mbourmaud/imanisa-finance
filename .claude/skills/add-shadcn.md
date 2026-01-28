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
```

## Execution Steps

### Step 1: Check Available Components

```bash
npx shadcn@latest add --help
```

Common components:
- `accordion`, `alert`, `alert-dialog`, `avatar`
- `badge`, `button`, `calendar`, `card`
- `checkbox`, `collapsible`, `command`, `context-menu`
- `dialog`, `dropdown-menu`, `form`, `hover-card`
- `input`, `label`, `menubar`, `navigation-menu`
- `popover`, `progress`, `radio-group`, `scroll-area`
- `select`, `separator`, `sheet`, `skeleton`
- `slider`, `switch`, `table`, `tabs`
- `textarea`, `toast`, `toggle`, `tooltip`

### Step 2: Add Component

```bash
npx shadcn@latest add <component-name>
```

This will:
1. Create the component in `src/components/ui/`
2. Add any required dependencies
3. Use kebab-case filename (e.g., `alert-dialog.tsx`)

### Step 3: Verify Installation

```bash
# Check file was created
ls src/components/ui/<component-name>.tsx

# Check exports
grep "export" src/components/ui/<component-name>.tsx
```

### Step 4: Add to Barrel Export (if needed)

```typescript
// src/components/ui/index.ts
export * from './<component-name>'
```

### Step 5: Add Test File (UI components need tests)

Create `src/components/ui/__tests__/<component-name>.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ComponentName } from '../<component-name>'

describe('ComponentName', () => {
  describe('snapshots', () => {
    it('renders default variant', () => {
      const { container } = render(<ComponentName>Test</ComponentName>)
      expect(container).toMatchSnapshot()
    })
  })

  describe('behavior', () => {
    it('renders children', () => {
      const { getByText } = render(<ComponentName>Hello</ComponentName>)
      expect(getByText('Hello')).toBeInTheDocument()
    })
  })
})
```

## Post-Installation Checklist

- [ ] Component added to `src/components/ui/`
- [ ] Filename is kebab-case
- [ ] Exported from `index.ts`
- [ ] Test file created
- [ ] `npm run build` passes
- [ ] `npm run check` passes

## Customization

After adding, you can customize the component:

1. **Add variants** - Edit the CVA definition
2. **Change defaults** - Modify `defaultVariants`
3. **Add props** - Extend the interface

```typescript
// Example: Add a "warning" variant to Button
const buttonVariants = cva('...', {
  variants: {
    variant: {
      // ...existing
      warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
    },
  },
})
```

## Troubleshooting

**Component not found:**
```bash
# List all available components
npx shadcn@latest add
```

**Dependency issues:**
```bash
npm install  # Reinstall deps
npx shadcn@latest add <component> --overwrite  # Force reinstall
```
