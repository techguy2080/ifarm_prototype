# Phase 8: Animal Lineage & Pedigree Tracking

## Overview
Implement comprehensive lineage tracking to trace animal ancestry, track descendants, visualize family trees, and manage genetic information. This integrates with both internal animals and external breeding system.

**Key Capabilities:**
- Multi-generation ancestry tracking (parents, grandparents, etc.)
- Offspring and descendant tracking
- Visual pedigree charts and family trees
- Genetic traits and breeding values
- Inbreeding coefficient calculations
- Integration with external animals in lineage
- Pedigree certificates and reports
- Genetic diversity analytics

**Implementation Strategy**: 5 sequential chunks

---

## Chunk 1: Enhanced Lineage Data Structure

### Scope
Update data structures to properly support comprehensive lineage tracking with external animal integration.

### Files to Modify
1. `types/index.ts` - Enhance `Animal` interface and add lineage types
2. `lib/mockData.ts` - Add lineage data to existing animals
3. `lib/animalUtils.ts` - Add lineage calculation utilities

### Key Features
- Enhanced genetic_data structure
- Lineage tracking fields
- Genetic traits repository
- Breeding value tracking
- Parentage verification status

### Type Definitions

#### Enhanced Animal Interface
```typescript
export interface Animal {
  // ... existing fields ...
  mother_animal_id?: number; // Internal mother
  father_animal_id?: number; // Internal father
  external_mother_id?: number; // If mother is external
  external_father_id?: number; // If father is external
  
  genetic_data?: {
    lineage?: string; // Brief lineage description
    genetic_markers?: string[]; // Genetic markers
    breeding_value?: number; // Breeding value score
    parentage_verified: boolean;
    verification_method?: 'dna_test' | 'visual' | 'records' | 'unknown';
    verification_date?: string;
    sire_id?: number; // Deprecated - use father_animal_id
    dam_id?: number; // Deprecated - use mother_animal_id
    
    // New fields:
    inbreeding_coefficient?: number; // 0-1 scale
    genetic_diversity_score?: number; // 0-100 scale
    generation_number?: number; // Generation from foundation stock
    traits?: GeneticTrait[]; // Tracked genetic traits
    registration_number?: string; // Breed association registration
    breed_purity_percentage?: number; // % purebred
  };
}
```

#### New Types
```typescript
export interface GeneticTrait {
  trait_id: string;
  trait_name: string;
  trait_type: 'physical' | 'production' | 'health' | 'temperament';
  value: string | number;
  inherited_from?: 'mother' | 'father' | 'both' | 'unknown';
  confidence_level?: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface LineageNode {
  animal_id?: number;
  external_animal_id?: number;
  animal_type: 'internal' | 'external';
  tag_number: string;
  name?: string;
  breed?: string;
  gender: 'male' | 'female';
  birth_date?: string;
  farm_name?: string; // For external animals
  generation: number; // 0 = subject, 1 = parents, 2 = grandparents
  mother?: LineageNode;
  father?: LineageNode;
  traits?: GeneticTrait[];
  breeding_value?: number;
}

export interface PedigreeData {
  subject_animal_id: number;
  subject_animal: Animal;
  generations: number; // How many generations tracked
  maternal_line: LineageNode[];
  paternal_line: LineageNode[];
  inbreeding_coefficient?: number;
  common_ancestors?: Animal[];
  genetic_diversity_score?: number;
  total_ancestors_tracked: number;
  missing_ancestors: number;
  completeness_percentage: number;
}
```

### Utility Functions to Add
```typescript
// In lib/animalUtils.ts:

// Get all ancestors up to N generations
export function getAncestors(
  animalId: number,
  generations: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): LineageNode;

// Get all descendants (children, grandchildren, etc.)
export function getDescendants(
  animalId: number,
  animals: Animal[],
  breedingRecords: BreedingRecord[]
): Animal[];

// Calculate inbreeding coefficient
export function calculateInbreedingCoefficient(
  animalId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): number;

// Check for common ancestors in maternal and paternal lines
export function findCommonAncestors(
  animalId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): Animal[];

// Calculate generation number from foundation stock
export function calculateGenerationNumber(
  animalId: number,
  animals: Animal[]
): number;

// Build full pedigree data structure
export function buildPedigreeData(
  animalId: number,
  generations: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[],
  breedingRecords: BreedingRecord[]
): PedigreeData;
```

---

## Chunk 2: Lineage Visualization Page

