# Phase 1: Enhanced Animal Tracking & Health Records

## Overview
Foundation for all health features. Track weight, vaccinations, deworming, treatments, genetics, and disease detection for all animals.

---

## 1.1 Animal Weight Tracking

### Files to Modify
- `types/index.ts` - Add weight tracking to Animal interface
- `lib/mockData.ts` - Add weight history data
- `app/dashboard/animals/page.tsx` - Display weight and history
- `app/dashboard/helper/animals/page.tsx` - Add weight input to forms
- `app/dashboard/vet/animal-tracking/page.tsx` - Show weight trends

### Implementation Steps

#### Step 1: Update Types
```typescript
// In types/index.ts, add to Animal interface:
export interface Animal {
  // ... existing fields
  current_weight?: number;
  weight_history?: WeightRecord[];
}

export interface WeightRecord {
  weight_id: number;
  animal_id: number;
  weight: number;
  weight_date: string;
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}
```

#### Step 2: Add Mock Data
```typescript
// In lib/mockData.ts:
export const mockWeightRecords: WeightRecord[] = [
  {
    weight_id: 1,
    animal_id: 1,
    weight: 450,
    weight_date: '2024-01-15',
    notes: 'Regular checkup',
    recorded_by_user_id: 1,
    created_at: '2024-01-15T00:00:00Z'
  },
  // Add more records...
];
```

#### Step 3: Add Weight Input Form
- In `app/dashboard/helper/animals/page.tsx`:
  - Add weight field to create/edit animal dialog
  - Add date picker for weight recording
  - Add notes field for weight entry

#### Step 4: Display Weight History
- In `app/dashboard/animals/page.tsx`:
  - Add "Current Weight" column to table
  - Add "View Weight History" button that opens modal
  - Show weight chart/graph in modal

#### Step 5: Weight Trends
- In `app/dashboard/vet/animal-tracking/page.tsx`:
  - Add weight trend visualization
  - Show weight gain/loss over time

---

## 1.2 Detailed Vaccination Tracking

### Files to Modify
- `types/index.ts` - Create Vaccination interface
- `lib/mockData.ts` - Add mockVaccinations array
- `app/dashboard/vet/medications/page.tsx` - Add vaccination tab
- `app/dashboard/helper/animals/page.tsx` - Add vaccination form

### Implementation Steps

#### Step 1: Create Vaccination Type
```typescript
// In types/index.ts:
export interface Vaccination {
  vaccination_id: number;
  animal_id: number;
  vaccine_name: string;
  manufacturer?: string;
  batch_number?: string;
  date_administered: string;
  next_due_date?: string;
  veterinarian?: string;
  dosage?: string;
  route?: 'oral' | 'injection' | 'nasal' | 'topical';
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}
```

#### Step 2: Add Mock Vaccinations
```typescript
// In lib/mockData.ts:
export const mockVaccinations: Vaccination[] = [
  {
    vaccination_id: 1,
    animal_id: 1,
    vaccine_name: 'FMD Vaccine',
    manufacturer: 'ABC Pharma',
    batch_number: 'FMD-2024-001',
    date_administered: '2024-01-10',
    next_due_date: '2024-07-10',
    veterinarian: 'Dr. Smith',
    dosage: '2ml',
    route: 'injection',
    notes: 'Annual vaccination',
    recorded_by_user_id: 1,
    created_at: '2024-01-10T00:00:00Z'
  },
  // Add more...
];
```

#### Step 3: Add Vaccination Tab
- In `app/dashboard/vet/medications/page.tsx`:
  - Add tabs: "Medications", "Vaccinations", "Deworming"
  - Create vaccination table with columns:
    - Animal Tag
    - Vaccine Name
    - Date Administered
    - Next Due Date
    - Veterinarian
    - Actions (View/Edit)
  - Add "Record Vaccination" button

#### Step 4: Vaccination Form
- Create dialog form with fields:
  - Animal (dropdown)
  - Vaccine Name (text)
  - Manufacturer (text, optional)
  - Batch Number (text, optional)
  - Date Administered (date picker)
  - Next Due Date (date picker, optional)
  - Veterinarian (text, optional)
  - Dosage (text, optional)
  - Route (dropdown: oral, injection, nasal, topical)
  - Notes (textarea)

#### Step 5: Upcoming Vaccinations
- Add dashboard section showing animals with vaccinations due soon
- Filter by date range (next 7, 30, 90 days)

---

## 1.3 Deworming Tracking

### Files to Modify
- `types/index.ts` - Create Deworming interface
- `lib/mockData.ts` - Add mockDewormings array
- `app/dashboard/vet/medications/page.tsx` - Add deworming tab
- `app/dashboard/helper/animals/page.tsx` - Add deworming form

### Implementation Steps

