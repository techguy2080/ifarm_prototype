# iFarm Database Schema - Complete Reference

**Database**: PostgreSQL 15+  
**Total Tables**: 72 🆕 (was 61)  
**Version**: 1.2.0  
**Last Updated**: November 2024

**🔒 TENANT ISOLATION: COMPLETE**  
All tenant-scoped tables include `tenant_id` for 100% data isolation.

**🆕 NEW FEATURES:**
- Tips & Advice System (dashboard tips, advice boxes)
- Community Chat (public, private, group, direct messages)
- Human Resources (employees, payroll, leave calendar)
- Business Contacts (track business relationships and transactions)

---

## 🏗️ Layer Architecture Context

This database schema documentation defines **Layer 7: Database Layer** - the foundation of data persistence in the iFarm system.

### Layer 7: Database Layer Responsibilities

- **Data Persistence**: All application data stored in PostgreSQL
- **Data Integrity**: Constraints, foreign keys, check constraints enforce business rules
- **Performance**: Indexes optimize query execution for Layer 6 (Data Access)
- **ACID Guarantees**: Transaction support ensures data consistency
- **Multi-Tenant Isolation**: `tenant_id` in all tenant-scoped tables with foreign key constraints
- **Database Redundancy** 🆕: Dual-database architecture (Primary PostgreSQL + Supabase Backup)

### Database Architecture

**Dual-Database Setup**:
- **Primary Database**: PostgreSQL (self-hosted/managed) - Primary read/write operations
- **Backup Database**: Supabase PostgreSQL (cloud-hosted) - Automatic failover target, disaster recovery

**Failover Strategy**:
- Automatic failover if primary database is down
- Real-time replication to Supabase backup
- Zero downtime during failover
- Health monitoring for both databases

**See [DATABASE_FAILOVER.md](./DATABASE_FAILOVER.md) for complete database failover and redundancy documentation.**

### Layer Interaction Flow

```
Layer 4 (API) 
  → calls Layer 5 (Business Logic)
    → uses Layer 6 (Data Access - Managers)
      → queries Layer 7 (Database - PostgreSQL)
```

### Key Layer Features

- **Automatic Tenant Filtering**: `TenantManager` (Layer 6) automatically adds `tenant_id` filter
- **Farm-Level Access**: `FarmManager` (Layer 6) automatically filters by accessible farms
- **Query Optimization**: Composite indexes on `(tenant_id, farm_id)` for fast queries
- **Data Integrity**: Foreign keys, check constraints, unique constraints enforce rules at database level
- **Performance**: Materialized views for complex aggregations

---

## 📖 Documentation Structure

This comprehensive database schema documentation is divided into 6 parts for easy navigation:

### 📘 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
**Core Infrastructure & Permissions**

**Tables Covered (11):**
1. `tenants` - Organization entities
2. `users` - **User authentication & security (credentials only)**
3. `profiles` - **User personal information & preferences (User-Profile Separation Pattern)**
4. `user_sessions` - Active sessions
5. `user_tenants` - User-tenant associations
6. `identity_providers` - External SSO configuration
7. `permissions` - System permissions (immutable)
8. `role_templates` - Pre-defined roles
9. `roles` - Custom tenant roles
10. `policies` - ABAC policies
11. `user_roles` - User role assignments

**Key Features:**
- Multi-tenant architecture
- **Industry-standard User-Profile Separation Pattern**
- **Hybrid Auth0 + Django Authentication** 🆕: Auth0 handles auth, Django handles authorization
- **Legal Compliance Data Storage** 🆕: NIN, addresses, personal info stored in Django Profile
- Hybrid RBAC/ABAC system
- External IdP integration (OAuth2, SAML via Auth0)
- MFA support (via Auth0)

---

### 📗 [DATABASE_SCHEMA_PART2.md](./DATABASE_SCHEMA_PART2.md)
**Farm, Animal & Veterinary Tables**

**Tables Covered (12):**
12. `farms` - Farm locations and details
13. `user_farms` - User-farm access
14. `animals` - Animal records with lifecycle
15. `animal_history` - Historical snapshots
16. `production` - **Enhanced production tracking**
17. `daily_production_summary` - Aggregated production
18. `health_checks` - Routine examinations
19. `vaccinations` - Vaccination records
20. `treatments` - Medical treatments
21. `weight_records` - Weight tracking
22. `deworming` - Deworming treatments

