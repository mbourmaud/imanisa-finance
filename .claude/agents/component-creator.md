# Component Creator Agent

Create React components following project architecture and shadcn/ui patterns.

## When to Use

- Creating new feature components
- Wrapping shadcn/ui components with custom variants
- Building business components for pages

## Architecture Rules

1. **No `className` in pages** - Pages use business components, not Tailwind
2. **No `style={{}}`** - Use Tailwind classes or CSS variables
3. **shadcn/ui for base** - Compose from existing components
4. **`cn()` for merging** - Always use for conditional/merged classes
5. **Named exports** matching filename
6. **TypeScript interfaces** for all props (no `any`)

## File Naming

| Location | Convention | Example |
|----------|------------|---------|
| `src/components/ui/` | kebab-case | `button.tsx`, `field.tsx` |
| `src/components/{feature}/` | PascalCase | `AccountCard.tsx` |

## Templates

### Feature Component

Location: `src/components/{feature}/{ComponentName}.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AccountCardProps {
  account: Account
  className?: string
}

export function AccountCard({ account, className }: AccountCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={account.isActive ? 'default' : 'secondary'}>
          {account.type}
        </Badge>
      </CardContent>
    </Card>
  )
}
```

### Interactive Component (Client)

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DeleteAccountDialogProps {
  accountId: string
  accountName: string
  onDelete: (id: string) => Promise<void>
}

export function DeleteAccountDialog({
  accountId,
  accountName,
  onDelete,
}: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Supprimer {accountName} ?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onDelete(accountId)
              setOpen(false)
            }}
          >
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Component with Dynamic Color

```tsx
import type { CSSProperties } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface MemberAvatarProps {
  name: string
  color: string
}

export function MemberAvatar({ name, color }: MemberAvatarProps) {
  return (
    <Avatar
      style={{ '--avatar-color': color } as CSSProperties}
      className="bg-[var(--avatar-color)]"
    >
      <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
```

### shadcn/ui Extension (CVA Variant)

Location: `src/components/ui/{component}.tsx`

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statVariants = cva(
  'rounded-lg border p-4',
  {
    variants: {
      trend: {
        up: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
        down: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
        neutral: 'border-border bg-card',
      },
    },
    defaultVariants: {
      trend: 'neutral',
    },
  }
)

interface StatCardProps extends VariantProps<typeof statVariants> {
  label: string
  value: string
  className?: string
}

export function StatCard({ label, value, trend, className }: StatCardProps) {
  return (
    <div className={cn(statVariants({ trend }), className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
```

## Checklist

- [ ] Does a similar component already exist?
- [ ] Can an existing shadcn component be extended instead?
- [ ] Is it truly reusable or just page-specific?
- [ ] Does it need `'use client'`? (Only if interactive: useState, useEffect, handlers)
- [ ] Named export matches filename?
- [ ] No `any` types?
- [ ] No inline `style={{}}` (except CSS variables)?
- [ ] `cn()` used for className merging?
- [ ] French for user-visible text, English for code?
