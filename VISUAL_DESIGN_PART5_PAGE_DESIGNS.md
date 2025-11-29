# Visual Design Documentation - Part 5: Page-Specific Designs

## Overview
This document captures the visual design specifications for specific pages including dashboard home, animals page, login page, public homepage, and admin pages.

---

## Dashboard Home Page

### Layout Structure
**Location:** `app/dashboard/page.tsx`

```
┌─────────────────────────────────────────┐
│  Header Card (Gradient)                 │
│  - Welcome message                      │
│  - Quick stats                          │
├─────────────────────────────────────────┤
│  Stats Grid (4 columns)                  │
│  - Total Animals                        │
│  - Active Farms                         │
│  - Recent Sales                         │
│  - Total Expenses                      │
├─────────────────────────────────────────┤
│  Quick Actions Card                     │
│  - Action buttons                       │
├─────────────────────────────────────────┤
│  Recent Activity Card                   │
│  - Activity list                        │
├─────────────────────────────────────────┤
│  System Overview Card (Gradient)        │
│  - User stats                           │
└─────────────────────────────────────────┘
```

### Header Card
```tsx
<Card sx={{ 
  mb: 5, 
  borderRadius: 3, 
  boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
  overflow: 'hidden',
  position: 'relative'
}}>
  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
    <Typography variant="h3" fontWeight="500" sx={{ color: 'white', mb: 0.5 }}>
      Welcome back, {user.first_name}!
    </Typography>
    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400 }}>
      Here's what's happening on your farm today.
    </Typography>
  </CardContent>
</Card>
```

**Specifications:**
- **Background**: Multi-color gradient
- **Padding**: `p: 4` (32px)
- **Text Color**: White
- **Margin Bottom**: `mb: 5` (40px)

### Stats Grid
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="700" sx={{ color: 'success.main' }}>
          {totalAnimals}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Animals
        </Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

**Specifications:**
- **Grid**: 4 columns on desktop, 2 on tablet, 1 on mobile
- **Spacing**: `spacing={3}` (24px)
- **Card Border Radius**: `borderRadius: 3` (24px)
- **Card Padding**: `p: 3` (24px)

---

## Animals Page

### Layout Structure
**Location:** `app/dashboard/animals/page.tsx`

```
┌─────────────────────────────────────────┐
│  Header Card (Gradient)                 │
│  - Title                                 │
│  - Description                          │
│  - Create Animal Button                 │
├─────────────────────────────────────────┤
│  Filters Card                           │
│  - Farm filter                          │
│  - Search                               │
│  - Status filter                        │
├─────────────────────────────────────────┤
│  Animals Table Card                      │
│  - Table with animals                   │
│  - Pagination                           │
└─────────────────────────────────────────┘
```

### Header Card
```tsx
<Card sx={{ 
  mb: 5, 
  borderRadius: 3, 
  boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)',
  background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
  overflow: 'hidden',
  position: 'relative'
}}>
  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h3" fontWeight="500" sx={{ color: 'white', mb: 0.5 }}>
          Animals
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400 }}>
          Manage your livestock inventory
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          fontWeight: 600,
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        Add Animal
      </Button>
    </Box>
  </CardContent>
</Card>
```

**Specifications:**
- **Background**: Green gradient
- **Layout**: Flexbox with space-between
- **Button**: Glassmorphic style

### Filters Section
```tsx
<Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)' }}>
  <CardContent sx={{ p: 3 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Farm"
          select
          value={filterFarm}
          onChange={(e) => setFilterFarm(e.target.value)}
        >
          {/* Options */}
        </TextField>
      </Grid>
      {/* More filters */}
    </Grid>
  </CardContent>
</Card>
```

**Specifications:**
- **Grid**: Responsive columns
- **Spacing**: `spacing={2}` (16px)
- **Padding**: `p: 3` (24px)

### Animals Table
```tsx
<Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)' }}>
  <CardContent sx={{ p: 0 }}>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
            <TableCell sx={{ fontWeight: 700 }}>Tag Number</TableCell>
            {/* More columns */}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Table rows */}
        </TableBody>
      </Table>
    </TableContainer>
  </CardContent>
</Card>
```

**Specifications:**
- **Card Padding**: `p: 0` (no padding for table)
- **Table Header Background**: Light green tint

---

