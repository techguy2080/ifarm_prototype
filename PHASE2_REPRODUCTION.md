# Phase 2: Reproduction & Breeding Analytics

## Overview
Enhanced reproduction tracking, birth analytics, kidding season management, and birth statistics per animal.

---

## 2.1 Enhanced Reproduction Records

### Files to Modify
- `types/index.ts` - Enhance pregnancy/breeding records
- `app/dashboard/helper/pregnancy/page.tsx` - Add detailed fields
- `app/dashboard/animals/page.tsx` - Show reproduction history

### Implementation Steps

#### Step 1: Update Breeding/Pregnancy Types
```typescript
// In types/index.ts, enhance existing or create new:
export interface BreedingRecord {
  breeding_id: number;
  animal_id: number; // Female
  sire_id?: number; // Male (bull/buck)
  breeding_date: string;
  conception_date?: string;
  expected_due_date?: string;
  actual_birth_date?: string;
  birth_outcome?: 'successful' | 'stillborn' | 'aborted' | 'complications';
  offspring_count?: number;
  complications?: string;
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}
```

#### Step 2: Update Pregnancy Page
- In `app/dashboard/helper/pregnancy/page.tsx`:
  - Add "Conception Date" field
  - Add "Expected Due Date" (auto-calculate from conception)
  - Add "Actual Birth Date" field
  - Add "Birth Outcome" dropdown
  - Add "Offspring Count" number field
  - Add "Complications" textarea
  - Link to offspring animals

#### Step 3: Display Reproduction History
- In `app/dashboard/animals/page.tsx`:
  - Add "Reproduction History" section
  - Show all breeding records for female animals
  - Display: breeding date, sire, conception, birth date, outcome
  - Show offspring count and links to offspring

---

## 2.2 Birth Rate Analytics

### Files to Modify
- Create `app/dashboard/analytics/birth-rates/page.tsx`
- `lib/mockData.ts` - Add birth records with seasonal data

### Implementation Steps

#### Step 1: Create Birth Analytics Type
```typescript
// In types/index.ts:
export interface BirthAnalytics {
  month: string;
  year: number;
  birth_count: number;
  animal_type: string;
  season: 'dry' | 'wet';
}
```

#### Step 2: Add Birth Records
```typescript
// In lib/mockData.ts, enhance existing breeding records or create:
export const mockBirthRecords = [
  {
    birth_id: 1,
    animal_id: 1,
    mother_id: 1,
    father_id: 2,
    birth_date: '2024-03-15',
    season: 'dry',
    birth_outcome: 'successful',
    offspring_count: 1,
    // ... more fields
  },
  // Add records across different months/seasons
];
```

#### Step 3: Create Birth Analytics Dashboard
- Create `app/dashboard/analytics/birth-rates/page.tsx`:
  - **Chart 1**: Births by Month/Season
    - Line or bar chart showing births per month
    - Color-code by season (dry/wet)
  - **Chart 2**: Births by Animal Type
    - Pie or bar chart showing distribution
  - **Chart 3**: Birth Rate Trends
    - Year-over-year comparison
  - **Table**: Top Breeding Months
    - List months with highest birth rates
  - **Insights**:
    - Peak breeding season identification
    - Average births per month
    - Seasonal patterns

#### Step 4: Add Filters
- Filter by:
  - Date range
  - Animal type
  - Season
  - Farm

---

## 2.3 Kidding Season Tracking

### Files to Modify
- `app/dashboard/helper/pregnancy/page.tsx` - Add calendar view
- `app/dashboard/animals/page.tsx` - Show upcoming kidding dates

### Implementation Steps

#### Step 1: Add Calendar View
- In `app/dashboard/helper/pregnancy/page.tsx`:
  - Add tab: "List View" and "Calendar View"
  - Install/use calendar component (react-big-calendar or similar)
  - Show expected due dates on calendar
  - Color-code by:
    - Upcoming (green)
    - Due this week (yellow)
    - Overdue (red)
    - Completed (gray)

#### Step 2: Kidding Alerts
- Add alert section showing:
  - Animals due in next 7 days
  - Animals due in next 30 days
  - Overdue animals (past due date, no birth recorded)

#### Step 3: Show Upcoming Kidding
- In `app/dashboard/animals/page.tsx`:
  - Add "Upcoming Births" section on dashboard
  - List animals with expected due dates
  - Sort by due date (soonest first)

#### Step 4: Kidding Patterns
- Track kidding patterns by:
  - Season (which season has most births)
  - Month (peak kidding months)
  - Animal (which animals kid most frequently)

---

## 2.4 Number of Births Per Animal

### Files to Modify
- `app/dashboard/animals/page.tsx` - Add "Total Births" column
- `app/dashboard/analytics/birth-rates/page.tsx` - Show top producers

### Implementation Steps

#### Step 1: Calculate Births Per Animal
- In `app/dashboard/animals/page.tsx`:
  - Add function to count births per animal:
    ```typescript
    const getBirthCount = (animalId: number) => {
      return mockBreedingRecords.filter(
        r => r.animal_id === animalId && 
        r.birth_outcome === 'successful'
      ).length;
    };
    ```

#### Step 2: Add Column to Table
- Add "Total Births" column to animals table
- Show count for each female animal
- Sortable column

#### Step 3: Show in Animal Profile
- In animal detail view:
  - Display total births
  - Show list of all births with dates
  - Show average time between births

#### Step 4: Top Producers Analytics
- In `app/dashboard/analytics/birth-rates/page.tsx`:
  - Add "Top Producing Animals" section
  - List animals with most births
  - Show:
    - Animal tag
    - Total births
    - Average offspring per birth
    - Last birth date

---

## Checklist

- [ ] 2.1 Enhanced Reproduction Records
  - [ ] Update breeding/pregnancy types
  - [ ] Add detailed fields to pregnancy page
  - [ ] Display reproduction history per animal

- [ ] 2.2 Birth Rate Analytics
  - [ ] Create birth analytics type
  - [ ] Add birth records with seasonal data
  - [ ] Create birth analytics dashboard
  - [ ] Add charts (monthly, seasonal, trends)
  - [ ] Add filters

- [ ] 2.3 Kidding Season Tracking
  - [ ] Add calendar view to pregnancy page
  - [ ] Add kidding alerts
  - [ ] Show upcoming kidding dates
  - [ ] Track kidding patterns

- [ ] 2.4 Number of Births Per Animal
  - [ ] Calculate births per animal
  - [ ] Add "Total Births" column
  - [ ] Show in animal profile
  - [ ] Add top producers analytics

---

## Next Phase
Once Phase 2 is complete, proceed to `PHASE3_OPERATIONS.md`

