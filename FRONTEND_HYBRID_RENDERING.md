# iFarm Frontend - Hybrid CSR/SSR Rendering Strategy

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Architecture Plan  
**Framework**: Next.js 14+ (App Router)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Why Hybrid CSR/SSR for Permission Systems](#why-hybrid-csrssr-for-permission-systems)
3. [Architecture Overview](#architecture-overview)
4. [Layer Integration](#layer-integration)
5. [Implementation Strategy](#implementation-strategy)
6. [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
7. [Client-Side Rendering (CSR)](#client-side-rendering-csr)
8. [Real-Time Permission Updates](#real-time-permission-updates)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)
11. [Code Examples](#code-examples)
12. [Best Practices](#best-practices)

---

## Overview

The iFarm frontend uses a **hybrid Client-Side Rendering (CSR) and Server-Side Rendering (SSR)** approach, similar to Discord's architecture. This strategy is essential for:

✅ **Security**: Server-side permission validation prevents unauthorized content from being sent  
✅ **Performance**: Faster initial page loads with data and permissions baked in  
✅ **User Experience**: No flash of unauthorized content (FOUC)  
✅ **Dynamic Updates**: Real-time permission changes without full page reloads  
✅ **SEO**: Server-rendered content for better search engine indexing

### Key Principles

1. **SSR for Initial Load**: All permission checks and data fetching happen server-side
2. **CSR for Interactivity**: Dynamic updates, filtering, and real-time changes use client-side rendering
3. **Hybrid Components**: Server components for data fetching, client components for interactivity
4. **Real-Time Sync**: WebSocket/SSE for permission updates across sessions

---

## Why Hybrid CSR/SSR for Permission Systems

### The Problem with Pure CSR

**Current Approach (Pure CSR)**:
```typescript
// ❌ Security Risk: Client-side only
'use client';

export default function AnimalsPage() {
  const user = getCurrentUser(); // Client-side only
  const hasPermission = hasPermission(user, 'view_animals'); // Client-side check
  
  if (!hasPermission) {
    return <AccessDenied />; // But data might already be loaded!
  }
  
  // Data fetching happens client-side
  const [animals, setAnimals] = useState([]);
  useEffect(() => {
    fetch('/api/animals').then(r => r.json()).then(setAnimals);
  }, []);
  
  return <AnimalsTable animals={animals} />;
}
```

**Issues**:
- ❌ Flash of unauthorized content (FOUC)
- ❌ Security risk: Data might be fetched before permission check
- ❌ Slower initial load (multiple round trips)
- ❌ Poor SEO (no server-rendered content)
- ❌ Client-side permission checks can be bypassed

### The Solution: Hybrid Approach

**Hybrid Approach (SSR + CSR)**:
```typescript
// ✅ Server Component: Permission validation + data fetching
export default async function AnimalsPage() {
  const session = await getServerSession();
  const hasAccess = await requirePermission('view_animals');
  
  // Data fetched server-side with tenant/farm filtering
  const animals = await fetchAnimals({
    tenant_id: session.tenant_id,
    farm_ids: session.accessible_farm_ids
  });
  
  // Pass to client component
  return <AnimalsClient initialAnimals={animals} permissions={session.permissions} />;
}
```

**Benefits**:
- ✅ No FOUC (permissions validated before render)
- ✅ Secure (unauthorized data never sent)
- ✅ Faster (single request for data + permissions)
- ✅ SEO-friendly (server-rendered content)
- ✅ Real-time updates (client-side for dynamic changes)

---

## Architecture Overview

### Layer Integration

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: PRESENTATION LAYER (Hybrid CSR/SSR)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SSR (Server Components - Next.js):                        │
│  - Initial page load                                       │
│  - Permission validation (calls Layer 4)                  │
│  - Data fetching (calls Layer 4)                          │
│  - SEO optimization                                        │
│                                                             │
│  CSR (Client Components - React):                          │
│  - Interactive features                                    │
│  - Real-time updates                                       │
│  - Dynamic filtering                                       │
│  - Permission-based UI rendering                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: API GATEWAY (Nginx)                              │
│  - Request routing                                          │
│  - SSL termination                                          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: MIDDLEWARE (Django)                              │
│  - TenantMiddleware (tenant isolation)                     │
│  - PermissionCheckMiddleware (authorization)                │
│  - DeviceTrackingMiddleware (security)                      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: API LAYER (Django REST Framework)                │
│  - ViewSets / APIViews                                      │
│  - Serializers (validation)                                │
│  - Permission classes                                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: BUSINESS LOGIC (Django Services)                 │
│  - Permission evaluation (RBAC + ABAC)                      │
│  - Business rule validation                                 │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 6: DATA ACCESS (Django ORM)                         │
│  - TenantManager / FarmManager                              │
│  - Query optimization                                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 7: DATABASE (PostgreSQL)                            │
│  - Data persistence                                         │
│  - Constraints & indexes                                    │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
1. User navigates to /dashboard/animals
   ↓
2. Next.js Server Component (SSR)
   - Calls getServerSession() → validates JWT
   - Calls requirePermission('view_animals') → Layer 4/5 validation
   ↓
3. Django API (Layer 4)
   - PermissionCheckMiddleware validates permission
   - AnimalService.get_animals() → Layer 5 business logic
   ↓
4. Django Service (Layer 5)
   - PermissionService.evaluate() → RBAC + ABAC
   - AnimalService.get_animals() → business rules
   ↓
5. Django ORM (Layer 6)
   - TenantManager auto-filters by tenant_id
   - FarmManager auto-filters by accessible farms
   ↓
6. PostgreSQL (Layer 7)
   - Executes query with tenant/farm filters
   - Returns data
   ↓
7. Next.js Server Component
   - Receives data + permissions
   - Renders initial HTML
   ↓
8. Client Component (CSR)
   - Hydrates with initial data
   - Sets up real-time updates
   - Handles user interactions
```

---

## Implementation Strategy

### Phase 1: Server-Side Permission Validation

Create server-side utilities for permission checking:

```typescript
// lib/auth-server.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    // Verify JWT (Layer 4: API validation)
    const payload = jwt.verify(token, process.env.SECRET_KEY!) as {
      user_id: number;
      tenant_id: number;
      permission_ids: number[];
      accessible_farm_ids: number[];
    };
    
    // Fetch fresh permissions from backend (Layer 5: Business Logic)
    const response = await fetch(`${process.env.API_URL}/api/v1/users/me/permissions`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': payload.tenant_id.toString()
      },
      cache: 'no-store' // Always fetch fresh permissions
    });
    
    if (!response.ok) {
      return null;
    }
    
    const { permissions, accessible_farms } = await response.json();
    
    return {
      user_id: payload.user_id,
      tenant_id: payload.tenant_id,
      permissions: permissions as string[],
      accessible_farm_ids: accessible_farms as number[],
      token
    };
  } catch {
    return null;
  }
}

export async function requirePermission(permission: string) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Layer 5: Permission check
  if (!session.permissions.includes(permission)) {
    redirect('/dashboard?error=unauthorized');
  }
  
  return session;
}

export async function requireAnyPermission(permissions: string[]) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Layer 5: Permission check (OR logic)
  const hasAccess = permissions.some(p => session.permissions.includes(p));
  
  if (!hasAccess) {
    redirect('/dashboard?error=unauthorized');
  }
  
  return session;
}
```

### Phase 2: Hybrid Page Components

Create server components for initial load, client components for interactivity:

```typescript
// app/dashboard/animals/page.tsx (Server Component)
import { requirePermission } from '@/lib/auth-server';
import AnimalsClient from './AnimalsClient';

export default async function AnimalsPage() {
  // Server-side permission check (Layer 4/5)
  const session = await requirePermission('view_animals');
  
  // Server-side data fetching (Layer 4 → 5 → 6 → 7)
  const animalsResponse = await fetch(`${process.env.API_URL}/api/v1/animals`, {
    headers: { 
      'Authorization': `Bearer ${session.token}`,
      'X-Tenant-ID': session.tenant_id.toString()
    },
    cache: 'no-store' // Always fetch fresh data
  });
  
  if (!animalsResponse.ok) {
    throw new Error('Failed to fetch animals');
  }
  
  const animals = await animalsResponse.json();
  
  // Pass to client component with permissions baked in
  return (
    <AnimalsClient 
      initialAnimals={animals}
      permissions={session.permissions}
      accessibleFarms={session.accessible_farm_ids}
    />
  );
}
```

### Phase 3: Client Components for Interactivity

Create client components that handle dynamic updates:

```typescript
// app/dashboard/animals/AnimalsClient.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useWebSocket } from '@/hooks/useWebSocket';
import AnimalsTable from './AnimalsTable';
import CreateAnimalButton from './CreateAnimalButton';

interface Props {
  initialAnimals: Animal[];
  permissions: string[];
  accessibleFarms: number[];
}

export default function AnimalsClient({ 
  initialAnimals, 
  permissions: initialPermissions,
  accessibleFarms 
}: Props) {
  const [animals, setAnimals] = useState(initialAnimals);
  const { permissions, hasPermission } = usePermissions(initialPermissions);
  const { subscribe } = useWebSocket();
  
  // Real-time permission updates
  useEffect(() => {
    const unsubscribe = subscribe('permissions.updated', (data) => {
      // Update permissions dynamically
      setPermissions(data.permissions);
      
      // If user lost view permission, redirect
      if (!data.permissions.includes('view_animals')) {
        router.push('/dashboard?error=unauthorized');
      }
    });
    
    return unsubscribe;
  }, []);
  
  // Real-time data updates
  useEffect(() => {
    const unsubscribe = subscribe('animal.created', (data) => {
      // Optimistically add new animal
      setAnimals(prev => [data.animal, ...prev]);
    });
    
    return unsubscribe;
  }, []);
  
  // Dynamic filtering (client-side for better UX)
  const handleFilterChange = async (filters: FilterOptions) => {
    const response = await fetch('/api/v1/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters })
    });
    
    const filtered = await response.json();
    setAnimals(filtered);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Animals</h1>
        
        {/* Permission-based UI rendering */}
        {hasPermission('create_animal') && (
          <CreateAnimalButton accessibleFarms={accessibleFarms} />
        )}
      </div>
      
      {/* Permission-based feature access */}
      {hasPermission('view_animals') ? (
        <AnimalsTable 
          animals={animals}
          onFilterChange={handleFilterChange}
          canEdit={hasPermission('edit_animal')}
          canDelete={hasPermission('delete_animal')}
        />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}
```

---

## Server-Side Rendering (SSR)

### When to Use SSR

✅ **Use SSR for**:
- Initial page loads
- Permission validation
- Data fetching
- SEO-critical pages
- Security-sensitive content

### SSR Implementation Pattern

```typescript
// Pattern: Server Component → Permission Check → Data Fetch → Client Component

// 1. Server Component (app/dashboard/page.tsx)
export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Fetch dashboard data server-side
  const dashboardData = await fetchDashboardData(session);
  
  return <DashboardClient initialData={dashboardData} permissions={session.permissions} />;
}

// 2. Client Component (app/dashboard/DashboardClient.tsx)
'use client';

export default function DashboardClient({ initialData, permissions }) {
  // Client-side interactivity
  const [data, setData] = useState(initialData);
  
  return <DashboardContent data={data} permissions={permissions} />;
}
```

---

## Client-Side Rendering (CSR)

### When to Use CSR

✅ **Use CSR for**:
- Interactive components
- Real-time updates
- Dynamic filtering
- Permission-based UI rendering
- Optimistic updates

### CSR Implementation Pattern

```typescript
// Pattern: Client Component → Real-time Updates → Permission Checks

'use client';

export default function InteractiveComponent({ initialData, permissions }) {
  const { hasPermission } = usePermissions(permissions);
  const { subscribe } = useWebSocket();
  
  // Real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('data.updated', (data) => {
      // Update UI optimistically
      setData(prev => updateData(prev, data));
    });
    
    return unsubscribe;
  }, []);
  
  // Permission-based rendering
  return (
    <>
      {hasPermission('create_item') && <CreateButton />}
      {hasPermission('edit_item') && <EditButton />}
      <DataTable data={data} canEdit={hasPermission('edit_item')} />
    </>
  );
}
```

---

## Real-Time Permission Updates

### WebSocket Integration

```typescript
// hooks/useWebSocket.ts
'use client';