#### Step 1: Create Deworming Type
```typescript
// In types/index.ts:
export interface Deworming {
  deworming_id: number;
  animal_id: number;
  dewormer_name: string;
  dosage: string;
  date_administered: string;
  next_due_date?: string;
  route?: 'oral' | 'injection' | 'topical';
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}
```

#### Step 2: Add Mock Dewormings
```typescript
// In lib/mockData.ts:
export const mockDewormings: Deworming[] = [
  {
    deworming_id: 1,
    animal_id: 1,
    dewormer_name: 'Albendazole',
    dosage: '10ml',
    date_administered: '2024-01-05',
    next_due_date: '2024-04-05',
    route: 'oral',
    notes: 'Regular deworming',
    recorded_by_user_id: 1,
    created_at: '2024-01-05T00:00:00Z'
  },
  // Add more...
];
```

#### Step 3: Add Deworming Tab
- In `app/dashboard/vet/medications/page.tsx`:
  - Add "Deworming" tab
  - Create table with columns:
    - Animal Tag
    - Dewormer Name
    - Dosage
    - Date Administered
    - Next Due Date
    - Actions

#### Step 4: Deworming Form
- Create dialog form with fields:
  - Animal (dropdown)
  - Dewormer Name (text)
  - Dosage (text)
  - Date Administered (date picker)
  - Next Due Date (date picker, optional)
  - Route (dropdown)
  - Notes (textarea)

---

## 1.4 Enhanced Treatment Records

### Files to Modify
- `types/index.ts` - Create Treatment interface
- `lib/mockData.ts` - Add mockTreatments array
- `app/dashboard/vet/animal-tracking/page.tsx` - Add treatment history
- `app/dashboard/vet/medications/page.tsx` - Link treatments

### Implementation Steps

#### Step 1: Create Treatment Type
```typescript
// In types/index.ts:
export interface Treatment {
  treatment_id: number;
  animal_id: number;
  diagnosis: string;
  treatment_type: 'medication' | 'surgery' | 'therapy' | 'other';
  medication?: string;
  dosage?: string;
  veterinarian: string;
  treatment_date: string;
  follow_up_date?: string;
  cost?: number;
  outcome?: 'recovered' | 'improving' | 'no_change' | 'worsened';
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}
```

#### Step 2: Add Mock Treatments
```typescript
// In lib/mockData.ts:
export const mockTreatments: Treatment[] = [
  {
    treatment_id: 1,
    animal_id: 1,
    diagnosis: 'Mastitis',
    treatment_type: 'medication',
    medication: 'Antibiotic Injection',
    dosage: '5ml daily for 5 days',
    veterinarian: 'Dr. Smith',
    treatment_date: '2024-01-20',
    follow_up_date: '2024-01-25',
    cost: 50000,
    outcome: 'recovered',
    notes: 'Animal responded well',
    recorded_by_user_id: 1,
    created_at: '2024-01-20T00:00:00Z'
  },
  // Add more...
];
```

#### Step 3: Add Treatment History Section
- In `app/dashboard/vet/animal-tracking/page.tsx`:
  - Add "Treatment History" section per animal
  - Show table with all treatments
  - Display diagnosis, treatment, outcome

#### Step 4: Link to Medications
- In `app/dashboard/vet/medications/page.tsx`:
  - Show which medications were used in treatments
  - Link treatment records to medication records

---

## 1.5 Genetic Data & Gene Tracking

### Files to Modify
- `types/index.ts` - Add genetic_data to Animal interface
- `app/dashboard/animals/page.tsx` - Add genetic data section
- `app/dashboard/helper/animals/page.tsx` - Add genetic input fields
- Create `app/dashboard/animals/genetics/page.tsx` - Genetics dashboard

### Implementation Steps

#### Step 1: Update Animal Type
```typescript
// In types/index.ts, add to Animal interface:
export interface Animal {
  // ... existing fields
  genetic_data?: {
    lineage?: string;
    genetic_markers?: string[];
    breeding_value?: number;
    parentage_verified: boolean;
    sire_id?: number;
    dam_id?: number;
  };
}
```

#### Step 2: Add Genetic Fields to Forms
- In `app/dashboard/helper/animals/page.tsx`:
  - Add "Sire" (father) dropdown
  - Add "Dam" (mother) dropdown
  - Add "Lineage" text field
  - Add "Genetic Markers" multi-select
  - Add "Breeding Value" number field
  - Add "Parentage Verified" checkbox

#### Step 3: Display Genetic Data
- In `app/dashboard/animals/page.tsx`:
  - Add genetic data section in animal detail view
  - Show family tree (sire, dam, offspring)
  - Display genetic markers

#### Step 4: Create Genetics Dashboard
- Create `app/dashboard/animals/genetics/page.tsx`:
  - List all animals with genetic data
  - Filter by breeding value
  - Show pedigree charts
  - Track genetic lineage