## Login Page

### Layout Structure
**Location:** `app/(public)/login/page.tsx`

```
┌─────────────────────────────────────────┐
│  Login Form Card                        │
│  - Email input                          │
│  - Password input                       │
│  - Login button                         │
├─────────────────────────────────────────┤
│  Demo Accounts Section                  │
│  - Demo account cards                   │
└─────────────────────────────────────────┘
```

### Login Form Card
```tsx
<Card sx={{ 
  maxWidth: 400, 
  mx: 'auto', 
  mt: 8,
  borderRadius: 3,
  boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)'
}}>
  <CardContent sx={{ p: 4 }}>
    <Typography variant="h4" fontWeight="700" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
      Login
    </Typography>
    <TextField
      fullWidth
      label="Email"
      type="email"
      sx={{ mb: 2 }}
    />
    <TextField
      fullWidth
      label="Password"
      type="password"
      sx={{ mb: 3 }}
    />
    <Button
      fullWidth
      variant="contained"
      sx={{
        background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
        fontWeight: 600,
        py: 1.5
      }}
    >
      Login
    </Button>
  </CardContent>
</Card>
```

**Specifications:**
- **Max Width**: `400px`
- **Margin**: `mx: 'auto', mt: 8` (centered, 64px top margin)
- **Padding**: `p: 4` (32px)
- **Button**: Full width gradient

### Demo Accounts Section
```tsx
<Box sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
    Demo Accounts
  </Typography>
  <Grid container spacing={3}>
    {demoAccounts.map((account) => (
      <Grid item xs={12} sm={6} md={4} key={account.email}>
        <Card sx={{ 
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'success.main',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {account.role}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {account.email}
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleDemoLogin(account.email)}
              sx={{
                borderColor: 'success.main',
                color: 'success.main',
                '&:hover': {
                  borderColor: 'success.dark',
                  background: alpha('#16a34a', 0.05)
                }
              }}
            >
              Use This Account
            </Button>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
</Box>
```

**Specifications:**
- **Grid**: 3 columns desktop, 2 tablet, 1 mobile
- **Card Hover**: Border color change and shadow
- **Button**: Outlined with success color

---

## Public Homepage

### Layout Structure
**Location:** `app/(public)/page.tsx`

```
┌─────────────────────────────────────────┐
│  Hero Section (Gradient Background)     │
│  - Badge                                 │
│  - Large Heading                        │
│  - Subtitle                             │
│  - CTA Buttons                          │
│  - Trust Indicators                     │
├─────────────────────────────────────────┤
│  Features Section (White Background)    │
│  - Section Heading                      │
│  - Features Grid (3 columns)            │
├─────────────────────────────────────────┤
│  Architecture Section (Light Gradient)   │
│  - Section Heading                      │
│  - Numbered Steps                       │
├─────────────────────────────────────────┤
│  CTA Section (Dark Gradient)            │
│  - Heading                              │
│  - Subtitle                             │
│  - CTA Buttons                          │
└─────────────────────────────────────────┘
```

### Hero Section
```tsx
<section className="relative bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 py-24 md:py-32 overflow-hidden">
  {/* Animated background blobs */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
    {/* More blobs */}
  </div>
  
  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-5xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-emerald-100 text-sm font-medium mb-8">
        <Sparkles className="w-4 h-4" />
        <span>Next-Generation Farm Management</span>
      </div>
      
      {/* Heading */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
        Manage Your Farm
        <span className="block bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent animate-gradient">
          The Modern Way
        </span>
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
        Track your animals, manage daily operations, monitor sales and expenses—all in one place.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
        <Link href="/login" className="group inline-flex items-center gap-3 bg-white text-green-900 hover:bg-emerald-50 font-bold px-8 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        {/* Secondary button */}
      </div>
    </div>
  </div>
</section>
```

**Specifications:**
- **Background**: Dark gradient with animated blobs
- **Padding**: `py-24 md:py-32` (96px mobile, 128px desktop)
- **Heading Size**: Responsive `text-5xl` → `text-7xl` → `text-8xl`
- **Button**: White background with hover effects

