# Component Creator Agent

Create new UI components following project patterns.

## Trigger

Use this agent when:
- Creating new shadcn-based components
- Adding new feature components
- Extending existing components with variants

## Templates

### 1. shadcn/ui Base Component

Location: `src/components/ui/{component-name}.tsx`

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentVariants = cva(
  // Base classes
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
)
ComponentName.displayName = 'ComponentName'

export { ComponentName, componentVariants }
```

### 2. Feature Component

Location: `src/components/{feature}/{ComponentName}.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FeatureComponentProps {
  data: DataType
  className?: string
}

export function FeatureComponent({ data, className }: FeatureComponentProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  )
}
```

### 3. Interactive Component (Client)

Location: `src/components/{feature}/{ComponentName}.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface InteractiveComponentProps {
  initialValue: string
  onSubmit: (value: string) => Promise<void>
}

export function InteractiveComponent({ initialValue, onSubmit }: InteractiveComponentProps) {
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onSubmit(value)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
      />
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
```

### 4. Component with Dynamic Color

```tsx
import type { CSSProperties } from 'react'

interface ColoredAvatarProps {
  color: string
  name: string
}

export function ColoredAvatar({ color, name }: ColoredAvatarProps) {
  return (
    <div
      style={{ '--avatar-color': color } as CSSProperties}
      className="h-8 w-8 rounded-full bg-[var(--avatar-color)] flex items-center justify-center text-white text-sm font-medium"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
```

## Checklist Before Creating

- [ ] Does a similar component already exist?
- [ ] Can an existing shadcn component be extended?
- [ ] Is it truly reusable or just page-specific?
- [ ] Does it need `'use client'`? (Only if interactive)

## Naming Rules

| Type | Location | Naming |
|------|----------|--------|
| shadcn base | `ui/` | kebab-case |
| Feature component | `{feature}/` | PascalCase |
| Hook | `hooks/` | `use-{name}.ts` |
| Type | inline or `types/` | PascalCase |

## Export Pattern

```tsx
// Named export matching filename
// File: AccountCard.tsx
export function AccountCard() { ... }

// NOT default export
export default function AccountCard() { ... }  // ❌
```

## After Creating

1. Add to barrel export if applicable (`index.ts`)
2. Add test file if in `ui/` directory
3. Verify no `className` leaks to pages
4. Run `npm run check` to verify