import { useEffect, useRef } from 'react';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current = ws;
    
    ws.onopen = () => {
      // Authenticate with JWT
      const token = localStorage.getItem('access_token');
      ws.send(JSON.stringify({ type: 'auth', token }));
    };
    
    return () => {
      ws.close();
    };
  }, []);
  
  const subscribe = (event: string, callback: (data: any) => void) => {
    const handler = (message: MessageEvent) => {
      const data = JSON.parse(message.data);
      if (data.type === event) {
        callback(data.payload);
      }
    };
    
    wsRef.current?.addEventListener('message', handler);
    
    // Return unsubscribe function
    return () => {
      wsRef.current?.removeEventListener('message', handler);
    };
  };
  
  return { subscribe };
}
```

### Permission Update Hook

```typescript
// hooks/usePermissions.ts
'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useRouter } from 'next/navigation';

export function usePermissions(initialPermissions: string[]) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const { subscribe } = useWebSocket();
  const router = useRouter();
  
  useEffect(() => {
    // Subscribe to permission changes
    const unsubscribe = subscribe('permissions.updated', (data) => {
      setPermissions(data.permissions);
      
      // If critical permissions removed, redirect
      if (!data.permissions.includes('view_dashboard')) {
        router.push('/login?error=permissions_revoked');
      }
    });
    
    return unsubscribe;
  }, []);
  
  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };
  
  const hasAnyPermission = (perms: string[]) => {
    return perms.some(p => permissions.includes(p));
  };
  
  return { permissions, hasPermission, hasAnyPermission };
}
```

---

## Security Considerations

### 1. Server-Side Validation is Mandatory

```typescript
// ✅ CORRECT: Server-side validation
export default async function SecurePage() {
  const session = await requirePermission('sensitive_action');
  // Only proceed if permission validated server-side
}

