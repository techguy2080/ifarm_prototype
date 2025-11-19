# Phase 4: Contacts & Resources

## Overview
Veterinarian directory, supplier/buyer contacts, security tips, and emergency contacts.

---

## 4.1 24/7 Vet Contact Directory

### Files to Modify
- Create `app/dashboard/contacts/veterinarians/page.tsx`
- `types/index.ts` - Create Contact interface

### Implementation Steps

#### Step 1: Create Contact Types
```typescript
// In types/index.ts:
export interface Veterinarian {
  vet_id: number;
  name: string;
  phone: string;
  email?: string;
  specialty: 'large_animal' | 'small_animal' | 'poultry' | 'mixed' | 'emergency';
  availability: '24/7' | 'business_hours' | 'on_call' | 'weekends_only';
  emergency_contact: boolean;
  location?: string;
  clinic_name?: string;
  notes?: string;
  created_at: string;
}
```

#### Step 2: Add Mock Veterinarians
```typescript
// In lib/mockData.ts:
export const mockVeterinarians: Veterinarian[] = [
  {
    vet_id: 1,
    name: 'Dr. John Smith',
    phone: '+256 700 123 456',
    email: 'dr.smith@vetclinic.com',
    specialty: 'large_animal',
    availability: '24/7',
    emergency_contact: true,
    location: 'Kampala',
    clinic_name: 'Kampala Animal Hospital',
    notes: 'Specializes in cattle and goats',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    vet_id: 2,
    name: 'Dr. Mary Johnson',
    phone: '+256 700 234 567',
    email: 'mary.j@vetcare.ug',
    specialty: 'poultry',
    availability: 'business_hours',
    emergency_contact: false,
    location: 'Wakiso',
    clinic_name: 'Poultry Care Clinic',
    notes: 'Expert in poultry diseases',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Add more veterinarians...
];
```

#### Step 3: Create Veterinarian Directory Page
- Create `app/dashboard/contacts/veterinarians/page.tsx`:
  - **Header Card**: "24/7 Veterinarian Contacts"
  - **Emergency Contacts Section**:
    - Highlight vets with emergency_contact = true
    - Large "Call Now" buttons
    - Quick dial functionality
  - **All Veterinarians Table**:
    - Columns: Name, Specialty, Phone, Email, Availability, Actions
    - Filter by specialty
    - Search by name or location
  - **Vet Details Card**:
    - Show full information
    - Contact buttons (Call, Email, SMS)
    - Notes section

#### Step 4: Add Quick Actions
- Add action buttons:
  - "Call" (tel: link)
  - "Email" (mailto: link)
  - "SMS" (sms: link)
  - "Add to Favorites" (if implementing favorites)

---

## 4.2 Supplier & Buyer Contacts

### Files to Modify
- Create `app/dashboard/contacts/suppliers/page.tsx`
- Create `app/dashboard/contacts/buyers/page.tsx`
- `types/index.ts` - Create Supplier and Buyer interfaces

### Implementation Steps

#### Step 1: Create Supplier & Buyer Types
```typescript
// In types/index.ts:
export interface Supplier {
  supplier_id: number;
  name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  supplier_type: 'feed' | 'medication' | 'equipment' | 'breeding' | 'other';
  products: string[]; // e.g., ["Cattle Feed", "Goat Feed", "Vaccines"]
  location?: string;
  payment_terms?: string;
  notes?: string;
  created_at: string;
}

export interface Buyer {
  buyer_id: number;
  name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  buyer_type: 'meat' | 'milk' | 'eggs' | 'wool' | 'honey' | 'skin' | 'live_animals' | 'other';
  products_interested: string[];
  location?: string;
  payment_terms?: string;
  notes?: string;
  created_at: string;
}
```

#### Step 2: Add Mock Data
```typescript
// In lib/mockData.ts:
export const mockSuppliers: Supplier[] = [
  {
    supplier_id: 1,
    name: 'Green Feed Co.',
    contact_person: 'James Kato',
    phone: '+256 700 111 222',
    email: 'info@greenfeed.ug',
    supplier_type: 'feed',
    products: ['Cattle Feed', 'Goat Feed', 'Poultry Feed'],
    location: 'Kampala',
    payment_terms: 'Net 30',
    notes: 'Bulk discounts available',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Add more suppliers...
];

export const mockBuyers: Buyer[] = [
  {
    buyer_id: 1,
    name: 'Fresh Milk Distributors',
    contact_person: 'Sarah Nakato',
    phone: '+256 700 333 444',
    email: 'sales@freshmilk.ug',
    buyer_type: 'milk',
    products_interested: ['Fresh Milk', 'Pasteurized Milk'],
    location: 'Kampala',
    payment_terms: 'Weekly payment',
    notes: 'Picks up daily',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Add more buyers...
];
```

