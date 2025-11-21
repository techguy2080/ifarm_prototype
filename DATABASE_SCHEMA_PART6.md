# iFarm Database Schema - Part 6: User Experience, HR, Chat & Business Contacts

## Layer Architecture Context

This document defines **Layer 7: Database Layer** tables for user experience apps, HR management, chat, and business contacts. These tables support:

- **Layer 6 (Data Access)**: Custom managers with tenant filtering
- **Layer 5 (Business Logic)**: Services for tips, advice, chat, payroll, leave management, business contacts
- **Layer 4 (API)**: API endpoints query these tables through services

**Key Layer Features**:
- **Tips & Advice**: Dashboard tips and advice boxes for communication
- **Chat System**: Community chat and messaging
- **HR Management**: Employee records, payroll, leave calendar
- **Business Contacts**: Track business relationships and transactions
- **Multi-Tenant Isolation**: All tables include `tenant_id` for data isolation

---

## User Experience & Content Tables

### 62. tips 🆕

**Purpose**: Dashboard tips shown to users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| tip_id | SERIAL | PRIMARY KEY | Unique tip identifier |
| tenant_id | INTEGER | FK → tenants(tenant_id) | Tenant reference (NULL = system-wide) |
| title | VARCHAR(255) | NOT NULL | Tip title |
| content | TEXT | NOT NULL | Tip content |
| content_format | VARCHAR(10) | DEFAULT 'text' | text, html, markdown |
| show_on_dashboard | BOOLEAN | DEFAULT TRUE | Show on dashboard |
| show_for_roles | JSONB | DEFAULT '[]' | Roles to show for (empty = all) |
| show_for_new_users_only | BOOLEAN | DEFAULT FALSE | Show only to new users |
| icon | VARCHAR(50) | NULL | Icon name |
| color | VARCHAR(20) | DEFAULT 'info' | info, success, warning, error |
| priority | INTEGER | DEFAULT 0 | Display priority (higher = first) |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| start_date | TIMESTAMP | NULL | Start date |
| end_date | TIMESTAMP | NULL | End date |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_tips_tenant_active ON tips(tenant_id, is_active, show_on_dashboard);
CREATE INDEX idx_tips_active_dates ON tips(is_active, start_date, end_date);
```

---

### 63. advice 🆕

**Purpose**: Advice box messages (super admin ↔ farms, owners ↔ employees)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| advice_id | SERIAL | PRIMARY KEY | Unique advice identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| from_user_id | INTEGER | NOT NULL, FK → users(user_id) | Sender |
| to_user_id | INTEGER | FK → users(user_id) | Recipient (if specific) |
| to_role | VARCHAR(50) | NULL | Recipient role (super_admin, owner, employee) |
| to_tenant_id | INTEGER | FK → tenants(tenant_id) | Target tenant (if role-based) |
| subject | VARCHAR(255) | NOT NULL | Advice subject |
| message | TEXT | NOT NULL | Advice message |
| advice_type | VARCHAR(20) | DEFAULT 'suggestion' | suggestion, question, feedback, complaint, praise |
| status | VARCHAR(20) | DEFAULT 'new' | new, read, replied, resolved, archived |
| replied_by_user_id | INTEGER | FK → users(user_id) | Who replied |
| reply_message | TEXT | NULL | Reply message |
| replied_at | TIMESTAMP | NULL | Reply timestamp |
| read_at | TIMESTAMP | NULL | Read timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_advice_from_user ON advice(from_user_id, status);
CREATE INDEX idx_advice_to_user ON advice(to_user_id, status);
CREATE INDEX idx_advice_to_role ON advice(to_role, to_tenant_id, status);
CREATE INDEX idx_advice_tenant_status ON advice(tenant_id, status);
```

**Constraints:**
```sql
ALTER TABLE advice ADD CONSTRAINT advice_type_check 
  CHECK (advice_type IN ('suggestion', 'question', 'feedback', 'complaint', 'praise'));

ALTER TABLE advice ADD CONSTRAINT advice_status_check 
  CHECK (status IN ('new', 'read', 'replied', 'resolved', 'archived'));
```

---

## Chat Tables

### 64. chat_rooms 🆕

**Purpose**: Chat rooms for community or private conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| room_id | SERIAL | PRIMARY KEY | Unique room identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| name | VARCHAR(255) | NOT NULL | Room name |
| description | TEXT | NULL | Room description |
| room_type | VARCHAR(20) | DEFAULT 'public' | public, private, group, direct |
| created_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Creator |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| max_participants | INTEGER | NULL | Max participants |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_chat_rooms_tenant_type ON chat_rooms(tenant_id, room_type, is_active);
CREATE INDEX idx_chat_rooms_created_by ON chat_rooms(created_by_user_id);
```

**Constraints:**
```sql
ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_type_check 
  CHECK (room_type IN ('public', 'private', 'group', 'direct'));
