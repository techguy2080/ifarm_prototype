# Visual Design Documentation - Part 6: UI Element Positioning & Spacing

## Overview
This document captures exact spacing values, positioning specifications, flexbox/grid layouts, z-index layers, border radius values, and shadow definitions used throughout the application.

---

## Exact Spacing Values

### Padding Values (px)

#### Page-Level Padding
- **Mobile**: `24px` (p: 3)
- **Tablet**: `32px` (p: 4)
- **Desktop**: `40px` (p: 5)

#### Card Padding
- **Small**: `16px` (p: 2)
- **Medium**: `24px` (p: 3)
- **Large**: `32px` (p: 4)
- **Extra Large**: `48px` (p: 6)

#### Component Padding
- **Button (Small)**: `8px 16px` (py-2 px-4)
- **Button (Medium)**: `12px 24px` (py-3 px-6)
- **Button (Large)**: `12px 32px` (py-1.5 px-4)
- **Input Field**: `10px 16px` (py-2.5 px-4)
- **Badge**: `2px 10px` (py-0.5 px-2.5)
- **Avatar (Small)**: `0px` (content-based)
- **Avatar (Medium)**: `0px` (content-based)
- **Avatar (Large)**: `0px` (content-based)

### Margin Values (px)

#### Section Spacing
- **Between Major Sections**: `40px` (mb: 5)
- **Between Cards**: `32px` (mb: 4)
- **Between Items**: `24px` (mb: 3 or spacing={3})
- **Small Gap**: `16px` (mb: 2 or spacing={2})
- **Tiny Gap**: `8px` (mb: 1 or spacing={1})

#### Component Margins
- **Card Bottom**: `40px` (mb: 5) for header cards
- **Card Bottom**: `32px` (mb: 4) for regular cards
- **Typography Bottom**: `8px` (mb: 1) for small gaps
- **Typography Bottom**: `16px` (mb: 2) for medium gaps
- **Typography Bottom**: `24px` (mb: 3) for large gaps

### Gap Values (px)

#### Grid Gaps
- **Small**: `16px` (gap: 2)
- **Medium**: `24px` (gap: 3)
- **Large**: `32px` (gap: 4)
- **Extra Large**: `48px` (gap: 6)

#### Flexbox Gaps
- **Tiny**: `4px` (gap-1)
- **Small**: `8px` (gap-2)
- **Medium**: `12px` (gap-3)
- **Large**: `16px` (gap-4)
- **Extra Large**: `24px` (gap-6)

---

## Spacing in rem/em

### Typography Spacing
- **Line Height (Tight)**: `1.25` (leading-tight)
- **Line Height (Normal)**: `1.5` (leading-normal)
- **Line Height (Relaxed)**: `1.625` (leading-relaxed)
- **Line Height (Loose)**: `2` (leading-loose)

### Letter Spacing
- **Tighter**: `-0.05em` (tracking-tighter)
- **Tight**: `-0.025em` (tracking-tight)
- **Normal**: `0em` (tracking-normal)
- **Wide**: `0.025em` (tracking-wide)
- **Wider**: `0.05em` (tracking-wider)
- **Widest**: `0.1em` (tracking-widest)

### Custom Letter Spacing (MUI)
- **H1**: `-0.03em`
- **H2**: `-0.02em`
- **H3**: `-0.02em`
- **H4**: `-0.01em`
- **H5**: `-0.01em`
- **H6**: `0em`
- **Body1**: `0.01em`
- **Body2**: `0.01em`
- **Subtitle1**: `0.01em`
- **Subtitle2**: `0.01em`

---

## Flexbox Layouts

### Common Flex Patterns

#### Space Between
```tsx
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  {/* Left content */}
  {/* Right content */}
</Box>
```

**Usage**: Header cards, card headers, navigation bars

#### Center Alignment
```tsx
<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  {/* Centered content */}
</Box>
```

**Usage**: Loading states, empty states, centered buttons

#### Flex Start
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  {/* Left-aligned items */}
</Box>
```

**Usage**: Icon + text combinations, avatar + name

#### Flex Column
```tsx
<Stack direction="column" spacing={2}>
  {/* Vertical stack */}
</Stack>
```

**Usage**: Form fields, action buttons, info sections

#### Flex Wrap
```tsx
<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
  {/* Wrapping items */}
</Stack>
```

**Usage**: Tag lists, chip groups, permission lists

### Flex Gap Values
- **Tiny**: `8px` (gap: 1)
- **Small**: `12px` (gap: 1.5)
- **Medium**: `16px` (gap: 2)
- **Large**: `24px` (gap: 3)
- **Extra Large**: `32px` (gap: 4)

---

## Grid Layouts

### CSS Grid Patterns

#### Responsive Grid (2-4 columns)
```tsx
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
  gap: 2 
}}>
```

**Specifications:**
- **Mobile**: 2 columns
- **Desktop**: 4 columns
- **Gap**: `16px` (gap: 2)

#### Responsive Grid (1-3 columns)
```tsx
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
  gap: 3 
}}>
```

**Specifications:**
- **Mobile**: 1 column
- **Desktop**: 3 columns
- **Gap**: `24px` (gap: 3)

#### Stats Grid (MUI)
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    {/* Stat card */}
  </Grid>
</Grid>
```

