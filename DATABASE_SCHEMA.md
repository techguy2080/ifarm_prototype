# iFarm Database Schema Documentation

**Version**: 1.2.0  
**Database**: PostgreSQL 15+  
**Total Tables**: 72 🆕 (was 61)  
**Last Updated**: November 2024

**🆕 NEW FEATURES:**
- Tips & Advice System (dashboard tips, advice boxes)
- Community Chat (public, private, group, direct messages)
- Human Resources (employees, payroll, leave calendar)
- Business Contacts (track business relationships and transactions)

**Note**: This is the overview document. See [DATABASE_SCHEMA_README.md](./DATABASE_SCHEMA_README.md) for navigation to all parts.

---

## Layer Architecture Context

This database schema documentation defines **Layer 7: Database Layer** - the foundation of data persistence in the iFarm system.

### Layer 7: Database Layer Responsibilities

- **Data Persistence**: All application data stored in PostgreSQL
- **Data Integrity**: Constraints, foreign keys, check constraints enforce business rules
- **Performance**: Indexes optimize query execution for Layer 6 (Data Access)
- **ACID Guarantees**: Transaction support ensures data consistency
- **Multi-Tenant Isolation**: `tenant_id` in all tenant-scoped tables with foreign key constraints

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

## Table of Contents

1. [Core Infrastructure Tables](#core-infrastructure-tables)
2. [User & Authentication Tables](#user--authentication-tables)
3. [Permission & Access Control Tables](#permission--access-control-tables)
4. [Farm & Animal Tables](#farm--animal-tables)
5. [Production & Veterinary Tables](#production--veterinary-tables)
6. [Breeding & External Farm Tables](#breeding--external-farm-tables)
7. [Financial Tables](#financial-tables)
8. [Inventory Tables](#inventory-tables)
9. [Activity & Disposal Tables](#activity--disposal-tables)
10. [Media Tables](#media-tables)
11. [Invitation & Delegation Tables](#invitation--delegation-tables)
12. [Audit & Analytics Tables](#audit--analytics-tables)
13. [Notification Tables](#notification-tables)
14. [Device & Security Tables](#device--security-tables)
15. [Subscription & Billing Tables](#subscription--billing-tables)

---

## Conventions

### Data Types
- `SERIAL` = Auto-incrementing integer (Primary Key)
- `VARCHAR(n)` = Variable character string with max length
- `TEXT` = Unlimited text
- `DECIMAL(m,d)` = Decimal with m total digits, d decimal places
- `TIMESTAMP` = Date and time with timezone
- `DATE` = Date only
- `TIME` = Time only
- `BOOLEAN` = True/False
- `JSONB` = JSON binary format
- `UUID` = Universally unique identifier
- `INET` = IP address (v4 or v6)

### Naming Conventions
- Tables: Lowercase with underscores (e.g., `user_roles`)
- Primary Keys: `{table}_id` (e.g., `user_id`, `animal_id`)
- Foreign Keys: `{referenced_table}_{referenced_field}` (e.g., `tenant_id`, `farm_id`)
- Indexes: `idx_{table}_{columns}` (e.g., `idx_animals_tenant_farm`)
- Constraints: `{table}_{column}_{constraint}` (e.g., `animals_tag_number_unique`)

### Common Patterns
- All tables have `created_at` and `updated_at` timestamps
- Multi-tenant tables have `tenant_id` foreign key
- Farm-scoped tables have both `tenant_id` and `farm_id`

---

## Core Infrastructure Tables

### 1. tenants

**Purpose**: Organization/tenant entities in the system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| tenant_id | SERIAL | PRIMARY KEY | Unique tenant identifier |
| organization_name | VARCHAR(255) | NOT NULL | Organization name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly identifier |
| owner_user_id | INTEGER | NOT NULL, FK → users(user_id) | Tenant owner |
| subscription_id | INTEGER | FK → subscriptions(subscription_id) | Active subscription |
| subscription_status | VARCHAR(20) | DEFAULT 'trial' | active, trial, suspended, cancelled |
| trial_ends_at | TIMESTAMP | NULL | Trial expiration date |
| settings | JSONB | DEFAULT '{}' | Tenant settings |
| timezone | VARCHAR(50) | DEFAULT 'UTC' | Tenant timezone |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Default currency |
| language | VARCHAR(10) | DEFAULT 'en' | Default language |
| logo_id | INTEGER | FK → media_files(file_id) | Tenant logo |
| primary_color | VARCHAR(7) | DEFAULT '#047857' | Brand color |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| suspended_at | TIMESTAMP | NULL | Suspension timestamp |
| suspension_reason | TEXT | NULL | Reason for suspension |
| max_users | INTEGER | DEFAULT 5 | User limit |
| max_farms | INTEGER | DEFAULT 2 | Farm limit |
| max_animals | INTEGER | DEFAULT 100 | Animal limit |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);
```

**Constraints:**
```sql
ALTER TABLE tenants ADD CONSTRAINT tenants_subscription_status_check 
  CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled'));
```

---

## User & Authentication Tables

### 2. users

**Purpose**: System users with authentication and security (credentials only)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | SERIAL | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (username) |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| primary_tenant_id | INTEGER | FK → tenants(tenant_id) | Primary tenant reference |
| account_status | VARCHAR(20) | DEFAULT 'pending_invitation' | Account status |
| is_super_admin | BOOLEAN | DEFAULT FALSE | Platform admin flag |
| is_staff | BOOLEAN | DEFAULT FALSE | Django staff flag |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| email_verification_token | UUID | NULL | Verification token |
| email_verification_sent_at | TIMESTAMP | NULL | Verification sent time |
| password_reset_token | UUID | NULL | Reset token |
| password_reset_sent_at | TIMESTAMP | NULL | Reset sent time |
| password_reset_expires_at | TIMESTAMP | NULL | Reset expiry |
| mfa_enabled | BOOLEAN | DEFAULT FALSE | MFA status |
| mfa_secret | VARCHAR(255) | NULL | MFA secret key |
| backup_codes | JSONB | DEFAULT '[]' | MFA backup codes |
| last_login_at | TIMESTAMP | NULL | Last login timestamp |
| last_login_ip | INET | NULL | Last login IP |
| failed_login_attempts | INTEGER | DEFAULT 0 | Failed login count |
| locked_until | TIMESTAMP | NULL | Account lock expiry |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_auth0_user_id ON users(auth0_user_id);  -- For Auth0 lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_primary_tenant ON users(primary_tenant_id);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_is_super_admin ON users(is_super_admin);
```

**Hybrid Authentication Notes:**
- `auth0_user_id` is the primary link to Auth0 user account
- Authentication (password, 2FA, login) handled by Auth0
- Authorization (roles, permissions, RBAC/ABAC) handled by Django
- All legal compliance data stored in `profiles` table (not Auth0)

**Constraints:**
```sql
ALTER TABLE users ADD CONSTRAINT users_account_status_check 
  CHECK (account_status IN ('active', 'pending_invitation', 'suspended', 'deleted'));
```

---

### 3. profiles

**Purpose**: Extended user profile information (personal data, preferences, and legal compliance data)

**Layer Context**: This table is accessed through Layer 6 (Data Access) and stores legal compliance data required for regulatory compliance (Uganda-specific).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| profile_id | SERIAL | PRIMARY KEY | Unique profile identifier |
| user_id | INTEGER | UNIQUE, NOT NULL, FK → users(user_id) ON DELETE CASCADE | User reference |
| first_name | VARCHAR(150) | NOT NULL | First name (REQUIRED) |
| last_name | VARCHAR(150) | NOT NULL | Last name (REQUIRED) |
| middle_name | VARCHAR(150) | NULL | Middle name |
| national_id_number | VARCHAR(50) | UNIQUE, NULL | National ID Number (NIN) - Legal compliance |
| passport_number | VARCHAR(50) | NULL | Passport number |
| tax_identification_number | VARCHAR(50) | NULL | Tax ID Number (TIN) |
| driving_license_number | VARCHAR(50) | NULL | Driving license number |
| phone | VARCHAR(20) | NOT NULL | Phone number (REQUIRED) |
| alternate_phone | VARCHAR(20) | NULL | Alternate phone number |
| email | VARCHAR(255) | NULL | Email (synced from Auth0) |
| address | TEXT | NOT NULL | Address (REQUIRED) |
| city | VARCHAR(100) | NULL | City |
| district | VARCHAR(100) | NULL | District |
| region | VARCHAR(100) | NULL | Region |
| country | VARCHAR(100) | DEFAULT 'Uganda' | Country |
| postal_code | VARCHAR(20) | NULL | Postal code |
| date_of_birth | DATE | NULL | Birth date |
| gender | VARCHAR(20) | NULL | Gender |
| emergency_contact_name | VARCHAR(200) | NULL | Emergency contact name |
| emergency_contact_phone | VARCHAR(20) | NULL | Emergency contact phone |
| emergency_contact_relationship | VARCHAR(50) | NULL | Emergency contact relationship |
| national_id_document_id | INTEGER | FK → media_files(file_id) | NIN document |
| passport_document_id | INTEGER | FK → media_files(file_id) | Passport document |
| profile_picture_id | INTEGER | FK → media_files(file_id) | Profile photo |
| bio | TEXT | NULL | User biography |
| data_consent_given | BOOLEAN | DEFAULT FALSE | Data consent flag |
| data_consent_date | TIMESTAMP | NULL | Data consent date |
| terms_accepted | BOOLEAN | DEFAULT FALSE | Terms acceptance flag |
| terms_accepted_date | TIMESTAMP | NULL | Terms acceptance date |
| notification_preferences | JSONB | DEFAULT '{}' | Notification preferences |
| language | VARCHAR(10) | DEFAULT 'en' | Preferred language |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_name ON profiles(first_name, last_name);
CREATE INDEX idx_profiles_national_id ON profiles(national_id_number);  -- For legal lookups
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_email ON profiles(email);
```

**Legal Compliance Notes:**
- `national_id_number` is unique and indexed for legal compliance lookups
- `first_name`, `last_name`, `phone`, `address` are REQUIRED fields
- `data_consent_given` and `terms_accepted` must be TRUE for active users
- All legal compliance data stored in Django (not Auth0) for full control
- Layer 6 (Data Access) queries this table for profile information

---

### 4. user_sessions

**Purpose**: Track active user sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | SERIAL | PRIMARY KEY | Unique session identifier |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User reference |
| tenant_id | INTEGER | FK → tenants(tenant_id) | Tenant context |
| token | VARCHAR(255) | UNIQUE, NOT NULL | JWT access token |
| refresh_token | VARCHAR(255) | UNIQUE, NOT NULL | JWT refresh token |
| device_id | INTEGER | FK → devices(device_id) | Device used |
| ip_address | INET | NOT NULL | Request IP |
| user_agent | TEXT | NOT NULL | Browser/client info |
| issued_at | TIMESTAMP | NOT NULL | Token issue time |
| expires_at | TIMESTAMP | NOT NULL | Token expiry |
| last_activity_at | TIMESTAMP | NOT NULL | Last activity |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| revoked_at | TIMESTAMP | NULL | Revocation time |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active);
CREATE UNIQUE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

---

### 5. user_tenants

**Purpose**: User-Tenant associations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User reference |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| is_owner | BOOLEAN | DEFAULT FALSE | Tenant owner flag |
| joined_at | TIMESTAMP | NOT NULL | Join timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_user_tenants_user_tenant ON user_tenants(user_id, tenant_id);
CREATE INDEX idx_user_tenants_tenant ON user_tenants(tenant_id);
```

---

### 6. identity_providers

**Purpose**: External identity provider configuration for SSO

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idp_id | SERIAL | PRIMARY KEY | Unique IdP identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| name | VARCHAR(100) | NOT NULL | Provider name |
| idp_type | VARCHAR(20) | NOT NULL | oauth2, saml, ldap |
| config | JSONB | NOT NULL | Provider configuration |
| attribute_mapping | JSONB | DEFAULT '{}' | User attribute mapping |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_identity_providers_tenant ON identity_providers(tenant_id);
CREATE INDEX idx_identity_providers_active ON identity_providers(tenant_id, is_active);
```

---

## Permission & Access Control Tables

### 7. permissions

**Purpose**: System-wide permission definitions (immutable)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| permission_id | SERIAL | PRIMARY KEY | Unique permission identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Permission code (e.g., 'view_animals') |
| display_name | VARCHAR(200) | NOT NULL | Human-readable name |
| description | TEXT | NOT NULL | Permission description |
| category | VARCHAR(50) | NOT NULL | Permission category |
| action | VARCHAR(50) | NOT NULL | Action (view, create, edit, delete) |
| resource_type | VARCHAR(100) | NOT NULL | Resource type |
| system_defined | BOOLEAN | DEFAULT TRUE | System-defined flag |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_category ON permissions(category);
```

**Constraints:**
```sql
ALTER TABLE permissions ADD CONSTRAINT permissions_category_check 
  CHECK (category IN ('animals', 'activities', 'reports', 'management', 'financial', 'health'));
```

---

### 8. role_templates

**Purpose**: Pre-defined role templates (e.g., Veterinarian, Farm Manager)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| template_id | SERIAL | PRIMARY KEY | Unique template identifier |
| name | VARCHAR(100) | NOT NULL | Template name |
| display_name | VARCHAR(200) | NOT NULL | Display name |
| description | TEXT | NOT NULL | Template description |
| recommended_for | JSONB | DEFAULT '[]' | Recommended user types |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Junction Table: role_template_permissions**
```sql
CREATE TABLE role_template_permissions (
  template_id INTEGER NOT NULL REFERENCES role_templates(template_id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, permission_id)
);
```

---

### 9. roles

**Purpose**: Custom roles per tenant

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_id | SERIAL | PRIMARY KEY | Unique role identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| template_id | INTEGER | FK → role_templates(template_id) | Template reference |
| name | VARCHAR(100) | NOT NULL | Role name |
| description | TEXT | NULL | Role description |
| is_default | BOOLEAN | DEFAULT FALSE | Default role flag |
| created_by_user_id | INTEGER | FK → users(user_id) | Creator reference |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_roles_tenant_name ON roles(tenant_id, name);
CREATE INDEX idx_roles_tenant_default ON roles(tenant_id, is_default);
```

**Junction Table: role_permissions**
```sql
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

---

### 10. policies

**Purpose**: ABAC policies for conditional access

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| policy_id | SERIAL | PRIMARY KEY | Unique policy identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| name | VARCHAR(200) | NOT NULL | Policy name |
| description | TEXT | NULL | Policy description |
| rules | JSONB | NOT NULL | Policy rules (conditions) |
| effect | VARCHAR(10) | NOT NULL | allow, deny |
| time_restrictions | JSONB | NULL | Time-based restrictions |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_by_user_id | INTEGER | FK → users(user_id) | Creator reference |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_policies_tenant_active ON policies(tenant_id, is_active);
```

**Junction Table: policy_roles**
```sql
CREATE TABLE policy_roles (
  policy_id INTEGER NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  PRIMARY KEY (policy_id, role_id)
);
```

---

### 11. user_roles

**Purpose**: User role assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User reference |
| role_id | INTEGER | NOT NULL, FK → roles(role_id) | Role reference |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | FK → farms(farm_id) | Farm scope (optional) |
| assigned_at | TIMESTAMP | NOT NULL | Assignment time |
| assigned_by_user_id | INTEGER | FK → users(user_id) | Assigner reference |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_user_roles_user_role_farm ON user_roles(user_id, role_id, farm_id);
CREATE INDEX idx_user_roles_user_tenant ON user_roles(user_id, tenant_id);
```

---

**Continue in next file...**