### Scope
Create dedicated page for visualizing animal lineage with interactive pedigree charts.

### Files to Create/Modify
1. `app/dashboard/animals/lineage/page.tsx` - Main lineage page
2. `components/PedigreeChart.tsx` - Pedigree visualization component
3. `components/FamilyTreeChart.tsx` - Family tree component
4. `components/Sidebar.tsx` - Add "Lineage & Pedigree" link
5. `lib/permissions.ts` - Add page permissions

### Key Features
- Animal selection with search and filters
- Pedigree chart (ancestors) - traditional pedigree view
- Family tree (descendants) - tree view of offspring
- Generation selector (3, 4, 5, or more generations)
- Visual indicators for:
  - External animals (different color)
  - Missing lineage data (dashed lines)
  - High inbreeding (warning icons)
  - Verified parentage (checkmark icons)
- Click on any animal to view details or switch focus
- Export pedigree as PDF

### Pedigree Chart Layout
```
                    Great-Grandparents (Gen 3)
                        /              \
                Grandparents (Gen 2)    Grandparents (Gen 2)
                    /        \              /        \
            Parents (Gen 1)              Parents (Gen 1)
                Father                    Mother
                    \                      /
                      Subject Animal (Gen 0)
```

### Page Structure
- **Header Section**:
  - Title: "Animal Lineage & Pedigree"
  - Animal selector dropdown (with search)
  - Generation depth selector (3, 4, 5 generations)
  - Export buttons (PDF, Print)
  
- **Subject Animal Card**:
  - Photo, tag number, name, breed
  - Birth date, age, gender
  - Quick stats: Total offspring, breeding value, inbreeding coefficient
  - Links to animal details
  
- **Tabs**:
  - "Pedigree Chart" (ancestors)
  - "Family Tree" (descendants)
  - "Lineage Details"
  - "Genetic Analysis"
  
- **Pedigree Chart Tab**:
  - Interactive SVG chart showing ancestors
  - Color-coded by gender (blue males, pink females)
  - External animals in different shade/pattern
  - Hover tooltips with animal details
  - Click to view animal details or switch focus
  
- **Family Tree Tab**:
  - Tree view of all descendants
  - Group by generation
  - Show offspring count per animal
  - Link to breeding records

---

## Chunk 3: Lineage Details & Analysis

### Scope
Provide detailed lineage information, genetic analysis, and breeding recommendations.

### Files to Create/Modify
1. `app/dashboard/animals/lineage/page.tsx` - Add analysis tabs
2. `lib/animalUtils.ts` - Add genetic analysis functions

### Key Features in "Lineage Details" Tab
- **Maternal Line**:
  - Table listing all maternal ancestors
  - Columns: Generation, Tag, Name, Breed, Birth Date, Farm
  - External animals indicated
  
- **Paternal Line**:
  - Same structure as maternal line
  
- **Completeness Report**:
  - Total ancestors expected vs tracked
  - Completeness percentage by generation
  - Missing ancestors list
  - Recommendations for verification
  
- **Common Ancestors**:
  - List animals that appear in both maternal and paternal lines
  - Show generation(s) where they appear
  - Inbreeding risk warnings

### Key Features in "Genetic Analysis" Tab
- **Inbreeding Coefficient**:
  - Display coefficient value (0-1)
  - Visual gauge (green < 0.05, yellow 0.05-0.1, red > 0.1)
  - Explanation of what it means
  - Recommendations
  
- **Genetic Diversity Score**:
  - Score out of 100
  - Comparison to herd average
  - Factors contributing to score
  
- **Genetic Traits Inheritance**:
  - Table of tracked traits
  - Inherited from which parent
  - Expression in subject animal
  - Trait predictions for potential offspring
  
- **Breeding Value Analysis**:
  - Subject's breeding value
  - Parents' breeding values
  - Expected offspring breeding value
  - Comparison to herd average
  
- **Breeding Recommendations**:
  - Suggested mates to improve genetic diversity
  - Mates to avoid (high inbreeding risk)
  - Traits to target in mate selection
  - Expected outcomes with different mates

