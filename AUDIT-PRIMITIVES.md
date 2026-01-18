# Audit des Custom Primitives - Imanisa Finance

**Date**: 2026-01-18
**Objectif**: Identifier les composants custom primitives à migrer vers shadcn ou Tailwind natif

## Résumé Exécutif

| Composant | Fichier | Usages (approx.) | Priorité | Remplacement |
|-----------|---------|------------------|----------|--------------|
| **VStack** | `src/components/ui/stack.tsx` | ~284 | 🔴 Haute | `<div className="flex flex-col gap-*">` |
| **HStack** | `src/components/ui/stack.tsx` | ~177 | 🔴 Haute | `<div className="flex gap-* items-center">` |
| **Box** | `src/components/ui/box.tsx` | ~173 | 🔴 Haute | `<div className="...">` ou `<Card>` |
| **Text** | `src/components/ui/typography.tsx` | ~331 | 🔴 Haute | `<p>`, `<span>` + classes Tailwind |
| **Flex** | `src/components/ui/flex.tsx` | ~82 | 🟡 Moyenne | `<div className="flex ...">` |
| **Grid** | `src/components/ui/grid.tsx` | ~54 | 🟡 Moyenne | `<div className="grid grid-cols-* gap-*">` |
| **Heading** | `src/components/ui/typography.tsx` | ~52 | 🟡 Moyenne | `<h1>`-`<h6>` + classes Tailwind |
| **Glass** | `src/components/ui/glass.tsx` | ~18 | 🟢 Basse | `<Card>` ou `<div>` + backdrop-blur |
| **Section** | `src/components/ui/layout.tsx` | ~9 | 🟢 Basse | `<section className="py-*">` |
| **Container** | `src/components/ui/layout.tsx` | ~6 | 🟢 Basse | `<div className="max-w-* mx-auto px-*">` |
| **Page** | `src/components/ui/layout.tsx` | ~5 | 🟢 Basse | `<main className="flex-1 overflow-y-auto py-*">` |
| **Spacer** | `src/components/ui/spacer.tsx` | ~4 | 🟢 Basse | Margin/padding sur éléments adjacents |

## Analyse Détaillée

### 1. Box (`src/components/ui/box.tsx`)

**Description**: Container générique qui encapsule les props Tailwind (p, m, bg, border, rounded, shadow, etc.)

**Fonctionnalités**:
- `as`: Rendu en tant qu'élément différent (div, section, article, etc.)
- `display`: block, flex, inline, inline-flex, grid, hidden
- `position`: relative, absolute, fixed, sticky
- `overflow`, `overflowX`, `overflowY`: hidden, auto, scroll, visible
- `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`: Padding avec tokens (xs, sm, md, lg, xl, 2xl)
- `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`: Margin avec tokens
- `bg`: Couleurs de fond (muted, card, background, primary, etc.)
- `border`: Styles de bordure (default, muted, strong, dashed)
- `rounded`: Rayon de bordure (sm, md, lg, xl, 2xl, full)
- `shadow`: Ombre (sm, md, lg, xl)
- `fullWidth`, `fullHeight`, `grow`, `shrink`, `minW0`, `minH0`
- `transition`, `cursor`, `zIndex`

**Migration**:
- Simple `<div>` avec `className` Tailwind direct
- Utiliser `<Card>` de shadcn pour les conteneurs avec bordure/fond

**Exemple**:
```tsx
// Avant
<Box p="md" bg="muted" rounded="lg" border="default">

// Après
<div className="p-4 bg-muted rounded-lg border border-border">
```

---

### 2. Flex (`src/components/ui/flex.tsx`)

**Description**: Composant flexbox avec props pour direction, alignement et gap.

