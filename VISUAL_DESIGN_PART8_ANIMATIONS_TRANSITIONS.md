# Visual Design Documentation - Part 8: Animation & Transitions

## Overview
This document captures all animation and transition specifications including hover effects, transition durations, transform effects, animation keyframes, and loading states used throughout the application.

---

## Transition Durations

### Standard Durations

#### Fast Transitions
- **150ms**: Quick interactions (button press feedback)
- **200ms**: Icon color changes
- **300ms**: Standard transitions (most common)

#### Medium Transitions
- **500ms**: Card hover effects
- **700ms**: Blob animations

#### Slow Transitions
- **1000ms**: Fade-in animations
- **3000ms**: Gradient animations

### Common Transition Patterns

#### Color Transitions
```tsx
transition-colors
// duration: 150ms (Tailwind default)
```

#### All Properties
```tsx
transition-all duration-300
// duration: 300ms
```

#### MUI Transitions
```tsx
transition: 'all 0.3s ease'
// duration: 300ms, easing: ease
```

---

## Hover Effects

### Button Hover Effects

#### Primary Button
```tsx
<Button
  sx={{
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(-2px)'
    }
  }}
>
```

**Specifications:**
- **Background**: Lighter shade
- **Shadow**: Enhanced shadow
- **Transform**: `translateY(-2px)` (lifts 2px)
- **Duration**: `300ms`

#### Scale Effect
```tsx
className="transform hover:scale-105 transition-transform"
```

**Specifications:**
- **Scale**: `1.05` (5% larger)
- **Duration**: `300ms` (default)

#### Icon Translation
```tsx
<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
```

**Specifications:**
- **Transform**: `translateX(4px)` (moves right)
- **Duration**: `300ms`

### Card Hover Effects

#### Standard Card
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
- **Border**: Changes to success color
- **Shadow**: Enhanced green-tinted shadow
- **Transform**: `translateY(-2px)` (lifts)
- **Duration**: `300ms`

#### Scale + Shadow
```tsx
className="hover:shadow-2xl hover:scale-105 transition-all duration-300"
```

**Specifications:**
- **Shadow**: `shadow-2xl` (large shadow)
- **Scale**: `1.05` (5% larger)
- **Duration**: `300ms`

### Navigation Hover Effects

#### Sidebar Item
```tsx
className="transition-all transform hover:scale-105"
```

**Specifications:**
- **Scale**: `1.05` (5% larger)
- **Background**: Gradient change
- **Duration**: `300ms`

#### Link Hover
```tsx
className="hover:text-green-600 transition-colors"
```

**Specifications:**
- **Color**: Changes to green-600
- **Duration**: `150ms` (default)

---

## Transform Effects

### Translate (Position)

#### Lift Effect
```tsx
transform: 'translateY(-2px)'
```

**Usage**: Cards, buttons on hover

#### Slide Right
```tsx
transform: 'translateX(4px)'
className="group-hover:translate-x-1"
```

**Usage**: Icons in buttons, arrows

#### Slide Left
```tsx
transform: 'translateX(-4px)'
```

**Usage**: Back buttons, navigation

### Scale

#### Scale Up
```tsx
transform: 'scale(1.05)'
className="hover:scale-105"
```

**Usage**: Cards, buttons, icons

#### Scale Down
```tsx
transform: 'scale(0.95)'
```

**Usage**: Active/pressed states

#### Icon Scale
```tsx
className="group-hover:scale-110 transition-transform"
```

**Usage**: Icons in feature cards

### Rotate

#### Rotation
```tsx
transform: 'rotate(90deg)'
```

**Usage**: Chevron icons, expand/collapse

---

## Animation Keyframes

### Blob Animation

#### Keyframe Definition
```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
```

**Usage**: Hero section background blobs

#### Application
```tsx
className="animate-blob"
// animation: blob 7s infinite;
```

**Specifications:**
- **Duration**: `7s`
- **Iteration**: `infinite`
- **Easing**: Default

#### Delayed Blobs
```tsx
className="animate-blob animation-delay-2000"
// animation-delay: 2s;
```

**Specifications:**
- **Delay**: `2s`
- **Usage**: Multiple blobs with staggered timing

### Gradient Animation

#### Keyframe Definition
```css
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

**Usage**: Animated gradient text

#### Application
```tsx
className="animate-gradient"
// background-size: 200% 200%;
// animation: gradient 3s ease infinite;
```

**Specifications:**
- **Background Size**: `200% 200%`
- **Duration**: `3s`
- **Easing**: `ease`
- **Iteration**: `infinite`

### Fade In Animation

#### Keyframe Definition
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Usage**: Page elements, cards, badges

#### Application
```tsx
className="animate-fade-in"
// animation: fadeIn 1s ease-in;
```

**Specifications:**
- **Duration**: `1s`
- **Easing**: `ease-in`
- **Transform**: Fades in while moving down 10px

### Pulse Animation

#### Tailwind Pulse
```tsx
className="animate-pulse"
```

**Usage**: Loading states, notification badges

**Specifications:**
- **Duration**: `2s`
- **Iteration**: `infinite`
- **Effect**: Opacity pulses between 1 and 0.5

---

## MUI Transitions

### Fade Transition

#### Fade In
```tsx
<Fade in timeout={300 * (index + 1)}>
  <Card>
    {/* Content */}
  </Card>
