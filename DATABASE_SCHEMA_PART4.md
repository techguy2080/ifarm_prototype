# iFarm Database Schema - Part 4: Inventory, Activities & Supporting Tables

## Inventory Tables

### 36. inventory_items

**Purpose**: Inventory items (supplies, equipment, feed, tools)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| item_id | SERIAL | PRIMARY KEY | Unique item identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| item_code | VARCHAR(50) | NOT NULL | Unique item code |
| item_name | VARCHAR(255) | NOT NULL | Item name |
| category | VARCHAR(50) | NOT NULL | Item category |
| subcategory | VARCHAR(100) | NULL | Subcategory |
| description | TEXT | NULL | Description |
| unit | VARCHAR(50) | NOT NULL | Unit of measure |
| current_stock | DECIMAL(10,2) | DEFAULT 0 | Current stock level |
| reorder_point | DECIMAL(10,2) | DEFAULT 0 | Reorder threshold |
| reorder_quantity | DECIMAL(10,2) | NULL | Reorder amount |
| unit_cost | DECIMAL(10,2) | NULL | Cost per unit |
| total_value | DECIMAL(12,2) | DEFAULT 0 | Total value (stock * unit cost) |
| supplier | VARCHAR(200) | NULL | Supplier name |
| supplier_contact | VARCHAR(100) | NULL | Supplier contact |
| location | VARCHAR(200) | NULL | Storage location |
| expiry_date | DATE | NULL | Expiry date |
| batch_number | VARCHAR(100) | NULL | Batch/lot number |
| barcode | VARCHAR(100) | NULL | Barcode |
| image_id | INTEGER | FK → media_files(file_id) | Item image |
| status | VARCHAR(20) | DEFAULT 'active' | Item status |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_inventory_items_tenant_code ON inventory_items(tenant_id, item_code);
CREATE INDEX idx_inventory_items_tenant_farm_category ON inventory_items(tenant_id, farm_id, category);
CREATE INDEX idx_inventory_items_stock_status ON inventory_items(current_stock, reorder_point);
CREATE INDEX idx_inventory_items_expiry ON inventory_items(expiry_date);
```

**Constraints:**
```sql
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_category_check 
  CHECK (category IN ('feed', 'medicine', 'equipment', 'tools', 'supplies', 'seeds', 'fertilizer', 'other'));

ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_status_check 
  CHECK (status IN ('active', 'discontinued', 'out_of_stock'));
```

---

### 37. inventory_movements

**Purpose**: Track inventory in/out movements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| movement_id | SERIAL | PRIMARY KEY | Unique movement identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| item_id | INTEGER | NOT NULL, FK → inventory_items(item_id) | Item reference |
| movement_type | VARCHAR(20) | NOT NULL | in, out, adjustment, transfer |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity moved |
| unit | VARCHAR(50) | NOT NULL | Unit of measure |
| movement_date | DATE | NOT NULL | Movement date |
| reason | VARCHAR(100) | NOT NULL | Reason for movement |
| reference_type | VARCHAR(50) | NULL | Reference entity type |
| reference_id | INTEGER | NULL | Reference entity ID |
| from_location | VARCHAR(200) | NULL | Source location |
| to_location | VARCHAR(200) | NULL | Destination location |
| cost_per_unit | DECIMAL(10,2) | NULL | Unit cost for this movement |
| total_cost | DECIMAL(12,2) | NULL | Total cost |
| batch_number | VARCHAR(100) | NULL | Batch/lot number |
| expiry_date | DATE | NULL | Expiry date |
| notes | TEXT | NULL | Additional notes |
| performed_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | User who performed |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_inventory_movements_item_date ON inventory_movements(item_id, movement_date);
CREATE INDEX idx_inventory_movements_tenant_farm_date ON inventory_movements(tenant_id, farm_id, movement_date);
CREATE INDEX idx_inventory_movements_type_date ON inventory_movements(movement_type, movement_date);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);
```

**Constraints:**
```sql
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_type_check 
  CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer'));

ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_reason_check 
  CHECK (reason IN ('purchase', 'usage', 'sale', 'waste', 'donation', 'count_adjustment', 'transfer', 'return', 'other'));
```

---

## Activity & Disposal Tables

### 38. activities