```

---

### 65. chat_room_participants 🆕

**Purpose**: Chat room participants with roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| participant_id | SERIAL | PRIMARY KEY | Unique participant identifier |
| room_id | INTEGER | NOT NULL, FK → chat_rooms(room_id) | Room reference |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User reference |
| role | VARCHAR(20) | DEFAULT 'member' | owner, admin, member |
| joined_at | TIMESTAMP | NOT NULL | Join timestamp |
| last_read_at | TIMESTAMP | NULL | Last read timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_chat_room_participants_unique ON chat_room_participants(room_id, user_id);
CREATE INDEX idx_chat_room_participants_user ON chat_room_participants(user_id);
CREATE INDEX idx_chat_room_participants_room ON chat_room_participants(room_id);
```

**Constraints:**
```sql
ALTER TABLE chat_room_participants ADD CONSTRAINT chat_room_participants_role_check 
  CHECK (role IN ('owner', 'admin', 'member'));
```

---

### 66. chat_messages 🆕

**Purpose**: Chat messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| message_id | SERIAL | PRIMARY KEY | Unique message identifier |
| room_id | INTEGER | NOT NULL, FK → chat_rooms(room_id) | Room reference |
| sender_id | INTEGER | NOT NULL, FK → users(user_id) | Sender |
| message | TEXT | NOT NULL | Message content |
| message_type | VARCHAR(20) | DEFAULT 'text' | text, image, file, system |
| attachment_id | INTEGER | FK → media_files(file_id) | Attachment |
| is_edited | BOOLEAN | DEFAULT FALSE | Edited flag |
| edited_at | TIMESTAMP | NULL | Edit timestamp |
| is_deleted | BOOLEAN | DEFAULT FALSE | Deleted flag |
| deleted_at | TIMESTAMP | NULL | Delete timestamp |
| reactions | JSONB | DEFAULT '{}' | {emoji: [user_ids]} |
| reply_to_message_id | INTEGER | FK → chat_messages(message_id) | Reply to message |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_chat_messages_room_date ON chat_messages(room_id, created_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id, created_at);
CREATE INDEX idx_chat_messages_reply_to ON chat_messages(reply_to_message_id);
```

**Constraints:**
```sql
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_type_check 
  CHECK (message_type IN ('text', 'image', 'file', 'system'));
```

---

## Human Resources Tables

### 67. employees 🆕

**Purpose**: Employee records linked to users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| employee_id | SERIAL | PRIMARY KEY | Unique employee identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| user_id | INTEGER | NOT NULL, UNIQUE, FK → users(user_id) | User reference |
| employee_number | VARCHAR(50) | NOT NULL, UNIQUE | Employee number |
| position | VARCHAR(100) | NOT NULL | Job position |
| department | VARCHAR(100) | NULL | Department |
| employment_type | VARCHAR(20) | DEFAULT 'full_time' | full_time, part_time, contract, casual |
| hire_date | DATE | NOT NULL | Hire date |
| termination_date | DATE | NULL | Termination date |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| salary_amount | DECIMAL(12,2) | NULL | Salary amount |
| salary_currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| salary_frequency | VARCHAR(20) | DEFAULT 'monthly' | monthly, weekly, daily |
| manager_user_id | INTEGER | FK → users(user_id) | Manager |
| notes | TEXT | NULL | Notes |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_employees_tenant_farm ON employees(tenant_id, farm_id, is_active);
CREATE UNIQUE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE UNIQUE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_manager ON employees(manager_user_id);
```

**Constraints:**
```sql
ALTER TABLE employees ADD CONSTRAINT employees_employment_type_check 
  CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'casual'));

ALTER TABLE employees ADD CONSTRAINT employees_salary_frequency_check 
  CHECK (salary_frequency IN ('monthly', 'weekly', 'daily'));
```

---

### 68. payroll 🆕

