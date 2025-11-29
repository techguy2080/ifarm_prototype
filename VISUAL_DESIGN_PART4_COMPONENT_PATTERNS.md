# Visual Design Documentation - Part 4: Component Patterns

## Overview
This document captures all reusable component patterns including cards, buttons, badges, form inputs, navigation components, dialogs, tables, and avatars with their exact styling specifications.

---

## Card Components

### Standard Card

#### Basic Card (Tailwind)
**Location:** `app/globals.css`

```css
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}
```

**Specifications:**
- **Background**: White (`bg-white`)
- **Border Radius**: `rounded-lg` (8px)
- **Shadow**: `shadow-md`
- **Padding**: `p-6` (24px)
- **Border**: `border border-gray-200` (1px solid #e5e7eb)

#### MUI Card (Standard)
```tsx
<Card sx={{ 
  borderRadius: 3,  // 24px
  boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)',
  border: '2px solid transparent'
}}>
```

**Specifications:**
- **Border Radius**: `borderRadius: 3` (24px)
- **Shadow**: `0 4px 20px rgba(22, 163, 74, 0.1)` (green-tinted)
- **Border**: `2px solid transparent` (for hover effect)
- **Background**: White (default)

#### Card Content Padding
```tsx
<CardContent sx={{ p: 3 }}>  // 24px
<CardContent sx={{ p: 4 }}>  // 32px
<CardContent sx={{ p: 0 }}>  // No padding (for tables)
```

### Header Card (Gradient Background)

#### Standard Header Card
```tsx
<Card sx={{ 
  mb: 5,  // 40px margin bottom
  borderRadius: 3,  // 24px
  boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
  background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
  overflow: 'hidden',
  position: 'relative'
}}>
  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
    {/* Content */}
  </CardContent>
</Card>
```

**Specifications:**
- **Background**: `linear-gradient(135deg, #15803d 0%, #22c55e 100%)`
- **Border Radius**: `borderRadius: 3` (24px)
- **Shadow**: `0 4px 20px rgba(5, 150, 105, 0.15)`
- **Padding**: `p: 4` (32px)
- **Overflow**: `hidden` (for decorative elements)
- **Position**: `relative` (for absolute positioned decorations)

#### Multi-Color Header Card
```tsx
<Card sx={{ 
  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
  // ... other props
}}>
```

**Usage**: Dashboard home, role templates, special sections

### Card Hover Effects

#### Hover State
```tsx
<Card sx={{ 
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'success.main',
    boxShadow: '0 8px 32px rgba(22, 163, 74, 0.2)',
    transform: 'translateY(-2px)'
  }
}}>
```

**Specifications:**
- **Transition**: `all 0.3s ease`
- **Hover Border**: `borderColor: 'success.main'` (#16a34a)
- **Hover Shadow**: `0 8px 32px rgba(22, 163, 74, 0.2)`
- **Hover Transform**: `translateY(-2px)` (lifts card)

### Card Variants

#### Info Card (Paper with Background)
```tsx
<Paper sx={{ 
  p: 2, 
  bgcolor: alpha('#16a34a', 0.02), 
  borderRadius: 2 
}}>
```

**Specifications:**
- **Background**: `rgba(22, 163, 74, 0.02)` (very light green)
- **Padding**: `p: 2` (16px)
- **Border Radius**: `borderRadius: 2` (16px)

#### Warning Card
```tsx
<Paper sx={{ 
  p: 2, 
  bgcolor: alpha('#fbbf24', 0.1), 
  borderRadius: 2,
  border: '1px solid',
  borderColor: alpha('#fbbf24', 0.2)
}}>
```

**Specifications:**
- **Background**: `rgba(251, 191, 36, 0.1)` (light yellow)
- **Border**: `1px solid rgba(251, 191, 36, 0.2)`

---

## Button Styles

### Primary Button

#### MUI Primary Button
```tsx
<Button
  variant="contained"
  sx={{
    background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    '&:hover': {
      background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(-2px)'
    }
  }}
>
  Button Text
</Button>
```

**Specifications:**
- **Background**: Gradient or solid `#16a34a`
- **Font Weight**: `600` (semibold)
- **Padding**: `px: 3, py: 1.5` (24px horizontal, 12px vertical)
- **Hover**: Enhanced shadow and slight lift

#### Tailwind Primary Button
**Location:** `app/globals.css`

```css
.btn-primary {
  @apply bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
}
```

**Specifications:**
- **Background**: `bg-emerald-600` (#16a34a)
- **Hover**: `hover:bg-emerald-700` (#15803d)
- **Text**: White
- **Font Weight**: `font-medium` (500)
- **Padding**: `py-2 px-4` (8px vertical, 16px horizontal)
- **Border Radius**: `rounded-lg` (8px)
- **Transition**: `transition-colors`

### Secondary Button

#### MUI Secondary Button
```tsx
<Button
  variant="outlined"
  sx={{
    borderColor: 'success.main',
    color: 'success.main',
    fontWeight: 600,
    '&:hover': {
      borderColor: 'success.dark',
      background: alpha('#16a34a', 0.05)
    }
  }}
>
  Button Text
</Button>
```

**Specifications:**
- **Border**: `1px solid #16a34a`
- **Text Color**: `#16a34a`
- **Hover Background**: `rgba(22, 163, 74, 0.05)`

#### Tailwind Secondary Button
```css
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors;
}
```

**Specifications:**
- **Background**: `bg-gray-200` (#e5e7eb)
- **Hover**: `hover:bg-gray-300` (#d1d5db)
- **Text**: `text-gray-800` (#1f2937)

### Danger Button

#### MUI Danger Button
```tsx
<Button
  variant="contained"
  color="error"
  sx={{ fontWeight: 600 }}
>
  Delete
</Button>
```

**Specifications:**
- **Color**: MUI error color (red)
- **Font Weight**: `600`

#### Tailwind Danger Button
```css
.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
}
```

**Specifications:**
- **Background**: `bg-red-600` (#dc2626)
- **Hover**: `hover:bg-red-700` (#b91c1c)

### Button Sizes

#### Small Button
```tsx
<Button size="small" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
  Small
</Button>
```

#### Large Button
```tsx
<Button 
  size="large" 
  sx={{ 
    fontWeight: 600, 
    px: 4, 
    py: 1.5 
  }}
>
  Large
</Button>
```

### Button with Icon
```tsx
<Button
  startIcon={<Add />}
  endIcon={<ArrowRight />}
  sx={{ fontWeight: 600 }}
>
  Button Text
</Button>
```

### Glassmorphic Button (Header Cards)
```tsx
<Button
  sx={{
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    fontWeight: 600,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(-2px)'
    }
  }}
>
  Button Text
</Button>
```

---

## Badge/Chip Styles

### Basic Badge
**Location:** `app/globals.css`

```css
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}
```

**Specifications:**
- **Display**: `inline-flex items-center`
- **Padding**: `px-2.5 py-0.5` (10px horizontal, 2px vertical)
- **Border Radius**: `rounded-full` (fully rounded)
- **Font Size**: `text-xs` (12px)
- **Font Weight**: `font-medium` (500)

### Success Badge
```css
.badge-success {
  @apply badge bg-emerald-100 text-emerald-800;
}
```

**Specifications:**
- **Background**: `bg-emerald-100` (#d1fae5)
- **Text**: `text-emerald-800` (#065f46)

### Warning Badge
```css
.badge-warning {
  @apply badge bg-yellow-100 text-yellow-800;
}
```

**Specifications:**
- **Background**: `bg-yellow-100` (#fef3c7)
- **Text**: `text-yellow-800` (#92400e)

### Danger Badge
```css
.badge-danger {
  @apply badge bg-red-100 text-red-800;
}
```

**Specifications:**
- **Background**: `bg-red-100` (#fee2e2)
- **Text**: `text-red-800` (#991b1b)

### MUI Chip (Status)
```tsx
<Chip
  label="Active"
  color="success"
  size="small"
  sx={{ fontWeight: 600, textTransform: 'capitalize' }}
/>
```

**Specifications:**
- **Size**: `small`
- **Font Weight**: `600`
- **Text Transform**: `capitalize`

### MUI Chip (Custom)
```tsx
<Chip
  label="Custom"
  size="small"
  sx={{
    background: alpha('#16a34a', 0.1),
    color: 'success.main',
    fontWeight: 600,
    border: '1px solid',
    borderColor: alpha('#16a34a', 0.2)
  }}
/>
```

**Specifications:**
- **Background**: `rgba(22, 163, 74, 0.1)`
- **Text Color**: `#16a34a`
- **Border**: `1px solid rgba(22, 163, 74, 0.2)`

---

## Form Inputs

### Text Field (MUI)
```tsx
<TextField
  fullWidth
  label="Label"
  variant="outlined"
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,  // 16px
    }
  }}
/>
```

**Specifications:**
- **Variant**: `outlined`
- **Border Radius**: `borderRadius: 2` (16px)
- **Full Width**: `fullWidth`

### Select Field (MUI)
```tsx
<TextField
  select
  fullWidth
  label="Select"
  sx={{ borderRadius: 2 }}
>
  <MenuItem value="option1">Option 1</MenuItem>
</TextField>
```

### Textarea
```tsx
<TextField
  multiline
  rows={4}
  fullWidth
  label="Description"
/>
```

### Input with Icon
```tsx
<Box sx={{ position: 'relative' }}>
  <Search className="absolute left-4 h-5 w-5 text-emerald-300" />
  <input
    type="text"
    className="pl-12 pr-4 py-2.5 bg-emerald-900/50 backdrop-blur-sm border border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-400"
  />
</Box>
```

**Specifications:**
- **Icon Position**: `absolute left-4`
- **Input Padding**: `pl-12 pr-4 py-2.5` (left padding for icon)
- **Border Radius**: `rounded-xl` (12px)
- **Focus Ring**: `focus:ring-2 focus:ring-emerald-400`

### Form Label
```tsx
<InputLabel sx={{ fontWeight: 600 }}>
  Label
</InputLabel>
```

**Specifications:**
- **Font Weight**: `600`

### Form Helper Text
```tsx
<FormHelperText>
  Helper text
</FormHelperText>
```

**Specifications:**
- **Color**: `text.secondary` (gray-600)
- **Font Size**: Small (MUI default)

---

## Navigation Components

### Sidebar Navigation Item

#### Active State
```tsx
<Link
  className={`
    flex items-center px-4 py-3 rounded-xl text-sm font-semibold
    transition-all transform hover:scale-105
    ${isActive
      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
      : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700'
    }
  `}
>
```

**Specifications:**
- **Active Background**: `linear-gradient(to-r, from-emerald-500 to-emerald-600)`
- **Active Text**: White
- **Active Shadow**: `shadow-lg shadow-emerald-200`
- **Hover Background**: `linear-gradient(to-r, from-emerald-50 to-emerald-100)`
- **Hover Text**: `text-emerald-700`
- **Padding**: `px-4 py-3` (16px horizontal, 12px vertical)
- **Border Radius**: `rounded-xl` (12px)
- **Transform**: `hover:scale-105` (slight scale on hover)

#### Section Header
```tsx
<button
  className={`
    w-full flex items-center justify-between px-4 py-2.5 rounded-lg
    text-xs font-bold uppercase tracking-wider
    ${hasActiveItem
      ? 'text-emerald-600 bg-emerald-50'
      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
    }
  `}
>
```

**Specifications:**
- **Font Size**: `text-xs` (12px)
- **Font Weight**: `font-bold` (700)
- **Text Transform**: `uppercase`
- **Letter Spacing**: `tracking-wider` (0.05em)
- **Padding**: `px-4 py-2.5` (16px horizontal, 10px vertical)

### Top Navigation Search
```tsx
<div className="hidden md:flex items-center relative group">
  <Search className="absolute left-4 h-5 w-5 text-emerald-300" />
  <input
    type="text"
    className="pl-12 pr-4 py-2.5 bg-emerald-900/50 backdrop-blur-sm border border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-400 text-white placeholder-emerald-300 w-64 xl:w-80"
  />
</div>
```

**Specifications:**
- **Background**: `bg-emerald-900/50` with `backdrop-blur-sm`
- **Border**: `border-emerald-700`
- **Border Radius**: `rounded-xl` (12px)
- **Text Color**: White
- **Placeholder**: `text-emerald-300`
- **Width**: `w-64` (256px) → `xl:w-80` (320px on xl)

---

## Dialog/Modal Styles

### Standard Dialog
```tsx
<Dialog
  open={open}
  onClose={onClose}
  PaperProps={{
    sx: { borderRadius: 2 }  // 16px
  }}
>
  <DialogTitle sx={{ fontWeight: 700 }}>
    Dialog Title
  </DialogTitle>
  <DialogContent>
    {/* Content */}
  </DialogContent>
  <DialogActions sx={{ p: 2 }}>
    {/* Actions */}
  </DialogActions>
</Dialog>
```

**Specifications:**
- **Border Radius**: `borderRadius: 2` (16px)
- **Title Font Weight**: `700`
- **Actions Padding**: `p: 2` (16px)

### Responsive Dialog
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
- **Max Height**: `100vh` mobile, `90vh` desktop

### Dialog Title
```tsx
<DialogTitle sx={{ fontWeight: 700 }}>
  Title
</DialogTitle>
```

**Specifications:**
- **Font Weight**: `700`

### Dialog Actions
```tsx
<DialogActions sx={{ p: 2 }}>
  <Button onClick={onClose} sx={{ fontWeight: 600 }}>
    Cancel
  </Button>
  <Button 
    onClick={handleAction} 
    color="error" 
    variant="contained"
    sx={{ fontWeight: 600 }}
  >
    Confirm
  </Button>
</DialogActions>
```

**Specifications:**
- **Padding**: `p: 2` (16px)
- **Button Font Weight**: `600`

---

## Table Styles

### Table Container
```tsx
<TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
  <Table sx={{ minWidth: 800 }}>
    {/* Table content */}
  </Table>
</TableContainer>
```

**Specifications:**
- **Max Width**: `100%`
- **Overflow**: `overflowX: 'auto'` (horizontal scroll)
- **Min Width**: `800px` (prevents column squishing)

### Table Head
```tsx
<TableHead>
  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
    <TableCell sx={{ 
      fontWeight: 700, 
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      whiteSpace: 'nowrap'
    }}>
      Header
    </TableCell>
  </TableRow>
</TableHead>
```

**Specifications:**
- **Background**: `rgba(22, 163, 74, 0.05)` (very light green)
- **Font Weight**: `700`
- **Font Size**: Responsive `0.75rem` (mobile) → `0.875rem` (desktop)
- **White Space**: `nowrap` (prevents text wrapping)

### Table Row
```tsx
<TableRow hover>
  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
    Content
  </TableCell>
</TableRow>
```

**Specifications:**
- **Hover**: MUI default hover effect
- **Font Size**: Responsive

### Table Cell with Action Button
```tsx
<TableCell>
  <Button 
    size="small" 
    variant="outlined" 
    color="primary"
    sx={{
      borderColor: 'success.main',
      color: 'success.main',
      '&:hover': {
        borderColor: 'success.dark',
        background: alpha('#16a34a', 0.05)
      }
    }}
  >
    Action
  </Button>
</TableCell>
```

---

## Avatar Styles

### Standard Avatar
```tsx
<Avatar sx={{ 
  background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
  width: 40, 
  height: 40,
  fontWeight: 700
}}>
  {initials}
</Avatar>
```

**Specifications:**
- **Background**: Gradient or solid color
- **Size**: `40px` (width and height)
- **Font Weight**: `700`
- **Border Radius**: Fully rounded (MUI default)

### Large Avatar
```tsx
<Avatar sx={{ 
  width: 56, 
  height: 56,
  // ... other props
}}>
```

**Specifications:**
- **Size**: `56px`

### Avatar with Ring
```tsx
<div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg flex items-center justify-center ring-2 ring-emerald-200">
  <span className="text-white font-bold text-base">
    {initials}
  </span>
</div>
```

**Specifications:**
- **Ring**: `ring-2 ring-emerald-200` (2px ring)
- **Shadow**: `shadow-lg`

### Avatar in Header Card
```tsx
<Box sx={{ 
  width: 56, 
  height: 56, 
  borderRadius: 2, 
  background: 'rgba(255, 255, 255, 0.2)', 
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
}}>
  <Icon size={32} color="white" />
</Box>
```

**Specifications:**
- **Background**: `rgba(255, 255, 255, 0.2)` (semi-transparent white)
- **Backdrop Filter**: `blur(10px)` (glassmorphic effect)
- **Border**: `2px solid rgba(255, 255, 255, 0.3)`
- **Shadow**: `0 8px 32px rgba(0, 0, 0, 0.1)`

---

## Toggle Button Group

### Filter Tabs
```tsx
<ToggleButtonGroup
  value={activeFilter}
  exclusive
  onChange={handleChange}
  sx={{
    '& .MuiToggleButton-root': {
      px: 3,
      py: 1.5,
      fontWeight: 600,
      borderRadius: 2,
      border: '2px solid',
      borderColor: 'divider',
      '&.Mui-selected': {
        background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
        color: 'white',
        borderColor: 'transparent',
        '&:hover': {
          background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
        }
      }
    }
  }}
>
  <ToggleButton value="active">Active</ToggleButton>
  <ToggleButton value="all">All</ToggleButton>
</ToggleButtonGroup>
```

**Specifications:**
- **Padding**: `px: 3, py: 1.5` (24px horizontal, 12px vertical)
- **Font Weight**: `600`
- **Border Radius**: `borderRadius: 2` (16px)
- **Selected Background**: Gradient
- **Selected Text**: White

---

## Paper Component

### Standard Paper
```tsx
<Paper sx={{ p: 2, borderRadius: 2 }}>
  Content
</Paper>
```

**Specifications:**
- **Padding**: `p: 2` (16px)
- **Border Radius**: `borderRadius: 2` (16px)

### Paper with Background
```tsx
<Paper sx={{ 
  p: 2, 
  bgcolor: alpha('#16a34a', 0.02), 
  borderRadius: 2 
}}>
  Content
</Paper>
```

### Glassmorphic Paper
```tsx
<Paper sx={{ 
  p: 3, 
  background: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 2
}}>
  Content
</Paper>
```

**Specifications:**
- **Background**: `rgba(255,255,255,0.15)` (semi-transparent white)
- **Backdrop Filter**: `blur(10px)`
- **Border**: `1px solid rgba(255,255,255,0.2)`

---

## Alert/Notification Styles

### Success Alert
```tsx
<Alert severity="success" icon={<CheckCircle size={20} />}>
  Success message
</Alert>
```

### Error Alert
```tsx
<Alert 
  severity="error" 
  sx={{ 
    mb: 3,
    borderRadius: 2,
    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.1)'
  }}
>
  <AlertTitle sx={{ fontWeight: 700 }}>Error Title</AlertTitle>
  Error message
</Alert>
```

**Specifications:**
- **Border Radius**: `borderRadius: 2` (16px)
- **Shadow**: Red-tinted shadow
- **Title Font Weight**: `700`

---

## Divider

### Standard Divider
```tsx
<Divider sx={{ my: 2 }} />
```

**Specifications:**
- **Margin**: `my: 2` (16px vertical)

---

## Stack Component

### Vertical Stack
```tsx
<Stack spacing={3}>
  {/* Items with 24px gap */}
</Stack>
```

**Specifications:**
- **Spacing**: `3` (24px gap)

### Horizontal Stack
```tsx
<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
  {/* Items with 8px gap, wrapping enabled */}
</Stack>
```

**Specifications:**
- **Direction**: `row`
- **Spacing**: `1` (8px gap)
- **Flex Wrap**: `wrap` (wraps to next line)
- **Use Flex Gap**: `useFlexGap` (better gap handling)

---

## Component Implementation Notes

1. **MUI Components**: Primary component library for dashboard pages
2. **Tailwind Classes**: Used for public pages and custom styling
3. **Consistent Spacing**: 8px base unit throughout
4. **Green Theme**: All components use emerald/green color scheme
5. **Responsive**: All components adapt to screen size
6. **Hover Effects**: Consistent hover states across interactive elements
7. **Glassmorphism**: Used in header cards and special sections
8. **Gradients**: Extensive use of gradients for visual interest

---

## Next Steps
- See Part 1: Theme & Color System
- See Part 2: Typography System
- See Part 3: Layout Structure
- See Part 5: Page-Specific Designs

