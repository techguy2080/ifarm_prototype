# iFarm Backend Architecture Plan - Complete Documentation

## Overview

This comprehensive backend plan provides a complete Django monolith architecture for the iFarm livestock management system. The plan is divided into 7 parts for easy navigation and to prevent documentation overload.

**Status**: ✅ Complete  
**Version**: 1.0.0  
**Last Updated**: November 2024

---

## Document Structure

### 📘 [BACKEND_PLAN.md](./BACKEND_PLAN.md)
**Foundation & Architecture**

- Project overview and key design principles
- Technology stack (Django, PostgreSQL, Redis, Kafka, Celery)
- High-level system architecture diagrams
- Multi-tenant architecture flow
- **🎯 Solo Farm Owner Operations** (NEW - complete self-management capabilities)
- Complete app structure (24 Django apps)
- App categories and responsibilities

**Key Topics:**
- Multi-tenant design
- Hybrid RBAC/ABAC permission system
- Event-driven architecture
- Scalability considerations
- **Solo farm owner support (1 owner + 0 workers = fully functional)**

---

### 📗 [BACKEND_PLAN_PART2.md](./BACKEND_PLAN_PART2.md)
**Core Infrastructure Apps**

**Apps Covered:**
1. **Core App**: Base models, managers, and middleware
   - BaseModel, TenantModel, FarmModel
   - TenantManager, FarmManager
   - TenantMiddleware, PermissionCheckMiddleware, DeviceTrackingMiddleware

2. **Tenants App**: Multi-tenant management
   - Tenant model with subscription integration
   - TenantService for operations
   - Usage stats and limits enforcement

3. **Users App**: User management and authentication
   - Custom User model (AbstractUser) - **Authentication & Security only**
   - Profile model - **Personal Information & Preferences (User-Profile Separation Pattern)**
   - UserSession
   - IdP integration (OAuth2, OIDC, SAML)
   - MFA support, email verification

**Key Features:**
- **Industry-standard User-Profile Separation Pattern**
- Thread-local tenant context
- Automatic query filtering
- Custom managers for multi-tenancy
- Comprehensive user authentication

---

### 📙 [BACKEND_PLAN_PART3.md](./BACKEND_PLAN_PART3.md)
**Domain-Specific Apps (Part 1)**

**Apps Covered:**
1. **Farms App**: Farm locations and user associations
   - Farm model with geo-coordinates
   - UserFarm associations

2. **Animals App**: Animal lifecycle management
   - Animal model with lineage tracking
   - AnimalHistory for point-in-time queries
   - Castration tracking

3. **Production App**: **Enhanced milk production tracking**
   - **Multiple sessions per day** (morning, evening, midday)
   - **Unit-level tracking** with exact quantities
   - **Quality metrics**: fat content, protein, SCC, pH, temperature
   - **Milking details**: method, duration, milker
   - **Health indicators**: udder condition, milk appearance
   - **DailyProductionSummary** for fast aggregation
   - **Automatic summary updates** via signals

4. **Veterinary App**: Health management
   - HealthCheck, Vaccination, Treatment models
   - Comprehensive vital signs tracking

**Key Features:**
- Per-animal, per-day production tracking
- Session-level milk quality data
- Automatic daily aggregation
- Complete veterinary records

---

### 📕 [BACKEND_PLAN_PART4.md](./BACKEND_PLAN_PART4.md)
**Domain-Specific Apps (Part 2) & Financial System**

**Apps Covered:**
1. **Breeding App**: Breeding and pregnancy tracking
   - BreedingRecord with internal/external sires
   - Hire agreement integration
   - Offspring tracking

2. **Financial App**: Complete financial management
   - **Expense with Approval Workflow**
     - Pending, approved, rejected statuses
     - ExpenseHistory for audit trail
     - Auto-approval for owners
     - Notification system for approvals
   
   - **Sales Management**
     - AnimalSale, ProductSale
     - Payment tracking
   
   - **Invoicing System**
     - SalesInvoice, PurchaseInvoice
     - InvoiceLineItem
     - PDF generation
     - Status tracking

   - **ExpenseApprovalService**
     - Submit, approve, reject workflows
     - Notification integration
     - Complete audit logging