// ❌ WRONG: Client-side only
'use client';
export default function InsecurePage() {
  const hasPermission = checkPermissionClientSide(); // Can be bypassed!
}
```

### 2. Never Trust Client-Side Checks

```typescript
// ✅ CORRECT: Server validates, client renders
export default async function Page() {
  const session = await requirePermission('view_data');
  const data = await fetchData(session);
  return <ClientComponent data={data} />;
}

// ❌ WRONG: Client fetches data
'use client';
export default function Page() {
  const hasPermission = checkPermission(); // Not secure!
  if (hasPermission) {
    fetch('/api/data'); // Data might be sent even without permission
  }
}
```

### 3. JWT Token Security

```typescript
// ✅ CORRECT: HTTP-only cookies
export async function setAuthCookie(token: string) {
  cookies().set('access_token', token, {
    httpOnly: true, // Not accessible via JavaScript
    secure: true,   // HTTPS only
    sameSite: 'strict',
    maxAge: 60 * 15 // 15 minutes
  });
}

// ❌ WRONG: localStorage
localStorage.setItem('access_token', token); // Vulnerable to XSS
```

---

## Performance Optimization

### 1. Caching Strategy

```typescript
// Server Component with caching
export default async function CachedPage() {
  const session = await getServerSession();
  
  // Cache data for 5 minutes
  const data = await fetch(`${process.env.API_URL}/api/v1/data`, {
    next: { revalidate: 300 }, // 5 minutes
    headers: { 'Authorization': `Bearer ${session.token}` }
  }).then(r => r.json());
  
  return <ClientComponent data={data} />;
}
```

### 2. Parallel Data Fetching

```typescript
// Fetch multiple resources in parallel
export default async function DashboardPage() {
  const session = await getServerSession();
  
  // Parallel fetching
  const [animals, farms, production] = await Promise.all([
    fetchAnimals(session),
    fetchFarms(session),
    fetchProduction(session)
  ]);
  
  return <DashboardClient animals={animals} farms={farms} production={production} />;
}
```

### 3. Incremental Static Regeneration (ISR)

```typescript
// For semi-static content
export default async function ReportsPage() {
  const session = await getServerSession();
  
  // ISR: Revalidate every hour
  const reports = await fetch(`${process.env.API_URL}/api/v1/reports`, {
    next: { revalidate: 3600 }, // 1 hour
    headers: { 'Authorization': `Bearer ${session.token}` }
  }).then(r => r.json());
  
  return <ReportsClient reports={reports} />;
}
```

---

## Code Examples

### Complete Example: Animals Page

```typescript
// app/dashboard/animals/page.tsx (Server Component)
import { requirePermission } from '@/lib/auth-server';
import AnimalsClient from './AnimalsClient';

