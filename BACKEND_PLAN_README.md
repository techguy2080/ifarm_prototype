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
- **Owner/Admin Permission Delegation** (NEW - temporary & permanent access control)
- **Farm-Level Access Control** (NEW - users see only assigned farms)
- **User Experience & Content Apps** (NEW - feedback, legal, help content)
- **Multi-Step Form Optimization** (NEW - wizard forms with Redis state management)
- Event-driven architecture
- Scalability considerations
- **Solo farm owner support (1 owner + 0 workers = fully functional)**

**Delegation Features:**
- ✅ Delegate individual permissions or entire roles
- ✅ Time-bound and resource-restricted access
- ✅ Revocable anytime with complete audit trail
- ✅ Emergency access management
- ✅ No permanent role changes needed

**Farm-Level Access Control Features:**
- ✅ Users only see farms assigned by owner/tenant
- ✅ Granular access levels (read, write, admin) per farm
- ✅ Automatic farm-scoped data filtering
- ✅ Multi-layered security enforcement
- ✅ Supports 1 to 1000+ farms per tenant

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

3. **Tax App** 🆕: Tax management and tracking (**Uganda-Specific - URA Compliant**)
   - **Tax Rate Configuration**
     - Tenant-specific or system-wide tax rates
     - Super admin and owner can set rates
     - **Default Uganda tax rates** (VAT 18%, Income Tax progressive rates)
     - Multiple tax types (VAT, Income Tax, Sales Tax, Withholding Tax)
     - Effective date management
     - Tax inclusive/exclusive calculation methods
     - **URA tax category codes**
   
   - **Tax Calculation**
     - Automatic tax calculation on sales/revenue
     - Manual tax calculation support
     - Links to source transactions (animal sales, product sales)
     - Historical tax rate tracking
   
   - **Tax Records & Reporting**
     - Aggregated tax records by period (monthly, quarterly, yearly)
     - Tax summary reports
     - Farm-level tax breakdown
     - Tax filing status tracking
   
   - **Tax Configuration**
     - Auto-calculation settings
     - **Uganda fiscal year** (July 1 to June 30)
     - **TIN (Tax Identification Number) requirements**
     - **URA VAT registration tracking**
     - **VAT threshold: UGX 150,000,000**
     - Notification settings for tax due dates
   
   - **Uganda-Specific Compliance**
     - **URA VAT return generation**
     - **URA income tax return generation**
     - **TIN and VAT number validation**
     - **Agricultural exemptions** (zero-rated/exempt products)
     - **Progressive income tax brackets** (0%, 10%, 20%, 30%, 40%)
     - **Uganda Shilling (UGX) currency support**
   
   - **Integration with Financial App**
     - Automatic tax calculation on animal sales
     - Automatic tax calculation on product sales
     - Tax tracking against revenue

**Key Features:**
- Multi-level expense approval
- Complete invoicing system
- Payment status tracking
- Financial audit trails
- **Tax rate management (owner & super admin)**
- **Automatic tax calculation on revenue**
- **Tax tracking and reporting**
- **Industry-standard tax separation**
- **🇺🇬 Uganda Revenue Authority (URA) compliance**
- **Uganda-specific tax rates and thresholds**
- **Agricultural tax exemptions support**

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
   - **Suspicious Location Detection** 🆕
     - IP geolocation tracking
     - VPN/Proxy/Tor detection
     - Impossible travel detection
     - New country detection
     - Automatic 2FA enforcement for suspicious logins
     - Multi-party notifications (farm owner + system admins)
   
   **Services:**
   - DeviceFingerprintingService
   - AbuseDetectionService
   - RateLimitService
   - **SuspiciousLocationDetectionService** 🆕
   - **IPGeolocationService** 🆕

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
- **Suspicious location detection with auto 2FA** 🆕
- **Multi-party security notifications** 🆕
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

### 📙 User Experience & Content Apps 🆕

**NEW SECTION - Enhancing User Experience**

These apps were added to improve user engagement, provide comprehensive help, and ensure legal compliance with versioned documents.

**Apps Covered:**

1. **Feedback App**: User feedback collection and management
   - Feedback submission (bug reports, feature requests, improvements)
   - Admin dashboard for tracking and responding
   - User voting system
   - Status tracking (new, reviewing, planned, in_progress, resolved)
   - Screenshot attachments
   - FeedbackComment for discussions
   - Automatic admin notifications

2. **Legal App**: Terms, privacy, and legal document management
   - LegalDocument with versioning (terms, privacy, cookie policy, SLA)
   - Document workflow (draft → review → published → archived)
   - Effective date management
   - **Tenant-specific** or **system-wide** documents
   - UserDocumentAgreement tracking
   - IP and user agent logging for compliance
   - Automatic prompts for new versions

3. **Help Content App**: Contextual tooltips and help articles
   - **Tooltip** system:
     - Contextual help per page/element
     - Role-based display
     - Trigger types (hover, click, focus, auto-show)
     - View count tracking
     - max_show_count limiting
     - Image/video support
   
   - **HelpArticle** system:
     - Comprehensive guides
     - Category organization
     - Search functionality
     - Related articles linking
     - Helpful/not helpful ratings
     - View count analytics

**Multi-Step Form Optimization** 📝

A comprehensive system for handling wizard-style forms efficiently:

- **FormStateService** for Redis-based state management
- Step-by-step validation
- Auto-save functionality (every 30 seconds)
- Recovery from navigation/browser close
- Single database write at submission
- Progress tracking
- Frontend `useMultiStepForm` hook

**Supported Forms:**
- ✅ Breeding Record (4 steps)
- ✅ Production Record (4 steps)
- ✅ Weaning Record (4 steps)
- ✅ Inventory Item (4 steps)
- ✅ Animal Registration (3-5 steps)
- ✅ Expense Submission (3 steps)
- ✅ User Onboarding (5 steps)
- ✅ Farm Setup (3 steps)

**Benefits:**
- 🎯 Improved user engagement via feedback system
- 📜 Legal compliance with versioned documents
- 💡 Better onboarding with contextual help
- 📝 Smooth multi-step form experience
- 💾 No data loss with auto-save
- ⚡ Optimized performance with Redis

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

**Total: 28 Django Apps** 🆕

**Core Infrastructure (4):**
- core, tenants, users, permissions

**Domain-Specific (13):**
- farms, animals, breeding, external_farms
- activities, production, weaning, veterinary
- inventory, financial, tax, disposal, media

**Supporting (5):**
- invitations, delegations, audit, analytics, notifications

**System (3):**
- devices, subscriptions, api

**User Experience & Content (3):** 🆕
- feedback, legal, help_content

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

