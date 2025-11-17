# iFarm Database Schema - Complete Reference

**Database**: PostgreSQL 15+  
**Total Tables**: 61  
**Version**: 1.1.0  
**Last Updated**: November 2024

**🔒 TENANT ISOLATION: COMPLETE**  
All 54 tenant-scoped tables now include `tenant_id` for 100% data isolation.

---

## 📖 Documentation Structure

This comprehensive database schema documentation is divided into 5 parts for easy navigation:

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
- Hybrid RBAC/ABAC system
- External IdP integration (OAuth2, SAML)
- MFA support

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

### 2. User-Profile Separation Pattern ✨ NEW

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

### 2. Multi-Tenancy (Complete Isolation)
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

