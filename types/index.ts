// Core Types for ABAC and Permission Library System

export interface Permission {
  permission_id: number;
  name: string;
  display_name: string;
  description: string;
  category: 'animals' | 'activities' | 'reports' | 'management';
  action: string;
  resource_type: string;
  system_defined: boolean;
}

export interface RoleTemplate {
  template_id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
  permissions: Permission[];
}

export interface Role {
  role_id: number;
  tenant_id: number;
  template_id?: number;
  name: string;
  description: string;
  permissions: Permission[];
  policies?: Policy[];
  created_by_user_id?: number;
  created_at: string;
}

export interface Policy {
  policy_id: number;
  tenant_id: number;
  name: string;
  description: string;
  priority: number;
  rules: PolicyRules;
  created_at: string;
}

export interface PolicyRules {
  effect: 'allow' | 'deny';
  conditions?: PolicyCondition[];
  time_conditions?: TimeCondition[];
}

export interface PolicyCondition {
  attribute: string;
  operator: 'equals' | 'in' | 'not_in' | 'contains' | 'not_contains';
  value: string | string[];
}

export interface TimeCondition {
  attribute: 'environment.time' | 'environment.day_of_week' | 'environment.date';
  operator: 'between' | 'not_between' | 'equals' | 'in' | 'not_in' | 'after' | 'before';
  value: string | string[];
  timezone?: string;
}

export interface Tenant {
  tenant_id: number;
  organization_name: string;
  owner_user_id: number;
  subscription_plan_id?: number;
  created_at: string;
}

export interface Farm {
  farm_id: number;
  tenant_id: number;
  farm_name: string;
  location?: string;
  district?: string;
  coordinates?: { latitude: number; longitude: number };
  farm_type?: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  account_status: 'active' | 'pending_invitation' | 'suspended';
  is_super_admin?: boolean;
}

export interface UserRole {
  user_role_id: number;
  user_tenant_id: number;
  role_id: number;
  role: Role;
  assigned_at: string;
  assigned_by_user_id?: number;
}

export interface UserTenant {
  user_tenant_id: number;
  user_id: number;
  tenant_id: number;
  tenant: Tenant;
  assigned_by_user_id?: number;
  joined_at: string;
  status: 'active' | 'inactive';
}

export interface UserFarm {
  user_farm_id: number;
  user_id: number;
  farm_id: number;
  farm: Farm;
  tenant_id: number;
  role_id?: number;
  role?: Role;
  assigned_by_user_id?: number;
  assigned_at: string;
  status: 'active' | 'inactive';
}

export interface Delegation {
  delegation_id: number;
  tenant_id: number;
  delegator_user_id: number;
  delegator: User;
  delegate_user_id: number;
  delegate: User;
  delegation_type: 'permission' | 'role' | 'full_access';
  start_date: string;
  end_date: string;
  status: 'active' | 'revoked' | 'expired';
  description?: string;
  delegated_role_id?: number;
  delegated_role?: Role;
  delegated_permission_ids?: number[];
  delegated_permissions?: Permission[];
  restrictions?: {
    time_restriction?: { start: string; end: string };
    resource_restriction?: { animal_ids?: number[] };
    action_restriction?: string[];
  };
  created_at: string;
  revoked_at?: string;
}

export interface Invitation {
  invitation_id: number;
  user_id?: number;
  tenant_id: number;
  invitation_token: string;
  invited_by_user_id: number;
  invited_by: User;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  invitation_status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  sent_at: string;
  expires_at: string;
  accepted_at?: string;
}

export interface AuditLog {
  audit_id: number;
  user_id: number;
  user: User;
  tenant_id?: number;
  farm_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  policy_evaluation?: any;
  details: any;
  ip_address?: string;
  delegation_id?: number;
  delegated_from_user_id?: number;
  logged_at: string;
}

export interface UserPermissions {
  roles: Role[];
  combined_permissions: Permission[];
  is_owner: boolean;
  active_delegations: Delegation[];
}

