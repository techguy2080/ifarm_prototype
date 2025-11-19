# iFarm Database Schema - Part 3: Breeding & Financial Tables

## Layer Architecture Context

This document defines **Layer 7: Database Layer** tables for breeding, external farms, and financial operations. These tables are accessed through:

- **Layer 6 (Data Access)**: Custom managers (`TenantManager`, `FarmManager`) automatically filter queries
- **Layer 5 (Business Logic)**: Services enforce business rules before data access
- **Layer 4 (API)**: ViewSets call services which use managers to query these tables

**Key Layer Features**:
- **Automatic Filtering**: `TenantManager` adds `tenant_id` filter automatically
- **Farm-Level Access**: `FarmManager` adds `farm_id IN (accessible_farms)` filter
- **Query Optimization**: Indexes on `(tenant_id, farm_id)` for fast filtering
- **Data Integrity**: Foreign keys and constraints enforce relationships
- **Financial Integrity**: Approval workflows enforced at database level

---

## Breeding & External Farm Tables

### 23. breeding_records

**Purpose**: Breeding and pregnancy tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| breeding_id | SERIAL | PRIMARY KEY | Unique breeding identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Female animal |
| sire_source | VARCHAR(20) | NOT NULL | internal, external |
| sire_id | INTEGER | FK → animals(animal_id) | Internal sire |
| external_animal_id | INTEGER | FK → external_animals(external_animal_id) | External sire |
| external_farm_name | VARCHAR(200) | NULL | External farm name (cached) |
| external_animal_tag | VARCHAR(100) | NULL | External animal tag (cached) |
| animal_hire_agreement_id | INTEGER | FK → animal_hire_agreements(agreement_id) | Hire out agreement |
| external_animal_hire_agreement_id | INTEGER | FK → external_animal_hire_agreements(agreement_id) | Hire in agreement |
| breeding_date | DATE | NOT NULL | Breeding/insemination date |
| breeding_method | VARCHAR(50) | DEFAULT 'natural' | Breeding method |
| conception_date | DATE | NULL | Confirmed conception date |
| expected_due_date | DATE | NULL | Expected delivery date |
| actual_birth_date | DATE | NULL | Actual birth date |
| birth_outcome | VARCHAR(20) | NULL | successful, stillborn, aborted, complications |
| offspring_count | INTEGER | DEFAULT 0 | Number of offspring |
| complications | TEXT | NULL | Birth complications |
| pregnancy_status | VARCHAR(20) | DEFAULT 'suspected' | Pregnancy status |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_breeding_animal_date ON breeding_records(animal_id, breeding_date);
CREATE INDEX idx_breeding_tenant_farm_status ON breeding_records(tenant_id, farm_id, pregnancy_status);
CREATE INDEX idx_breeding_expected_due ON breeding_records(expected_due_date);
CREATE INDEX idx_breeding_sire_source ON breeding_records(sire_source);
CREATE INDEX idx_breeding_sire ON breeding_records(sire_id);
```

**Constraints:**
```sql
ALTER TABLE breeding_records ADD CONSTRAINT breeding_sire_source_check 
  CHECK (sire_source IN ('internal', 'external'));

ALTER TABLE breeding_records ADD CONSTRAINT breeding_method_check 
  CHECK (breeding_method IN ('natural', 'artificial_insemination', 'embryo_transfer'));

ALTER TABLE breeding_records ADD CONSTRAINT breeding_birth_outcome_check 
  CHECK (birth_outcome IN ('successful', 'stillborn', 'aborted', 'complications'));

ALTER TABLE breeding_records ADD CONSTRAINT breeding_pregnancy_status_check 
  CHECK (pregnancy_status IN ('suspected', 'confirmed', 'completed', 'failed'));
```

---

### 24. breeding_offspring

**Purpose**: Link breeding records to offspring animals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| breeding_record_id | INTEGER | NOT NULL, FK → breeding_records(breeding_id) | Breeding reference |
| offspring_id | INTEGER | NOT NULL, FK → animals(animal_id) | Offspring reference |
| birth_order | INTEGER | DEFAULT 1 | Birth order (for twins/triplets) |
| birth_weight | DECIMAL(8,2) | NULL | Birth weight in kg |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_breeding_offspring_unique ON breeding_offspring(breeding_record_id, offspring_id);
CREATE INDEX idx_breeding_offspring_offspring ON breeding_offspring(offspring_id);
```

