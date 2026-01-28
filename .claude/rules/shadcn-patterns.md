# shadcn/ui Best Practices

## Core Principles

shadcn/ui delivers source code directly into your project via CLI. You OWN the components.

### The `cn` Utility

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Always use `cn()` for:**
- Conditional classes
- Merging props className with component classes
- Resolving Tailwind conflicts (e.g., `px-2` vs `px-4`)

---

## CVA (class-variance-authority) Patterns

### Standard Component Structure

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base classes (always applied)
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
```

### Adding New Variants

```typescript
// ✅ GOOD - Add to existing CVA definition
variant: {
  // ...existing
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
}

// ❌ BAD - Creating separate component or inline styles
```

---

## Component Extension Patterns

### Pattern 1: Composition (Preferred)

```tsx
// ✅ Create a wrapper that composes the base component
import { Button, type ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

export function LoadingButton({ loading, children, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
```

### Pattern 2: Slot Pattern (asChild)

```tsx
// Render as a different element while preserving styles
<Button asChild>
  <a href="/about">About</a>
</Button>

<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

### Pattern 3: Compound Components

```tsx
// Parent manages state, children access via context
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## File Naming Convention

| Location | Convention | Example |
|----------|------------|---------|
| `src/components/ui/` | **kebab-case** | `dropdown-menu.tsx` |
| `src/components/[feature]/` | **PascalCase** | `AccountCard.tsx` |

**Why kebab-case in ui/?** Allows `npx shadcn@latest add` without renaming.

---

## DO NOT

1. **Modify shadcn source for app logic** → Create wrapper components
2. **Use inline `style={{}}`** → Use CSS variables + Tailwind arbitrary values
3. **Override with `!important`** → Use `cn()` and proper class ordering
4. **Create overly complex components** → Break into smaller, focused pieces
5. **Mix business logic with UI** → Separate presentation from logic
6. **Ignore accessibility** → Leverage Radix's built-in ARIA support

---

## Dynamic Styling Without Inline Styles

### Using CSS Variables

```tsx
// ✅ CORRECT - Set CSS variable, use Tailwind arbitrary value
<div
  style={{ '--member-color': member.color } as React.CSSProperties}
  className="bg-[var(--member-color)]"
/>

// ❌ WRONG - Inline backgroundColor
<div style={{ backgroundColor: member.color }} />
```

### Type Hints for Ambiguous Values

```tsx
// When Tailwind can't determine the type
className="text-[length:var(--font-size)]"  // For font-size
className="text-[color:var(--text-color)]"  // For color
```

---

## Accessibility Checklist

shadcn/ui uses Radix primitives with built-in a11y:

- ✅ Proper semantic HTML
- ✅ ARIA labels via `sr-only` classes
- ✅ Keyboard navigation
- ✅ Focus management in dialogs
- ✅ Screen reader announcements

```tsx
// Example: Always include sr-only text for icon-only buttons
<Button size="icon" aria-label="Close">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</Button>
```
