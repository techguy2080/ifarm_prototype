# Role Functionalities - Complete Reference Guide

## Overview
This document provides a comprehensive breakdown of core functionalities for each role in the iFarm livestock management system. The system uses Attribute-Based Access Control (ABAC) with role-based permissions to ensure appropriate access levels for different user types.

---

## Table of Contents
1. [Owner (Farm Owner)](#1-owner-farm-owner)
2. [Super Admin](#2-super-admin)
3. [Veterinarian](#3-veterinarian)
4. [Farm Manager (Helper with Elevated Permissions)](#4-farm-manager)
5. [Field Worker (Helper - Limited)](#5-field-worker)
6. [Veterinary Technician/Assistant](#6-veterinary-technician)
7. [Accountant](#7-accountant)
8. [Permission Matrix](#permission-matrix)
9. [Workflow Examples](#workflow-examples)

---

## 1. OWNER (Farm Owner)
*Full control of their farm(s) within their tenant organization*

### Animal Management
- ✅ View all animals across all farms
- ✅ Add, edit, and delete animals
- ✅ Track animal health status, weight history, and medical records
- ✅ View animal lineage and reproduction history
- ✅ Manage animal inventory and status
- ✅ Track births, offspring, and breeding performance
- ✅ Monitor castrated animals with full details
- ✅ View animal castration history and status

### Farm Operations
- ✅ Manage multiple farms (create, edit, view details)
- ✅ View farm locations and breed recommendations
- ✅ Assign and monitor daily schedules for workers
- ✅ Create and assign tasks to workers/managers
- ✅ View operational reports and analytics
- ✅ Log all farm activities (feeding, breeding, health checks, castration)
- ✅ Schedule castration procedures

### Financial Management
- ✅ Track sales (animal sales, product sales)
- ✅ Manage expenses (operational, medical, feed, etc.)
- ✅ View financial reports and trends
- ✅ Monitor income from animal rentals (Phase 7)
- ✅ Track expenses from hiring external animals (Phase 7)
- ✅ View profit/loss statements
- ✅ Track castration procedure costs

### Analytics & Reports
- ✅ Birth rate analytics (by month, season, animal type)
- ✅ Top producing animals dashboard
- ✅ Inventory management with distribution charts
- ✅ Breeding success metrics
- ✅ Financial performance reports
- ✅ Castration activity reports
- ✅ Worker performance analytics

### Breeding Management
- ✅ View pregnancy/breeding records
- ✅ Track expected due dates
- ✅ Monitor breeding with internal and external animals (Phase 7)
- ✅ Manage hire agreements for animal breeding (Phase 7)
- ✅ Access lineage and pedigree information (Phase 8)
- ✅ Genetic diversity analysis (Phase 8)
- ✅ Inbreeding coefficient monitoring
- ✅ Breeding recommendations based on genetics

### User & Access Management
- ✅ Invite and manage users (workers, vets, managers)
- ✅ Create and customize roles
- ✅ Assign permissions and create ABAC policies
- ✅ Manage user delegations
- ✅ View audit logs for security and compliance

### System Configuration
- ✅ Manage subscription plans
- ✅ Configure farms and settings
- ✅ View system audit trails
- ✅ Export reports and data

---

## 2. SUPER ADMIN
*Platform-wide system administrator across all tenants*

### Tenant Management
- ✅ View all tenants in the system
- ✅ Monitor tenant subscription status
- ✅ Manage subscription plans (Basic, Professional, Enterprise)
- ✅ Handle tenant suspensions and activations
- ✅ View tenant-wide overview and statistics

### Data Management (Cross-Tenant)
- ✅ View all animals across all tenants
- ✅ View all farms across all tenants
- ✅ View all users across all tenants
- ✅ View all sales records (system-wide)
- ✅ View all expenses (system-wide)
- ✅ View all delegations (system-wide)
- ✅ Access all audit logs (system-wide)
- ✅ View all farm activities including castrations

### System Administration
- ✅ System-wide search functionality
- ✅ Database management and maintenance
- ✅ System settings configuration
- ✅ Monitor system health and performance
- ✅ Generate platform-wide reports

### Support & Monitoring
- ✅ Troubleshoot tenant issues
- ✅ Monitor subscription compliance
- ✅ Track system usage and limits
- ✅ Platform analytics and insights

---

## 3. VETERINARIAN
*Medical professional with specialized animal health access*

### Animal Health Management
- ✅ View all animals in the system
- ✅ Update animal health status (healthy, sick, recovering, quarantine)
- ✅ Access detailed health records for each animal
- ✅ View castration history and status

### Medical Record Keeping
- ✅ Record vaccinations (type, date, vet, notes)
- ✅ Log deworming treatments
- ✅ Document medical treatments and procedures
- ✅ Conduct and record health checks
- ✅ Track medication administration
- ✅ Log surgical castration procedures when performed
- ✅ Update post-care instructions for castrated animals

### Health Analysis
- ✅ View animal health history
- ✅ Access breeding history (for health assessment)
- ✅ Review production records (milk, wool, etc.)
- ✅ Check recent activities and care
- ✅ Analyze family health history
- ✅ Identify health trends and patterns
- ✅ Monitor post-castration recovery

### Medical Expense Tracking
- ✅ Record medical expenses
- ✅ Track medication costs
- ✅ Document veterinary service charges
- ✅ Record castration procedure costs

### Reporting
- ✅ Generate health reports
- ✅ View vaccination schedules
- ✅ Monitor quarantine animals
- ✅ Track medical intervention outcomes
- ✅ Review castration complication rates

---

## 4. FARM MANAGER
*Operational management with extensive permissions but limited administrative access*

### Animal Management
- ✅ View all animals
- ✅ Add new animals
- ✅ Edit animal information
- ✅ Track animal locations and movements
- ✅ Monitor animal health and status
- ✅ Update castration records

### Daily Operations
- ✅ Log feeding activities
- ✅ Record breeding activities
- ✅ Create general activity logs
- ✅ View and complete assigned tasks
- ✅ Update task completion status
- ✅ **Log castration activities**
- ✅ **Schedule castration procedures**
- ✅ **Assign castration tasks to workers**

### Production Management
- ✅ Record milk production
- ✅ Track wool production
- ✅ Log other product outputs
- ✅ Monitor production trends

### Sales Operations
- ✅ Manage animal sales
- ✅ Record product sales
- ✅ Track sales transactions
- ✅ View sales history

### Pregnancy & Breeding
- ✅ Record breeding activities
- ✅ Track pregnancy status
- ✅ Monitor expected due dates
- ✅ Update birth records
- ✅ View breeding calendar
- ✅ Exclude castrated males from breeding selection

### Weaning Management
- ✅ Record weaning data
- ✅ Track weaning progress
- ✅ Monitor weaned animals

### Task Management
- ✅ Create and assign tasks to workers
- ✅ Monitor task completion
- ✅ Schedule recurring activities
- ✅ Track worker productivity

### Reporting
- ✅ View operational reports
- ✅ Access activity summaries
- ✅ Monitor farm performance metrics
- ✅ Generate castration activity reports

---

## 5. FIELD WORKER
*Basic operational tasks and daily activity logging*

### Animal Viewing
- ✅ View animal list
- ✅ Check animal basic information
- ✅ View animal types and locations
- ✅ Check animal castration status

### Activity Logging
- ✅ Log feeding activities
- ✅ Record general activities
- ✅ Update completed work
- ✅ **Log castration activities they performed**
- ✅ **Record castration method and details**
- ✅ **Document post-care observations**

### Task Management
- ✅ View assigned daily tasks
- ✅ Mark tasks as complete
- ✅ Check daily schedules
- ✅ Complete assigned castration tasks

### Alerts & Notifications
- ✅ View assigned alerts
- ✅ Check feeding schedules
- ✅ Monitor milking schedules
- ✅ Respond to health check reminders
- ✅ Receive castration post-care reminders

### Production Logging
- ✅ Record daily production (milk, wool)
- ✅ Log production quantities

### Castration Activities
- ✅ **Log castration procedures performed**
- ✅ **Select castration method (surgical, banding, chemical)**
- ✅ **Record veterinarian name if supervised**
- ✅ **Document post-care instructions**
- ✅ **Enter procedure costs**
- ✅ **Add notes about procedure and animal condition**

---

## 6. VETERINARY TECHNICIAN
*Specialized role for veterinary support*

### Health Monitoring
- ✅ View animal health records
- ✅ Access vaccination history
- ✅ Check treatment schedules
- ✅ Monitor post-castration recovery

### Medical Assistance
- ✅ Log health checks under vet supervision
- ✅ Record basic treatments
- ✅ Update health status
- ✅ Assist with castration procedures
- ✅ Monitor castration recovery

### Data Entry
- ✅ Enter medical data
- ✅ Record medication administration
- ✅ Document procedures
- ✅ Log castration procedure details

---

## 7. ACCOUNTANT
*Financial specialist role*

### Financial Reporting
- ✅ View all sales records
- ✅ Access expense reports
- ✅ Generate financial statements
- ✅ Track revenue and costs
- ✅ View castration procedure costs

### Sales Management
- ✅ Record animal sales
- ✅ Log product sales
- ✅ Monitor pricing and transactions

### Expense Tracking
- ✅ View all expense categories
- ✅ Monitor spending patterns
- ✅ Generate cost reports
- ✅ Track operational expenses including castrations

### Subscription Management
- ✅ View subscription plans
- ✅ Monitor payment status
- ✅ Access billing information

---

## Permission Matrix

| Functionality | Owner | Super Admin | Vet | Manager | Worker | Vet Tech | Accountant |
|--------------|-------|-------------|-----|---------|--------|----------|------------|
| View Animals | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Animals | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Delete Animals | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Health | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Log Activities | ✅ | ❌ | ✅ | ✅ | ✅ (limited) | ✅ | ❌ |
| **Log Castration** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Schedule Castration** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Financial | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Manage Tasks | ✅ | ❌ | ❌ | ✅ | ❌ (view only) | ❌ | ❌ |
| Access Analytics | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Workflow Examples

### Worker Daily Flow
1. **Login** → View Dashboard
2. **Check Alerts** → "Alerts & Notifications" page
   - See pending tasks
   - View castration post-care reminders
3. **Daily Schedules** → View assigned tasks
   - Tasks include: feeding, milking, cleaning, **castration procedures**
4. **Complete Tasks**
   - Feed animals
   - Perform scheduled castration on GOAT-004
   - Clean facilities
5. **Log Castration Activity**
   - Go to "Farm Activities"
   - Click "Log Activity" → Select "Castration"
   - Select GOAT-004
   - Method: Banding
   - Description: "Routine castration using elastrator"
   - Post-Care: "Monitor for swelling, check daily"
   - Cost: 5,000 UGX
   - Submit
6. **Mark Tasks Complete**
7. **Log Production** (milk collected)

### Veterinarian Workflow
1. **Login** → View "Animal Tracking"
2. **Review Schedule** → See castration procedures scheduled
3. **Perform Surgical Castration**
   - Arrive at farm
   - Perform procedure on COW-003
4. **Worker Logs Activity**
   - Activity type: Castration
   - Method: Surgical
   - Veterinarian: Dr. Sarah Wilson (vet's name)
   - Post-Care: "Antibiotics 2x daily for 5 days, isolate for 3 days"
   - Cost: 50,000 UGX
5. **Update Animal Health Status**
   - Monitor recovery
   - Update notes if complications arise
6. **Schedule Follow-Up** → 7-day wound check

### Manager Workflow (Castration Planning)
1. **Login** → Review Dashboard
2. **Identify Animals** → Go to Animals page
   - Filter: Male, Intact (not castrated)
   - Age: 3-4 months (ideal for goats)
   - Result: GOAT-004, GOAT-005, GOAT-006
3. **Schedule Castrations**
   - Go to "Daily Schedules"
   - Create task: "Castrate young goat kids"
   - Assign to: Field Worker (Mike Johnson)
   - Date: Next Tuesday
   - Method: Banding
   - Priority: Medium
4. **Arrange Vet (if needed)**
   - For older animals requiring surgical castration
   - Schedule vet visit for COW-003
   - Budget: 50,000 UGX
5. **Monitor Completion**
   - Check task completion status
   - Verify activities were logged
   - Review post-care compliance
6. **Follow-Up**
   - Set 7-day check reminder
   - Monitor recovery progress
   - Address any complications

### Owner Workflow (Complete Management)
1. **Login** → Dashboard Overview
   - See summary: 45 animals, 12 castrated, 3 scheduled
2. **Review Alerts**
   - Overdue castration for GOAT-007 (6 months old)
   - Post-care check needed for COW-003
3. **Check Analytics**
   - "Birth Rates" → Top producing females
   - "Inventory" → 15 intact males (potential for castration)
   - **Castration Report** → 8 castrations this quarter
4. **Financial Review**
   - "Expenses" → Castration costs: 185,000 UGX this month
   - Average cost per castration: 23,125 UGX
   - Surgical: 50,000 UGX, Banding: 5,000 UGX
5. **Task Management**
   - Assign bulk castration task for next week
   - Book veterinarian for surgical procedures
   - Assign workers for banding procedures
6. **Compliance Check**
   - Ensure all castrations documented
   - Verify post-care protocols followed
   - Review animal welfare compliance
7. **Strategic Planning**
   - Decide which males to keep intact for breeding
   - Plan castration schedule for next quarter
   - Budget for castration program

---

## Castration Activity: Detailed Role Breakdown

### Owner
- **Full Control**: Schedule, log, monitor all castrations
- **Strategic Planning**: Decide which males to castrate vs keep for breeding
- **Budget Management**: Allocate funds for castration program
- **Compliance Oversight**: Ensure all procedures documented and compliant
- **Analytics**: Review castration reports and trends
- **Vendor Management**: Arrange veterinarian services

### Farm Manager
- **Operational Execution**: Schedule and coordinate castration procedures
- **Worker Assignment**: Assign castration tasks to qualified workers
- **Method Selection**: Choose appropriate method (banding vs surgical)
- **Resource Planning**: Ensure tools, supplies, medications available
- **Quality Control**: Monitor procedure compliance and outcomes
- **Cost Tracking**: Record expenses for castration activities
- **Follow-Up Management**: Ensure post-care protocols followed

### Field Worker
- **Activity Logging**: Log castration procedures performed
- **Detail Documentation**: Record method, date, cost, observations
- **Post-Care Recording**: Document post-care instructions received
- **Task Completion**: Mark castration tasks as complete
- **Observation Reporting**: Report complications or concerns
- **Basic Procedures**: Perform banding castrations (if trained)
- **Vet Assistance**: Assist veterinarian with surgical procedures

### Veterinarian
- **Surgical Procedures**: Perform surgical castrations
- **Medical Supervision**: Oversee castration procedures
- **Post-Care Instructions**: Provide detailed recovery care plans
- **Complication Management**: Treat castration-related complications
- **Pain Management**: Prescribe pain relief medications
- **Infection Prevention**: Prescribe antibiotics when needed
- **Follow-Up Exams**: Conduct post-procedure checkups

### Veterinary Technician
- **Vet Assistance**: Assist with surgical castration procedures
- **Pre-Op Preparation**: Prepare animals and equipment
- **Post-Op Monitoring**: Monitor recovery immediately after procedure
- **Medication Administration**: Give prescribed medications
- **Wound Care**: Assist with wound cleaning and dressing
- **Data Recording**: Document procedure details

### Accountant
- **Cost Tracking**: Monitor castration expenses
- **Financial Reporting**: Include castration costs in reports
- **Budget Analysis**: Compare actual vs budgeted costs
- **Cost-Benefit Analysis**: Analyze ROI of different methods
- **Vendor Payments**: Process veterinarian invoices
- ❌ **Cannot Log Activities**: Read-only access to operations

---

## Key Benefits by Role

### For Workers
- Clear task assignments
- Simple logging interface
- Accountability and recognition
- Training through historical records
- Reduced paperwork

### For Managers
- Operational visibility
- Efficient task coordination
- Quality control
- Resource optimization
- Performance tracking

### For Veterinarians
- Complete medical history access
- Streamlined record keeping
- Better post-care tracking
- Complication monitoring
- Professional documentation

### For Owners
- Complete farm oversight
- Data-driven decision making
- Financial control
- Compliance assurance
- Strategic planning tools

---

## Related Documentation
- [Castration Activity Feature](CASTRATION_ACTIVITY_FEATURE.md) - Detailed castration feature guide
- [Phase 7: External Breeding](PHASE7_EXTERNAL_BREEDING.md) - External farm breeding management
- [Phase 8: Lineage Tracking](PHASE8_LINEAGE_TRACKING.md) - Animal genetics and pedigree
- Worker Training Manual - Activity logging procedures
- Animal Welfare Guidelines - Care standards and compliance


