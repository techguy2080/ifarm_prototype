# Visual Design Documentation - Part 7: Responsive Design Patterns

## Overview
This document captures all responsive design patterns including breakpoints, mobile navigation, responsive typography, spacing adjustments, and layout adaptations across different screen sizes.

---

## Breakpoint System

### Tailwind Breakpoints

#### Default Breakpoints
- **sm**: `640px` - Small devices (tablets portrait)
- **md**: `768px` - Medium devices (tablets landscape)
- **lg**: `1024px` - Large devices (desktops)
- **xl**: `1280px` - Extra large devices
- **2xl**: `1536px` - 2X large devices

### MUI Breakpoints

#### Default Breakpoints
- **xs**: `0px` - Extra small devices (mobile)
- **sm**: `600px` - Small devices (tablets)
- **md**: `900px` - Medium devices (tablets landscape)
- **lg**: `1200px` - Large devices (desktops)
- **xl**: `1536px` - Extra large devices

### Breakpoint Usage Strategy

#### Mobile-First Approach
All responsive styles start with mobile (xs) and scale up:
```tsx
sx={{ 
  fontSize: { xs: '0.75rem', sm: '0.875rem' },
  padding: { xs: 2, sm: 3, md: 4 }
}}
```

---

## Mobile Breakpoints (< 640px / < 600px)

### Layout Adaptations

#### Dashboard Layout
- **Sidebar**: Hidden by default, slides in from left
- **Top Nav**: Full width, hamburger menu visible
- **Content**: Full width, no left margin
- **Padding**: Reduced to `24px` (p: 3)

#### Navigation
- **Top Nav Logo**: Icon only (text hidden)
- **Search**: Hidden
- **User Info**: Hidden
- **Mobile Menu**: Hamburger icon visible

#### Sidebar
- **Position**: Fixed, off-screen by default
- **Width**: `256px` (w-64)
- **Overlay**: Dark overlay when open
- **Transform**: `translate-x-0` (open) or `-translate-x-full` (closed)

### Component Adaptations

#### Cards
- **Padding**: `24px` (p: 3)
- **Margin Bottom**: `32px` (mb: 4)
- **Border Radius**: `24px` (borderRadius: 3)

#### Buttons
- **Full Width**: Often full width on mobile
- **Padding**: `8px 16px` (py-2 px-4)
- **Font Size**: `14px` (text-sm)

#### Tables
- **Horizontal Scroll**: Enabled
- **Font Size**: `12px` (0.75rem)
- **Column Hiding**: Some columns hidden
- **Min Width**: `800px` (prevents squishing)

#### Typography
- **Headings**: Reduced sizes
  - H1: `text-3xl` (30px)
  - H2: `text-2xl` (24px)
  - H3: `text-xl` (20px)
- **Body**: `text-sm` (14px)

### Grid Adaptations

#### Stats Grid
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    {/* 1 column mobile, 2 tablet, 4 desktop */}
  </Grid>
</Grid>
```

#### Features Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

#### Info Grid
```tsx
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
  gap: 2 
}}>
  {/* 2 columns mobile, 4 desktop */}
