# iFarm Database Schema - Part 2: Farm & Animal Tables

## Layer Architecture Context

This document defines **Layer 7: Database Layer** tables for farms and animals. These tables are accessed through:

- **Layer 6 (Data Access)**: Custom managers (`TenantManager`, `FarmManager`) automatically filter queries
- **Layer 5 (Business Logic)**: Services enforce business rules before data access
- **Layer 4 (API)**: ViewSets call services which use managers to query these tables

**Key Layer Features**:
- **Automatic Filtering**: `TenantManager` adds `tenant_id` filter automatically
- **Farm-Level Access**: `FarmManager` adds `farm_id IN (accessible_farms)` filter
- **Query Optimization**: Indexes on `(tenant_id, farm_id)` for fast filtering
- **Data Integrity**: Foreign keys and constraints enforce relationships

---

## Farm & Animal Tables

### 12. farms

**Purpose**: Farm locations and details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| farm_id | SERIAL | PRIMARY KEY | Unique farm identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_name | VARCHAR(255) | NOT NULL | Farm name |
| farm_code | VARCHAR(50) | NOT NULL | Unique farm code |
| farm_type | VARCHAR(50) | NOT NULL | cattle, poultry, mixed, etc. |
| size_acres | DECIMAL(10,2) | NULL | Farm size in acres |
| location | VARCHAR(255) | NULL | Location description |
| district | VARCHAR(100) | NULL | District |
| region | VARCHAR(100) | NULL | Region |
| country | VARCHAR(100) | DEFAULT 'Uganda' | Country |
| latitude | DECIMAL(10,7) | NULL | GPS latitude |
| longitude | DECIMAL(10,7) | NULL | GPS longitude |
| address | TEXT | NULL | Full address |
| contact_person | VARCHAR(200) | NULL | Contact person |
| contact_phone | VARCHAR(20) | NULL | Contact phone |
| contact_email | VARCHAR(255) | NULL | Contact email |
| farm_manager_user_id | INTEGER | FK → users(user_id) | Farm manager |
| established_date | DATE | NULL | Farm establishment date |
| description | TEXT | NULL | Farm description |
| logo_id | INTEGER | FK → media_files(file_id) | Farm logo |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_farms_tenant ON farms(tenant_id);
CREATE UNIQUE INDEX idx_farms_tenant_code ON farms(tenant_id, farm_code);
CREATE INDEX idx_farms_tenant_active ON farms(tenant_id, is_active);
CREATE INDEX idx_farms_location ON farms(latitude, longitude);
```

**Constraints:**
```sql
ALTER TABLE farms ADD CONSTRAINT farms_farm_type_check 
  CHECK (farm_type IN ('cattle', 'poultry', 'goats', 'sheep', 'pigs', 'mixed', 'other'));
```

---

### 13. user_farms

**Purpose**: User-Farm access assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| access_level | VARCHAR(20) | DEFAULT 'read' | Access level |
| assigned_at | TIMESTAMP | NOT NULL | Assignment time |
| assigned_by_user_id | INTEGER | FK → users(user_id) | Assigner reference |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_user_farms_user_farm ON user_farms(user_id, farm_id);
CREATE INDEX idx_user_farms_farm ON user_farms(farm_id);
```

**Constraints:**
```sql
ALTER TABLE user_farms ADD CONSTRAINT user_farms_access_level_check 
  CHECK (access_level IN ('read', 'write', 'admin'));
```

---

### 14. animals

