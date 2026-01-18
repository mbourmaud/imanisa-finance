# Component Rules - UI Kit Architecture

> **RULE #1**: Pages NEVER use `className` on UI components. All styling is done through props.

## Core Principle

```tsx
// ❌ WRONG - className in page
<Text className="text-sm text-muted-foreground font-medium">Label</Text>
<div className="flex items-center gap-4 p-6">...</div>

// ✅ CORRECT - props instead of className
<Text size="sm" color="muted" weight="medium">Label</Text>
<HStack gap="md" p="lg">...</HStack>
```

## Component Reference

### Typography

#### `<Text>`
Replaces all `<span>`, `<p>` with inline classes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl'` | `'md'` | Text size |
| `color` | `'default' \| 'muted' \| 'primary' \| 'success' \| 'danger' \| 'warning' \| 'inherit'` | `'default'` | Text color |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold'` | - | Font weight |
| `align` | `'left' \| 'center' \| 'right'` | - | Text alignment |
| `truncate` | `'truncate' \| 'line-clamp-1' \| 'line-clamp-2' \| 'line-clamp-3'` | - | Text truncation |
| `mono` | `boolean` | `false` | Monospace font |
| `italic` | `boolean` | `false` | Italic text |
| `underline` | `boolean` | `false` | Underlined text |
| `uppercase` | `boolean` | `false` | Uppercase text |
| `leading` | `'none' \| 'tight' \| 'normal' \| 'relaxed' \| 'loose'` | - | Line height |
| `as` | `'p' \| 'span' \| 'div' \| 'label'` | `'p'` | HTML element |

```tsx
// Examples
<Text size="sm" color="muted">Description</Text>
<Text size="lg" weight="semibold">Title</Text>
<Text as="span" size="xs" uppercase>Badge</Text>
<Text color="success" weight="bold">+12.5%</Text>
```

#### `<Heading>`
Replaces all `<h1>`-`<h6>` with inline classes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Semantic heading level |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl'` | auto | Visual size (overrides level default) |
| `color` | Same as Text | `'default'` | Text color |
| `weight` | Same as Text | `'semibold'` | Font weight |
| `align` | Same as Text | - | Text alignment |
| `truncate` | Same as Text | - | Text truncation |

```tsx
// Examples
<Heading level={1}>Page Title</Heading>
<Heading level={3} size="sm" color="muted">Section</Heading>
```

### Layout Components

#### `<VStack>` (Vertical Stack)
Replaces `<div className="flex flex-col gap-*">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Vertical gap |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | Horizontal alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | - | Vertical distribution |
| `p` | Same as gap | - | Padding |
| `wrap` | `boolean` | `false` | Allow wrapping |
| `fullHeight` | `boolean` | `false` | `h-full` |
| `fullWidth` | `boolean` | `false` | `w-full` |

```tsx
<VStack gap="lg" align="center">
  <Heading>Title</Heading>
  <Text>Description</Text>
</VStack>
```

#### `<HStack>` (Horizontal Stack)
Replaces `<div className="flex flex-row items-center gap-*">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | Same as VStack | `'md'` | Horizontal gap |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `'center'` | Vertical alignment |
| `justify` | Same as VStack | - | Horizontal distribution |
| `p` | Same as VStack | - | Padding |
| `wrap` | `boolean` | `false` | Allow wrapping |
| `fullHeight` | `boolean` | `false` | `h-full` |
| `fullWidth` | `boolean` | `false` | `w-full` |

```tsx
<HStack gap="sm" justify="between">
  <Text>Left</Text>
  <Text>Right</Text>
</HStack>
```

#### `<Flex>`
Full flexbox control for complex layouts.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'row' \| 'row-reverse' \| 'col' \| 'col-reverse'` | `'row'` | Flex direction |
| `directionSm/Md/Lg` | Same | - | Responsive direction |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | - | Cross-axis alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | - | Main-axis alignment |
| `wrap` | `'wrap' \| 'nowrap' \| 'wrap-reverse'` | - | Wrap behavior |
| `gap` | Same as VStack | `'md'` | Gap between items |
| `inline` | `boolean` | `false` | `inline-flex` |
| `p` | Same as VStack | - | Padding |
| `grow` | `boolean` | `false` | `flex-1` |
| `shrink` | `boolean` | - | `flex-shrink-0` when false |
| `minW0` | `boolean` | `false` | `min-w-0` |
| `fullHeight/Width` | `boolean` | `false` | Full dimensions |

```tsx
<Flex direction="col" directionMd="row" gap="lg" align="center">
  <Box>Item 1</Box>
  <Box grow>Item 2 (fills space)</Box>
