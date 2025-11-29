# Visual Design Documentation - Part 3: Layout Structure

## Overview
This document captures all layout specifications including dashboard structure, public page layouts, container widths, spacing systems, grid systems, and responsive breakpoints.

---

## Dashboard Layout Structure

### Overall Structure
**Location:** `app/dashboard/layout.tsx`

```
┌─────────────────────────────────────────┐
│  Top Navigation Bar (Fixed, z-50)      │ ← 64px height
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Main Content Area           │
│ (Fixed)  │  (Scrollable)                │
│ 256px    │  calc(100vw - 256px)         │
│ width    │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Top Navigation Bar

#### Dimensions
- **Height**: `64px` (h-16)
- **Position**: Fixed at top (`fixed top-0 left-0 right-0`)
- **Z-Index**: `50` (z-50)
- **Background**: `linear-gradient(to-r, from-emerald-950 via-emerald-900 to-teal-900)`
- **Border**: `border-b-2 border-emerald-800`
- **Backdrop**: `backdrop-blur-sm`
- **Shadow**: `shadow-xl`

#### Content Layout
- **Padding**: `px-4 sm:px-6` (16px mobile, 24px desktop)
- **Display**: Flexbox (`flex items-center justify-between`)
- **Height**: `h-16` (64px)

#### Mobile Menu Button
- **Display**: Visible on `lg:hidden` (hidden on large screens)
- **Padding**: `p-2`
- **Size**: Icon `h-6 w-6`

#### Search Bar
- **Display**: Hidden on mobile (`hidden md:flex`)
- **Width**: `w-64 xl:w-80` (256px default, 320px on xl)
- **Padding**: `pl-12 pr-4 py-2.5`
- **Border Radius**: `rounded-xl` (12px)

#### User Info
- **Display**: Hidden on mobile (`hidden xl:flex`)
- **Border**: `border-l border-emerald-700/50`
- **Padding**: `pl-4`
- **Avatar Size**: `h-10 w-10` (40px)

### Sidebar

#### Dimensions
**Location:** `components/Sidebar.tsx`

- **Width**: `256px` (w-64)
- **Height**: Full height (`h-full`)
- **Position**: Fixed (`fixed lg:fixed top-16 bottom-0 left-0`)
- **Z-Index**: `40` (z-40)
- **Background**: White (`bg-white`)
- **Border**: `border-r-2 border-gray-200`
- **Shadow**: `shadow-xl`

#### Mobile Behavior
- **Transform**: `translate-x-0` (open) or `-translate-x-full` (closed)
- **Transition**: `transition-transform duration-300 ease-in-out`
- **Overlay**: `bg-black/50` with `z-30` when open on mobile

#### Sidebar Sections

##### Logo Section
- **Height**: `64px` (h-16)
- **Padding**: `px-6`
- **Border**: `border-b-2 border-gray-200`
- **Background**: `bg-gradient-to-r from-emerald-50 to-white`
- **Display**: Hidden on mobile (`hidden lg:flex`)

##### Mobile Header
- **Height**: `64px` (h-16)
- **Padding**: `px-4`
- **Border**: `border-b-2 border-gray-200`
- **Background**: `bg-gradient-to-r from-emerald-50 to-white`
- **Display**: Visible on mobile (`lg:hidden`)

##### User Info (Mobile)
- **Padding**: `px-4 py-4`
- **Border**: `border-b-2 border-gray-200`
- **Background**: `bg-gradient-to-br from-emerald-50 to-white`
- **Avatar Size**: `h-12 w-12` (48px)

##### Navigation Area
- **Padding**: `py-4 px-3`
- **Background**: `bg-white`
- **Overflow**: `overflow-y-auto` (scrollable)

##### Logout Section
- **Padding**: `p-4`
- **Border**: `border-t-2 border-gray-200`
- **Background**: `bg-gradient-to-br from-white to-gray-50`

#### Navigation Item Spacing
- **Item Spacing**: `space-y-1` (4px between items)
- **Item Padding**: `px-4 py-3` (16px horizontal, 12px vertical)
- **Section Spacing**: `mb-1` (4px between sections)

### Main Content Area

#### Dimensions
- **Width**: `w-full lg:w-[calc(100vw-256px)]`
- **Margin Left**: `lg:ml-64` (256px on large screens)
- **Height**: `calc(100vh - 64px)` (full viewport minus top nav)
- **Overflow**: `overflow-y-auto overflow-x-hidden`
- **Margin Top**: `mt-16` (64px to account for fixed top nav)

#### Content Container
**Location:** `components/DashboardContainer.tsx`

- **Max Width**: `1400px`
- **Padding**: 
  - Mobile: `24px` (p: 3)
  - Tablet: `32px` (p: 4)
  - Desktop: `40px` (p: 5)
- **Background**: `linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)`
- **Min Height**: `auto` (configurable)
- **Display**: Flexbox (`display: flex, justifyContent: center`)

---

## Public Pages Layout Structure

### Overall Structure
**Location:** `app/(public)/layout.tsx`

```
┌─────────────────────────────────────────┐
│  Public Navigation (Sticky, z-50)      │ ← 64px height
├─────────────────────────────────────────┤
│                                         │
│         Main Content Area               │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│         Footer                         │
└─────────────────────────────────────────┘
```

### Public Navigation

#### Dimensions
- **Height**: `64px` (h-16)
- **Position**: Sticky at top (`sticky top-0`)
- **Z-Index**: `50` (z-50)
- **Background**: White (`bg-white`)
- **Border**: `border-b border-gray-200`
- **Shadow**: `shadow-sm`

#### Container
- **Container**: `container mx-auto px-4`
- **Max Width**: Container default (typically 1280px)
- **Padding**: `px-4` (16px horizontal)

#### Logo Section
- **Logo Size**: `w-12 h-12` (48px)
- **Gap**: `gap-3` (12px)
- **Icon Size**: `w-7 h-7` (28px)

#### Navigation Links
- **Spacing**: `space-x-8` (32px between items)
- **Display**: Hidden on mobile (`hidden md:flex`)

#### Mobile Menu
- **Button**: Visible on mobile (`md:hidden`)
- **Menu**: Dropdown below nav (`py-4 space-y-3`)
- **Border**: `border-t border-gray-200`

### Footer

#### Dimensions
- **Background**: `bg-gray-900`
- **Text Color**: White (`text-white`)
- **Margin Top**: `mt-20` (80px)
- **Padding**: `py-12` (48px vertical)
- **Container**: `container mx-auto px-4`

#### Grid Layout
- **Grid**: `grid grid-cols-1 md:grid-cols-4 gap-8`
- **Columns**: 1 on mobile, 4 on desktop
- **Gap**: `gap-8` (32px)

#### Footer Bottom
- **Border**: `border-t border-gray-800`
- **Margin**: `mt-8 pt-8` (32px top)
- **Text Align**: `text-center`
- **Text Color**: `text-gray-400`

---

## Container Widths and Max-Widths

### Dashboard Containers

#### Main Content Container
- **Max Width**: `1400px`
- **Width**: `100%`
- **Margin**: `0 auto` (centered)
- **Padding**: Responsive (see spacing section)

#### Page Content Wrapper
- **Max Width**: `1400px`
- **Width**: `100%`
- **Margin**: `0 auto`

### Public Page Containers

#### Hero Section Container
- **Container**: `container mx-auto px-4`
- **Max Width**: Container default (1280px)
- **Inner Max Width**: `max-w-5xl` (896px) for centered content
- **Padding**: `px-4` (16px horizontal)

#### Section Containers
- **Container**: `container mx-auto px-4`
- **Max Width**: Container default
- **Content Max Width**: `max-w-7xl` (1280px) for features grid
- **Padding**: `px-4` (16px horizontal)

### Card Containers
- **Width**: `100%`
- **Max Width**: `100%` (within parent container)
- **Padding**: Varies (see component patterns)

---

## Spacing System

### MUI Spacing (Theme-Based)
MUI uses an 8px base spacing unit. Values are multiplied by 8px:

- **0**: `0px`
- **0.5**: `4px`
- **1**: `8px`
- **1.5**: `12px`
- **2**: `16px`
- **2.5**: `20px`
- **3**: `24px`
- **4**: `32px`
- **5**: `40px`
- **6**: `48px`
- **8**: `64px`

### Tailwind Spacing Scale

#### Padding & Margin
- **p-0**: `0px`
- **p-1**: `4px` (0.25rem)
- **p-2**: `8px` (0.5rem)
- **p-3**: `12px` (0.75rem)
- **p-4**: `16px` (1rem)
- **p-5**: `20px` (1.25rem)
- **p-6**: `24px` (1.5rem)
- **p-8**: `32px` (2rem)
- **p-10**: `40px` (2.5rem)
- **p-12**: `48px` (3rem)
- **p-16**: `64px` (4rem)
- **p-20**: `80px` (5rem)
- **p-24**: `96px` (6rem)

#### Gap (Grid/Flexbox)
- **gap-1**: `4px`
- **gap-2**: `8px`
- **gap-3**: `12px`
- **gap-4**: `16px`
- **gap-5**: `20px`
- **gap-6**: `24px`
- **gap-8**: `32px`
- **gap-10**: `40px`
- **gap-12**: `48px`

### Common Spacing Patterns

#### Page Padding
```tsx
p: { xs: 3, sm: 4, md: 5 }  // 24px → 32px → 40px
```

#### Card Padding
- **Small**: `p: 2` (16px)
- **Medium**: `p: 3` (24px)
- **Large**: `p: 4` (32px)

#### Card Content Padding
- **Default**: `p: 3` (24px)
- **Large**: `p: 4` (32px)
- **No Padding**: `p: 0` (for tables)

#### Section Spacing
- **Between Sections**: `mb: 5` (40px) or `mb-5`
- **Between Cards**: `mb: 4` (32px) or `mb-4`
- **Between Items**: `mb: 3` (24px) or `mb-3`
- **Small Gap**: `mb: 2` (16px) or `mb-2`

#### Stack Spacing (MUI)
```tsx
<Stack spacing={2}>  // 16px gap
<Stack spacing={3}>  // 24px gap
<Stack spacing={4}>  // 32px gap
```

---

## Grid Systems

### MUI Grid

#### Basic Grid
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Content */}
  </Grid>
</Grid>
```

