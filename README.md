# iFarm Prototype - ABAC Permission Library System

A functional frontend prototype showcasing a comprehensive Attribute-Based Access Control (ABAC) system with a Permission Library architecture for multi-tenant livestock management.

**Version**: 1.0.0 | **Last Updated**: November 16, 2025

## Features Implemented

### 🎯 Core Features

1. **Permission Library** (`/permissions`)
   - Browse system-wide permissions organized by category
   - Search and filter permissions
   - View permission details, actions, and resource types

2. **Role Templates** (`/role-templates`)
   - Pre-built role templates (Veterinarian, Farm Manager, Field Worker, Accountant)
   - Clone templates to create custom roles
   - View template permissions

3. **Custom Roles** (`/roles`)
   - Create custom roles by selecting permissions from library
   - Clone from templates or create from scratch
   - View role permissions and ABAC policies
   - Edit and delete roles

4. **Users & Invitations** (`/users`)
   - User management interface
   - Send secure invitation emails
   - View pending invitations
   - Assign roles to users
   - Multiple roles per user support

5. **Delegations** (`/delegations`)
   - Create temporary access delegations
   - Support for permission, role, or full access delegation
   - Time-bound with optional restrictions
   - View active and expired delegations

6. **Time-Based ABAC Policies** (`/policies/create`)
   - Create advanced policies with time restrictions
   - Support for time of day, day of week, and date ranges
   - Visual policy builder interface

7. **Audit Logs** (`/audit-logs`)
   - Complete audit trail viewer
   - Filter by action, entity type, date range
   - View detailed log information

### 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Owner Indicators**: Shows owner status with full access badge
- **Interactive Components**: Expandable cards, modals, filters
- **Information Boxes**: Helpful tooltips and explanations throughout
- **Navigation**: Easy navigation between all features

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Utility-first CSS framework
- **React 19** - UI library

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ifarm-prototype/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── permissions/       # Permission library
│   ├── role-templates/    # Role templates gallery
│   ├── roles/             # Custom roles management
│   ├── users/             # Users & invitations
│   ├── delegations/       # Delegation system
│   ├── audit-logs/       # Audit log viewer
│   └── policies/          # ABAC policy builder
├── components/            # React components
│   └── Navigation.tsx    # Main navigation
├── lib/                   # Utilities
│   └── mockData.ts        # Mock data for prototype
├── types/                 # TypeScript type definitions
│   └── index.ts           # All type definitions
└── README.md              # This file
```

## Mock Data

The prototype uses mock data to simulate backend responses. All data is defined in `/lib/mockData.ts`:

- 18 System Permissions (Animals, Activities, Reports, Management)
- 4 Role Templates
- 2 Custom Roles
- 3 Users
- 2 Tenants
- 3 Farms
- Sample delegations, invitations, and audit logs

## Key Concepts Demonstrated

### Permission Library System
- **3-Tier Architecture**: Permission Library → Role Templates → Custom Roles
- **System-Wide Permissions**: Immutable permissions available to all tenants
- **Simple Selection**: Admins select permissions, no policy writing needed

### Multi-Tenant Multi-Farm
- Tenant and farm selection
- Farm-scoped data isolation
- User-farm assignments

### Hybrid Evaluation
- Fast permission check (Phase 1)
- Optional ABAC policy evaluation (Phase 2)
- Time-based restrictions

### Delegation System
- Temporary access with expiration
- Permission, role, or full access delegation
- Optional time and resource restrictions

### Owner Full Access
- Owners bypass all permission checks
- Visual indicators in UI
- Fast evaluation path

## Prototype Limitations

- **No Backend**: All data is mock/simulated
- **No Persistence**: Changes are not saved
- **No Authentication**: User context is simulated
- **No Real API Calls**: Forms show alerts instead of API calls

## Next Steps for Full Implementation

1. **Backend Services**
   - ABAC Service (evaluation engine)
   - User/Auth Service
   - Invitation Service
   - Audit Logging Service

2. **Database**
   - PostgreSQL schema (52 tables)
   - Migrations
   - Seed data

3. **Caching & Performance**
   - Redis caching layer
   - Permission caching strategies

4. **Event System**
   - Kafka integration
   - Event-driven cache invalidation

5. **Real-time Updates**
   - WebSocket/SSE for permission changes
   - Live delegation status

## License

This is a prototype/demo project.
