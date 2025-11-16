'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import { 
  Activity, 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Server,
  Database,
  Globe
} from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { 
  mockTenants, 
  mockUsers, 
  mockFarms, 
  mockAnimals, 
  mockTenantSubscriptions, 
  mockSubscriptionPlans,
  mockAuditLogs
} from '@/lib/mockData';

export default function SuperAdminOverviewPage() {
  const currentUser = getCurrentUser();

  // Check if user is super admin
  if (!currentUser || !currentUser.is_super_admin) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Super Admin access required.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  // Calculate system-wide metrics
  const totalTenants = mockTenants.length;
  const activeTenants = mockTenantSubscriptions.filter(s => s.status === 'active').length;
  const totalUsers = mockUsers.length;
  const totalFarms = mockFarms.length;
  const totalAnimals = mockAnimals.length;
  const monthlyRevenue = mockTenantSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const plan = mockSubscriptionPlans.find(p => p.plan_id === s.plan_id);
      return sum + (plan?.price || 0);
    }, 0);
  const overduePayments = mockTenantSubscriptions.filter(s => s.payment_status === 'overdue').length;
  const recentActivity = mockAuditLogs.slice(0, 10);

  const stats = [
    {
      name: 'Total Tenants',
      value: totalTenants,
      icon: Globe,
      color: '#16a34a',
      link: '/dashboard/admin/tenants'
    },
    {
      name: 'Active Tenants',
      value: activeTenants,
      icon: CheckCircle,
      color: '#16a34a',
      link: '/dashboard/admin/tenants'
    },
    {
      name: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: '#059669',
      link: '/dashboard/admin/search'
    },
    {
      name: 'Total Farms',
      value: totalFarms,
      icon: Building2,
      color: '#047857',
      link: '/dashboard/admin/search'
    },
    {
      name: 'Total Animals',
      value: totalAnimals,
      icon: Activity,
      color: '#065f46',
      link: '/dashboard/admin/search'
    },
    {
      name: 'Monthly Revenue',
      value: `UGX ${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#16a34a',
      link: '/dashboard/admin/subscriptions'
    },
    {
      name: 'Overdue Payments',
      value: overduePayments,
      icon: AlertCircle,
      color: '#dc2626',
      link: '/dashboard/admin/subscriptions'
    },
    {
      name: 'System Health',
      value: '98.5%',
      icon: Server,
      color: '#16a34a',
      link: '/dashboard/admin/database'
    },
  ];

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto', p: 4 }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <Server size={32} color="white" strokeWidth={2} />
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  fontWeight="500"
                  sx={{
                    color: 'white',
                    mb: 0.5,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  System Overview
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Monitor system-wide metrics, tenant activity, and platform health
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Box sx={{ 
          mb: 4, 
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)', 
            lg: 'repeat(4, 1fr)'
          },
          gap: 3,
          boxSizing: 'border-box'
        }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Box key={stat.name} sx={{ width: '100%', minHeight: '180px' }}>
                <Box
                  component={Link}
                  href={stat.link}
                  sx={{ 
                    display: 'block',
                    height: '100%',
                    textDecoration: 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.2s ease'
                    }
                  }}
                >
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
                    background: 'white',
                    border: '1px solid',
                    borderColor: alpha(stat.color, 0.2),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(22, 163, 74, 0.2)',
                      borderColor: stat.color
                    }
                  }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: 2, 
                          background: alpha(stat.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={24} color={stat.color} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4" fontWeight="700" sx={{ color: stat.color }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {stat.name}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Recent System Activity */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Activity size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                Recent System Activity
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity.map((log) => (
                    <TableRow key={log.audit_id} hover>
                      <TableCell>
                        {new Date(log.logged_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {log.user?.first_name} {log.user?.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.user?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action.replace('_', ' ')}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {log.entity_type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {mockTenants.find(t => t.tenant_id === log.tenant_id)?.organization_name || 'System'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Tenant Overview Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Globe size={24} color="#16a34a" />
                <Typography variant="h5" fontWeight="700">
                  Tenant Overview
                </Typography>
              </Box>
              <Button
                variant="outlined"
                component={Link}
                href="/dashboard/admin/tenants"
                sx={{
                  borderColor: 'success.main',
                  color: 'success.main',
                  '&:hover': {
                    borderColor: 'success.dark',
                    background: alpha('#16a34a', 0.05)
                  }
                }}
              >
                View All Tenants
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subscription</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Users</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Farms</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Animals</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockTenants.slice(0, 5).map((tenant) => {
                    const subscription = mockTenantSubscriptions.find(s => s.tenant_id === tenant.tenant_id);
                    const plan = subscription ? mockSubscriptionPlans.find(p => p.plan_id === subscription.plan_id) : null;
                    const tenantFarms = mockFarms.filter(f => f.tenant_id === tenant.tenant_id);
                    const tenantAnimals = mockAnimals.filter(a => a.tenant_id === tenant.tenant_id);
                    
                    return (
                      <TableRow key={tenant.tenant_id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600">
                            {tenant.organization_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {plan ? (
                            <Chip
                              label={plan.name}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">No Plan</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription?.status || 'inactive'}
                            size="small"
                            color={subscription?.status === 'active' ? 'success' : 'error'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{mockUsers.length}</TableCell>
                        <TableCell>{tenantFarms.length}</TableCell>
                        <TableCell>{tenantAnimals.length}</TableCell>
                        <TableCell>
                          {new Date(tenant.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}