**Key Features:**
- **Per-animal, per-day, unit-level production tracking**
- **Multiple milking sessions per day**
- **Quality metrics** (fat %, protein %, SCC, pH, temperature)
- Complete veterinary history
- Lineage tracking (dam, sire)
- Castration tracking

---

### 📙 [DATABASE_SCHEMA_PART3.md](./DATABASE_SCHEMA_PART3.md)
**Breeding & Financial Tables**

**Tables Covered (13):**
23. `breeding_records` - Breeding and pregnancy
24. `breeding_offspring` - Offspring links
25. `external_farms` - External farm partners
26. `external_animals` - External animals
27. `animal_hire_agreements` - Hire out (revenue)
28. `external_animal_hire_agreements` - Hire in (expense)
29. `expenses` - **Expenses with approval workflow**
30. `expense_history` - Expense change tracking
31. `animal_sales` - Animal sale records
32. `product_sales` - Product sales (milk, eggs)
33. `sales_invoices` - Customer invoices
34. `invoice_line_items` - Invoice line items
35. `purchase_invoices` - Vendor invoices

**Key Features:**
- **Expense approval workflow** (pending → approved/rejected)
- Complete invoicing system
- Internal vs external breeding tracking
- Hire agreement financial integration
- Multi-level financial tracking

---

### 📕 [DATABASE_SCHEMA_PART4.md](./DATABASE_SCHEMA_PART4.md)
**Inventory, Activities & Supporting Tables**

**Tables Covered (8):**
36. `inventory_items` - Supplies, equipment, feed
37. `inventory_movements` - Stock in/out tracking
38. `activities` - Farm tasks and activities
39. `weaning_records` - Animal weaning
40. `disposal_records` - Animal disposal details
41. `media_files` - **Supabase storage metadata**
42. `invitations` - User invitations
43. `delegations` - Temporary permission delegations

**Key Features:**
- Multi-category inventory system
- Stock level alerts (reorder points)
- Expiry tracking
- Task management
- **Supabase bucket organization**
- Delegation with time restrictions

---

### 📔 [DATABASE_SCHEMA_PART5.md](./DATABASE_SCHEMA_PART5.md)
**Audit, Analytics, Notifications, Devices & Subscriptions**

**Tables Covered (18):**
44. `audit_logs` - **Comprehensive audit trail**
45. `audit_log_archive` - Long-term retention
46. `analytics_cache` - Cached analytics
47. `reports` - Generated reports
48. `notifications` - Multi-channel notifications
49. `notification_preferences` - User preferences
50. `devices` - **Device fingerprinting**
51. `device_sessions` - Session tracking
52. `ip_addresses` - **IP reputation system**
53. `abuse_logs` - Security violations
54. `rate_limit_rules` - Rate limiting config
55. `security_alerts` - Real-time alerts
56. `subscription_plans` - Available plans
57. `subscriptions` - Tenant subscriptions
58. `subscription_invoices` - Billing invoices
59. `payments` - **Payment transactions with idempotency**
60. `payment_methods` - Stored payment methods
61. `usage_logs` - Usage tracking

**Key Features:**
- **Maximum traceability** with SHA-256 checksums
- 7-year audit log retention
- **Device fingerprinting** and tracking
- **IP reputation scoring**
- **Rate limiting** (per user, per IP, per tenant)
- **Idempotent payment processing**
- Multi-channel notifications
- Cached analytics for performance

---

### 📔 [DATABASE_SCHEMA_PART6.md](./DATABASE_SCHEMA_PART6.md)
**User Experience, HR, Chat & Business Contacts**

**Tables Covered (14):**
62. `tips` - Dashboard tips
63. `advice` - Advice box messages
64. `chat_rooms` - Chat rooms
65. `chat_room_participants` - Room participants
66. `chat_messages` - Chat messages
67. `employees` - Employee records 🆕
68. `payroll` - Payroll records 🆕
69. `payroll_reminders` - Payment reminders 🆕
70. `leave_requests` - Leave requests 🆕
71. `business_contacts` - Business contacts 🆕
72. `business_transactions` - Business transactions 🆕

**Key Features:**
- **Dashboard tips** and **advice boxes** for communication
- **Community chat** (public, private, group, direct messages)
- **HR Management**: Employee records, payroll processing, leave calendar
- **Payroll reminders** with message and read status tracking
- **Business contacts** and transaction tracking
- Multi-tenant isolation for all tables

