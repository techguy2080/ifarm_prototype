# Visual Design Documentation - Part 2: Typography System

## Overview
This document captures all typography specifications including font families, sizes, weights, line heights, letter spacing, and text colors used throughout the iFarm application.

---

## Font Family

### Primary Font Stack
**Location:** `components/ThemeProvider.tsx`

```typescript
fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
```

**Usage:**
- Applied globally via MUI ThemeProvider
- Used for all text throughout the application
- Fallback chain: Inter → system-ui → Avenir → Helvetica → Arial → sans-serif

**Implementation:**
- MUI components inherit from theme
- Tailwind classes use default sans-serif (which resolves to Inter via theme)
- Custom CSS uses the same stack

---

## Typography Variants (MUI)

**Location:** `components/DashboardContainer.tsx` (custom overrides)

### Heading Styles

#### H1 (Typography variant="h1")
```typescript
fontWeight: 400
letterSpacing: '-0.03em'
lineHeight: 1.15
```
- **Font Size**: MUI default (typically 2.125rem / 34px)
- **Usage**: Main page titles, hero headings
- **Example**: Public homepage hero section

#### H2 (Typography variant="h2")
```typescript
fontWeight: 400
letterSpacing: '-0.02em'
lineHeight: 1.25
```
- **Font Size**: MUI default (typically 1.75rem / 28px)
- **Usage**: Section headings, major page sections
- **Example**: Features section headings

#### H3 (Typography variant="h3")
```typescript
fontWeight: 400
letterSpacing: '-0.02em'
lineHeight: 1.3
```
- **Font Size**: MUI default (typically 1.5rem / 24px)
- **Usage**: Subsection headings, card titles
- **Example**: Page header card titles

#### H4 (Typography variant="h4")
```typescript
fontWeight: 500
letterSpacing: '-0.01em'
lineHeight: 1.35
```
- **Font Size**: MUI default (typically 1.25rem / 20px)
- **Usage**: Card section headings, form labels
- **Example**: Table column headers

#### H5 (Typography variant="h5")
```typescript
fontWeight: 500
letterSpacing: '-0.01em'
lineHeight: 1.4
```
- **Font Size**: MUI default (typically 1.125rem / 18px)
- **Usage**: Smaller headings, emphasized text
- **Example**: Feature card titles

#### H6 (Typography variant="h6")
```typescript
fontWeight: 400
letterSpacing: '0'
lineHeight: 1.5
```
- **Font Size**: MUI default (typically 1rem / 16px)
- **Usage**: Small headings, subheadings
- **Example**: Card subtitles, list item titles

### Body Text Styles

#### Body1 (Typography variant="body1")
```typescript
fontWeight: 400
letterSpacing: '0.01em'
lineHeight: 1.65
```
- **Font Size**: MUI default (typically 1rem / 16px)
- **Usage**: Primary body text, paragraphs
- **Example**: Card descriptions, form help text

#### Body2 (Typography variant="body2")
```typescript
fontWeight: 400
letterSpacing: '0.01em'
lineHeight: 1.65
```
- **Font Size**: MUI default (typically 0.875rem / 14px)
- **Usage**: Secondary body text, smaller paragraphs
- **Example**: Table cell content, metadata

### Subtitle Styles

#### Subtitle1 (Typography variant="subtitle1")
```typescript
fontWeight: 400
letterSpacing: '0.01em'
lineHeight: 1.55
```
- **Font Size**: MUI default (typically 1rem / 16px)
- **Usage**: Subtitles, emphasized secondary text
- **Example**: Card subtitles, section descriptions

#### Subtitle2 (Typography variant="subtitle2")
```typescript
fontWeight: 500
letterSpacing: '0.01em'
lineHeight: 1.55
```
- **Font Size**: MUI default (typically 0.875rem / 14px)
- **Usage**: Small subtitles, labels
- **Example**: Form field labels, metadata labels

---

## Tailwind Typography Classes

### Font Sizes

