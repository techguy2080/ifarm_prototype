# Phase 7: External Farm Animal Hire & Financial Tracking

## Overview
Track breeding and animal hire activities with external farms (not using the system). This feature allows farmers to:
- Record external animals used for breeding
- Maintain a directory of external farm contacts
- Track income when YOUR animals are hired out to external farms
- Track expenses when you hire external animals
- Link financial agreements to breeding records
- Support any animal type (not just sires)
- Track hire duration and receive reminders for expiring agreements

---

## 7.1 External Farm Management

### Files to Modify
- `types/index.ts` - Add ExternalFarm interface
- Create `app/dashboard/breeding/external-farms/page.tsx`
- `lib/mockData.ts` - Add mock external farms data
- `components/Sidebar.tsx` - Add navigation link

### Implementation Steps

#### Step 1: Create External Farm Type
```typescript
// In types/index.ts:
export interface ExternalFarm {
  external_farm_id: number;
  tenant_id: number; // Tenant that recorded this external farm
  farm_name: string;
  owner_name?: string;
  contact_person?: string;
  phone: string;
  email?: string;
  location?: string;
  district?: string;
  coordinates?: { latitude: number; longitude: number };
  farm_type?: string;
  specialties?: string[]; // e.g., ['cattle_breeding', 'goat_breeding']
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Step 2: Add Mock External Farms
```typescript
// In lib/mockData.ts:
export const mockExternalFarms: ExternalFarm[] = [
  {
    external_farm_id: 1,
    tenant_id: 1,
    farm_name: 'ABC Cattle Farm',
    owner_name: 'John Mukasa',
    contact_person: 'John Mukasa',
    phone: '+256 700 123 456',
    email: 'john@abcfarm.com',
    location: 'Mukono',
    district: 'Mukono',
    coordinates: { latitude: 0.3533, longitude: 32.7553 },
    farm_type: 'cattle',
    specialties: ['cattle_breeding'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    external_farm_id: 2,
    tenant_id: 1,
    farm_name: 'Green Valley Goats',
    owner_name: 'Sarah Nakato',
    contact_person: 'Sarah Nakato',
    phone: '+256 700 234 567',
    location: 'Wakiso',
    district: 'Wakiso',
    farm_type: 'goat',
    specialties: ['goat_breeding'],
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];
```

#### Step 3: Create External Farms Management Page
- Create `app/dashboard/breeding/external-farms/page.tsx`:
  - **Header Section**:
    - Title: "External Farm Directory"
    - Subtitle: "Manage contacts for farms outside the system"
    - "Add External Farm" button
  - **Summary Cards**:
    - Total External Farms
    - Active Farms
    - Farms Used This Year
  - **Farms Table**:
    - Columns: Farm Name, Owner, Contact, Location, Type, Status, Actions
    - Filter by: Name, Location, Type, Status
    - Search functionality
    - Actions: View Details, Edit, Deactivate/Activate
  - **Farm Details Dialog**:
    - Show all farm information
    - List of animals from this farm
    - Breeding history with this farm
    - Hire agreements with this farm
    - Edit functionality
  - **Add/Edit Farm Form**:
    - Required: Farm Name, Phone
    - Optional: Owner Name, Contact Person, Email, Location, District, Coordinates, Farm Type, Specialties, Notes
    - Toggle: Active/Inactive status

#### Step 4: Add Navigation Link
- In `components/Sidebar.tsx`:
  - Add "Breeding" section (if not exists)
  - Add "External Farms" link under Breeding section
  - Permission: `create_breeding` or `view_animals`

---

## 7.2 External Animal Registry

### Files to Modify
- `types/index.ts` - Add ExternalAnimal interface
- Create `app/dashboard/breeding/external-animals/page.tsx`
- `lib/mockData.ts` - Add mock external animals data

### Implementation Steps

#### Step 1: Create External Animal Type
```typescript
// In types/index.ts:
export interface ExternalAnimal {
  external_animal_id: number;
  external_farm_id: number;
  external_farm?: ExternalFarm;
  tag_number?: string; // Tag number on external farm
  animal_type: 'cattle' | 'goat' | 'sheep' | 'pig' | 'other';
  breed?: string;
  gender?: 'male' | 'female';
  age_years?: number;
  weight_kg?: number;
  health_status?: 'healthy' | 'sick' | 'recovering';
  health_certificate_available?: boolean;
  health_certificate_expiry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

#### Step 2: Add Mock External Animals
```typescript
// In lib/mockData.ts:
export const mockExternalAnimals: ExternalAnimal[] = [
  {
    external_animal_id: 1,
    external_farm_id: 1,
    tag_number: 'Bull-123',
    animal_type: 'cattle',
    breed: 'Holstein',
    gender: 'male',
    age_years: 5,
    weight_kg: 650,
    health_status: 'healthy',
    health_certificate_available: true,
    health_certificate_expiry: '2024-12-31',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    external_animal_id: 2,
    external_farm_id: 2,
    tag_number: 'Buck-456',
    animal_type: 'goat',
    breed: 'Boer',
    gender: 'male',
    age_years: 3,
    weight_kg: 85,
    health_status: 'healthy',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];
```

#### Step 3: Create External Animals Registry Page
- Create `app/dashboard/breeding/external-animals/page.tsx`:
  - **Header Section**:
    - Title: "External Animal Registry"
    - Subtitle: "Track animals from external farms used for breeding"
    - "Add External Animal" button
  - **Summary Cards**:
    - Total External Animals
    - By Animal Type breakdown
    - Most Used Animal
  - **Animals Table**:
    - Columns: Tag, Farm, Animal Type, Breed, Gender, Age, Weight, Health Status, Breeding Count, Last Used, Actions
    - Filter by: Farm, Animal Type, Breed, Gender, Health Status
    - Search functionality
    - Actions: View Details, Edit, View Breeding History
  - **Animal Details Dialog**:
    - Show all animal information
    - Link to external farm
    - Breeding history table (all breeding records using this animal)
    - Success rate calculation
    - Edit functionality
  - **Add/Edit Animal Form**:
    - Required: External Farm (dropdown), Animal Type, Tag Number
    - Optional: Breed, Gender, Age, Weight, Health Status, Health Certificate info, Notes
    - Link to external farm

---

## 7.3 Animal Hire Agreements (Your Animals Hired Out - Income)

### Files to Modify
- `types/index.ts` - Add AnimalHireAgreement interface
- Create `app/dashboard/breeding/hire-agreements/page.tsx`
- `lib/mockData.ts` - Add mock hire agreements data

### Implementation Steps

#### Step 1: Create Animal Hire Agreement Type
```typescript
// In types/index.ts:
export interface AnimalHireAgreement {
  agreement_id: number;
  animal_id: number; // YOUR animal being hired out (any animal)
  animal?: Animal;
  tenant_id: number; // Your tenant (receiving payment)
  farm_id: number; // Your farm
  external_farm_id: number; // External farm hiring your animal
  external_farm?: ExternalFarm;
  hire_purpose: 'breeding' | 'showing' | 'other';
  agreement_type: 'per_service' | 'per_day' | 'per_week' | 'per_month' | 'fixed_period';
  start_date: string;
  end_date?: string; // For time period agreements
  service_count?: number; // For per-service agreements
  services_used?: number; // Track how many services used
  days_used?: number; // Track days if per-day/week/month
  hire_rate: number; // Rate per service/day/week/month or total
  total_amount: number; // Total expected payment
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
  payment_date?: string;
  payment_reference?: string;
  received_amount?: number; // Actual amount received
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  breeding_records?: number[]; // Linked breeding records (if breeding purpose)
  notes?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}
```

#### Step 2: Add Mock Animal Hire Agreements
```typescript
// In lib/mockData.ts:
export const mockAnimalHireAgreements: AnimalHireAgreement[] = [
  {
    agreement_id: 1,
    animal_id: 4, // COW-003 (your bull)
    tenant_id: 1,
    farm_id: 1,
    external_farm_id: 1, // ABC Cattle Farm
    hire_purpose: 'breeding',
    agreement_type: 'per_service',
    start_date: '2024-01-15',
    service_count: 5,
    services_used: 3,
    hire_rate: 50000, // 50,000 per service
    total_amount: 250000, // 5 services × 50,000
    payment_status: 'partial',
    payment_method: 'mobile_money',
    received_amount: 150000, // Paid for 3 services
    status: 'active',
    breeding_records: [],
    created_by_user_id: 1,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    agreement_id: 2,
    animal_id: 1, // COW-001 (your female cow - example of non-breeding hire)
    tenant_id: 1,
    farm_id: 1,
    external_farm_id: 2, // Green Valley Goats
    hire_purpose: 'showing',
    agreement_type: 'per_day',
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    days_used: 3,
    hire_rate: 20000, // 20,000 per day
    total_amount: 100000, // 5 days × 20,000
    payment_status: 'paid',
    payment_method: 'cash',
    received_amount: 100000,
    status: 'completed',
    created_by_user_id: 1,
    created_at: '2024-02-25T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  }
];
```

---

## 7.4 External Animal Hire Agreements (You Hire External - Expenses)

### Files to Modify
- `types/index.ts` - Add ExternalAnimalHireAgreement interface
- `lib/mockData.ts` - Add mock external hire agreements

### Implementation Steps

#### Step 1: Create External Animal Hire Agreement Type
```typescript
// In types/index.ts:
export interface ExternalAnimalHireAgreement {
  agreement_id: number;
  external_animal_id?: number; // If registered external animal
  external_animal_tag?: string; // If not registered
  external_farm_id: number;
  external_farm?: ExternalFarm;
  tenant_id: number; // Your tenant (paying)
  farm_id: number; // Your farm
  hire_purpose: 'breeding' | 'showing' | 'other';
  agreement_type: 'per_service' | 'per_day' | 'per_week' | 'per_month' | 'fixed_period';
  start_date: string;
  end_date?: string; // For time period agreements
  service_count?: number; // For per-service agreements
  services_used?: number; // Track how many services used
  days_used?: number; // Track days if per-day/week/month
  hire_rate: number; // Rate per service/day/week/month or total
  total_amount: number; // Total cost
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
  payment_date?: string;
  payment_reference?: string;
  paid_amount?: number; // Actual amount paid
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  breeding_records?: number[]; // Linked breeding records (if breeding)
  notes?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}
```

#### Step 2: Add Mock External Animal Hire Agreements
```typescript
// In lib/mockData.ts:
export const mockExternalAnimalHireAgreements: ExternalAnimalHireAgreement[] = [
  {
    agreement_id: 1,
    external_animal_id: 1, // Bull-123 from ABC Farm
    external_farm_id: 1,
    tenant_id: 1,
    farm_id: 1,
    hire_purpose: 'breeding',
    agreement_type: 'per_service',
    start_date: '2024-02-10',
    end_date: '2024-03-10', // 30-day period
    service_count: 3,
    services_used: 1,
    hire_rate: 60000, // 60,000 per service
    total_amount: 180000, // 3 services × 60,000
    payment_status: 'pending',
    paid_amount: 0,
    status: 'active',
    breeding_records: [26], // Link to breeding record
    created_by_user_id: 1,
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z'
  }
];
```

---

## 7.5 Enhanced Breeding Records

### Files to Modify
- `types/index.ts` - Update BreedingRecord interface
- `app/dashboard/helper/pregnancy/page.tsx` - Update breeding record creation
- `app/dashboard/animals/page.tsx` - Update breeding record display
- `lib/mockData.ts` - Update mock breeding records

### Implementation Steps

#### Step 1: Update BreedingRecord Interface
```typescript
// In types/index.ts, update existing BreedingRecord:
export interface BreedingRecord {
  breeding_id: number;
  animal_id: number; // Female (your animal)
  sire_id?: number; // Male from your own farm (if internal)
  external_animal_id?: number; // External animal ID (if from external farm)
  sire_source: 'internal' | 'external'; // Track source
  // For external animals:
  external_farm_name?: string; // Quick reference
  external_animal_tag?: string; // Quick reference
  // Link to hire agreements:
  animal_hire_agreement_id?: number; // If your animal was hired out
  external_animal_hire_agreement_id?: number; // If you hired external animal
  
  breeding_date: string;
  breeding_method?: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  conception_date?: string;
  expected_due_date?: string;
  actual_birth_date?: string;
  birth_outcome?: 'successful' | 'stillborn' | 'aborted' | 'complications';
  offspring_count?: number;
  offspring_ids?: number[];
  complications?: string;
  pregnancy_status?: 'suspected' | 'confirmed' | 'completed' | 'failed';
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
  updated_at?: string;
}
```

#### Step 2: Update Breeding Record Creation Form
- In `app/dashboard/helper/pregnancy/page.tsx`:
  - Add "Sire Source" radio/select: "My Farm" or "External Farm"
  - **If "My Farm" selected**:
    - Show existing male animals dropdown (non-castrated only)
    - Optional: Link to active hire agreement if animal is hired out
    - Set `sire_source: 'internal'` and `sire_id`
  - **If "External Farm" selected**:
    - Show "External Farm" dropdown (with "Add New" option)
    - Show "External Animal" dropdown (filtered by selected farm, with "Add New" option)
    - Optional: Link to active external hire agreement
    - Set `sire_source: 'external'`, `external_animal_id`, `external_farm_name`, `external_animal_tag`
    - Quick add dialogs for farm/animal if not exists
  - Update form submission to handle both sources
  - If hire agreement linked, increment services_used count

#### Step 3: Update Breeding Records Display
- In `app/dashboard/animals/page.tsx`:
  - Update reproduction history table to show sire source
  - Display differently for internal vs external:
    - Internal: Show animal tag number
    - External: Show "External: [Farm Name] - [Animal Tag]"
  - Add filter: "All", "Internal Sires", "External Animals"
  - Add link to external animal details if external
  - Show hire agreement link if applicable

#### Step 4: Update Mock Breeding Records
```typescript
// In lib/mockData.ts, add example with external animal:
{
  breeding_id: 26,
  animal_id: 1, // Female cattle
  external_animal_id: 1,
  external_animal_hire_agreement_id: 1, // Link to hire agreement
  sire_source: 'external',
  external_farm_name: 'ABC Cattle Farm',
  external_animal_tag: 'Bull-123',
  breeding_date: '2024-02-10',
  breeding_method: 'natural',
  conception_date: '2024-02-15',
  expected_due_date: '2024-11-20',
  pregnancy_status: 'confirmed',
  recorded_by_user_id: 1,
  created_at: '2024-02-10T00:00:00Z'
}
```

---

## 7.6 Hire Agreements Management Page

### Files to Modify
- Create `app/dashboard/breeding/hire-agreements/page.tsx`

### Implementation Steps

#### Step 1: Create Unified Hire Agreements Page
- Create `app/dashboard/breeding/hire-agreements/page.tsx`:
  - **Header Section**:
    - Title: "Animal Hire Agreements"
    - Subtitle: "Track income from hiring out your animals and expenses from hiring external animals"
  - **Summary Cards**:
    - Total Income (from your animals hired out)
    - Total Expenses (from hiring external animals)
    - Pending Payments (income)
    - Pending Payments (expenses)
    - Active Agreements
    - Agreements Expiring Soon (next 7 days)
  - **Tabs**:
    - "My Animals Hired Out" (income - AnimalHireAgreement)
    - "External Animals Hired" (expenses - ExternalAnimalHireAgreement)
    - "All Agreements"
    - "Reminders" (expiring soon, overdue, payment due)
  - **Agreements Table** (for each tab):
    - Columns: Agreement ID, Animal Details, Farm, Purpose, Type, Services/Days Used, Rate, Total, Payment Status, Days Remaining/Overdue, Status, Actions
    - Filter by: Status, Payment Status, Purpose, Animal Type, Date Range
    - Search functionality
    - Visual indicators: Red border for overdue, Yellow for expiring soon
  - **Agreement Details Dialog**:
    - Show full agreement details
    - Link to animal (internal or external)
    - Link to farm
    - Payment tracking section
    - Linked breeding records
    - Update payment status
    - Mark services/days as used
    - Add payment record
    - Calculate and display:
      - Days remaining (if end_date exists)
      - Days overdue (if past end_date)
      - Services remaining (if per-service)
      - Days used (if time-based)
  - **Create Agreement Form**:
    - For hiring out your animal:
      - Select your animal (any animal - filter by availability)
      - Select external farm
      - Select hire purpose (breeding, showing, other)
      - Agreement type (per service, per day/week/month, fixed period)
      - Rate and terms
      - Expected dates
      - Service count (if breeding)
    - For hiring external animal:
      - Select external farm
      - Select external animal (or quick add)
      - Select hire purpose
      - Agreement type and terms
      - Rate and dates

---

## 7.7 Hire Agreement Reminders & Alerts

### Files to Modify
- `app/dashboard/breeding/hire-agreements/page.tsx` - Add reminder calculations
- `app/dashboard/alerts/page.tsx` - Include hire agreement alerts
- `lib/mockData.ts` - Generate hire agreement alerts

### Implementation Steps

#### Step 1: Add Reminder Calculation Functions
```typescript
// Helper functions in hire-agreements page:
const calculateDaysRemaining = (endDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateDaysOverdue = (endDate: string): number => {
  const daysRemaining = calculateDaysRemaining(endDate);
  return daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
};

const getAgreementStatus = (agreement: AnimalHireAgreement | ExternalAnimalHireAgreement): {
  status: 'expiring_soon' | 'overdue' | 'normal' | 'completed';
  daysRemaining?: number;
  daysOverdue?: number;
  servicesRemaining?: number;
} => {
  if (agreement.status === 'completed' || agreement.status === 'cancelled') {
    return { status: 'completed' };
  }
  
  if (agreement.end_date) {
    const daysRemaining = calculateDaysRemaining(agreement.end_date);
    if (daysRemaining < 0) {
      return { status: 'overdue', daysOverdue: Math.abs(daysRemaining) };
    }
    if (daysRemaining <= 7) {
      return { status: 'expiring_soon', daysRemaining };
    }
  }
  
  if (agreement.agreement_type === 'per_service' && agreement.service_count) {
    const servicesRemaining = agreement.service_count - (agreement.services_used || 0);
    if (servicesRemaining <= 2 && servicesRemaining > 0) {
      return { status: 'expiring_soon', servicesRemaining };
    }
  }
  
  return { status: 'normal' };
};
```

#### Step 2: Generate Hire Agreement Alerts
```typescript
// In lib/mockData.ts or hire-agreements page:
const generateHireAgreementAlerts = (
  animalAgreements: AnimalHireAgreement[],
  externalAgreements: ExternalAnimalHireAgreement[]
): Alert[] => {
  const alerts: Alert[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check your animals hired out
  animalAgreements.forEach(agreement => {
    if (agreement.status === 'active') {
      // End date reminders
      if (agreement.end_date) {
        const daysRemaining = calculateDaysRemaining(agreement.end_date);
        
        // 7-day warning
        if (daysRemaining <= 7 && daysRemaining > 0) {
          alerts.push({
            alert_id: `hire-${agreement.agreement_id}-expiring`,
            type: 'breeding',
            priority: 'medium',
            title: `Hire Agreement Ending Soon`,
            message: `${agreement.animal?.tag_number} hire agreement ends in ${daysRemaining} days. Contact ${agreement.external_farm?.farm_name} to renew or complete.`,
            animal_id: agreement.animal_id,
            scheduled_time: agreement.end_date,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
        
        // Overdue reminder
        if (daysRemaining < 0) {
          alerts.push({
            alert_id: `hire-${agreement.agreement_id}-overdue`,
            type: 'breeding',
            priority: 'high',
            title: `Hire Agreement Overdue`,
            message: `${agreement.animal?.tag_number} hire agreement ended ${Math.abs(daysRemaining)} days ago. Please complete or renew agreement.`,
            animal_id: agreement.animal_id,
            scheduled_time: agreement.end_date,
            status: 'overdue',
            created_at: new Date().toISOString()
          });
        }
      }
      
      // Service count reminders (if per-service)
      if (agreement.agreement_type === 'per_service' && agreement.service_count) {
        const servicesRemaining = agreement.service_count - (agreement.services_used || 0);
        if (servicesRemaining <= 2 && servicesRemaining > 0) {
          alerts.push({
            alert_id: `hire-${agreement.agreement_id}-services`,
            type: 'breeding',
            priority: 'medium',
            title: `Service Count Running Low`,
            message: `${agreement.animal?.tag_number} has ${servicesRemaining} service(s) remaining in hire agreement.`,
            animal_id: agreement.animal_id,
            scheduled_time: new Date().toISOString(),
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
      }
      
      // Payment reminders
      if (agreement.payment_status === 'pending' || agreement.payment_status === 'partial') {
        const daysSinceStart = Math.ceil((today.getTime() - new Date(agreement.start_date).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceStart >= 7) {
          const amountDue = agreement.total_amount - (agreement.received_amount || 0);
          alerts.push({
            alert_id: `hire-${agreement.agreement_id}-payment`,
            type: 'breeding',
            priority: 'high',
            title: `Payment Pending`,
            message: `Payment of ${amountDue.toLocaleString()} pending for ${agreement.animal?.tag_number} hire agreement with ${agreement.external_farm?.farm_name}.`,
            animal_id: agreement.animal_id,
            scheduled_time: new Date().toISOString(),
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
      }
    }
  });
  
  // Similar logic for external animal hire agreements
  externalAgreements.forEach(agreement => {
    if (agreement.status === 'active') {
      if (agreement.end_date) {
        const daysRemaining = calculateDaysRemaining(agreement.end_date);
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
          alerts.push({
            alert_id: `external-hire-${agreement.agreement_id}-expiring`,
            type: 'breeding',
            priority: 'medium',
            title: `External Hire Agreement Ending Soon`,
            message: `Hire agreement for ${agreement.external_animal_tag || 'external animal'} from ${agreement.external_farm?.farm_name} ends in ${daysRemaining} days.`,
            scheduled_time: agreement.end_date,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
        
        if (daysRemaining < 0) {
          alerts.push({
            alert_id: `external-hire-${agreement.agreement_id}-overdue`,
            type: 'breeding',
            priority: 'high',
            title: `External Hire Agreement Overdue`,
            message: `Hire agreement for ${agreement.external_animal_tag || 'external animal'} ended ${Math.abs(daysRemaining)} days ago.`,
            scheduled_time: agreement.end_date,
            status: 'overdue',
            created_at: new Date().toISOString()
          });
        }
      }
      
      // Payment reminders for external agreements
      if (agreement.payment_status === 'pending' || agreement.payment_status === 'partial') {
        const amountDue = agreement.total_amount - (agreement.paid_amount || 0);
        alerts.push({
          alert_id: `external-hire-${agreement.agreement_id}-payment`,
          type: 'breeding',
          priority: 'high',
          title: `Payment Due`,
          message: `Payment of ${amountDue.toLocaleString()} due for external animal hire from ${agreement.external_farm?.farm_name}.`,
          scheduled_time: new Date().toISOString(),
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
    }
  });
  
  return alerts;
};
```

#### Step 3: Display Reminders in Hire Agreements Page
- Add "Reminders" tab or section:
  - **Upcoming Expirations** (7 days warning):
    - List agreements ending in next 7 days
    - Show days remaining
    - Quick action: "Extend Agreement" or "Mark Complete"
  - **Overdue Agreements**:
    - List agreements past end date
    - Show days overdue
    - Red highlight/border
    - Quick action: "Complete Agreement"
  - **Service Count Warnings**:
    - List per-service agreements with ≤2 services remaining
    - Show services remaining
    - Quick action: "View Agreement"
  - **Payment Reminders**:
    - List agreements with pending/partial payments
    - Show amount due
    - Quick action: "Record Payment"

#### Step 4: Integrate with Alerts Page
- In `app/dashboard/alerts/page.tsx`:
  - Include hire agreement alerts in the alerts list
  - Filter by type: "Hire Agreements" or "Breeding"
  - Show hire agreement specific details:
    - Agreement ID
    - Animal details
    - Farm name
    - Days remaining/overdue
    - Amount due (if payment reminder)
  - Link to hire agreement details page
  - Actions: "View Agreement", "Record Payment", "Complete Agreement"

#### Step 5: Add Visual Indicators in Agreements Table
- In agreements table:
  - **Days Remaining Column**:
    - Show "X days remaining" (green) if > 7 days
    - Show "X days remaining" (yellow) if ≤ 7 days
    - Show "X days overdue" (red) if overdue
  - **Status Column**:
    - Color-code status chips
    - Add "Expiring Soon" badge if ≤ 7 days remaining
    - Add "Overdue" badge if past end date
  - **Row Highlighting**:
    - Red border/background for overdue agreements
    - Yellow border/background for expiring soon (≤7 days)

#### Step 6: Add Dashboard Widget (Optional)
- Add to owner dashboard:
  - "Active Hire Agreements" widget
  - Show count of active agreements
  - Show count of agreements expiring in next 7 days
  - Show count of overdue agreements
  - Quick link to hire agreements page
  - List of top 3 expiring agreements

---

## 7.8 Financial Integration

### Files to Modify
- `app/dashboard/expenses/page.tsx` - Include external animal hire expenses
- `app/dashboard/sales/page.tsx` - Include income from animal rentals

### Implementation Steps

#### Step 1: Update Expenses Page
- In `app/dashboard/expenses/page.tsx`:
  - Add expense type: 'animal_hire'
  - Show external animal hire agreements as expenses
  - Filter by expense type to show animal hire expenses
  - Include in expense reports
  - Show breakdown by purpose (breeding, showing, other)
  - Link to hire agreement details

#### Step 2: Update Sales/Income Page
- In `app/dashboard/sales/page.tsx`:
  - Add income type: 'animal_rental'
  - Show animal hire agreements as income
  - Filter by income type to show animal rental income
  - Include in income reports
  - Show breakdown by purpose (breeding, showing, other)
  - Link to hire agreement details

#### Step 3: Create Animal Hire Financial Summary
- Add section to hire agreements page:
  - Total income from animal rentals (this year/month)
  - Total expenses from hiring external animals (this year/month)
  - Net profit/loss from animal hire services
  - Pending payments breakdown (income and expenses)
  - Payment status charts
  - Breakdown by animal type and purpose

---

## 7.9 Navigation & Permissions

### Files to Modify
- `components/Sidebar.tsx` - Add Breeding section
- `lib/permissions.ts` - Add page permissions

### Implementation Steps

#### Step 1: Add Navigation
- In `components/Sidebar.tsx`:
  - Add "Breeding" section (if not exists)
  - Add "External Farms" link under Breeding section
  - Add "External Animals" link under Breeding section
  - Add "Hire Agreements" link under Breeding section
  - Permissions: `create_breeding`, `view_financial_reports`

#### Step 2: Add Permissions
```typescript
// In lib/permissions.ts:
'/dashboard/breeding/external-farms': ['create_breeding', 'view_animals'],
'/dashboard/breeding/external-animals': ['create_breeding', 'view_animals'],
'/dashboard/breeding/hire-agreements': ['create_breeding', 'view_financial_reports'],
```

---

## 7.10 Integration with Analytics

### Files to Modify
- `app/dashboard/analytics/birth-rates/page.tsx` - Include external animals in analytics

### Implementation Steps

#### Step 1: Update Analytics
- In `app/dashboard/analytics/birth-rates/page.tsx`:
  - Include breeding records with external animals in calculations
  - Add filter: "Sire Source" (All, Internal, External)
  - Show breakdown of births by sire source in charts
  - Add metric: "External Animal Usage Rate"
  - Add financial metrics: "Cost per Birth" (external vs internal)
  - Track ROI of animal hire agreements

---

## Summary

This phase implements:

1. External farm contact directory management
2. External animal registry (any animal type, not just sires)
3. Animal hire agreements for YOUR animals (income tracking)
4. External animal hire agreements (expense tracking)
5. Financial payment tracking for all agreements
6. **Hire duration tracking and reminder system**
7. **7-day expiration warnings**
8. **Overdue agreement alerts**
9. **Service count warnings**
10. **Payment reminder alerts**
11. Integration with existing alerts system
12. Integration with breeding records
13. Financial reporting integration
14. Support for multiple hire purposes (breeding, showing, other)
15. Support for multiple agreement types (per service, per day/week/month, fixed period)

Key Reminder Features:
- Automatic calculation of days remaining/overdue
- 7-day warning before agreement end date
- Overdue agreement alerts (high priority)
- Service count warnings (when ≤2 services remaining)
- Payment pending reminders (after 7 days)
- Visual indicators in agreements table
- Integration with alerts page
- Dashboard widget for quick overview