---

## 🗂️ Table Category Breakdown

### Core Infrastructure (2 tables)
- `tenants`, `users`

### Authentication & Users (5 tables)
- `profiles`, `user_sessions`, `user_tenants`, `identity_providers`, `user_farms`

### Permissions & Access Control (9 tables)
- `permissions`, `role_templates`, `roles`, `policies`, `user_roles`
- Junction tables: `role_template_permissions`, `role_permissions`, `policy_roles`, `delegation_permissions`

### Farms & Animals (3 tables)
- `farms`, `animals`, `animal_history`

### Production & Veterinary (7 tables)
- `production`, `daily_production_summary`, `health_checks`, `vaccinations`, `treatments`, `weight_records`, `deworming`

### Breeding & External Farms (5 tables)
- `breeding_records`, `breeding_offspring`, `external_farms`, `external_animals`, `animal_hire_agreements`, `external_animal_hire_agreements`

### Financial (7 tables)
- `expenses`, `expense_history`, `animal_sales`, `product_sales`, `sales_invoices`, `invoice_line_items`, `purchase_invoices`

### Inventory (2 tables)
- `inventory_items`, `inventory_movements`

### Activities & Lifecycle (3 tables)
- `activities`, `weaning_records`, `disposal_records`

### Media (1 table)
- `media_files`

### Invitations & Delegations (2 tables)
- `invitations`, `delegations`

### Audit & Analytics (4 tables)
- `audit_logs`, `audit_log_archive`, `analytics_cache`, `reports`

### Notifications (2 tables)
- `notifications`, `notification_preferences`

### Devices & Security (6 tables)
- `devices`, `device_sessions`, `ip_addresses`, `abuse_logs`, `rate_limit_rules`, `security_alerts`

### Subscriptions & Billing (6 tables)
- `subscription_plans`, `subscriptions`, `subscription_invoices`, `payments`, `payment_methods`, `usage_logs`

### User Experience & Content 🆕 (5 tables)
- `feedback`, `legal_documents`, `tooltips`, `help_articles`, `tips`, `advice`

### Chat 🆕 (3 tables)
- `chat_rooms`, `chat_room_participants`, `chat_messages`

### Human Resources 🆕 (4 tables)
- `employees`, `payroll`, `payroll_reminders`, `leave_requests`

### Business Contacts 🆕 (2 tables)
- `business_contacts`, `business_transactions`

---

## 🔑 Key Design Patterns

### 1. Solo Farm Owner Support 🎯 NEW

**First-Class Support for Single-User Operations**

The database is explicitly designed to support solo farm owners managing everything alone without workers.

**Minimum System Configuration:**
```sql
-- Fully functional with ZERO workers
1 Tenant (Organization)
+ 1 User (Owner)
+ 1 or more Farms
+ 0 Workers ✅ (OPTIONAL)
= Complete System
```

**Key Database Principles:**
- ❌ NO tables require multiple users
- ❌ NO foreign key constraints enforce worker presence
- ❌ NO CHECK constraints mandate worker accounts
- ✅ ALL `recorded_by_user_id` fields accept owner as value
- ✅ ALL `submitted_by_user_id` fields accept owner as value
- ✅ ALL `approved_by_user_id` fields accept owner as value
- ✅ Owner can be performer, recorder, and approver simultaneously

**Example: Solo Owner Operations**
```sql
-- Owner creates farm (no workers needed)
INSERT INTO farms (tenant_id, farm_name, created_at, updated_at)
VALUES (1, 'Solo Farm', NOW(), NOW());

-- Owner records production themselves
INSERT INTO production (tenant_id, farm_id, animal_id, 
                       production_type, quantity, unit,
                       recorded_by_user_id, created_at, updated_at)
VALUES (1, 1, 15, 'milk', 25.5, 'liters', 
        1, NOW(), NOW());  -- Owner ID = 1 ✅

-- Owner submits expense (auto-approved for owners)
INSERT INTO expenses (tenant_id, farm_id, expense_type, amount,
                     submitted_by_user_id, approved_by_user_id,
                     approval_date, status, created_at, updated_at)
VALUES (1, 1, 'feed', 100000,
        1, 1, NOW(), 'approved',  -- Owner approves their own ✅
        NOW(), NOW());

-- Verify zero workers
SELECT COUNT(*) FROM user_tenants 
WHERE tenant_id = 1 AND user_id != 1;
-- Result: 0 ✅ (Only owner exists)
```

