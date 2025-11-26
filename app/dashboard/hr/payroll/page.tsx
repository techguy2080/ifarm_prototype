'use client';

import { useState, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  alpha,
  Tabs,
  Tab
} from '@mui/material';
import { DollarSign, Plus, Search, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockPayrollRecords, mockEmployees, mockPayrollReminders } from '@/lib/mockData';
import type { Payroll } from '@/types';

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

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredPayroll = useMemo(() => {
    return mockPayrollRecords.filter(p => {
      const employeeName = `${p.employee?.user?.first_name || ''} ${p.employee?.user?.last_name || ''}`.toLowerCase();
      return employeeName.includes(searchTerm.toLowerCase()) ||
             p.employee?.employee_number.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  const pendingPayroll = filteredPayroll.filter(p => p.payment_status === 'pending');
  const paidPayroll = filteredPayroll.filter(p => p.payment_status === 'paid');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={18} />;
      case 'pending':
        return <Clock size={18} />;
      case 'processing':
        return <Clock size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: alpha('#10b981', 0.2), color: '#047857' };
      case 'pending':
        return { bg: alpha('#f59e0b', 0.2), color: '#d97706' };
      case 'processing':
        return { bg: alpha('#3b82f6', 0.2), color: '#2563eb' };
      default:
        return { bg: alpha('#ef4444', 0.2), color: '#dc2626' };
    }
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
                  <DollarSign size={32} color="white" strokeWidth={2} />
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
                    Payroll Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Process and track employee payments
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus />}
                size="large"
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Process Payroll
              </Button>
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
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Total Payroll Records
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {filteredPayroll.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Pending Payments
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {pendingPayroll.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Paid This Month
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {formatCurrency(paidPayroll.reduce((sum, p) => sum + p.net_pay, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Reminders Alert */}
        {mockPayrollReminders.filter(r => !r.is_read).length > 0 && (
          <Card sx={{ mb: 3, borderRadius: 3, background: alpha('#fef3c7', 0.5), border: '1px solid #fbbf24' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <AlertCircle size={24} color="#f59e0b" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {mockPayrollReminders.filter(r => !r.is_read).length} Payment Reminder(s)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    You have payroll payments due soon
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={`All (${filteredPayroll.length})`} />
              <Tab label={`Pending (${pendingPayroll.length})`} />
              <Tab label={`Paid (${paidPayroll.length})`} />
            </Tabs>
          </Box>

          {/* Search */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder="Search by employee name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TabPanel value={activeTab} index={0}>
            <PayrollTable payroll={filteredPayroll} formatCurrency={formatCurrency} formatDate={formatDate} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <PayrollTable payroll={pendingPayroll} formatCurrency={formatCurrency} formatDate={formatDate} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <PayrollTable payroll={paidPayroll} formatCurrency={formatCurrency} formatDate={formatDate} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
          </TabPanel>
        </Card>
      </Box>
    </DashboardContainer>
  );
}

function PayrollTable({ payroll, formatCurrency, formatDate, getStatusIcon, getStatusColor }: {
  payroll: Payroll[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => { bg: string; color: string };
}) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ background: alpha('#10b981', 0.1) }}>
            <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Pay Period</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Pay Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Gross Pay</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Deductions</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Net Pay</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payroll.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No payroll records found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            payroll.map((record) => {
              const statusColors = getStatusColor(record.payment_status);
              return (
                <TableRow key={record.payroll_id} hover>
                  <TableCell>
                    {record.employee?.user?.first_name} {record.employee?.user?.last_name}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {record.employee?.employee_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDate(record.pay_period_start)} - {formatDate(record.pay_period_end)}
                  </TableCell>
                  <TableCell>{formatDate(record.pay_date)}</TableCell>
                  <TableCell>{formatCurrency(record.gross_pay)}</TableCell>
                  <TableCell>{formatCurrency(record.deductions)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {formatCurrency(record.net_pay)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={record.payment_method.replace('_', ' ')} 
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(record.payment_status)}
                      label={record.payment_status} 
                      size="small"
                      sx={{
                        background: statusColors.bg,
                        color: statusColors.color,
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

