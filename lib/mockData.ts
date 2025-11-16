// Mock Data for Prototype
import { Permission, RoleTemplate, Role, Tenant, Farm, User, Delegation, Invitation, AuditLog, Animal, AnimalSale, ProductSale, Production, Expense, Activity } from '@/types';

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

// Current user context (simulated)
export const currentUser: User = mockUsers[0];
export const currentTenant: Tenant = mockTenants[0];
export const currentFarms: Farm[] = mockFarms.filter(f => f.tenant_id === currentTenant.tenant_id);
export const isOwner = currentUser.user_id === currentTenant.owner_user_id;