**Scaling Journey:**
```
Day 1:        1 Owner → Everything works ✅
Month 6:      1 Owner → Still fully functional ✅
Year 1:       1 Owner + 2 Workers → Added when ready
Year 2+:      1 Owner + 50 Workers → Scales seamlessly
```

**Benefits:**
- ✅ Lower barrier to entry for small farmers
- ✅ No forced labor costs
- ✅ Complete privacy (no external users)
- ✅ Simple workflow (no approval delays)
- ✅ Add workers only when needed

---

### 2. Hybrid Auth0 + Django Authentication 🔐 NEW

**Industry-Standard Approach: Best of Both Worlds**

The iFarm system uses a **hybrid authentication architecture** combining Auth0 (authentication) and Django (authorization):

**Auth0 Handles** (Identity Provider):
- User authentication (email/password)
- Email verification
- 2FA/MFA
- Password reset
- Social login (Google, Microsoft, etc.)
- Suspicious login detection
- Device tracking
- Universal Login (hosted login page)

**Django Handles** (Authorization Provider):
- Role creation and management
- Permission assignment (RBAC/ABAC)
- Farm-level access control
- Permission delegation
- **Legal compliance data storage** (NIN, addresses, personal info)

**Data Separation:**
- **Auth0 stores**: Email, password (hashed), 2FA settings, login history
- **Django stores**: `auth0_user_id` (link), roles, permissions, **legal compliance data in Profile**

**Database Schema:**
```sql
-- users table (Authorization only)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    auth0_user_id VARCHAR(255) UNIQUE NOT NULL,  -- Link to Auth0
    email VARCHAR(255) UNIQUE NOT NULL,          -- Synced from Auth0
    auth0_metadata JSONB DEFAULT '{}',          -- Auth0 metadata
    -- No password field! Auth0 handles authentication
    primary_tenant_id INTEGER REFERENCES tenants(tenant_id),
    account_status VARCHAR(20) DEFAULT 'pending_invitation',
    email_verified BOOLEAN DEFAULT FALSE,        -- Synced from Auth0
    mfa_enabled BOOLEAN DEFAULT FALSE,          -- Synced from Auth0
    last_login_at TIMESTAMP,                    -- Synced from Auth0
    last_login_ip INET,                         -- Synced from Auth0
    -- ... other authorization fields
);

-- profiles table (Legal compliance data)
CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id),
    first_name VARCHAR(150) NOT NULL,           -- REQUIRED
    last_name VARCHAR(150) NOT NULL,            -- REQUIRED
    national_id_number VARCHAR(50) UNIQUE,     -- NIN (Legal compliance)
    passport_number VARCHAR(50),
    tax_identification_number VARCHAR(50),     -- TIN
    phone VARCHAR(20) NOT NULL,                 -- REQUIRED
    address TEXT NOT NULL,                      -- REQUIRED
    city VARCHAR(100),
    district VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Uganda',
    date_of_birth DATE,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    national_id_document_id INTEGER REFERENCES media_files(file_id),
    data_consent_given BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    -- ... other legal compliance fields
);
```

**Layer Integration:**
- **Layer 1 (Frontend)**: Auth0 Universal Login
- **Layer 3 (Middleware)**: Auth0TokenMiddleware validates Auth0 JWT
- **Layer 4 (API)**: Auth0 callback endpoint, Django JWT generation
- **Layer 5 (Business Logic)**: Auth0Service, ProfileService (legal compliance)
- **Layer 6 (Data Access)**: User/Profile queries with legal compliance data
- **Layer 7 (Database)**: users table (auth0_user_id), profiles table (legal compliance)

**Benefits:**
- ✅ **Security**: Auth0's battle-tested security infrastructure
- ✅ **User Experience**: Auth0 Universal Login provides excellent UX
- ✅ **Legal Compliance**: All legal data (NIN, addresses) stored in Django Profile
- ✅ **Owner Control**: Owners input profile information when creating users
- ✅ **Separation of Concerns**: Auth handles auth, Django handles authorization
- ✅ **Less Code**: No need to implement 2FA, password reset, etc.
- ✅ **Scalability**: Auth0 scales auth, Django scales authorization

