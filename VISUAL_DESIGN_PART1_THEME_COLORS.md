# Visual Design Documentation - Part 1: Theme & Color System

## Overview
This document captures all color values, gradients, and theme configurations used throughout the iFarm application. This enables precise reconstruction of the UI's color scheme.

---

## MUI Theme Configuration

### Primary Colors
**Location:** `components/ThemeProvider.tsx`

```typescript
primary: {
  main: '#16a34a',    // green-600 - Primary action color
  light: '#22c55e',   // green-500 - Hover states, lighter variants
  dark: '#15803d',    // green-700 - Active states, darker variants
}
```

**Usage Context:**
- Primary buttons
- Active navigation items
- Success states
- Brand accents
- Links and interactive elements

### Secondary Colors
```typescript
secondary: {
  main: '#6b7280',    // gray-500 - Secondary actions, neutral elements
}
```

**Usage Context:**
- Secondary buttons
- Disabled states
- Neutral text and borders
- Secondary navigation items

### Background Colors
```typescript
background: {
  default: '#f9fafb',  // gray-50 - Main page background
  paper: '#ffffff',     // white - Card backgrounds, elevated surfaces
}
```

**Usage Context:**
- Page backgrounds (`default`)
- Card components (`paper`)
- Modal/dialog backgrounds
- Elevated surfaces

### Theme Shape
```typescript
shape: {
  borderRadius: 8,     // 8px - Default border radius for all components
}
```

**Usage Context:**
- Buttons
- Cards
- Input fields
- Dialogs
- All rounded corners

---

## Tailwind Color Usage

### Emerald/Green Scale (Primary Brand Colors)
The application heavily uses Tailwind's emerald and green color scales:

- **emerald-50**: `#ecfdf5` - Light backgrounds, subtle highlights
- **emerald-100**: `#d1fae5` - Badge backgrounds, light accents
- **emerald-200**: `#a7f3d0` - Borders, dividers
- **emerald-300**: `#6ee7b7` - Hover states, secondary accents
- **emerald-400**: `#34d399` - Text accents, highlights
- **emerald-500**: `#10b981` - Primary brand color (alternative)
- **emerald-600**: `#059669` - Primary brand color (main)
- **emerald-700**: `#047857` - Darker variants, active states
- **emerald-800**: `#065f46` - Very dark variants
- **emerald-900**: `#064e3b` - Darkest variants
- **emerald-950**: `#022c22` - Ultra dark backgrounds

- **green-50**: `#f0fdf4` - Light backgrounds
- **green-100**: `#dcfce7` - Light accents
- **green-500**: `#22c55e` - Primary light variant
- **green-600**: `#16a34a` - Primary main (matches MUI)
- **green-700**: `#15803d` - Primary dark
- **green-800**: `#166534` - Dark variants
- **green-900**: `#14532d` - Very dark variants

### Gray Scale (Neutral Colors)
- **gray-50**: `#f9fafb` - Page backgrounds
- **gray-100**: `#f3f4f6` - Subtle backgrounds
- **gray-200**: `#e5e7eb` - Borders, dividers
- **gray-300**: `#d1d5db` - Light borders
- **gray-400**: `#9ca3af` - Disabled text
- **gray-500**: `#6b7280` - Secondary text, icons
- **gray-600**: `#4b5563` - Body text
- **gray-700**: `#374151` - Headings, emphasis
- **gray-800**: `#1f2937` - Dark text
- **gray-900**: `#111827` - Darkest text, backgrounds

### Status Colors

#### Success (Green/Emerald)
- **Background**: `bg-emerald-100` / `#d1fae5`
- **Text**: `text-emerald-800` / `#065f46`
- **Border**: `border-emerald-200` / `#a7f3d0`
- **Usage**: Success messages, positive states, completed actions

#### Warning (Yellow)
- **Background**: `bg-yellow-100` / `#fef3c7`
- **Text**: `text-yellow-800` / `#92400e`
- **Border**: `border-yellow-200` / `#fde68a`
- **Usage**: Warnings, pending states, caution indicators

#### Error/Danger (Red)
- **Background**: `bg-red-100` / `#fee2e2`
- **Text**: `text-red-800` / `#991b1b`
- **Border**: `border-red-200` / `#fecaca`
- **MUI Error**: Uses MUI's default error palette
- **Usage**: Errors, destructive actions, critical alerts

#### Info (Blue/Cyan)
- **Background**: `bg-blue-100` / `#dbeafe`
- **Text**: `text-blue-800` / `#1e40af`
- **Usage**: Informational messages, neutral alerts

---

## CSS Custom Properties

**Location:** `app/globals.css`