**Fonctionnalités**:
- `direction`: row, row-reverse, col, col-reverse
- `directionSm`, `directionMd`, `directionLg`: Directions responsives
- `align`: start, center, end, stretch, baseline
- `justify`: start, center, end, between, around, evenly
- `wrap`: wrap, nowrap, wrap-reverse
- `gap`: Taille du gap (xs, sm, md, lg, xl, 2xl)
- `inline`: inline-flex au lieu de flex
- `p`, `fullHeight`, `fullWidth`, `grow`, `shrink`, `minW0`

**Migration**: `<div className="flex ...">` avec classes Tailwind

**Exemple**:
```tsx
// Avant
<Flex direction="row" align="center" justify="between" gap="md">

// Après
<div className="flex flex-row items-center justify-between gap-4">
```

---

### 3. VStack / HStack (`src/components/ui/stack.tsx`)

**Description**: Stack vertical et horizontal avec gap et alignement.

**VStack Fonctionnalités**:
- `gap`: Taille du gap (xs, sm, md, lg, xl, 2xl)
- `align`: start, center, end, stretch
- `justify`: start, center, end, between, around, evenly
- `p`, `wrap`, `fullHeight`, `fullWidth`, `grow`, `shrink`, `minW0`

**HStack Fonctionnalités**:
- Identique à VStack mais horizontal par défaut
- `align` inclut aussi `baseline`
- Défaut: `align="center"`, `wrap=false`

**Migration**:
- VStack → `<div className="flex flex-col gap-*">`
- HStack → `<div className="flex gap-* items-center">`

**Exemple**:
```tsx
// Avant
<VStack gap="sm" align="start">
<HStack gap="md" justify="between">

// Après
<div className="flex flex-col gap-2 items-start">
<div className="flex gap-4 items-center justify-between">
```

---

### 4. Grid (`src/components/ui/grid.tsx`)

**Description**: CSS Grid avec colonnes responsives et gap.

**Fonctionnalités**:
- `cols`: Nombre de colonnes (1-12)
- `colsSm`, `colsMd`, `colsLg`, `colsXl`: Colonnes responsives
- `gap`, `gapX`, `gapY`: Gap avec tokens
- `p`: Padding
- `alignItems`: start, center, end, stretch
- `justifyItems`: start, center, end, between, around, evenly
- `fullHeight`, `fullWidth`

**Migration**: `<div className="grid grid-cols-* gap-*">`

**Exemple**:
```tsx
// Avant
<Grid cols={1} colsMd={2} colsLg={4} gap="md">

// Après
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

### 5. Text / Heading (`src/components/ui/typography.tsx`)

**Heading Description**: Composant de titre sémantique h1-h6.

**Heading Fonctionnalités**:
- `level`: Niveau sémantique (1-6)
- `size`: xs, sm, md, lg, xl, 2xl, 3xl, 4xl (override du défaut)
- `color`: default, muted, primary, success, danger, warning, inherit
- `weight`: normal, medium, semibold, bold
- `align`: left, center, right
- `truncate`: truncate, line-clamp-1/2/3

**Text Description**: Composant texte flexible.

**Text Fonctionnalités**:
- `as`: p, span, div, label
- `asSpan`: Rendu en span (déprécié, utiliser `as`)
- `variant`: default, muted, lead, small, mono (déprécié)
- `size`, `color`, `weight`, `align`, `truncate`
- `mono`, `italic`, `underline`, `uppercase`, `leading`

**Migration**:
- Heading → `<h1>`-`<h6>` avec classes Tailwind
- Text → `<p>`, `<span>` avec classes Tailwind

**Exemple**:
```tsx
// Avant
<Heading level={2} size="lg" color="default">Titre</Heading>
<Text size="sm" color="muted">Description</Text>

// Après
<h2 className="text-lg font-semibold tracking-tight">Titre</h2>
<p className="text-sm text-muted-foreground">Description</p>
```

---

### 6. Spacer (`src/components/ui/spacer.tsx`)

**Description**: Espace flexible dans les conteneurs flex.

**Fonctionnalités**:
- `grow`: Valeur de flex-grow (défaut: 1)

**Migration**: Utiliser margin/padding sur les éléments adjacents, ou `flex-1` directement.

**Exemple**:
```tsx
// Avant
<HStack>
  <Logo />
  <Spacer />
  <Actions />
