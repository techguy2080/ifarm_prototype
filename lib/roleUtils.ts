/**
 * Role-Based Utility Functions
 * Provides helper functions for role-based UI rendering and feature access control
 * Based on ROLE_FUNCTIONALITIES.md specifications
 */

import { AuthUser, hasPermission, hasAnyPermission } from './auth';

/**
 * Role Types based on ROLE_FUNCTIONALITIES.md
 */
export type UserRole = 
  | 'owner' 
  | 'super_admin' 
  | 'veterinarian' 
  | 'farm_manager' 
  | 'field_worker' 
  | 'vet_tech' 
  | 'accountant';

/**
 * Get the primary role of a user
 */
export function getUserPrimaryRole(user: AuthUser | null): UserRole | null {
  if (!user) return null;
  
  if (user.is_super_admin) return 'super_admin';
  if (user.is_owner) return 'owner';
  
  // Check role based on permissions
  if (user.roles && user.roles.length > 0) {
    const roleName = user.roles[0].name.toLowerCase();
    
    if (roleName.includes('veterinarian') || roleName.includes('vet')) {
      return hasPermission(user, 'edit_health') ? 'veterinarian' : 'vet_tech';
    }
    
    if (roleName.includes('manager') || roleName.includes('helper')) {
      return hasAnyPermission(user, ['create_animals', 'edit_animals']) 
        ? 'farm_manager' 
        : 'field_worker';
    }
    
    if (roleName.includes('accountant')) {
      return 'accountant';
    }
  }
  
  // Default to field worker if only has basic permissions
  return 'field_worker';
}

/**
 * Role-based feature checks
 */
export const roleFeatures = {
  // Animal Management
  canViewAnimals: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_animals') || false;
  },
  
  canCreateAnimals: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_animals') || false;
  },
  
  canEditAnimals: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'edit_animals') || false;
  },
  
  canDeleteAnimals: (user: AuthUser | null): boolean => {
    return user?.is_owner || false; // Only owners can delete
  },
  
  // Health Management
  canEditHealth: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'edit_health') || false;
  },
  
  canLogHealthCheck: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_health_check') || false;
  },
  
  canRecordVaccination: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'edit_health') || hasPermission(user, 'create_health_check') || false;
  },
  
  canRecordDeworming: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'edit_health') || hasPermission(user, 'create_health_check') || false;
  },
  
  canRecordTreatment: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'edit_health') || false;
  },
  
  canRecordMedication: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'edit_health') || false;
  },
  
  // Activity Logging
  canLogFeeding: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_feeding') || hasPermission(user, 'create_general') || false;
  },
  
  canLogBreeding: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_breeding') || false;
  },
  
  canLogGeneralActivity: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_general') || false;
  },
  
  canLogCastration: (user: AuthUser | null): boolean => {
    // Owner, Manager, Vet, Vet Tech, and Workers can log castration
    return user?.is_owner || 
      hasPermission(user, 'edit_health') || 
      hasPermission(user, 'create_health_check') ||
      hasPermission(user, 'create_general') || 
      false;
  },
  
  canScheduleCastration: (user: AuthUser | null): boolean => {
    // Only Owner and Manager can schedule
    return user?.is_owner || hasPermission(user, 'create_animals') || false;
  },
  
  // Production Management
  canLogProduction: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_general') || false;
  },
  
  canViewProduction: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'view_operational_reports') || hasPermission(user, 'create_general') || false;
  },
  
  // Breeding Management
  canViewBreeding: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_breeding') || hasPermission(user, 'view_animals') || false;
  },
  
  canManageBreeding: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_breeding') || false;
  },
  
  canViewLineage: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'view_animals') || false;
  },
  
  canManageWeaning: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'create_general') || false;
  },
  
  // Financial Management
  canViewFinancials: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_financial_reports') || false;
  },
  
  canManageFinancials: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'view_financial_reports') || false;
  },
  
  canViewSales: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'view_financial_reports') || false;
  },
  
  canRecordSales: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'view_financial_reports') || false;
  },
  
  canViewExpenses: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'view_financial_reports') || false;
  },
  
  canRecordExpenses: (user: AuthUser | null): boolean => {
    return user?.is_owner || hasPermission(user, 'view_financial_reports') || false;
  },
  
  canViewSubscriptions: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || false;
  },
  
  // Farm Management
  canManageFarms: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || false;
  },
  
  canViewFarms: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_animals') || false;
  },
  
  // User & Access Management
  canManageUsers: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'manage_users') || false;
  },
  
  canManageRoles: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'manage_roles') || false;
  },
  
  canViewAuditLogs: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_audit_logs') || false;
  },
  
  // Reports & Analytics
  canViewHealthReports: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_health_reports') || false;
  },
  
  canViewOperationalReports: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_operational_reports') || false;
  },
  
  canViewAnalytics: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_operational_reports') || false;
  },
  
  canViewBirthRateAnalytics: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_operational_reports') || false;
  },
  
  canViewInventoryReports: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_operational_reports') || false;
  },
  
  canViewCastrationReports: (user: AuthUser | null): boolean => {
    return user?.is_owner || user?.is_super_admin || hasPermission(user, 'view_operational_reports') || false;
  },
  
  // Task Management
  canCreateTasks: (user: AuthUser | null): boolean => {
    // Owner and Manager can create tasks
    return user?.is_owner || hasPermission(user, 'create_general') || false;
  },
  
  canAssignTasks: (user: AuthUser | null): boolean => {
    // Owner and Manager can assign tasks
    return user?.is_owner || hasPermission(user, 'edit_activities') || false;
  },
  
  // Super Admin Features
  isSuperAdmin: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
  
  canViewAllTenants: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
  
  canViewAllAnimals: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
  
  canViewAllFarms: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
  
  canViewAllUsers: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
  
  canViewAllSales: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
  
  canViewAllExpenses: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
  
  canViewAllAuditLogs: (user: AuthUser | null): boolean => {
    return user?.is_super_admin || false;
  },
};

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    owner: 'Farm Owner',
    super_admin: 'Super Administrator',
    veterinarian: 'Veterinarian',
    farm_manager: 'Farm Manager',
    field_worker: 'Field Worker',
    vet_tech: 'Veterinary Technician',
    accountant: 'Accountant',
  };
  
  return roleNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    owner: 'Full control of farm operations within tenant organization',
    super_admin: 'Platform-wide system administrator across all tenants',
    veterinarian: 'Medical professional with specialized animal health access',
    farm_manager: 'Operational management with extensive permissions',
    field_worker: 'Basic operational tasks and daily activity logging',
    vet_tech: 'Veterinary support and medical assistance',
    accountant: 'Financial specialist with reporting access',
  };
  
  return descriptions[role];
}

