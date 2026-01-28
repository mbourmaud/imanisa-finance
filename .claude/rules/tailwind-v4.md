# Tailwind CSS v4 Best Practices

## Key Changes from v3

### CSS-First Configuration

```css
/* No more tailwind.config.js - use CSS instead */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.65 0.15 25);
  --color-secondary: oklch(0.55 0.12 250);
  --font-display: "Inter", sans-serif;
}
```

### Performance

- **100x faster incremental builds** (Oxide engine in Rust)
- **5x faster full builds**
- Built-in `@import` bundling and vendor prefixing (Lightning CSS)

### Browser Support

**Minimum:** Safari 16.4+, Chrome 111+, Firefox 128+

---

## @theme Directive

Define design tokens that auto-generate utility classes:

```css
@import "tailwindcss";

@theme {
  /* Generates bg-primary, text-primary, border-primary */
  --color-primary: oklch(0.65 0.15 25);
  --color-background: oklch(0.98 0.01 250);

  /* Generates shadow-custom */
  --shadow-custom: 0 4px 12px rgba(0, 0, 0, 0.15);

  /* Generates font-display */
  --font-display: "Inter", sans-serif;
}
```

### @theme inline for Dynamic Themes

```css
@import "tailwindcss";

/* Reference other CSS variables */
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
}

/* Define actual values per theme */
@layer base {
  :root {
    --primary: oklch(0.65 0.15 25);
    --background: oklch(0.98 0.01 250);
  }
  .dark {
    --primary: oklch(0.75 0.12 25);
    --background: oklch(0.15 0.01 250);
  }
}
```

---

## Dynamic Values Without Inline Styles

### Pattern: CSS Variable + Arbitrary Value

```tsx
// ✅ CORRECT
<div
  style={{ '--progress': `${percent}%` } as CSSProperties}
  className="w-[var(--progress)] bg-primary"
/>

// ✅ CORRECT - For dynamic colors
<div
  style={{ '--brand-color': brandColor } as CSSProperties}
  className="bg-[var(--brand-color)]"
/>

// ❌ WRONG - Inline styles
<div style={{ width: `${percent}%`, backgroundColor: brandColor }} />
```

### Short Syntax

```tsx
// Both work
className="bg-[--my-color]"        // Short syntax
className="bg-[var(--my-color)]"   // Explicit var()
```

### Type Hints

```tsx
// When Tailwind can't determine the CSS property type
className="text-[length:var(--size)]"   // font-size
className="text-[color:var(--color)]"   // color
className="bg-[image:var(--gradient)]"  // background-image
```

---

## Renamed Utilities (v3 → v4)

| v3 | v4 |
|----|----|
| `shadow` | `shadow-sm` |
| `shadow-sm` | `shadow-xs` |
| `rounded` | `rounded-sm` |
| `rounded-sm` | `rounded-xs` |
| `outline-none` | `outline-hidden` |

---

## Anti-Patterns to Avoid

### 1. Overusing @apply

```css
/* ❌ DON'T - You're just writing CSS again */
.card {
  @apply flex flex-col gap-4 rounded-lg border bg-card p-6;
}

/* ✅ DO - Use components in React */
function Card({ children }) {
  return <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">{children}</div>
}
```

### 2. Magic Numbers

```tsx
// ❌ Arbitrary values everywhere
<div className="mt-[13px] ml-[47px] w-[317px]" />

// ✅ Use design tokens, extend @theme
@theme {
  --spacing-sidebar: 317px;
}
<div className="mt-3 ml-12 w-sidebar" />
```

### 3. Default Colors in Production

```tsx
// ❌ Generic Tailwind colors
<div className="bg-blue-500 text-gray-700" />

// ✅ Semantic colors from @theme
<div className="bg-primary text-foreground" />
```

### 4. Custom Classes Without @utility

```css
/* ❌ Won't work with hover:, focus:, etc. */
@layer components {
  .my-button { background: var(--primary); }
}

/* ✅ Use @utility for variant support */
@utility my-button {
  background: var(--primary);
  &:hover { background: var(--primary-hover); }
}
```

### 5. Dynamically Constructing Class Names

```tsx
// ❌ Tailwind can't detect at build time
const color = isError ? "red" : "green"
<div className={`bg-${color}-500`} />

// ✅ Use complete class names
<div className={isError ? "bg-red-500" : "bg-green-500"} />

// ✅ Or CSS variables for truly dynamic values
<div
  style={{ '--status-color': statusColor } as CSSProperties}
  className="bg-[var(--status-color)]"
/>
```

### 6. className in Pages

```tsx
// ❌ Pages full of utility classes
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  )
}

// ✅ Use business components
export default function DashboardPage() {
  return (
    <PageLayout>
      <PageHeader title="Dashboard" />
    </PageLayout>
  )
}
```

---

## Class Organization

Install `prettier-plugin-tailwindcss` for auto-sorting. Standard order:

1. **Layout/position** (`flex`, `relative`, `grid`)
2. **Sizing** (`w-full`, `h-12`, `min-h-screen`)
3. **Spacing** (`p-4`, `gap-2`, `m-auto`)
4. **Typography** (`text-sm`, `font-bold`, `leading-tight`)
5. **Colors** (`bg-primary`, `text-foreground`, `border-input`)
6. **Effects** (`shadow-md`, `rounded-lg`, `opacity-50`)
7. **States** (`hover:bg-accent`, `focus:ring-2`, `disabled:opacity-50`)

---

## Import Statement (v4)

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import "tailwindcss";
```

---

## New Features

### Container Queries (Built-in)

```tsx
<div className="@container">
  <div className="@md:flex-row flex-col">
    Responsive to container, not viewport
  </div>
</div>
```

### OKLCH Colors

```css
@theme {
  /* P3 wide-gamut colors */
  --color-primary: oklch(0.65 0.15 25);
  --color-success: oklch(0.55 0.18 145);
}
```