export const metadata = {
  title: 'Animals - iFarm',
  description: 'Manage your farm animals'
};

export default async function AnimalsPage({
  searchParams
}: {
  searchParams: { farm?: string; status?: string }
}) {
  // Server-side permission check
  const session = await requirePermission('view_animals');
  
  // Build query params
  const params = new URLSearchParams({
    tenant_id: session.tenant_id.toString(),
    ...(searchParams.farm && { farm_id: searchParams.farm }),
    ...(searchParams.status && { status: searchParams.status })
  });
  
  // Fetch animals server-side
  const animals = await fetch(
    `${process.env.API_URL}/api/v1/animals?${params}`,
    {
      headers: { 
        'Authorization': `Bearer ${session.token}`,
        'X-Tenant-ID': session.tenant_id.toString()
      },
      cache: 'no-store'
    }
  ).then(r => r.json());
  
  return (
    <AnimalsClient
      initialAnimals={animals}
      permissions={session.permissions}
      accessibleFarms={session.accessible_farm_ids}
      searchParams={searchParams}
    />
  );
}
```

```typescript
// app/dashboard/animals/AnimalsClient.tsx (Client Component)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { useWebSocket } from '@/hooks/useWebSocket';
import AnimalsTable from './AnimalsTable';
import CreateAnimalDialog from './CreateAnimalDialog';