---

### 25. external_farms

**Purpose**: External farms for hiring animals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| external_farm_id | SERIAL | PRIMARY KEY | Unique external farm identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_name | VARCHAR(255) | NOT NULL | External farm name |
| location | VARCHAR(255) | NULL | Location |
| district | VARCHAR(100) | NULL | District |
| contact_person | VARCHAR(200) | NOT NULL | Contact person |
| contact_phone | VARCHAR(20) | NOT NULL | Contact phone |
| contact_email | VARCHAR(255) | NULL | Contact email |
| relationship_type | VARCHAR(50) | DEFAULT 'partner' | Relationship type |
| is_verified | BOOLEAN | DEFAULT FALSE | Verification status |
| rating | DECIMAL(3,2) | NULL | Rating (0-5) |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_external_farms_tenant ON external_farms(tenant_id);
CREATE INDEX idx_external_farms_verified ON external_farms(is_verified);
```

---

### 26. external_animals

**Purpose**: Animals from external farms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| external_animal_id | SERIAL | PRIMARY KEY | Unique external animal identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| external_farm_id | INTEGER | NOT NULL, FK → external_farms(external_farm_id) | Farm reference |
| tag_number | VARCHAR(100) | NOT NULL | Animal tag number |
| name | VARCHAR(200) | NULL | Animal name |
| animal_type | VARCHAR(50) | NOT NULL | Animal type |
| breed | VARCHAR(100) | NULL | Breed |
| gender | VARCHAR(10) | NOT NULL | male, female |
| date_of_birth | DATE | NULL | Birth date |
| color_markings | TEXT | NULL | Physical description |
| health_status | VARCHAR(50) | DEFAULT 'healthy' | Health status |
| certifications | JSONB | DEFAULT '[]' | Certifications |
| photo_id | INTEGER | FK → media_files(file_id) | Animal photo |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_external_animals_tenant_farm ON external_animals(tenant_id, external_farm_id);
CREATE INDEX idx_external_animals_tag ON external_animals(tag_number);
```

---

### 27. animal_hire_agreements

**Purpose**: Agreements for hiring out your animals (Revenue)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| agreement_id | SERIAL | PRIMARY KEY | Unique agreement identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal being hired out |
| hire_type | VARCHAR(20) | NOT NULL | hire_out |
| hirer_name | VARCHAR(255) | NOT NULL | Who is hiring |
| hirer_contact | VARCHAR(100) | NOT NULL | Hirer contact |
| purpose | VARCHAR(100) | NOT NULL | breeding, work, show, other |
| start_date | DATE | NOT NULL | Agreement start |
| end_date | DATE | NOT NULL | Agreement end |
| agreement_amount | DECIMAL(12,2) | NOT NULL | Agreed payment |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| payment_status | VARCHAR(20) | DEFAULT 'pending' | Payment status |
| payment_date | DATE | NULL | Payment date |
| payment_method | VARCHAR(50) | NULL | Payment method |
| return_status | VARCHAR(20) | DEFAULT 'pending' | Return status |
| return_date | DATE | NULL | Actual return date |
| return_condition | TEXT | NULL | Condition on return |
| terms_conditions | TEXT | NULL | Terms and conditions |
| agreement_document_id | INTEGER | FK → media_files(file_id) | Agreement document |
| notes | TEXT | NULL | Additional notes |
| created_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Creator |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_hire_agreements_tenant_farm ON animal_hire_agreements(tenant_id, farm_id);
CREATE INDEX idx_hire_agreements_animal ON animal_hire_agreements(animal_id);
CREATE INDEX idx_hire_agreements_dates ON animal_hire_agreements(start_date, end_date);
CREATE INDEX idx_hire_agreements_payment_status ON animal_hire_agreements(payment_status);
```

**Constraints:**
```sql
ALTER TABLE animal_hire_agreements ADD CONSTRAINT hire_agreements_purpose_check 
  CHECK (purpose IN ('breeding', 'work', 'show', 'other'));

