// Authentication utilities and demo credentials
import { mockRoles, mockPermissions } from './mockData';
import { Role, Permission } from '@/types';

export interface AuthUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  account_status: 'active';
  is_owner: boolean;
  is_super_admin?: boolean;
  tenant_id: number;
  roles?: Role[];
  permissions?: Permission[];
}

// User to role assignments (user_id -> role_id)
const userRoleAssignments: Record<number, number[]> = {
  1: [], // Owner has all permissions (no roles needed)
  2: [1], // Veterinarian role
  3: [2], // Helper role
  4: [3], // Super Admin role
};

export const demoUsers = [
  {
    email: 'owner@demo.com',
    password: 'demo123',
    user_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    is_owner: true,
    is_super_admin: false,
    tenant_id: 1,
  },
  {
    email: 'vet@demo.com',
    password: 'demo123',
    user_id: 2,
    first_name: 'Dr. Sarah',
    last_name: 'Smith',
    is_owner: false,
    is_super_admin: false,
    tenant_id: 1,
  },
  {
    email: 'worker@demo.com',
    password: 'demo123',
    user_id: 3,
    first_name: 'Mike',
    last_name: 'Johnson',
    is_owner: false,
    is_super_admin: false,
    tenant_id: 1,
  },
  {
    email: 'superadmin@demo.com',
    password: 'demo123',
    user_id: 4,
    first_name: 'Admin',
    last_name: 'System',
    is_owner: false,
    is_super_admin: true,
    tenant_id: 0, // System-wide access
  },
];

export function login(email: string, password: string): AuthUser | null {
  const user = demoUsers.find(u => u.email === email && u.password === password);
  if (!user) return null;
  
  // Get user's roles
  const roleIds = userRoleAssignments[user.user_id] || [];
  const roles = mockRoles.filter(r => roleIds.includes(r.role_id));
  
  // Get combined permissions from all roles
  const permissionSet = new Set<number>();
  roles.forEach(role => {
    role.permissions.forEach(perm => permissionSet.add(perm.permission_id));
  });
  const permissions = mockPermissions.filter(p => permissionSet.has(p.permission_id));
  
  return {
    user_id: user.user_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    account_status: 'active',
    is_owner: user.is_owner,
    is_super_admin: user.is_super_admin || false,
    tenant_id: user.tenant_id,
    roles,
    permissions,
  };
}

// Get current user from localStorage
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

// Check if user has a specific permission
export function hasPermission(user: AuthUser | null, permissionName: string): boolean {
  if (!user) return false;
  
  // Super admins and owners have all permissions
  if (user.is_super_admin || user.is_owner) return true;
  
  // Check if user has the permission
  return user.permissions?.some(p => p.name === permissionName) || false;
}

// Check if user has any of the specified permissions
export function hasAnyPermission(user: AuthUser | null, permissionNames: string[]): boolean {
  if (!user) return false;
  if (user.is_super_admin || user.is_owner) return true;
  return permissionNames.some(name => hasPermission(user, name));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(user: AuthUser | null, permissionNames: string[]): boolean {
  if (!user) return false;
  if (user.is_super_admin || user.is_owner) return true;
  return permissionNames.every(name => hasPermission(user, name));
}