**Specifications:**
- **Mobile**: 1 column (xs={12})
- **Tablet**: 2 columns (sm={6})
- **Desktop**: 4 columns (md={3})
- **Spacing**: `24px` (spacing={3})

### Tailwind Grid Patterns

#### Features Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Feature cards */}
</div>
```

**Specifications:**
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns
- **Gap**: `32px` (gap-8)

#### Footer Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
  {/* Footer columns */}
</div>
```

**Specifications:**
- **Mobile**: 1 column
- **Desktop**: 4 columns
- **Gap**: `32px` (gap-8)

---

## Component Positioning

### Absolute Positioning

#### Decorative Elements (Header Cards)
```tsx
<Box 
  sx={{ 
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  }} 
/>
```

**Specifications:**
- **Position**: Absolute
- **Coordinates**: `top: -30px, right: -30px`
- **Size**: `120px × 120px`
- **Border Radius**: `50%` (circle)
- **Blur**: `40px`
- **Pointer Events**: `none` (non-interactive)

#### Icon in Input
```tsx
<Search className="absolute left-4 h-5 w-5 text-emerald-300" />
<input className="pl-12 ..." />
```

**Specifications:**
- **Position**: Absolute
- **Left**: `16px` (left-4)
- **Size**: `20px × 20px` (h-5 w-5)
- **Input Padding**: `48px` left (pl-12) to accommodate icon

### Fixed Positioning

#### Top Navigation
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 h-16">
```

**Specifications:**
- **Position**: Fixed
- **Top**: `0px`
- **Left**: `0px`
- **Right**: `0px`
- **Height**: `64px` (h-16)
- **Z-Index**: `50`

#### Sidebar
```tsx
<div className="fixed lg:fixed top-16 bottom-0 left-0 z-40">
```

**Specifications:**
- **Position**: Fixed
- **Top**: `64px` (top-16, below nav)
- **Bottom**: `0px`
- **Left**: `0px`
- **Width**: `256px` (w-64)
- **Z-Index**: `40`

#### Mobile Overlay
```tsx
<div className="fixed inset-0 bg-black/50 z-30 lg:hidden mt-16">
```

**Specifications:**
- **Position**: Fixed
- **Inset**: `0px` (covers entire viewport)
- **Z-Index**: `30`
- **Margin Top**: `64px` (below nav)

### Sticky Positioning

#### Public Navigation
```tsx
<nav className="sticky top-0 z-50">
```

**Specifications:**
- **Position**: Sticky
- **Top**: `0px`
- **Z-Index**: `50`

### Relative Positioning

#### Header Card Container
```tsx
<Card sx={{ position: 'relative', overflow: 'hidden' }}>
  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
    {/* Content */}
  </CardContent>
  <Box sx={{ position: 'absolute', ... }}>
    {/* Decorative element */}
  </Box>
</Card>
```

**Specifications:**
- **Card**: `position: relative` (for absolute children)
- **Content**: `position: relative, zIndex: 1` (above decorations)
- **Decorations**: `position: absolute` (behind content)

---

## Z-Index Layers

### Z-Index Hierarchy

#### Layer 50+ (Top Layer)
- **Top Navigation**: `z-50`
- **Public Navigation**: `z-50`
- **Dropdowns**: `z-50`

#### Layer 40-49 (Middle Layer)
- **Sidebar**: `z-40`
- **Mobile Menu**: `z-40`

#### Layer 30-39 (Overlay Layer)
- **Mobile Overlay**: `z-30`
- **Backdrop**: `z-30`

#### Layer 20-29 (Elevated Content)
- **Modals/Dialogs**: `z-[1300]` (MUI default, actually 1300)
- **Tooltips**: `z-[1500]` (MUI default)
- **Snackbars**: `z-[1400]` (MUI default)

#### Layer 0-19 (Base Layer)
- **Page Content**: `z-0` (default)
- **Cards**: `z-0` (default)
- **Backgrounds**: `z-0` (default)

### Relative Z-Index (Within Components)

#### Header Card
- **Content**: `zIndex: 1`
- **Decorative Elements**: `zIndex: 0` (default, behind)

#### Avatar with Ring
- **Ring**: `ring-2` (2px border, no z-index)
- **Content**: Default (above ring)

---

## Border Radius Values

### Exact Values (px)

#### Small Radius
- **2px**: `rounded-sm` (Tailwind) / `borderRadius: 0.25` (MUI)
- **4px**: `rounded` (Tailwind) / `borderRadius: 0.5` (MUI)
- **6px**: `rounded-md` (Tailwind) / `borderRadius: 0.75` (MUI)

#### Medium Radius
- **8px**: `rounded-lg` (Tailwind) / `borderRadius: 1` (MUI, theme default)
- **12px**: `rounded-xl` (Tailwind) / `borderRadius: 1.5` (MUI)

#### Large Radius
- **16px**: `rounded-2xl` (Tailwind) / `borderRadius: 2` (MUI)
- **24px**: `rounded-3xl` (Tailwind) / `borderRadius: 3` (MUI)

#### Full Radius
- **9999px**: `rounded-full` (Tailwind) / `borderRadius: '50%'` (MUI)

### Usage by Component

#### Buttons
- **Default**: `8px` (rounded-lg / borderRadius: 1)
- **Large**: `12px` (rounded-xl / borderRadius: 1.5)
- **Extra Large**: `16px` (rounded-2xl / borderRadius: 2)

#### Cards
- **Standard**: `24px` (rounded-3xl / borderRadius: 3)
- **Small**: `12px` (rounded-xl / borderRadius: 1.5)
- **Dialogs**: `16px` (rounded-2xl / borderRadius: 2)

#### Inputs
- **Default**: `12px` (rounded-xl / borderRadius: 1.5)
- **Small**: `8px` (rounded-lg / borderRadius: 1)

#### Badges/Chips
- **Default**: `9999px` (rounded-full / fully rounded)

#### Avatars
- **Default**: `9999px` (rounded-full / fully rounded)

---

## Shadow Definitions

### Tailwind Shadows

#### Shadow Sizes
- **shadow-sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **shadow**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- **shadow-md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **shadow-lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **shadow-xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
- **shadow-2xl**: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`

