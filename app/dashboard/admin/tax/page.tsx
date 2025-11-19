'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
  Tabs,
  Tab,
  TextField,
  MenuItem
} from '@mui/material';
import { Receipt, Percent, Calculator, FileCheck, TrendingUp, DollarSign, Calendar, Filter, Users } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { 
  mockSuperAdminTaxCalculations, 
  mockSuperAdminTaxRecords, 
  mockTaxRates,
  mockTenants,
  mockTenantSubscriptions,
  mockSubscriptionPlans
} from '@/lib/mockData';
import type { TaxCalculation, TaxRecord } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SuperAdminTaxPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [filterTenant, setFilterTenant] = useState<number | 'all'>('all');
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

  // Calculate tax summary from subscription revenue
  const taxSummary = useMemo(() => {
    const calculations = filterTenant === 'all' 
      ? mockSuperAdminTaxCalculations 
      : mockSuperAdminTaxCalculations.filter(tc => {
          // Extract tenant ID from notes if available
          const tenantMatch = tc.notes?.match(/Tenant (\d+)/);
          return tenantMatch ? Number(tenantMatch[1]) === filterTenant : false;
        });

    const totalRevenue = calculations.reduce((sum, tc) => sum + tc.revenue_amount, 0);
    const totalTax = calculations.reduce((sum, tc) => sum + tc.tax_amount, 0);
    const totalAmount = calculations.reduce((sum, tc) => sum + tc.total_amount, 0);
    const transactionCount = calculations.length;

    // Current month summary
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthCalculations = calculations.filter(tc => {
      const date = new Date(tc.transaction_date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const currentMonthRevenue = currentMonthCalculations.reduce((sum, tc) => sum + tc.revenue_amount, 0);
    const currentMonthTax = currentMonthCalculations.reduce((sum, tc) => sum + tc.tax_amount, 0);

    // Current fiscal year (Uganda: July 1 to June 30)
    const now = new Date();
    const fiscalYearStart = new Date(now.getFullYear(), 6, 1); // July 1
    const fiscalYearEnd = new Date(now.getFullYear() + 1, 5, 30); // June 30
    if (now < fiscalYearStart) {
      fiscalYearStart.setFullYear(now.getFullYear() - 1);
      fiscalYearEnd.setFullYear(now.getFullYear());
    }
    const fiscalYearCalculations = calculations.filter(tc => {
      const date = new Date(tc.transaction_date);
      return date >= fiscalYearStart && date <= fiscalYearEnd;
    });
    const fiscalYearRevenue = fiscalYearCalculations.reduce((sum, tc) => sum + tc.revenue_amount, 0);
    const fiscalYearTax = fiscalYearCalculations.reduce((sum, tc) => sum + tc.tax_amount, 0);

    // Calculate total active subscriptions revenue
    const activeSubscriptions = mockTenantSubscriptions.filter(s => s.status === 'active');
    const totalSubscriptionRevenue = activeSubscriptions.reduce((sum, sub) => {
      const plan = mockSubscriptionPlans.find(p => p.plan_id === sub.plan_id);
      return sum + (plan?.price || 0);
    }, 0);

    return {
      totalRevenue,
      totalTax,
      totalAmount,
      transactionCount,
      currentMonthRevenue,
      currentMonthTax,
      fiscalYearRevenue,
      fiscalYearTax,
      totalSubscriptionRevenue
    };
  }, [filterTenant]);

  // Filter calculations
  const filteredCalculations = useMemo(() => {
    let filtered = mockSuperAdminTaxCalculations;
    
    if (filterTenant !== 'all') {
      filtered = filtered.filter(tc => {
        const tenantMatch = tc.notes?.match(/Tenant (\d+)/);
        return tenantMatch ? Number(tenantMatch[1]) === filterTenant : false;
      });
    }
    
    return filtered;
  }, [filterTenant]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return mockSuperAdminTaxRecords;
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'animal_sale': 'Animal Sale',
      'product_sale': 'Product Sale',
      'service_revenue': 'Subscription Revenue',
      'other_revenue': 'Other Revenue'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'default',
      'finalized': 'primary',
      'filed': 'success'
    };
    return colors[status] || 'default';
  };

  const getTenantFromNote = (notes?: string) => {
    if (!notes) return 'N/A';
    const match = notes.match(/Tenant (\d+)/);
    if (match) {
      const tenantId = Number(match[1]);
      const tenant = mockTenants.find(t => t.tenant_id === tenantId);
      return tenant?.organization_name || `Tenant ${tenantId}`;
    }
    return 'N/A';
  };

  return (
    <Box sx={{ 
      p: { xs: 3, sm: 4, md: 5 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      justifyContent: 'center',
      '& > *': {
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
      },
    }}>
      <Box sx={{ width: '100%', maxWidth: '1400px' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 2, 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Receipt className="h-7 w-7 text-white" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    System Tax Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Tax tracking on subscription revenue (Uganda Revenue Authority - URA Compliant)
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  href="/dashboard/admin/tax/rates"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  startIcon={<Percent className="h-4 w-4" />}
                >
                  System Tax Rates
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
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
                      Subscription Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {formatCurrency(taxSummary.totalSubscriptionRevenue)}
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
                    <DollarSign className="h-6 w-6 text-white" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.01)',
                boxShadow: '0 8px 30px rgba(220, 38, 38, 0.25)'
              }
            }}>
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mb: 0.5 }}>
                      Total Tax
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {formatCurrency(taxSummary.totalTax)}
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
                    <Receipt className="h-6 w-6 text-white" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15)',
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.01)',
                boxShadow: '0 8px 30px rgba(139, 92, 246, 0.25)'
              }
            }}>
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mb: 0.5 }}>
                      Fiscal Year Tax
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {formatCurrency(taxSummary.fiscalYearTax)}
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
                    <Calendar className="h-6 w-6 text-white" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.01)',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)'
              }
            }}>
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mb: 0.5 }}>
                      Transactions
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {taxSummary.transactionCount}
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
                    <TrendingUp className="h-6 w-6 text-white" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Filter className="h-5 w-5 text-gray-600" />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Filter by Tenant:
              </Typography>
              <Chip
                label="All Tenants"
                onClick={() => setFilterTenant('all')}
                color={filterTenant === 'all' ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
              {mockTenants.map(tenant => (
                <Chip
                  key={tenant.tenant_id}
                  label={tenant.organization_name}
                  onClick={() => setFilterTenant(tenant.tenant_id)}
                  color={filterTenant === tenant.tenant_id ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Tax Calculations" />
              <Tab label="Tax Records" />
            </Tabs>
          </Box>

          {/* Tax Calculations Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha('#047857', 0.1) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tenant</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tax Rate</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tax Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCalculations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No tax calculations found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCalculations.map((calc) => (
                        <TableRow key={calc.tax_calculation_id} hover>
                          <TableCell>{formatDate(calc.transaction_date)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getSourceTypeLabel(calc.source_type)} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Users className="h-4 w-4 text-gray-500" />
                              <Typography variant="body2">
                                {getTenantFromNote(calc.notes)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {formatCurrency(calc.revenue_amount)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${calc.tax_rate_percentage}%`} 
                              size="small" 
                              color="secondary"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                            {formatCurrency(calc.tax_amount)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {formatCurrency(calc.total_amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* Tax Records Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha('#047857', 0.1) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tax Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tax</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Transactions</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No tax records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.tax_record_id} hover>
                          <TableCell>
                            {formatDate(record.period_start)} - {formatDate(record.period_end)}
                            <Typography variant="caption" display="block" color="text.secondary">
                              {record.period_type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {record.tax_rate?.tax_name || 'N/A'}
                            <Typography variant="caption" display="block" color="text.secondary">
                              {record.tax_rate?.rate_percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {formatCurrency(record.total_revenue)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                            {formatCurrency(record.total_tax)}
                          </TableCell>
                          <TableCell>{record.transaction_count}</TableCell>
                          <TableCell>
                            <Chip 
                              label={record.status} 
                              size="small" 
                              color={getStatusColor(record.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<FileCheck className="h-4 w-4" />}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
        </Card>

        {/* URA Compliance Info */}
        <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                background: 'rgba(217, 119, 6, 0.2)', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Receipt className="h-5 w-5 text-amber-700" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  System-Wide Tax Management (Super Admin)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tax calculations are based on subscription revenue from all tenants. VAT rate: 18%, Fiscal Year: July 1 - June 30.
                  All subscription payments are subject to VAT as per Uganda Revenue Authority (URA) regulations.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}