#### Text Sizes
- **text-xs**: `0.75rem` / 12px - Extra small text
- **text-sm**: `0.875rem` / 14px - Small text
- **text-base**: `1rem` / 16px - Base text size
- **text-lg**: `1.125rem` / 18px - Large text
- **text-xl**: `1.25rem` / 20px - Extra large text
- **text-2xl**: `1.5rem` / 24px - 2X large
- **text-3xl**: `1.875rem` / 30px - 3X large
- **text-4xl**: `2.25rem` / 36px - 4X large
- **text-5xl**: `3rem` / 48px - 5X large
- **text-6xl**: `3.75rem` / 60px - 6X large
- **text-7xl**: `4.5rem` / 72px - 7X large
- **text-8xl**: `6rem` / 96px - 8X large

### Font Weights

#### Weight Classes
- **font-light**: `300` - Light weight
- **font-normal**: `400` - Normal weight (default)
- **font-medium**: `500` - Medium weight
- **font-semibold**: `600` - Semi-bold
- **font-bold**: `700` - Bold
- **font-extrabold**: `800` - Extra bold
- **font-black**: `900` - Black (heaviest)

### Letter Spacing

#### Tracking Classes
- **tracking-tighter**: `-0.05em` - Tighter spacing
- **tracking-tight**: `-0.025em` - Tight spacing
- **tracking-normal**: `0em` - Normal spacing (default)
- **tracking-wide**: `0.025em` - Wide spacing
- **tracking-wider**: `0.05em` - Wider spacing
- **tracking-widest**: `0.1em` - Widest spacing

### Line Heights

#### Leading Classes
- **leading-none**: `1` - No extra line height
- **leading-tight**: `1.25` - Tight line height
- **leading-snug**: `1.375` - Snug line height
- **leading-normal**: `1.5` - Normal line height (default)
- **leading-relaxed**: `1.625` - Relaxed line height
- **leading-loose**: `2` - Loose line height

---

## Text Colors

### Primary Text Colors

#### Gray Scale (Neutral Text)
- **text-gray-50**: `#f9fafb` - Very light text (rare)
- **text-gray-100**: `#f3f4f6` - Light text (rare)
- **text-gray-200**: `#e5e7eb` - Very light text
- **text-gray-300**: `#d1d5db` - Light text
- **text-gray-400**: `#9ca3af` - Muted text
- **text-gray-500**: `#6b7280` - Secondary text (common)
- **text-gray-600**: `#4b5563` - Medium text
- **text-gray-700**: `#374151` - Primary text (common)
- **text-gray-800**: `#1f2937` - Dark text
- **text-gray-900**: `#111827` - Darkest text (headings)

#### Brand Colors (Text)
- **text-emerald-50**: `#ecfdf5` - Very light emerald
- **text-emerald-100**: `#d1fae5` - Light emerald
- **text-emerald-200**: `#a7f3d0` - Lighter emerald
- **text-emerald-300**: `#6ee7b7` - Light emerald
- **text-emerald-400**: `#34d399` - Medium emerald
- **text-emerald-500**: `#10b981` - Emerald
- **text-emerald-600**: `#059669` - Dark emerald (common)
- **text-emerald-700**: `#047857` - Darker emerald
- **text-emerald-800**: `#065f46` - Very dark emerald
- **text-green-600**: `#16a34a` - Primary green (matches MUI)
- **text-green-700**: `#15803d` - Dark green

#### Status Colors (Text)
- **text-white**: `#ffffff` - White text (on dark backgrounds)
- **text-red-600**: `#dc2626` - Error text
- **text-red-800**: `#991b1b` - Dark error text
- **text-yellow-600**: `#f59e0b` - Warning text
- **text-yellow-800**: `#92400e` - Dark warning text
- **text-blue-600**: `#2563eb` - Info text
- **text-blue-800**: `#1e40af` - Dark info text

### MUI Text Colors

