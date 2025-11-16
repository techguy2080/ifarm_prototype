# Phase 5: Educational Content

## Overview
Modern farming skills library, disease information, and vaccine guides for farmers.

---

## 5.1 Modern Farming Skills Library

### Files to Modify
- Create `app/dashboard/resources/farming-skills/page.tsx`
- `types/index.ts` - Create EducationalContent interface

### Implementation Steps

#### Step 1: Create Educational Content Type
```typescript
// In types/index.ts:
export interface EducationalContent {
  content_id: number;
  title: string;
  category: 'breeding' | 'feeding' | 'health' | 'housing' | 'business' | 'general';
  content_type: 'article' | 'video' | 'guide' | 'tutorial';
  description: string;
  content?: string; // Full article text or video URL
  author?: string;
  published_date: string;
  tags: string[];
  reading_time_minutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}
```

#### Step 2: Add Mock Educational Content
```typescript
// In lib/mockData.ts:
export const mockEducationalContent: EducationalContent[] = [
  {
    content_id: 1,
    title: 'Modern Breeding Techniques for Dairy Cattle',
    category: 'breeding',
    content_type: 'article',
    description: 'Learn about artificial insemination, estrus detection, and breeding management for improved milk production.',
    content: 'Full article content here...',
    author: 'Dr. Agriculture Expert',
    published_date: '2024-01-15',
    tags: ['breeding', 'dairy', 'cattle', 'AI'],
    reading_time_minutes: 10,
    difficulty: 'intermediate',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    content_id: 2,
    title: 'Proper Feeding Schedules for Maximum Production',
    category: 'feeding',
    content_type: 'guide',
    description: 'Comprehensive guide on creating feeding schedules that maximize animal health and production.',
    tags: ['feeding', 'nutrition', 'schedules'],
    reading_time_minutes: 15,
    difficulty: 'beginner',
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    content_id: 3,
    title: 'Video: Animal Health Check Basics',
    category: 'health',
    content_type: 'video',
    description: 'Step-by-step video tutorial on performing basic health checks on your livestock.',
    content: 'https://youtube.com/watch?v=...',
    tags: ['health', 'tutorial', 'video'],
    reading_time_minutes: 8,
    difficulty: 'beginner',
    created_at: '2024-01-05T00:00:00Z'
  },
  // Add more content...
];
```

#### Step 3: Create Farming Skills Library Page
- Create `app/dashboard/resources/farming-skills/page.tsx`:
  - **Header Card**: "Modern Farming Skills & Techniques"
  - **Content Grid**:
    - Display content as cards
    - Show: title, category, type, description, tags
    - Difficulty badge
    - Reading time
  - **Filters**:
    - Filter by category
    - Filter by content type
    - Filter by difficulty
    - Search by title/tags
  - **Content Detail View**:
    - Full article display
    - Video player (if video)
    - Related content suggestions
    - Print/Save options

#### Step 4: Categories
- Organize content by:
  - **Breeding**: AI, natural breeding, estrus detection
  - **Feeding**: Nutrition, schedules, feed types
  - **Health**: Disease prevention, treatment, vaccination
  - **Housing**: Shelter design, ventilation, space requirements
  - **Business**: Financial management, marketing, record keeping
  - **General**: Miscellaneous farming topics

---

## 5.2 Disease & Vaccine Information

### Files to Modify
- Create `app/dashboard/resources/diseases/page.tsx`
- Create `app/dashboard/resources/vaccines/page.tsx`
- `types/index.ts` - Create DiseaseInfo and VaccineInfo interfaces

### Implementation Steps

#### Step 1: Create Disease & Vaccine Types
```typescript
// In types/index.ts:
export interface DiseaseInfo {
  disease_id: number;
  name: string;
  common_name?: string;
  animal_types: string[]; // Which animals are affected
  symptoms: string[];
  causes: string[];
  prevention: string[];
  treatment?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  contagious: boolean;
  mortality_rate?: string; // e.g., "10-20%"
  vaccine_available: boolean;
  related_vaccines?: number[]; // Vaccine IDs
  created_at: string;
}

export interface VaccineInfo {
  vaccine_id: number;
  name: string;
  manufacturer?: string;
  protects_against: string[]; // Disease names
  animal_types: string[]; // Which animals can receive
  administration_route: 'oral' | 'injection' | 'nasal' | 'topical';
  dosage: string;
  schedule: string; // e.g., "Annual", "Every 6 months"
  age_requirement?: string; // e.g., "3 months and older"
  storage_requirements?: string;
  side_effects?: string[];
  effectiveness?: string; // e.g., "95% effective"
  availability: 'widely_available' | 'limited' | 'prescription_only';
  created_at: string;
}
```