**See [AUTH0_DJANGO_HYBRID_AUTH.md](./AUTH0_DJANGO_HYBRID_AUTH.md) for complete documentation.**

---

### 3. User-Profile Separation Pattern ✨ NEW

**Industry-Standard Practice for Scalability & Security**

**`users` table** = Authentication & Security (Can this user log in?)
- Email, password, MFA settings
- Email verification tokens
- Password reset tokens
- Login tracking, failed attempts, account locks
- System flags (is_active, is_super_admin)

**`profiles` table** = Personal Information & Preferences (Who is this user?)
- **first_name, last_name, phone** (moved from users)
- Bio, date of birth, gender
- Address, city, district, country
- Profile picture
- Notification preferences, language

**Benefits:**
- **Performance**: Fast authentication queries (small users table)
- **Security**: Authentication data isolated, easier to audit
- **Scalability**: Profile table can grow independently
- **GDPR Compliance**: Easy to delete personal data while keeping auth records for audit
- **Flexibility**: Add profile fields without touching authentication

**Example:**
```sql
-- Fast authentication (only touches users table)
SELECT user_id, email, password, mfa_enabled 
FROM users WHERE email = 'user@example.com';

-- Profile loads separately (only when needed)
SELECT * FROM profiles WHERE user_id = 123;
```

---

### 4. Owner/Admin Permission Delegation 🔑 NEW

**Full Control Over Access Management**

Owners and administrators can delegate permissions to users flexibly and securely.

**Key Database Tables:**
- `delegations` - Permission delegation records
- `delegation_permissions` - Junction table for permission grants

**Delegation Capabilities:**
```sql
-- Three delegation types supported:
1. Permission Delegation
   - Grant specific permissions (e.g., 'delete_animals')
   - No role changes needed

2. Role Delegation  
   - Grant all permissions from a role
   - Temporary role elevation

3. Full Access Delegation
   - Grant owner-level access
   - For audits, emergencies, consultants

-- Time-bound access
start_date TIMESTAMP NOT NULL
end_date TIMESTAMP NOT NULL
-- Auto-expires when end_date passes

-- Resource restrictions
farm_id INTEGER  -- Limit to specific farm
restrictions JSONB  -- Animal IDs, time windows, actions

-- Revocable anytime
status VARCHAR(20)  -- 'active', 'revoked', 'expired'
revoked_at TIMESTAMP
revoked_by_user_id INTEGER

-- Full audit trail
delegator_user_id INTEGER  -- Who granted
delegate_user_id INTEGER  -- Who received
reason TEXT  -- Why delegated
```

**Use Cases:**
- ✅ Temporary manager elevation (vacations, leave)
- ✅ Consultant access (time-bound, scope-limited)
- ✅ Emergency access (instant grant, auto-revoke)
- ✅ Project-specific permissions (cleanup, audits)
- ✅ Resource-restricted access (specific farms/animals)

**Benefits:**
- No permanent role changes needed
- Automatic expiration and revocation
- Complete audit trail for compliance
- Resource and time restrictions
- Emergency access management

---

### 5. Farm-Level Access Control 🏢 NEW

**Strict Farm Assignment and Data Isolation**

Users can only see and interact with farms explicitly assigned to them by the owner/tenant.

**Key Database Table:**
- `user_farms` - User-to-farm assignments with access levels

**Assignment Control:**
```sql
CREATE TABLE user_farms (
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    farm_id INTEGER NOT NULL REFERENCES farms(farm_id),
    access_level VARCHAR(20) DEFAULT 'write',  -- read, write, admin
    farm_role VARCHAR(50),  -- manager, worker, vet, viewer
    assigned_by_user_id INTEGER REFERENCES users(user_id),
    assigned_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, farm_id)
);

-- User sees only assigned farms
SELECT f.* FROM farms f
INNER JOIN user_farms uf ON f.farm_id = uf.farm_id
WHERE uf.user_id = ? AND uf.is_active = TRUE;

-- All farm-scoped data filtered by accessible farms
SELECT * FROM animals 
WHERE farm_id IN (
    SELECT farm_id FROM user_farms 
    WHERE user_id = ? AND is_active = TRUE
);
```

**Access Levels:**
- `read` - View only (no modifications)
- `write` - Read and write (add/edit data)
- `admin` - Full control (farm administrator)