interface Props {
  initialAnimals: Animal[];
  permissions: string[];
  accessibleFarms: number[];
  searchParams: { farm?: string; status?: string };
}

export default function AnimalsClient({
  initialAnimals,
  permissions: initialPermissions,
  accessibleFarms,
  searchParams
}: Props) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [animals, setAnimals] = useState(initialAnimals);
  const [loading, setLoading] = useState(false);
  const { permissions, hasPermission } = usePermissions(initialPermissions);
  const { subscribe } = useWebSocket();
  
  // Real-time updates
  useEffect(() => {
    const unsubscribes = [
      subscribe('animal.created', (data) => {
        setAnimals(prev => [data.animal, ...prev]);
      }),
      subscribe('animal.updated', (data) => {
        setAnimals(prev => prev.map(a => 
          a.animal_id === data.animal.animal_id ? data.animal : a
        ));
      }),
      subscribe('animal.deleted', (data) => {
        setAnimals(prev => prev.filter(a => a.animal_id !== data.animal_id));
      }),
      subscribe('permissions.updated', (data) => {
        if (!data.permissions.includes('view_animals')) {
          router.push('/dashboard?error=unauthorized');
        }
      })
    ];
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);
  
  // Dynamic filtering
  const handleFilterChange = useCallback(async (filters: FilterOptions) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(searchParamsHook.entries()),
        ...filters
      });
      
      const response = await fetch(`/api/v1/animals?${params}`);
      const filtered = await response.json();
      setAnimals(filtered);
      
      // Update URL without reload
      router.push(`/dashboard/animals?${params}`, { scroll: false });
    } finally {
      setLoading(false);
    }
  }, [searchParamsHook, router]);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Animals</h1>
        
        {hasPermission('create_animal') && (
          <CreateAnimalDialog accessibleFarms={accessibleFarms} />
        )}
      </div>
      
      {hasPermission('view_animals') ? (
        <AnimalsTable
          animals={animals}
          loading={loading}
          onFilterChange={handleFilterChange}
          canEdit={hasPermission('edit_animal')}
          canDelete={hasPermission('delete_animal')}
          initialFilters={searchParams}
        />
      ) : (
        <AccessDenied message="You don't have permission to view animals" />
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Always Validate Server-Side

```typescript
// ✅ DO: Server-side validation
export default async function Page() {
  await requirePermission('action');
  // Proceed
}

// ❌ DON'T: Client-side only
'use client';
export default function Page() {
  if (hasPermission('action')) { // Not secure!
    // Proceed
  }
}
```

### 2. Use Type Safety

```typescript
// Define permission types
type Permission = 
  | 'view_animals'
  | 'create_animal'
  | 'edit_animal'
  | 'delete_animal';

// Type-safe permission checking
function requirePermission(permission: Permission) {
  // Implementation
}
```

### 3. Optimize Data Fetching

```typescript
// ✅ DO: Parallel fetching
const [data1, data2] = await Promise.all([fetch1(), fetch2()]);

// ❌ DON'T: Sequential fetching
const data1 = await fetch1();
const data2 = await fetch2(); // Waits for data1
```

### 4. Handle Loading States

```typescript
// ✅ DO: Show loading state
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client component handles loading
'use client';
export default function ClientComponent({ data }) {
  if (!data) return <Loading />;
  return <Content data={data} />;
}
```

### 5. Error Handling

```typescript
// ✅ DO: Proper error handling
export default async function Page() {
  try {
    const session = await requirePermission('action');
    const data = await fetchData(session);
    return <ClientComponent data={data} />;
  } catch (error) {
    redirect('/dashboard?error=unauthorized');
  }
}
```

---

## Summary

The hybrid CSR/SSR approach provides:

✅ **Security**: Server-side permission validation prevents unauthorized access  
✅ **Performance**: Faster initial loads with data and permissions baked in  
✅ **User Experience**: No FOUC, smooth interactions, real-time updates  
✅ **SEO**: Server-rendered content for better indexing  
✅ **Scalability**: Efficient caching and data fetching strategies

**Key Takeaways**:
- Use SSR for initial loads and permission validation
- Use CSR for interactivity and real-time updates
- Always validate permissions server-side
- Use WebSocket/SSE for real-time permission updates
- Optimize with caching and parallel fetching

**Status**: Production-ready architecture pattern! 🚀