**Key Features:**
- Multi-level expense approval
- Complete invoicing system
- Payment status tracking
- Financial audit trails

---

### 📘 [BACKEND_PLAN_PART5.md](./BACKEND_PLAN_PART5.md)
**System Apps: Security & Billing**

**Apps Covered:**
1. **Devices App**: Security and abuse prevention
   - Device fingerprinting
   - DeviceSession tracking
   - IPAddress reputation system
   - AbuseLog for violations
   - RateLimitRule configuration
   - SecurityAlert system
   
   **Services:**
   - DeviceFingerprintingService
   - AbuseDetectionService
   - RateLimitService

2. **Subscriptions App**: Billing management
   - SubscriptionPlan with limits
   - Subscription lifecycle management
   - Invoice generation
   - **Payment with idempotency** (prevents duplicate charges)
   - PaymentMethod storage
   - UsageLog for billing
   
   **Services:**
   - PaymentGatewayService (Stripe integration)
   - BillingService
   - UsageTrackingService

**Key Features:**
- Device tracking for security
- IP reputation scoring
- Rate limiting per user/tenant
- Idempotent payment processing
- Automated billing

---

### 📗 [BACKEND_PLAN_PART6.md](./BACKEND_PLAN_PART6.md)
**Supporting Apps: Audit, Analytics & Notifications**

**Apps Covered:**
1. **Audit App**: Compliance and traceability
   - AuditLog with complete context
     - User, tenant, farm tracking
     - Permission and delegation context
     - Policy evaluation details
     - Device and IP tracking
     - SHA-256 checksums for integrity
   - AuditLogArchive for long-term retention
   - AuditService for logging
   - Automatic archival tasks

2. **Analytics App**: Business intelligence
   - AnalyticsCache for performance
   - Report generation (PDF, Excel, CSV)
   - AnalyticsService for trends
   - Financial summaries
   - Production analytics

3. **Notifications App**: Multi-channel messaging
   - Notification model
   - Email, SMS, Push, In-app channels
   - Retry mechanism
   - Status tracking
   - Template system

**Key Features:**
- Immutable audit logs with checksums
- Maximum traceability for legal compliance
- Cached analytics for fast queries
- Async report generation
- Multi-channel notification delivery

---

### 📙 [BACKEND_PLAN_PART7.md](./BACKEND_PLAN_PART7.md)
**Integration Services & Deployment**

**Topics Covered:**
1. **Celery Configuration**
   - Task definitions
   - Beat schedule for recurring jobs
   - Common tasks:
     - Recurring billing
     - Trial expiration checks
     - Usage aggregation
     - Audit log archival
     - Session cleanup
     - Notification sending
     - Production summary updates

2. **Kafka Integration**
   - Producer/Consumer setup
   - Event topics
   - Cache invalidation via events
   - Signal integration
   - Real-time messaging

3. **Redis Integration**
   - Caching configuration
   - Session storage
   - Permission caching patterns
   - Query result caching
   - Rate limiting

4. **Supabase Storage**
   - Multi-bucket configuration
   - SupabaseStorageService
   - File upload/delete
   - Signed URLs for private files
   - Tenant-organized storage

5. **Database Design Patterns**
   - Indexing strategy
   - Query optimization
   - select_related/prefetch_related usage

6. **API Design**
   - RESTful structure
   - ViewSet examples
   - Custom actions
   - Serializers

7. **Deployment (Hostinger KVM 2)**
   - Server specifications (2 CPU, 4GB RAM)
   - Optimized PostgreSQL config
   - Docker Compose setup
   - Gunicorn with 4 workers
   - Celery with 2 workers
   - Nginx reverse proxy

---

## Key Achievements

### ✅ Multi-Tenant Architecture
- Automatic tenant filtering via custom managers
- Thread-local context for request isolation
- Complete data separation between tenants

### ✅ Hybrid RBAC/ABAC System
- Permission library (immutable permissions)
- Role templates (pre-defined roles)
- Custom roles (tenant-specific)
- ABAC policies (conditional access)
- Time-based restrictions
- Delegation support