**Purpose**: Farm activities and tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| activity_id | SERIAL | PRIMARY KEY | Unique activity identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| activity_type | VARCHAR(50) | NOT NULL | Activity type |
| title | VARCHAR(255) | NOT NULL | Activity title |
| description | TEXT | NULL | Description |
| activity_date | DATE | NOT NULL | Activity date |
| start_time | TIME | NULL | Start time |
| end_time | TIME | NULL | End time |
| duration_minutes | INTEGER | NULL | Duration |
| animal_id | INTEGER | FK → animals(animal_id) | Related animal |
| assigned_to_user_id | INTEGER | FK → users(user_id) | Assigned user |
| status | VARCHAR(20) | DEFAULT 'pending' | Activity status |
| priority | VARCHAR(20) | DEFAULT 'medium' | Priority level |
| completion_notes | TEXT | NULL | Completion notes |
| completed_by_user_id | INTEGER | FK → users(user_id) | Completer |
| completed_at | TIMESTAMP | NULL | Completion timestamp |
| cost | DECIMAL(10,2) | NULL | Activity cost |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_activities_tenant_farm_date ON activities(tenant_id, farm_id, activity_date);
CREATE INDEX idx_activities_animal ON activities(animal_id);
CREATE INDEX idx_activities_assigned_status ON activities(assigned_to_user_id, status);
CREATE INDEX idx_activities_type_date ON activities(activity_type, activity_date);
```

**Constraints:**
```sql
ALTER TABLE activities ADD CONSTRAINT activities_type_check 
  CHECK (activity_type IN ('feeding', 'cleaning', 'vaccination', 'inspection', 
                           'breeding', 'treatment', 'maintenance', 'other'));

ALTER TABLE activities ADD CONSTRAINT activities_status_check 
  CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE activities ADD CONSTRAINT activities_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
```

---

### 39. weaning_records

**Purpose**: Weaning records for young animals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| weaning_id | SERIAL | PRIMARY KEY | Unique weaning identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal being weaned |
| dam_id | INTEGER | FK → animals(animal_id) | Mother |
| weaning_date | DATE | NOT NULL | Weaning date |
| weaning_age_days | INTEGER | NOT NULL | Age at weaning (days) |
| weaning_weight | DECIMAL(8,2) | NULL | Weight at weaning (kg) |
| weaning_method | VARCHAR(50) | DEFAULT 'natural' | Weaning method |
| health_status | VARCHAR(50) | DEFAULT 'good' | Health at weaning |
| stress_level | VARCHAR(20) | NULL | Observed stress level |
| post_weaning_diet | TEXT | NULL | Diet plan |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_weaning_animal_date ON weaning_records(animal_id, weaning_date);
CREATE INDEX idx_weaning_tenant_farm ON weaning_records(tenant_id, farm_id);
```

**Constraints:**
```sql
ALTER TABLE weaning_records ADD CONSTRAINT weaning_method_check 
  CHECK (weaning_method IN ('natural', 'gradual', 'abrupt'));

ALTER TABLE weaning_records ADD CONSTRAINT weaning_stress_check 
  CHECK (stress_level IN ('low', 'moderate', 'high'));
```

---

### 40. disposal_records

**Purpose**: Detailed disposal records for animals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| disposal_id | SERIAL | PRIMARY KEY | Unique disposal identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal disposed |
| disposal_method | VARCHAR(50) | NOT NULL | Disposal method |
| disposal_date | DATE | NOT NULL | Disposal date |
| reason | TEXT | NOT NULL | Disposal reason |
| buyer_name | VARCHAR(200) | NULL | Buyer (if sale) |
| buyer_contact | VARCHAR(100) | NULL | Buyer contact |
| sale_amount | DECIMAL(12,2) | NULL | Sale amount |
| carcass_weight | DECIMAL(8,2) | NULL | Carcass weight (kg) |
| meat_processing_facility | VARCHAR(200) | NULL | Processing facility |
| cause_of_death | TEXT | NULL | Cause (if death) |
| veterinary_certificate_id | INTEGER | FK → media_files(file_id) | Vet certificate |
| authority_notified | BOOLEAN | DEFAULT FALSE | Authority notification |
| authority_name | VARCHAR(200) | NULL | Authority name |
| notification_date | DATE | NULL | Notification date |
| compensation_received | DECIMAL(12,2) | NULL | Insurance compensation |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_disposal_animal ON disposal_records(animal_id);
CREATE INDEX idx_disposal_tenant_farm_date ON disposal_records(tenant_id, farm_id, disposal_date);
CREATE INDEX idx_disposal_method ON disposal_records(disposal_method);
```

**Constraints:**
```sql
ALTER TABLE disposal_records ADD CONSTRAINT disposal_method_check 
  CHECK (disposal_method IN ('sale', 'death', 'theft', 'slaughter', 'gift', 'transfer', 'other'));