ALTER TABLE animal_hire_agreements ADD CONSTRAINT hire_agreements_payment_status_check 
  CHECK (payment_status IN ('pending', 'partial', 'paid'));

ALTER TABLE animal_hire_agreements ADD CONSTRAINT hire_agreements_return_status_check 
  CHECK (return_status IN ('pending', 'returned', 'overdue', 'not_returned'));
```

---

### 28. external_animal_hire_agreements

**Purpose**: Agreements for hiring animals from external farms (Expense)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| agreement_id | SERIAL | PRIMARY KEY | Unique agreement identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| external_farm_id | INTEGER | NOT NULL, FK → external_farms(external_farm_id) | External farm |
| external_animal_id | INTEGER | NOT NULL, FK → external_animals(external_animal_id) | Animal being hired |
| hire_type | VARCHAR(20) | NOT NULL | hire_in |
| purpose | VARCHAR(100) | NOT NULL | Purpose |
| start_date | DATE | NOT NULL | Agreement start |
| end_date | DATE | NOT NULL | Agreement end |
| agreement_amount | DECIMAL(12,2) | NOT NULL | Agreed payment |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| payment_status | VARCHAR(20) | DEFAULT 'pending' | Payment status |
| payment_date | DATE | NULL | Payment date |
| payment_method | VARCHAR(50) | NULL | Payment method |
| return_status | VARCHAR(20) | DEFAULT 'pending' | Return status |
| return_date | DATE | NULL | Actual return date |
| terms_conditions | TEXT | NULL | Terms and conditions |
| agreement_document_id | INTEGER | FK → media_files(file_id) | Agreement document |
| notes | TEXT | NULL | Additional notes |
| created_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Creator |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_external_hire_tenant_farm ON external_animal_hire_agreements(tenant_id, farm_id);
CREATE INDEX idx_external_hire_external_farm ON external_animal_hire_agreements(external_farm_id);
CREATE INDEX idx_external_hire_dates ON external_animal_hire_agreements(start_date, end_date);
CREATE INDEX idx_external_hire_payment_status ON external_animal_hire_agreements(payment_status);
```

---

## Financial Tables

### 29. expenses

**Purpose**: Expense records with approval workflow

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| expense_id | SERIAL | PRIMARY KEY | Unique expense identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| expense_type | VARCHAR(50) | NOT NULL | Expense category |
| amount | DECIMAL(12,2) | NOT NULL | Expense amount |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| description | TEXT | NOT NULL | Description |
| expense_date | DATE | NOT NULL | Expense date |
| vendor | VARCHAR(200) | NULL | Vendor name |
| vendor_contact | VARCHAR(100) | NULL | Vendor contact |
| receipt_url | VARCHAR(500) | NULL | Receipt image URL |
| invoice_id | INTEGER | FK → purchase_invoices(invoice_id) | Related invoice |
| related_activity_id | INTEGER | FK → activities(activity_id) | Related activity |
| external_animal_hire_agreement_id | INTEGER | FK → external_animal_hire_agreements(agreement_id) | Hire agreement |
| approval_status | VARCHAR(20) | DEFAULT 'pending' | Approval status |
| approved_by_user_id | INTEGER | FK → users(user_id) | Approver |
| approved_at | TIMESTAMP | NULL | Approval timestamp |
| rejection_reason | TEXT | NULL | Rejection reason |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_expenses_tenant_farm_date ON expenses(tenant_id, farm_id, expense_date);
CREATE INDEX idx_expenses_approval_status ON expenses(approval_status, recorded_by_user_id);
CREATE INDEX idx_expenses_type_date ON expenses(expense_type, expense_date);
CREATE INDEX idx_expenses_farm_date ON expenses(farm_id, expense_date);
```

**Constraints:**
```sql
ALTER TABLE expenses ADD CONSTRAINT expenses_type_check 
  CHECK (expense_type IN ('feed', 'medicine', 'labor', 'equipment', 'utilities', 
                          'transport', 'veterinary', 'animal_hire', 'other'));

