// Page to permission mapping for route protection
// Each page requires at least one of the listed permissions (OR logic)

export const pagePermissions: Record<string, string[]> = {
  // Dashboard pages
  '/dashboard': [], // Everyone can access dashboard
  '/dashboard/animals': ['view_animals'],
  '/dashboard/sales': ['view_financial_reports'], // Sales require financial reports permission
  '/dashboard/expenses': ['view_financial_reports'], // Expenses require financial reports permission
  
  // Permission management pages
  '/dashboard/permissions': ['manage_roles'], // View permission library
  '/dashboard/role-templates': ['manage_roles'], // View role templates
  '/dashboard/roles': ['manage_roles'], // Manage custom roles
  '/dashboard/policies': ['manage_roles'], // Manage ABAC policies
  '/dashboard/users': ['manage_users'], // Manage users and invitations
  '/dashboard/delegations': ['manage_users'], // Manage delegations
  '/dashboard/farms': ['manage_users'], // Manage farms (requires user management)
  '/dashboard/audit-logs': ['view_audit_logs'], // View audit logs
  
  // Create/Edit pages inherit from parent
  '/dashboard/roles/create': ['manage_roles'],
  '/dashboard/roles/edit': ['manage_roles'],
  '/dashboard/policies/create': ['manage_roles'],
  '/dashboard/policies/edit': ['manage_roles'],
  '/dashboard/users/invite': ['manage_users'],
  '/dashboard/delegations/create': ['manage_users'],
  
  // Veterinarian pages
  '/dashboard/vet/animal-tracking': ['edit_health', 'create_health_check'],
  '/dashboard/vet/medications': ['edit_health'],
  '/dashboard/vet/medical-expenses': ['edit_health'],
  
  // Helper pages
  '/dashboard/helper/animals': ['view_animals'],
  '/dashboard/helper/farms': ['view_animals'],
  '/dashboard/helper/production': ['create_general'],
  '/dashboard/helper/sales': ['view_financial_reports'],
  '/dashboard/helper/pregnancy': ['create_breeding'],
  '/dashboard/helper/weaning': ['create_general'],
  '/dashboard/helper/animal-types': ['view_animals'],
  
  // Super Admin pages
  '/dashboard/admin/overview': ['super_admin'],
  '/dashboard/admin/tenants': ['super_admin'],
  '/dashboard/admin/subscriptions': ['super_admin'],
  '/dashboard/admin/animals': ['super_admin'],
  '/dashboard/admin/farms': ['super_admin'],
  '/dashboard/admin/users': ['super_admin'],
  '/dashboard/admin/sales': ['super_admin'],
  '/dashboard/admin/expenses': ['super_admin'],
  '/dashboard/admin/delegations': ['super_admin'],
  '/dashboard/admin/audit-logs': ['super_admin'],
  '/dashboard/admin/search': ['super_admin'],
  '/dashboard/admin/system-settings': ['super_admin'],
  '/dashboard/admin/database': ['super_admin'],
};

// Get required permissions for a path
export function getRequiredPermissions(path: string): string[] {
  // Check exact match first
  if (pagePermissions[path]) {
    return pagePermissions[path];
  }
  
  // Check if path starts with any configured path
  for (const [configPath, permissions] of Object.entries(pagePermissions)) {
    if (path.startsWith(configPath)) {
      return permissions;
    }
  }
  
  // Default: no permissions required (public)
  return [];
}

// Check if path is accessible (no permissions required)
export function isPublicPath(path: string): boolean {
  const permissions = getRequiredPermissions(path);
  return permissions.length === 0;
}




