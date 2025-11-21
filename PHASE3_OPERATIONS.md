# Phase 3: Operational Management

## Overview
Inventory management, worker schedules, feeding/milking alerts, and farm location with breed recommendations.

---

## 3.1 Inventory Management Dashboard

### Files to Modify
- Create `app/dashboard/inventory/page.tsx`
- `types/index.ts` - Create Inventory interface

### Implementation Steps

#### Step 1: Create Inventory Type
```typescript
// In types/index.ts:
export interface InventorySummary {
  total_animals: number;
  animals_by_type: {
    cattle: number;
    goat: number;
    sheep: number;
    pig: number;
    chicken: number;
    duck: number;
    other: number;
  };
  animals_by_status: {
    active: number;
    sold: number;
    deceased: number;
    disposed: number;
  };
  animals_by_age_group: {
    young: number; // < 1 year
    adult: number; // 1-5 years
    senior: number; // > 5 years
  };
  reproductive_status: {
    breeding_age_females: number;
    pregnant: number;
    lactating: number;
    available_for_breeding: number;
  };
  available_for_sale: number;
}
```

#### Step 2: Create Inventory Dashboard
- Create `app/dashboard/inventory/page.tsx`:
  - **Summary Cards**:
    - Total Animals
    - Active Animals
    - Available for Sale
    - Breeding Age Females
  - **Animals by Type Chart**:
    - Pie or bar chart showing distribution
  - **Age Distribution Chart**:
    - Bar chart showing young/adult/senior
  - **Status Overview**:
    - Table showing active/sold/deceased/disposed
  - **Reproductive Status**:
    - Breeding age females
    - Currently pregnant
    - Lactating
    - Available for breeding
  - **Available for Sale Table**:
    - List animals marked as available
    - Filter by type, age, price range

#### Step 3: Add Filters
- Filter by:
  - Farm
  - Animal type
  - Age group
  - Status
  - Reproductive status

---

## 3.2 Daily Activity Schedule for Workers

### Files to Modify
- Create `app/dashboard/schedules/page.tsx`
- `types/index.ts` - Create WorkerSchedule interface

### Implementation Steps

#### Step 1: Create Schedule Types
```typescript
// In types/index.ts:
export interface WorkerSchedule {
  schedule_id: number;
  worker_id: number;
  worker?: User;
  schedule_date: string;
  tasks: ScheduleTask[];
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
}

export interface ScheduleTask {
  task_id: number;
  task_type: 'feeding' | 'milking' | 'health_check' | 'cleaning' | 'breeding' | 'other';
  assigned_animals?: number[]; // Animal IDs
  time_slot: string; // "08:00", "14:00", etc.
  duration_minutes?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'skipped';
  notes?: string;
  completed_at?: string;
}
```

#### Step 2: Add Mock Schedules
```typescript
// In lib/mockData.ts:
export const mockWorkerSchedules: WorkerSchedule[] = [
  {
    schedule_id: 1,
    worker_id: 3, // Helper worker
    schedule_date: '2024-01-24',
    tasks: [
      {
        task_id: 1,
        task_type: 'feeding',
        assigned_animals: [1, 2, 3],
        time_slot: '08:00',
        duration_minutes: 60,
        priority: 'high',
        status: 'completed',
        notes: 'Fed all cattle',
        completed_at: '2024-01-24T08:30:00Z'
      },
      {
        task_id: 2,
        task_type: 'milking',
        assigned_animals: [1, 2],
        time_slot: '06:00',
        duration_minutes: 90,
        priority: 'high',
        status: 'completed',
        completed_at: '2024-01-24T06:45:00Z'
      },
      // More tasks...
    ],
    status: 'completed',
    created_at: '2024-01-23T00:00:00Z'
  },
  // Add more schedules...
];
```

#### Step 3: Create Schedule Dashboard
- Create `app/dashboard/schedules/page.tsx`:
  - **Daily Schedule View**:
    - Show tasks for selected date
    - Group by time slot
    - Show assigned animals
    - Mark tasks as completed
  - **Worker Assignment**:
    - Assign tasks to workers
    - View tasks by worker
  - **Task Management**:
    - Create new tasks
    - Edit tasks
    - Delete tasks
  - **Completion Tracking**:
    - Show completion rate
    - Highlight overdue tasks
    - Track worker activity

#### Step 4: Task Forms
- Create task form with fields:
  - Task Type (dropdown)
  - Assigned Animals (multi-select)
  - Time Slot (time picker)
  - Duration (number input, minutes)
  - Priority (dropdown)
  - Notes (textarea)

---

## 3.3 Feeding & Milking Alerts

### Files to Modify
- `app/dashboard/page.tsx` - Add alerts section
- `types/index.ts` - Create Alert interface
- `lib/mockData.ts` - Add mock alerts

### Implementation Steps

#### Step 1: Create Alert Type
```typescript
// In types/index.ts:
export interface Alert {
  alert_id: number;
  type: 'feeding' | 'milking' | 'vaccination' | 'deworming' | 'health_check' | 'breeding' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  animal_id?: number;
  animal?: Animal;
  scheduled_time: string;
  status: 'pending' | 'completed' | 'dismissed' | 'overdue';
  created_at: string;
}
```