ALTER TABLE expenses ADD CONSTRAINT expenses_approval_status_check 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));
```

---

### 30. expense_history

**Purpose**: Track changes to expense records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| history_id | SERIAL | PRIMARY KEY | Unique history identifier |
| expense_id | INTEGER | NOT NULL, FK → expenses(expense_id) | Expense reference |
| data | JSONB | NOT NULL | Complete expense data snapshot |
| changed_fields | JSONB | DEFAULT '[]' | List of changed fields |
| changed_by_user_id | INTEGER | FK → users(user_id) | User who made change |
| change_reason | TEXT | NULL | Reason for change |
| created_at | TIMESTAMP | NOT NULL | Change timestamp |

**Indexes:**
```sql
CREATE INDEX idx_expense_history_expense ON expense_history(expense_id, created_at);
```

---

### 31. animal_sales

**Purpose**: Animal sale records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| sale_id | SERIAL | PRIMARY KEY | Unique sale identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal sold |
| sale_price | DECIMAL(12,2) | NOT NULL | Sale price |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| sale_date | DATE | NOT NULL | Sale date |
| buyer_name | VARCHAR(200) | NULL | Buyer name |
| buyer_contact | VARCHAR(100) | NULL | Buyer contact |
| buyer_address | TEXT | NULL | Buyer address |
| payment_method | VARCHAR(50) | DEFAULT 'cash' | Payment method |
| payment_status | VARCHAR(20) | DEFAULT 'pending' | Payment status |
| amount_paid | DECIMAL(12,2) | DEFAULT 0 | Amount paid |
| receipt_url | VARCHAR(500) | NULL | Receipt URL |
| invoice_id | INTEGER | FK → sales_invoices(invoice_id) | Related invoice |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_animal_sales_tenant_farm_date ON animal_sales(tenant_id, farm_id, sale_date);
CREATE INDEX idx_animal_sales_animal ON animal_sales(animal_id);
CREATE INDEX idx_animal_sales_payment_status ON animal_sales(payment_status);
```

**Constraints:**
```sql
ALTER TABLE animal_sales ADD CONSTRAINT animal_sales_payment_method_check 
  CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'check'));

ALTER TABLE animal_sales ADD CONSTRAINT animal_sales_payment_status_check 
  CHECK (payment_status IN ('pending', 'partial', 'paid'));
```

---

### 32. product_sales