</HStack>

// Après
<div className="flex items-center">
  <Logo />
  <div className="flex-1" />
  <Actions />
</div>
// Ou mieux:
<div className="flex items-center justify-between">
  <Logo />
  <Actions />
</div>
```

---

### 7. Glass (`src/components/ui/glass.tsx`)

**Description**: Conteneur glassmorphism.

**Fonctionnalités**:
- `variant`: card, panel, subtle, surface
- `padding`: none, sm, md, lg
- `radius`: none, sm, md, lg, xl, 2xl
- `interactive`: Effet hover

**Migration**: `<Card>` de shadcn ou `<div>` avec backdrop-blur custom.

**Exemple**:
```tsx
// Avant
<Glass variant="card" padding="md" radius="lg" interactive>

// Après
<Card className="p-6 backdrop-blur-sm hover:-translate-y-0.5 transition-all cursor-pointer">
```

---

### 8. Container / Section / Page (`src/components/ui/layout.tsx`)

**Container Description**: Contrainte de largeur avec padding horizontal.

**Container Fonctionnalités**:
- `maxWidth`: sm, md, lg, xl, 2xl, full
- `centered`: Centre horizontalement (mx-auto)
- `padded`: Applique le padding horizontal

**Section Description**: Spacing vertical pour les sections.

**Section Fonctionnalités**:
- `spacing`: none, sm, md, lg, xl
- `title`, `description`: Titre/description optionnels
- `as`: section, div, article

**Page Description**: Wrapper pour les pages du dashboard.

**Page Fonctionnalités**:
- `title`: Titre pour accessibilité
- `scrollable`: Active le défilement
- `padded`: Padding vertical

**Migration**:
```tsx
// Container - Avant
<Container maxWidth="xl" centered padded>

// Container - Après
<div className="max-w-screen-xl mx-auto px-4 sm:px-6">

// Section - Avant
<Section spacing="md" title="Titre" description="Desc">

// Section - Après
<section className="py-6">
  <div className="mb-4">
    <h2 className="text-lg font-semibold tracking-tight">Titre</h2>
    <p className="mt-1 text-sm text-muted-foreground">Desc</p>
  </div>
  {children}
</section>

// Page - Avant
<Page title="Dashboard" scrollable padded>

// Page - Après
<main className="flex-1 overflow-y-auto py-6" aria-label="Dashboard">
```

---

## Plan de Migration

### Phase 1: Haute Priorité (usage > 100)
1. **VStack** (~284 usages)
2. **Text** (~331 usages)
3. **HStack** (~177 usages)
4. **Box** (~173 usages)

### Phase 2: Moyenne Priorité (usage 50-100)
5. **Flex** (~82 usages)
6. **Grid** (~54 usages)
7. **Heading** (~52 usages)

### Phase 3: Basse Priorité (usage < 50)
8. **Glass** (~18 usages)
9. **Section** (~9 usages)
10. **Container** (~6 usages)
11. **Page** (~5 usages)
12. **Spacer** (~4 usages)

---

## Fichiers à Supprimer Après Migration

```
src/components/ui/box.tsx
src/components/ui/flex.tsx
src/components/ui/stack.tsx
src/components/ui/grid.tsx
src/components/ui/typography.tsx
src/components/ui/spacer.tsx
src/components/ui/glass.tsx
src/components/ui/layout.tsx
```

## Notes

- Les tests unitaires dans `src/components/ui/__tests__/` devront également être supprimés
- Les exports dans `src/components/index.ts` devront être nettoyés
- CLAUDE.md et COMPONENT_RULES.md devront être mis à jour