**Purpose**: Animal records with complete lifecycle tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| animal_id | SERIAL | PRIMARY KEY | Unique animal identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| tag_number | VARCHAR(100) | NOT NULL | Unique tag/ID |
| name | VARCHAR(200) | NULL | Animal name |
| animal_type | VARCHAR(50) | NOT NULL | cattle, goat, sheep, poultry, etc. |
| breed | VARCHAR(100) | NULL | Breed |
| gender | VARCHAR(10) | NOT NULL | male, female |
| date_of_birth | DATE | NULL | Birth date |
| age_months | INTEGER | NULL | Age in months |
| acquisition_method | VARCHAR(50) | NOT NULL | How acquired |
| acquisition_date | DATE | NOT NULL | Acquisition date |
| acquisition_cost | DECIMAL(12,2) | NULL | Purchase cost |
| current_weight | DECIMAL(8,2) | NULL | Current weight (kg) |
| color_markings | TEXT | NULL | Physical description |
| status | VARCHAR(20) | DEFAULT 'active' | Animal status |
| disposal_method | VARCHAR(50) | NULL | If disposed |
| disposal_date | DATE | NULL | Disposal date |
| disposal_reason | TEXT | NULL | Disposal reason |
| dam_id | INTEGER | FK → animals(animal_id) | Mother reference |
| sire_id | INTEGER | FK → animals(animal_id) | Father reference |
| is_castrated | BOOLEAN | DEFAULT FALSE | Castration status |
| castration_date | DATE | NULL | Castration date |
| castration_method | VARCHAR(50) | NULL | surgical, banding, chemical |
| photo_id | INTEGER | FK → media_files(file_id) | Animal photo |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_animals_tenant_farm ON animals(tenant_id, farm_id);
CREATE UNIQUE INDEX idx_animals_tenant_tag ON animals(tenant_id, tag_number);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_type ON animals(animal_type);
CREATE INDEX idx_animals_farm_type_status ON animals(farm_id, animal_type, status);
CREATE INDEX idx_animals_dam ON animals(dam_id);
CREATE INDEX idx_animals_sire ON animals(sire_id);
```

**Constraints:**
```sql
ALTER TABLE animals ADD CONSTRAINT animals_gender_check 
  CHECK (gender IN ('male', 'female'));

ALTER TABLE animals ADD CONSTRAINT animals_status_check 
  CHECK (status IN ('active', 'sold', 'dead', 'stolen', 'slaughtered', 'gifted', 'transferred'));

ALTER TABLE animals ADD CONSTRAINT animals_acquisition_method_check 
  CHECK (acquisition_method IN ('birth', 'purchase', 'gift', 'transfer', 'other'));

ALTER TABLE animals ADD CONSTRAINT animals_disposal_method_check 
  CHECK (disposal_method IN ('sale', 'death', 'theft', 'slaughter', 'gift', 'transfer', 'other'));
```

---

### 15. animal_history

**Purpose**: Historical snapshots of animal records for point-in-time queries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| history_id | SERIAL | PRIMARY KEY | Unique history identifier |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal reference |
| data | JSONB | NOT NULL | Complete animal data snapshot |
| changed_fields | JSONB | DEFAULT '[]' | List of changed fields |
| changed_by_user_id | INTEGER | FK → users(user_id) | User who made change |
| change_reason | TEXT | NULL | Reason for change |
| created_at | TIMESTAMP | NOT NULL | Change timestamp |

**Indexes:**
```sql
CREATE INDEX idx_animal_history_animal ON animal_history(animal_id, created_at);
CREATE INDEX idx_animal_history_created ON animal_history(created_at);
```

---

## Production & Veterinary Tables

### 16. production

**Purpose**: Production records with enhanced milk tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| production_id | SERIAL | PRIMARY KEY | Unique production identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| production_type | VARCHAR(20) | NOT NULL | milk, eggs, wool, honey |
| animal_id | INTEGER | FK → animals(animal_id) | Animal reference |
| animal_group_id | INTEGER | NULL | Group reference (for eggs) |
| production_date | DATE | NOT NULL | Production date |
| production_datetime | TIMESTAMP | NULL | Exact timestamp (optional) |
| milking_session | VARCHAR(20) | NULL | morning, evening, midday, custom |
| session_number | INTEGER | DEFAULT 1 | Session number per day (1, 2, 3...) |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity produced |
| unit | VARCHAR(20) | NOT NULL | liters, kg, pieces, dozen |
| fat_content | DECIMAL(5,2) | NULL | Fat % (milk quality) |
| protein_content | DECIMAL(5,2) | NULL | Protein % (milk quality) |
| somatic_cell_count | INTEGER | NULL | SCC per ml (milk quality) |
| temperature | DECIMAL(5,2) | NULL | Temperature in Celsius |
| ph_level | DECIMAL(4,2) | NULL | pH level |
| lactose_content | DECIMAL(5,2) | NULL | Lactose % |
| milking_method | VARCHAR(20) | NULL | manual, machine, automatic |
| milking_duration | INTEGER | NULL | Minutes |
| milker_user_id | INTEGER | FK → users(user_id) | User who milked |
| udder_condition | VARCHAR(20) | NULL | normal, swollen, injured |
| milk_appearance | VARCHAR(20) | NULL | normal, watery, clotted, bloody |
| quality_notes | TEXT | NULL | Quality observations |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_production_tenant_farm_date ON production(tenant_id, farm_id, production_date);
CREATE INDEX idx_production_animal_date ON production(animal_id, production_date);
CREATE INDEX idx_production_type_date ON production(production_type, production_date);
CREATE INDEX idx_production_date ON production(production_date);
CREATE UNIQUE INDEX idx_production_unique_session ON production(animal_id, production_date, milking_session, session_number) 
  WHERE animal_id IS NOT NULL;
```