// Livestock Management Types
export interface Animal {
  animal_id: number;
  farm_id: number;
  tenant_id: number;
  tag_number: string;
  animal_type: 'cattle' | 'goat' | 'sheep' | 'pig' | 'chicken' | 'duck' | 'other';
  breed?: string;
  gender: 'male' | 'female';
  birth_date?: string;
  purchase_date?: string;
  purchase_price?: number;
  status: 'active' | 'sold' | 'deceased' | 'disposed';
  health_status?: 'healthy' | 'sick' | 'recovering' | 'quarantine';
  mother_animal_id?: number;
  father_animal_id?: number;
  // Castration fields
  is_castrated?: boolean;
  castration_date?: string;
  castration_method?: 'surgical' | 'banding' | 'chemical' | 'other';
  castration_notes?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  activity_id: number;
  farm_id: number;
  tenant_id: number;
  activity_type: 'feeding' | 'breeding' | 'health_check' | 'vaccination' | 'castration' | 'general' | 'other';
  animal_id?: number;
  animal?: Animal;
  description: string;
  activity_date: string;
  performed_by_user_id: number;
  performed_by?: User;
  cost?: number;
  notes?: string;
  // Metadata for activity-specific fields (e.g., castration details)
  metadata?: {
    castration_method?: 'surgical' | 'banding' | 'chemical' | 'other';
    veterinarian_name?: string;
    post_care_instructions?: string;
    complications?: string;
    recovery_status?: 'normal' | 'complications' | 'monitoring';
    [key: string]: any;
  };
  created_at: string;
}

export interface AnimalSale {
  sale_id: number;
  tenant_id: number;
  farm_id: number;
  animal_id: number;
  animal?: Animal;
  sale_date: string;
  sale_type: 'direct' | 'auction' | 'contract';
  customer_name?: string;
  customer_contact?: string;
  sale_price: number;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  created_by_user_id: number;
  created_at: string;
}

export interface ProductSale {
  product_sale_id: number;
  tenant_id: number;
  farm_id: number;
  product_type: 'milk' | 'eggs' | 'wool' | 'honey' | 'meat' | 'other';
  animal_id?: number;
  quantity: number;
  unit: 'liters' | 'kg' | 'pieces' | 'dozen';
  unit_price: number;
  total_amount: number;
  sale_date: string;
  customer_name?: string;
  customer_contact?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  created_by_user_id: number;
  created_at: string;
}

export interface Production {
  production_id: number;
  tenant_id: number;
  farm_id: number;
  production_type: 'milk' | 'eggs' | 'wool' | 'honey';
  animal_id?: number;
  animal_group_id?: number;
  production_date: string;
  quantity: number;
  unit: 'liters' | 'kg' | 'pieces' | 'dozen';
  quality_notes?: string;
  recorded_by_user_id: number;
  created_at: string;
}

export interface Expense {
  expense_id: number;
  tenant_id: number;
  farm_id: number;
  expense_type: 'feed' | 'medicine' | 'labor' | 'equipment' | 'utilities' | 'transport' | 'animal_hire' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  vendor?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  receipt_url?: string;
  // Link to external animal hire agreement if this expense is from hiring external animals
  external_animal_hire_agreement_id?: number;
  created_by_user_id: number;
  created_at: string;
}

