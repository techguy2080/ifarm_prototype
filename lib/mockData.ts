// Mock Data for Prototype
import { 
  Permission, RoleTemplate, Role, Tenant, Farm, User, Delegation, Invitation, AuditLog, 
  Animal, AnimalSale, ProductSale, Production, Expense, Activity, 
  BreedingRecord, ExternalFarm, ExternalAnimal, InventoryItem, InventoryMovement,
  TaxRate, TaxCalculation, TaxRecord, TaxConfiguration,
  Employee, Payroll, LeaveRequest, PayrollReminder
} from '@/types';

// Additional types for extended features
export interface Alert {
  alert_id: number;
  tenant_id: number;
  farm_id: number;
  animal_id?: number;
  alert_type: 'health' | 'breeding' | 'feeding' | 'general' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

export interface AnimalHireAgreement {
  agreement_id: number;
  tenant_id: number;
  farm_id: number;
  agreement_type: 'hire_in' | 'hire_out';
  external_farm_id: number;
  animal_id?: number;
  external_animal_id?: number;
  start_date: string;
  end_date: string;
  hire_fee: number;
  payment_schedule: 'daily' | 'weekly' | 'monthly' | 'one_time';
  payment_status: 'pending' | 'partial' | 'paid';
  status: 'active' | 'completed' | 'cancelled';
  terms?: string;
  created_at: string;
}

export interface WorkerSchedule {
  schedule_id: number;
  tenant_id: number;
  farm_id: number;
  worker_user_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  task_type: string;
  assigned_animals?: number[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export const mockPermissions: Permission[] = [
  // Animals Category
  { permission_id: 1, name: 'view_animals', display_name: 'View Animals', description: 'View list and details of animals', category: 'animals', action: 'view_animals', resource_type: 'animal', system_defined: true },
  { permission_id: 2, name: 'create_animals', display_name: 'Create Animals', description: 'Add new animals to the system', category: 'animals', action: 'create_animals', resource_type: 'animal', system_defined: true },
  { permission_id: 3, name: 'edit_animals', display_name: 'Edit Animals', description: 'Modify animal information', category: 'animals', action: 'edit_animals', resource_type: 'animal', system_defined: true },
  { permission_id: 4, name: 'delete_animals', display_name: 'Delete Animals', description: 'Remove animals from the system', category: 'animals', action: 'delete_animals', resource_type: 'animal', system_defined: true },
  { permission_id: 5, name: 'edit_health', display_name: 'Edit Animal Health', description: 'Update animal health status', category: 'animals', action: 'edit_health', resource_type: 'animal', system_defined: true },
  
  // Activities Category
  { permission_id: 6, name: 'create_feeding', display_name: 'Log Feeding', description: 'Create feeding activity records', category: 'activities', action: 'create_activity', resource_type: 'activity', system_defined: true },
  { permission_id: 7, name: 'create_breeding', display_name: 'Log Breeding', description: 'Create breeding activity records', category: 'activities', action: 'create_activity', resource_type: 'activity', system_defined: true },
  { permission_id: 8, name: 'create_health_check', display_name: 'Log Health Check', description: 'Create health check/vaccination records', category: 'activities', action: 'create_activity', resource_type: 'activity', system_defined: true },
  { permission_id: 9, name: 'create_general', display_name: 'Log General Activity', description: 'Create general activity records', category: 'activities', action: 'create_activity', resource_type: 'activity', system_defined: true },
  { permission_id: 10, name: 'edit_activities', display_name: 'Edit Activities', description: 'Modify existing activity records', category: 'activities', action: 'edit_activities', resource_type: 'activity', system_defined: true },
  { permission_id: 11, name: 'delete_activities', display_name: 'Delete Activities', description: 'Remove activity records', category: 'activities', action: 'delete_activities', resource_type: 'activity', system_defined: true },
  
  // Reports Category
  { permission_id: 12, name: 'view_health_reports', display_name: 'View Health Reports', description: 'Access health-related reports', category: 'reports', action: 'view_reports', resource_type: 'report', system_defined: true },
  { permission_id: 13, name: 'view_operational_reports', display_name: 'View Operational Reports', description: 'Access operational/activity reports', category: 'reports', action: 'view_reports', resource_type: 'report', system_defined: true },
  { permission_id: 14, name: 'view_financial_reports', display_name: 'View Financial Reports', description: 'Access financial/invoice reports', category: 'reports', action: 'view_reports', resource_type: 'report', system_defined: true },
  
  // Management Category
  { permission_id: 15, name: 'manage_users', display_name: 'Manage Users', description: 'Create, edit, and assign users to roles', category: 'management', action: 'manage_users', resource_type: 'user', system_defined: true },
  { permission_id: 16, name: 'manage_roles', display_name: 'Manage Roles', description: 'Create and customize roles and permissions', category: 'management', action: 'manage_roles', resource_type: 'role', system_defined: true },
  { permission_id: 17, name: 'manage_subscriptions', display_name: 'Manage Subscriptions', description: 'View and manage subscription plans', category: 'management', action: 'manage_subscriptions', resource_type: 'subscription', system_defined: true },
  { permission_id: 18, name: 'view_audit_logs', display_name: 'View Audit Logs', description: 'Access audit trail and history', category: 'management', action: 'view_audit_logs', resource_type: 'audit', system_defined: true },
  { permission_id: 19, name: 'super_admin', display_name: 'Super Admin', description: 'Full system administration access across all tenants', category: 'management', action: 'super_admin', resource_type: 'system', system_defined: true },
];

export const mockRoleTemplates: RoleTemplate[] = [
  {
    template_id: 1,
    name: 'veterinarian',
    display_name: 'Veterinarian',
    description: 'Medical professional with full animal health access',
    category: 'medical',
    icon: '🐄',
    permissions: mockPermissions.filter(p => [1, 5, 8, 12].includes(p.permission_id))
  },
  {
    template_id: 2,
    name: 'farm_manager',
    display_name: 'Farm Manager',
    description: 'Full operational control of the farm',
    category: 'operations',
    icon: '👨‍🌾',
    permissions: mockPermissions.filter(p => [1, 2, 3, 6, 7, 9, 10, 13].includes(p.permission_id))
  },
  {
    template_id: 3,
    name: 'field_worker',
    display_name: 'Field Worker',
    description: 'Daily operational tasks and activity logging',
    category: 'operations',
    icon: '👷',
    permissions: mockPermissions.filter(p => [1, 6, 9].includes(p.permission_id))
  },
  {
    template_id: 4,
    name: 'accountant',
    display_name: 'Accountant',
    description: 'Financial reporting and sales management',
    category: 'financial',
    icon: '📊',
    permissions: mockPermissions.filter(p => [1, 14, 17].includes(p.permission_id))
  },
];

export const mockTenants: Tenant[] = [
  { tenant_id: 1, organization_name: 'ABC Livestock Co.', owner_user_id: 1, subscription_plan_id: 1, created_at: '2024-01-01T00:00:00Z' },
  { tenant_id: 2, organization_name: 'Green Valley Farms', owner_user_id: 2, subscription_plan_id: 2, created_at: '2024-01-15T00:00:00Z' },
  { tenant_id: 3, organization_name: 'Mountain View Ranch', owner_user_id: 5, subscription_plan_id: 1, created_at: '2024-01-20T00:00:00Z' },
  { tenant_id: 4, organization_name: 'Sunset Dairy Farm', owner_user_id: 6, subscription_plan_id: 3, created_at: '2024-02-01T00:00:00Z' },
];

// Mock subscription plans
export const mockSubscriptionPlans = [
  { plan_id: 1, name: 'Basic', price: 50000, max_users: 5, max_farms: 2, max_animals: 100, features: ['Basic Reports', 'Email Support'], status: 'active' },
  { plan_id: 2, name: 'Professional', price: 150000, max_users: 20, max_farms: 10, max_animals: 1000, features: ['Advanced Reports', 'Priority Support', 'API Access'], status: 'active' },
  { plan_id: 3, name: 'Enterprise', price: 500000, max_users: -1, max_farms: -1, max_animals: -1, features: ['All Features', '24/7 Support', 'Custom Integrations', 'Dedicated Manager'], status: 'active' },
];

// Mock tenant subscriptions
export const mockTenantSubscriptions = [
  { tenant_id: 1, plan_id: 1, status: 'active', start_date: '2024-01-01', end_date: '2024-12-31', auto_renew: true, payment_status: 'current' },
  { tenant_id: 2, plan_id: 2, status: 'active', start_date: '2024-01-15', end_date: '2024-12-31', auto_renew: true, payment_status: 'current' },
  { tenant_id: 3, plan_id: 1, status: 'suspended', start_date: '2024-01-20', end_date: '2024-12-31', auto_renew: false, payment_status: 'overdue' },
  { tenant_id: 4, plan_id: 3, status: 'active', start_date: '2024-02-01', end_date: '2025-01-31', auto_renew: true, payment_status: 'current' },
];

export const mockFarms: Farm[] = [
  { farm_id: 1, tenant_id: 1, farm_name: 'Main Farm', location: 'Kampala', district: 'Kampala', farm_type: 'dairy', status: 'active' },
  { farm_id: 2, tenant_id: 1, farm_name: 'North Branch', location: 'Wakiso', district: 'Wakiso', farm_type: 'poultry', status: 'active' },
  { farm_id: 3, tenant_id: 2, farm_name: 'Dairy Unit', location: 'Mukono', district: 'Mukono', farm_type: 'dairy', status: 'active' },
];

export const mockUsers: User[] = [
  { user_id: 1, email: 'owner@abclivestock.com', first_name: 'John', last_name: 'Doe', account_status: 'active', is_super_admin: false },
  { user_id: 2, email: 'vet@abclivestock.com', first_name: 'Dr. Sarah', last_name: 'Smith', account_status: 'active' },
  { user_id: 3, email: 'worker@abclivestock.com', first_name: 'Mike', last_name: 'Johnson', account_status: 'active' },
];

export const mockRoles: Role[] = [
  {
    role_id: 1,
    tenant_id: 1,
    template_id: 1,
    name: 'Veterinarian',
    description: 'Medical professional role',
    permissions: mockPermissions.filter(p => [1, 5, 8, 12].includes(p.permission_id)),
    created_at: '2024-01-05T00:00:00Z'
  },
  {
    role_id: 2,
    tenant_id: 1,
    name: 'Helper',
    description: 'Farm data manager - handles all farm records except veterinary data',
    permissions: mockPermissions.filter(p => [1, 2, 3, 6, 7, 9, 10, 13, 14].includes(p.permission_id)), // view_animals, create_animals, edit_animals, create_feeding, create_breeding, create_general, edit_activities, view_operational_reports, view_financial_reports
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    role_id: 3,
    tenant_id: 0, // Super admin has tenant_id 0 (system-wide)
    name: 'Super Admin',
    description: 'Full system administration access across all tenants',
    permissions: mockPermissions.filter(p => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].includes(p.permission_id)), // All permissions
    created_at: '2024-01-01T00:00:00Z'
  },
];

export const mockDelegations: Delegation[] = [
  {
    delegation_id: 1,
    tenant_id: 1,
    delegator_user_id: 1,
    delegator: mockUsers[0],
    delegate_user_id: 2,
    delegate: mockUsers[1],
    delegation_type: 'permission',
    start_date: '2024-01-20T00:00:00Z',
    end_date: '2024-01-25T00:00:00Z',
    status: 'active',
    description: 'Delegating health editing while traveling',
    delegated_permission_ids: [5],
    delegated_permissions: [mockPermissions[4]],
    created_at: '2024-01-19T00:00:00Z'
  },
];

export const mockInvitations: Invitation[] = [
  {
    invitation_id: 1,
    tenant_id: 1,
    invitation_token: 'abc123token',
    invited_by_user_id: 1,
    invited_by: mockUsers[0],
    email: 'newuser@example.com',
    first_name: 'Jane',
    last_name: 'Williams',
    role_id: 2,
    invitation_status: 'pending',
    sent_at: '2024-01-18T10:00:00Z',
    expires_at: '2024-01-20T10:00:00Z',
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    audit_id: 1,
    user_id: 1,
    user: mockUsers[0],
    tenant_id: 1,
    farm_id: 1,
    action: 'create_animal',
    entity_type: 'animal',
    entity_id: 101,
    details: { animal_name: 'Bella', animal_type: 'cattle' },
    logged_at: '2024-01-15T14:30:00Z'
  },
  {
    audit_id: 2,
    user_id: 2,
    user: mockUsers[1],
    tenant_id: 1,
    farm_id: 1,
    action: 'edit_health',
    entity_type: 'animal',
    entity_id: 101,
    details: { health_status: 'healthy' },
    logged_at: '2024-01-16T09:15:00Z'
  },
];

// Mock Business Data
export const mockAnimals: Animal[] = [
  {
    animal_id: 1,
    farm_id: 1,
    tenant_id: 1,
    tag_number: 'COW-001',
    animal_type: 'cattle',
    breed: 'Holstein',
    gender: 'female',
    birth_date: '2020-03-15',
    status: 'active',
    health_status: 'healthy',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    animal_id: 2,
    farm_id: 1,
    tenant_id: 1,
    tag_number: 'COW-002',
    animal_type: 'cattle',
    breed: 'Jersey',
    gender: 'female',
    birth_date: '2019-05-20',
    status: 'active',
    health_status: 'healthy',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    animal_id: 3,
    farm_id: 2,
    tenant_id: 1,
    tag_number: 'CHK-001',
    animal_type: 'chicken',
    breed: 'Rhode Island Red',
    gender: 'female',
    birth_date: '2023-08-10',
    status: 'active',
    health_status: 'healthy',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
];

export const mockAnimalSales: AnimalSale[] = [
  {
    sale_id: 1,
    tenant_id: 1,
    farm_id: 1,
    animal_id: 1,
    sale_date: '2024-01-10',
    sale_type: 'direct',
    customer_name: 'Local Market',
    sale_price: 500000,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    created_by_user_id: 1,
    created_at: '2024-01-10T00:00:00Z'
  },
];

export const mockProductSales: ProductSale[] = [
  {
    product_sale_id: 1,
    tenant_id: 1,
    farm_id: 1,
    product_type: 'milk',
    animal_id: 1,
    quantity: 50,
    unit: 'liters',
    unit_price: 2000,
    total_amount: 100000,
    sale_date: '2024-01-20',
    customer_name: 'Dairy Co-op',
    payment_method: 'cash',
    payment_status: 'paid',
    created_by_user_id: 1,
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    product_sale_id: 2,
    tenant_id: 1,
    farm_id: 2,
    product_type: 'eggs',
    quantity: 120,
    unit: 'pieces',
    unit_price: 500,
    total_amount: 60000,
    sale_date: '2024-01-21',
    customer_name: 'Local Store',
    payment_method: 'cash',
    payment_status: 'paid',
    created_by_user_id: 1,
    created_at: '2024-01-21T00:00:00Z'
  },
];

export const mockProduction: Production[] = [
  {
    production_id: 1,
    tenant_id: 1,
    farm_id: 1,
    production_type: 'milk',
    animal_id: 1,
    production_date: '2024-01-20',
    quantity: 25,
    unit: 'liters',
    quality_notes: 'Good quality, fresh',
    recorded_by_user_id: 1,
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    production_id: 2,
    tenant_id: 1,
    farm_id: 1,
    production_type: 'milk',
    animal_id: 1,
    production_date: '2024-01-21',
    quantity: 28,
    unit: 'liters',
    quality_notes: 'Excellent quality',
    recorded_by_user_id: 1,
    created_at: '2024-01-21T00:00:00Z'
  },
  {
    production_id: 3,
    tenant_id: 1,
    farm_id: 1,
    production_type: 'milk',
    animal_id: 2,
    production_date: '2024-01-20',
    quantity: 22,
    unit: 'liters',
    quality_notes: 'Normal quality',
    recorded_by_user_id: 1,
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    production_id: 4,
    tenant_id: 1,
    farm_id: 2,
    production_type: 'eggs',
    production_date: '2024-01-21',
    quantity: 150,
    unit: 'pieces',
    recorded_by_user_id: 1,
    created_at: '2024-01-21T00:00:00Z'
  },
  {
    production_id: 5,
    tenant_id: 1,
    farm_id: 2,
    production_type: 'eggs',
    production_date: '2024-01-22',
    quantity: 145,
    unit: 'pieces',
    recorded_by_user_id: 1,
    created_at: '2024-01-22T00:00:00Z'
  },
];

export const mockExpenses: Expense[] = [
  {
    expense_id: 1,
    tenant_id: 1,
    farm_id: 1,
    expense_type: 'feed',
    description: 'Animal feed purchase',
    amount: 150000,
    expense_date: '2024-01-15',
    vendor: 'Feed Suppliers Ltd',
    payment_method: 'bank_transfer',
    created_by_user_id: 1,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    expense_id: 2,
    tenant_id: 1,
    farm_id: 1,
    expense_type: 'medicine',
    description: 'Vaccination supplies',
    amount: 75000,
    expense_date: '2024-01-18',
    vendor: 'Vet Supplies Co',
    payment_method: 'cash',
    created_by_user_id: 1,
    created_at: '2024-01-18T00:00:00Z'
  },
];

export const mockActivities: Activity[] = [
  {
    activity_id: 1,
    farm_id: 1,
    tenant_id: 1,
    activity_type: 'feeding',
    animal_id: 1,
    description: 'Morning feeding - 5kg hay',
    activity_date: '2024-01-20',
    performed_by_user_id: 3,
    performed_by: mockUsers[2],
    cost: 5000,
    created_at: '2024-01-20T08:00:00Z'
  },
  {
    activity_id: 2,
    farm_id: 1,
    tenant_id: 1,
    activity_type: 'health_check',
    animal_id: 1,
    description: 'Routine health check - all normal',
    activity_date: '2024-01-19',
    performed_by_user_id: 2,
    performed_by: mockUsers[1],
    created_at: '2024-01-19T10:00:00Z'
  },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    alert_id: 1,
    tenant_id: 1,
    farm_id: 1,
    animal_id: 1,
    alert_type: 'health',
    severity: 'high',
    title: 'Health Check Required',
    message: 'COW-001 is due for routine health checkup',
    status: 'active',
    created_at: '2024-01-20T08:00:00Z'
  },
  {
    alert_id: 2,
    tenant_id: 1,
    farm_id: 1,
    animal_id: 2,
    alert_type: 'breeding',
    severity: 'medium',
    title: 'Breeding Schedule',
    message: 'COW-002 is ready for breeding',
    status: 'active',
    created_at: '2024-01-19T10:00:00Z'
  },
  {
    alert_id: 3,
    tenant_id: 1,
    farm_id: 2,
    alert_type: 'feeding',
    severity: 'low',
    title: 'Feed Stock Low',
    message: 'Poultry feed running low, restock needed',
    status: 'acknowledged',
    created_at: '2024-01-18T14:00:00Z'
  }
];

// Mock Breeding Records (Phase 2 + Phase 7 Enhanced)
export const mockBreedingRecords: BreedingRecord[] = [
  // Internal breeding record (Phase 2 enhanced)
  {
    breeding_id: 1,
    tenant_id: 1,
    farm_id: 1,
    animal_id: 1, // Female cow
    sire_id: 2, // Internal bull (assuming animal_id 2 is a bull)
    sire_source: 'internal',
    breeding_date: '2023-12-01',
    breeding_method: 'artificial_insemination',
    conception_date: '2023-12-08',
    expected_due_date: '2024-09-15',
    pregnancy_status: 'confirmed',
    offspring_count: undefined,
    notes: 'First breeding attempt with premium genetics',
    recorded_by_user_id: 1,
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2023-12-08T00:00:00Z',
    // Legacy fields for backward compatibility
    expected_delivery_date: '2024-09-15',
    status: 'in_progress'
  },
  // Internal breeding record - completed (Phase 2 enhanced)
  {
    breeding_id: 2,
    tenant_id: 1,
    farm_id: 1,
    animal_id: 2, // Female cow
    sire_id: 1, // Internal bull
    sire_source: 'internal',
    breeding_date: '2023-11-15',
    breeding_method: 'natural',
    conception_date: '2023-11-22',
    expected_due_date: '2024-08-30',
    actual_birth_date: '2024-08-28',
    birth_outcome: 'successful',
    offspring_count: 1,
    offspring_ids: [15],
    pregnancy_status: 'completed',
    notes: 'Healthy calf delivered',
    recorded_by_user_id: 1,
    created_at: '2023-11-15T00:00:00Z',
    updated_at: '2024-08-28T00:00:00Z',
    // Legacy fields
    expected_delivery_date: '2024-08-30',
    actual_delivery_date: '2024-08-28',
    status: 'successful'
  },
  // External breeding record (Phase 7)
  {
    breeding_id: 3,
    tenant_id: 1,
    farm_id: 1,
    animal_id: 1, // Female cow
    external_animal_id: 1, // External bull from ABC Cattle Farm
    sire_source: 'external',
    external_farm_name: 'ABC Cattle Farm',
    external_animal_tag: 'Bull-123',
    external_animal_hire_agreement_id: 1, // Link to hire agreement
    breeding_date: '2024-02-10',
    breeding_method: 'natural',
    conception_date: '2024-02-15',
    expected_due_date: '2024-11-20',
    pregnancy_status: 'confirmed',
    notes: 'Bred with external bull from ABC Cattle Farm',
    recorded_by_user_id: 1,
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  // External breeding record - with complications (Phase 2 + Phase 7)
  {
    breeding_id: 4,
    tenant_id: 1,
    farm_id: 1,
    animal_id: 2, // Female cow
    external_animal_id: 3, // External bull
    sire_source: 'external',
    external_farm_name: 'Sunrise Dairy Farm',
    external_animal_tag: 'EXT-BULL-001',
    breeding_date: '2024-01-20',
    breeding_method: 'artificial_insemination',
    conception_date: '2024-01-27',
    expected_due_date: '2024-10-25',
    actual_birth_date: '2024-10-22',
    birth_outcome: 'complications',
    offspring_count: 1,
    complications: 'Difficult delivery, required veterinary assistance',
    pregnancy_status: 'completed',
    notes: 'External breeding with complications during birth',
    recorded_by_user_id: 1,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-10-22T00:00:00Z'
  }
];

// Mock External Farms
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
  },
  {
    external_farm_id: 3,
    tenant_id: 1,
    farm_name: 'Sunrise Dairy Farm',
    owner_name: 'Peter Mukasa',
    contact_person: 'Peter Mukasa',
    phone: '+256700123456',
    email: 'peter@sunrisedairy.com',
    location: 'Mbarara',
    district: 'Mbarara',
    farm_type: 'dairy',
    specialties: ['cattle_breeding', 'dairy_production'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock External Animals
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
  },
  {
    external_animal_id: 3,
    external_farm_id: 1,
    tag_number: 'EXT-BULL-001',
    animal_type: 'cattle',
    breed: 'Friesian',
    gender: 'male',
    age_years: 4,
    weight_kg: 700,
    health_status: 'healthy',
    health_certificate_available: true,
    health_certificate_expiry: '2024-12-31',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  }
];

// Mock Animal Hire Agreements
export const mockAnimalHireAgreements: AnimalHireAgreement[] = [
  {
    agreement_id: 1,
    tenant_id: 1,
    farm_id: 1,
    agreement_type: 'hire_in',
    external_farm_id: 1,
    external_animal_id: 1,
    start_date: '2024-01-15',
    end_date: '2024-02-15',
    hire_fee: 200000,
    payment_schedule: 'monthly',
    payment_status: 'paid',
    status: 'active',
    terms: 'Bull hire for breeding purposes, 1 month rental',
    created_at: '2024-01-10T00:00:00Z'
  }
];

// Mock External Animal Hire Agreements (for external farms hiring from us)
export const mockExternalAnimalHireAgreements: AnimalHireAgreement[] = [
  {
    agreement_id: 2,
    tenant_id: 1,
    farm_id: 1,
    agreement_type: 'hire_out',
    external_farm_id: 2,
    animal_id: 1,
    start_date: '2024-01-20',
    end_date: '2024-02-20',
    hire_fee: 150000,
    payment_schedule: 'monthly',
    payment_status: 'pending',
    status: 'active',
    terms: 'Cow hire to Valley Breeding Center',
    created_at: '2024-01-18T00:00:00Z'
  }
];

// Mock Worker Schedules
export const mockWorkerSchedules: WorkerSchedule[] = [
  {
    schedule_id: 1,
    tenant_id: 1,
    farm_id: 1,
    worker_user_id: 3,
    schedule_date: '2024-01-22',
    start_time: '06:00',
    end_time: '14:00',
    task_type: 'Feeding and Health Monitoring',
    assigned_animals: [1, 2],
    status: 'scheduled',
    notes: 'Morning shift - focus on dairy cattle',
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    schedule_id: 2,
    tenant_id: 1,
    farm_id: 2,
    worker_user_id: 3,
    schedule_date: '2024-01-22',
    start_time: '14:00',
    end_time: '18:00',
    task_type: 'Poultry Care',
    assigned_animals: [3],
    status: 'scheduled',
    notes: 'Afternoon shift - poultry feeding and egg collection',
    created_at: '2024-01-20T00:00:00Z'
  }
];

// Mock Inventory Items
export const mockInventoryItems: InventoryItem[] = [
  // Feed Items
  {
    item_id: 1,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Cattle Feed Pellets',
    item_code: 'FEED-CF-001',
    category: 'feed',
    subcategory: 'pellets',
    description: 'High-quality cattle feed pellets',
    unit: 'kg',
    current_stock: 450,
    reorder_point: 200,
    reorder_quantity: 500,
    unit_cost: 1200,
    total_value: 540000,
    supplier: 'AgriFeed Supplies',
    supplier_contact: '+256 700 123456',
    location: 'Warehouse A - Feed Storage',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    item_id: 2,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Hay Bales',
    item_code: 'FEED-HB-001',
    category: 'feed',
    subcategory: 'hay',
    description: 'Premium quality hay bales',
    unit: 'bales',
    current_stock: 120,
    reorder_point: 50,
    reorder_quantity: 100,
    unit_cost: 15000,
    total_value: 1800000,
    supplier: 'Green Pastures Farm',
    supplier_contact: '+256 700 234567',
    location: 'Warehouse B - Hay Storage',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    item_id: 3,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Chicken Feed',
    item_code: 'FEED-CH-001',
    category: 'feed',
    subcategory: 'poultry',
    description: 'Layer feed for chickens',
    unit: 'kg',
    current_stock: 85,
    reorder_point: 100,
    reorder_quantity: 200,
    unit_cost: 1500,
    total_value: 127500,
    supplier: 'Poultry Feed Co.',
    supplier_contact: '+256 700 345678',
    location: 'Warehouse A - Feed Storage',
    status: 'low_stock',
    created_by_user_id: 1,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z'
  },
  // Medications
  {
    item_id: 4,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Antibiotic Injection',
    item_code: 'MED-AB-001',
    category: 'medication',
    subcategory: 'antibiotic',
    description: 'Broad-spectrum antibiotic for livestock',
    unit: 'vials',
    current_stock: 25,
    reorder_point: 15,
    reorder_quantity: 30,
    unit_cost: 25000,
    total_value: 625000,
    supplier: 'VetMed Supplies',
    supplier_contact: '+256 700 456789',
    location: 'Medicine Cabinet - Refrigerated',
    expiry_date: '2024-12-31',
    batch_number: 'BATCH-2024-001',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    item_id: 5,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Vaccine - FMD',
    item_code: 'MED-VAC-001',
    category: 'medication',
    subcategory: 'vaccine',
    description: 'Foot and Mouth Disease vaccine',
    unit: 'doses',
    current_stock: 8,
    reorder_point: 20,
    reorder_quantity: 50,
    unit_cost: 5000,
    total_value: 40000,
    supplier: 'VetMed Supplies',
    supplier_contact: '+256 700 456789',
    location: 'Medicine Cabinet - Refrigerated',
    expiry_date: '2024-06-30',
    batch_number: 'BATCH-2024-VAC-001',
    status: 'low_stock',
    created_by_user_id: 1,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  },
  // Equipment
  {
    item_id: 6,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Milking Machine',
    item_code: 'EQP-MILK-001',
    category: 'equipment',
    subcategory: 'milking',
    description: 'Portable milking machine',
    unit: 'pieces',
    current_stock: 2,
    reorder_point: 1,
    reorder_quantity: 1,
    unit_cost: 2500000,
    total_value: 5000000,
    supplier: 'Farm Equipment Ltd',
    supplier_contact: '+256 700 567890',
    location: 'Equipment Shed',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z'
  },
  {
    item_id: 7,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Feed Mixer',
    item_code: 'EQP-FEED-001',
    category: 'equipment',
    subcategory: 'feeding',
    description: 'Automatic feed mixing machine',
    unit: 'pieces',
    current_stock: 1,
    reorder_point: 0,
    reorder_quantity: 1,
    unit_cost: 3500000,
    total_value: 3500000,
    supplier: 'Farm Equipment Ltd',
    supplier_contact: '+256 700 567890',
    location: 'Equipment Shed',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2023-11-15T00:00:00Z',
    updated_at: '2023-11-15T00:00:00Z'
  },
  // Tools
  {
    item_id: 8,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Shovel',
    item_code: 'TOOL-SHOV-001',
    category: 'tools',
    subcategory: 'hand_tools',
    description: 'Heavy-duty farm shovel',
    unit: 'pieces',
    current_stock: 5,
    reorder_point: 2,
    reorder_quantity: 3,
    unit_cost: 25000,
    total_value: 125000,
    supplier: 'Hardware Store',
    supplier_contact: '+256 700 678901',
    location: 'Tool Shed',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    item_id: 9,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Animal Tagging Gun',
    item_code: 'TOOL-TAG-001',
    category: 'tools',
    subcategory: 'tagging',
    description: 'Electronic tagging gun for animals',
    unit: 'pieces',
    current_stock: 0,
    reorder_point: 1,
    reorder_quantity: 2,
    unit_cost: 150000,
    total_value: 0,
    supplier: 'Livestock Supplies',
    supplier_contact: '+256 700 789012',
    location: 'Tool Shed',
    status: 'out_of_stock',
    created_by_user_id: 1,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  // Supplies
  {
    item_id: 10,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Animal Tags',
    item_code: 'SUP-TAG-001',
    category: 'supplies',
    subcategory: 'tagging',
    description: 'Plastic ear tags for animals',
    unit: 'pieces',
    current_stock: 150,
    reorder_point: 100,
    reorder_quantity: 200,
    unit_cost: 500,
    total_value: 75000,
    supplier: 'Livestock Supplies',
    supplier_contact: '+256 700 789012',
    location: 'Storage Room',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    item_id: 11,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Rope',
    item_code: 'SUP-ROPE-001',
    category: 'supplies',
    subcategory: 'general',
    description: 'Heavy-duty rope for livestock',
    unit: 'meters',
    current_stock: 200,
    reorder_point: 100,
    reorder_quantity: 150,
    unit_cost: 2000,
    total_value: 400000,
    supplier: 'Hardware Store',
    supplier_contact: '+256 700 678901',
    location: 'Storage Room',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Bedding
  {
    item_id: 12,
    tenant_id: 1,
    farm_id: 1,
    item_name: 'Straw Bedding',
    item_code: 'BED-STR-001',
    category: 'bedding',
    subcategory: 'straw',
    description: 'Straw for animal bedding',
    unit: 'bales',
    current_stock: 30,
    reorder_point: 20,
    reorder_quantity: 40,
    unit_cost: 8000,
    total_value: 240000,
    supplier: 'Green Pastures Farm',
    supplier_contact: '+256 700 234567',
    location: 'Warehouse B - Bedding Storage',
    status: 'active',
    created_by_user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
];

// Mock Inventory Movements
export const mockInventoryMovements: InventoryMovement[] = [
  {
    movement_id: 1,
    item_id: 1,
    tenant_id: 1,
    farm_id: 1,
    movement_type: 'in',
    quantity: 500,
    unit: 'kg',
    unit_cost: 1200,
    total_cost: 600000,
    reason: 'purchase',
    reference_number: 'INV-2024-001',
    notes: 'Monthly feed purchase',
    created_by_user_id: 1,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    movement_id: 2,
    item_id: 1,
    tenant_id: 1,
    farm_id: 1,
    movement_type: 'out',
    quantity: 50,
    unit: 'kg',
    reason: 'usage',
    notes: 'Daily feeding',
    created_by_user_id: 2,
    created_at: '2024-01-16T08:00:00Z'
  },
  {
    movement_id: 3,
    item_id: 4,
    tenant_id: 1,
    farm_id: 1,
    movement_type: 'in',
    quantity: 30,
    unit: 'vials',
    unit_cost: 25000,
    total_cost: 750000,
    reason: 'purchase',
    reference_number: 'INV-2024-002',
    notes: 'Monthly medication restock',
    created_by_user_id: 1,
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    movement_id: 4,
    item_id: 4,
    tenant_id: 1,
    farm_id: 1,
    movement_type: 'out',
    quantity: 5,
    unit: 'vials',
    reason: 'usage',
    notes: 'Treatment for sick cattle',
    created_by_user_id: 3,
    created_at: '2024-01-12T10:00:00Z'
  },
  {
    movement_id: 5,
    item_id: 9,
    tenant_id: 1,
    farm_id: 1,
    movement_type: 'out',
    quantity: 1,
    unit: 'pieces',
    reason: 'damaged',
    notes: 'Tagging gun broken, needs replacement',
    created_by_user_id: 2,
    created_at: '2024-01-20T14:00:00Z'
  }
];

// Tax Management Mock Data (Uganda-Specific - URA Compliant)
export const mockTaxRates: TaxRate[] = [
  {
    tax_rate_id: 1,
    tenant_id: null, // System-wide (super admin)
    tax_name: 'Value Added Tax (VAT)',
    tax_code: 'VAT-UG-18',
    tax_type: 'vat',
    rate_percentage: 18.00,
    applies_to: 'all_revenue',
    calculation_method: 'exclusive',
    effective_from: '2024-01-01',
    is_active: true,
    is_system_default: true,
    ura_tax_category: 'VAT-STANDARD',
    description: 'Uganda standard VAT rate (18%) as per URA regulations',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    tax_rate_id: 2,
    tenant_id: 1, // Tenant-specific
    tax_name: 'VAT - Custom Rate',
    tax_code: 'VAT-TENANT-1-18',
    tax_type: 'vat',
    rate_percentage: 18.00,
    applies_to: 'all_revenue',
    calculation_method: 'exclusive',
    effective_from: '2024-01-01',
    is_active: true,
    is_system_default: false,
    ura_tax_category: 'VAT-STANDARD',
    description: 'Tenant-specific VAT rate',
    created_by_user_id: 1,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

export const mockTaxCalculations: TaxCalculation[] = [
  {
    tax_calculation_id: 1,
    tenant_id: 1,
    farm_id: 1,
    source_type: 'animal_sale',
    source_id: 1,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 5000000,
    tax_amount: 900000,
    total_amount: 5900000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-01-15',
    calculated_at: '2024-01-15T10:30:00Z'
  },
  {
    tax_calculation_id: 2,
    tenant_id: 1,
    farm_id: 1,
    source_type: 'product_sale',
    source_id: 1,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 1200000,
    tax_amount: 216000,
    total_amount: 1416000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-01-20',
    calculated_at: '2024-01-20T14:15:00Z'
  },
  {
    tax_calculation_id: 3,
    tenant_id: 1,
    farm_id: 1,
    source_type: 'animal_sale',
    source_id: 2,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 3500000,
    tax_amount: 630000,
    total_amount: 4130000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-02-01',
    calculated_at: '2024-02-01T09:00:00Z'
  }
];

export const mockTaxRecords: TaxRecord[] = [
  {
    tax_record_id: 1,
    tenant_id: 1,
    farm_id: 1,
    period_type: 'monthly',
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    total_revenue: 6200000,
    total_tax: 1116000,
    transaction_count: 2,
    farm_breakdown: {
      'Main Farm': {
        revenue: 6200000,
        tax: 1116000,
        count: 2
      }
    },
    status: 'finalized',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  }
];

export const mockTaxConfiguration: TaxConfiguration = {
  config_id: 1,
  tenant_id: 1,
  default_tax_rate_id: 1,
  default_tax_rate: mockTaxRates[0],
  auto_calculate_tax: true,
  auto_apply_to_animal_sales: true,
  auto_apply_to_product_sales: true,
  tax_year_start_month: 7, // July (Uganda fiscal year)
  reporting_currency: 'UGX',
  require_tax_id: true,
  tax_id_label: 'TIN',
  ura_vat_registered: false,
  vat_registration_threshold: 150000000, // UGX 150,000,000
  notify_on_tax_due: true,
  tax_due_reminder_days: 7,
  updated_at: '2024-01-01T00:00:00Z'
};

// Super Admin Tax Calculations (based on subscription revenue)
export const mockSuperAdminTaxCalculations: TaxCalculation[] = [
  {
    tax_calculation_id: 1001,
    tenant_id: 0, // System-wide (super admin)
    farm_id: undefined,
    source_type: 'service_revenue',
    source_id: 1, // Subscription payment ID
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 50000, // Basic plan subscription
    tax_amount: 9000, // 18% VAT
    total_amount: 59000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-01-01',
    notes: 'Subscription revenue - Tenant 1 (Basic Plan)',
    calculated_at: '2024-01-01T10:00:00Z'
  },
  {
    tax_calculation_id: 1002,
    tenant_id: 0,
    farm_id: undefined,
    source_type: 'service_revenue',
    source_id: 2,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 150000, // Professional plan subscription
    tax_amount: 27000,
    total_amount: 177000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-01-15',
    notes: 'Subscription revenue - Tenant 2 (Professional Plan)',
    calculated_at: '2024-01-15T10:00:00Z'
  },
  {
    tax_calculation_id: 1003,
    tenant_id: 0,
    farm_id: undefined,
    source_type: 'service_revenue',
    source_id: 3,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 50000, // Basic plan subscription
    tax_amount: 9000,
    total_amount: 59000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-01-20',
    notes: 'Subscription revenue - Tenant 3 (Basic Plan)',
    calculated_at: '2024-01-20T10:00:00Z'
  },
  {
    tax_calculation_id: 1004,
    tenant_id: 0,
    farm_id: undefined,
    source_type: 'service_revenue',
    source_id: 4,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 500000, // Enterprise plan subscription
    tax_amount: 90000,
    total_amount: 590000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-02-01',
    notes: 'Subscription revenue - Tenant 4 (Enterprise Plan)',
    calculated_at: '2024-02-01T10:00:00Z'
  },
  // Monthly recurring subscriptions
  {
    tax_calculation_id: 1005,
    tenant_id: 0,
    farm_id: undefined,
    source_type: 'service_revenue',
    source_id: 5,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 50000,
    tax_amount: 9000,
    total_amount: 59000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-02-01',
    notes: 'Subscription revenue - Tenant 1 (Monthly renewal)',
    calculated_at: '2024-02-01T10:00:00Z'
  },
  {
    tax_calculation_id: 1006,
    tenant_id: 0,
    farm_id: undefined,
    source_type: 'service_revenue',
    source_id: 6,
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    revenue_amount: 150000,
    tax_amount: 27000,
    total_amount: 177000,
    calculation_method: 'exclusive',
    tax_rate_percentage: 18.00,
    transaction_date: '2024-02-15',
    notes: 'Subscription revenue - Tenant 2 (Monthly renewal)',
    calculated_at: '2024-02-15T10:00:00Z'
  }
];

// Super Admin Tax Records (aggregated by period)
export const mockSuperAdminTaxRecords: TaxRecord[] = [
  {
    tax_record_id: 1001,
    tenant_id: 0, // System-wide
    farm_id: undefined,
    period_type: 'monthly',
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    total_revenue: 250000, // Total subscription revenue for January
    total_tax: 45000, // 18% VAT
    transaction_count: 3,
    farm_breakdown: {},
    status: 'finalized',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    tax_record_id: 1002,
    tenant_id: 0,
    farm_id: undefined,
    period_type: 'monthly',
    period_start: '2024-02-01',
    period_end: '2024-02-29',
    tax_rate_id: 1,
    tax_rate: mockTaxRates[0],
    total_revenue: 700000, // Total subscription revenue for February
    total_tax: 126000,
    transaction_count: 3,
    farm_breakdown: {},
    status: 'draft',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  }
];

// HR Mock Data
export const mockEmployees: Employee[] = [
  {
    employee_id: 1,
    tenant_id: 1,
    farm_id: 1,
    user_id: 2,
    user: mockUsers[1],
    employee_number: 'EMP001',
    position: 'Farm Worker',
    department: 'Operations',
    employment_type: 'full_time',
    hire_date: '2023-01-15',
    is_active: true,
    salary_amount: 500000,
    salary_currency: 'UGX',
    salary_frequency: 'monthly',
    manager_user_id: 1,
    manager: mockUsers[0],
    notes: 'Experienced in animal care',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z'
  },
  {
    employee_id: 2,
    tenant_id: 1,
    farm_id: 1,
    user_id: 3,
    user: mockUsers[2],
    employee_number: 'EMP002',
    position: 'Veterinary Assistant',
    department: 'Health',
    employment_type: 'full_time',
    hire_date: '2023-03-01',
    is_active: true,
    salary_amount: 750000,
    salary_currency: 'UGX',
    salary_frequency: 'monthly',
    manager_user_id: 1,
    manager: mockUsers[0],
    notes: 'Specializes in cattle health',
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2023-03-01T00:00:00Z'
  },
  {
    employee_id: 3,
    tenant_id: 1,
    farm_id: 2,
    user_id: 4,
    user: mockUsers[3],
    employee_number: 'EMP003',
    position: 'Farm Manager',
    department: 'Management',
    employment_type: 'full_time',
    hire_date: '2022-06-01',
    is_active: true,
    salary_amount: 1200000,
    salary_currency: 'UGX',
    salary_frequency: 'monthly',
    notes: 'Manages daily operations',
    created_at: '2022-06-01T00:00:00Z',
    updated_at: '2022-06-01T00:00:00Z'
  }
];

export const mockPayrollRecords: Payroll[] = [
  {
    payroll_id: 1,
    tenant_id: 1,
    farm_id: 1,
    employee_id: 1,
    employee: mockEmployees[0],
    pay_period_start: '2024-01-01',
    pay_period_end: '2024-01-31',
    pay_date: '2024-02-05',
    base_salary: 500000,
    allowances: 50000,
    deductions: 25000,
    overtime: 75000,
    bonuses: 0,
    gross_pay: 625000,
    net_pay: 600000,
    currency: 'UGX',
    payment_method: 'mobile_money',
    payment_status: 'paid',
    paid_at: '2024-02-05T10:00:00Z',
    reminder_sent: false,
    notes: 'January 2024 payroll',
    processed_by_user_id: 1,
    processed_by: mockUsers[0],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-05T10:00:00Z'
  },
  {
    payroll_id: 2,
    tenant_id: 1,
    farm_id: 1,
    employee_id: 2,
    employee: mockEmployees[1],
    pay_period_start: '2024-01-01',
    pay_period_end: '2024-01-31',
    pay_date: '2024-02-05',
    base_salary: 750000,
    allowances: 75000,
    deductions: 37500,
    overtime: 100000,
    bonuses: 50000,
    gross_pay: 975000,
    net_pay: 937500,
    currency: 'UGX',
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    paid_at: '2024-02-05T10:00:00Z',
    reminder_sent: false,
    notes: 'January 2024 payroll',
    processed_by_user_id: 1,
    processed_by: mockUsers[0],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-05T10:00:00Z'
  },
  {
    payroll_id: 3,
    tenant_id: 1,
    farm_id: 1,
    employee_id: 1,
    employee: mockEmployees[0],
    pay_period_start: '2024-02-01',
    pay_period_end: '2024-02-29',
    pay_date: '2024-03-05',
    base_salary: 500000,
    allowances: 50000,
    deductions: 25000,
    overtime: 50000,
    bonuses: 0,
    gross_pay: 600000,
    net_pay: 575000,
    currency: 'UGX',
    payment_method: 'mobile_money',
    payment_status: 'pending',
    reminder_sent: true,
    reminder_sent_at: '2024-03-04T08:00:00Z',
    notes: 'February 2024 payroll - payment due tomorrow',
    processed_by_user_id: 1,
    processed_by: mockUsers[0],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  }
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    leave_id: 1,
    tenant_id: 1,
    farm_id: 1,
    employee_id: 1,
    employee: mockEmployees[0],
    leave_type: 'annual',
    start_date: '2024-03-15',
    end_date: '2024-03-22',
    days_requested: 8,
    status: 'approved',
    requested_at: '2024-02-20T10:00:00Z',
    approved_by_user_id: 1,
    approved_by: mockUsers[0],
    approved_at: '2024-02-21T14:00:00Z',
    reason: 'Family vacation',
    notes: 'Approved for annual leave',
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-02-21T14:00:00Z'
  },
  {
    leave_id: 2,
    tenant_id: 1,
    farm_id: 1,
    employee_id: 2,
    employee: mockEmployees[1],
    leave_type: 'sick',
    start_date: '2024-02-10',
    end_date: '2024-02-12',
    days_requested: 3,
    status: 'approved',
    requested_at: '2024-02-09T08:00:00Z',
    approved_by_user_id: 1,
    approved_by: mockUsers[0],
    approved_at: '2024-02-09T09:00:00Z',
    reason: 'Medical treatment',
    notes: 'Sick leave approved',
    created_at: '2024-02-09T08:00:00Z',
    updated_at: '2024-02-09T09:00:00Z'
  },
  {
    leave_id: 3,
    tenant_id: 1,
    farm_id: 1,
    employee_id: 1,
    employee: mockEmployees[0],
    leave_type: 'emergency',
    start_date: '2024-03-25',
    end_date: '2024-03-25',
    days_requested: 1,
    status: 'pending',
    requested_at: '2024-03-24T15:00:00Z',
    reason: 'Family emergency',
    notes: 'Awaiting approval',
    created_at: '2024-03-24T15:00:00Z',
    updated_at: '2024-03-24T15:00:00Z'
  }
];

export const mockPayrollReminders: PayrollReminder[] = [
  {
    reminder_id: 1,
    tenant_id: 1,
    payroll_id: 3,
    payroll: mockPayrollRecords[2],
    reminder_type: 'payment_due',
    sent_to_user_id: 1,
    sent_to: mockUsers[0],
    sent_at: '2024-03-04T08:00:00Z',
    message: 'Payroll payment for John Doe is due tomorrow. Amount: 575,000 UGX',
    is_read: false,
    created_at: '2024-03-04T08:00:00Z'
  }
];

// Current user context (simulated)
export const currentUser: User = mockUsers[0];
export const currentTenant: Tenant = mockTenants[0];
export const currentFarms: Farm[] = mockFarms.filter(f => f.tenant_id === currentTenant.tenant_id);
export const isOwner = currentUser.user_id === currentTenant.owner_user_id;