**Constraints:**
```sql
ALTER TABLE production ADD CONSTRAINT production_type_check 
  CHECK (production_type IN ('milk', 'eggs', 'wool', 'honey'));

ALTER TABLE production ADD CONSTRAINT production_unit_check 
  CHECK (unit IN ('liters', 'kg', 'pieces', 'dozen'));

ALTER TABLE production ADD CONSTRAINT production_session_check 
  CHECK (milking_session IN ('morning', 'evening', 'midday', 'custom'));

ALTER TABLE production ADD CONSTRAINT production_method_check 
  CHECK (milking_method IN ('manual', 'machine', 'automatic'));
```

---

### 17. daily_production_summary

**Purpose**: Aggregated daily production for fast queries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| summary_id | SERIAL | PRIMARY KEY | Unique summary identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | FK → animals(animal_id) | Animal reference |
| production_type | VARCHAR(20) | NOT NULL | Production type |
| summary_date | DATE | NOT NULL | Summary date |
| total_quantity | DECIMAL(10,2) | NOT NULL | Total for day |
| session_count | INTEGER | DEFAULT 0 | Number of sessions |
| average_quantity_per_session | DECIMAL(10,2) | NOT NULL | Average per session |
| average_fat_content | DECIMAL(5,2) | NULL | Average fat % |
| average_protein_content | DECIMAL(5,2) | NULL | Average protein % |
| average_scc | INTEGER | NULL | Average SCC |
| first_milking_time | TIME | NULL | First session time |
| last_milking_time | TIME | NULL | Last session time |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_daily_summary_unique ON daily_production_summary(animal_id, summary_date, production_type);
CREATE INDEX idx_daily_summary_tenant_farm_date ON daily_production_summary(tenant_id, farm_id, summary_date);
CREATE INDEX idx_daily_summary_animal_date ON daily_production_summary(animal_id, summary_date);
```

---

### 18. health_checks

**Purpose**: Routine health examinations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| health_check_id | SERIAL | PRIMARY KEY | Unique check identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal reference |
| check_date | DATE | NOT NULL | Examination date |
| performed_by | VARCHAR(200) | NOT NULL | Veterinarian name |
| veterinarian_id | INTEGER | FK → users(user_id) | Vet user reference |
| weight | DECIMAL(8,2) | NULL | Weight in kg |
| temperature | DECIMAL(4,2) | NULL | Body temperature |
| heart_rate | INTEGER | NULL | Beats per minute |
| respiratory_rate | INTEGER | NULL | Breaths per minute |
| body_condition_score | DECIMAL(3,1) | NULL | BCS (1-5 scale) |
| overall_health | VARCHAR(20) | DEFAULT 'good' | Health status |
| symptoms | TEXT | NULL | Symptoms observed |
| diagnosis | TEXT | NULL | Diagnosis |
| treatment_plan | TEXT | NULL | Treatment recommendations |
| next_check_date | DATE | NULL | Next check date |
| certificate_id | INTEGER | FK → media_files(file_id) | Certificate document |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_health_checks_animal_date ON health_checks(animal_id, check_date);
CREATE INDEX idx_health_checks_tenant_farm ON health_checks(tenant_id, farm_id);
CREATE INDEX idx_health_checks_next_date ON health_checks(next_check_date);
```

**Constraints:**
```sql
ALTER TABLE health_checks ADD CONSTRAINT health_checks_overall_health_check 
  CHECK (overall_health IN ('excellent', 'good', 'fair', 'poor', 'critical'));
```

---

### 19. vaccinations