**Security Layers:**
1. **Middleware** - Injects `accessible_farm_ids` into every request
2. **Custom Managers** - `FarmManager.for_user(user_id)` auto-filters
3. **API Permissions** - Verify farm access before operations
4. **Database Indexes** - Optimized `(tenant_id, farm_id)` indexes
5. **Audit Logging** - Track all farm access attempts

**Benefits:**
- ✅ Granular control - assign users to specific farms only
- ✅ Data isolation - users can't see non-assigned farm data
- ✅ Scalability - supports 1 to 1000+ farms per tenant
- ✅ Flexibility - different access levels per farm
- ✅ Performance - cached and indexed for speed

---

### 4. Multi-Tenancy (Complete Isolation)
**Every tenant-scoped table includes:**
- `tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id)`
- Indexed on `tenant_id` for fast filtering
- Farm-scoped tables also include `farm_id`

**Complete Tenant Isolation - 54/61 Tables:**
- **49 tables** with direct `tenant_id` column
- **5 tables** inherit via parent FK (child/junction tables)
- **7 tables** are system-wide (permissions, plans, IP reputation, etc.)

**Recently Added for Complete Isolation:**
- `users.primary_tenant_id` - Primary tenant for each user
- `notifications.tenant_id` - Tenant-scoped notifications
- `devices.tenant_id` - Tenant-scoped device tracking
- `device_sessions.tenant_id` - Tenant-scoped sessions
- `abuse_logs.tenant_id` - Tenant-scoped security logs

**Example:**
```sql
CREATE INDEX idx_animals_tenant_farm ON animals(tenant_id, farm_id);
CREATE INDEX idx_notifications_tenant_status ON notifications(tenant_id, status);
CREATE INDEX idx_devices_tenant ON devices(tenant_id);
```

### 3. Audit Trail (Common Fields)
**All tables include:**
- `created_at TIMESTAMP NOT NULL` - Record creation
- `updated_at TIMESTAMP NOT NULL` - Last modification

**Many tables also include:**
- `recorded_by_user_id` - User who created record
- `changed_by_user_id` - User who modified record

### 4. Soft Delete Pattern
**Implemented via status fields:**
- `is_active BOOLEAN DEFAULT TRUE`
- `status VARCHAR(20)` with values like 'active', 'deleted', 'suspended'

**Example:**
```sql
-- Animals use status
status VARCHAR(20) DEFAULT 'active'
-- active, sold, dead, stolen, slaughtered, gifted, transferred

-- Users use account_status
account_status VARCHAR(20) DEFAULT 'pending_invitation'
-- active, pending_invitation, suspended, deleted
```

### 5. Foreign Key Constraints
**All foreign keys use:**
- `ON DELETE CASCADE` - For child records that should be deleted
- `ON DELETE SET NULL` - For optional references
- `ON DELETE PROTECT` - For critical references (e.g., animal_sales → animals)

### 6. Indexing Strategy
**Primary indexes:**
- All primary keys (`SERIAL PRIMARY KEY`)
- Tenant/farm filtering (`tenant_id`, `farm_id`)
- Date ranges (`production_date`, `expense_date`, `sale_date`)
- Status filtering (`status`, `approval_status`)
- Foreign keys (automatically indexed)

**Composite indexes for common queries:**
```sql
CREATE INDEX idx_production_tenant_farm_date ON production(tenant_id, farm_id, production_date);
CREATE INDEX idx_expenses_tenant_farm_date ON expenses(tenant_id, farm_id, expense_date);
```

### 7. JSONB Usage
**Flexible structured data:**
- `settings JSONB DEFAULT '{}'` - Tenant/user settings
- `details JSONB DEFAULT '{}'` - Audit log details
- `metadata JSONB DEFAULT '{}'` - Additional metadata
- `features JSONB DEFAULT '[]'` - Feature lists

**Benefits:**
- No schema changes for new attributes
- Can query within JSONB fields
- Maintains data structure

---

## 🎯 Critical Features

### ✅ Enhanced Production Tracking
**Tables**: `production`, `daily_production_summary`

**Per-animal, per-day tracking with:**
- Multiple sessions per day (morning, evening, midday)
- Session-level quality metrics (fat %, protein %, SCC, pH, temperature)
- Milking method and duration
- Health indicators (udder condition, milk appearance)
- Automatic daily aggregation

**Unique constraint:**
```sql
CREATE UNIQUE INDEX idx_production_unique_session 
  ON production(animal_id, production_date, milking_session, session_number);
```

