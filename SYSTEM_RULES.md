# iFarm System Rules & Business Logic

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Production Rules

---

## 📋 Table of Contents

1. [Multi-Tenant Isolation Rules](#multi-tenant-isolation-rules)
2. [User & Authentication Rules](#user--authentication-rules)
3. [Permission & Access Control Rules](#permission--access-control-rules)
4. [Farm Management Rules](#farm-management-rules)
5. [Animal Management Rules](#animal-management-rules)
6. [Breeding Rules](#breeding-rules)
7. [Production Rules](#production-rules)
8. [Financial Rules](#financial-rules)
9. [Inventory Rules](#inventory-rules)
10. [Veterinary Rules](#veterinary-rules)
11. [Data Integrity Rules](#data-integrity-rules)
12. [Workflow Rules](#workflow-rules)
13. [Validation Rules](#validation-rules)
14. [Security Rules](#security-rules)
15. [Performance Rules](#performance-rules)
16. [Business Logic Rules](#business-logic-rules)
17. [Error Handling Rules](#error-handling-rules)
18. [Compliance Rules](#compliance-rules)

---

## Multi-Tenant Isolation Rules

### Rule 1.1: Tenant Data Isolation
- **MANDATORY**: All tenant-scoped tables MUST include `tenant_id`
- **ENFORCEMENT**: Database queries MUST filter by `tenant_id` at all times
- **EXCEPTION**: Super admins can access all tenant data
- **VIOLATION**: Data leakage between tenants is a critical security breach

### Rule 1.2: Tenant Context Extraction
- **REQUIRED**: `TenantMiddleware` MUST extract `tenant_id` from JWT token
- **FALLBACK**: If no tenant in token, user MUST be redirected to tenant selection
- **THREAD LOCAL**: Tenant ID stored in thread-local storage for query filtering

### Rule 1.3: Cross-Tenant Data Access
- **PROHIBITED**: Users from Tenant A cannot access Tenant B's data
- **ENFORCEMENT**: Custom managers (`TenantManager`, `FarmManager`) enforce filtering
- **AUDIT**: All cross-tenant access attempts MUST be logged

### Rule 1.4: Tenant Isolation in Queries
- **REQUIRED**: All ORM queries MUST use tenant-aware managers
- **AUTOMATIC**: `TenantManager` automatically adds `tenant_id` filter
- **SUPER ADMIN**: Super admins can bypass tenant filtering

---

## User & Authentication Rules

### Rule 2.1: User-Profile Separation
- **REQUIRED**: User MUST exist before Profile can be created
- **ENFORCEMENT**: Database foreign key constraint with `ON DELETE CASCADE`
- **PATTERN**: User table = authentication only, Profile table = personal information
- **VALIDATION**: Cannot create profile without valid user_id

### Rule 2.2: Email Uniqueness
- **MANDATORY**: Email addresses MUST be unique across entire system
- **ENFORCEMENT**: Database `UNIQUE` constraint on `users.email`
- **VALIDATION**: Email format validation before user creation
- **CASE**: Email comparison is case-insensitive

### Rule 2.3: Account Status Transitions
```
pending_invitation → active (after email verification)
active → suspended (by admin)
suspended → active (by admin)
active → deleted (soft delete)
```
- **VALIDATION**: Only valid transitions allowed
- **AUDIT**: All status changes logged

### Rule 2.4: Password Requirements
- **MINIMUM LENGTH**: 8 characters
- **REQUIRED**: At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- **VALIDATION**: Enforced at both frontend and backend
- **STORAGE**: Passwords hashed with bcrypt/argon2 (never stored in plain text)

### Rule 2.5: Account Lockout
- **THRESHOLD**: Account locked after 5 failed login attempts
- **DURATION**: Locked for 30 minutes
- **NOTIFICATION**: User notified via email when account is locked
- **RESET**: Failed attempts reset after successful login

### Rule 2.6: Suspicious Location Detection
- **TRIGGER**: Login from suspicious location (risk score >= 50)
- **ACTION**: Automatically enforce 2FA
- **NOTIFICATION**: Farm owner and system admins notified
- **CRITERIA**: VPN/Proxy, impossible travel, new country, blacklisted IP
- **RISK SCORING**: 
  - VPN/Proxy: +30 points
  - Tor network: +50 points
  - High-risk country: +40 points
  - Impossible travel: +50 points
  - New country: +25 points
  - Blacklisted IP: +60 points

### Rule 2.7: Email Verification
- **REQUIRED**: Email verification required before account activation
- **TOKEN**: Unique verification token generated (UUID)
- **EXPIRY**: Verification token expires after 7 days
- **RESEND**: Can resend verification email (rate limited: 1 per minute)

### Rule 2.8: Multi-Factor Authentication (MFA)
- **OPTIONAL**: Users can enable MFA
- **REQUIRED**: MFA enforced for suspicious logins
- **METHOD**: TOTP (Time-based One-Time Password)
- **BACKUP CODES**: 10 backup codes generated when MFA enabled

---

## Permission & Access Control Rules

### Rule 3.1: Permission Hierarchy
```
Super Admin > Tenant Owner > Farm Manager > Worker > Viewer
```
- **INHERITANCE**: Higher roles inherit lower role permissions
- **OVERRIDE**: Custom roles can override default permissions

### Rule 3.2: Permission Evaluation Order
1. **First**: Check RBAC permissions (fast lookup)
2. **Second**: Evaluate ABAC policies (if needed)
3. **Third**: Check delegations (temporary permissions)
4. **Result**: Access granted if ANY check passes

### Rule 3.3: Permission Caching
- **TTL**: Permissions cached for 1 hour (3600 seconds)
- **INVALIDATION**: Cache cleared when roles/permissions change
- **KEY FORMAT**: `ifarm:permissions:user:{user_id}:tenant:{tenant_id}`
- **FALLBACK**: If cache miss, query database and update cache

### Rule 3.4: Delegation Rules
- **DURATION**: Delegations can be time-bound or permanent
- **SCOPE**: Can delegate individual permissions or entire roles
- **RESTRICTIONS**: Can restrict by farm, time, and action
- **REVOCATION**: Owner/admin can revoke delegations anytime
- **AUDIT**: All delegations logged with full context
- **VALIDATION**: Cannot delegate permissions you don't have

### Rule 3.5: Farm-Level Access Control
- **REQUIRED**: Users MUST be explicitly assigned to farms
- **ENFORCEMENT**: `UserFarm` model enforces assignment
- **ACCESS LEVELS**: `read`, `write`, `admin`
- **DEFAULT**: Users see only assigned farms
- **OWNER**: Tenant owner has access to ALL farms in tenant

### Rule 3.6: Role Assignment
- **REQUIRED**: Users must have at least one role per tenant
- **DEFAULT**: Default role assigned on tenant/user creation
- **MULTIPLE**: Users can have multiple roles
- **PRIORITY**: Highest permission level applies

---

## Farm Management Rules

### Rule 4.1: Farm Assignment
- **REQUIRED**: Users MUST be explicitly assigned to farms
- **ENFORCEMENT**: `UserFarm` model enforces assignment
- **ACCESS LEVELS**: `read`, `write`, `admin`
- **DEFAULT**: Users see only assigned farms

### Rule 4.2: Farm Ownership
- **OWNER**: Tenant owner has access to ALL farms in tenant
- **MANAGER**: Farm manager has admin access to assigned farm(s)
- **WORKER**: Worker has write access to assigned farm(s)
- **VIEWER**: Viewer has read-only access

### Rule 4.3: Farm Code Uniqueness
- **SCOPE**: Farm codes MUST be unique within a tenant
- **ENFORCEMENT**: `UNIQUE INDEX` on `(tenant_id, farm_code)`
- **FORMAT**: Alphanumeric, case-insensitive
- **AUTO-GENERATE**: Can auto-generate if not provided

### Rule 4.4: Farm Status
- **VALID VALUES**: `active`, `inactive`, `archived`
- **DEFAULT**: `active`
- **RESTRICTION**: Cannot create animals in `inactive` or `archived` farms
- **TRANSITION**: Can only transition: active → inactive → archived

### Rule 4.5: Farm Type Validation
- **VALID VALUES**: `cattle`, `poultry`, `goats`, `sheep`, `pigs`, `mixed`, `other`
- **REQUIRED**: Farm type is mandatory
- **MULTIPLE**: Mixed farms can have multiple animal types

---

## Animal Management Rules

### Rule 5.1: Animal Tag Uniqueness
- **SCOPE**: Tag numbers MUST be unique within a tenant
- **ENFORCEMENT**: `UNIQUE INDEX` on `(tenant_id, tag_number)`
- **REQUIRED**: Tag number is mandatory
- **FORMAT**: Alphanumeric, case-insensitive

### Rule 5.2: Animal Status Transitions
```
active → sold (when sold)
active → dead (when deceased)
active → stolen (when stolen)
active → slaughtered (when slaughtered)
active → gifted (when given away)
active → transferred (when moved to another farm)
```
- **VALIDATION**: Only valid transitions allowed
- **IRREVERSIBLE**: Once disposed, cannot revert to active
- **AUDIT**: All status changes logged

### Rule 5.3: Animal Gender Validation
- **VALID VALUES**: `male`, `female`
- **REQUIRED**: Gender is mandatory
- **BREEDING**: Only female animals can be bred (as dam)
- **SIRE**: Only male animals can be sire

### Rule 5.4: Animal Acquisition
- **VALID METHODS**: `birth`, `purchase`, `gift`, `transfer`, `other`
- **REQUIRED**: Acquisition method and date are mandatory
- **COST**: Acquisition cost required for `purchase`
- **VALIDATION**: Acquisition date cannot be in future

### Rule 5.5: Animal Disposal
- **VALID METHODS**: `sale`, `death`, `theft`, `slaughter`, `gift`, `transfer`, `other`
- **REQUIRED**: Disposal method, date, and reason required when disposing
- **RESTRICTION**: Cannot create new records for disposed animals
- **VALIDATION**: Disposal date >= acquisition date

### Rule 5.6: Animal Lineage
- **DAM**: Mother reference (self-referential foreign key)
- **SIRE**: Father reference (self-referential foreign key)
- **OPTIONAL**: Lineage can be null for purchased animals
- **VALIDATION**: Cannot set animal as its own parent
- **VALIDATION**: Cannot create circular lineage (A → B → A)

### Rule 5.7: Animal History Tracking
- **REQUIRED**: All animal data changes MUST create history record
- **SNAPSHOT**: Complete animal data stored in `animal_history.data` (JSONB)
- **AUDIT**: Changed fields tracked in `changed_fields` array
- **RETENTION**: History records retained for 7 years
- **IMMUTABLE**: History records cannot be modified

### Rule 5.8: Animal Age Calculation
- **AUTO-CALCULATE**: Age calculated from `date_of_birth` if available
- **STORAGE**: Age stored in `age_months` for performance
- **UPDATE**: Age updated daily via Celery task
- **VALIDATION**: Age cannot be negative

### Rule 5.9: Animal Castration
- **STATUS**: `is_castrated` boolean flag
- **DATE**: Castration date recorded when castrated
- **METHOD**: `surgical`, `banding`, `chemical`
- **VALIDATION**: Castration date cannot be in future

---

## Breeding Rules

### Rule 6.1: Breeding Record Requirements
- **REQUIRED**: Female animal (dam) is mandatory
- **SIRE SOURCE**: Must be `internal` or `external`
- **VALIDATION**: If `internal`, `sire_id` required; if `external`, `external_animal_id` required
- **VALIDATION**: Cannot breed animal with itself

### Rule 6.2: Pregnancy Status Transitions
```
suspected → confirmed (after pregnancy test)
confirmed → completed (after successful birth)
confirmed → failed (if miscarriage/abortion)
suspected → failed (if not pregnant)
```
- **VALIDATION**: Only valid transitions allowed
- **AUDIT**: All status changes logged

### Rule 6.3: Breeding Date Validation
- **REQUIRED**: Breeding date is mandatory
- **LOGIC**: `conception_date` >= `breeding_date`
- **LOGIC**: `expected_due_date` = `conception_date` + gestation period (varies by species)
- **LOGIC**: `actual_birth_date` >= `breeding_date`
- **VALIDATION**: Breeding date cannot be in future

### Rule 6.4: Birth Outcome
- **VALID VALUES**: `successful`, `stillborn`, `aborted`, `complications`
- **REQUIRED**: Birth outcome required when `actual_birth_date` is set
- **OFFSPRING**: `offspring_count` must match number of offspring animals created
- **VALIDATION**: Offspring count must be >= 0

### Rule 6.5: Breeding Method
- **VALID VALUES**: `natural`, `artificial_insemination`, `embryo_transfer`
- **DEFAULT**: `natural`
- **REQUIRED**: Breeding method is mandatory

### Rule 6.6: Hire Agreement Linking
- **OPTIONAL**: Can link to `animal_hire_agreement` (hiring out your animal)
- **OPTIONAL**: Can link to `external_animal_hire_agreement` (hiring external animal)
- **FINANCIAL**: Hire agreements automatically create expense/revenue entries
- **VALIDATION**: Cannot link both hire agreement types

### Rule 6.7: Gestation Period Calculation
- **CATTLE**: 280-290 days (default: 285)
- **GOATS**: 145-155 days (default: 150)
- **SHEEP**: 144-152 days (default: 148)
- **PIGS**: 112-115 days (default: 114)
- **AUTO-CALCULATE**: Expected due date calculated from conception date

---

## Production Rules

### Rule 7.1: Production Type Validation
- **VALID VALUES**: `milk`, `eggs`, `wool`, `honey`
- **REQUIRED**: Production type is mandatory
- **ANIMAL TYPE**: Production type must match animal type capabilities

### Rule 7.2: Production Date Validation
- **REQUIRED**: Production date is mandatory
- **RESTRICTION**: Cannot record production for future dates
- **RESTRICTION**: Cannot record production more than 7 days in the past (configurable)
- **VALIDATION**: Production date cannot be before animal acquisition date

### Rule 7.3: Milk Production Rules
- **ANIMAL**: Animal ID required for milk production
- **SESSION**: Milking session required (`morning`, `evening`, `midday`, `custom`)
- **SESSION NUMBER**: Multiple sessions per day allowed (1, 2, 3...)
- **UNIQUENESS**: Unique constraint on `(animal_id, production_date, milking_session, session_number)`
- **VALIDATION**: Only female animals can produce milk

### Rule 7.4: Production Quantity
- **REQUIRED**: Quantity is mandatory and must be > 0
- **UNIT**: Unit must match production type:
  - Milk: `liters`
  - Eggs: `pieces` or `dozen`
  - Wool: `kg`
  - Honey: `kg`
- **VALIDATION**: Quantity cannot exceed reasonable limits (configurable)

### Rule 7.5: Milk Quality Metrics
- **OPTIONAL**: Fat content, protein content, SCC, temperature, pH, lactose
- **RANGE**: Fat content: 0-100%, Protein content: 0-100%
- **RANGE**: SCC: 0-1,000,000 per ml
- **RANGE**: Temperature: 0-50°C
- **RANGE**: pH: 0-14
- **RANGE**: Lactose: 0-100%
- **VALIDATION**: All metrics within valid ranges

### Rule 7.6: Daily Production Summary
- **AUTO-UPDATE**: Summary automatically updated when production recorded
- **AGGREGATION**: Sums all sessions for the day
- **AVERAGES**: Calculates average quality metrics
- **UNIQUENESS**: One summary per animal per day per production type
- **TRIGGER**: Updated via Django signal on production save

### Rule 7.7: Production Recording
- **REQUIRED**: Recorded by user is mandatory
- **TIMESTAMP**: Production datetime optional (defaults to production_date 00:00)
- **AUDIT**: All production records logged

---

## Financial Rules

### Rule 8.1: Expense Approval Workflow
```
pending → approved (by owner/admin)
pending → rejected (by owner/admin)
```
- **AUTO-APPROVAL**: Owner's expenses auto-approved
- **REQUIRED**: Worker expenses require owner/admin approval
- **NOTIFICATION**: Owner notified when expense pending approval
- **AUDIT**: All approval/rejection actions logged

### Rule 8.2: Expense Approval Rules
- **AUTO-APPROVAL**: Owner's expenses auto-approved
- **REQUIRED**: Worker expenses require owner/admin approval
- **NOTIFICATION**: Owner notified when expense pending approval
- **AUDIT**: All approval/rejection actions logged
- **REVERSAL**: Cannot reverse approved expenses (must create adjustment)

### Rule 8.3: Expense Amount Validation
- **REQUIRED**: Amount is mandatory and must be > 0
- **CURRENCY**: Currency defaults to tenant currency (UGX)
- **PRECISION**: Amount stored with 2 decimal places
- **MAXIMUM**: Maximum amount per expense: 1,000,000,000 UGX (configurable)

### Rule 8.4: Expense Types
- **VALID VALUES**: `feed`, `medicine`, `labor`, `equipment`, `utilities`, `transport`, `veterinary`, `animal_hire`, `other`
- **REQUIRED**: Expense type is mandatory
- **LINKING**: Can link to activities, hire agreements, invoices

### Rule 8.5: Animal Sale Rules
- **REQUIRED**: Animal, sale date, sale price are mandatory
- **STATUS**: Animal status automatically updated to `sold`
- **PAYMENT**: Payment status: `pending`, `partial`, `paid`, `overdue`
- **INVOICE**: Can link to sales invoice
- **VALIDATION**: Sale price must be > 0
- **VALIDATION**: Sale date cannot be in future

### Rule 8.6: Product Sale Rules
- **REQUIRED**: Product name, quantity, unit price, sale date are mandatory
- **CALCULATION**: `total_amount` = `quantity` × `unit_price`
- **TAX**: Tax calculated automatically if tax configuration enabled
- **VALIDATION**: Quantity and unit price must be > 0

### Rule 8.7: Invoice Rules
- **NUMBERING**: Invoice numbers MUST be unique per tenant
- **REQUIRED**: Invoice date, due date, line items are mandatory
- **CALCULATION**: `total_amount` = sum of line items + tax - discount
- **STATUS**: `draft`, `sent`, `paid`, `overdue`, `cancelled`
- **VALIDATION**: Due date >= invoice date
- **AUTO-GENERATE**: Invoice numbers auto-generated if not provided

### Rule 8.8: Payment Idempotency
- **REQUIRED**: All payments MUST have `idempotency_key`
- **ENFORCEMENT**: Duplicate payments with same key are rejected
- **STORAGE**: Idempotency key stored in `payments.idempotency_key` with `UNIQUE` constraint
- **FORMAT**: UUID recommended for idempotency keys

### Rule 8.9: Tax Calculation (Uganda)
- **AUTO-CALCULATE**: Tax calculated automatically on sales if enabled
- **VAT RATE**: Default VAT rate: 18%
- **THRESHOLD**: VAT registration threshold: UGX 150,000,000
- **FISCAL YEAR**: July 1 - June 30
- **EXEMPTIONS**: Agricultural products may be exempt
- **REQUIRED**: TIN required for tax calculations

---

## Inventory Rules

### Rule 9.1: Inventory Item Uniqueness
- **SCOPE**: Item codes MUST be unique within a tenant
- **ENFORCEMENT**: `UNIQUE INDEX` on `(tenant_id, item_code)`
- **AUTO-GENERATE**: Item codes can be auto-generated if not provided
- **FORMAT**: Alphanumeric, case-insensitive

### Rule 9.2: Stock Level Validation
- **REQUIRED**: Current stock, reorder point are mandatory
- **LOGIC**: `current_stock` >= 0
- **ALERT**: Low stock alert when `current_stock` <= `reorder_point`
- **ALERT**: Out of stock alert when `current_stock` = 0
- **VALIDATION**: Reorder point must be >= 0

### Rule 9.3: Inventory Movement Types
- **VALID VALUES**: `purchase`, `sale`, `adjustment`, `transfer`, `consumption`, `expiry`, `damage`
- **REQUIRED**: Movement type is mandatory
- **AUDIT**: All movements logged

### Rule 9.4: Stock Movement Validation
- **REQUIRED**: Quantity is mandatory
- **LOGIC**: For `sale`, `consumption`, `expiry`, `damage`: quantity must be <= current stock
- **LOGIC**: For `purchase`, `adjustment`, `transfer`: quantity can be any positive value
- **AUTO-UPDATE**: Current stock automatically updated after movement
- **VALIDATION**: Quantity must be > 0

### Rule 9.5: Expiry Date Tracking
- **OPTIONAL**: Expiry date for perishable items
- **ALERT**: Expiring soon alert when expiry within 30 days
- **AUTO-STATUS**: Item status set to `expired` when past expiry date
- **VALIDATION**: Expiry date cannot be in past when creating item

### Rule 9.6: Inventory Categories
- **VALID VALUES**: `feed`, `medicine`, `equipment`, `tools`, `supplies`, `other`
- **REQUIRED**: Category is mandatory
- **DEFAULT UNIT**: Unit defaults based on category

---

## Veterinary Rules

### Rule 10.1: Health Check Frequency
- **RECOMMENDED**: Health checks every 3-6 months (configurable per animal type)
- **REQUIRED**: Health check date is mandatory
- **FOLLOW-UP**: Next check date can be set based on findings
- **VALIDATION**: Check date cannot be in future

### Rule 10.2: Health Status Values
- **VALID VALUES**: `excellent`, `good`, `fair`, `poor`, `critical`
- **DEFAULT**: `good`
- **REQUIRED**: Overall health status is mandatory
- **AUTO-UPDATE**: Animal health status updated based on latest check

### Rule 10.3: Vaccination Rules
- **REQUIRED**: Vaccine name, vaccination date, administered by are mandatory
- **FOLLOW-UP**: Next vaccination date can be set
- **BATCH**: Batch number recommended for traceability
- **VALIDATION**: Vaccination date cannot be in future
- **ROUTE**: Administration route: `intramuscular`, `subcutaneous`, `oral`, `intranasal`, `intravenous`

### Rule 10.4: Treatment Rules
- **REQUIRED**: Treatment date, condition, treatment type are mandatory
- **VALID TYPES**: `medication`, `surgery`, `therapy`, `wound_care`, `other`
- **OUTCOME**: Outcome can be `successful`, `ongoing`, `failed`, `deceased`
- **WITHDRAWAL**: Withdrawal period tracked for milk/meat safety
- **VALIDATION**: Treatment date cannot be in future
- **FOLLOW-UP**: Follow-up date can be set

### Rule 10.5: Weight Record Rules
- **REQUIRED**: Weight date and weight are mandatory
- **LOGIC**: Weight must be > 0
- **FREQUENCY**: Multiple weight records allowed per animal
- **TREND**: Weight trends calculated from historical records
- **VALIDATION**: Weight date cannot be in future
- **BCS**: Body Condition Score (1-5) optional

### Rule 10.6: Deworming Rules
- **REQUIRED**: Deworming date, product name, dosage, route are mandatory
- **FOLLOW-UP**: Next deworming date can be set
- **FREQUENCY**: Typically every 3-6 months (varies by product)
- **VALIDATION**: Deworming date cannot be in future
- **ROUTE**: Administration route required

---

## Data Integrity Rules

### Rule 11.1: Foreign Key Constraints
- **ENFORCEMENT**: All foreign keys MUST have constraints
- **CASCADE**: Child records deleted when parent deleted (where appropriate)
  - Examples: `animal_history` → `animals`, `production` → `animals`
- **SET NULL**: References cleared when parent deleted (for optional relationships)
  - Examples: `animals.dam_id` → `animals`, `expenses.approved_by` → `users`
- **PROTECT**: Deletion prevented if children exist (for critical relationships)
  - Examples: `animal_sales` → `animals`, `subscriptions` → `subscription_plans`

### Rule 11.2: Unique Constraints
- **EMAIL**: `users.email` is unique
- **TENANT + TAG**: `(tenant_id, tag_number)` is unique for animals
- **TENANT + CODE**: `(tenant_id, farm_code)` is unique for farms
- **SESSION**: `(animal_id, production_date, milking_session, session_number)` is unique
- **INVOICE**: Invoice numbers unique per tenant

### Rule 11.3: Check Constraints
- **STATUS VALUES**: All status fields have CHECK constraints for valid values
- **RANGES**: Numeric fields have range checks (e.g., BCS 1-5, percentages 0-100)
- **DATES**: Date fields validated (e.g., `end_date` > `start_date`)
- **AMOUNTS**: Amounts must be > 0

### Rule 11.4: NOT NULL Constraints
- **CRITICAL FIELDS**: All critical fields marked as `NOT NULL`
- **OPTIONAL FIELDS**: Optional fields allow `NULL`
- **AUDIT FIELDS**: `created_at`, `updated_at` are always `NOT NULL`
- **TENANT ID**: `tenant_id` is `NOT NULL` for all tenant-scoped tables

### Rule 11.5: Data Type Validation
- **DECIMAL PRECISION**: Amounts stored as `DECIMAL(12,2)` for financial accuracy
- **DATE FORMAT**: All dates stored as `DATE` type (no time component)
- **TIMESTAMP**: All timestamps stored as `TIMESTAMP` with timezone
- **JSONB**: Flexible data stored as JSONB (e.g., settings, details)

---

## Workflow Rules

### Rule 12.1: Expense Approval Workflow
```
1. Worker records expense → status: pending
2. Owner/admin notified (email + in-app)
3. Owner/admin approves/rejects
4. If approved → status: approved, expense counted in financials
5. If rejected → status: rejected, worker notified with reason
6. All actions logged in audit trail
```

### Rule 12.2: Animal Sale Workflow
```
1. Create sale record → animal status: active
2. Mark sale as paid → animal status: sold
3. Generate invoice (optional)
4. Update financial records
5. Create disposal record
6. Log in audit trail
```

### Rule 12.3: Breeding Workflow
```
1. Record breeding → pregnancy_status: suspected
2. Confirm pregnancy → pregnancy_status: confirmed, set expected_due_date
3. Record birth → pregnancy_status: completed, create offspring animals
4. If miscarriage → pregnancy_status: failed
5. Link offspring to breeding record
6. Update animal lineage
```

### Rule 12.4: Production Workflow
```
1. Record production → create production record
2. Auto-update daily summary (via signal)
3. Invalidate production cache
4. Publish Kafka event
5. Log in audit trail
```

### Rule 12.5: User Invitation Workflow
```
1. Owner creates invitation → status: pending
2. Email sent to invitee
3. Invitee accepts → creates user account
4. User assigned to farms and roles
5. Invitation status: accepted
6. Welcome email sent
```

### Rule 12.6: Subscription Workflow
```
1. Tenant created → trial status (14 days)
2. Trial expiry notification (3 days before)
3. Subscription created → active status
4. Recurring billing (monthly/yearly)
5. Payment processing (idempotent)
6. Invoice generation
7. Usage tracking
```

---

## Validation Rules

### Rule 13.1: Input Validation
- **REQUIRED**: All user inputs MUST be validated
- **SANITIZATION**: All inputs sanitized to prevent injection attacks
- **SCHEMA**: Use Pydantic/DRF serializers for validation
- **LAYERS**: Validation at frontend, API, and database levels

### Rule 13.2: Date Validation
- **FUTURE DATES**: Cannot create records with future dates (except for scheduled events)
- **PAST DATES**: Cannot create records more than 1 year in the past (configurable)
- **RANGE**: Date ranges validated (start < end)
- **FORMAT**: Dates must be in ISO format (YYYY-MM-DD)

### Rule 13.3: Numeric Validation
- **POSITIVE**: Quantities, amounts, weights must be > 0
- **RANGES**: Percentages must be 0-100
- **PRECISION**: Decimal places limited per field type
- **MAXIMUM**: Maximum values enforced (configurable)

### Rule 13.4: String Validation
- **LENGTH**: String lengths validated against max length
- **FORMAT**: Email, phone, URL formats validated
- **SPECIAL CHARS**: Special characters sanitized
- **TRIM**: Leading/trailing whitespace removed

### Rule 13.5: File Upload Validation
- **SIZE**: Max file size: 10MB (configurable)
- **TYPES**: Allowed file types: images (jpg, png, gif), PDFs, documents
- **SCANNING**: Files scanned for viruses before storage
- **STORAGE**: Files stored in Supabase Storage with tenant/farm organization

### Rule 13.6: Email Validation
- **FORMAT**: Valid email format required
- **DOMAIN**: Domain validation (optional)
- **UNIQUENESS**: Email must be unique across system

### Rule 13.7: Phone Validation
- **FORMAT**: Phone number format validated (country-specific)
- **LENGTH**: Phone number length validated
- **OPTIONAL**: Phone number is optional for profiles

---

## Security Rules

### Rule 14.1: Authentication Requirements
- **REQUIRED**: All API endpoints require authentication (except public endpoints)
- **TOKEN**: JWT tokens required in `Authorization: Bearer <token>` header
- **EXPIRY**: Access tokens expire after 1 hour, refresh tokens after 7 days
- **REFRESH**: Refresh tokens used to obtain new access tokens

### Rule 14.2: Authorization Enforcement
- **REQUIRED**: Permission checks before all data access
- **LAYERS**: Middleware, managers, and API views all enforce permissions
- **AUDIT**: All permission checks logged
- **DENIAL**: 403 Forbidden returned if permission denied

### Rule 14.3: Data Encryption
- **IN TRANSIT**: All communications encrypted with TLS 1.3
- **AT REST**: Sensitive data encrypted in database
- **PASSWORDS**: Passwords hashed with bcrypt/argon2
- **TOKENS**: JWT tokens signed with HS256 algorithm

### Rule 14.4: Rate Limiting
- **ENFORCEMENT**: Rate limiting on all API endpoints
- **LIMITS**: 100 requests/minute per user, 1000 requests/hour per tenant
- **VIOLATION**: 429 status code returned when limit exceeded
- **TRACKING**: Rate limit violations logged

### Rule 14.5: Audit Logging
- **REQUIRED**: All data modifications MUST be logged
- **CONTEXT**: Full context logged (user, tenant, farm, IP, device, permissions)
- **INTEGRITY**: SHA-256 checksums for log integrity
- **RETENTION**: Logs retained for 7 years
- **IMMUTABLE**: Audit logs cannot be modified

### Rule 14.6: Suspicious Activity Detection
- **TRIGGERS**: VPN/Proxy, impossible travel, new country, blacklisted IP
- **ACTION**: Auto-enforce 2FA, notify owner and admins
- **LOGGING**: All suspicious activities logged
- **RISK SCORE**: Risk score calculated (0-100)

### Rule 14.7: Device Tracking
- **REQUIRED**: All authenticated requests tracked
- **FINGERPRINT**: Device fingerprint generated from user agent, IP, etc.
- **TRUST**: Devices can be marked as trusted
- **BLOCK**: Devices can be blocked for abuse

### Rule 14.8: Session Management
- **STORAGE**: Sessions stored in Redis
- **EXPIRY**: Sessions expire after inactivity (configurable)
- **REVOCATION**: Sessions can be revoked
- **TRACKING**: All active sessions tracked

---

## Performance Rules

### Rule 15.1: Caching Strategy
- **PERMISSIONS**: Cached for 1 hour
- **DASHBOARD**: Cached for 5 minutes
- **ANALYTICS**: Cached for 1 hour
- **INVALIDATION**: Cache invalidated on data changes
- **KEYS**: Cache keys follow pattern: `ifarm:{category}:{identifier}`

### Rule 15.2: Query Optimization
- **REQUIRED**: Use `select_related` for foreign keys
- **REQUIRED**: Use `prefetch_related` for reverse foreign keys
- **REQUIRED**: Limit query results (pagination)
- **REQUIRED**: Use database indexes for common queries
- **AVOID**: N+1 queries prohibited

### Rule 15.3: Response Time Targets
- **DASHBOARD**: < 200ms (cached), < 1000ms (uncached)
- **API ENDPOINTS**: < 300ms (average)
- **ANALYTICS**: < 500ms (cached)
- **MONITORING**: Slow requests (> 1s) logged

### Rule 15.4: Database Indexing
- **REQUIRED**: Index on all foreign keys
- **REQUIRED**: Composite indexes for common query patterns
- **OPTIONAL**: Partial indexes for filtered queries
- **MAINTENANCE**: Indexes maintained and optimized regularly

### Rule 15.5: Async Processing
- **REQUIRED**: Heavy operations processed asynchronously (Celery)
- **EXAMPLES**: Email sending, report generation, cache warming, audit archival
- **QUEUE**: Tasks queued in Redis/Celery
- **RETRY**: Failed tasks retried with exponential backoff

### Rule 15.6: Pagination
- **REQUIRED**: All list endpoints paginated
- **DEFAULT**: 20 items per page
- **MAXIMUM**: 100 items per page
- **PARAMETERS**: `page` and `page_size` query parameters

---

## Business Logic Rules

### Rule 16.1: Solo Farm Owner Support
- **REQUIRED**: System MUST support owners managing farms alone
- **AUTO-APPROVAL**: Owner expenses auto-approved
- **NO LIMITATIONS**: No artificial restrictions for solo owners
- **SCALABILITY**: System scales from 1 owner to 10,000+ users
- **FEATURES**: All features accessible without workers

### Rule 16.2: Farm-Level Access Control
- **REQUIRED**: Users only see farms assigned by owner
- **ENFORCEMENT**: Multi-layered (middleware, managers, API)
- **GRANULAR**: Access levels per farm (read, write, admin)
- **AUTO-FILTER**: Farm-scoped queries automatically filtered

### Rule 16.3: Tax Calculation Rules (Uganda)
- **AUTO-CALCULATE**: Tax calculated automatically on sales if enabled
- **RATE**: Default VAT rate: 18%
- **THRESHOLD**: VAT registration threshold: UGX 150,000,000
- **FISCAL YEAR**: July 1 - June 30
- **EXEMPTIONS**: Agricultural products may be exempt
- **TIN**: TIN required for tax calculations

### Rule 16.4: Subscription Limits
- **ENFORCEMENT**: Usage limits enforced per subscription plan
- **RESOURCES**: Users, farms, animals, storage tracked
- **EXCEEDING**: System prevents exceeding limits (with grace period)
- **NOTIFICATION**: Users notified when approaching limits

### Rule 16.5: Trial Period
- **DURATION**: Default trial: 14 days
- **FEATURES**: Full feature access during trial
- **EXPIRY**: System notifies 3 days before expiry
- **CONVERSION**: Trial converts to paid subscription
- **EXTENSION**: Trial can be extended by admin

### Rule 16.6: Multi-Step Form State
- **STORAGE**: Form state stored in Redis
- **TTL**: Form state expires after 1 hour
- **AUTO-SAVE**: Form state auto-saved on each step
- **VALIDATION**: Step-by-step validation before progression
- **CLEAR**: Form state cleared after successful submission

---

## Error Handling Rules

### Rule 17.1: Error Response Format
- **STANDARD**: All errors return JSON with `error`, `detail`, `code` fields
- **HTTP STATUS**: Appropriate HTTP status codes (400, 401, 403, 404, 500)
- **NO SENSITIVE DATA**: Error messages don't expose sensitive information
- **FORMAT**: Consistent error format across all endpoints

### Rule 17.2: Validation Errors
- **FORMAT**: Validation errors return field-level details
- **STATUS**: 400 Bad Request
- **MESSAGE**: Clear, actionable error messages
- **FIELDS**: Field names and error messages included

### Rule 17.3: Permission Errors
- **STATUS**: 403 Forbidden
- **MESSAGE**: "You do not have permission to perform this action"
- **AUDIT**: All permission denials logged
- **NO DETAILS**: Doesn't reveal what permission is missing

### Rule 17.4: Not Found Errors
- **STATUS**: 404 Not Found
- **MESSAGE**: "Resource not found" (doesn't reveal if resource exists)
- **CONSISTENCY**: Same message for all not found errors

### Rule 17.5: Server Errors
- **STATUS**: 500 Internal Server Error
- **MESSAGE**: Generic error message to user
- **LOGGING**: Full error details logged server-side
- **NOTIFICATION**: Critical errors notified to admins

---

## Compliance Rules

### Rule 18.1: Data Retention
- **AUDIT LOGS**: Retained for 7 years
- **USER DATA**: Retained until account deletion
- **ARCHIVAL**: Old data archived to cold storage
- **DELETION**: Data deletion requests processed within 30 days

### Rule 18.2: GDPR Compliance
- **RIGHT TO ACCESS**: Users can export their data
- **RIGHT TO ERASURE**: Users can request data deletion
- **DATA MINIMIZATION**: Only collect necessary data
- **CONSENT**: Explicit consent for data processing
- **PORTABILITY**: Data exportable in machine-readable format

### Rule 18.3: Audit Trail
- **REQUIRED**: All data modifications logged
- **IMMUTABLE**: Audit logs cannot be modified
- **INTEGRITY**: SHA-256 checksums for verification
- **ACCESS**: Audit logs accessible to authorized users only
- **RETENTION**: Audit logs retained for 7 years

### Rule 18.4: Financial Compliance
- **INVOICES**: All sales generate invoices (if enabled)
- **TAX RECORDS**: Tax records maintained for compliance
- **REPORTS**: Financial reports available for tax filing
- **RETENTION**: Financial records retained for 7 years

### Rule 18.5: Health Records Compliance
- **REQUIRED**: Health records maintained for all animals
- **VACCINATION**: Vaccination records tracked
- **TREATMENT**: Treatment records with withdrawal periods
- **RETENTION**: Health records retained for animal lifetime + 2 years

---

## Summary

These rules govern the entire iFarm system, ensuring:
- ✅ **Data Integrity**: All data is valid and consistent
- ✅ **Security**: Multi-layered security enforcement
- ✅ **Performance**: Optimized queries and caching
- ✅ **Compliance**: Legal and regulatory compliance
- ✅ **Scalability**: System scales from 1 to 10,000+ users
- ✅ **Reliability**: Error handling and validation at all layers
- ✅ **Traceability**: Complete audit trail for all actions

**All rules are enforced at:**
- Database level (constraints, indexes)
- Application level (services, validators)
- API level (permissions, validation)
- Middleware level (tenant isolation, device tracking)

**Rule Violations:**
- Critical violations logged and alerted
- Data integrity violations prevented at database level
- Security violations trigger immediate actions (lockout, 2FA, etc.)

---

## Rule Maintenance

### Updating Rules
- Rules can be updated as business requirements change
- All rule changes MUST be documented
- Rule changes MUST be tested before deployment
- Rule changes MUST be communicated to team

### Rule Documentation
- All rules documented in this file
- Rules referenced in code comments where applicable
- Rules enforced in tests
- Rules reviewed quarterly

---

**Last Updated**: November 2024  
**Next Review**: February 2025