**Purpose**: Vaccination records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vaccination_id | SERIAL | PRIMARY KEY | Unique vaccination identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal reference |
| vaccine_name | VARCHAR(200) | NOT NULL | Vaccine name |
| vaccine_type | VARCHAR(100) | NOT NULL | Vaccine type |
| disease_prevented | VARCHAR(200) | NOT NULL | Disease name |
| vaccination_date | DATE | NOT NULL | Administration date |
| administered_by | VARCHAR(200) | NOT NULL | Administrator name |
| veterinarian_id | INTEGER | FK → users(user_id) | Vet user reference |
| dosage | VARCHAR(100) | NOT NULL | Dosage amount |
| route | VARCHAR(50) | NOT NULL | Administration route |
| batch_number | VARCHAR(100) | NULL | Vaccine batch number |
| expiry_date | DATE | NULL | Vaccine expiry |
| cost | DECIMAL(10,2) | NULL | Vaccination cost |
| next_vaccination_date | DATE | NULL | Next dose date |
| adverse_reactions | TEXT | NULL | Side effects |
| certificate_id | INTEGER | FK → media_files(file_id) | Certificate |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_vaccinations_animal_date ON vaccinations(animal_id, vaccination_date);
CREATE INDEX idx_vaccinations_tenant_farm ON vaccinations(tenant_id, farm_id);
CREATE INDEX idx_vaccinations_next_date ON vaccinations(next_vaccination_date);
CREATE INDEX idx_vaccinations_disease ON vaccinations(disease_prevented);
```

**Constraints:**
```sql
ALTER TABLE vaccinations ADD CONSTRAINT vaccinations_route_check 
  CHECK (route IN ('intramuscular', 'subcutaneous', 'oral', 'intranasal', 'intravenous'));
```

---

### 20. treatments

**Purpose**: Medical treatments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| treatment_id | SERIAL | PRIMARY KEY | Unique treatment identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal reference |
| health_check_id | INTEGER | FK → health_checks(health_check_id) | Related check |
| treatment_date | DATE | NOT NULL | Treatment date |
| condition | VARCHAR(200) | NOT NULL | Condition treated |
| treatment_type | VARCHAR(50) | NOT NULL | Treatment type |
| medication | VARCHAR(200) | NULL | Medication name |
| dosage | VARCHAR(100) | NULL | Dosage amount |
| route | VARCHAR(50) | NULL | Administration route |
| duration_days | INTEGER | NULL | Treatment duration |
| performed_by | VARCHAR(200) | NOT NULL | Treating person |
| veterinarian_id | INTEGER | FK → users(user_id) | Vet user reference |
| cost | DECIMAL(10,2) | NULL | Treatment cost |
| withdrawal_period_days | INTEGER | NULL | Withdrawal period |
| outcome | VARCHAR(50) | NULL | Treatment outcome |
| follow_up_date | DATE | NULL | Follow-up date |
| prescription_id | INTEGER | FK → media_files(file_id) | Prescription document |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_treatments_animal_date ON treatments(animal_id, treatment_date);
CREATE INDEX idx_treatments_tenant_farm ON treatments(tenant_id, farm_id);
CREATE INDEX idx_treatments_follow_up ON treatments(follow_up_date);
CREATE INDEX idx_treatments_condition ON treatments(condition);
```

**Constraints:**
```sql
ALTER TABLE treatments ADD CONSTRAINT treatments_type_check 
  CHECK (treatment_type IN ('medication', 'surgery', 'therapy', 'wound_care', 'other'));

ALTER TABLE treatments ADD CONSTRAINT treatments_outcome_check 
  CHECK (outcome IN ('successful', 'ongoing', 'failed', 'deceased'));
```

---

### 21. weight_records

**Purpose**: Weight tracking over time

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| weight_record_id | SERIAL | PRIMARY KEY | Unique weight record identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal reference |
| weight_date | DATE | NOT NULL | Weigh date |
| weight | DECIMAL(8,2) | NOT NULL | Weight in kg |
| measurement_method | VARCHAR(50) | DEFAULT 'scale' | Measurement method |
| body_condition_score | DECIMAL(3,1) | NULL | BCS (1-5) |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_weight_records_animal_date ON weight_records(animal_id, weight_date);
CREATE INDEX idx_weight_records_tenant_farm ON weight_records(tenant_id, farm_id);
```

---

### 22. deworming

**Purpose**: Deworming treatment records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| deworming_id | SERIAL | PRIMARY KEY | Unique deworming identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | NOT NULL, FK → farms(farm_id) | Farm reference |
| animal_id | INTEGER | NOT NULL, FK → animals(animal_id) | Animal reference |
| deworming_date | DATE | NOT NULL | Treatment date |
| product_name | VARCHAR(200) | NOT NULL | Dewormer product |
| dosage | VARCHAR(100) | NOT NULL | Dosage amount |
| route | VARCHAR(50) | NOT NULL | Administration route |
| administered_by | VARCHAR(200) | NOT NULL | Administrator |
| cost | DECIMAL(10,2) | NULL | Treatment cost |
| next_deworming_date | DATE | NULL | Next treatment date |
| notes | TEXT | NULL | Additional notes |
| recorded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Recorder |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_deworming_animal_date ON deworming(animal_id, deworming_date);
CREATE INDEX idx_deworming_next_date ON deworming(next_deworming_date);
```

---

**Continue in next file...**

