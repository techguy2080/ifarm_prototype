/**
 * Role-Based UI Components
 * Conditional rendering components based on user roles and permissions
 */

'use client';

import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { roleFeatures, UserRole, getUserPrimaryRole } from '@/lib/roleUtils';

interface RoleBasedComponentProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredFeature?: keyof typeof roleFeatures;
  fallback?: React.ReactNode;
}

/**
 * Conditionally render children based on user role or feature access
 * 
 * Usage:
 * <RoleBasedComponent requiredRole="owner">
 *   <Button>Delete Animal</Button>
 * </RoleBasedComponent>
 * 
 * <RoleBasedComponent requiredFeature="canEditHealth">
 *   <Button>Update Health Status</Button>
 * </RoleBasedComponent>
 */
export function RoleBasedComponent({ 
  children, 
  requiredRole, 
  requiredFeature, 
  fallback = null 
}: RoleBasedComponentProps) {
  const currentUser = getCurrentUser();
  const userRole = getUserPrimaryRole(currentUser);
  
  // Check role-based access
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!userRole || !roles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }
  
  // Check feature-based access
  if (requiredFeature) {
    const featureCheck = roleFeatures[requiredFeature];
    if (!featureCheck || !featureCheck(currentUser)) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
}

interface OwnerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render only for farm owners
 */