```css
:root {
  --background: 0 0% 100%;           /* White (HSL format) */
  --foreground: 222.2 84% 4.9%;     /* Dark gray (HSL format) */
}
```

**Usage:**
- Used with Tailwind's `background` and `foreground` color utilities
- Provides theme-level color variables
- Can be extended for dark mode support

---

## Gradient Definitions

### Primary Gradients

#### Dashboard Background Gradient
```css
background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)
```
- **Colors**: `emerald-50` to `green-100`
- **Direction**: 135deg (diagonal from top-left to bottom-right)
- **Usage**: Default dashboard page backgrounds
- **Location**: `components/DashboardContainer.tsx`

#### Header Card Gradient (Green)
```css
background: linear-gradient(135deg, #15803d 0%, #22c55e 100%)
```
- **Colors**: `green-700` to `green-500`
- **Direction**: 135deg
- **Usage**: Page header cards, prominent CTAs
- **Example**: Delegations page header, Animals page header

#### Top Navigation Gradient (Dark)
```css
background: linear-gradient(to-r, from-emerald-950 via-emerald-900 to-teal-900)
```
- **Colors**: `emerald-950` → `emerald-900` → `teal-900`
- **Direction**: Left to right
- **Usage**: Dashboard top navigation bar
- **Location**: `app/dashboard/layout.tsx`

#### Public Hero Section Gradient
```css
background: linear-gradient(to-br, from-emerald-950 via-green-900 to-teal-900)
```
- **Colors**: `emerald-950` → `green-900` → `teal-900`
- **Direction**: Top-left to bottom-right
- **Usage**: Public homepage hero section
- **Location**: `app/(public)/page.tsx`

#### Sidebar Logo Gradient
```css
background: linear-gradient(to-r, from-emerald-50 to-white)
```
- **Colors**: `emerald-50` to `white`
- **Direction**: Left to right
- **Usage**: Sidebar header background
- **Location**: `components/Sidebar.tsx`

#### Active Navigation Item Gradient
```css
background: linear-gradient(to-r, from-emerald-500 to-emerald-600)
```
- **Colors**: `emerald-500` to `emerald-600`
- **Direction**: Left to right
- **Usage**: Active sidebar navigation items
- **Location**: `components/Sidebar.tsx`

#### Category Gradients (Role Templates)
```typescript
medical: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)'
operations: 'linear-gradient(135deg, #047857 0%, #10b981 100%)'
financial: 'linear-gradient(135deg, #065f46 0%, #059669 100%)'
```
- **Usage**: Role template category cards
- **Location**: `app/dashboard/role-templates/page.tsx`

#### Text Gradient (Animated)
```css
background: linear-gradient(to-r, from-emerald-400 via-green-300 to-teal-400)
background-clip: text
-webkit-background-clip: text
color: transparent
```
- **Colors**: `emerald-400` → `green-300` → `teal-400`
- **Usage**: Hero section headings with animated gradient
- **Animation**: `gradient` keyframe (3s ease infinite)

#### Button Hover Gradient
```css
background: linear-gradient(to-r, from-emerald-50 to-emerald-100)
```
- **Colors**: `emerald-50` to `emerald-100`
- **Usage**: Navigation item hover states
- **Location**: `components/Sidebar.tsx`

---

## Color Usage Patterns

### Header Cards
- **Background**: `linear-gradient(135deg, #15803d 0%, #22c55e 100%)`
- **Text**: White (`#ffffff`)
- **Icon Background**: `rgba(255, 255, 255, 0.2)` with `backdrop-filter: blur(10px)`
- **Border**: `2px solid rgba(255, 255, 255, 0.3)`
- **Shadow**: `0 4px 20px rgba(22, 163, 74, 0.1)`

### Cards
- **Background**: White (`#ffffff`)
- **Border**: `1px solid #e5e7eb` (gray-200) or `2px solid transparent`
- **Border Radius**: `12px` (rounded-3xl) or `8px` (MUI default)
- **Shadow**: 
  - Default: `0 4px 20px rgba(22, 163, 74, 0.1)` or `shadow-md`
  - Hover: `0 8px 32px rgba(22, 163, 74, 0.2)` or `shadow-2xl`

### Buttons

#### Primary Button
- **Background**: `#16a34a` (emerald-600) or gradient `linear-gradient(135deg, #15803d 0%, #22c55e 100%)`
- **Hover**: `#15803d` (emerald-700) or `rgba(255, 255, 255, 0.3)`
- **Text**: White
- **Border Radius**: `8px` (rounded-lg) or `12px` (rounded-xl)

#### Secondary Button
- **Background**: `#e5e7eb` (gray-200)
- **Hover**: `#d1d5db` (gray-300)
- **Text**: `#1f2937` (gray-800)