</Flex>
```

#### `<Grid>`
CSS Grid for column-based layouts.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `1-12` | `1` | Number of columns |
| `colsSm/Md/Lg/Xl` | `1-12` | - | Responsive columns |
| `gap` | Same as VStack | `'md'` | Grid gap |
| `gapX` | Same | - | Column gap |
| `gapY` | Same | - | Row gap |
| `p` | Same as VStack | - | Padding |
| `alignItems` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | Item alignment |
| `justifyItems` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | - | Item justification |
| `fullHeight/Width` | `boolean` | `false` | Full dimensions |

```tsx
<Grid cols={1} colsSm={2} colsLg={4} gap="lg">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
  <Card>4</Card>
</Grid>
```

### Card Components

#### `<Card>`
Basic card container.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'flat' \| 'outlined'` | `'default'` | Visual style |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Vertical padding |

#### `<GlassCard>`
Glassmorphism card for the design system.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'flat' \| 'interactive'` | `'default'` | Visual style |
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `accent` | `'coral' \| 'teal' \| 'purple' \| 'gold' \| 'mint' \| 'primary'` | - | Top accent bar |

```tsx
<GlassCard variant="interactive" accent="teal" padding="lg">
  <GlassCardHeader title="Account" description="Details" />
  <GlassCardContent>...</GlassCardContent>
</GlassCard>
```

### Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | Button style |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon' \| 'icon-sm' \| 'icon-lg'` | `'default'` | Button size |
| `iconLeft` | `ReactNode` | - | Icon before text |
| `iconRight` | `ReactNode` | - | Icon after text |
| `loading` | `boolean` | `false` | Shows spinner |
| `fullWidth` | `boolean` | `false` | Full width |
| `asChild` | `boolean` | `false` | Render as slot |

```tsx
// With icons
<Button iconLeft={<Plus />}>Add Item</Button>
<Button iconRight={<ChevronRight />} variant="outline">Next</Button>

// Loading state
<Button loading>Saving...</Button>

// Full width
<Button fullWidth>Submit</Button>
```

## Gap/Padding Size Reference

| Token | Tailwind | Pixels |
|-------|----------|--------|
| `none` | `0` | 0px |
| `xs` | `1` | 4px |
| `sm` | `2` | 8px |
| `md` | `4` | 16px |
| `lg` | `6` | 24px |
| `xl` | `8` | 32px |
| `2xl` | `12` | 48px |

## Migration Examples

### Before (with className)
```tsx
<div className="flex flex-col gap-6 p-8">
  <h2 className="text-xl font-semibold text-foreground">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
  <div className="flex items-center justify-between">
    <span className="text-lg font-bold">$1,234</span>
    <button className="flex items-center gap-1 px-3 py-2">
      <Plus className="h-4 w-4" />
      Add
    </button>
  </div>
</div>
```

### After (with props)
```tsx
<VStack gap="lg" p="xl">
  <Heading level={2} size="xl">Title</Heading>
  <Text size="sm" color="muted">Description</Text>
  <HStack justify="between">
    <Text size="lg" weight="bold">$1,234</Text>
    <Button iconLeft={<Plus />}>Add</Button>
  </HStack>
</VStack>
```

## Checklist for Pages

- [ ] No `className=` on any component (except external libraries if unavoidable)
- [ ] No `<div>` - use `VStack`, `HStack`, `Flex`, `Grid`, or `Box`
- [ ] No `<span>` or `<p>` - use `<Text>`
- [ ] No `<h1>`-`<h6>` - use `<Heading>`
- [ ] No direct lucide-react imports - use Icon component or iconLeft/iconRight props
- [ ] All styling expressed through component props