**Purpose**: Employee payroll records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| payroll_id | SERIAL | PRIMARY KEY | Unique payroll identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| employee_id | INTEGER | NOT NULL, FK → employees(employee_id) | Employee reference |
| pay_period_start | DATE | NOT NULL | Period start |
| pay_period_end | DATE | NOT NULL | Period end |
| pay_date | DATE | NOT NULL | Pay date |
| base_salary | DECIMAL(12,2) | NOT NULL | Base salary |
| allowances | DECIMAL(12,2) | DEFAULT 0 | Allowances |
| deductions | DECIMAL(12,2) | DEFAULT 0 | Deductions |
| overtime | DECIMAL(12,2) | DEFAULT 0 | Overtime pay |
| bonuses | DECIMAL(12,2) | DEFAULT 0 | Bonuses |
| gross_pay | DECIMAL(12,2) | NOT NULL | Gross pay |
| net_pay | DECIMAL(12,2) | NOT NULL | Net pay |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| payment_method | VARCHAR(50) | NOT NULL | bank_transfer, mobile_money, cash, cheque |
| payment_status | VARCHAR(20) | DEFAULT 'pending' | pending, processing, paid, failed |
| paid_at | TIMESTAMP | NULL | Paid timestamp |
| reminder_sent | BOOLEAN | DEFAULT FALSE | Reminder sent |
| reminder_sent_at | TIMESTAMP | NULL | Reminder timestamp |
| notes | TEXT | NULL | Notes |
| processed_by_user_id | INTEGER | FK → users(user_id) | Processor |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_payroll_tenant_date ON payroll(tenant_id, pay_date);
CREATE INDEX idx_payroll_employee_period ON payroll(employee_id, pay_period_start);
CREATE INDEX idx_payroll_status ON payroll(payment_status);
CREATE INDEX idx_payroll_reminder ON payroll(reminder_sent, pay_date);
```

**Constraints:**
```sql
ALTER TABLE payroll ADD CONSTRAINT payroll_payment_method_check 
  CHECK (payment_method IN ('bank_transfer', 'mobile_money', 'cash', 'cheque'));

ALTER TABLE payroll ADD CONSTRAINT payroll_payment_status_check 
  CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed'));
```

---

### 69. payroll_reminders 🆕

**Purpose**: Payroll payment reminders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| reminder_id | SERIAL | PRIMARY KEY | Unique reminder identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| payroll_id | INTEGER | NOT NULL, FK → payroll(payroll_id) | Payroll reference |
| reminder_type | VARCHAR(20) | NOT NULL | payment_due, payment_overdue |
| reminder_date | DATE | NOT NULL | Reminder date |
| sent_at | TIMESTAMP | NULL | Sent timestamp |
| is_sent | BOOLEAN | DEFAULT FALSE | Sent flag |
| sent_to_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recipient |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_payroll_reminders_date_sent ON payroll_reminders(reminder_date, is_sent);
CREATE INDEX idx_payroll_reminders_payroll ON payroll_reminders(payroll_id);
```

**Constraints:**
```sql
ALTER TABLE payroll_reminders ADD CONSTRAINT payroll_reminders_type_check 
  CHECK (reminder_type IN ('payment_due', 'payment_overdue'));
```

---

### 70. leave_requests 🆕

**Purpose**: Employee leave requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| leave_id | SERIAL | PRIMARY KEY | Unique leave identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| employee_id | INTEGER | NOT NULL, FK → employees(employee_id) | Employee reference |
| leave_type | VARCHAR(50) | NOT NULL | annual, sick, maternity, paternity, unpaid, emergency, other |
| start_date | DATE | NOT NULL | Start date |
| end_date | DATE | NOT NULL | End date |
| days_requested | INTEGER | NOT NULL | Days requested |
| status | VARCHAR(20) | DEFAULT 'pending' | pending, approved, rejected, cancelled |
| requested_at | TIMESTAMP | NOT NULL | Request timestamp |
| approved_by_user_id | INTEGER | FK → users(user_id) | Approver |
| approved_at | TIMESTAMP | NULL | Approval timestamp |
| rejection_reason | TEXT | NULL | Rejection reason |
| reason | TEXT | NOT NULL | Leave reason |
| notes | TEXT | NULL | Notes |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_leave_requests_employee_date ON leave_requests(employee_id, start_date);
CREATE INDEX idx_leave_requests_status_date ON leave_requests(status, start_date);
CREATE INDEX idx_leave_requests_tenant_date ON leave_requests(tenant_id, start_date);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
```

**Constraints:**
```sql
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_type_check 
  CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'emergency', 'other'));

ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));
```

---

## Business Contacts Tables

### 71. business_contacts 🆕

**Purpose**: Business contacts (people farm owner has done business with)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| contact_id | SERIAL | PRIMARY KEY | Unique contact identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| contact_name | VARCHAR(255) | NOT NULL | Contact name |
| contact_type | VARCHAR(50) | NOT NULL | buyer, seller, supplier, service_provider, partner, other |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| email | VARCHAR(255) | NULL | Email address |
| address | TEXT | NULL | Address |
| city | VARCHAR(100) | NULL | City |
| district | VARCHAR(100) | NULL | District |
| country | VARCHAR(100) | DEFAULT 'Uganda' | Country |
| business_name | VARCHAR(255) | NULL | Business name |
| business_type | VARCHAR(100) | NULL | Business type |
| notes | TEXT | NULL | Notes |
| tags | JSONB | DEFAULT '[]' | Tags for categorization |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Creator |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_business_contacts_tenant_type ON business_contacts(tenant_id, contact_type, is_active);
CREATE INDEX idx_business_contacts_name ON business_contacts(contact_name);
CREATE INDEX idx_business_contacts_phone ON business_contacts(phone);
```