---

## 1.6 Disease Detection for All Animals

### Files to Modify
- `types/index.ts` - Create HealthCheck interface
- `lib/mockData.ts` - Add health check records
- `app/dashboard/vet/animal-tracking/page.tsx` - Add disease detection
- Create `app/dashboard/vet/disease-detection/page.tsx` - Disease dashboard

### Implementation Steps

#### Step 1: Create HealthCheck Type
```typescript
// In types/index.ts:
export interface HealthCheck {
  health_check_id: number;
  animal_id: number;
  animal_type: 'cattle' | 'goat' | 'sheep' | 'pig' | 'chicken' | 'duck' | 'other';
  check_date: string;
  appetite_level: 'normal' | 'reduced' | 'poor' | 'none';
  temperature?: number;
  symptoms: string[];
  disease_suspected: boolean;
  disease_type?: string; // Swine Fever, Foot and Mouth, Newcastle Disease, etc.
  risk_factors?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}
```

#### Step 2: Add Mock Health Checks
```typescript
// In lib/mockData.ts:
export const mockHealthChecks: HealthCheck[] = [
  {
    health_check_id: 1,
    animal_id: 1,
    animal_type: 'cattle',
    check_date: '2024-01-22',
    appetite_level: 'normal',
    temperature: 38.5,
    symptoms: [],
    disease_suspected: false,
    severity: 'low',
    recorded_by_user_id: 1,
    created_at: '2024-01-22T00:00:00Z'
  },
  {
    health_check_id: 2,
    animal_id: 5, // pig
    animal_type: 'pig',
    check_date: '2024-01-23',
    appetite_level: 'reduced',
    temperature: 40.2,
    symptoms: ['Fever', 'Lethargy', 'Loss of appetite'],
    disease_suspected: true,
    disease_type: 'Swine Fever',
    risk_factors: ['Contact with wild pigs', 'Recent introduction'],
    severity: 'high',
    notes: 'Isolate immediately',
    recorded_by_user_id: 1,
    created_at: '2024-01-23T00:00:00Z'
  },
  // Add more for different animal types...
];
```

#### Step 3: Add Disease Detection Section
- In `app/dashboard/vet/animal-tracking/page.tsx`:
  - Add "Health Checks" section
  - Show recent health checks per animal
  - Highlight animals with suspected diseases

#### Step 4: Create Disease Detection Dashboard
- Create `app/dashboard/vet/disease-detection/page.tsx`:
  - List all animals with disease alerts
  - Filter by animal type and disease type
  - Show appetite trends over time
  - Alert system for high-risk animals
  - Disease-specific monitoring:
    - Pigs: Swine Fever tracking
    - Cattle: Foot and Mouth Disease
    - Poultry: Newcastle Disease
    - Goats/Sheep: PPR, etc.

#### Step 5: Health Check Form
- Create form with fields:
  - Animal (dropdown)
  - Check Date (date picker)
  - Appetite Level (dropdown: normal, reduced, poor, none)
  - Temperature (number input)
  - Symptoms (multi-select or tags)
  - Disease Suspected (checkbox)
  - Disease Type (dropdown, shown if suspected)
  - Risk Factors (multi-select)
  - Severity (dropdown)
  - Notes (textarea)

---

## Checklist

- [ ] 1.1 Animal Weight Tracking
  - [ ] Update types
  - [ ] Add mock data
  - [ ] Add weight input form
  - [ ] Display weight history
  - [ ] Show weight trends

- [ ] 1.2 Detailed Vaccination Tracking
  - [ ] Create Vaccination type
  - [ ] Add mock vaccinations
  - [ ] Add vaccination tab
  - [ ] Create vaccination form
  - [ ] Show upcoming vaccinations

- [ ] 1.3 Deworming Tracking
  - [ ] Create Deworming type
  - [ ] Add mock dewormings
  - [ ] Add deworming tab
  - [ ] Create deworming form

- [ ] 1.4 Enhanced Treatment Records
  - [ ] Create Treatment type
  - [ ] Add mock treatments
  - [ ] Add treatment history section
  - [ ] Link to medications

- [ ] 1.5 Genetic Data & Gene Tracking
  - [ ] Update Animal type with genetic_data
  - [ ] Add genetic fields to forms
  - [ ] Display genetic data
  - [ ] Create genetics dashboard

- [ ] 1.6 Disease Detection for All Animals
  - [ ] Create HealthCheck type
  - [ ] Add mock health checks
  - [ ] Add disease detection section
  - [ ] Create disease detection dashboard
  - [ ] Create health check form

---

## Next Phase
Once Phase 1 is complete, proceed to `PHASE2_REPRODUCTION.md`