### Genetic Analysis Functions
```typescript
// In lib/animalUtils.ts:

export function analyzeGeneticDiversity(
  animalId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): {
  score: number;
  factors: string[];
  recommendations: string[];
};

export function predictOffspringTraits(
  dam: Animal,
  sire: Animal
): {
  trait: string;
  probability: number;
  inherited_from: 'mother' | 'father' | 'both';
}[];

export function findOptimalMates(
  animalId: number,
  animals: Animal[],
  breedingRecords: BreedingRecord[]
): {
  animal: Animal;
  compatibility_score: number;
  reasons: string[];
  expected_inbreeding: number;
}[];

export function assessInbreedingRisk(
  animalId: number,
  potentialMateId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): {
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
  inbreeding_coefficient: number;
  common_ancestors: Animal[];
  recommendation: string;
};
```

---

## Chunk 4: Lineage Integration with Breeding

### Scope
Integrate lineage tracking with breeding records and pregnancy management.

### Files to Modify
1. `app/dashboard/helper/pregnancy/page.tsx` - Add lineage warnings
2. `app/dashboard/animals/page.tsx` - Add lineage summary to animal details
3. `app/dashboard/helper/animals/page.tsx` - Add parent selection with lineage info

### Key Features in Pregnancy Page
- **Inbreeding Warnings**:
  - When creating breeding record, check for common ancestors
  - Display warning if inbreeding coefficient would exceed threshold
  - Show common ancestors and relationship
  - Allow override with acknowledgment
  
- **Mate Selection Enhancement**:
  - Show compatibility score for each potential sire
  - Display expected offspring breeding value
  - Show genetic diversity impact
  - Recommend best mates for genetic improvement
  
- **Lineage Quick View**:
  - Mini pedigree chart in breeding dialog (2 generations)
  - Click to view full pedigree

### Key Features in Animal Details
- **Lineage Summary Card**:
  - Generation number
  - Inbreeding coefficient
  - Genetic diversity score
  - Number of offspring
  - "View Full Pedigree" button
  
- **Parents Information**:
  - Mother details (with link or external farm info)
  - Father details (with link or external farm info)
  - Parentage verification status
  
- **Offspring List**:
  - Table of all offspring
  - Columns: Tag, Breed, Birth Date, Gender, Breeding Value
  - Link to each offspring's details
  - Link to breeding record

### Key Features in Animal Creation/Edit
- **Parent Selection**:
  - Dropdown for mother (female animals only)
  - Dropdown for father (male animals or "External Animal")
  - If external father:
    - Select external farm
    - Select external animal
    - Or quick add
  - Show lineage warning if creating inbred animal
  
- **Genetic Data Entry**:
  - Parentage verification method
  - Verification date
  - Registration number
  - Breed purity percentage
  - Initial genetic traits
  - Breeding value (if known)

---

## Chunk 5: Lineage Reports & Certificates

### Scope
Generate comprehensive lineage reports, pedigree certificates, and herd genetic analytics.

### Files to Create/Modify
1. `app/dashboard/reports/lineage/page.tsx` - Lineage reports page
2. `components/PedigreeCertificate.tsx` - Certificate component
3. `app/dashboard/analytics/genetics/page.tsx` - Genetic analytics dashboard
4. `components/Sidebar.tsx` - Add links

### Lineage Reports Page Features
- **Generate Pedigree Certificate**:
  - Select animal
  - Choose template (official, detailed, simple)
  - Include: Full pedigree (3-5 generations), registration numbers, genetic traits, breeding values
  - Export as PDF
  - Print-ready format
  
- **Lineage Report Types**:
  - **Individual Animal Pedigree**: Full ancestry and descendants
  - **Bloodline Report**: All animals from specific ancestor
  - **Inbreeding Report**: Animals with high inbreeding coefficients
  - **Genetic Diversity Report**: Herd-wide genetic analysis
  - **Breeding Value Report**: Animals ranked by breeding value
  - **Verification Status Report**: Animals with/without verified parentage
  
- **Report Filters**:
  - Animal type, breed, farm
  - Generation depth
  - Date range
  - Verification status
  - Inbreeding threshold

### Genetic Analytics Dashboard Features
- **Herd Genetic Overview**:
  - Average inbreeding coefficient
  - Average genetic diversity score
  - Average breeding value
  - Trends over time
  
- **Charts and Visualizations**:
  - **Inbreeding Distribution**: Histogram of inbreeding coefficients
  - **Genetic Diversity Trends**: Line chart over time
  - **Breeding Value Distribution**: Box plot by animal type/breed
  - **Generation Distribution**: Bar chart showing generation numbers
  - **Parentage Verification Status**: Pie chart
  