</Box>
```

---

## Tablet Breakpoints (640px - 1024px / 600px - 1200px)

### Layout Adaptations

#### Dashboard Layout
- **Sidebar**: Still hidden, accessible via menu
- **Top Nav**: Search visible, user info may be hidden
- **Content**: Full width
- **Padding**: `32px` (p: 4)

#### Navigation
- **Top Nav Logo**: Icon + text visible
- **Search**: Visible, smaller width
- **User Info**: May be hidden on smaller tablets

### Component Adaptations

#### Cards
- **Padding**: `32px` (p: 4)
- **Grid**: 2 columns for stats/features

#### Tables
- **Font Size**: `14px` (0.875rem)
- **More Columns**: Visible compared to mobile

#### Typography
- **Headings**: Medium sizes
  - H1: `text-4xl` (36px)
  - H2: `text-3xl` (30px)
  - H3: `text-2xl` (24px)

---

## Desktop Breakpoints (≥ 1024px / ≥ 1200px)

### Layout Adaptations

#### Dashboard Layout
- **Sidebar**: Always visible, fixed position
- **Top Nav**: Full features visible
- **Content**: `calc(100vw - 256px)` width, `256px` left margin
- **Padding**: `40px` (p: 5)

#### Navigation
- **Top Nav**: All elements visible
- **Search**: Full width `320px` (xl:w-80)
- **User Info**: Visible with avatar and details

### Component Adaptations

#### Cards
- **Padding**: `32px` (p: 4) or `40px` (p: 5)
- **Grid**: 3-4 columns for stats/features

#### Tables
- **Font Size**: `14px` (0.875rem)
- **All Columns**: Visible
- **Min Width**: Enforced to prevent squishing

#### Typography
- **Headings**: Full sizes
  - H1: `text-5xl` to `text-8xl` (48px - 96px)
  - H2: `text-4xl` to `text-6xl` (36px - 60px)
  - H3: `text-2xl` to `text-3xl` (24px - 30px)

---

## Responsive Typography

### Heading Sizes

#### H1 (Hero)
```tsx
className="text-5xl md:text-7xl lg:text-8xl"
```
- **Mobile**: `48px` (text-5xl)
- **Tablet**: `72px` (text-7xl)
- **Desktop**: `96px` (text-8xl)

#### H2 (Section)
```tsx
className="text-4xl md:text-6xl"
```
- **Mobile**: `36px` (text-4xl)
- **Desktop**: `60px` (text-6xl)

#### H3 (Subsection)
```tsx
sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
```
- **Mobile**: `24px` (1.5rem)
- **Tablet**: `32px` (2rem)
- **Desktop**: `40px` (2.5rem)

### Body Text Sizes

#### Body Text
```tsx
sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
```
- **Mobile**: `14px` (0.875rem)
- **Desktop**: `16px` (1rem)

#### Small Text
```tsx
sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
```
- **Mobile**: `12px` (0.75rem)
- **Desktop**: `14px` (0.875rem)

---

## Responsive Spacing

### Padding Adjustments

#### Page Padding
```tsx
sx={{ p: { xs: 3, sm: 4, md: 5 } }}
```
- **Mobile**: `24px` (p: 3)
- **Tablet**: `32px` (p: 4)
- **Desktop**: `40px` (p: 5)

#### Card Padding
```tsx
sx={{ p: { xs: 2, sm: 3, md: 4 } }}
```
- **Mobile**: `16px` (p: 2)
- **Tablet**: `24px` (p: 3)
- **Desktop**: `32px` (p: 4)

### Margin Adjustments

#### Section Margins
```tsx
sx={{ mb: { xs: 3, sm: 4, md: 5 } }}
```
- **Mobile**: `24px` (mb: 3)
- **Tablet**: `32px` (mb: 4)
- **Desktop**: `40px` (mb: 5)

### Gap Adjustments

#### Grid Gaps
```tsx
sx={{ gap: { xs: 2, sm: 3, md: 4 } }}
```
- **Mobile**: `16px` (gap: 2)
- **Tablet**: `24px` (gap: 3)
- **Desktop**: `32px` (gap: 4)

---

## Mobile Navigation Patterns

### Hamburger Menu

#### Button
```tsx
<button
  className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
  onClick={() => setSidebarOpen(!sidebarOpen)}
>
  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