**Constraints:**
```sql
ALTER TABLE business_contacts ADD CONSTRAINT business_contacts_type_check 
  CHECK (contact_type IN ('buyer', 'seller', 'supplier', 'service_provider', 'partner', 'other'));
```

---

### 72. business_transactions 🆕

**Purpose**: Business transactions with contacts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| transaction_id | SERIAL | PRIMARY KEY | Unique transaction identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| contact_id | INTEGER | NOT NULL, FK → business_contacts(contact_id) | Contact reference |
| transaction_type | VARCHAR(50) | NOT NULL | animal_sale, animal_purchase, product_sale, product_purchase, service, hire_out, hire_in, other |
| transaction_date | DATE | NOT NULL | Transaction date |
| amount | DECIMAL(12,2) | NOT NULL | Transaction amount |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| related_sale_id | INTEGER | NULL | Link to AnimalSale or ProductSale |
| related_purchase_id | INTEGER | NULL | Link to Purchase |
| related_hire_agreement_id | INTEGER | NULL | Link to hire agreement |
| description | TEXT | NOT NULL | Description |
| notes | TEXT | NULL | Notes |
| payment_status | VARCHAR(20) | DEFAULT 'pending' | pending, partial, paid, overdue |
| created_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Creator |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_business_transactions_contact_date ON business_transactions(contact_id, transaction_date);
CREATE INDEX idx_business_transactions_tenant_type_date ON business_transactions(tenant_id, transaction_type, transaction_date);
CREATE INDEX idx_business_transactions_date ON business_transactions(transaction_date);
```

**Constraints:**
```sql
ALTER TABLE business_transactions ADD CONSTRAINT business_transactions_type_check 
  CHECK (transaction_type IN ('animal_sale', 'animal_purchase', 'product_sale', 'product_purchase', 'service', 'hire_out', 'hire_in', 'other'));

ALTER TABLE business_transactions ADD CONSTRAINT business_transactions_payment_status_check 
  CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue'));
```

---

## Database Schema Summary (Updated)

**Total Tables**: 72 (was 61) 🆕

**New Tables Added (11):**
- `tips` - Dashboard tips
- `advice` - Advice box messages
- `chat_rooms` - Chat rooms
- `chat_room_participants` - Room participants
- `chat_messages` - Chat messages
- `employees` - Employee records
- `payroll` - Payroll records
- `payroll_reminders` - Payment reminders
- `leave_requests` - Leave requests
- `business_contacts` - Business contacts
- `business_transactions` - Business transactions

**By Category (Updated):**
- Core Infrastructure: 2 (tenants, users)
- Authentication & Users: 5 (profiles, user_sessions, user_tenants, identity_providers, user_farms)
- Permissions: 9 (permissions, role_templates, roles, policies, user_roles, and junction tables)
- Farms & Animals: 3 (farms, animals, animal_history)
- Production & Veterinary: 7 (production, daily_production_summary, health_checks, vaccinations, treatments, weight_records, deworming)
- Breeding & External: 5 (breeding_records, breeding_offspring, external_farms, external_animals, hire agreements)
- Financial: 7 (expenses, expense_history, animal_sales, product_sales, sales_invoices, line_items, purchase_invoices)
- Inventory: 2 (inventory_items, inventory_movements)
- Activities: 3 (activities, weaning_records, disposal_records)
- Media: 1 (media_files)
- Invitations & Delegations: 2 (invitations, delegations)
- Audit & Analytics: 4 (audit_logs, audit_log_archive, analytics_cache, reports)
- Notifications: 2 (notifications, notification_preferences)
- Devices & Security: 6 (devices, device_sessions, ip_addresses, abuse_logs, rate_limit_rules, security_alerts)
- Subscriptions & Billing: 6 (subscription_plans, subscriptions, subscription_invoices, payments, payment_methods, usage_logs)
- **User Experience & Content** 🆕: 3 (feedback, legal_documents, tooltips, help_articles, **tips, advice**)
- **Chat** 🆕: 3 (chat_rooms, chat_room_participants, chat_messages)
- **Human Resources** 🆕: 4 (employees, payroll, payroll_reminders, leave_requests)
- **Business Contacts** 🆕: 2 (business_contacts, business_transactions)

---

**End of Database Schema Documentation - Part 6**