#### Theme-Based Colors
- **color="text.primary"**: Default primary text color (typically gray-900)
- **color="text.secondary"**: Secondary text color (typically gray-600)
- **color="text.disabled"**: Disabled text color (typically gray-400)
- **color="primary"**: Primary brand color (`#16a34a`)
- **color="secondary"**: Secondary color (`#6b7280`)
- **color="error"**: Error color (MUI default red)
- **color="warning"**: Warning color (MUI default orange)
- **color="info"**: Info color (MUI default blue)
- **color="success"**: Success color (`#16a34a` - mapped to primary)

---

## Typography Usage Patterns

### Page Headers

#### Large Page Title
```tsx
<Typography 
  variant="h3" 
  component="h1" 
  fontWeight="500"
  sx={{
    color: 'white',
    mb: 0.5,
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  }}
>
  Page Title
</Typography>
```
- **Variant**: h3
- **Weight**: 500
- **Color**: White (on gradient backgrounds)
- **Text Shadow**: `0 2px 8px rgba(0, 0, 0, 0.15)`

#### Page Subtitle
```tsx
<Typography 
  variant="h6" 
  sx={{ 
    color: 'rgba(255, 255, 255, 0.9)', 
    fontWeight: 400 
  }}
>
  Subtitle text
</Typography>
```
- **Variant**: h6
- **Weight**: 400
- **Color**: `rgba(255, 255, 255, 0.9)` (semi-transparent white)

### Public Homepage Typography

#### Hero Heading
```tsx
<h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
  Manage Your Farm
  <span className="block bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent animate-gradient">
    The Modern Way
  </span>
</h1>
```
- **Size**: `text-5xl` (mobile) → `text-7xl` (tablet) → `text-8xl` (desktop)
- **Weight**: `font-black` (900)
- **Color**: White with gradient text effect
- **Line Height**: `leading-tight` (1.25)
- **Letter Spacing**: `tracking-tight` (-0.025em)

#### Hero Subtitle
```tsx
<p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
  Description text
</p>
```
- **Size**: `text-xl` (mobile) → `text-2xl` (desktop)
- **Color**: `text-emerald-100`
- **Line Height**: `leading-relaxed` (1.625)
- **Weight**: `font-light` (300)

#### Section Heading
```tsx
<h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
  Section Title
  <span className="block text-green-600">Subtitle</span>
</h2>
```
- **Size**: `text-4xl` (mobile) → `text-6xl` (desktop)
- **Weight**: `font-black` (900)
- **Color**: `text-gray-900` with `text-green-600` accent
- **Letter Spacing**: `tracking-tight`

### Card Typography

#### Card Title
```tsx
<Typography variant="h6" fontWeight="700">
  Card Title
</Typography>
```
- **Variant**: h6
- **Weight**: 700 (bold)
- **Color**: Default (gray-900)

#### Card Subtitle
```tsx
<Typography variant="subtitle2" color="text.secondary" fontWeight="600">
  Subtitle
</Typography>
```
- **Variant**: subtitle2
- **Weight**: 600
- **Color**: `text.secondary` (gray-600)

#### Card Body
```tsx
<Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
  Body text
</Typography>
```
- **Variant**: body2
- **Color**: `text.secondary`
- **Line Height**: 1.6

### Table Typography

#### Table Header
```tsx
<TableCell sx={{ 
  fontWeight: 700, 
  fontSize: { xs: '0.75rem', sm: '0.875rem' },
  whiteSpace: 'nowrap' 
}}>
  Header
</TableCell>
```
- **Weight**: 700
- **Size**: Responsive `0.75rem` (mobile) → `0.875rem` (desktop)
- **White Space**: `nowrap`

#### Table Cell
```tsx
<TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
  Content
</TableCell>
```
- **Size**: Responsive `0.75rem` (mobile) → `0.875rem` (desktop)
- **Weight**: 400 (default)

### Button Typography

#### Primary Button
```tsx
<Button sx={{ fontWeight: 600 }}>
  Button Text
</Button>
```
- **Weight**: 600 (semibold)
- **Size**: Inherits from button size prop

#### Large Button
```tsx
<Button size="large" sx={{ fontWeight: 600, px: 3, py: 1.5 }}>
  Large Button
</Button>
```
- **Size**: `large` (MUI default)
- **Weight**: 600