#### Common Grid Patterns
- **2 Columns**: `xs={12} sm={6}`
- **3 Columns**: `xs={12} sm={6} md={4}`
- **4 Columns**: `xs={12} sm={6} md={3}`
- **Full Width**: `xs={12}`

### Tailwind Grid

#### Basic Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Content */}
</div>
```

#### Common Grid Patterns
- **1 Column Mobile, 2 Desktop**: `grid-cols-1 md:grid-cols-2`
- **1 Column Mobile, 3 Desktop**: `grid-cols-1 md:grid-cols-3`
- **1 Column Mobile, 4 Desktop**: `grid-cols-1 md:grid-cols-4`
- **Responsive**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

#### Grid Gaps
- **Small**: `gap-4` (16px)
- **Medium**: `gap-6` (24px)
- **Large**: `gap-8` (32px)

### Custom Grid Patterns

#### Stats Grid (Dashboard)
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    {/* Stat Card */}
  </Grid>
</Grid>
```

#### Features Grid (Public)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
  {/* Feature Card */}
</div>
```

#### Table Grid (Info Cards)
```tsx
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
  gap: 2 
}}>
  {/* Info Cards */}
</Box>
```

---

## Responsive Breakpoints

### Tailwind Breakpoints

#### Default Breakpoints
- **sm**: `640px` - Small devices (tablets)
- **md**: `768px` - Medium devices (tablets landscape)
- **lg**: `1024px` - Large devices (desktops)
- **xl**: `1280px` - Extra large devices
- **2xl**: `1536px` - 2X large devices

### MUI Breakpoints

#### Default Breakpoints
- **xs**: `0px` - Extra small devices
- **sm**: `600px` - Small devices
- **md**: `900px` - Medium devices
- **lg**: `1200px` - Large devices
- **xl**: `1536px` - Extra large devices

### Breakpoint Usage Patterns

#### Responsive Padding
```tsx
sx={{ p: { xs: 3, sm: 4, md: 5 } }}
// Mobile: 24px, Tablet: 32px, Desktop: 40px
```

#### Responsive Display
```tsx
sx={{ display: { xs: 'none', md: 'table-cell' } }}
// Hidden on mobile, visible on desktop
```

#### Responsive Width
```tsx
className="w-full md:w-64 xl:w-80"
// Full width mobile, 256px tablet, 320px desktop
```

#### Responsive Grid
```tsx
gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }
// 2 columns mobile, 4 columns tablet+
```

---

## Z-Index Layers

### Z-Index Hierarchy

#### Top Layer (50+)
- **Top Navigation**: `z-50`
- **Public Navigation**: `z-50`
- **Mobile Menu Overlay**: `z-30` (below nav)

#### Middle Layer (40-49)
- **Sidebar**: `z-40`
- **Dialogs/Modals**: MUI default (typically 1300)

#### Base Layer (0-39)
- **Page Content**: `z-0` (default)
- **Cards**: `z-0` (default)
- **Backgrounds**: `z-0` (default)

### Common Z-Index Values
- **Overlay**: `z-30`
- **Sidebar**: `z-40`
- **Top Nav**: `z-50`
- **Dropdowns**: `z-50` (same as nav)
- **Modals**: `z-[1300]` (MUI default)

---

## Border Radius Values

### MUI Border Radius
- **Default**: `8px` (theme.shape.borderRadius)
- **Small**: `4px` (rounded-sm)
- **Medium**: `8px` (rounded-md)
- **Large**: `12px` (rounded-lg)

### Tailwind Border Radius
- **rounded-none**: `0px`
- **rounded-sm**: `2px` (0.125rem)
- **rounded**: `4px` (0.25rem)
- **rounded-md**: `6px` (0.375rem)
- **rounded-lg**: `8px` (0.5rem)
- **rounded-xl**: `12px` (0.75rem)
- **rounded-2xl**: `16px` (1rem)
- **rounded-3xl**: `24px` (1.5rem)
- **rounded-full**: `9999px` (fully rounded)

### Common Border Radius Usage
- **Buttons**: `rounded-lg` (8px) or `rounded-xl` (12px)
- **Cards**: `rounded-3xl` (24px) or `borderRadius: 3` (24px MUI)
- **Inputs**: `rounded-lg` (8px) or `rounded-xl` (12px)
- **Badges**: `rounded-full` (fully rounded)
- **Dialogs**: `borderRadius: 2` (16px MUI) or `rounded-2xl`
- **Avatars**: `rounded-full` (fully rounded)

---

## Shadow Definitions

### Tailwind Shadows
- **shadow-sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **shadow**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- **shadow-md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **shadow-lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **shadow-xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
- **shadow-2xl**: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`

### Custom Shadows

#### Card Shadow
```css
boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)'
// Green-tinted shadow for cards
```

#### Card Hover Shadow
```css
boxShadow: '0 8px 32px rgba(22, 163, 74, 0.2)'
// Enhanced green-tinted shadow on hover
```

#### Navigation Shadow
```css
shadow-xl
// Large shadow for elevated navigation
```

#### Button Shadow
```css
shadow-lg shadow-emerald-200
// Large shadow with emerald tint
```

---

## Layout Implementation Notes

1. **Fixed Positioning**: Top nav and sidebar use fixed positioning for persistent navigation
2. **Flexbox**: Primary layout method for component alignment
3. **Grid**: Used for card layouts and responsive columns
4. **Container Pattern**: Max-width containers center content and provide consistent spacing
5. **Mobile-First**: All responsive styles start with mobile and scale up
6. **Overflow Handling**: Main content area is scrollable, sidebar navigation is scrollable
7. **Z-Index Management**: Clear hierarchy prevents layering conflicts

---

## Next Steps
- See Part 1: Theme & Color System
- See Part 2: Typography System
- See Part 4: Component Patterns