**Purpose**: Product sale records (milk, eggs, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| product_sale_id | SERIAL | PRIMARY KEY | Unique sale identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| product_type | VARCHAR(50) | NOT NULL | Product type |
| animal_id | INTEGER | FK → animals(animal_id) | Source animal (optional) |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity sold |
| unit | VARCHAR(20) | NOT NULL | Unit of measure |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit |
| total_amount | DECIMAL(12,2) | NOT NULL | Total amount |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| sale_date | DATE | NOT NULL | Sale date |
| customer_name | VARCHAR(200) | NULL | Customer name |
| customer_contact | VARCHAR(100) | NULL | Customer contact |
| payment_method | VARCHAR(50) | DEFAULT 'cash' | Payment method |
| payment_status | VARCHAR(20) | DEFAULT 'paid' | Payment status |
| invoice_id | INTEGER | FK → sales_invoices(invoice_id) | Related invoice |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_product_sales_tenant_farm_date ON product_sales(tenant_id, farm_id, sale_date);
CREATE INDEX idx_product_sales_type_date ON product_sales(product_type, sale_date);
CREATE INDEX idx_product_sales_animal ON product_sales(animal_id);
```

**Constraints:**
```sql
ALTER TABLE product_sales ADD CONSTRAINT product_sales_type_check 
  CHECK (product_type IN ('milk', 'eggs', 'wool', 'honey', 'meat', 'other'));

ALTER TABLE product_sales ADD CONSTRAINT product_sales_unit_check 
  CHECK (unit IN ('liters', 'kg', 'pieces', 'dozen'));
```

---

### 33. sales_invoices

**Purpose**: Sales invoices for customers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| invoice_id | SERIAL | PRIMARY KEY | Unique invoice identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| invoice_number | VARCHAR(50) | NOT NULL | Invoice number |
| customer_name | VARCHAR(200) | NOT NULL | Customer name |
| customer_email | VARCHAR(255) | NULL | Customer email |
| customer_phone | VARCHAR(50) | NULL | Customer phone |
| customer_address | TEXT | NULL | Customer address |
| invoice_date | DATE | NOT NULL | Invoice date |
| due_date | DATE | NOT NULL | Payment due date |
| subtotal | DECIMAL(12,2) | NOT NULL | Subtotal |
| tax_rate | DECIMAL(5,2) | DEFAULT 0 | Tax rate % |
| tax_amount | DECIMAL(12,2) | DEFAULT 0 | Tax amount |
| discount_amount | DECIMAL(12,2) | DEFAULT 0 | Discount |
| total_amount | DECIMAL(12,2) | NOT NULL | Total amount |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| status | VARCHAR(20) | DEFAULT 'draft' | Invoice status |
| amount_paid | DECIMAL(12,2) | DEFAULT 0 | Amount paid |
| pdf_url | VARCHAR(500) | NULL | PDF URL |
| notes | TEXT | NULL | Notes |
| terms | TEXT | NULL | Terms and conditions |
| created_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Creator |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_sales_invoices_tenant_number ON sales_invoices(tenant_id, invoice_number);
CREATE INDEX idx_sales_invoices_status_due ON sales_invoices(status, due_date);
CREATE INDEX idx_sales_invoices_customer ON sales_invoices(customer_name);
```

**Constraints:**
```sql
ALTER TABLE sales_invoices ADD CONSTRAINT sales_invoices_status_check 
  CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));
```

---

### 34. invoice_line_items

**Purpose**: Line items for sales invoices

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| line_item_id | SERIAL | PRIMARY KEY | Unique line item identifier |
| invoice_id | INTEGER | NOT NULL, FK → sales_invoices(invoice_id) | Invoice reference |
| description | VARCHAR(500) | NOT NULL | Item description |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity |
| unit | VARCHAR(50) | NOT NULL | Unit |
| unit_price | DECIMAL(12,2) | NOT NULL | Unit price |
| line_total | DECIMAL(12,2) | NOT NULL | Line total |
| animal_sale_id | INTEGER | FK → animal_sales(sale_id) | Related animal sale |
| product_sale_id | INTEGER | FK → product_sales(product_sale_id) | Related product sale |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
```

---

### 35. purchase_invoices

**Purpose**: Purchase invoices from vendors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| invoice_id | SERIAL | PRIMARY KEY | Unique invoice identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| invoice_number | VARCHAR(50) | NOT NULL | Invoice number |
| vendor_name | VARCHAR(200) | NOT NULL | Vendor name |
| vendor_email | VARCHAR(255) | NULL | Vendor email |
| vendor_phone | VARCHAR(50) | NULL | Vendor phone |
| invoice_date | DATE | NOT NULL | Invoice date |
| due_date | DATE | NOT NULL | Payment due date |
| subtotal | DECIMAL(12,2) | NOT NULL | Subtotal |
| tax_amount | DECIMAL(12,2) | DEFAULT 0 | Tax amount |
| total_amount | DECIMAL(12,2) | NOT NULL | Total amount |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| status | VARCHAR(20) | DEFAULT 'pending' | Invoice status |
| pdf_url | VARCHAR(500) | NULL | PDF URL |
| notes | TEXT | NULL | Notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_purchase_invoices_tenant_status ON purchase_invoices(tenant_id, status);
CREATE INDEX idx_purchase_invoices_due_date ON purchase_invoices(due_date);
```

**Constraints:**
```sql
ALTER TABLE purchase_invoices ADD CONSTRAINT purchase_invoices_status_check 
  CHECK (status IN ('pending', 'approved', 'paid', 'overdue'));
```

---

**Continue in next file...**


