'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Shield, 
  FileText, 
  Users, 
  UserPlus, 
  Link2, 
  FileSearch,
  LogOut,
  X,
  Beef,
  DollarSign,
  TrendingDown,
  Building2,
  Settings,
  Database,
  Globe,
  Stethoscope,
  Pill,
  Activity,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Handshake,
  Bell,
  Calendar,
  BarChart3,
  PackageSearch,
  Package,
  Plus,
  ExternalLink,
  Receipt,
  Percent,
  Calculator,
  FileCheck,
  type LucideIcon
} from 'lucide-react';
import { getCurrentUser, hasAnyPermission } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface SidebarProps {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    is_owner: boolean;
  };
  onClose?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permissions: string[];
}

interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}


export default function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Determine if user is a Helper (has Helper role but not owner/super admin)
  const isHelper = currentUser && !currentUser.is_owner && !currentUser.is_super_admin && 
    (currentUser.roles?.some(r => r.name === 'Helper') || 
     currentUser.roles?.some(r => r.name?.toLowerCase() === 'helper'));

  useEffect(() => {
    // Initialize component state on mount
    const user = getCurrentUser();
    setCurrentUser(user);
    setMounted(true);
    
    // Auto-expand sections that contain the current page
    const autoExpandSections = new Set<string>();
    
    // Check if user is helper (need to check again in effect)
    const userIsHelper = user && !user.is_owner && !user.is_super_admin && 
      (user.roles?.some(r => r.name === 'Helper') || 
       user.roles?.some(r => r.name?.toLowerCase() === 'helper'));
    
    if (user?.is_super_admin) {
      if (pathname?.startsWith('/dashboard/admin/overview') || pathname?.startsWith('/dashboard/admin/tenants') || pathname?.startsWith('/dashboard/admin/subscriptions')) {
        autoExpandSections.add('tenant-management');
      }
      if (pathname?.startsWith('/dashboard/admin/animals') || pathname?.startsWith('/dashboard/admin/farms') || pathname?.startsWith('/dashboard/admin/users') || pathname?.startsWith('/dashboard/admin/sales') || pathname?.startsWith('/dashboard/admin/expenses') || pathname?.startsWith('/dashboard/admin/tax') || pathname?.startsWith('/dashboard/admin/delegations') || pathname?.startsWith('/dashboard/admin/audit-logs')) {
        autoExpandSections.add('data-management');
      }
      if (pathname?.startsWith('/dashboard/admin/search') || pathname?.startsWith('/dashboard/admin/system-settings') || pathname?.startsWith('/dashboard/admin/database')) {
        autoExpandSections.add('system-tools');
      }
    }
    
    if (user?.is_owner) {
      if (pathname?.startsWith('/dashboard/animals') || pathname?.startsWith('/dashboard/farms')) {
        autoExpandSections.add('farm-operations');
      }
      if (pathname?.startsWith('/dashboard/helper/pregnancy') || pathname?.startsWith('/dashboard/breeding/record') || pathname?.startsWith('/dashboard/breeding/internal') || pathname?.startsWith('/dashboard/breeding/external')) {
        autoExpandSections.add('breeding-operations');
      }
      if (pathname?.startsWith('/dashboard/breeding/external-farms') || pathname?.startsWith('/dashboard/breeding/external-animals') || pathname?.startsWith('/dashboard/breeding/hire-agreements')) {
        autoExpandSections.add('partnerships');
      }
      if (pathname?.startsWith('/dashboard/breeding/analytics') || pathname?.startsWith('/dashboard/analytics/birth-rates')) {
        autoExpandSections.add('analytics');
      }
      if (pathname?.startsWith('/dashboard/sales') || pathname?.startsWith('/dashboard/expenses') || pathname?.startsWith('/dashboard/tax')) {
        autoExpandSections.add('financial');
      }
      if (pathname?.startsWith('/dashboard/vet/')) {
        autoExpandSections.add('veterinary');
      }
      if (pathname?.startsWith('/dashboard/permissions') || pathname?.startsWith('/dashboard/role-templates') || pathname?.startsWith('/dashboard/roles') || pathname?.startsWith('/dashboard/policies')) {
        autoExpandSections.add('access-control');
      }
      if (pathname?.startsWith('/dashboard/users') || pathname?.startsWith('/dashboard/delegations')) {
        autoExpandSections.add('user-management');
      }
      if (pathname?.startsWith('/dashboard/audit-logs')) {
        autoExpandSections.add('system');
      }
    }
    
    // Auto-expand helper sections
    if (userIsHelper) {
      if (pathname?.startsWith('/dashboard/helper/animals') || pathname?.startsWith('/dashboard/helper/farms') || pathname?.startsWith('/dashboard/inventory/supplies') || pathname?.startsWith('/dashboard/helper/production') || pathname?.startsWith('/dashboard/helper/weaning') || pathname?.startsWith('/dashboard/helper/animal-types')) {
        autoExpandSections.add('helper-farm-operations');
      }
      if (pathname?.startsWith('/dashboard/helper/pregnancy') || pathname?.startsWith('/dashboard/breeding/record') || pathname?.startsWith('/dashboard/breeding/internal') || pathname?.startsWith('/dashboard/breeding/external')) {
        autoExpandSections.add('helper-breeding-operations');
      }
      if (pathname?.startsWith('/dashboard/breeding/external-farms') || pathname?.startsWith('/dashboard/breeding/external-animals') || pathname?.startsWith('/dashboard/breeding/hire-agreements')) {
        autoExpandSections.add('helper-partnerships');
      }
      if (pathname?.startsWith('/dashboard/breeding/analytics') || pathname?.startsWith('/dashboard/analytics/birth-rates')) {
        autoExpandSections.add('helper-analytics');
      }
      if (pathname?.startsWith('/dashboard/helper/sales')) {
        autoExpandSections.add('helper-sales');
      }
    }
    
    if (autoExpandSections.size > 0) {
      setExpandedSections(autoExpandSections);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!mounted) return null;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Helper sections (grouped like AWS) - for helpers/workers
  const helperSections: NavSection[] = isHelper ? [
    {
      id: 'helper-farm-operations',
      label: 'Farm Operations',
      icon: Building2,
      items: [
    { href: '/dashboard/helper/animals', label: 'Animal Records', icon: Beef, permissions: ['view_animals'] },
    { href: '/dashboard/helper/farms', label: 'Farm Management', icon: Building2, permissions: ['view_animals'] },
    { href: '/dashboard/inventory/supplies', label: 'Supplies & Equipment', icon: Package, permissions: ['view_animals'] },
    { href: '/dashboard/helper/production', label: 'Production', icon: Activity, permissions: ['create_general'] },
    { href: '/dashboard/helper/weaning', label: 'Weaning Data', icon: Activity, permissions: ['create_general'] },
    { href: '/dashboard/helper/animal-types', label: 'Animal Types', icon: Beef, permissions: ['view_animals'] },
      ]
    },
    {
      id: 'helper-breeding-operations',
      label: 'Breeding Operations',
      icon: Heart,
      items: [
        { href: '/dashboard/helper/pregnancy', label: 'Overview (Dashboard)', icon: Heart, permissions: ['view_animals', 'create_breeding'] },
        { href: '/dashboard/breeding/record', label: 'Record Breeding', icon: Plus, permissions: ['create_breeding'] },
        { href: '/dashboard/breeding/internal', label: 'Internal Breeding', icon: Heart, permissions: ['view_animals'] },
        { href: '/dashboard/breeding/external', label: 'External Breeding', icon: ExternalLink, permissions: ['view_animals'] },
      ]
    },
    {
      id: 'helper-partnerships',
      label: 'External Partnerships',
      icon: Handshake,
      items: [
        { href: '/dashboard/breeding/external-farms', label: 'External Farms', icon: MapPin, permissions: ['view_animals'] },
        { href: '/dashboard/breeding/external-animals', label: 'External Animals', icon: Beef, permissions: ['view_animals'] },
        { href: '/dashboard/breeding/hire-agreements', label: 'Hire Agreements', icon: Handshake, permissions: ['view_animals'] },
      ]
    },
    {
      id: 'helper-analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      items: [
        { href: '/dashboard/breeding/analytics', label: 'Breeding Analytics', icon: BarChart3, permissions: ['view_operational_reports'] },
        { href: '/dashboard/analytics/birth-rates', label: 'Birth Rates', icon: Activity, permissions: ['view_operational_reports'] },
      ]
    },
    {
      id: 'helper-sales',
      label: 'Sales Management',
      icon: DollarSign,
      items: [
        { href: '/dashboard/helper/sales', label: 'Sales Management', icon: DollarSign, permissions: ['view_financial_reports'] },
      ]
    },
  ] : [];

  // Owner sections (grouped like AWS) - only shown to owners
  const ownerSections: NavSection[] = currentUser?.is_owner ? [
    {
      id: 'farm-operations',
      label: 'Farm Operations',
      icon: Building2,
      items: [
        { href: '/dashboard/animals', label: 'Animals', icon: Beef, permissions: ['view_animals'] },
        { href: '/dashboard/farms', label: 'Farms', icon: Building2, permissions: ['manage_users'] },
        { href: '/dashboard/inventory', label: 'Animal Inventory', icon: PackageSearch, permissions: ['view_animals'] },
        { href: '/dashboard/inventory/supplies', label: 'Supplies & Equipment', icon: Package, permissions: ['view_animals'] },
        { href: '/dashboard/alerts', label: 'Alerts', icon: Bell, permissions: ['view_animals'] },
        { href: '/dashboard/schedules', label: 'Worker Schedules', icon: Calendar, permissions: ['manage_users'] },
      ]
    },
    {
      id: 'breeding-operations',
      label: 'Breeding Operations',
      icon: Heart,
      items: [
        { href: '/dashboard/helper/pregnancy', label: 'Overview (Dashboard)', icon: Heart, permissions: ['view_animals'] },
        { href: '/dashboard/breeding/record', label: 'Record Breeding', icon: Plus, permissions: ['create_breeding'] },
        { href: '/dashboard/breeding/internal', label: 'Internal Breeding', icon: Heart, permissions: ['view_animals'] },
        { href: '/dashboard/breeding/external', label: 'External Breeding', icon: ExternalLink, permissions: ['view_animals'] },
      ]
    },
    {
      id: 'partnerships',
      label: 'External Partnerships',
      icon: Handshake,
      items: [
        { href: '/dashboard/breeding/external-farms', label: 'External Farms', icon: MapPin, permissions: ['view_animals'] },
        { href: '/dashboard/breeding/external-animals', label: 'External Animals', icon: Beef, permissions: ['view_animals'] },
        { href: '/dashboard/breeding/hire-agreements', label: 'Hire Agreements', icon: Handshake, permissions: ['view_animals'] },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      items: [
        { href: '/dashboard/breeding/analytics', label: 'Breeding Analytics', icon: BarChart3, permissions: ['view_operational_reports'] },
        { href: '/dashboard/analytics/birth-rates', label: 'Birth Rates', icon: Activity, permissions: ['view_operational_reports'] },
      ]
    },
    {
      id: 'financial',
      label: 'Financial Management',
      icon: DollarSign,
      items: [
        { href: '/dashboard/sales', label: 'Sales', icon: DollarSign, permissions: ['view_financial_reports'] },
        { href: '/dashboard/expenses', label: 'Expenses', icon: TrendingDown, permissions: ['view_financial_reports'] },
        { href: '/dashboard/tax', label: 'Tax Management', icon: Receipt, permissions: ['view_financial_reports'] },
        { href: '/dashboard/tax/rates', label: 'Tax Rates', icon: Percent, permissions: ['manage_roles'] },
        { href: '/dashboard/tax/records', label: 'Tax Records', icon: FileCheck, permissions: ['view_financial_reports'] },
        { href: '/dashboard/tax/config', label: 'Tax Configuration', icon: Calculator, permissions: ['manage_roles'] },
      ]
    },
    {
      id: 'veterinary',
      label: 'Veterinary',
      icon: Stethoscope,
      items: [
        { href: '/dashboard/vet/animal-tracking', label: 'Animal Tracking', icon: Activity, permissions: ['edit_health', 'create_health_check'] },
        { href: '/dashboard/vet/medications', label: 'Medications', icon: Pill, permissions: ['edit_health'] },
        { href: '/dashboard/vet/medical-expenses', label: 'Medical Expenses', icon: DollarSign, permissions: ['edit_health'] },
      ]
    },
    {
      id: 'access-control',
      label: 'Access Control',
      icon: Shield,
      items: [
        { href: '/dashboard/permissions', label: 'Permission Library', icon: Shield, permissions: ['manage_roles'] },
        { href: '/dashboard/role-templates', label: 'Role Templates', icon: FileText, permissions: ['manage_roles'] },
        { href: '/dashboard/roles', label: 'Custom Roles', icon: Users, permissions: ['manage_roles'] },
        { href: '/dashboard/policies', label: 'ABAC Policies', icon: Shield, permissions: ['manage_roles'] },
      ]
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: UserPlus,
      items: [
        { href: '/dashboard/users', label: 'Users & Invitations', icon: UserPlus, permissions: ['manage_users'] },
        { href: '/dashboard/delegations', label: 'Delegations', icon: Link2, permissions: ['manage_users'] },
      ]
    },
    {
      id: 'hr-management',
      label: 'Human Resources',
      icon: Users,
      items: [
        { href: '/dashboard/hr', label: 'HR Dashboard', icon: Users, permissions: ['manage_users'] },
        { href: '/dashboard/hr/employees', label: 'Employees', icon: Users, permissions: ['manage_users'] },
        { href: '/dashboard/hr/payroll', label: 'Payroll', icon: DollarSign, permissions: ['manage_users'] },
        { href: '/dashboard/hr/leave', label: 'Leave Management', icon: Calendar, permissions: ['manage_users'] },
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
      items: [
        { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileSearch, permissions: ['view_audit_logs'] },
      ]
    },
  ] : [];

  // Define all navigation items (flat list, no sections) - for non-owners
  // Regular tenant pages (hidden for super admins - they have their own "All X" versions)
  const regularNavItems: NavItem[] = [
    // Core Operations
    { href: '/dashboard/animals', label: 'Animals', icon: Beef, permissions: ['view_animals'] },
    { href: '/dashboard/inventory/supplies', label: 'Supplies & Equipment', icon: Package, permissions: ['view_animals'] },
    // Breeding Operations
    { href: '/dashboard/helper/pregnancy', label: 'Overview (Dashboard)', icon: Heart, permissions: ['view_animals'] },
    { href: '/dashboard/breeding/record', label: 'Record Breeding', icon: Plus, permissions: ['create_breeding'] },
    { href: '/dashboard/breeding/internal', label: 'Internal Breeding', icon: Heart, permissions: ['view_animals'] },
    { href: '/dashboard/breeding/external', label: 'External Breeding', icon: ExternalLink, permissions: ['view_animals'] },
    // External Partnerships
    { href: '/dashboard/breeding/external-farms', label: 'External Farms', icon: MapPin, permissions: ['view_animals'] },
    { href: '/dashboard/breeding/external-animals', label: 'External Animals', icon: Beef, permissions: ['view_animals'] },
    { href: '/dashboard/breeding/hire-agreements', label: 'Hire Agreements', icon: Handshake, permissions: ['view_animals'] },
    // Financial
    { href: '/dashboard/sales', label: 'Sales', icon: DollarSign, permissions: ['view_financial_reports'] },
    { href: '/dashboard/expenses', label: 'Expenses', icon: TrendingDown, permissions: ['view_financial_reports'] },
    { href: '/dashboard/tax', label: 'Tax Management', icon: Receipt, permissions: ['view_financial_reports'] },
    // Analytics & Reports
    { href: '/dashboard/breeding/analytics', label: 'Breeding Analytics', icon: BarChart3, permissions: ['view_operational_reports'] },
    { href: '/dashboard/analytics/birth-rates', label: 'Birth Rates', icon: Activity, permissions: ['view_operational_reports'] },
    // Veterinary
    { href: '/dashboard/vet/animal-tracking', label: 'Animal Tracking', icon: Activity, permissions: ['edit_health', 'create_health_check'] },
    { href: '/dashboard/vet/medications', label: 'Medications', icon: Pill, permissions: ['edit_health'] },
    { href: '/dashboard/vet/medical-expenses', label: 'Medical Expenses', icon: DollarSign, permissions: ['edit_health'] },
    // Access Control
    { href: '/dashboard/permissions', label: 'Permission Library', icon: Shield, permissions: ['manage_roles'] },
    { href: '/dashboard/role-templates', label: 'Role Templates', icon: FileText, permissions: ['manage_roles'] },
    { href: '/dashboard/roles', label: 'Custom Roles', icon: Users, permissions: ['manage_roles'] },
    { href: '/dashboard/policies', label: 'ABAC Policies', icon: Shield, permissions: ['manage_roles'] },
    // User Management
    { href: '/dashboard/users', label: 'Users & Invitations', icon: UserPlus, permissions: ['manage_users'] },
    { href: '/dashboard/farms', label: 'Farms', icon: Building2, permissions: ['manage_users'] },
    { href: '/dashboard/delegations', label: 'Delegations', icon: Link2, permissions: ['manage_users'] },
    // System
    { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileSearch, permissions: ['view_audit_logs'] },
  ];

  // Super Admin sections (grouped like AWS)
  const superAdminSections: NavSection[] = currentUser?.is_super_admin ? [
    {
      id: 'tenant-management',
      label: 'Tenant Management',
      icon: Globe,
      items: [
        { href: '/dashboard/admin/overview', label: 'Overview', icon: LayoutDashboard, permissions: ['super_admin'] },
        { href: '/dashboard/admin/tenants', label: 'All Tenants', icon: Globe, permissions: ['super_admin'] },
        { href: '/dashboard/admin/subscriptions', label: 'Subscriptions', icon: DollarSign, permissions: ['super_admin'] },
      ]
    },
    {
      id: 'data-management',
      label: 'Data Management',
      icon: Database,
      items: [
        { href: '/dashboard/admin/animals', label: 'All Animals', icon: Beef, permissions: ['super_admin'] },
        { href: '/dashboard/admin/farms', label: 'All Farms', icon: Building2, permissions: ['super_admin'] },
        { href: '/dashboard/admin/users', label: 'All Users', icon: Users, permissions: ['super_admin'] },
        { href: '/dashboard/admin/sales', label: 'All Sales', icon: DollarSign, permissions: ['super_admin'] },
        { href: '/dashboard/admin/expenses', label: 'All Expenses', icon: TrendingDown, permissions: ['super_admin'] },
        { href: '/dashboard/admin/tax', label: 'All Tax Records', icon: Receipt, permissions: ['super_admin'] },
        { href: '/dashboard/admin/tax/rates', label: 'System Tax Rates', icon: Percent, permissions: ['super_admin'] },
        { href: '/dashboard/admin/delegations', label: 'All Delegations', icon: Link2, permissions: ['super_admin'] },
        { href: '/dashboard/admin/audit-logs', label: 'All Audit Logs', icon: FileSearch, permissions: ['super_admin'] },
      ]
    },
    {
      id: 'system-tools',
      label: 'System Tools',
      icon: Settings,
      items: [
        { href: '/dashboard/admin/search', label: 'System Search', icon: FileSearch, permissions: ['super_admin'] },
        { href: '/dashboard/admin/system-settings', label: 'System Settings', icon: Settings, permissions: ['super_admin'] },
        { href: '/dashboard/admin/database', label: 'Database Management', icon: Database, permissions: ['super_admin'] },
      ]
    },
  ] : [];

  // Combine navigation items - super admins, owners, and helpers use sections, others see regular pages
  const allNavItems: NavItem[] = (currentUser?.is_super_admin || currentUser?.is_owner || isHelper)
    ? [] // Super admins, owners, and helpers use sections instead
    : [...regularNavItems];

  // Filter items based on user permissions (only for regular nav items)
  const filteredItems = allNavItems.filter(item => {
    // If no permissions required, show to everyone
    if (item.permissions.length === 0) return true;
    
        // Super admins and owners see everything
        if (currentUser?.is_super_admin || currentUser?.is_owner) return true;
    
    // Check if user has any of the required permissions
    return hasAnyPermission(currentUser, item.permissions);
  });

  return (
    <div className="h-full w-64 bg-white border-r-2 border-gray-200 shadow-xl flex flex-col">
      {/* Logo - Hidden on mobile (shows in top nav) */}
      <div className="hidden lg:flex h-16 border-b-2 border-gray-200 bg-gradient-to-r from-emerald-50 to-white items-center px-6">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-600 flex items-center gap-2 hover:text-emerald-700 transition-colors transform hover:scale-105">
          <Beef className="h-6 w-6" />
          <span>role</span>
        </Link>
      </div>

      {/* Mobile Header with Close Button */}
      <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b-2 border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-2">
          <Beef className="h-5 w-5 text-emerald-600" />
          <span className="text-lg font-bold text-emerald-600">role</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* User Info on Mobile */}
      <div className="lg:hidden px-4 py-4 border-b-2 border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg flex items-center justify-center ring-2 ring-emerald-200">
            <span className="text-white font-bold text-base">
              {user.first_name[0]}{user.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
            {currentUser && (
              <p className="text-xs font-semibold text-emerald-600 truncate mt-0.5">
                {currentUser.is_super_admin
                  ? 'Super Admin'
                  : currentUser.is_owner 
                    ? 'Owner' 
                    : currentUser.roles && currentUser.roles.length > 0
                      ? currentUser.roles.map(r => r.name).join(', ')
                      : 'No Role'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 bg-white">
        <div className="px-3 space-y-1">
          {/* Dashboard - Visible to all except super admins */}
          {!currentUser?.is_super_admin && (
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 mb-2 ${
                pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700'
              }`}
            >
              <LayoutDashboard className={`mr-3 h-5 w-5 flex-shrink-0 ${pathname === '/dashboard' ? 'text-white' : 'text-gray-500'}`} />
              <span className="truncate">Dashboard</span>
            </Link>
          )}

          {/* Super Admin Sections (Collapsible) */}
          {currentUser?.is_super_admin && superAdminSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const hasActiveItem = section.items.some(item => 
              pathname === item.href || pathname?.startsWith(item.href + '/')
            );

            return (
              <div key={section.id} className="mb-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    hasActiveItem
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-gray-200 pl-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700'
                          }`}
                        >
                          <item.icon className={`mr-2.5 h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Helper Sections (Collapsible) */}
          {isHelper && helperSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const hasActiveItem = section.items.some(item => 
              pathname === item.href || pathname?.startsWith(item.href + '/')
            );

            return (
              <div key={section.id} className="mb-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    hasActiveItem
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-gray-200 pl-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700'
                          }`}
                        >
                          <item.icon className={`mr-2.5 h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Owner Sections (Collapsible) */}
          {currentUser?.is_owner && ownerSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const hasActiveItem = section.items.some(item => 
              pathname === item.href || pathname?.startsWith(item.href + '/')
            );

            return (
              <div key={section.id} className="mb-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    hasActiveItem
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-gray-200 pl-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700'
                          }`}
                        >
                          <item.icon className={`mr-2.5 h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Regular Navigation Items - Flat List (for non-super admins and non-owners) */}
          {!currentUser?.is_super_admin && !currentUser?.is_owner && filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 mb-1 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t-2 border-gray-200 p-4 bg-gradient-to-br from-white to-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
        >
          <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}