### Custom Shadows

#### Card Shadow (Green-Tinted)
```css
boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)'
```

**Specifications:**
- **X Offset**: `0px`
- **Y Offset**: `4px`
- **Blur**: `20px`
- **Spread**: `0px`
- **Color**: `rgba(22, 163, 74, 0.1)` (emerald-600 at 10% opacity)

#### Card Hover Shadow (Enhanced)
```css
boxShadow: '0 8px 32px rgba(22, 163, 74, 0.2)'
```

**Specifications:**
- **Y Offset**: `8px`
- **Blur**: `32px`
- **Color**: `rgba(22, 163, 74, 0.2)` (emerald-600 at 20% opacity)

#### Navigation Shadow
```css
shadow-xl
/* 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) */
```

**Usage**: Top navigation, sidebar

#### Button Shadow (With Tint)
```css
shadow-lg shadow-emerald-200
```

**Specifications:**
- **Base**: `shadow-lg`
- **Tint**: `shadow-emerald-200` (adds emerald tint)

#### Error Shadow (Red-Tinted)
```css
boxShadow: '0 4px 20px rgba(220, 38, 38, 0.1)'
```

**Specifications:**
- **Color**: `rgba(220, 38, 38, 0.1)` (red-600 at 10% opacity)

---

## Spacing System Reference

### 8px Base Unit System

All spacing values are multiples of 8px:

- **0.5**: `4px` (0.5 × 8)
- **1**: `8px` (1 × 8)
- **1.5**: `12px` (1.5 × 8)
- **2**: `16px` (2 × 8)
- **2.5**: `20px` (2.5 × 8)
- **3**: `24px` (3 × 8)
- **4**: `32px` (4 × 8)
- **5**: `40px` (5 × 8)
- **6**: `48px` (6 × 8)
- **8**: `64px` (8 × 8)
- **10**: `80px` (10 × 8)
- **12**: `96px` (12 × 8)
- **16**: `128px` (16 × 8)
- **20**: `160px` (20 × 8)
- **24**: `192px` (24 × 8)

### Common Spacing Combinations

#### Card Internal Spacing
- **Padding**: `24px` (p: 3)
- **Gap Between Elements**: `16px` (gap: 2 or mb: 2)

#### Section Spacing
- **Between Major Sections**: `40px` (mb: 5)
- **Between Cards**: `32px` (mb: 4)
- **Between Items**: `24px` (mb: 3)

#### Form Spacing
- **Between Fields**: `16px` (mb: 2)
- **Between Groups**: `24px` (mb: 3)
- **Form Padding**: `32px` (p: 4)

---

## Implementation Notes

1. **Consistent Base Unit**: All spacing uses 8px base unit
2. **Responsive Spacing**: Padding and margins scale with breakpoints
3. **Z-Index Management**: Clear hierarchy prevents conflicts
4. **Positioning Strategy**: Fixed for navigation, relative for containers, absolute for decorations
5. **Shadow Consistency**: Green-tinted shadows for brand consistency
6. **Border Radius**: Larger radius (24px) for cards, smaller (8-12px) for buttons/inputs

---

## Next Steps
- See Part 1: Theme & Color System
- See Part 2: Typography System
- See Part 3: Layout Structure
- See Part 4: Component Patterns
- See Part 5: Page-Specific Designs
- See Part 7: Responsive Design Patterns

