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
  expense_type: 'feed' | 'medicine' | 'labor' | 'equipment' | 'utilities' | 'transport' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  vendor?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  receipt_url?: string;
  created_by_user_id: number;
  created_at: string;
}