#### Step 2: Add Mock Alerts
```typescript
// In lib/mockData.ts:
export const mockAlerts: Alert[] = [
  {
    alert_id: 1,
    type: 'milking',
    priority: 'high',
    title: 'Morning Milking Due',
    message: 'Cattle COW-001 and COW-002 need morning milking',
    animal_id: 1,
    scheduled_time: '2024-01-24T06:00:00Z',
    status: 'pending',
    created_at: '2024-01-24T05:30:00Z'
  },
  {
    alert_id: 2,
    type: 'feeding',
    priority: 'medium',
    title: 'Afternoon Feeding',
    message: 'All animals need afternoon feeding',
    scheduled_time: '2024-01-24T14:00:00Z',
    status: 'pending',
    created_at: '2024-01-24T13:30:00Z'
  },
  // Add more alerts...
];
```

#### Step 3: Add Alerts to Dashboard
- In `app/dashboard/page.tsx`:
  - Add "Alerts" section at top
  - Show alerts grouped by:
    - Urgent (red)
    - High Priority (orange)
    - Medium Priority (yellow)
    - Low Priority (blue)
  - Show:
    - Alert type icon
    - Title and message
    - Scheduled time
    - Animal (if applicable)
    - Actions: Complete, Dismiss, View Details

#### Step 4: Alert Management
- Create alert management interface:
  - Filter by type, priority, status
  - Mark as completed
  - Dismiss alerts
  - View alert history
  - Create custom alerts

#### Step 5: Auto-Generate Alerts
- Create function to auto-generate alerts from:
  - Milking schedules (daily)
  - Feeding schedules (daily)
  - Upcoming vaccinations
  - Upcoming deworming
  - Breeding due dates

---

## 3.4 Farm Location & Breed Recommendations

### Files to Modify
- `types/index.ts` - Enhance Farm interface
- `app/dashboard/farms/page.tsx` - Add location details
- `app/dashboard/helper/farms/page.tsx` - Add location inputs

### Implementation Steps

#### Step 1: Update Farm Type
```typescript
// In types/index.ts, enhance Farm interface:
export interface Farm {
  // ... existing fields
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  altitude?: number; // meters above sea level
  climate_zone?: 'tropical' | 'subtropical' | 'temperate' | 'arid' | 'highland';
  recommended_breeds?: string[];
  soil_type?: string;
  average_rainfall?: number; // mm per year
}
```

#### Step 2: Add Location Input Fields
- In `app/dashboard/helper/farms/page.tsx`:
  - Add "Latitude" number input
  - Add "Longitude" number input
  - Add "Altitude" number input (meters)
  - Add "Climate Zone" dropdown
  - Add "Soil Type" text input
  - Add "Average Rainfall" number input (mm/year)
  - Optional: Add map picker for coordinates

#### Step 3: Breed Recommendations
- Create breed recommendation logic:
  ```typescript
  const getRecommendedBreeds = (farm: Farm) => {
    const recommendations: string[] = [];
    
    if (farm.climate_zone === 'tropical') {
      recommendations.push('Boran', 'Zebu', 'Nguni');
    }
    if (farm.climate_zone === 'highland') {
      recommendations.push('Holstein', 'Friesian', 'Jersey');
    }
    // Add more logic based on altitude, climate, etc.
    
    return recommendations;
  };
  ```

#### Step 4: Display Location & Recommendations
- In `app/dashboard/farms/page.tsx`:
  - Show farm location on map (if coordinates available)
  - Display climate zone
  - Show recommended breeds card
  - Display altitude and rainfall info
  - Show breed suitability guide

#### Step 5: Breed Suitability Guide
- Create guide showing:
  - Which breeds work best for each climate zone
  - Altitude considerations
  - Rainfall requirements
  - Temperature tolerance

---

## Checklist

- [ ] 3.1 Inventory Management Dashboard
  - [ ] Create Inventory type
  - [ ] Create inventory dashboard page
  - [ ] Add summary cards
  - [ ] Add charts (type, age, status)
  - [ ] Add available for sale table
  - [ ] Add filters

- [ ] 3.2 Daily Activity Schedule for Workers
  - [ ] Create WorkerSchedule and ScheduleTask types
  - [ ] Add mock schedules
  - [ ] Create schedule dashboard
  - [ ] Add daily schedule view
  - [ ] Add task management
  - [ ] Add completion tracking

- [ ] 3.3 Feeding & Milking Alerts
  - [ ] Create Alert type
  - [ ] Add mock alerts
  - [ ] Add alerts section to dashboard
  - [ ] Add alert management
  - [ ] Auto-generate alerts from schedules

- [ ] 3.4 Farm Location & Breed Recommendations
  - [ ] Update Farm type with location fields
  - [ ] Add location input fields
  - [ ] Create breed recommendation logic
  - [ ] Display location and recommendations
  - [ ] Create breed suitability guide

---

## Next Phase
Once Phase 3 is complete, proceed to `PHASE4_CONTACTS.md`