#### Danger Button
- **Background**: `#dc2626` (red-600)
- **Hover**: `#b91c1c` (red-700)
- **Text**: White

#### Outlined Button (Success)
- **Border**: `1px solid #16a34a` (success.main)
- **Text**: `#16a34a`
- **Hover Background**: `rgba(22, 163, 74, 0.05)` (alpha 0.05)

### Badges/Chips

#### Success Badge
- **Background**: `bg-emerald-100` / `#d1fae5`
- **Text**: `text-emerald-800` / `#065f46`
- **Padding**: `px-2.5 py-0.5`
- **Border Radius**: `rounded-full`
- **Font**: `text-xs font-medium`

#### Warning Badge
- **Background**: `bg-yellow-100` / `#fef3c7`
- **Text**: `text-yellow-800` / `#92400e`

#### Danger Badge
- **Background**: `bg-red-100` / `#fee2e2`
- **Text**: `text-red-800` / `#991b1b`

### Tables

#### Table Header
- **Background**: `rgba(22, 163, 74, 0.05)` (alpha('#16a34a', 0.05))
- **Text**: Bold, `fontWeight: 700`
- **Font Size**: Responsive `{ xs: '0.75rem', sm: '0.875rem' }`

#### Table Row Hover
- **Background**: Light gray or emerald tint
- **Transition**: Smooth color change

### Dialogs/Modals
- **Background**: White (`#ffffff`)
- **Border Radius**: `8px` (MUI default) or `12px` (rounded-2xl)
- **Backdrop**: `rgba(0, 0, 0, 0.5)` (MUI default)
- **Shadow**: MUI default elevation

### Sidebar

#### Active Item
- **Background**: `linear-gradient(to-r, from-emerald-500 to-emerald-600)`
- **Text**: White
- **Shadow**: `shadow-lg shadow-emerald-200`

#### Hover Item
- **Background**: `linear-gradient(to-r, from-emerald-50 to-emerald-100)`
- **Text**: `text-emerald-700`

#### Section Header (Active)
- **Background**: `bg-emerald-50`
- **Text**: `text-emerald-600`

### Top Navigation (Dashboard)
- **Background**: `linear-gradient(to-r, from-emerald-950 via-emerald-900 to-teal-900)`
- **Text**: White
- **Border**: `border-b-2 border-emerald-800`
- **Search Input**: 
  - Background: `bg-emerald-900/50` with `backdrop-blur-sm`
  - Border: `border-emerald-700`
  - Focus: `focus:ring-2 focus:ring-emerald-400`

---

## Color Accessibility

### Contrast Ratios
- **Primary text on white**: `#111827` (gray-900) - WCAG AAA compliant
- **Secondary text**: `#6b7280` (gray-500) - WCAG AA compliant
- **Primary button text**: White on `#16a34a` - WCAG AA compliant
- **Success badge text**: `#065f46` on `#d1fae5` - WCAG AA compliant

### Color Blind Considerations
- Status indicators use both color and icons
- Text labels accompany color-coded badges
- Patterns/textures could be added for enhanced accessibility

---

## Color Mapping Reference

| Context | Color Value | Tailwind Class | MUI Theme |
|---------|-------------|----------------|-----------|
| Primary Action | `#16a34a` | `emerald-600` | `primary.main` |
| Primary Light | `#22c55e` | `green-500` | `primary.light` |
| Primary Dark | `#15803d` | `green-700` | `primary.dark` |
| Secondary | `#6b7280` | `gray-500` | `secondary.main` |
| Background Default | `#f9fafb` | `gray-50` | `background.default` |
| Background Paper | `#ffffff` | `white` | `background.paper` |
| Success Background | `#d1fae5` | `emerald-100` | - |
| Success Text | `#065f46` | `emerald-800` | - |
| Warning Background | `#fef3c7` | `yellow-100` | - |
| Warning Text | `#92400e` | `yellow-800` | - |
| Error Background | `#fee2e2` | `red-100` | - |
| Error Text | `#991b1b` | `red-800` | - |

---

## Implementation Notes

1. **MUI Theme**: Primary colors are defined in `ThemeProvider.tsx` and used throughout MUI components
2. **Tailwind Classes**: Most utility classes use Tailwind's color system
3. **Inline Styles**: Some gradients and complex colors are defined inline using `sx` prop or inline styles
4. **CSS Variables**: Limited use of CSS custom properties; primarily for background/foreground
5. **Alpha Transparency**: Frequently used with `alpha()` function from MUI for semi-transparent overlays
6. **Gradient Patterns**: 135deg diagonal gradients are the most common pattern

---

## Next Steps
- See Part 2: Typography System
- See Part 3: Layout Structure
- See Part 4: Component Patterns

