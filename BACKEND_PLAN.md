# iFarm Backend - Django Monolith Architecture Plan

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: Architecture Plan

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [App Structure](#app-structure)
5. [Core Infrastructure Apps](#core-infrastructure-apps)
6. [Domain-Specific Apps](#domain-specific-apps)
7. [Supporting Apps](#supporting-apps)
8. [System Apps](#system-apps)
9. [Database Design](#database-design)
10. [API Design](#api-design)
11. [Authentication & Authorization](#authentication--authorization)
12. [Integration Services](#integration-services)
13. [Deployment Strategy](#deployment-strategy)

---

## Overview

The iFarm backend is a Django monolith designed to provide a scalable, secure, and maintainable platform for multi-tenant livestock management. The system uses a modular app structure within a single codebase, enabling:

- **Strict multi-tenant isolation** with tenant-scoped data access
- **Hybrid RBAC/ABAC permission system** for fine-grained access control
- **Event-driven architecture** using Kafka for inter-app communication
- **Asynchronous task processing** with Celery for background jobs
- **Comprehensive audit logging** for compliance and traceability
- **Device tracking and security** to prevent abuse
- **Subscription and billing management** with payment gateway integration

### Key Design Principles

1. **Multi-Tenancy First**: Every model enforces tenant isolation
2. **Security by Default**: Defense-in-depth with multiple security layers
3. **Scalability**: Horizontal scaling with stateless services
4. **Maintainability**: Clear app boundaries with minimal coupling
5. **Traceability**: Complete audit trail for all actions
6. **Performance**: Caching, indexing, and query optimization
7. **Solo Farm Owner Support** 🎯: Full functionality for single-user operations
   - Zero worker requirement - owners can manage everything alone
   - All features accessible without hiring workers
   - Auto-approval workflows for solo owners
   - Scales from 1 owner to 10,000+ users
   - No artificial limitations for small farms
8. **Flexible Permission Delegation** 🔑: Owners have full delegation control
   - Delegate individual permissions or entire roles
   - Time-bound and revocable access grants
   - Resource and action restrictions
   - Complete audit trail for compliance
   - Emergency access management
9. **Farm-Level Access Control** 🏢: Strict farm assignment and data isolation
   - Users only see farms explicitly assigned by owner
   - Multi-layered security enforcement (middleware, managers, API)
   - Granular access levels (read, write, admin) per farm
   - Automatic farm-scoped query filtering
   - Supports 1 to 1000+ farms per tenant

---

## Technology Stack

### Core Technologies
- **Django 4.2+**: Web framework
- **Python 3.11+**: Programming language
- **PostgreSQL 15+**: Primary database with JSONB support
- **Django REST Framework (DRF)**: API development
- **Redis 7+**: Caching and session storage
- **Celery 5+**: Asynchronous task queue
- **Kafka**: Event streaming and message queue

### Storage & Media
- **Supabase Storage**: Object storage for media files (S3-compatible)
- **PostgreSQL**: Full-text search with pg_trgm

### Authentication & Security
- **JWT**: Token-based authentication
- **OAuth2/OIDC**: External identity provider integration
- **SAML**: Enterprise SSO support
- **django-guardian**: Object-level permissions

### Monitoring & Logging
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **ELK Stack**: Centralized logging
- **Sentry**: Error tracking

### Development Tools
- **Black**: Code formatting
- **Flake8**: Linting
- **MyPy**: Type checking
- **pytest**: Testing framework
- **Coverage.py**: Code coverage

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  (Next.js Frontend, Mobile Apps, Third-party Integrations)  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
│                    (Nginx/HAProxy)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Django Application                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   API Layer  │  │  Middleware  │  │   Services   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Django Apps                        │   │
│  │  (core, tenants, users, permissions, farms, etc.)  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │PostgreSQL│   │  Redis   │   │  Kafka   │
    └──────────┘   └──────────┘   └──────────┘
          │
          ▼
    ┌──────────┐
    │  Celery  │
    │ Workers  │
    └──────────┘
          │
          ▼
    ┌──────────────┐
    │   Supabase   │
    │   Storage    │
    └──────────────┘
```

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Request Flow                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  1. TenantMiddleware extracts tenant_id from JWT       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  2. All queries automatically filter by tenant_id       │
│     (using custom managers)                             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  3. Permission checks validate user access              │
│     (RBAC + ABAC evaluation)                            │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  4. Audit log records action with full context         │
└─────────────────────────────────────────────────────────┘
```

---

## Solo Farm Owner Operations 🎯

### Overview

The system is explicitly designed to support **solo farm owners** who manage their farms entirely alone without hiring workers. This is a first-class use case, not an afterthought.

### Minimum System Configuration

```python
# Fully functional system with ZERO workers

Minimum Setup:
├── 1 Tenant (Organization)
├── 1 User (Owner)
├── 1 or more Farms
└── 0 Workers ✅ (OPTIONAL)

# All features fully accessible
```

### Solo Owner Capabilities

**Complete Operational Control:**
```python
# Owner can perform ALL operations themselves

✅ Animal Management
   - Add, edit, delete animals
   - Track health, weight, medical records
   - Manage animal lifecycle (birth to disposal)

✅ Daily Operations
   - Log feeding activities
   - Record health checks
   - Perform vaccinations and treatments
   - Document breeding activities
   - Record castration procedures

✅ Production Recording
   - Log milk production (multiple sessions/day)
   - Track egg collection
   - Record wool shearing
   - Document honey harvesting
   - Enter quality metrics

✅ Health & Veterinary
   - Perform and log health checks
   - Administer medications
   - Record treatments
   - Track vaccinations
   - Manage deworming schedules

✅ Breeding Management
   - Record breeding events
   - Track pregnancies
   - Monitor due dates
   - Log births and offspring
   - Manage external breeding agreements

✅ Financial Operations
   - Record all sales (animals & products)
   - Submit expenses (auto-approved for owners)
   - Generate invoices
   - View financial reports and analytics

✅ Inventory Management
   - Track supplies, feed, medications
   - Monitor stock levels
   - Record inventory movements
   - Manage suppliers
```

### Auto-Approval Workflows

```python
# ExpenseService - Auto-approval for solo owners

class ExpenseService:
    @staticmethod
    def submit_expense(tenant_id, expense_data, submitted_by_user):
        expense = Expense.objects.create(
            tenant_id=tenant_id,
            **expense_data,
            submitted_by=submitted_by_user,
            status='pending'
        )
        
        # Check if submitter is an owner
        user_tenant = UserTenant.objects.filter(
            user=submitted_by_user,
            tenant_id=tenant_id
        ).first()
        
        if user_tenant and user_tenant.has_owner_role():
            # Auto-approve for owners
            expense.status = 'approved'
            expense.approved_by = submitted_by_user
            expense.approval_date = timezone.now()
            expense.save()
            
            logger.info(f"Expense {expense.expense_id} auto-approved for owner")
        
        return expense

# Similar auto-approval logic for:
# - Production records (no approval needed)
# - Activity logs (no approval needed)
# - Health records (no approval needed)
# - Sales records (no approval needed)
```

### Database Design for Solo Operations

```sql
-- NO tables require multiple users
-- NO foreign key constraints enforce worker presence
-- NO business logic mandates worker accounts

-- Example: Activities table supports solo owner
CREATE TABLE activities (
    activity_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id),
    farm_id INTEGER NOT NULL REFERENCES farms(farm_id),
    animal_id INTEGER REFERENCES animals(animal_id),
    activity_type VARCHAR(50) NOT NULL,
    activity_date DATE NOT NULL,
    notes TEXT,
    recorded_by_user_id INTEGER NOT NULL REFERENCES users(user_id),
    -- ✅ recorded_by can always be the owner
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Solo owner is perfectly valid:
INSERT INTO activities (tenant_id, farm_id, animal_id, activity_type, 
                        activity_date, recorded_by_user_id)
VALUES (1, 1, 15, 'feeding', '2024-11-17', 1);  -- Owner ID = 1
```

### Scaling Journey

```
Phase 1: Solo Owner (Day 1)
├── Owner creates account
├── Sets up farm
├── Adds animals
└── Manages everything alone ✅

Phase 2: Growing Farm (Months 1-6)
├── Owner continues solo operations
├── Farm inventory grows
├── Production increases
└── Still manageable alone ✅

Phase 3: Expansion (Months 6-12)
├── Owner considers hiring help
├── Invites first worker (optional)
├── Delegates some tasks
└── Monitors worker activities

Phase 4: Enterprise (Year 2+)
├── Multiple workers across farms
├── Managers oversee operations
├── Veterinarians handle health
└── Full team collaboration

# System supports ALL phases seamlessly
```

### API Endpoints - Solo Owner Friendly

```python
# All endpoints support owner as operator

# Production Recording
POST /api/v1/production/
{
    "farm_id": 1,
    "animal_id": 15,
    "production_type": "milk",
    "quantity": 25.5,
    "unit": "liters",
    "recorded_by_user_id": 1  # ✅ Owner themselves
}

# Expense Submission
POST /api/v1/expenses/
{
    "expense_type": "feed",
    "amount": 100000,
    "description": "Cattle feed",
    "submitted_by_user_id": 1  # ✅ Owner - auto-approved
}

# Health Check Logging
POST /api/v1/veterinary/health-checks/
{
    "animal_id": 15,
    "check_date": "2024-11-17",
    "health_status": "healthy",
    "performed_by_user_id": 1  # ✅ Owner themselves
}

# No worker required for ANY endpoint
```

### Frontend Experience

```typescript
// Owner dashboard shows ALL features
// No features hidden or disabled for solo operations

Solo Owner Sees:
✅ Full animal inventory management
✅ Complete production recording (all types)
✅ Comprehensive breeding management
✅ Full health tracking capabilities
✅ Complete financial management
✅ Inventory and supplies management
✅ Analytics and reporting (all data)
✅ User management (optional - can ignore if working alone)

// Navigation remains consistent
// No "add workers" prompts or barriers
// System never forces multi-user setup
```

### Benefits of Solo Owner Support

1. **Lower Barrier to Entry**: Small farmers can start immediately without hiring
2. **Cost Effective**: No forced labor costs for small operations
3. **Privacy**: Keep farm data completely private
4. **Simplicity**: No user management overhead if not needed
5. **Flexibility**: Add workers when ready, not when forced
6. **Authentic Use Case**: Many family farms are truly single-person operations

### Testing Solo Owner Workflows

```python
# Unit tests verify solo owner capabilities

def test_solo_owner_can_operate_alone():
    # Create tenant with single owner
    tenant = Tenant.objects.create(organization_name="Solo Farm")
    owner = User.objects.create_user(email="owner@farm.com")
    UserTenant.objects.create(tenant=tenant, user=owner)
    
    # Owner creates farm
    farm = Farm.objects.create(tenant=tenant, farm_name="My Farm")
    
    # Owner adds animal
    animal = Animal.objects.create(
        tenant=tenant,
        farm=farm,
        tag_number="COW001"
    )
    
    # Owner records production (no workers)
    production = Production.objects.create(
        tenant=tenant,
        farm=farm,
        animal=animal,
        production_type='milk',
        quantity=25.5,
        recorded_by=owner  # ✅ Owner themselves
    )
    
    # Owner submits expense (auto-approved)
    expense = ExpenseService.submit_expense(
        tenant_id=tenant.tenant_id,
        expense_data={'expense_type': 'feed', 'amount': 50000},
        submitted_by_user=owner
    )
    
    assert expense.status == 'approved'  # ✅ Auto-approved
    assert expense.approved_by == owner   # ✅ By themselves
    
    # Verify zero workers required
    worker_count = UserTenant.objects.filter(
        tenant=tenant
    ).exclude(user=owner).count()
    
    assert worker_count == 0  # ✅ No workers needed
```

---

## Owner/Admin Permission Delegation 🎯

### Overview

Owners and administrators have **full control over permission delegation**, enabling them to temporarily or permanently grant specific permissions to users without changing their roles. This provides maximum flexibility for managing access control.

### Delegation Capabilities

**Owners/Admins Can:**
```python
✅ Delegate Individual Permissions
   - Grant specific permissions to users
   - No need to create custom roles
   - Ideal for one-off or temporary needs

✅ Delegate Entire Roles
   - Grant all permissions from a role
   - Temporary role elevation
   - Time-bound access

✅ Delegate With Restrictions
   - Time restrictions (start/end dates)
   - Resource restrictions (specific animals, farms)
   - Action restrictions (read-only vs full access)

✅ Revoke Delegations Anytime
   - Instant revocation
   - No grace period needed
   - Immediate access removal

✅ Audit All Delegations
   - Complete delegation history
   - Who delegated what to whom
   - When and why delegations were created
```

### Delegation Types

#### 1. Permission Delegation
Grant specific permissions without changing the user's role:

```python
# Example: Grant temporary 'delete_animals' permission to a manager

from delegations.models import Delegation
from delegations.services import DelegationService

delegation = DelegationService.create_delegation(
    tenant_id=1,
    delegator_user_id=1,  # Owner
    delegate_user_id=5,   # Manager who needs temporary permission
    delegation_type='permission',
    permissions=['delete_animals'],
    start_date=timezone.now(),
    end_date=timezone.now() + timedelta(days=7),  # 7-day temporary access
    reason="Temporary permission for farm cleanup project"
)

# Manager now has delete_animals permission for 7 days
# After 7 days, permission automatically expires
# Owner can revoke anytime before expiration
```

#### 2. Role Delegation
Grant all permissions from a role temporarily:

```python
# Example: Elevate worker to manager role while regular manager is on leave

delegation = DelegationService.create_delegation(
    tenant_id=1,
    delegator_user_id=1,  # Owner
    delegate_user_id=10,  # Worker
    delegation_type='role',
    delegated_role_id=3,  # Manager role
    start_date=datetime(2024, 12, 1),
    end_date=datetime(2024, 12, 15),  # 2 weeks
    reason="Acting manager while John is on vacation"
)

# Worker has full manager permissions for 2 weeks
# Automatically reverts after end_date
```

#### 3. Full Access Delegation
Grant complete access (owner-level) temporarily:

```python
# Example: Grant full access to trusted accountant for year-end audit

delegation = DelegationService.create_delegation(
    tenant_id=1,
    delegator_user_id=1,  # Owner
    delegate_user_id=8,   # Accountant
    delegation_type='full_access',
    start_date=datetime(2024, 12, 20),
    end_date=datetime(2025, 1, 10),  # 3 weeks
    reason="Year-end financial audit - needs full system access"
)

# Accountant has owner-level permissions for audit period
# Perfect for external consultants or temporary full access needs
```

### Delegation with Restrictions

#### Time Restrictions
```python
# Delegation only active during specific hours

delegation = DelegationService.create_delegation(
    tenant_id=1,
    delegator_user_id=1,
    delegate_user_id=7,
    delegation_type='permission',
    permissions=['edit_health', 'log_health_checks'],
    start_date=datetime(2024, 11, 17),
    end_date=datetime(2024, 12, 31),
    restrictions={
        'time_restriction': {
            'start_time': '08:00',  # 8 AM
            'end_time': '17:00',    # 5 PM
            'days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
    },
    reason="Vet tech only works weekdays 8 AM - 5 PM"
)

# Permission only works during business hours
# Access denied outside specified time windows
```

#### Resource Restrictions
```python
# Delegation limited to specific animals or farms

delegation = DelegationService.create_delegation(
    tenant_id=1,
    delegator_user_id=1,
    delegate_user_id=12,
    delegation_type='permission',
    permissions=['edit_animals', 'delete_animals'],
    farm_id=3,  # Limited to specific farm
    restrictions={
        'resource_restriction': {
            'animal_ids': [101, 102, 103, 104, 105]  # Only these 5 animals
        }
    },
    reason="Clean up project for Farm 3 - specific animals only"
)

# User can only edit/delete specified animals on Farm 3
# Other animals remain protected
```

#### Action Restrictions
```python
# Delegation limited to specific actions (read-only, etc.)

delegation = DelegationService.create_delegation(
    tenant_id=1,
    delegator_user_id=1,
    delegate_user_id=15,
    delegation_type='permission',
    permissions=['view_financial_reports'],
    restrictions={
        'action_restriction': ['view', 'read'],  # No edit/delete
        'resource_restriction': {
            'report_types': ['sales', 'production']  # Can't see expenses
        }
    },
    reason="External consultant - read-only sales & production data"
)

# Limited to viewing specific report types only
# Cannot modify or delete anything
```

### Delegation Management Service

```python
# delegations/services.py

class DelegationService:
    @staticmethod
    @transaction.atomic
    def create_delegation(tenant_id, delegator_user_id, delegate_user_id,
                         delegation_type, permissions=None, delegated_role_id=None,
                         start_date=None, end_date=None, farm_id=None,
                         restrictions=None, reason=None):
        """
        Create permission delegation
        
        Args:
            tenant_id: Tenant ID
            delegator_user_id: User creating delegation (must be owner/admin)
            delegate_user_id: User receiving delegation
            delegation_type: 'permission', 'role', or 'full_access'
            permissions: List of permission IDs (for permission type)
            delegated_role_id: Role ID (for role type)
            start_date: When delegation becomes active
            end_date: When delegation expires
            farm_id: Optional farm restriction
            restrictions: Optional time/resource/action restrictions
            reason: Why delegation was created (for audit)
        
        Returns:
            Delegation object
        """
        # Verify delegator has authority
        if not UserService.has_permission(delegator_user_id, 'manage_users'):
            raise PermissionError("Only owners/admins can create delegations")
        
        # Validate delegate exists in tenant
        if not UserTenant.objects.filter(
            user_id=delegate_user_id,
            tenant_id=tenant_id
        ).exists():
            raise ValueError("Delegate user not in tenant")
        
        # Create delegation
        delegation = Delegation.objects.create(
            tenant_id=tenant_id,
            delegator_user_id=delegator_user_id,
            delegate_user_id=delegate_user_id,
            delegation_type=delegation_type,
            role_id=delegated_role_id,
            farm_id=farm_id,
            start_date=start_date or timezone.now(),
            end_date=end_date,
            reason=reason,
            restrictions=restrictions or {},
            status='active'
        )
        
        # Add permissions if permission delegation
        if delegation_type == 'permission' and permissions:
            for permission_id in permissions:
                DelegationPermission.objects.create(
                    delegation=delegation,
                    permission_id=permission_id
                )
        
        # Publish delegation event
        kafka_producer.send('delegation.created', {
            'delegation_id': delegation.delegation_id,
            'tenant_id': tenant_id,
            'delegator_id': delegator_user_id,
            'delegate_id': delegate_user_id,
            'type': delegation_type,
            'timestamp': timezone.now().isoformat()
        })
        
        # Log to audit
        AuditService.log(
            action='delegation_created',
            user_id=delegator_user_id,
            tenant_id=tenant_id,
            entity_type='delegation',
            entity_id=delegation.delegation_id,
            changes={
                'delegation_type': delegation_type,
                'delegate': delegate_user_id,
                'reason': reason
            }
        )
        
        # Invalidate delegate's permission cache
        cache.delete(f'user_permissions_{delegate_user_id}')
        
        return delegation
    
    @staticmethod
    def revoke_delegation(delegation_id, revoked_by_user_id):
        """Revoke active delegation"""
        delegation = Delegation.objects.get(pk=delegation_id)
        
        # Verify revoker has authority (delegator or owner)
        if delegation.delegator_user_id != revoked_by_user_id:
            if not UserService.has_permission(revoked_by_user_id, 'manage_users'):
                raise PermissionError("Only delegator or admin can revoke")
        
        delegation.status = 'revoked'
        delegation.revoked_at = timezone.now()
        delegation.revoked_by_user_id = revoked_by_user_id
        delegation.save()
        
        # Publish event
        kafka_producer.send('delegation.revoked', {
            'delegation_id': delegation_id,
            'revoked_by': revoked_by_user_id,
            'timestamp': timezone.now().isoformat()
        })
        
        # Log to audit
        AuditService.log(
            action='delegation_revoked',
            user_id=revoked_by_user_id,
            tenant_id=delegation.tenant_id,
            entity_type='delegation',
            entity_id=delegation_id
        )
        
        # Invalidate delegate's permission cache
        cache.delete(f'user_permissions_{delegation.delegate_user_id}')
        
        return delegation
    
    @staticmethod
    def check_delegation_validity(delegation):
        """Check if delegation is currently valid"""
        now = timezone.now()
        
        # Check status
        if delegation.status != 'active':
            return False
        
        # Check dates
        if delegation.start_date > now:
            return False  # Not started yet
        
        if delegation.end_date and delegation.end_date < now:
            # Auto-expire
            delegation.status = 'expired'
            delegation.save()
            return False
        
        # Check time restrictions
        if delegation.restrictions.get('time_restriction'):
            time_restrict = delegation.restrictions['time_restriction']
            current_time = now.time()
            current_day = now.strftime('%A').lower()
            
            if 'days' in time_restrict and current_day not in time_restrict['days']:
                return False
            
            if 'start_time' in time_restrict and 'end_time' in time_restrict:
                start = datetime.strptime(time_restrict['start_time'], '%H:%M').time()
                end = datetime.strptime(time_restrict['end_time'], '%H:%M').time()
                if not (start <= current_time <= end):
                    return False
        
        return True
    
    @staticmethod
    def get_user_active_delegations(user_id):
        """Get all active delegations for a user"""
        delegations = Delegation.objects.filter(
            delegate_user_id=user_id,
            status='active',
            start_date__lte=timezone.now()
        ).select_related('delegator', 'role')
        
        # Filter by validity (time restrictions, etc.)
        valid_delegations = [
            d for d in delegations 
            if DelegationService.check_delegation_validity(d)
        ]
        
        return valid_delegations
```

### Permission Evaluation with Delegations

```python
# permissions/services.py

class PermissionService:
    @staticmethod
    def check_permission(user_id, tenant_id, permission_name, 
                        resource_id=None, resource_type=None):
        """
        Check if user has permission (including delegations)
        
        Evaluation order:
        1. User's direct role permissions
        2. Active delegations
        3. ABAC policies
        """
        # Check cache first
        cache_key = f'permission_{user_id}_{permission_name}_{resource_id}'
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        
        # 1. Check direct role permissions
        has_direct = UserRole.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            role__role_permissions__permission__name=permission_name
        ).exists()
        
        if has_direct:
            cache.set(cache_key, True, timeout=300)
            return True
        
        # 2. Check active delegations
        active_delegations = DelegationService.get_user_active_delegations(user_id)
        
        for delegation in active_delegations:
            # Check if delegation grants this permission
            if delegation.delegation_type == 'full_access':
                cache.set(cache_key, True, timeout=60)  # Shorter cache for delegations
                return True
            
            elif delegation.delegation_type == 'role':
                role_has_permission = RolePermission.objects.filter(
                    role=delegation.role,
                    permission__name=permission_name
                ).exists()
                
                if role_has_permission:
                    # Check resource restrictions
                    if DelegationService.check_resource_restriction(
                        delegation, resource_id, resource_type
                    ):
                        cache.set(cache_key, True, timeout=60)
                        return True
            
            elif delegation.delegation_type == 'permission':
                permission_delegated = DelegationPermission.objects.filter(
                    delegation=delegation,
                    permission__name=permission_name
                ).exists()
                
                if permission_delegated:
                    if DelegationService.check_resource_restriction(
                        delegation, resource_id, resource_type
                    ):
                        cache.set(cache_key, True, timeout=60)
                        return True
        
        # 3. Check ABAC policies (if needed)
        policy_result = PolicyService.evaluate_policies(
            user_id, tenant_id, permission_name, resource_id, resource_type
        )
        
        cache.set(cache_key, policy_result, timeout=300)
        return policy_result
```

### Frontend Delegation Management

#### Delegation Dashboard
```typescript
// app/dashboard/delegations/page.tsx

// Owners see:
- List of all delegations they've created
- List of delegations created by others (if admin)
- Active delegations count
- Expired delegations
- Revoked delegations

// Features:
✅ Create new delegation
✅ View delegation details
✅ Revoke active delegations
✅ Filter by status, type, date range
✅ Search by delegate name
✅ Export delegation history
```

#### Create Delegation Form
```typescript
// app/dashboard/delegations/create/page.tsx

// Step 1: Select Delegate
- Choose user to receive delegation
- View user's current permissions

// Step 2: Choose Delegation Type
- Permission delegation (specific permissions)
- Role delegation (entire role)
- Full access (owner-level)

// Step 3: Set Time Period
- Start date/time
- End date/time
- Or: Indefinite (no end date)

// Step 4: Add Restrictions (Optional)
- Time restrictions (hours, days)
- Resource restrictions (farms, animals)
- Action restrictions (read-only, etc.)

// Step 5: Provide Reason
- Required: Why is this delegation needed?
- Appears in audit logs

// Step 6: Review & Confirm
- Summary of delegation
- Preview permission changes
- Confirm creation
```

### Use Cases

#### Use Case 1: Temporary Manager Elevation
```
Scenario: Regular manager going on 2-week vacation

Solution:
1. Owner creates role delegation
2. Elevates senior worker to manager role
3. Set 2-week time period
4. Delegation auto-expires when regular manager returns
5. No permanent role changes needed

Benefits:
✅ No manual role switching
✅ Automatic reversion
✅ Complete audit trail
✅ Can be revoked if needed
```

#### Use Case 2: Consultant Access
```
Scenario: External vet consultant needs access for 1 month

Solution:
1. Owner creates permission delegation
2. Grants health-related permissions only
3. Restricts to specific farm
4. Time-bound to consultation period
5. Auto-expires after contract ends

Benefits:
✅ Limited scope access
✅ No permanent user creation
✅ Automatic cleanup
✅ Resource-restricted
```

#### Use Case 3: Emergency Access
```
Scenario: Owner traveling, emergency requires farm access

Solution:
1. Owner remotely creates full access delegation
2. Grants trusted family member full permissions
3. Sets 3-day duration
4. Delegate handles emergency
5. Access automatically revokes when owner returns

Benefits:
✅ Instant access grant
✅ Full control for emergency
✅ Time-limited risk
✅ Remote management
```

#### Use Case 4: Project-Specific Access
```
Scenario: Farm cleanup project needs temporary delete permissions

Solution:
1. Owner creates permission delegation
2. Grants delete_animals permission
3. Restricts to specific animals (old/deceased records)
4. Time-bound to project duration
5. Revokes when cleanup complete

Benefits:
✅ Minimal permission grant
✅ Resource-restricted
✅ Project-specific
✅ No role modifications
```

### Audit Trail

Every delegation action is fully audited:

```python
# Audit log entries for delegation lifecycle

# Delegation created
AuditLog(
    action='delegation_created',
    user_id=owner_id,
    entity_type='delegation',
    entity_id=delegation_id,
    details={
        'delegator': 'John Owner',
        'delegate': 'Jane Worker',
        'type': 'permission',
        'permissions': ['edit_health', 'log_health_checks'],
        'start_date': '2024-12-01',
        'end_date': '2024-12-31',
        'reason': 'Temporary vet tech duties'
    }
)

# Delegation used (permission checked)
AuditLog(
    action='permission_checked',
    user_id=delegate_id,
    entity_type='animal',
    entity_id=animal_id,
    details={
        'permission': 'edit_health',
        'granted_via': 'delegation',
        'delegation_id': delegation_id,
        'action': 'updated health record'
    }
)

# Delegation revoked
AuditLog(
    action='delegation_revoked',
    user_id=owner_id,
    entity_type='delegation',
    entity_id=delegation_id,
    details={
        'reason': 'Project completed early',
        'original_end_date': '2024-12-31',
        'revoked_date': '2024-12-15'
    }
)

# Delegation expired
AuditLog(
    action='delegation_expired',
    entity_type='delegation',
    entity_id=delegation_id,
    details={
        'delegate': 'Jane Worker',
        'end_date': '2024-12-31',
        'type': 'automatic_expiration'
    }
)
```

### Benefits of Delegation System

1. **Flexibility**: Grant permissions without permanent role changes
2. **Security**: Time-bound and revocable access
3. **Granularity**: Specific permissions, resources, or time windows
4. **Audit Trail**: Complete history of all delegations
5. **Automation**: Auto-expiration and auto-revocation
6. **Emergency Access**: Quick access grants for urgent situations
7. **Compliance**: Meets regulatory requirements for access control
8. **Cost-Effective**: No need for complex role hierarchies

### API Endpoints

```python
# Delegation Management APIs

POST   /api/v1/delegations/                # Create delegation
GET    /api/v1/delegations/                # List delegations
GET    /api/v1/delegations/{id}/           # Get delegation details
PUT    /api/v1/delegations/{id}/revoke/    # Revoke delegation
DELETE /api/v1/delegations/{id}/           # Delete delegation record

# Permission checking with delegations
GET    /api/v1/permissions/check/          # Check if user has permission
GET    /api/v1/users/{id}/permissions/     # Get user's effective permissions
GET    /api/v1/users/{id}/delegations/     # Get user's active delegations
```

---

## Farm-Level Access Control 🏢

### Overview

The system implements **strict farm-level access control** to ensure users can only see and interact with farms they've been explicitly assigned to by the owner/tenant. This provides granular control over multi-farm operations.

### Farm Assignment Model

**UserFarm Association:**
```python
# from farms/models.py

class UserFarm(TenantModel):
    """
    User-Farm assignment
    Controls which users can access which farms
    """
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE)
    
    # Access level at this farm
    access_level = models.CharField(max_length=20, choices=[
        ('read', 'Read Only'),      # View only
        ('write', 'Read/Write'),    # Can add/edit data
        ('admin', 'Administrator'), # Full control of farm
    ], default='write')
    
    # Farm-specific role (optional)
    farm_role = models.CharField(max_length=50, choices=[
        ('manager', 'Farm Manager'),
        ('worker', 'Farm Worker'),
        ('vet', 'Veterinarian'),
        ('viewer', 'Viewer'),
    ], null=True, blank=True)
    
    # Assignment tracking
    assigned_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='farm_assignments_made'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_farms'
        unique_together = [('user', 'farm')]
        indexes = [
            models.Index(fields=['user', 'tenant']),
            models.Index(fields=['farm', 'is_active']),
            models.Index(fields=['user', 'is_active']),
        ]
```

### Owner Farm Assignment Control

**Owners Can:**
```python
✅ Assign Users to Farms
   - Choose which farms each user can access
   - Set access level (read/write/admin)
   - Assign farm-specific roles

✅ Remove Farm Access
   - Revoke user access to specific farms
   - Maintain access to other farms
   - Instant access removal

✅ Modify Farm Access
   - Change access levels
   - Update farm-specific roles
   - Adjust permissions per farm

✅ View Farm Assignments
   - See who has access to each farm
   - Audit farm access history
   - Monitor access levels
```

### Farm Assignment Service

```python
# farms/services.py

class FarmService:
    @staticmethod
    @transaction.atomic
    def assign_user_to_farm(owner_user_id, user_id, farm_id, 
                           access_level='write', farm_role=None):
        """
        Assign user to farm (owner/admin only)
        
        Args:
            owner_user_id: Owner performing assignment
            user_id: User being assigned
            farm_id: Farm to assign to
            access_level: 'read', 'write', or 'admin'
            farm_role: Optional farm-specific role
        
        Returns:
            UserFarm object
        """
        # Verify owner has authority
        if not UserService.is_owner_or_admin(owner_user_id):
            raise PermissionError("Only owners/admins can assign farms")
        
        # Verify farm belongs to owner's tenant
        farm = Farm.objects.get(pk=farm_id)
        owner_tenant = User.objects.get(pk=owner_user_id).primary_tenant
        
        if farm.tenant_id != owner_tenant.tenant_id:
            raise PermissionError("Farm not in your tenant")
        
        # Verify user is in same tenant
        user_tenant = UserTenant.objects.filter(
            user_id=user_id,
            tenant_id=owner_tenant.tenant_id
        ).first()
        
        if not user_tenant:
            raise ValueError("User not in your tenant")
        
        # Create or update farm assignment
        user_farm, created = UserFarm.objects.update_or_create(
            user_id=user_id,
            farm_id=farm_id,
            defaults={
                'access_level': access_level,
                'farm_role': farm_role,
                'assigned_by_id': owner_user_id,
                'is_active': True
            }
        )
        
        # Publish event
        kafka_producer.send('farm.user_assigned', {
            'user_farm_id': user_farm.user_farm_id,
            'user_id': user_id,
            'farm_id': farm_id,
            'access_level': access_level,
            'assigned_by': owner_user_id,
            'timestamp': timezone.now().isoformat()
        })
        
        # Log to audit
        AuditService.log(
            action='user_assigned_to_farm',
            user_id=owner_user_id,
            tenant_id=farm.tenant_id,
            entity_type='user_farm',
            entity_id=user_farm.user_farm_id,
            changes={
                'user': user_id,
                'farm': farm_id,
                'access_level': access_level,
                'farm_role': farm_role
            }
        )
        
        # Invalidate user's farm cache
        cache.delete(f'user_farms_{user_id}')
        
        return user_farm
    
    @staticmethod
    def remove_user_from_farm(owner_user_id, user_id, farm_id):
        """Remove user's access to farm"""
        # Verify authority
        if not UserService.is_owner_or_admin(owner_user_id):
            raise PermissionError("Only owners/admins can remove farm access")
        
        user_farm = UserFarm.objects.get(user_id=user_id, farm_id=farm_id)
        user_farm.is_active = False
        user_farm.save()
        
        # Or permanently delete
        # user_farm.delete()
        
        # Publish event
        kafka_producer.send('farm.user_removed', {
            'user_id': user_id,
            'farm_id': farm_id,
            'removed_by': owner_user_id,
            'timestamp': timezone.now().isoformat()
        })
        
        # Log to audit
        AuditService.log(
            action='user_removed_from_farm',
            user_id=owner_user_id,
            entity_type='user_farm',
            changes={'user': user_id, 'farm': farm_id}
        )
        
        # Invalidate cache
        cache.delete(f'user_farms_{user_id}')
    
    @staticmethod
    def get_user_accessible_farms(user_id):
        """Get all farms user has access to"""
        # Check cache first
        cache_key = f'user_farms_{user_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Get assigned farms
        farm_ids = UserFarm.objects.filter(
            user_id=user_id,
            is_active=True
        ).values_list('farm_id', flat=True)
        
        farms = Farm.objects.filter(
            farm_id__in=farm_ids,
            is_active=True
        )
        
        # Cache for 5 minutes
        cache.set(cache_key, list(farms), timeout=300)
        
        return farms
```

### FarmManager - Automatic Farm Filtering

**All farm-scoped queries automatically filter by accessible farms:**

```python
# core/managers.py

class FarmManager(models.Manager):
    """
    Custom manager for farm-scoped models
    Automatically filters by user's accessible farms
    """
    def get_queryset(self):
        """Get base queryset"""
        return super().get_queryset()
    
    def for_user(self, user_id):
        """
        Filter queryset by user's accessible farms
        
        Usage:
            Animal.objects.for_user(user_id)
            Production.objects.for_user(user_id)
            Expenses.objects.for_user(user_id)
        """
        # Get user's accessible farms
        accessible_farm_ids = UserFarm.objects.filter(
            user_id=user_id,
            is_active=True
        ).values_list('farm_id', flat=True)
        
        # Filter by those farms
        return self.get_queryset().filter(
            farm_id__in=accessible_farm_ids
        )
    
    def for_farm(self, farm_id):
        """Filter by specific farm"""
        return self.get_queryset().filter(farm_id=farm_id)
    
    def for_farms(self, farm_ids):
        """Filter by list of farms"""
        return self.get_queryset().filter(farm_id__in=farm_ids)


# Usage in models
class Animal(FarmModel):
    # ... fields ...
    
    objects = FarmManager()  # ✅ Automatic farm filtering
    
    class Meta:
        db_table = 'animals'

# Query examples
# ❌ DON'T DO THIS (sees all animals across all farms)
all_animals = Animal.objects.all()

# ✅ DO THIS (only sees accessible farms)
user_animals = Animal.objects.for_user(user_id)

# ✅ OR THIS (specific farm)
farm_animals = Animal.objects.for_farm(farm_id)
```

### FarmAccessMiddleware - Request-Level Filtering

```python
# core/middleware.py

class FarmAccessMiddleware:
    """
    Middleware to inject accessible farms into request
    Ensures all views respect farm-level access
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.user.is_authenticated:
            # Get user's accessible farms
            accessible_farms = FarmService.get_user_accessible_farms(
                request.user.user_id
            )
            
            # Inject into request for easy access
            request.accessible_farm_ids = [f.farm_id for f in accessible_farms]
            request.accessible_farms = accessible_farms
            
            # Check if user has any farms
            request.has_farm_access = len(accessible_farms) > 0
        else:
            request.accessible_farm_ids = []
            request.accessible_farms = []
            request.has_farm_access = False
        
        response = self.get_response(request)
        return response


# Usage in views
def get_animals(request):
    # Accessible farms already in request
    animals = Animal.objects.filter(
        farm_id__in=request.accessible_farm_ids
    )
    
    return JsonResponse({'animals': list(animals)})
```

### API Endpoints - Farm Assignment

```python
# farms/views.py

class FarmAssignmentViewSet(viewsets.ViewSet):
    """API for managing farm assignments"""
    
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    @action(detail=True, methods=['post'])
    def assign_user(self, request, pk=None):
        """
        Assign user to farm
        
        POST /api/v1/farms/{farm_id}/assign_user/
        {
            "user_id": 10,
            "access_level": "write",
            "farm_role": "worker"
        }
        """
        farm = self.get_object()
        user_id = request.data.get('user_id')
        access_level = request.data.get('access_level', 'write')
        farm_role = request.data.get('farm_role')
        
        user_farm = FarmService.assign_user_to_farm(
            owner_user_id=request.user.user_id,
            user_id=user_id,
            farm_id=farm.farm_id,
            access_level=access_level,
            farm_role=farm_role
        )
        
        return Response({
            'message': 'User assigned to farm successfully',
            'user_farm_id': user_farm.user_farm_id
        })
    
    @action(detail=True, methods=['post'])
    def remove_user(self, request, pk=None):
        """
        Remove user from farm
        
        POST /api/v1/farms/{farm_id}/remove_user/
        {
            "user_id": 10
        }
        """
        farm = self.get_object()
        user_id = request.data.get('user_id')
        
        FarmService.remove_user_from_farm(
            owner_user_id=request.user.user_id,
            user_id=user_id,
            farm_id=farm.farm_id
        )
        
        return Response({
            'message': 'User removed from farm successfully'
        })
    
    @action(detail=True, methods=['get'])
    def list_users(self, request, pk=None):
        """
        List all users assigned to farm
        
        GET /api/v1/farms/{farm_id}/list_users/
        """
        farm = self.get_object()
        
        user_farms = UserFarm.objects.filter(
            farm_id=farm.farm_id,
            is_active=True
        ).select_related('user', 'assigned_by')
        
        return Response({
            'users': [
                {
                    'user_id': uf.user.user_id,
                    'name': uf.user.full_name,
                    'email': uf.user.email,
                    'access_level': uf.access_level,
                    'farm_role': uf.farm_role,
                    'assigned_at': uf.assigned_at,
                    'assigned_by': uf.assigned_by.full_name if uf.assigned_by else None
                }
                for uf in user_farms
            ]
        })
```

### Data Isolation Examples

#### Animals - Farm-Scoped Access
```python
# animals/views.py

class AnimalViewSet(viewsets.ModelViewSet):
    """Animal management API"""
    
    def get_queryset(self):
        """Only return animals from accessible farms"""
        # Get user's accessible farms
        accessible_farm_ids = self.request.accessible_farm_ids
        
        # Filter animals by those farms
        return Animal.objects.filter(
            tenant_id=self.request.user.primary_tenant_id,
            farm_id__in=accessible_farm_ids,
            status='active'
        )
    
    def create(self, request):
        """Create animal - must be in accessible farm"""
        farm_id = request.data.get('farm_id')
        
        # Verify user has access to this farm
        if farm_id not in request.accessible_farm_ids:
            return Response(
                {'error': 'You do not have access to this farm'},
                status=403
            )
        
        # Create animal
        animal = Animal.objects.create(
            **request.data,
            tenant_id=request.user.primary_tenant_id
        )
        
        return Response({'animal_id': animal.animal_id})
```

#### Production - Farm-Scoped Access
```python
# production/views.py

class ProductionViewSet(viewsets.ModelViewSet):
    """Production records API"""
    
    def get_queryset(self):
        """Only return production from accessible farms"""
        return Production.objects.filter(
            tenant_id=self.request.user.primary_tenant_id,
            farm_id__in=self.request.accessible_farm_ids
        )
    
    def list(self, request):
        """List production records"""
        # Optional farm filter
        farm_id = request.query_params.get('farm_id')
        
        queryset = self.get_queryset()
        
        if farm_id:
            # Verify access
            if int(farm_id) not in request.accessible_farm_ids:
                return Response({'error': 'No access to farm'}, status=403)
            
            queryset = queryset.filter(farm_id=farm_id)
        
        return Response({'production': list(queryset.values())})
```

#### Financial - Farm-Scoped Access
```python
# financial/views.py

class ExpenseViewSet(viewsets.ModelViewSet):
    """Expense management API"""
    
    def get_queryset(self):
        """Only expenses from accessible farms"""
        return Expense.objects.filter(
            tenant_id=self.request.user.primary_tenant_id,
            farm_id__in=self.request.accessible_farm_ids
        )
    
    def get_summary(self, request):
        """Get expense summary - only accessible farms"""
        summary = Expense.objects.filter(
            tenant_id=request.user.primary_tenant_id,
            farm_id__in=request.accessible_farm_ids,
            status='approved'
        ).aggregate(
            total=Sum('amount'),
            count=Count('expense_id')
        )
        
        return Response(summary)
```

### Frontend Farm Selection

```typescript
// app/dashboard/components/FarmSelector.tsx

export function FarmSelector({ value, onChange }: FarmSelectorProps) {
  const [accessibleFarms, setAccessibleFarms] = useState<Farm[]>([]);
  
  useEffect(() => {
    // Fetch only farms user has access to
    fetch('/api/v1/users/me/farms/')
      .then(res => res.json())
      .then(data => {
        setAccessibleFarms(data.farms);
        
        // If user has only 1 farm, auto-select it
        if (data.farms.length === 1) {
          onChange(data.farms[0].farm_id);
        }
      });
  }, []);
  
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <MenuItem value="">All Accessible Farms</MenuItem>
      {accessibleFarms.map(farm => (
        <MenuItem key={farm.farm_id} value={farm.farm_id}>
          {farm.farm_name}
          {farm.access_level && (
            <Chip 
              label={farm.access_level} 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
        </MenuItem>
      ))}
    </Select>
  );
}
```

### Use Cases

#### Use Case 1: Multi-Farm Worker
```
Scenario: Worker assigned to 2 farms out of tenant's 5 farms

Setup:
- Tenant has 5 farms total
- Worker assigned to Farm A and Farm B only
- Owner assigns via farm management interface

Result:
✅ Worker sees only Farm A and Farm B in farm list
✅ Worker sees only animals from Farm A and B
✅ Worker can only record activities on Farm A and B
✅ Worker cannot see/access Farm C, D, or E
✅ All queries automatically filtered by accessible farms
```

#### Use Case 2: Farm-Specific Manager
```
Scenario: Manager responsible for single farm

Setup:
- Tenant has multiple farms
- Manager assigned to Farm 1 with 'admin' access level
- Owner restricts manager to this farm only

Result:
✅ Manager sees only Farm 1
✅ Manager has full control over Farm 1 data
✅ Manager cannot see other farms' data
✅ Manager can manage workers on Farm 1
✅ Financial reports show only Farm 1 data
```

#### Use Case 3: Veterinarian Multi-Farm Access
```
Scenario: Vet serves multiple farms

Setup:
- Vet assigned to Farm A, B, and C
- Access level: 'write' for health records
- Farm-specific role: 'vet'

Result:
✅ Vet sees animals from Farm A, B, and C
✅ Vet can update health records on all 3 farms
✅ Vet cannot access Farm D or E
✅ Vet's activities tracked per farm
✅ Each farm owner sees vet's work on their farm
```

#### Use Case 4: Temporary Farm Access
```
Scenario: Consultant needs temporary access to specific farm

Setup:
- Owner assigns consultant to Farm 2
- Access level: 'read' (view only)
- Time-bound via delegation (covered in delegation section)

Result:
✅ Consultant sees only Farm 2 data
✅ Read-only access to all Farm 2 records
✅ Cannot modify any data
✅ Access automatically revoked after project ends
✅ Complete audit trail of access
```

### Database Queries - Farm Filtering

**All farm-scoped queries must include accessible farms check:**

```sql
-- ❌ BAD: No farm filtering (security risk)
SELECT * FROM animals WHERE tenant_id = 1;

-- ✅ GOOD: Filtered by accessible farms
SELECT * FROM animals 
WHERE tenant_id = 1 
  AND farm_id IN (
    SELECT farm_id FROM user_farms 
    WHERE user_id = 10 AND is_active = TRUE
  );

-- ✅ EVEN BETTER: Using Common Table Expression
WITH accessible_farms AS (
  SELECT farm_id FROM user_farms
  WHERE user_id = 10 AND is_active = TRUE
)
SELECT a.* FROM animals a
INNER JOIN accessible_farms af ON a.farm_id = af.farm_id
WHERE a.tenant_id = 1 AND a.status = 'active';
```

### Security Enforcement

**Multiple layers of farm access control:**

```
Layer 1: Middleware
├── Injects accessible_farm_ids into request
├── Available to all views
└── Cached for performance

Layer 2: Custom Managers
├── FarmManager.for_user(user_id)
├── Automatic queryset filtering
└── Used by all farm-scoped models

Layer 3: API Permissions
├── Check farm_id in request data
├── Verify against accessible_farm_ids
└── Return 403 if no access

Layer 4: Database Indexes
├── Indexed on (tenant_id, farm_id)
├── Fast farm-based filtering
└── Optimized for multi-farm queries

Layer 5: Audit Logging
├── Log all farm access attempts
├── Track which farms user accesses
└── Alert on unauthorized access attempts
```

### Benefits of Farm-Level Access Control

1. **Granular Control**: Assign users to specific farms only
2. **Data Isolation**: Users can't see data from non-assigned farms
3. **Scalability**: Supports 1 to 1000+ farms per tenant
4. **Flexibility**: Different access levels per farm
5. **Security**: Multiple enforcement layers
6. **Audit Trail**: Complete history of farm assignments
7. **Performance**: Cached and indexed for speed
8. **User Experience**: Simplified interface showing only relevant farms

### API Endpoints

```python
# Farm Assignment Management

POST   /api/v1/farms/{id}/assign_user/       # Assign user to farm
POST   /api/v1/farms/{id}/remove_user/       # Remove user from farm
GET    /api/v1/farms/{id}/list_users/        # List farm users
PUT    /api/v1/farms/{id}/update_access/     # Update user's access level
GET    /api/v1/users/{id}/farms/             # Get user's accessible farms
GET    /api/v1/users/me/farms/               # Get current user's farms
```

---

## App Structure

### Project Structure

```
ifarm/
├── manage.py
├── requirements.txt
├── pytest.ini
├── .env.example
├── docker-compose.yml
├── Dockerfile
│
├── ifarm/                      # Project settings
│   ├── __init__.py
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── test.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── core/                       # Core infrastructure
├── tenants/                    # Tenant management
├── users/                      # User management
├── permissions/                # RBAC/ABAC system
├── farms/                      # Farm management
├── animals/                    # Animal management
├── breeding/                   # Breeding management
├── external_farms/             # External farm partnerships
├── activities/                 # Activity logging
├── production/                 # Production records
├── weaning/                    # Weaning records
├── veterinary/                 # Veterinary management
├── inventory/                  # Inventory management
├── financial/                  # Financial management
├── disposal/                   # Animal disposal
├── media/                      # Media management
├── invitations/                # User invitations
├── delegations/                # Permission delegation
├── audit/                      # Audit logging
├── analytics/                  # Analytics & reporting
├── notifications/              # Notification system
├── devices/                    # Device tracking & security
├── subscriptions/              # Subscription & billing
├── api/                        # API layer
└── celery_app/                 # Celery configuration
```

### App Categories

#### Core Infrastructure (4 apps)
- `core`: Base models, managers, middleware
- `tenants`: Multi-tenant management
- `users`: User management, authentication
- `permissions`: RBAC/ABAC system

#### Domain-Specific (12 apps)
- `farms`: Farm management
- `animals`: Animal lifecycle management
- `breeding`: Breeding and pregnancy tracking
- `external_farms`: External farm partnerships
- `activities`: Activity logging
- `production`: Production records (milk, eggs, wool, honey)
- `weaning`: Weaning records
- `veterinary`: Veterinary and health management
- `inventory`: Inventory and supplies
- `financial`: Financial management
- `disposal`: Animal disposal tracking
- `media`: Media file management

#### Supporting (5 apps)
- `invitations`: User invitation system
- `delegations`: Permission delegation
- `audit`: Audit logging
- `analytics`: Analytics and reporting
- `notifications`: Multi-channel notifications

#### System (3 apps)
- `devices`: Device tracking and security
- `subscriptions`: Subscription and billing
- `api`: REST API layer

---

## Core Infrastructure Apps

### 1. Core App

**Purpose**: Provides base models, managers, and utilities used across all apps.

#### Models

**BaseModel** - Abstract base for all models
```python
class BaseModel(models.Model):
    """Abstract base model with common fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
```

**TenantModel** - Base for tenant-scoped models
```python
class TenantModel(BaseModel):
    """Abstract base for tenant-scoped models"""
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    
    objects = TenantManager()  # Custom manager
    
    class Meta:
        abstract = True
```

**FarmModel** - Base for farm-scoped models
```python
class FarmModel(TenantModel):
    """Abstract base for farm-scoped models"""
    farm = models.ForeignKey('farms.Farm', on_delete=models.CASCADE)
    
    objects = FarmManager()  # Custom manager
    
    class Meta:
        abstract = True
```

**Continue in next chunk...**