/**
 * Get role-specific homepage
 */
export function getRoleHomepage(user: AuthUser | null): string {
  const role = getUserPrimaryRole(user);
  
  switch (role) {
    case 'super_admin':
      return '/dashboard/admin/overview';
    case 'owner':
      return '/dashboard';
    case 'veterinarian':
      return '/dashboard/vet/animal-tracking';
    case 'farm_manager':
      return '/dashboard/animals';
    case 'field_worker':
      return '/dashboard/schedules';
    case 'vet_tech':
      return '/dashboard/vet/animal-tracking';
    case 'accountant':
      return '/dashboard/sales';
    default:
      return '/dashboard';
  }
}

/**
 * Check if user can access a specific feature
 */
export function canAccessFeature(
  user: AuthUser | null,
  feature: keyof typeof roleFeatures
): boolean {
  const featureCheck = roleFeatures[feature];
  return featureCheck ? featureCheck(user) : false;
}

/**
 * Get accessible navigation items based on role
 */
export function getAccessibleNavItems(user: AuthUser | null) {
  if (!user) return [];
  
  const role = getUserPrimaryRole(user);
  
  const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['owner', 'super_admin', 'farm_manager', 'field_worker', 'veterinarian', 'vet_tech', 'accountant'] },
    { path: '/dashboard/animals', label: 'Animals', icon: 'Beef', roles: ['owner', 'farm_manager', 'field_worker', 'veterinarian', 'vet_tech'] },
    { path: '/dashboard/vet/animal-tracking', label: 'Animal Health', icon: 'Stethoscope', roles: ['owner', 'veterinarian', 'vet_tech'] },
    { path: '/dashboard/schedules', label: 'Daily Schedules', icon: 'Calendar', roles: ['owner', 'farm_manager', 'field_worker'] },
    { path: '/dashboard/alerts', label: 'Alerts', icon: 'Bell', roles: ['owner', 'farm_manager', 'field_worker', 'veterinarian'] },
    { path: '/dashboard/sales', label: 'Sales', icon: 'DollarSign', roles: ['owner', 'farm_manager', 'accountant'] },
    { path: '/dashboard/expenses', label: 'Expenses', icon: 'Receipt', roles: ['owner', 'farm_manager', 'accountant'] },
    { path: '/dashboard/analytics/birth-rates', label: 'Analytics', icon: 'TrendingUp', roles: ['owner', 'farm_manager'] },
    { path: '/dashboard/users', label: 'Users', icon: 'Users', roles: ['owner', 'super_admin'] },
    { path: '/dashboard/roles', label: 'Roles', icon: 'Shield', roles: ['owner', 'super_admin'] },
    { path: '/dashboard/audit-logs', label: 'Audit Logs', icon: 'FileText', roles: ['owner', 'super_admin'] },
    { path: '/dashboard/admin/overview', label: 'Admin Panel', icon: 'Settings', roles: ['super_admin'] },
  ];
  
  return allNavItems.filter(item => 
    role && item.roles.includes(role)
  );
}

