'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Shield, 
  FileText, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  LayoutDashboard,
  DollarSign,
  PiggyBank,
  TrendingDown,
  X,
  Stethoscope,
  Pill,
  Heart,
  Building2,
  Beef
} from 'lucide-react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  alpha,
  Alert,
  AlertTitle
} from '@mui/material';
import { mockUsers, mockRoles, mockAuditLogs, mockDelegations, mockInvitations, mockAnimals, mockAnimalSales, mockProductSales, mockExpenses, mockFarms, mockActivities } from '@/lib/mockData';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission, hasAnyPermission } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (searchParams?.get('error') === 'unauthorized') {
      setShowUnauthorized(true);
      // Clear the error from URL after showing
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  // Calculate business metrics
  const totalRevenue = mockAnimalSales.reduce((sum, s) => sum + s.sale_price, 0) +
    mockProductSales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalAnimals = mockAnimals.filter(a => a.status === 'active').length;
  const totalSales = mockAnimalSales.length + mockProductSales.length;

  // Veterinarian-specific metrics
  const animalsNeedingAttention = mockAnimals.filter(a => a.health_status === 'sick' || a.health_status === 'injured').length;
  const recentHealthChecks = 12; // Mock data - would come from activities
  const pendingVaccinations = 5; // Mock data
  const medicalExpenses = mockExpenses.filter(e => e.expense_type === 'medicine' || e.expense_type === 'veterinary').reduce((sum, e) => sum + e.amount, 0);

  // Helper-specific metrics
  const activeFarms = mockFarms.filter(f => f.status === 'active').length;
  const recentSales = mockAnimalSales.length + mockProductSales.length;
  const breedingActivities = mockActivities.filter(a => a.activity_type === 'breeding').length;
  const animalTypesCount = new Set(mockAnimals.map(a => a.animal_type)).size;

  // Helper function to check if user can see a stat
  const canViewStat = (stat: { permissions: string[]; roleSpecific?: string }) => {
    if (!currentUser) return false;
    if (currentUser.is_super_admin || currentUser.is_owner) return true;
    
    // Check role-specific stats
    if (stat.roleSpecific) {
      const userRole = currentUser.roles?.[0]?.name?.toLowerCase();
      if (stat.roleSpecific === 'veterinarian' && userRole !== 'veterinarian') return false;
      if (stat.roleSpecific === 'helper' && userRole !== 'helper') return false;
    }
    
    return hasAnyPermission(currentUser, stat.permissions);
  };

  // Build stats array based on user permissions
  const allStats = [
    {
      name: 'Total Animals',
      value: totalAnimals,
      icon: Activity,
      color: '#16a34a',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
      link: '/dashboard/animals',
      permissions: ['view_animals']
    },
    // Veterinarian-specific stats
    {
      name: 'Animals Needing Attention',
      value: animalsNeedingAttention,
      icon: AlertCircle,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      link: '/dashboard/vet/animal-tracking',
      permissions: ['edit_health', 'create_health_check'],
      roleSpecific: 'veterinarian'
    },
    {
      name: 'Pending Vaccinations',
      value: pendingVaccinations,
      icon: Heart,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      link: '/dashboard/vet/animal-tracking',
      permissions: ['create_health_check'],
      roleSpecific: 'veterinarian'
    },
    {
      name: 'Recent Health Checks',
      value: recentHealthChecks,
      icon: Stethoscope,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      link: '/dashboard/vet/animal-tracking',
      permissions: ['view_health_reports'],
      roleSpecific: 'veterinarian'
    },
    {
      name: 'Medical Expenses',
      value: `UGX ${medicalExpenses.toLocaleString()}`,
      icon: Pill,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      link: '/dashboard/vet/medical-expenses',
      permissions: ['edit_health'],
      roleSpecific: 'veterinarian'
    },
    {
      name: 'Total Revenue',
      value: `UGX ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
      link: '/dashboard/sales',
      permissions: ['view_financial_reports'] // Sales requires financial reports permission
    },
    {
      name: 'Total Expenses',
      value: `UGX ${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      link: '/dashboard/expenses',
      permissions: ['view_financial_reports'] // Expenses requires financial reports permission
    },
    {
      name: 'Net Profit',
      value: `UGX ${netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: netProfit >= 0 ? '#16a34a' : '#dc2626',
      gradient: netProfit >= 0 
        ? 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)'
        : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      link: '/dashboard/reports/financial',
      permissions: ['view_financial_reports'] // Financial reports require financial permission
    },
    {
      name: 'Total Sales',
      value: totalSales,
      icon: PiggyBank,
      color: '#84cc16',
      gradient: 'linear-gradient(135deg, #65a30d 0%, #a3e635 100%)',
      link: '/dashboard/sales',
      permissions: ['view_financial_reports'] // Sales requires financial permission
    },
    {
      name: 'Total Users',
      value: mockUsers.length,
      icon: Users,
      color: '#0f766e',
      gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
      link: '/dashboard/users',
      permissions: ['manage_users']
    },
    // Helper-specific stats
    {
      name: 'Active Farms',
      value: activeFarms,
      icon: Building2,
      color: '#16a34a',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
      link: '/dashboard/helper/farms',
      permissions: ['view_animals'],
      roleSpecific: 'helper'
    },
    {
      name: 'Recent Sales',
      value: recentSales,
      icon: DollarSign,
      color: '#84cc16',
      gradient: 'linear-gradient(135deg, #65a30d 0%, #a3e635 100%)',
      link: '/dashboard/helper/sales',
      permissions: ['view_financial_reports'],
      roleSpecific: 'helper'
    },
    {
      name: 'Breeding Records',
      value: breedingActivities,
      icon: Activity,
      color: '#e91e63',
      gradient: 'linear-gradient(135deg, #c2185b 0%, #e91e63 100%)',
      link: '/dashboard/helper/pregnancy',
      permissions: ['create_breeding'],
      roleSpecific: 'helper'
    },
    {
      name: 'Animal Types',
      value: animalTypesCount,
      icon: Beef,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      link: '/dashboard/helper/animal-types',
      permissions: ['view_animals'],
      roleSpecific: 'helper'
    },
  ];

  // Filter stats based on user permissions and role
  const stats = allStats.filter(stat => canViewStat(stat));

  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    if (!currentUser) return "Welcome back! Here's what's happening with your farm today.";
    if (currentUser.is_super_admin) return "Welcome back, Super Admin! System-wide administration dashboard.";
    if (currentUser.is_owner) return "Welcome back, Owner! Here's an overview of your entire farm operation.";
    if (currentUser.roles && currentUser.roles.length > 0) {
      const roleName = currentUser.roles[0].name;
      if (roleName === 'Veterinarian') {
        return "Welcome back, Dr. " + currentUser.first_name + "! Here's your animal health overview.";
      } else if (roleName === 'Helper') {
        return "Welcome back, " + currentUser.first_name + "! Here's what you can do today.";
      }
    }
    return "Welcome back! Here's what's happening with your farm today.";
  };

  const recentActivities = mockAuditLogs.slice(0, 5);

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Unauthorized Access Alert */}
      {showUnauthorized && (
        <Alert 
          severity="error" 
          onClose={() => setShowUnauthorized(false)}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.1)'
          }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>Access Denied</AlertTitle>
          You don't have permission to access that page. Please contact your administrator if you believe this is an error.
        </Alert>
      )}

      {/* Header Card */}
      <Card sx={{ 
        mb: 5, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: 2, 
              background: 'rgba(255, 255, 255, 0.2)', 
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}>
              <LayoutDashboard size={32} color="white" strokeWidth={2} />
            </Box>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{
                  color: 'white',
                  mb: 0.5,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)', 
                  fontWeight: 600,
                  letterSpacing: '0',
                  lineHeight: 1.5
                }}
              >
                {getWelcomeMessage()}
              </Typography>
            </Box>
          </Box>
          {/* Decorative elements */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }} 
          />
          <Box 
            sx={{ 
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} 
          />
        </CardContent>
      </Card>

      {/* Stats Grid with Beautiful Widget Cards */}
      <Box sx={{ 
        mb: 4, 
        width: '100%', 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)', 
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(3, 1fr)'
        },
        gap: 3,
        boxSizing: 'border-box'
      }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box key={stat.name} sx={{ width: '100%', minHeight: '200px' }}>
              <Box
                component={Link}
                href={stat.link}
                sx={{ 
                  textDecoration: 'none',
                  height: '100%',
                  minHeight: '200px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundImage: stat.gradient,
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 8px 32px ${alpha(stat.color, 0.25)}`,
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.01)',
                    boxShadow: `0 24px 48px ${alpha(stat.color, 0.35)}`,
                  }
                }}
              >
                <Box sx={{ p: 3, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Icon in top corner with glow effect */}
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <Icon size={28} color="white" strokeWidth={2.5} />
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 700,
                          mb: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                        {stat.name}
                      </Typography>
                    
                    <Typography 
                        variant="h3" 
                      component="div" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 900,
                          mb: 2,
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                          lineHeight: 1.2,
                          wordBreak: 'break-word'
                      }}
                    >
                        {stat.value}
                    </Typography>
                    </Box>

                    {/* View Details Button */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        width: 'fit-content',
                        transition: 'all 0.3s ease',
                        mt: 'auto',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        }
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}
                      >
                        View Details
                      </Typography>
                      <TrendingUp size={14} color="white" strokeWidth={3} />
                    </Box>
                  </Box>

                  {/* Decorative Elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      filter: 'blur(40px)',
                      pointerEvents: 'none',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -30,
                      left: -30,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      filter: 'blur(30px)',
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Quick Actions & Recent Activity */}
      <Box sx={{ mb: 4, width: '100%', maxWidth: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Quick Actions */}
        <Box>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                {/* Invite User - Only for users with manage_users permission */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'manage_users')) && (
                <Paper
                  component={Link}
                  href="/dashboard/users/invite"
                  elevation={0}
                  sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    textDecoration: 'none',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      border: '2px solid',
                      borderColor: 'success.main',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                        width: 48, 
                        height: 48 
                      }}>
                        <Users size={24} color="white" />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="700" color="text.primary">
                          Invite New User
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Send an invitation to join your organization
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowRight size={24} color="#16a34a" />
                  </Box>
                </Paper>
                )}

                {/* Create Custom Role - Only for users with manage_roles permission */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'manage_roles')) && (
                <Paper
                  component={Link}
                  href="/dashboard/roles/create"
                  elevation={0}
                  sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    textDecoration: 'none',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      border: '2px solid',
                      borderColor: 'success.main',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                        width: 48, 
                        height: 48 
                      }}>
                        <Shield size={24} color="white" />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="700" color="text.primary">
                          Create Custom Role
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Build a new role with custom permissions
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowRight size={24} color="#16a34a" />
                  </Box>
                </Paper>
                )}

                {/* Log Health Check - For Veterinarians */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'create_health_check')) && (
                  <Paper
                    component={Link}
                    href="/dashboard/animals"
                    elevation={0}
                    sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      textDecoration: 'none',
                      borderRadius: 2,
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        border: '2px solid',
                        borderColor: 'warning.main',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                          width: 48, 
                          height: 48 
                        }}>
                          <Activity size={24} color="white" />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="700" color="text.primary">
                            Log Health Check
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Record animal health status and vaccinations
                          </Typography>
                        </Box>
                      </Box>
                      <ArrowRight size={24} color="#d97706" />
                    </Box>
                  </Paper>
                )}

                {/* Log Feeding Activity - For Helpers */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'create_feeding')) && (
                  <Paper
                    component={Link}
                    href="/dashboard/animals"
                    elevation={0}
                    sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                      textDecoration: 'none',
                      borderRadius: 2,
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        border: '2px solid',
                        borderColor: 'info.main',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                          width: 48, 
                          height: 48 
                        }}>
                          <Activity size={24} color="white" />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="700" color="text.primary">
                            Log Feeding Activity
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Record daily feeding activities for animals
                          </Typography>
                        </Box>
                      </Box>
                      <ArrowRight size={24} color="#0284c7" />
                    </Box>
                  </Paper>
                )}

                {/* Record Breeding - For Helpers */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'create_breeding')) && (
                  <Paper
                    component={Link}
                    href="/dashboard/helper/pregnancy"
                    elevation={0}
                    sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                      textDecoration: 'none',
                      borderRadius: 2,
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        border: '2px solid',
                        borderColor: 'secondary.main',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #e91e63 0%, #ec4899 100%)',
                          width: 48, 
                          height: 48 
                        }}>
                          <Activity size={24} color="white" />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="700" color="text.primary">
                            Record Breeding
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Log breeding activities and track pregnancies
                          </Typography>
                        </Box>
                      </Box>
                      <ArrowRight size={24} color="#e91e63" />
                    </Box>
                  </Paper>
                )}

                {/* Add New Animal - For Helpers */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'create_animals')) && (
                  <Paper
                    component={Link}
                    href="/dashboard/helper/animals"
                    elevation={0}
                    sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                      textDecoration: 'none',
                      borderRadius: 2,
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        border: '2px solid',
                        borderColor: 'success.main',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                          width: 48, 
                          height: 48 
                        }}>
                          <Beef size={24} color="white" />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="700" color="text.primary">
                            Add New Animal
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Register a new animal in the system
                          </Typography>
                        </Box>
                      </Box>
                      <ArrowRight size={24} color="#16a34a" />
                    </Box>
                  </Paper>
                )}

                {/* Record Sale - For Helpers */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'view_financial_reports')) && (
                  <Paper
                    component={Link}
                    href="/dashboard/helper/sales"
                    elevation={0}
                    sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      textDecoration: 'none',
                      borderRadius: 2,
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        border: '2px solid',
                        borderColor: 'warning.main',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)',
                          width: 48, 
                          height: 48 
                        }}>
                          <DollarSign size={24} color="white" />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="700" color="text.primary">
                            Record Sale
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Log animal or product sales transactions
                          </Typography>
                        </Box>
                      </Box>
                      <ArrowRight size={24} color="#84cc16" />
                    </Box>
                  </Paper>
                )}

                {/* Create Delegation - Only for users with manage_users permission */}
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'manage_users')) && (
                <Paper
                  component={Link}
                  href="/dashboard/delegations/create"
                  elevation={0}
                  sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)',
                    textDecoration: 'none',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      border: '2px solid',
                      borderColor: 'success.main',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #65a30d 0%, #a3e635 100%)',
                        width: 48, 
                        height: 48 
                      }}>
                        <Activity size={24} color="white" />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="700" color="text.primary">
                          Create Delegation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Delegate permissions temporarily
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowRight size={24} color="#16a34a" />
                  </Box>
                </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="700">
                  Recent Activity
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard/audit-logs"
                  size="small"
                  endIcon={<ArrowRight size={16} />}
                  sx={{ fontWeight: 600, color: 'success.main' }}
                >
                  View All
                </Button>
              </Box>
              <Stack spacing={2}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((log, index) => (
                    <Paper
                      key={log.audit_id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          borderColor: 'success.main',
                          bgcolor: alpha('#16a34a', 0.02)
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                            bgcolor: log.action.includes('create') ? alpha('#16a34a', 0.1) : alpha('#059669', 0.1),
                            width: 40,
                            height: 40
                        }}
                      >
                        {log.action.includes('create') ? (
                            <CheckCircle size={20} color="#16a34a" />
                        ) : (
                            <AlertCircle size={20} color="#059669" />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="600">
                          {log.user.first_name} {log.user.last_name}
                        </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={12} color="#9ca3af" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.logged_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No recent activity
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* System Overview */}
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
        color: 'white',
        width: '100%',
        maxWidth: '100%'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
            System Overview
          </Typography>
          <Box sx={{ width: '100%', maxWidth: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Box>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 2
              }}>
                <Typography variant="h3" fontWeight="500" sx={{ color: 'white' }}>
                  {mockUsers.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.9)' }}>
                  Active Users
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 2
              }}>
                <Typography variant="h3" fontWeight="500" sx={{ color: 'white' }}>
                  {mockRoles.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.9)' }}>
                  Custom Roles
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 2
              }}>
                <Typography variant="h3" fontWeight="500" sx={{ color: 'white' }}>
                  {mockAuditLogs.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.9)' }}>
                  Total Audit Logs
                </Typography>
              </Paper>
            </Box>
          </Box>
        </CardContent>
      </Card>
      </Box>
    </DashboardContainer>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <DashboardContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </DashboardContainer>
    }>
      <DashboardContent />
    </Suspense>
  );
}