```

---

## Media Tables

### 41. media_files

**Purpose**: Store media file metadata (images, documents, PDFs)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| file_id | SERIAL | PRIMARY KEY | Unique file identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_type | VARCHAR(100) | NOT NULL | MIME type |
| file_size | BIGINT | NOT NULL | File size in bytes |
| file_category | VARCHAR(50) | NOT NULL | File category |
| storage_bucket | VARCHAR(100) | NOT NULL | Supabase bucket name |
| storage_path | VARCHAR(500) | NOT NULL | File path in storage |
| public_url | VARCHAR(1000) | NOT NULL | Public access URL |
| thumbnail_url | VARCHAR(1000) | NULL | Thumbnail URL (for images) |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| entity_type | VARCHAR(50) | NULL | Related entity type |
| entity_id | INTEGER | NULL | Related entity ID |
| uploaded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Uploader |
| created_at | TIMESTAMP | NOT NULL | Upload timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_media_files_tenant_category ON media_files(tenant_id, file_category);
CREATE INDEX idx_media_files_entity ON media_files(entity_type, entity_id);
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by_user_id);
CREATE INDEX idx_media_files_created ON media_files(created_at);
```

**Constraints:**
```sql
ALTER TABLE media_files ADD CONSTRAINT media_files_category_check 
  CHECK (file_category IN ('profile_picture', 'animal_photo', 'farm_logo', 
                           'document', 'certificate', 'receipt', 'report', 'other'));
```

---

## Invitation & Delegation Tables

### 42. invitations

**Purpose**: User invitations to join tenant/farm

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| invitation_id | SERIAL | PRIMARY KEY | Unique invitation identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | FK → farms(farm_id) | Farm reference (optional) |
| email | VARCHAR(255) | NOT NULL | Invitee email |
| first_name | VARCHAR(150) | NOT NULL | First name |
| last_name | VARCHAR(150) | NOT NULL | Last name |
| phone | VARCHAR(20) | NULL | Phone number |
| role_id | INTEGER | NOT NULL, FK → roles(role_id) | Assigned role |
| invitation_token | UUID | UNIQUE, NOT NULL | Invitation token |
| status | VARCHAR(20) | DEFAULT 'pending' | Invitation status |
| expires_at | TIMESTAMP | NOT NULL | Expiration timestamp |
| accepted_at | TIMESTAMP | NULL | Acceptance timestamp |
| invited_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Inviter |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_invitations_tenant_status ON invitations(tenant_id, status);
CREATE UNIQUE INDEX idx_invitations_token ON invitations(invitation_token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_expires ON invitations(expires_at);
```

**Constraints:**
```sql
ALTER TABLE invitations ADD CONSTRAINT invitations_status_check 
  CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));
```

---

### 43. delegations

**Purpose**: Temporary permission delegations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| delegation_id | SERIAL | PRIMARY KEY | Unique delegation identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| delegator_user_id | INTEGER | NOT NULL, FK → users(user_id) | User delegating |
| delegate_user_id | INTEGER | NOT NULL, FK → users(user_id) | User receiving |
| role_id | INTEGER | FK → roles(role_id) | Delegated role |
| farm_id | INTEGER | FK → farms(farm_id) | Farm scope (optional) |
| start_date | TIMESTAMP | NOT NULL | Delegation start |
| end_date | TIMESTAMP | NOT NULL | Delegation end |
| reason | TEXT | NOT NULL | Delegation reason |
| status | VARCHAR(20) | DEFAULT 'active' | Delegation status |
| revoked_at | TIMESTAMP | NULL | Revocation timestamp |
| revoked_by_user_id | INTEGER | FK → users(user_id) | Revoker |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_delegations_delegate_status ON delegations(delegate_user_id, status);
CREATE INDEX idx_delegations_tenant_active ON delegations(tenant_id, status, end_date);
CREATE INDEX idx_delegations_delegator ON delegations(delegator_user_id);
```

**Junction Table: delegation_permissions**
```sql
CREATE TABLE delegation_permissions (
  delegation_id INTEGER NOT NULL REFERENCES delegations(delegation_id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (delegation_id, permission_id)
);
```

**Constraints:**
```sql
ALTER TABLE delegations ADD CONSTRAINT delegations_status_check 
  CHECK (status IN ('active', 'expired', 'revoked'));
```

---

**Continue in next file...**