### ✅ Expense Approval Workflow
**Table**: `expenses`

**Workflow states:**
- `pending` - Awaiting approval
- `approved` - Approved by owner/manager
- `rejected` - Rejected with reason

**Key fields:**
```sql
approval_status VARCHAR(20) DEFAULT 'pending',
approved_by_user_id INTEGER,
approved_at TIMESTAMP,
rejection_reason TEXT
```

### ✅ Comprehensive Audit Logging
**Tables**: `audit_logs`, `audit_log_archive`

**Every log includes:**
- Who (user, acting_as_user for delegations)
- What (action, entity_type, entity_id)
- When (created_at)
- Where (tenant, farm)
- How (permission_used, delegation_id, policy_evaluated)
- Context (IP, device, user_agent, request details)
- Integrity (SHA-256 checksum)

**Retention:**
- Active logs in `audit_logs`
- Archived after 1 year to `audit_log_archive`
- 7-year retention for compliance

### ✅ Device Fingerprinting & Security
**Tables**: `devices`, `ip_addresses`, `abuse_logs`

**Device tracking:**
- Unique fingerprint per device
- OS, browser, user agent
- Trust status and blocking
- Failed login attempts

**IP reputation:**
- Geographic location (country, city, lat/long)
- ISP and organization
- VPN/Proxy/Tor detection
- Reputation score (0-100)
- Blacklist capability

**Abuse detection:**
- Multiple abuse types (brute force, rate limit, suspicious activity)
- Severity levels (low, medium, high, critical)
- Automated actions (log, warn, block, ban)

### ✅ Idempotent Payment Processing
**Table**: `payments`

**Prevents duplicate charges:**
```sql
idempotency_key VARCHAR(255) UNIQUE NOT NULL
```

**Workflow:**
1. Client generates unique idempotency key
2. Payment attempt checks for existing payment with same key
3. If exists and succeeded, return existing payment
4. If exists and pending, return existing payment
5. If exists and failed, retry allowed
6. If new, create new payment record

**Supported statuses:**
- `pending`, `processing`, `succeeded`, `failed`, `cancelled`, `refunded`

### ✅ Multi-Channel Notifications
**Table**: `notifications`

**Channels:**
- `email` - Email notifications
- `sms` - SMS/text messages
- `push` - Mobile push notifications
- `in_app` - In-app notifications

**Features:**
- Retry mechanism (retry_count)
- Delivery status tracking
- Read receipts
- User preferences

---

## 📊 Data Integrity

### Constraints Applied

**Check Constraints:**
- Enum-like values (e.g., `status IN ('active', 'suspended')`)
- Valid ranges (e.g., `reputation_score BETWEEN 0 AND 100`)
- Business logic (e.g., `end_date > start_date`)

**Unique Constraints:**
- `UNIQUE` on single columns (e.g., `email`, `fingerprint`)
- `UNIQUE INDEX` on composite keys (e.g., `tenant_id + tag_number`)

**NOT NULL Constraints:**
- All critical fields marked as `NOT NULL`
- Optional fields allow `NULL`

**Foreign Key Constraints:**
- All relationships enforced
- Cascading deletes where appropriate
- Null on delete for optional references

### Referential Integrity

**Cascade Rules:**
```sql
-- Child records deleted when parent deleted
ON DELETE CASCADE

-- Examples:
- animal_history → animals (CASCADE)
- production → animals (CASCADE)
- expenses → farms (CASCADE)
- notifications → users (CASCADE)
```

**Set Null Rules:**
```sql
-- Reference cleared when parent deleted
ON DELETE SET NULL

-- Examples:
- animals.dam_id → animals (SET NULL)
- animals.sire_id → animals (SET NULL)
- expenses.approved_by_user_id → users (SET NULL)
```

**Protect Rules:**
```sql
-- Prevents deletion if children exist
ON DELETE PROTECT

-- Examples:
- animal_sales → animals (PROTECT)
- subscriptions → subscription_plans (PROTECT)
```

---

## 🚀 Performance Optimization

### Indexing Best Practices

**1. Single-Column Indexes**
- Primary keys (automatic)
- Foreign keys (explicit)
- Frequently filtered columns (`status`, `is_active`)

**2. Composite Indexes**
- Multi-column queries
- Order matters (most selective first)

