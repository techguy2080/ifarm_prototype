# Phase 6: Traceability & Records

## Overview
Enhanced yield records with analytics and complete animal lifecycle tracking.

---

## 6.1 Enhanced Yield Records

### Files to Modify
- `app/dashboard/helper/production/page.tsx` - Enhance with analytics
- Add yield trends and comparisons

### Implementation Steps

#### Step 1: Add Yield Analytics Functions
```typescript
// In app/dashboard/helper/production/page.tsx or separate utility file:

// Calculate average yield per animal
const getAverageYield = (animalId: number, productionType: string) => {
  const records = mockProduction.filter(
    p => p.animal_id === animalId && p.production_type === productionType
  );
  if (records.length === 0) return 0;
  const total = records.reduce((sum, r) => sum + r.quantity, 0);
  return total / records.length;
};

// Calculate yield trends
const getYieldTrend = (animalId: number, productionType: string, days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recent = mockProduction.filter(
    p => p.animal_id === animalId && 
         p.production_type === productionType &&
         new Date(p.production_date) >= cutoffDate
  );
  
  const older = mockProduction.filter(
    p => p.animal_id === animalId && 
         p.production_type === productionType &&
         new Date(p.production_date) < cutoffDate
  );
  
  const recentAvg = recent.length > 0 
    ? recent.reduce((sum, r) => sum + r.quantity, 0) / recent.length 
    : 0;
  const olderAvg = older.length > 0 
    ? older.reduce((sum, r) => sum + r.quantity, 0) / older.length 
    : 0;
  
  return {
    recent: recentAvg,
    older: olderAvg,
    trend: recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable',
    change: recentAvg - olderAvg
  };
};
```

#### Step 2: Add Yield Analytics to Production Page
- In `app/dashboard/helper/production/page.tsx`:
  - **Yield Trends Chart**:
    - Line chart showing yield over time
    - Group by animal or production type
    - Show average yield line
  - **Yield Comparisons**:
    - Compare yields between animals
    - Compare yields by breed
    - Compare yields by time period
  - **Quality Trends**:
    - Track quality notes over time
    - Identify quality patterns
  - **Top Performers**:
    - List animals with highest yields
    - Show best production days
  - **Historical Analysis**:
    - Year-over-year comparisons
    - Seasonal patterns
    - Production forecasting (simple trend)

#### Step 3: Add Export Functionality
- Add "Export" button to production page
- Export to CSV or PDF:
  - All production records
  - Filtered records
  - Animal-specific reports
  - Date range reports

---

## 6.2 Complete Animal Lifecycle Tracking

### Files to Modify
- Create `app/dashboard/animals/[id]/page.tsx` - Detailed animal profile

### Implementation Steps

#### Step 1: Create Animal Profile Page
- Create `app/dashboard/animals/[id]/page.tsx`:
  - **Animal Information Card**:
    - Tag number, type, breed, gender
    - Birth date, age
    - Current weight
    - Health status
    - Farm location
    - Genetic data (if available)
  - **Timeline View**:
    - Chronological timeline of all events
    - Birth
    - Vaccinations
    - Deworming
    - Treatments
    - Breeding records
    - Production records
    - Weight records
    - Sales (if sold)
  - **Tabs or Sections**:
    - Overview
    - Health Records (vaccinations, deworming, treatments, health checks)
    - Breeding History
    - Production History
    - Weight History
    - Sales History (if applicable)
    - Genetic Lineage

#### Step 2: Aggregate All Records
```typescript
// Function to get all records for an animal
const getAnimalLifecycle = (animalId: number) => {
  return {
    animal: mockAnimals.find(a => a.animal_id === animalId),
    vaccinations: mockVaccinations.filter(v => v.animal_id === animalId),
    dewormings: mockDewormings.filter(d => d.animal_id === animalId),
    treatments: mockTreatments.filter(t => t.animal_id === animalId),
    healthChecks: mockHealthChecks.filter(h => h.animal_id === animalId),
    breedingRecords: mockBreedingRecords.filter(b => b.animal_id === animalId),
    productionRecords: mockProduction.filter(p => p.animal_id === animalId),
    weightRecords: mockWeightRecords.filter(w => w.animal_id === animalId),
    sales: mockAnimalSales.filter(s => s.animal_id === animalId),
  };
};
```

#### Step 3: Create Timeline Component
- Visual timeline showing:
  - All events in chronological order
  - Color-coded by event type:
    - Green: Birth, Production
    - Blue: Health (vaccinations, treatments)
    - Orange: Breeding
    - Red: Health issues
    - Gray: Sales/Deceased
  - Expandable event details
  - Filter by event type

#### Step 4: Add Statistics Section
- Show statistics:
  - Total production (milk, eggs, etc.)
  - Average production per day/month
  - Number of offspring
  - Total vaccinations
  - Total treatments
  - Weight gain/loss over time
  - Total revenue (if sold)

#### Step 5: Export Animal Records
- Add "Export Animal Records" button
- Export to PDF or CSV:
  - Complete animal profile
  - All health records
  - All production records
  - Breeding history
  - Complete timeline

#### Step 6: Add Navigation
- Add link to animal profile from:
  - Animals table
  - Production records
  - Health records
  - Breeding records
  - Sales records

---

## Checklist

- [ ] 6.1 Enhanced Yield Records
  - [ ] Add yield analytics functions
  - [ ] Add yield trends chart
  - [ ] Add yield comparisons
  - [ ] Add quality trends
  - [ ] Add top performers section
  - [ ] Add historical analysis
  - [ ] Add export functionality

- [ ] 6.2 Complete Animal Lifecycle Tracking
  - [ ] Create animal profile page
  - [ ] Add animal information card
  - [ ] Create timeline view
  - [ ] Aggregate all records function
  - [ ] Create timeline component
  - [ ] Add statistics section
  - [ ] Add export animal records
  - [ ] Add navigation links

---

## Implementation Complete! 🎉

Once all 6 phases are complete, you'll have:
- ✅ Complete health tracking (weight, vaccinations, deworming, treatments, genetics, disease detection)
- ✅ Enhanced reproduction and breeding analytics
- ✅ Operational management tools (inventory, schedules, alerts, location)
- ✅ Contact directories (vets, suppliers, buyers, emergency)
- ✅ Educational resources (farming skills, disease/vaccine info)
- ✅ Complete traceability (yield analytics, animal lifecycle)

All features will be integrated with the existing RBAC/ABAC permission system and follow the emerald theme design.