### Features Section
```tsx
<section className="py-24 md:py-32 bg-white relative">
  <div className="container mx-auto px-4">
    <div className="text-center mb-20">
      <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
        Powerful Features
      </div>
      <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
        Everything You Need to
        <span className="block text-green-600">Grow Your Farm</span>
      </h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {features.map((feature) => (
        <div className="group relative bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-emerald-100">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
            <feature.icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
            {feature.title}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Specifications:**
- **Grid**: 3 columns desktop, 2 tablet, 1 mobile
- **Card**: Gradient background with hover effects
- **Icon**: Large icon in gradient box
- **Hover**: Scale and shadow effects

---

## Delegations Page

### Layout Structure
**Location:** `app/dashboard/delegations/page.tsx`

```
┌─────────────────────────────────────────┐
│  Header Card (Gradient)                 │
│  - Title with icon                      │
│  - Description                         │
│  - Create Button                       │
├─────────────────────────────────────────┤
│  Filter Tabs                            │
│  - Active / All toggle                 │
├─────────────────────────────────────────┤
│  Delegations List (Stack)               │
│  - Delegation cards                    │
│  - Fade animation                      │
└─────────────────────────────────────────┘
```

### Delegation Card
```tsx
<Card sx={{ 
  borderRadius: 3,
  boxShadow: '0 4px 20px rgba(22, 163, 74, 0.1)',
  border: '2px solid transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'success.main',
    boxShadow: '0 8px 32px rgba(22, 163, 74, 0.2)',
    transform: 'translateY(-2px)'
  }
}}>
  <CardContent sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {/* Avatar section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ 
          background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
          width: 40, 
          height: 40
        }}>
          {delegatorInitial}
        </Avatar>
        <ArrowRight size={20} color="#16a34a" />
        <Avatar sx={{ 
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
          width: 40, 
          height: 40
        }}>
          {delegateInitial}
        </Avatar>
      </Box>
      
      {/* Info grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
        gap: 2 
      }}>
        <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="600">
            Start Date
          </Typography>
          <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
            {startDate}
          </Typography>
        </Paper>
        {/* More info cards */}
      </Box>
      
      {/* Action buttons */}
      <Stack direction="column" spacing={1}>
        <Button variant="outlined" color="error" size="small">
          Revoke
        </Button>
        <Button variant="outlined" size="small" sx={{ borderColor: 'success.main' }}>
          Details
        </Button>
      </Stack>
    </Box>
  </CardContent>
</Card>
```

**Specifications:**
- **Layout**: Flexbox with space-between
- **Info Grid**: 2 columns mobile, 4 desktop
- **Hover**: Border color change and lift effect
- **Animation**: Fade in with staggered delay

---

## Admin Pages

### Layout Pattern
Admin pages follow similar patterns to regular dashboard pages but with additional data management features.

#### Overview Page
```tsx
<Card sx={{ 
  mb: 5, 
  borderRadius: 3, 
  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
  color: 'white'
}}>
  <CardContent sx={{ p: 4 }}>
    <Typography variant="h5" fontWeight="700" gutterBottom>
      System Overview
    </Typography>
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
      gap: 3 
    }}>
      <Paper sx={{ 
        p: 3, 
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 2
      }}>
        <Typography variant="h3" fontWeight="500" sx={{ color: 'white' }}>
          {count}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
          Label
        </Typography>
      </Paper>
    </Box>
  </CardContent>
</Card>
```

**Specifications:**
- **Glassmorphic Cards**: Semi-transparent white on gradient
- **Grid**: Responsive columns
- **Text**: White on dark gradient

---

## Helper Pages

### Layout Pattern
Helper pages use simplified layouts with focused functionality.

#### Helper Animals Page
- Similar structure to main animals page
- Reduced feature set
- Same visual styling

---

## Page Implementation Notes

1. **Consistent Header Pattern**: All dashboard pages use gradient header cards
2. **Spacing**: Consistent `mb: 5` (40px) between major sections
3. **Card Styling**: Uniform card styles with green-tinted shadows
4. **Responsive Grids**: All grids adapt to screen size
5. **Animation**: Fade-in animations for list items
6. **Hover Effects**: Consistent hover states across interactive elements
7. **Color Consistency**: Green/emerald theme throughout

---

## Next Steps
- See Part 1: Theme & Color System
- See Part 2: Typography System
- See Part 3: Layout Structure
- See Part 4: Component Patterns
- See Part 6: UI Element Positioning & Spacing