- **Genetic Health Indicators**:
  - Animals at risk (high inbreeding)
  - Recommended breeding pairs for genetic improvement
  - Genetic diversity alerts
  - Foundation animals (generation 1)
  
- **Lineage Completeness**:
  - Percentage of animals with complete lineage (3 generations)
  - Animals with missing parent data
  - External animals in lineage
  
- **Breeding Value Analytics**:
  - Top breeding value animals
  - Breeding value trends by line
  - Expected genetic gain
  
- **Action Items**:
  - Animals needing parentage verification
  - Breeding pairs to avoid (high inbreeding)
  - Recommended breeding pairs
  - Animals to consider for external breeding

### Pedigree Certificate Template
```
┌─────────────────────────────────────────────────────────┐
│              OFFICIAL PEDIGREE CERTIFICATE               │
│                    [Farm Name]                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Animal: [Tag Number] - [Name]                          │
│  Breed: [Breed]                                         │
│  Gender: [Gender]  Birth Date: [Date]                   │
│  Registration: [Number]                                 │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                     PEDIGREE                             │
│                                                          │
│                  Great-Grandparents                      │
│                  /              \                        │
│              Grandparents    Grandparents                │
│              /        \      /        \                  │
│          Father            Mother                        │
│              \              /                            │
│            [Subject Animal]                              │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Breeding Value: [Value]                                │
│  Inbreeding Coefficient: [Value]                        │
│  Genetic Diversity Score: [Value]                       │
│  Generation Number: [Number]                            │
│                                                          │
│  Parentage Verified: [Yes/No] - [Method]                │
│  Verification Date: [Date]                              │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Genetic Traits:                                        │
│  - [Trait 1]: [Value]                                   │
│  - [Trait 2]: [Value]                                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Certificate issued: [Date]                             │
│  Issued by: [User Name]                                 │
│                                                          │
│  [Farm Logo/Seal]                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Integration Points

### With External Breeding System (Phase 7)
- External animals can be parents in lineage
- Track lineage through external breeding
- Include external animals in pedigree charts
- Calculate inbreeding considering external animals
- Link pedigree to hire agreements

### With Breeding Records
- Auto-populate parent fields from breeding records
- Link offspring to parents automatically
- Verify parentage from breeding records
- Track breeding success by lineage
- Recommend breeding pairs based on lineage

### With Analytics
- Include lineage metrics in animal analytics
- Breeding value trends
- Genetic diversity reporting
- Inbreeding monitoring
- Breeding program effectiveness

### With Animal Management
- Display lineage summary in animal cards
- Quick links to view pedigree
- Parent/offspring navigation
- Lineage-based filtering
- Genetic data in animal profiles

---

## Implementation Order

1. **Chunk 1** → Enhanced Lineage Data Structure (foundation)
2. **Chunk 2** → Lineage Visualization Page (core visualization)
3. **Chunk 3** → Lineage Details & Analysis (genetic analysis)
4. **Chunk 4** → Lineage Integration with Breeding (breeding integration)
5. **Chunk 5** → Lineage Reports & Certificates (reporting & certificates)

---

## Key Benefits

1. **Breeding Program Management**:
   - Avoid inbreeding through relationship tracking
   - Improve genetic traits through selective breeding
   - Track breeding value improvements over generations
   
2. **Record Keeping**:
   - Complete ancestry documentation
   - Official pedigree certificates
   - Parentage verification tracking
   
3. **Value Addition**:
   - Animals with documented lineage have higher value
   - Ability to produce pedigree certificates
   - Breed association registration support
   
4. **Genetic Health**:
   - Monitor and manage inbreeding
   - Maintain genetic diversity
   - Identify and track valuable genetic lines
   
5. **Decision Support**:
   - Data-driven mate selection
   - Breeding recommendations
   - Risk assessment for genetic issues

---

## Technical Considerations

### Performance
- Cache lineage calculations for frequently accessed animals
- Limit default generation depth to 3-4 generations
- Lazy load deeper generations on demand
- Index parent_id fields for fast queries

### Data Integrity
- Validate parent-child relationships (dates, species)
- Prevent circular references
- Handle orphaned records gracefully
- Support partial lineage data

### External Animal Handling
- Clearly distinguish internal vs external in visualizations
- Handle missing data for external animals
- Allow manual entry of external animal lineage if known
- Support importing external pedigree data

### Scalability
- Efficient algorithms for inbreeding calculation
- Memoization for complex lineage queries
- Pagination for large offspring lists
- Optimized chart rendering for many generations