### Badge/Chip Typography

#### Badge Text
```tsx
<span className="badge text-xs font-medium">
  Badge
</span>
```
- **Size**: `text-xs` (12px)
- **Weight**: `font-medium` (500)

### Navigation Typography

#### Sidebar Navigation Item
```tsx
<span className="text-sm font-semibold">
  Navigation Item
</span>
```
- **Size**: `text-sm` (14px)
- **Weight**: `font-semibold` (600)

#### Sidebar Section Header
```tsx
<span className="text-xs font-bold uppercase tracking-wider">
  SECTION
</span>
```
- **Size**: `text-xs` (12px)
- **Weight**: `font-bold` (700)
- **Transform**: `uppercase`
- **Letter Spacing**: `tracking-wider` (0.05em)

### Form Typography

#### Form Label
```tsx
<InputLabel sx={{ fontWeight: 600 }}>
  Label
</InputLabel>
```
- **Weight**: 600

#### Form Helper Text
```tsx
<FormHelperText>
  Helper text
</FormHelperText>
```
- **Size**: Small (MUI default)
- **Color**: `text.secondary`

---

## Responsive Typography

### Breakpoint-Based Sizing

#### Mobile First Approach
- **Base**: Mobile sizes (xs)
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up

#### Example: Responsive Heading
```tsx
<Typography 
  sx={{ 
    fontSize: { 
      xs: '1.5rem',    // 24px mobile
      sm: '2rem',      // 32px tablet
      md: '2.5rem',    // 40px desktop
      lg: '3rem'       // 48px large desktop
    }
  }}
>
  Responsive Heading
</Typography>
```

#### Example: Responsive Body Text
```tsx
<p className="text-base md:text-lg lg:text-xl">
  Responsive text
</p>
```

---

## Text Effects

### Text Shadows
```css
textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
```
- **Usage**: Text on gradient backgrounds for readability
- **Location**: Header card titles

### Gradient Text
```css
background: linear-gradient(to-r, from-emerald-400 via-green-300 to-teal-400)
background-clip: text
-webkit-background-clip: text
color: transparent
```
- **Usage**: Hero section headings
- **Animation**: Animated gradient background position

### Text Transforms
- **uppercase**: All caps (section headers)
- **capitalize**: First letter of each word (status labels)
- **lowercase**: All lowercase (rare)

---

## Typography Hierarchy

### Visual Hierarchy Levels

1. **Level 1 - Hero/Page Title**
   - Size: `text-5xl` to `text-8xl`
   - Weight: `font-black` (900)
   - Color: White or gray-900

2. **Level 2 - Section Headings**
   - Size: `text-4xl` to `text-6xl`
   - Weight: `font-black` (900)
   - Color: gray-900

3. **Level 3 - Card Titles**
   - Size: `text-2xl` to `text-3xl`
   - Weight: `font-bold` (700)
   - Color: gray-900

4. **Level 4 - Subsection Headings**
   - Size: `text-xl` to `text-2xl`
   - Weight: `font-semibold` (600)
   - Color: gray-800

5. **Level 5 - Body Text**
   - Size: `text-base` to `text-lg`
   - Weight: `font-normal` (400)
   - Color: gray-700 or gray-600

6. **Level 6 - Small Text**
   - Size: `text-sm` to `text-xs`
   - Weight: `font-medium` (500)
   - Color: gray-600 or gray-500

---

## Implementation Notes

1. **MUI Typography**: Primary component for text in dashboard pages
2. **Tailwind Classes**: Used extensively in public pages and custom components
3. **Responsive Sizing**: Most typography uses responsive breakpoints
4. **Font Loading**: Inter font should be loaded via Google Fonts or similar
5. **Line Height**: Adjusted for readability (typically 1.5-1.65 for body text)
6. **Letter Spacing**: Tighter for headings (-0.03em to -0.01em), normal for body (0.01em)

---

## Next Steps
- See Part 1: Theme & Color System
- See Part 3: Layout Structure
- See Part 4: Component Patterns