export function OwnerOnly({ children, fallback = null }: OwnerOnlyProps) {
  return (
    <RoleBasedComponent requiredRole="owner" fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

/**
 * Render only for super admins
 */
export function SuperAdminOnly({ children, fallback = null }: OwnerOnlyProps) {
  return (
    <RoleBasedComponent requiredRole="super_admin" fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

/**
 * Render only for veterinarians
 */
export function VetOnly({ children, fallback = null }: OwnerOnlyProps) {
  return (
    <RoleBasedComponent requiredRole={['veterinarian', 'vet_tech']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

/**
 * Render only for managers
 */
export function ManagerOnly({ children, fallback = null }: OwnerOnlyProps) {
  return (
    <RoleBasedComponent requiredRole={['owner', 'farm_manager']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

/**
 * Render for anyone who can manage animals
 */
export function AnimalManagement({ children, fallback = null }: OwnerOnlyProps) {
  return (
    <RoleBasedComponent requiredFeature="canEditAnimals" fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

/**
 * Render for anyone who can view financials
 */
export function FinancialAccess({ children, fallback = null }: OwnerOnlyProps) {
  return (
    <RoleBasedComponent requiredFeature="canViewFinancials" fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

interface ConditionalButtonProps {
  requiredFeature: keyof typeof roleFeatures;
  children: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
  [key: string]: any;
}

/**
 * Button that is disabled if user doesn't have required feature access
 * 
 * Usage:
 * <ConditionalButton requiredFeature="canDeleteAnimals" onClick={handleDelete}>
 *   Delete Animal
 * </ConditionalButton>
 */
export function ConditionalButton({ 
  requiredFeature, 
  children, 
  disabled = false,
  tooltip,
  ...props 
}: ConditionalButtonProps) {
  const currentUser = getCurrentUser();
  const hasAccess = roleFeatures[requiredFeature]?.(currentUser) ?? false;
  
  return (
    <button
      {...props}
      disabled={disabled || !hasAccess}
      title={!hasAccess ? (tooltip || 'You do not have permission for this action') : undefined}
      style={{
        ...props.style,
        opacity: !hasAccess ? 0.5 : 1,
        cursor: !hasAccess ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Hook to check feature access
 * Provides comprehensive access checks based on ROLE_FUNCTIONALITIES.md
 */
export function useRoleAccess() {
  const currentUser = getCurrentUser();
  const userRole = getUserPrimaryRole(currentUser);
  
  return {
    user: currentUser,
    role: userRole,
    // Animal Management
    canViewAnimals: roleFeatures.canViewAnimals(currentUser),
    canCreateAnimals: roleFeatures.canCreateAnimals(currentUser),
    canEditAnimals: roleFeatures.canEditAnimals(currentUser),
    canDeleteAnimals: roleFeatures.canDeleteAnimals(currentUser),
    
    // Health Management
    canEditHealth: roleFeatures.canEditHealth(currentUser),
    canLogHealthCheck: roleFeatures.canLogHealthCheck(currentUser),
    canRecordVaccination: roleFeatures.canRecordVaccination(currentUser),
    canRecordDeworming: roleFeatures.canRecordDeworming(currentUser),
    canRecordTreatment: roleFeatures.canRecordTreatment(currentUser),
    canRecordMedication: roleFeatures.canRecordMedication(currentUser),
    
    // Activity Logging
    canLogFeeding: roleFeatures.canLogFeeding(currentUser),
    canLogBreeding: roleFeatures.canLogBreeding(currentUser),
    canLogGeneralActivity: roleFeatures.canLogGeneralActivity(currentUser),
    canLogCastration: roleFeatures.canLogCastration(currentUser),
    canScheduleCastration: roleFeatures.canScheduleCastration(currentUser),
    
    // Production Management
    canLogProduction: roleFeatures.canLogProduction(currentUser),
    canViewProduction: roleFeatures.canViewProduction(currentUser),
    
    // Breeding Management
    canViewBreeding: roleFeatures.canViewBreeding(currentUser),
    canManageBreeding: roleFeatures.canManageBreeding(currentUser),
    canViewLineage: roleFeatures.canViewLineage(currentUser),
    canManageWeaning: roleFeatures.canManageWeaning(currentUser),
    
    // Financial Management
    canViewFinancials: roleFeatures.canViewFinancials(currentUser),
    canManageFinancials: roleFeatures.canManageFinancials(currentUser),
    canViewSales: roleFeatures.canViewSales(currentUser),
    canRecordSales: roleFeatures.canRecordSales(currentUser),
    canViewExpenses: roleFeatures.canViewExpenses(currentUser),
    canRecordExpenses: roleFeatures.canRecordExpenses(currentUser),
    canViewSubscriptions: roleFeatures.canViewSubscriptions(currentUser),
    
    // Farm Management
    canManageFarms: roleFeatures.canManageFarms(currentUser),
    canViewFarms: roleFeatures.canViewFarms(currentUser),
    
    // User & Access Management
    canManageUsers: roleFeatures.canManageUsers(currentUser),
    canManageRoles: roleFeatures.canManageRoles(currentUser),
    canViewAuditLogs: roleFeatures.canViewAuditLogs(currentUser),
    
    // Task Management
    canCreateTasks: roleFeatures.canCreateTasks(currentUser),
    canAssignTasks: roleFeatures.canAssignTasks(currentUser),
    
    // Reports & Analytics
    canViewHealthReports: roleFeatures.canViewHealthReports(currentUser),
    canViewOperationalReports: roleFeatures.canViewOperationalReports(currentUser),
    canViewAnalytics: roleFeatures.canViewAnalytics(currentUser),
    canViewBirthRateAnalytics: roleFeatures.canViewBirthRateAnalytics(currentUser),
    canViewInventoryReports: roleFeatures.canViewInventoryReports(currentUser),
    canViewCastrationReports: roleFeatures.canViewCastrationReports(currentUser),
    
    // Super Admin Features
    isSuperAdmin: roleFeatures.isSuperAdmin(currentUser),
    canViewAllTenants: roleFeatures.canViewAllTenants(currentUser),
    canViewAllAnimals: roleFeatures.canViewAllAnimals(currentUser),
    canViewAllFarms: roleFeatures.canViewAllFarms(currentUser),
    canViewAllUsers: roleFeatures.canViewAllUsers(currentUser),
    canViewAllSales: roleFeatures.canViewAllSales(currentUser),
    canViewAllExpenses: roleFeatures.canViewAllExpenses(currentUser),
    canViewAllAuditLogs: roleFeatures.canViewAllAuditLogs(currentUser),
  };
}

