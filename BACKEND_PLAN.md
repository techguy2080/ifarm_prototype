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