#### Step 3: Create Supplier Directory Page
- Create `app/dashboard/contacts/suppliers/page.tsx`:
  - **Header Card**: "Feed & Supply Contacts"
  - **Supplier Table**:
    - Columns: Name, Type, Products, Contact, Location, Actions
    - Filter by supplier type
    - Search by name or products
  - **Add Supplier Button**:
    - Form with all supplier fields
  - **Quick Contact Actions**:
    - Call, Email buttons

#### Step 4: Create Buyer Directory Page
- Create `app/dashboard/contacts/buyers/page.tsx`:
  - **Header Card**: "Buyer Contacts"
  - **Buyer Table**:
    - Columns: Name, Type, Products Interested, Contact, Location, Actions
    - Filter by buyer type
    - Search functionality
  - **Link to Sales**:
    - Show recent sales to each buyer
    - Link to sales records
  - **Add Buyer Button**:
    - Form with all buyer fields

---

## 4.3 Security Tips & Emergency Contacts

### Files to Modify
- Create `app/dashboard/resources/security/page.tsx`
- Create `app/dashboard/resources/emergency/page.tsx`
- `types/index.ts` - Create SecurityTip and EmergencyContact interfaces

### Implementation Steps

#### Step 1: Create Security & Emergency Types
```typescript
// In types/index.ts:
export interface SecurityTip {
  tip_id: number;
  category: 'biosecurity' | 'accident_prevention' | 'infection_control' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface EmergencyContact {
  contact_id: number;
  name: string;
  phone: string;
  email?: string;
  contact_type: 'police' | 'fire' | 'ambulance' | 'veterinary_emergency' | 'government' | 'other';
  location?: string;
  notes?: string;
  created_at: string;
}
```

#### Step 2: Add Mock Data
```typescript
// In lib/mockData.ts:
export const mockSecurityTips: SecurityTip[] = [
  {
    tip_id: 1,
    category: 'biosecurity',
    title: 'Quarantine New Animals',
    description: 'Always quarantine new animals for at least 14 days before introducing them to your herd. This prevents the spread of diseases.',
    priority: 'high',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    tip_id: 2,
    category: 'accident_prevention',
    title: 'Proper Handling Equipment',
    description: 'Use proper handling equipment when working with large animals. Always have an escape route and never work alone with aggressive animals.',
    priority: 'high',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    tip_id: 3,
    category: 'infection_control',
    title: 'Disinfect Equipment',
    description: 'Regularly disinfect all equipment, especially after handling sick animals. Use approved disinfectants and follow manufacturer instructions.',
    priority: 'medium',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Add more tips...
];

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    contact_id: 1,
    name: 'Police Emergency',
    phone: '999',
    contact_type: 'police',
    notes: 'National emergency number',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    contact_id: 2,
    name: 'Fire Department',
    phone: '112',
    contact_type: 'fire',
    notes: 'Fire and rescue services',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    contact_id: 3,
    name: 'Ambulance',
    phone: '911',
    contact_type: 'ambulance',
    notes: 'Medical emergency services',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Add more emergency contacts...
];
```

#### Step 3: Create Security Tips Page
- Create `app/dashboard/resources/security/page.tsx`:
  - **Header Card**: "Farm Security & Safety Tips"
  - **Tips by Category**:
    - Tabs or sections for each category
    - Display tips as cards
    - Show priority badges
  - **Search & Filter**:
    - Search tips by keyword
    - Filter by category and priority
  - **Tip Details**:
    - Expandable cards or modal
    - Full description
    - Related tips

#### Step 4: Create Emergency Contacts Page
- Create `app/dashboard/resources/emergency/page.tsx`:
  - **Header Card**: "Emergency Contacts"
  - **Quick Access Section**:
    - Large buttons for critical contacts
    - One-tap calling
  - **All Contacts Table**:
    - Columns: Name, Type, Phone, Location, Actions
    - Filter by contact type
    - Search functionality
  - **Emergency Procedures**:
    - Section with step-by-step emergency procedures
    - What to do in case of:
      - Animal disease outbreak
      - Fire
      - Animal attack
      - Natural disaster

---

## Checklist

- [ ] 4.1 24/7 Vet Contact Directory
  - [ ] Create Veterinarian type
  - [ ] Add mock veterinarians
  - [ ] Create veterinarian directory page
  - [ ] Add emergency contacts section
  - [ ] Add quick action buttons

- [ ] 4.2 Supplier & Buyer Contacts
  - [ ] Create Supplier and Buyer types
  - [ ] Add mock suppliers and buyers
  - [ ] Create supplier directory page
  - [ ] Create buyer directory page
  - [ ] Link buyers to sales records

- [ ] 4.3 Security Tips & Emergency Contacts
  - [ ] Create SecurityTip and EmergencyContact types
  - [ ] Add mock security tips and emergency contacts
  - [ ] Create security tips page
  - [ ] Create emergency contacts page
  - [ ] Add emergency procedures section

---

## Next Phase
Once Phase 4 is complete, proceed to `PHASE5_EDUCATION.md`