</button>
```

**Specifications:**
- **Display**: `lg:hidden` (visible on mobile/tablet)
- **Size**: `h-6 w-6` (24px)
- **Padding**: `p-2` (8px)

### Sidebar Animation

#### Transform
```tsx
<div className={`
  fixed lg:fixed top-16 bottom-0 left-0 z-40
  transform transition-transform duration-300 ease-in-out
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
```

**Specifications:**
- **Open**: `translate-x-0` (visible)
- **Closed**: `-translate-x-full` (hidden left)
- **Desktop**: Always `translate-x-0`
- **Transition**: `duration-300 ease-in-out`

### Overlay

#### Mobile Overlay
```tsx
{sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-30 lg:hidden mt-16"
    onClick={() => setSidebarOpen(false)}
  />
)}
```

**Specifications:**
- **Background**: `bg-black/50` (50% opacity black)
- **Z-Index**: `30` (below sidebar)
- **Display**: `lg:hidden` (mobile only)
- **Margin Top**: `mt-16` (below nav)

---

## Responsive Display Patterns

### Show/Hide Based on Breakpoint

#### Hide on Mobile
```tsx
sx={{ display: { xs: 'none', md: 'block' } }}
className="hidden md:block"
```

#### Show Only on Mobile
```tsx
sx={{ display: { xs: 'block', md: 'none' } }}
className="block md:hidden"
```

#### Hide on Small Screens
```tsx
sx={{ display: { xs: 'none', sm: 'table-cell' } }}
className="hidden sm:table-cell"
```

### Common Patterns

#### Search Bar
- **Mobile**: Hidden (`hidden md:flex`)
- **Desktop**: Visible

#### User Info
- **Mobile**: Hidden (`hidden xl:flex`)
- **Desktop**: Visible

#### Table Columns
- **Mobile**: Essential columns only
- **Tablet**: More columns visible
- **Desktop**: All columns visible

---

## Responsive Grid Patterns

### Stats Grid
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    {/* Stat Card */}
  </Grid>
</Grid>
```

**Breakdown:**
- **Mobile (xs)**: 1 column (xs={12})
- **Tablet (sm)**: 2 columns (sm={6})
- **Desktop (md)**: 4 columns (md={3})

### Features Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Feature Card */}
</div>
```

**Breakdown:**
- **Mobile**: 1 column
- **Tablet (md)**: 2 columns
- **Desktop (lg)**: 3 columns

### Info Grid
```tsx
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
  gap: 2 
}}>
  {/* Info Card */}
</Box>
```

**Breakdown:**
- **Mobile (xs)**: 2 columns
- **Desktop (sm)**: 4 columns

---

## Responsive Button Patterns

### Full Width on Mobile
```tsx
<Button
  fullWidth
  sx={{
    width: { xs: '100%', sm: 'auto' }
  }}
>
  Button
</Button>
```

### Icon Size Adjustment
```tsx
<Button
  startIcon={<Add />}
  sx={{
    '& .MuiSvgIcon-root': {
      fontSize: { xs: '1rem', sm: '1.25rem' }
    }
  }}
>
  Button
</Button>
```

---

## Responsive Dialog Patterns

### Full Screen on Mobile
```tsx
<Dialog
  sx={{
    '& .MuiDialog-paper': {
      m: { xs: 0, sm: 2 },
      borderRadius: { xs: 0, sm: 2 },
      maxHeight: { xs: '100vh', sm: '90vh' }
    }
  }}
>
```

**Specifications:**
- **Mobile**: Full screen (`m: 0, borderRadius: 0`)
- **Desktop**: Centered with margin (`m: 2, borderRadius: 2`)

---

## Responsive Image Patterns

### Hero Background
```tsx
<div className="absolute inset-0 opacity-20">
  <div className="absolute top-20 left-10 w-72 h-72 md:w-96 md:h-96 bg-green-500 rounded-full filter blur-3xl"></div>
</div>
```

**Specifications:**
- **Mobile**: `w-72 h-72` (288px)
- **Desktop**: `md:w-96 md:h-96` (384px)

---

## Implementation Notes

1. **Mobile-First**: All styles start with mobile and scale up
2. **Breakpoint Consistency**: Use Tailwind for public pages, MUI for dashboard
3. **Progressive Enhancement**: Add features as screen size increases
4. **Touch Targets**: Minimum 44px × 44px for mobile interactions
5. **Readability**: Font sizes never go below 12px
6. **Performance**: Hide non-essential elements on mobile to improve performance

---

## Next Steps
- See Part 1: Theme & Color System
- See Part 2: Typography System
- See Part 3: Layout Structure
- See Part 4: Component Patterns
- See Part 5: Page-Specific Designs
- See Part 6: UI Element Positioning & Spacing
- See Part 8: Animation & Transitions