// Tax Management Types (Uganda-Specific - URA Compliant)
export interface TaxRate {
  tax_rate_id: number;
  tenant_id: number | null; // null = system-wide (super admin only)
  tax_name: string;
  tax_code: string; // e.g., "VAT-UG-18"
  tax_type: 'vat' | 'income_tax' | 'sales_tax' | 'withholding_tax' | 'custom';
  rate_percentage: number; // e.g., 18.00 for 18%
  applies_to: 'all_revenue' | 'animal_sales' | 'product_sales' | 'services' | 'custom';
  calculation_method: 'inclusive' | 'exclusive';
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  is_system_default: boolean;
  ura_tax_category?: string;
  description?: string;
  created_by_user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TaxCalculation {
  tax_calculation_id: number;
  tenant_id: number;
  farm_id?: number;
  source_type: 'animal_sale' | 'product_sale' | 'service_revenue' | 'other_revenue';
  source_id: number; // ID of the source transaction
  tax_rate_id?: number;
  tax_rate?: TaxRate;
  revenue_amount: number;
  tax_amount: number;
  total_amount: number;
  calculation_method: 'inclusive' | 'exclusive';
  tax_rate_percentage: number; // Rate at time of calculation
  transaction_date: string;
  notes?: string;
  calculated_by_user_id?: number;
  calculated_at: string;
}

export interface TaxRecord {
  tax_record_id: number;
  tenant_id: number;
  farm_id?: number;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  tax_rate_id: number;
  tax_rate?: TaxRate;
  total_revenue: number;
  total_tax: number;
  transaction_count: number;
  farm_breakdown?: Record<string, any>;
  status: 'draft' | 'finalized' | 'filed';
  filed_at?: string;
  filed_by_user_id?: number;
  filing_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxConfiguration {
  config_id: number;
  tenant_id: number;
  default_tax_rate_id?: number;
  default_tax_rate?: TaxRate;
  auto_calculate_tax: boolean;
  auto_apply_to_animal_sales: boolean;
  auto_apply_to_product_sales: boolean;
  tax_year_start_month: number; // 7 for July (Uganda fiscal year)
  reporting_currency: string; // 'UGX'
  require_tax_id: boolean; // TIN required
  tax_id_label: string; // 'TIN'
  ura_vat_registered: boolean;
  ura_vat_number?: string;
  ura_tin?: string;
  vat_registration_threshold: number; // UGX 150,000,000
  notify_on_tax_due: boolean;
  tax_due_reminder_days: number;
  updated_by_user_id?: number;
  updated_at: string;
}

// Inventory Management Types
export interface InventoryItem {
  item_id: number;
  tenant_id: number;
  farm_id: number;
  item_name: string;
  item_code?: string; // SKU or barcode
  category: 'feed' | 'medication' | 'equipment' | 'tools' | 'supplies' | 'bedding' | 'other';
  subcategory?: string; // e.g., "grain", "hay", "vaccine", "antibiotic"
  description?: string;
  unit: string; // e.g., "kg", "liters", "pieces", "bags"
  current_stock: number;
  reorder_point: number; // Minimum stock level before reordering
  reorder_quantity?: number; // Suggested quantity to order
  unit_cost?: number; // Cost per unit
  total_value?: number; // current_stock * unit_cost
  supplier?: string;
  supplier_contact?: string;
  location?: string; // Warehouse/storage location
  expiry_date?: string; // For medications, feed with expiry
  batch_number?: string; // For tracking batches
  status: 'active' | 'low_stock' | 'out_of_stock' | 'expired' | 'discontinued';
  notes?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  movement_id: number;
  item_id: number;
  tenant_id: number;
  farm_id: number;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit: string;
  unit_cost?: number;
  total_cost?: number;
  reason?: string; // e.g., "purchase", "usage", "damaged", "expired"
  reference_number?: string; // Invoice, receipt, or other reference
  related_activity_id?: number; // Link to activity if movement is from farm activity
  notes?: string;
  created_by_user_id: number;
  created_at: string;
}

// External Farm and Animal Types (Phase 7)
export interface ExternalFarm {
  external_farm_id: number;
  tenant_id: number;
  farm_name: string;
  owner_name?: string;
  contact_person?: string;
  phone: string;
  email?: string;
  location?: string;
  district?: string;
  coordinates?: { latitude: number; longitude: number };
  farm_type?: string;
  specialties?: string[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExternalAnimal {
  external_animal_id: number;
  external_farm_id: number;
  external_farm?: ExternalFarm;
  tag_number?: string;
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

// Enhanced Breeding Record (Phase 2 + Phase 7 Integration)
export interface BreedingRecord {
  breeding_id: number;
  tenant_id: number;
  farm_id: number;
  animal_id: number; // Female (your animal)
  // Sire information - internal or external
  sire_id?: number; // Male from your own farm (if internal)
  external_animal_id?: number; // External animal ID (if from external farm)
  sire_source: 'internal' | 'external'; // Track source
  // For external animals - quick reference fields
  external_farm_name?: string;
  external_animal_tag?: string;
  // Link to hire agreements
  animal_hire_agreement_id?: number; // If your animal was hired out
  external_animal_hire_agreement_id?: number; // If you hired external animal
  
  // Breeding details
  breeding_date: string;
  breeding_method?: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  
  // Phase 2: Enhanced pregnancy tracking
  conception_date?: string;
  expected_due_date?: string; // Preferred over expected_delivery_date
  actual_birth_date?: string; // Preferred over actual_delivery_date
  birth_outcome?: 'successful' | 'stillborn' | 'aborted' | 'complications';
  offspring_count?: number;
  offspring_ids?: number[];
  complications?: string;
  pregnancy_status?: 'suspected' | 'confirmed' | 'completed' | 'failed';
  
  // Legacy fields for backward compatibility
  expected_delivery_date?: string; // Deprecated - use expected_due_date
  actual_delivery_date?: string; // Deprecated - use actual_birth_date
  status?: 'planned' | 'in_progress' | 'successful' | 'failed'; // Deprecated - use pregnancy_status
  
  notes?: string;
  recorded_by_user_id: number;
  created_at: string;
  updated_at?: string;
}