### ✅ Enhanced Production Tracking
- **Multiple milking sessions per day**
- **Unit-level per-animal per-day tracking**
- Quality metrics (fat, protein, SCC, pH, etc.)
- Automatic daily summaries
- Fast aggregation queries

### ✅ Financial Management
- **Expense approval workflow** (pending → approved/rejected)
- Complete invoicing system (sales & purchases)
- Payment tracking with idempotency
- Audit trails for all financial transactions

### ✅ Security & Compliance
- Device fingerprinting and tracking
- IP reputation system
- Rate limiting (per user, per tenant, per IP)
- Abuse detection and logging
- **Maximum traceability** with checksums
- Comprehensive audit logs
- 7-year audit log retention

### ✅ Subscription & Billing
- Multiple plan tiers
- Usage-based limits enforcement
- Automated recurring billing
- Trial management
- **Idempotent payment processing** (prevents duplicates)
- Multiple payment methods

### ✅ Integration Services
- **Celery**: Async task processing
- **Kafka**: Event-driven messaging
- **Redis**: Caching and sessions
- **Supabase**: Object storage with separate buckets

### ✅ Deployment Ready
- Optimized for Hostinger KVM 2 (2 CPU, 4GB RAM)
- Docker Compose configuration
- Production-ready settings
- Horizontal scaling support

---

## App Count Summary

**Total: 24 Django Apps**

**Core Infrastructure (4):**
- core, tenants, users, permissions

**Domain-Specific (12):**
- farms, animals, breeding, external_farms
- activities, production, weaning, veterinary
- inventory, financial, disposal, media

**Supporting (5):**
- invitations, delegations, audit, analytics, notifications

**System (3):**
- devices, subscriptions, api

---

## Technology Stack Summary

| Category | Technology |
|----------|------------|
| **Framework** | Django 4.2+ |
| **Language** | Python 3.11+ |
| **Database** | PostgreSQL 15+ |
| **API** | Django REST Framework |
| **Cache** | Redis 7+ |
| **Task Queue** | Celery 5+ |
| **Message Queue** | Kafka |
| **Storage** | Supabase Storage |
| **Server** | Gunicorn, Nginx |
| **Container** | Docker, Docker Compose |

---

## Scalability Estimates

### Hostinger KVM 2 (2 CPU, 4GB RAM)
- **Tenants**: 50-100
- **Users**: 500-1,000
- **Farms**: 200-500
- **Animals**: 5,000-10,000
- **Daily Requests**: 50,000-100,000

### With Optimization
- Caching (Redis)
- Database indexing
- Query optimization
- Read replicas
- Horizontal scaling

Can support **10x these numbers**.

---

## Next Steps

1. **Set up development environment**
   - Install dependencies
   - Configure PostgreSQL, Redis, Kafka
   - Set up Supabase Storage

2. **Create Django project**
   - Initialize project structure
   - Create all 24 apps
   - Configure settings for multi-tenancy

3. **Implement models**
   - Start with core infrastructure
   - Add domain models
   - Create migrations

4. **Build services**
   - Implement business logic
   - Add signal handlers
   - Configure Celery tasks

5. **Develop API**
   - Create serializers
   - Build ViewSets
   - Add custom actions

6. **Testing**
   - Unit tests
   - Integration tests
   - Load testing

7. **Deployment**
   - Set up Docker Compose
   - Configure Nginx
   - Deploy to Hostinger KVM 2

---

## Documentation Quality

- ✅ Complete app structure
- ✅ Detailed model definitions
- ✅ Service layer patterns
- ✅ Signal integrations
- ✅ Celery task examples
- ✅ Kafka event patterns
- ✅ Redis caching strategies
- ✅ API design patterns
- ✅ Deployment configuration
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Database design patterns

---

## Support

For questions or clarifications about any part of this backend plan:
1. Refer to the specific part document
2. Check Django documentation for framework details
3. Review integration service docs (Celery, Kafka, Redis, Supabase)

---

**Status**: Complete and ready for implementation! 🚀