</Fade>
```

**Specifications:**
- **Timeout**: Staggered (`300ms × index`)
- **Effect**: Fades in from transparent to opaque

**Usage**: List items with staggered appearance

### Collapse Transition

#### Expand/Collapse
```tsx
<Collapse in={expanded}>
  <Box>
    {/* Collapsible content */}
  </Box>
</Collapse>
```

**Specifications:**
- **Duration**: MUI default (300ms)
- **Effect**: Height animates from 0 to auto

**Usage**: Accordions, expandable sections

### Slide Transition

#### Slide In
```tsx
<Slide direction="left" in={open}>
  <Box>
    {/* Sliding content */}
  </Box>
</Slide>
```

**Specifications:**
- **Direction**: `left`, `right`, `up`, `down`
- **Duration**: MUI default (300ms)

---

## Loading States

### Spinner

#### Circular Progress
```tsx
<div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
```

**Specifications:**
- **Size**: `64px × 64px` (h-16 w-16)
- **Border**: `4px`
- **Colors**: Green-200 base, green-600 accent
- **Animation**: `animate-spin` (rotates 360deg)

#### MUI CircularProgress
```tsx
<CircularProgress color="primary" />
```

**Specifications:**
- **Color**: Primary (green)
- **Size**: Default (40px)

### Skeleton Loading

#### Card Skeleton
```tsx
<Skeleton variant="rectangular" width="100%" height={200} />
```

**Specifications:**
- **Variant**: `rectangular`
- **Height**: `200px`
- **Animation**: Pulse effect

---

## Transition Easing Functions

### Standard Easing

#### Ease (Default)
```tsx
transition: 'all 0.3s ease'
```

**Usage**: Most transitions

#### Ease-In
```tsx
animation: fadeIn 1s ease-in;
```

**Usage**: Fade-in animations

#### Ease-Out
```tsx
transition: 'all 0.3s ease-out'
```

**Usage**: Hover effects

#### Ease-In-Out
```tsx
transition: 'all 0.3s ease-in-out'
```

**Usage**: Smooth transitions

### Custom Easing

#### Cubic Bezier
```tsx
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
```

**Usage**: Material Design easing

---

## Animation Performance

### GPU Acceleration

#### Transform Properties
```tsx
transform: 'translateY(-2px)'
```

**Note**: Transform properties are GPU-accelerated

#### Will-Change
```tsx
willChange: 'transform'
```

**Usage**: Elements that will animate

### Optimizations

#### Reduce Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Usage**: Respect user preferences

---

## Common Animation Patterns

### Staggered List Items
```tsx
{items.map((item, index) => (
  <Fade in timeout={300 * (index + 1)} key={item.id}>
    <Card>
      {/* Content */}
    </Card>
  </Fade>
))}
```

**Specifications:**
- **Delay**: `300ms × index`
- **Effect**: Items appear sequentially

### Hover Group Effects
```tsx
<div className="group">
  <div className="group-hover:scale-110 transition-transform">
    <Icon />
  </div>
  <h3 className="group-hover:text-green-600 transition-colors">
    Title
  </h3>
</div>
```

**Specifications:**
- **Group**: Parent triggers child animations
- **Effects**: Multiple elements animate together

### Loading State Transition
```tsx
{loading ? (
  <CircularProgress />
) : (
  <Fade in={!loading}>
    <Content />
  </Fade>
)}
```

**Specifications:**
- **Fade**: Content fades in when loaded
- **Duration**: `300ms`

---

## Animation Timing Reference

### Duration Scale
- **Fast**: `150ms` - Quick feedback
- **Standard**: `300ms` - Most transitions
- **Medium**: `500ms` - Card hovers
- **Slow**: `1000ms` - Page transitions
- **Very Slow**: `3000ms+` - Background animations

### Delay Patterns
- **Immediate**: `0ms`
- **Short**: `200ms` - `500ms`
- **Medium**: `1000ms` - `2000ms`
- **Long**: `3000ms+`

---

## Implementation Notes

1. **Performance**: Use `transform` and `opacity` for animations (GPU-accelerated)
2. **Accessibility**: Respect `prefers-reduced-motion`
3. **Consistency**: Use standard durations (300ms most common)
4. **Staggering**: Use index-based delays for list animations
5. **Easing**: Use appropriate easing functions for natural motion
6. **Loading States**: Always provide visual feedback during async operations

---

## Next Steps
- See Part 1: Theme & Color System
- See Part 2: Typography System
- See Part 3: Layout Structure
- See Part 4: Component Patterns
- See Part 5: Page-Specific Designs
- See Part 6: UI Element Positioning & Spacing
- See Part 7: Responsive Design Patterns

---

## Complete Documentation Index

1. **Part 1**: Theme & Color System
2. **Part 2**: Typography System
3. **Part 3**: Layout Structure
4. **Part 4**: Component Patterns
5. **Part 5**: Page-Specific Designs
6. **Part 6**: UI Element Positioning & Spacing
7. **Part 7**: Responsive Design Patterns
8. **Part 8**: Animation & Transitions (This Document)

All parts together provide a complete visual design specification for reconstructing the iFarm application UI.