#### Step 2: Add Mock Disease Information
```typescript
// In lib/mockData.ts:
export const mockDiseaseInfo: DiseaseInfo[] = [
  {
    disease_id: 1,
    name: 'African Swine Fever',
    common_name: 'Swine Fever',
    animal_types: ['pig'],
    symptoms: [
      'High fever (40-42°C)',
      'Loss of appetite',
      'Lethargy',
      'Reddening of skin',
      'Difficulty breathing',
      'Vomiting and diarrhea'
    ],
    causes: [
      'Contact with infected pigs',
      'Contaminated feed',
      'Ticks (soft ticks)',
      'Contact with wild pigs'
    ],
    prevention: [
      'Quarantine new animals',
      'Control tick populations',
      'Avoid contact with wild pigs',
      'Disinfect equipment',
      'No vaccine available - prevention is key'
    ],
    treatment: [
      'No specific treatment',
      'Supportive care',
      'Isolate affected animals',
      'Report to veterinary authorities'
    ],
    severity: 'critical',
    contagious: true,
    mortality_rate: '90-100%',
    vaccine_available: false,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    disease_id: 2,
    name: 'Foot and Mouth Disease',
    common_name: 'FMD',
    animal_types: ['cattle', 'goat', 'sheep', 'pig'],
    symptoms: [
      'Fever',
      'Blisters in mouth and on feet',
      'Excessive salivation',
      'Lameness',
      'Reduced milk production'
    ],
    causes: [
      'Direct contact with infected animals',
      'Contaminated equipment',
      'Contaminated feed/water',
      'Airborne transmission'
    ],
    prevention: [
      'Vaccination',
      'Quarantine new animals',
      'Disinfect equipment and vehicles',
      'Control movement of animals',
      'Report suspected cases immediately'
    ],
    treatment: [
      'Supportive care',
      'Antibiotics for secondary infections',
      'Isolation',
      'Report to authorities'
    ],
    severity: 'high',
    contagious: true,
    mortality_rate: 'Low in adults, high in young',
    vaccine_available: true,
    related_vaccines: [1], // FMD Vaccine
    created_at: '2024-01-01T00:00:00Z'
  },
  // Add more diseases...
];
```

#### Step 3: Add Mock Vaccine Information
```typescript
// In lib/mockData.ts:
export const mockVaccineInfo: VaccineInfo[] = [
  {
    vaccine_id: 1,
    name: 'Foot and Mouth Disease Vaccine',
    manufacturer: 'Multiple manufacturers',
    protects_against: ['Foot and Mouth Disease'],
    animal_types: ['cattle', 'goat', 'sheep', 'pig'],
    administration_route: 'injection',
    dosage: '2ml per animal',
    schedule: 'Annual (or as recommended by vet)',
    age_requirement: '3 months and older',
    storage_requirements: 'Store at 2-8°C, protect from light',
    side_effects: ['Mild swelling at injection site', 'Temporary reduced appetite'],
    effectiveness: '85-95% effective',
    availability: 'widely_available',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    vaccine_id: 2,
    name: 'Newcastle Disease Vaccine',
    manufacturer: 'Various',
    protects_against: ['Newcastle Disease'],
    animal_types: ['chicken', 'duck'],
    administration_route: 'injection',
    dosage: '0.5ml per bird',
    schedule: 'Every 3-6 months',
    age_requirement: '2 weeks and older',
    storage_requirements: 'Refrigerate at 2-8°C',
    effectiveness: '90-95% effective',
    availability: 'widely_available',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Add more vaccines...
];
```

#### Step 4: Create Disease Information Page
- Create `app/dashboard/resources/diseases/page.tsx`:
  - **Header Card**: "Livestock Disease Information"
  - **Disease List**:
    - Cards or table showing diseases
    - Filter by animal type
    - Search by name
    - Sort by severity
  - **Disease Detail View**:
    - Full disease information
    - Symptoms list
    - Prevention measures
    - Treatment options
    - Related vaccines (if available)
    - Severity indicator

#### Step 5: Create Vaccine Guide Page
- Create `app/dashboard/resources/vaccines/page.tsx`:
  - **Header Card**: "Vaccine Guide & Information"
  - **Vaccine List**:
    - Cards showing vaccines
    - Filter by animal type
    - Filter by disease protected against
    - Search functionality
  - **Vaccine Detail View**:
    - Full vaccine information
    - Administration instructions
    - Dosage and schedule
    - Storage requirements
    - Side effects
    - Availability status
    - Related diseases

#### Step 6: Link Diseases to Vaccines
- Cross-reference:
  - Show which vaccines protect against each disease
  - Show which diseases each vaccine prevents
  - Link from disease page to vaccine page

---

## Checklist

- [ ] 5.1 Modern Farming Skills Library
  - [ ] Create EducationalContent type
  - [ ] Add mock educational content
  - [ ] Create farming skills library page
  - [ ] Add content categories
  - [ ] Add filters and search
  - [ ] Add content detail view

- [ ] 5.2 Disease & Vaccine Information
  - [ ] Create DiseaseInfo and VaccineInfo types
  - [ ] Add mock disease information
  - [ ] Add mock vaccine information
  - [ ] Create disease information page
  - [ ] Create vaccine guide page
  - [ ] Link diseases to vaccines

---

## Next Phase
Once Phase 5 is complete, proceed to `PHASE6_TRACEABILITY.md`

