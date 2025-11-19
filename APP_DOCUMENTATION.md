# iFarm - Livestock Management System Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Concepts](#core-concepts)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Features & Modules](#features--modules)
6. [Data Models](#data-models)
7. [Technical Implementation](#technical-implementation)
8. [API Structure](#api-structure)
9. [Workflows](#workflows)

---

## Overview

iFarm is a comprehensive multi-tenant livestock management system designed to help farm owners, managers, and workers efficiently manage their livestock operations. The system provides features for animal tracking, breeding management, financial tracking, inventory management, and comprehensive reporting.

### Key Features

- **Multi-Tenant Architecture**: Support for multiple farm organizations with complete data isolation
- **Attribute-Based Access Control (ABAC)**: Fine-grained permission system with role-based access
- **Animal Lifecycle Management**: Track animals from birth to sale/disposal
- **Breeding Management**: Internal and external breeding tracking with hire agreements
- **Financial Tracking**: Sales, expenses, and revenue management
- **Inventory Management**: Supplies, equipment, feed, and tools tracking
- **Activity Logging**: Comprehensive audit trail for all operations
- **Analytics & Reporting**: Business intelligence and performance metrics

### Technology Stack

- **Frontend**: Next.js 16 (React), TypeScript, Material-UI (MUI)
- **Rendering Strategy**: **Hybrid CSR/SSR** (Server Components + Client Components)
- **State Management**: React Hooks (useState, useMemo, useEffect)
- **Routing**: Next.js App Router
- **Authentication**: JWT-based authentication with role-based access control
- **Real-Time**: WebSocket/SSE for permission updates
- **Data Layer**: Mock data structure (ready for backend integration)

### Hybrid Rendering Architecture

The frontend uses a **hybrid Client-Side Rendering (CSR) and Server-Side Rendering (SSR)** approach, similar to Discord's architecture:

- **SSR (Server Components)**: Initial page loads, permission validation, data fetching
- **CSR (Client Components)**: Interactive features, real-time updates, dynamic filtering
- **Security**: Server-side permission validation prevents unauthorized content from being sent
- **Performance**: Faster initial loads with data and permissions baked in
- **User Experience**: No flash of unauthorized content (FOUC), smooth interactions

See [FRONTEND_HYBRID_RENDERING.md](./FRONTEND_HYBRID_RENDERING.md) for complete documentation.

---

## System Architecture

### Multi-Tenant Design

The system implements strict tenant isolation where:
- Each tenant organization has its own farms, animals, users, and data
- All database queries filter by `tenant_id` to ensure data isolation
- Users belong to a tenant and can only access data within their tenant
- Super admins have system-wide access across all tenants

### Permission System

The system uses a hybrid permission evaluation approach:

1. **Permission Library**: Fast permission checks based on user roles
2. **ABAC Policies**: Optional policy evaluation for complex access rules
3. **Delegation Support**: Temporary permission delegation between users

### Component Structure

```
app/
├── dashboard/           # Main application pages
│   ├── admin/          # Admin-only pages
│   ├── helper/         # Helper/worker pages
│   ├── vet/            # Veterinarian pages
│   ├── breeding/       # Breeding management
│   ├── inventory/      # Inventory management
│   └── ...
├── components/         # Reusable UI components
├── lib/                # Utility functions and helpers
└── types/              # TypeScript type definitions
```

---

## Core Concepts

### Tenant

A tenant represents an organization (farm business) that uses the system. Each tenant:
- Has one or more farms
- Has multiple users (owners, helpers, vets, etc.)
- Maintains complete data isolation from other tenants
- Can have subscription plans and billing

### Farm

A farm is a physical location where livestock is managed. Features:
- Multiple farms per tenant
- Location tracking (coordinates, district)
- Farm-specific animal inventory
- Farm-specific activities and records

### Animal

Animals are the core entities in the system. Each animal has:
- Unique identification (tag number)
- Breed and type information
- Health status and medical history
- Breeding history and lineage
- Production records (milk, eggs, etc.)
- Lifecycle status (alive, sold, deceased, stolen)

### Role & Permission

- **Roles**: Collections of permissions assigned to users
- **Permissions**: Granular access rights (view, create, edit, delete)
- **Policies**: ABAC rules that can override permissions based on conditions
- **Role Templates**: Pre-defined role configurations

### Activity

Activities represent actions performed on farms:
- Feeding schedules
- Health checks
- Breeding records
- Production records
- Weaning records
- General activities

---

## User Roles & Permissions

The system supports multiple user roles, each with specific permissions and access levels:

### Role Types

1. **Owner (Farm Owner)**
   - Full control over their tenant organization
   - Can manage all farms, animals, users, and settings
   - Access to all financial and operational data
   - Can create and assign roles to other users

2. **Super Admin**
   - System-wide access across all tenants
   - Can manage tenants, users, and system settings
   - View-only access to all tenant data
   - Cannot modify tenant-specific data

3. **Veterinarian**
   - Medical professional role
   - Can edit animal health records
   - Can log health checks, vaccinations, treatments
   - Can record medications and medical expenses
   - View-only access to most other features

4. **Farm Manager (Helper with Elevated Permissions)**
   - Can create and edit animals
   - Can log all activities (feeding, breeding, production)
   - Can manage breeding records and weaning
   - Can view financial data
   - Cannot delete animals or manage users

5. **Field Worker (Helper - Limited)**
   - Can view animals and farms
   - Can log basic activities (feeding, production)
   - Can log castration activities
   - Cannot create/edit animals or access financial data

6. **Veterinary Technician/Assistant**
   - Can log health checks and treatments
   - Can record medications
   - Cannot edit health records (read-only)
   - Limited to medical-related activities

7. **Accountant**
   - Full access to financial data
   - Can view sales, expenses, and reports
   - Can record financial transactions
   - Cannot access animal or farm management

### Permission System

Permissions are organized into categories:

- **Animals**: `view_animals`, `create_animals`, `edit_animals`, `delete_animals`
- **Activities**: `create_feeding`, `create_breeding`, `create_general`, `edit_activities`
- **Health**: `view_health`, `edit_health`, `log_health_checks`
- **Reports**: `view_operational_reports`, `view_financial_reports`, `view_health_reports`
- **Management**: `manage_users`, `manage_roles`, `manage_farms`

### Permission Evaluation

The system uses a hybrid evaluation approach:

1. **Fast Permission Check**: Quick lookup based on user roles
2. **ABAC Policy Evaluation**: Optional policy-based rules for complex scenarios
3. **Delegation**: Temporary permission delegation between users

### Role-Based Navigation

The sidebar navigation automatically filters based on user permissions:
- Owners see all navigation items
- Helpers see simplified navigation focused on data entry
- Vets see medical-focused navigation
- Admins see system administration items

---

## Features & Modules

### 1. Animal Management

**Location**: `/dashboard/animals`

Comprehensive animal tracking and management:
- **Animal Inventory**: View all animals across farms with filtering and search
- **Animal Details**: Complete animal profiles including:
  - Basic information (tag, breed, type, gender, birth date)
  - Health status and medical history
  - Breeding history and lineage
  - Production records
  - Lifecycle status (alive, sold, deceased, stolen)
- **Animal Operations**: Create, edit, and delete animals (based on permissions)
- **Lineage Tracking**: View animal pedigree and family trees
- **Animal Types**: Manage animal breed and type classifications

**Helper View**: `/dashboard/helper/animals` - Simplified view for data entry

### 2. Breeding Management

**Overview Dashboard**: `/dashboard/helper/pregnancy`
- Central dashboard for all breeding records
- Quick navigation to breeding-related pages
- Filter by pregnancy status and sire source

**Record Breeding**: `/dashboard/breeding/record`
- Multi-step wizard form for recording breeding events
- Select animals and sire (internal or external)
- Link to hire agreements
- Record conception dates, expected due dates
- Record birth outcomes and complications

**Internal Breeding**: `/dashboard/breeding/internal`
- View and manage breeding records using internal sires
- Track pregnancy status and outcomes
- Filter by farm, status, and date range

**External Breeding**: `/dashboard/breeding/external`
- Manage breeding records using external farm animals
- Track external farm partnerships
- Monitor hire agreements and costs

**Breeding Analytics**: `/dashboard/breeding/analytics`
- Success rate analysis (internal vs external)
- Birth pattern charts
- Top-producing animals
- Financial summary (revenue/expenses from hires)
- Cost per successful birth metrics

**Hire Agreements**: `/dashboard/breeding/hire-agreements`
- Manage animal hire agreements
- Hire out your animals to other farms (revenue)
- Hire external animals for breeding (expense)
- Track payment status and terms

**External Farms & Animals**: 
- `/dashboard/breeding/external-farms` - Manage partner farms
- `/dashboard/breeding/external-animals` - Track external animals used for breeding

### 3. Financial Management

**Sales**: `/dashboard/sales`
- Track animal sales and product sales
- Revenue from animal hire agreements
- Sales analytics and trends
- Filter by date, farm, and sale type

**Expenses**: `/dashboard/expenses`
- Record and track all farm expenses
- Automatic expense tracking from external animal hires
- Expense categorization (feed, medicine, labor, equipment, etc.)
- Expense analytics by type and farm

**Helper Sales View**: `/dashboard/helper/sales` - Simplified sales view for helpers

### 4. Inventory Management

**Supplies & Equipment**: `/dashboard/inventory/supplies`
- Track feed, medications, equipment, tools, and supplies
- Stock level monitoring with low stock alerts
- Expiry date tracking for medications and feed
- Inventory value calculation
- Multi-step wizard form for adding/updating items

**Inventory Record Form**: `/dashboard/inventory/supplies/record`
- 4-step wizard for inventory item entry:
  1. Item Information (name, category, description)
  2. Stock & Pricing (current stock, reorder point, unit cost)
  3. Supplier & Location (supplier details, storage location)
  4. Review & Confirm

**Animal Inventory**: `/dashboard/inventory` - View animal inventory by farm

### 5. Activity Logging

**Activities**: `/dashboard/activities`
- Log all farm activities:
  - Feeding schedules
  - Health checks
  - Breeding records
  - Production records
  - Weaning records
  - General activities
- Filter by activity type, farm, and date
- Activity history and audit trail

**Production Records**: `/dashboard/helper/production`
- Record production (milk, eggs, wool, honey)
- Multi-step wizard form for data entry
- Track quantity, quality, and animal

**Weaning Records**: `/dashboard/helper/weaning`
- Record weaning events
- Track weaning dates, health, and weight
- Multi-step wizard form

### 6. Farm Management

**Farms**: `/dashboard/farms`
- Manage multiple farms per tenant
- Farm details (name, location, coordinates, district)
- Farm status (active, inactive, archived)
- Farm-specific animal inventory

**Helper Farms View**: `/dashboard/helper/farms` - Simplified farm view

### 7. Veterinary Management

**Animal Tracking**: `/dashboard/vet/animal-tracking`
- Medical records and health tracking
- Vaccination schedules
- Treatment history
- Medication records

**Medications**: `/dashboard/vet/medications`
- Medication inventory and tracking
- Dosage and administration records
- Expiry date monitoring

**Medical Expenses**: `/dashboard/vet/medical-expenses`
- Track veterinary costs
- Medical procedure expenses
- Treatment cost analysis

### 8. Analytics & Reporting

**Breeding Analytics**: `/dashboard/breeding/analytics`
- Internal vs external breeding success rates
- Birth pattern analysis
- Top-producing animals
- Financial metrics

**Birth Rates**: `/dashboard/analytics/birth-rates`
- Birth rate trends over time
- Success rate analysis
- Seasonal patterns

**Dashboard**: `/dashboard`
- Overview statistics
- Quick access to key metrics
- Role-specific dashboard views

### 9. User & Access Management

**Users**: `/dashboard/users`
- User management interface
- Invite new users
- Assign roles to users
- View user details and permissions

**Roles**: `/dashboard/roles`
- Create and manage custom roles
- Assign permissions to roles
- Clone from role templates
- Edit and delete roles

**Role Templates**: `/dashboard/role-templates`
- Pre-built role templates
- Clone templates to create roles
- View template permissions

**Permissions**: `/dashboard/permissions`
- Browse system permissions
- Search and filter permissions
- View permission details

**Policies**: `/dashboard/policies`
- Create ABAC policies
- Time-based access rules
- Policy priority management

**Delegations**: `/dashboard/delegations`
- Create temporary access delegations
- Time-bound delegations
- Permission delegation between users

**Audit Logs**: `/dashboard/audit-logs`
- Complete audit trail
- Filter by action, entity, date
- View detailed log information

### 10. Admin Features (Super Admin Only)

**Admin Overview**: `/dashboard/admin/overview`
- System-wide statistics
- Tenant management
- User management across tenants

**Tenant Management**: `/dashboard/admin/tenants`
- View all tenants
- Tenant details and settings
- Subscription management

**All Data Views**: 
- `/dashboard/admin/animals` - All animals across tenants
- `/dashboard/admin/farms` - All farms across tenants
- `/dashboard/admin/users` - All users across tenants
- `/dashboard/admin/sales` - All sales across tenants
- `/dashboard/admin/expenses` - All expenses across tenants

**System Settings**: `/dashboard/admin/system-settings`
- System configuration
- Global settings management

**Database Management**: `/dashboard/admin/database`
- Database administration tools
- Data export/import

---

## Data Models

### Core System Models

#### Tenant
Represents an organization using the system.

```typescript
interface Tenant {
  tenant_id: number;
  organization_name: string;
  owner_user_id: number;
  subscription_plan_id?: number;
  created_at: string;
}
```

#### User
System user with authentication and profile information.

```typescript
interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  account_status: 'active' | 'pending_invitation' | 'suspended';
  is_super_admin?: boolean;
}
```

#### Farm
Physical location where livestock is managed.

```typescript
interface Farm {
  farm_id: number;
  tenant_id: number;
  farm_name: string;
  location?: string;
  district?: string;
  coordinates?: { latitude: number; longitude: number };
  farm_type?: string;
  status: 'active' | 'inactive' | 'archived';
}
```

### Permission & Access Control Models

#### Permission
Granular access right definition.

```typescript
interface Permission {
  permission_id: number;
  name: string;
  display_name: string;
  description: string;
  category: 'animals' | 'activities' | 'reports' | 'management';
  action: string;
  resource_type: string;
  system_defined: boolean;
}
```

#### Role
Collection of permissions assigned to users.

```typescript
interface Role {
  role_id: number;
  tenant_id: number;
  template_id?: number;
  name: string;
  description: string;
  permissions: Permission[];
  policies?: Policy[];
  created_by_user_id?: number;
  created_at: string;
}
```

#### Policy
ABAC policy with conditions and time restrictions.

```typescript
interface Policy {
  policy_id: number;
  tenant_id: number;
  name: string;
  description: string;
  priority: number;
  rules: PolicyRules;
  created_at: string;
}

interface PolicyRules {
  effect: 'allow' | 'deny';
  conditions?: PolicyCondition[];
  time_conditions?: TimeCondition[];
}
```

#### Delegation
Temporary permission delegation between users.

```typescript
interface Delegation {
  delegation_id: number;
  tenant_id: number;
  delegator_user_id: number;
  delegate_user_id: number;
  delegation_type: 'permission' | 'role' | 'full_access';
  start_date: string;
  end_date: string;
  status: 'active' | 'revoked' | 'expired';
  delegated_role_id?: number;
  delegated_permission_ids?: number[];
  restrictions?: {
    time_restriction?: { start: string; end: string };
    resource_restriction?: { animal_ids?: number[] };
    action_restriction?: string[];
  };
}
```

### Livestock Management Models

#### Animal
Core entity representing livestock.

```typescript
interface Animal {
  animal_id: number;
  farm_id: number;
  tenant_id: number;
  tag_number: string;
  animal_type: 'cattle' | 'goat' | 'sheep' | 'pig' | 'chicken' | 'duck' | 'other';
  breed?: string;
  gender: 'male' | 'female';
  birth_date?: string;
  purchase_date?: string;
  purchase_price?: number;
  status: 'active' | 'sold' | 'deceased' | 'disposed';
  health_status?: 'healthy' | 'sick' | 'recovering' | 'quarantine';
  mother_animal_id?: number;
  father_animal_id?: number;
  is_castrated?: boolean;
  castration_date?: string;
  castration_method?: 'surgical' | 'banding' | 'chemical' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

#### BreedingRecord
Comprehensive breeding and pregnancy tracking.

```typescript
interface BreedingRecord {
  breeding_id: number;
  tenant_id: number;
  farm_id: number;
  animal_id: number; // Female (your animal)
  sire_id?: number; // Internal sire
  external_animal_id?: number; // External sire
  sire_source: 'internal' | 'external';
  external_farm_name?: string;
  external_animal_tag?: string;
  animal_hire_agreement_id?: number; // Your animal hired out
  external_animal_hire_agreement_id?: number; // External animal hired
  breeding_date: string;
  breeding_method?: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  conception_date?: string;
  expected_due_date?: string;
  actual_birth_date?: string;
  birth_outcome?: 'successful' | 'stillborn' | 'aborted' | 'complications';
  offspring_count?: number;
  offspring_ids?: number[];
  complications?: string;
  pregnancy_status?: 'suspected' | 'confirmed' | 'completed' | 'failed';
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
  updated_at?: string;
}
```

#### Activity
Farm activity log entry.

```typescript
interface Activity {
  activity_id: number;
  farm_id: number;
  tenant_id: number;
  activity_type: 'feeding' | 'breeding' | 'health_check' | 'vaccination' | 'castration' | 'general' | 'other';
  animal_id?: number;
  description: string;
  activity_date: string;
  performed_by_user_id: number;
  cost?: number;
  notes?: string;
  metadata?: {
    castration_method?: 'surgical' | 'banding' | 'chemical' | 'other';
    veterinarian_name?: string;
    complications?: string;
    [key: string]: any;
  };
  created_at: string;
}
```

#### Production
Production record (milk, eggs, wool, honey).

```typescript
interface Production {
  production_id: number;
  tenant_id: number;
  farm_id: number;
  production_type: 'milk' | 'eggs' | 'wool' | 'honey';
  animal_id?: number;
  production_date: string;
  quantity: number;
  unit: 'liters' | 'kg' | 'pieces' | 'dozen';
  quality_notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}
```

### Financial Models

#### AnimalSale
Animal sale transaction.

```typescript
interface AnimalSale {
  sale_id: number;
  tenant_id: number;
  farm_id: number;
  animal_id: number;
  sale_date: string;
  sale_type: 'direct' | 'auction' | 'contract';
  customer_name?: string;
  customer_contact?: string;
  sale_price: number;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  created_by_user_id: number;
  created_at: string;
}
```

#### ProductSale
Product sale transaction.

```typescript
interface ProductSale {
  product_sale_id: number;
  tenant_id: number;
  farm_id: number;
  product_type: 'milk' | 'eggs' | 'wool' | 'honey' | 'meat' | 'other';
  animal_id?: number;
  quantity: number;
  unit: 'liters' | 'kg' | 'pieces' | 'dozen';
  unit_price: number;
  total_amount: number;
  sale_date: string;
  customer_name?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  payment_status: 'pending' | 'partial' | 'paid';
  created_by_user_id: number;
  created_at: string;
}
```

#### Expense
Expense record.

```typescript
interface Expense {
  expense_id: number;
  tenant_id: number;
  farm_id: number;
  expense_type: 'feed' | 'medicine' | 'labor' | 'equipment' | 'utilities' | 'transport' | 'animal_hire' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  vendor?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  receipt_url?: string;
  external_animal_hire_agreement_id?: number; // Link to hire agreement
  created_by_user_id: number;
  created_at: string;
}
```

### Inventory Models

#### InventoryItem
Inventory item (supplies, equipment, feed, tools).

```typescript
interface InventoryItem {
  item_id: number;
  tenant_id: number;
  farm_id: number;
  item_name: string;
  item_code?: string; // SKU or barcode
  category: 'feed' | 'medication' | 'equipment' | 'tools' | 'supplies' | 'bedding' | 'other';
  subcategory?: string;
  description?: string;
  unit: string; // "kg", "liters", "pieces", "bags"
  current_stock: number;
  reorder_point: number;
  reorder_quantity?: number;
  unit_cost?: number;
  total_value?: number; // current_stock * unit_cost
  supplier?: string;
  supplier_contact?: string;
  location?: string;
  expiry_date?: string;
  batch_number?: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'expired' | 'discontinued';
  notes?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}
```

#### InventoryMovement
Stock movement tracking.

```typescript
interface InventoryMovement {
  movement_id: number;
  item_id: number;
  tenant_id: number;
  farm_id: number;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit: string;
  unit_cost?: number;
  total_cost?: number;
  reason?: string; // "purchase", "usage", "damaged", "expired"
  reference_number?: string;
  related_activity_id?: number;
  notes?: string;
  created_by_user_id: number;
  created_at: string;
}
```

### External Farm Models (Phase 7)

#### ExternalFarm
Partner farm for breeding partnerships.

```typescript
interface ExternalFarm {
  external_farm_id: number;
  tenant_id: number;
  farm_name: string;
  owner_name?: string;
  contact_person?: string;
  phone: string;
  email?: string;
  location?: string;
  district?: string;
  coordinates?: { latitude: number; longitude: number };
  farm_type?: string;
  specialties?: string[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### ExternalAnimal
External animal used for breeding.

```typescript
interface ExternalAnimal {
  external_animal_id: number;
  external_farm_id: number;
  tag_number?: string;
  animal_type: 'cattle' | 'goat' | 'sheep' | 'pig' | 'other';
  breed?: string;
  gender?: 'male' | 'female';
  age_years?: number;
  weight_kg?: number;
  health_status?: 'healthy' | 'sick' | 'recovering';
  health_certificate_available?: boolean;
  health_certificate_expiry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

#### AnimalHireAgreement
Agreement for hiring animals.

```typescript
interface AnimalHireAgreement {
  agreement_id: number;
  tenant_id: number;
  farm_id: number;
  animal_id: number; // Your animal being hired out
  external_farm_id: number;
  agreement_type: 'hire_out' | 'hire_in';
  start_date: string;
  end_date: string;
  total_amount: number;
  paid_amount?: number;
  payment_method?: string;
  payment_status: 'pending' | 'partial' | 'paid';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_by_user_id: number;
  created_at: string;
}
```

### Audit & Logging Models

#### AuditLog
System audit trail entry.

```typescript
interface AuditLog {
  audit_id: number;
  user_id: number;
  tenant_id?: number;
  farm_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  policy_evaluation?: any;
  details: any;
  ip_address?: string;
  delegation_id?: number;
  delegated_from_user_id?: number;
  logged_at: string;
}
```

---

## Technical Implementation

### Hybrid CSR/SSR Rendering Strategy

The frontend implements a **hybrid Client-Side Rendering (CSR) and Server-Side Rendering (SSR)** approach for optimal security, performance, and user experience.

#### Server-Side Rendering (SSR) - Initial Load

**Purpose**: Security, performance, SEO

```typescript
// app/dashboard/animals/page.tsx (Server Component)
import { requirePermission } from '@/lib/auth-server';

export default async function AnimalsPage() {
  // Server-side permission validation (Layer 4/5)
  const session = await requirePermission('view_animals');
  
  // Server-side data fetching (Layer 4 → 5 → 6 → 7)
  const animals = await fetchAnimals(session);
  
  // Pass to client component
  return <AnimalsClient initialAnimals={animals} permissions={session.permissions} />;
}
```

**Benefits**:
- ✅ No flash of unauthorized content (FOUC)
- ✅ Secure: Unauthorized data never sent to client
- ✅ Faster: Single request for data + permissions
- ✅ SEO-friendly: Server-rendered content

#### Client-Side Rendering (CSR) - Interactivity

**Purpose**: Real-time updates, dynamic interactions

```typescript
// app/dashboard/animals/AnimalsClient.tsx (Client Component)
'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function AnimalsClient({ initialAnimals, permissions }) {
  const { hasPermission } = usePermissions(permissions);
  const { subscribe } = useWebSocket();
  
  // Real-time permission updates
  useEffect(() => {
    subscribe('permissions.updated', (data) => {
      // Update permissions dynamically
      setPermissions(data.permissions);
    });
  }, []);
  
  // Permission-based UI rendering
  return (
    <>
      {hasPermission('create_animal') && <CreateButton />}
      <AnimalsTable animals={initialAnimals} />
    </>
  );
}
```

**Benefits**:
- ✅ Real-time permission updates
- ✅ Interactive UI without full page reload
- ✅ Optimistic updates
- ✅ Better UX for dynamic content

#### Layer Integration

```
Layer 1 (Frontend SSR) → Layer 4 (API) → Layer 5 (Services) → Layer 6 (Data Access) → Layer 7 (Database)
Layer 1 (Frontend CSR) → WebSocket → Layer 5 (Services) → Real-time updates
```

See [FRONTEND_HYBRID_RENDERING.md](./FRONTEND_HYBRID_RENDERING.md) for complete documentation.

---

### Authentication & Authorization

#### Authentication Flow
1. User logs in with email/password
2. System validates credentials (Layer 5: Business Logic)
3. JWT token generated with user context (Layer 4: API)
4. Token stored in HTTP-only cookie (secure)
5. Token included in API requests (Layer 3: Middleware validates)

#### Authorization Flow
1. User requests access to resource
2. **Server-side**: Permission validated (Layer 4/5)
3. Fast permission check (role-based) - Layer 5
4. Optional ABAC policy evaluation - Layer 5
5. Check active delegations - Layer 5
6. Grant or deny access
7. **Client-side**: UI updates based on permissions (Layer 1)

### Permission Checking

#### Server-Side Permission Checks (SSR)

```typescript
// lib/auth-server.ts
export async function requirePermission(permission: string) {
  const session = await getServerSession();
  if (!session.permissions.includes(permission)) {
    redirect('/dashboard?error=unauthorized');
  }
  return session;
}
```

#### Client-Side Permission Checks (CSR)

```typescript
// hooks/usePermissions.ts
export function usePermissions(initialPermissions: string[]) {
  const { permissions, hasPermission } = usePermissions(initialPermissions);
  
  // Real-time updates via WebSocket
  useEffect(() => {
    subscribe('permissions.updated', (data) => {
      setPermissions(data.permissions);
    });
  }, []);
  
  return { permissions, hasPermission };
}

// Usage
const { hasPermission } = usePermissions(permissions);
if (hasPermission('create_animals')) {
  // Render create button
}
```

#### Permission Utility Functions

```typescript
// Check single permission
hasPermission(user, 'create_animals')

// Check any of multiple permissions
hasAnyPermission(user, ['view_animals', 'edit_animals'])

// Role-based feature checks
roleFeatures.canCreateAnimals(user)
roleFeatures.canEditHealth(user)
```

### Multi-Tenant Data Isolation

All database queries must include tenant filtering:

```typescript
// Correct: Filtered by tenant
const animals = await db.query(
  'SELECT * FROM animals WHERE tenant_id = $1',
  [user.tenant_id]
);

// Correct: Filtered by accessible farms
const farms = await db.query(
  'SELECT * FROM farms WHERE tenant_id = $1 AND farm_id IN ($2)',
  [user.tenant_id, accessibleFarmIds]
);
```

### Component Structure

#### Page Components (Hybrid Approach)

**Server Components** (SSR):
- Located in `app/dashboard/*/page.tsx` (default export)
- No `'use client'` directive (server components by default)
- Perform server-side permission validation
- Fetch initial data server-side
- Pass data to client components

**Client Components** (CSR):
- Located in `app/dashboard/*/Client.tsx` or `app/dashboard/*/components/*.tsx`
- Use `'use client'` directive
- Handle interactivity and real-time updates
- Render permission-based UI elements
- Wrap content in `DashboardContainer` component

**Pattern**:
```typescript
// Server Component (page.tsx)
export default async function Page() {
  const session = await requirePermission('view_resource');
  const data = await fetchData(session);
  return <ClientComponent initialData={data} permissions={session.permissions} />;
}

// Client Component (Client.tsx)
'use client';
export default function ClientComponent({ initialData, permissions }) {
  // Interactive features
  return <Content data={initialData} />;
}
```

#### Reusable Components
- `DashboardContainer`: Main layout wrapper
- `Sidebar`: Navigation sidebar with role-based filtering
- `RoleBasedComponent`: Conditional rendering based on permissions

### State Management

The application uses React hooks for state management:

- **useState**: Component-level state
- **useMemo**: Computed values and filtered data
- **useEffect**: Side effects and data fetching
- **useRouter**: Navigation (Next.js)
- **usePathname**: Current route detection

### Form Handling

#### Multi-Step Forms (Wizards)
Complex forms are broken into steps for better UX:
- Breeding record form (4 steps)
- Production record form (4 steps)
- Weaning record form (4 steps)
- Inventory item form (4 steps)

Each step validates before proceeding to next step.

#### Form Validation
- Client-side validation using TypeScript types
- Required field checks
- Date range validation
- Numeric value validation

### Data Fetching

#### Server-Side Data Fetching (SSR)

```typescript
// Server Component
export default async function Page() {
  const session = await getServerSession();
  const data = await fetch(`${process.env.API_URL}/api/v1/data`, {
    headers: { 'Authorization': `Bearer ${session.token}` },
    cache: 'no-store' // Always fetch fresh data
  }).then(r => r.json());
  
  return <ClientComponent initialData={data} />;
}
```

#### Client-Side Data Fetching (CSR)

```typescript
// Client Component
'use client';
export default function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  
  // Dynamic filtering
  const handleFilter = async (filters) => {
    const filtered = await fetch('/api/v1/data', {
      method: 'POST',
      body: JSON.stringify({ filters })
    }).then(r => r.json());
    setData(filtered);
  };
  
  return <Content data={data} onFilter={handleFilter} />;
}
```

#### Mock Data (Development)

Currently using mock data (`lib/mockData.ts`):
- All data structures ready for backend integration
- Mock data simulates real API responses
- Easy to replace with actual API calls
- Will be replaced with server-side fetching in production

### Error Handling

- Try-catch blocks for async operations
- User-friendly error messages
- Console logging for debugging
- Error boundaries for React components

### Performance Optimizations

- **Memoization**: useMemo for expensive calculations
- **Lazy Loading**: Dynamic imports for large components
- **Pagination**: Large datasets paginated
- **Filtering**: Client-side filtering for fast UI updates

---

## Workflows

### Animal Lifecycle Workflow

1. **Animal Registration**
   - Owner/Manager creates animal record
   - Assign tag number and basic information
   - Set initial health status

2. **Daily Operations**
   - Workers log feeding activities
   - Record production (milk, eggs, etc.)
   - Track health checks

3. **Breeding**
   - Record breeding event
   - Track pregnancy status
   - Record birth outcomes
   - Link offspring to parents

4. **Health Management**
   - Veterinarian records health checks
   - Log vaccinations and treatments
   - Track medications

5. **Sale/Disposal**
   - Record sale transaction
   - Update animal status
   - Track financial transaction

### Breeding Workflow

1. **Record Breeding**
   - Select female animal
   - Choose sire (internal or external)
   - If external, link to hire agreement
   - Record breeding date and method

2. **Pregnancy Tracking**
   - Update pregnancy status
   - Record conception date
   - Set expected due date
   - Monitor pregnancy progress

3. **Birth Recording**
   - Record actual birth date
   - Record birth outcome
   - Link offspring to breeding record
   - Update animal inventory

4. **Analytics**
   - Track success rates
   - Analyze breeding performance
   - Calculate costs and revenue

### Financial Workflow

1. **Revenue Tracking**
   - Record animal sales
   - Record product sales
   - Track hire agreement revenue
   - Monitor payment status

2. **Expense Tracking**
   - Record operational expenses
   - Track hire agreement expenses
   - Categorize expenses
   - Link expenses to activities

3. **Financial Analysis**
   - Calculate profit/loss
   - Analyze expense trends
   - Generate financial reports

### Inventory Management Workflow

1. **Add Inventory Item**
   - Enter item information
   - Set stock levels and reorder points
   - Add supplier information
   - Set expiry dates (if applicable)

2. **Stock Monitoring**
   - Monitor current stock levels
   - Receive low stock alerts
   - Track expiring items
   - Calculate inventory value

3. **Stock Movements**
   - Record stock additions (purchases)
   - Record stock usage
   - Track adjustments
   - Link movements to activities

### User Management Workflow

1. **Invite User**
   - Owner/Admin sends invitation
   - User receives email with invitation link
   - User accepts invitation
   - User assigned to tenant

2. **Assign Roles**
   - Owner/Admin selects role
   - Role permissions applied
   - User can access features based on permissions

3. **Delegation**
   - Owner delegates permissions temporarily
   - Set delegation period
   - Delegate receives access
   - Delegation expires automatically

### Audit Trail Workflow

1. **Action Performed**
   - User performs action (create, edit, delete)
   - System captures action details
   - Logs user, timestamp, IP address
   - Records policy evaluation (if applicable)

2. **Audit Log Viewing**
   - Admin/Owner views audit logs
   - Filter by action, entity, date
   - Review detailed log information
   - Track all system changes

---

## Conclusion

This documentation provides a comprehensive overview of the iFarm livestock management system. The system is designed to be:

- **Scalable**: Multi-tenant architecture supports growth
- **Secure**: ABAC with permission library ensures proper access control
- **User-Friendly**: Role-based UI adapts to user permissions
- **Comprehensive**: Covers all aspects of livestock management
- **Extensible**: Easy to add new features and modules

For specific implementation details, refer to the source code and inline documentation.

---

**Document Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: Complete





