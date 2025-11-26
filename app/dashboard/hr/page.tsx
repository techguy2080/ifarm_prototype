'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  alpha
} from '@mui/material';
import { Users, DollarSign, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockEmployees, mockPayrollRecords, mockLeaveRequests, mockPayrollReminders, mockFarms } from '@/lib/mockData';
import type { Employee, Payroll, LeaveRequest } from '@/types';

export default function HRManagementPage() {
  const [filterFarm, setFilterFarm] = useState<number | 'all'>('all');
  const currentUser = getCurrentUser();

  // Check permissions
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'manage_users'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  // Calculate HR summary
  const hrSummary = useMemo(() => {
    const employees = filterFarm === 'all' 
      ? mockEmployees 
      : mockEmployees.filter(e => e.farm_id === filterFarm);

    const activeEmployees = employees.filter(e => e.is_active);
    const payrollRecords = filterFarm === 'all'
      ? mockPayrollRecords
      : mockPayrollRecords.filter(p => p.farm_id === filterFarm);

    const leaveRequests = filterFarm === 'all'
      ? mockLeaveRequests
      : mockLeaveRequests.filter(l => l.farm_id === filterFarm);

    const pendingPayroll = payrollRecords.filter(p => p.payment_status === 'pending');
    const totalPayrollThisMonth = payrollRecords
      .filter(p => {
        const payDate = new Date(p.pay_date);
        const now = new Date();
        return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.net_pay, 0);

    const pendingLeave = leaveRequests.filter(l => l.status === 'pending');
    const upcomingLeave = leaveRequests.filter(l => {
      const startDate = new Date(l.start_date);
      const now = new Date();
      const daysDiff = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return l.status === 'approved' && daysDiff >= 0 && daysDiff <= 7;
    });

    const reminders = mockPayrollReminders.filter(r => !r.is_read);

    return {
      totalEmployees: activeEmployees.length,
      pendingPayroll: pendingPayroll.length,
      totalPayrollThisMonth,
      pendingLeave: pendingLeave.length,
      upcomingLeave: upcomingLeave.length,
      reminders: reminders.length
    };
  }, [filterFarm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardContainer>
      <Box sx={{ p: 4 }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
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
                  <Users size={32} color="white" strokeWidth={2} />
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
                    Human Resources
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Manage employees, payroll, and leave
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
              background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.01)',
                boxShadow: '0 8px 30px rgba(5, 150, 105, 0.25)'
              }
            }}>
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mb: 0.5 }}>
                      Active Employees
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {hrSummary.totalEmployees}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users className="h-6 w-6 text-white" />
                  </Box>
                </Box>
                <Button
                  component={Link}
                  href="/dashboard/hr/employees"
                  variant="text"
                  endIcon={<ArrowRight />}
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)' 
                    }
                  }}
                >
                  View All Employees
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
              background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.01)',
                boxShadow: '0 8px 30px rgba(5, 150, 105, 0.25)'
              }
            }}>
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mb: 0.5 }}>
                      This Month Payroll
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {formatCurrency(hrSummary.totalPayrollThisMonth)}
                    </Typography>
                    {hrSummary.pendingPayroll > 0 && (
                      <Chip 
                        label={`${hrSummary.pendingPayroll} Pending`} 
                        size="small" 
                        sx={{ 
                          mt: 1, 
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    )}
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DollarSign className="h-6 w-6 text-white" />
                  </Box>
                </Box>
                <Button
                  component={Link}
                  href="/dashboard/hr/payroll"
                  variant="text"
                  endIcon={<ArrowRight />}
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)' 
                    }
                  }}
                >
                  Manage Payroll
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
              background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.01)',
                boxShadow: '0 8px 30px rgba(5, 150, 105, 0.25)'
              }
            }}>
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mb: 0.5 }}>
                      Leave Requests
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {hrSummary.pendingLeave}
                    </Typography>
                    {hrSummary.upcomingLeave > 0 && (
                      <Chip 
                        label={`${hrSummary.upcomingLeave} Upcoming`} 
                        size="small" 
                        sx={{ 
                          mt: 1, 
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    )}
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar className="h-6 w-6 text-white" />
                  </Box>
                </Box>
                <Button
                  component={Link}
                  href="/dashboard/hr/leave"
                  variant="text"
                  endIcon={<ArrowRight />}
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)' 
                    }
                  }}
                >
                  View Leave Calendar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  href="/dashboard/hr/employees"
                  variant="outlined"
                  fullWidth
                  startIcon={<Users />}
                  sx={{ 
                    py: 1.5,
                    borderColor: '#10b981',
                    color: '#047857',
                    '&:hover': {
                      borderColor: '#059669',
                      background: alpha('#10b981', 0.1)
                    }
                  }}
                >
                  Employees
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  href="/dashboard/hr/payroll"
                  variant="outlined"
                  fullWidth
                  startIcon={<DollarSign />}
                  sx={{ 
                    py: 1.5,
                    borderColor: '#10b981',
                    color: '#047857',
                    '&:hover': {
                      borderColor: '#059669',
                      background: alpha('#10b981', 0.1)
                    }
                  }}
                >
                  Payroll
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  href="/dashboard/hr/leave"
                  variant="outlined"
                  fullWidth
                  startIcon={<Calendar />}
                  sx={{ 
                    py: 1.5,
                    borderColor: '#10b981',
                    color: '#047857',
                    '&:hover': {
                      borderColor: '#059669',
                      background: alpha('#10b981', 0.1)
                    }
                  }}
                >
                  Leave Management
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {hrSummary.reminders > 0 && (
                  <Button
                    component={Link}
                    href="/dashboard/hr/payroll"
                    variant="contained"
                    fullWidth
                    startIcon={<AlertCircle />}
                    sx={{ 
                      py: 1.5,
                      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)'
                      }
                    }}
                  >
                    {hrSummary.reminders} Reminders
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}