```sql
-- Good: tenant + farm + date (common query)
CREATE INDEX idx_production_tenant_farm_date 
  ON production(tenant_id, farm_id, production_date);

-- Good: date-based reporting
CREATE INDEX idx_expenses_farm_date 
  ON expenses(farm_id, expense_date);
```

**3. Partial Indexes**
- Index only relevant rows
- Saves space and improves performance

```sql
-- Only index active sessions
CREATE INDEX idx_device_sessions_active 
  ON device_sessions(device_id, is_active) 
  WHERE is_active = TRUE;
```

**4. JSONB Indexes**
- GIN indexes for JSONB columns
- Supports containment queries

```sql
CREATE INDEX idx_tenant_settings_gin 
  ON tenants USING GIN (settings);
```

### Query Optimization Tips

**1. Use select_related (Django ORM)**
```python
# Bad - N+1 queries
animals = Animal.objects.filter(farm_id=farm_id)
for animal in animals:
    print(animal.farm.name)  # Additional query each time

# Good - Single query with join
animals = Animal.objects.filter(farm_id=farm_id).select_related('farm')
```

**2. Use prefetch_related for many-to-many**
```python
# Efficient loading of related production records
animals = Animal.objects.prefetch_related('production_records')
```

**3. Database-level aggregation**
```sql
-- Good: Aggregate in database
SELECT farm_id, COUNT(*), AVG(current_weight)
FROM animals
WHERE status = 'active'
GROUP BY farm_id;

-- Bad: Load all records, aggregate in Python
```

**4. Pagination for large datasets**
```sql
-- Use LIMIT and OFFSET
SELECT * FROM audit_logs
WHERE tenant_id = 1
ORDER BY created_at DESC
LIMIT 50 OFFSET 0;
```

---

## 🔐 Security Considerations

### Data Protection

**1. Sensitive Data**
- Passwords: Hashed (never plain text)
- Payment methods: Only last 4 digits stored
- Personal data: Encrypted at rest

**2. Multi-Tenant Isolation (100% Complete)**
- All 54 tenant-scoped tables have `tenant_id`
- All queries automatically filtered by `tenant_id` via custom managers
- Row-level security policies enforced
- **Zero cross-tenant data access possible**
- Middleware auto-injects tenant context from JWT
- Device tracking, notifications, and security logs now tenant-scoped

**3. Audit Logging**
- All actions logged
- Checksum for integrity
- Cannot be deleted (only archived)

### Access Control

**1. Permission-Based**
- Every action checks permissions
- Hybrid RBAC/ABAC
- Policy evaluation logged

**2. Time-Based Restrictions**
- Delegations have start/end dates
- Session expiration
- Password reset token expiry

**3. Device-Based Security**
- Device fingerprinting
- IP reputation scoring
- Rate limiting per device/IP

---

## 📈 Scalability Estimates

### Hostinger KVM 2 (2 CPU, 4GB RAM)

**Expected Capacity:**
- **Tenants**: 50-100
- **Users**: 500-1,000
- **Farms**: 200-500
- **Animals**: 5,000-10,000
- **Daily Production Records**: 1,000-2,000
- **Daily API Requests**: 50,000-100,000

**With Optimization:**
- Read replicas for reporting
- Redis caching
- Database connection pooling
- Materialized views for analytics

**Can scale to 10x with proper tuning.**

---

## 🛠️ Database Setup

### Creating the Database

```bash
# Create database
createdb ifarm_production

# Create user
createuser -P ifarm_user

# Grant privileges
psql -d ifarm_production -c "GRANT ALL PRIVILEGES ON DATABASE ifarm_production TO ifarm_user;"
```

### Running Migrations

```bash
# Django migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Initial Data

```bash
# Load initial permissions
python manage.py loaddata initial_permissions.json

# Load role templates
python manage.py loaddata role_templates.json

# Load subscription plans
python manage.py loaddata subscription_plans.json
```

---

## 📚 Related Documentation

- **[BACKEND_PLAN.md](./BACKEND_PLAN.md)** - Complete backend architecture
- **[APP_DOCUMENTATION.md](./APP_DOCUMENTATION.md)** - Frontend application documentation
- **[BACKEND_PLAN_README.md](./BACKEND_PLAN_README.md)** - Backend plan navigation guide

---

**Database Schema Documentation Complete!** 🎉

All 61 tables documented with complete field definitions, constraints, indexes, and relationships.

