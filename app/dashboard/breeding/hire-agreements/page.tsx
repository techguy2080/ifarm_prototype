'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  alpha,
  Paper,
  Grid,
  Tabs,
  Tab,
  Alert as MuiAlert
} from '@mui/material';
import { Search, Plus, Eye, DollarSign, Calendar, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Hash, Beef, Building2, Target, Clock, CreditCard, Activity } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission, AuthUser } from '@/lib/auth';
import { mockAnimalHireAgreements, mockExternalAnimalHireAgreements, mockExternalFarms, mockAnimals, mockExternalAnimals, mockFarms } from '@/lib/mockData';
import { AnimalHireAgreement, ExternalAnimalHireAgreement } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hire-tabpanel-${index}`}
      aria-labelledby={`hire-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper functions
const calculateDaysRemaining = (endDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateDaysOverdue = (endDate: string): number => {
  const daysRemaining = calculateDaysRemaining(endDate);
  return daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
};

export default function HireAgreementsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState<number | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<AnimalHireAgreement | ExternalAnimalHireAgreement | null>(null);
  const [agreementType, setAgreementType] = useState<'income' | 'expense' | null>(null);
  const [createAnimalHireDialogOpen, setCreateAnimalHireDialogOpen] = useState(false);
  const [createExternalHireDialogOpen, setCreateExternalHireDialogOpen] = useState(false);
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'create_breeding') && !hasPermission(currentUser, 'view_financial_reports'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don&apos;t have permission to access this page.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalIncome = mockAnimalHireAgreements
      .filter(a => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (a.received_amount || 0), 0);
    
    const totalExpenses = mockExternalAnimalHireAgreements
      .filter(a => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (a.paid_amount || 0), 0);
    
    const pendingIncome = mockAnimalHireAgreements
      .filter(a => a.payment_status === 'pending' || a.payment_status === 'partial')
      .reduce((sum, a) => sum + (a.total_amount - (a.received_amount || 0)), 0);
    
    const pendingExpenses = mockExternalAnimalHireAgreements
      .filter(a => a.payment_status === 'pending' || a.payment_status === 'partial')
      .reduce((sum, a) => sum + (a.total_amount - (a.paid_amount || 0)), 0);
    
    const activeAgreements = [
      ...mockAnimalHireAgreements.filter(a => a.status === 'active'),
      ...mockExternalAnimalHireAgreements.filter(a => a.status === 'active')
    ].length;
    
    const today = new Date();
    const expiringSoon = [
      ...mockAnimalHireAgreements.filter(a => {
        if (!a.end_date || a.status !== 'active') return false;
        const daysRemaining = calculateDaysRemaining(a.end_date);
        return daysRemaining <= 7 && daysRemaining > 0;
      }),
      ...mockExternalAnimalHireAgreements.filter(a => {
        if (!a.end_date || a.status !== 'active') return false;
        const daysRemaining = calculateDaysRemaining(a.end_date);
        return daysRemaining <= 7 && daysRemaining > 0;
      })
    ].length;

    return {
      totalIncome,
      totalExpenses,
      pendingIncome,
      pendingExpenses,
      activeAgreements,
      expiringSoon
    };
  }, []);

  // Filter agreements based on active tab
  const filteredAgreements = useMemo(() => {
    let agreements: (AnimalHireAgreement | ExternalAnimalHireAgreement)[] = [];
    
    if (activeTab === 0) {
      // My Animals Hired Out (Income)
      agreements = mockAnimalHireAgreements;
    } else if (activeTab === 1) {
      // External Animals Hired (Expenses)
      agreements = mockExternalAnimalHireAgreements;
    } else if (activeTab === 2) {
      // All Agreements
      agreements = [...mockAnimalHireAgreements, ...mockExternalAnimalHireAgreements];
    } else if (activeTab === 3) {
      // Reminders
      const today = new Date();
      agreements = [
        ...mockAnimalHireAgreements.filter(a => {
          if (a.status !== 'active') return false;
          if (a.end_date) {
            const daysRemaining = calculateDaysRemaining(a.end_date);
            return daysRemaining <= 7;
          }
          if (a.agreement_type === 'per_service' && a.service_count) {
            const servicesRemaining = a.service_count - (a.services_used || 0);
            return servicesRemaining <= 2;
          }
          return a.payment_status === 'pending' || a.payment_status === 'partial';
        }),
        ...mockExternalAnimalHireAgreements.filter(a => {
          if (a.status !== 'active') return false;
          if (a.end_date) {
            const daysRemaining = calculateDaysRemaining(a.end_date);
            return daysRemaining <= 7;
          }
          if (a.agreement_type === 'per_service' && a.service_count) {
            const servicesRemaining = a.service_count - (a.services_used || 0);
            return servicesRemaining <= 2;
          }
          return a.payment_status === 'pending' || a.payment_status === 'partial';
        })
      ];
    }

    return agreements.filter(agreement => {
      const matchesSearch = 
        ('animal' in agreement && agreement.animal?.tag_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ('external_animal_tag' in agreement && agreement.external_animal_tag?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        agreement.external_farm?.farm_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || agreement.status === filterStatus;
      const matchesPayment = filterPayment === 'all' || agreement.payment_status === filterPayment;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [activeTab, searchTerm, filterStatus, filterPayment]);

  const handleViewDetails = (agreement: AnimalHireAgreement | ExternalAnimalHireAgreement) => {
    setSelectedAgreement(agreement);
    setAgreementType('animal' in agreement ? 'income' : 'expense');
    setViewDialogOpen(agreement.agreement_id);
  };

  const getAgreementStatusInfo = (agreement: AnimalHireAgreement | ExternalAnimalHireAgreement) => {
    if (agreement.status === 'completed' || agreement.status === 'cancelled') {
      return { status: 'completed', daysRemaining: undefined, daysOverdue: undefined, servicesRemaining: undefined };
    }
    
    // For per_service agreements, prioritize showing services remaining
    if (agreement.agreement_type === 'per_service' && agreement.service_count) {
      const servicesRemaining = agreement.service_count - (agreement.services_used || 0);
      if (servicesRemaining <= 0) {
        // All services used, check if end_date is overdue
        if (agreement.end_date) {
          const daysRemaining = calculateDaysRemaining(agreement.end_date);
          if (daysRemaining < 0) {
            return { status: 'overdue', daysRemaining: undefined, daysOverdue: Math.abs(daysRemaining), servicesRemaining: 0 };
          }
        }
        return { status: 'normal', daysRemaining: undefined, daysOverdue: undefined, servicesRemaining: 0 };
      }
      // Show services remaining (always show if > 0)
      return { status: servicesRemaining <= 2 ? 'expiring_soon' : 'normal', daysRemaining: undefined, daysOverdue: undefined, servicesRemaining };
    }
    
    // For time-based agreements, check end_date
    if (agreement.end_date) {
      const daysRemaining = calculateDaysRemaining(agreement.end_date);
      if (daysRemaining < 0) {
        return { status: 'overdue', daysRemaining: undefined, daysOverdue: Math.abs(daysRemaining), servicesRemaining: undefined };
      }
      if (daysRemaining <= 7) {
        return { status: 'expiring_soon', daysRemaining, daysOverdue: undefined, servicesRemaining: undefined };
      }
      return { status: 'normal', daysRemaining, daysOverdue: undefined, servicesRemaining: undefined };
    }
    
    return { status: 'normal', daysRemaining: undefined, daysOverdue: undefined, servicesRemaining: undefined };
  };

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  <DollarSign size={32} color="white" strokeWidth={2} />
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
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                    }}
                  >
                    Animal Hire Agreements
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontWeight: 400,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                  }}>
                    Track income from hiring out your animals and expenses from hiring external animals
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 } }}>
                {currentUser && (currentUser.is_owner || hasPermission(currentUser, 'create_breeding')) && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={() => setCreateAnimalHireDialogOpen(true)}
                      fullWidth={{ xs: true, sm: false }}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 },
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        }
                      }}
                    >
                      Hire Out Animal
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={() => setCreateExternalHireDialogOpen(true)}
                      fullWidth={{ xs: true, sm: false }}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 },
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        }
                      }}
                    >
                      Hire External Animal
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="My Animals Hired Out" icon={<TrendingUp size={18} />} iconPosition="start" />
              <Tab label="External Animals Hired" icon={<TrendingDown size={18} />} iconPosition="start" />
              <Tab label="All Agreements" />
              <Tab label="Reminders" icon={<AlertCircle size={18} />} iconPosition="start" />
            </Tabs>
          </Box>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search agreements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#16a34a" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 2 }}
              />
              <TextField
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </TextField>
              <TextField
                select
                label="Payment Status"
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Payments</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Agreements Table */}
        <TabPanel value={activeTab} index={0}>
          {/* My Animals Hired Out */}
          <AgreementsTable 
            agreements={filteredAgreements.filter(a => 'animal' in a) as AnimalHireAgreement[]}
            type="income"
            onViewDetails={handleViewDetails}
            getAgreementStatusInfo={getAgreementStatusInfo}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* External Animals Hired */}
          <AgreementsTable 
            agreements={filteredAgreements.filter(a => !('animal' in a)) as ExternalAnimalHireAgreement[]}
            type="expense"
            onViewDetails={handleViewDetails}
            getAgreementStatusInfo={getAgreementStatusInfo}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* All Agreements */}
          <AgreementsTable 
            agreements={filteredAgreements}
            type="all"
            onViewDetails={handleViewDetails}
            getAgreementStatusInfo={getAgreementStatusInfo}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Reminders */}
          <AgreementsTable 
            agreements={filteredAgreements}
            type="reminders"
            onViewDetails={handleViewDetails}
            getAgreementStatusInfo={getAgreementStatusInfo}
          />
        </TabPanel>

        {/* View Details Dialog */}
        {selectedAgreement && (
          <AgreementDetailsDialog
            agreement={selectedAgreement}
            type={agreementType || 'income'}
            open={viewDialogOpen === selectedAgreement.agreement_id}
            onClose={() => {
              setViewDialogOpen(null);
              setSelectedAgreement(null);
            }}
            getAgreementStatusInfo={getAgreementStatusInfo}
          />
        )}

        {/* Create Animal Hire Agreement Dialog */}
        <CreateAnimalHireAgreementDialog
          open={createAnimalHireDialogOpen}
          onClose={() => setCreateAnimalHireDialogOpen(false)}
          currentUser={currentUser}
        />

        {/* Create External Animal Hire Agreement Dialog */}
        <CreateExternalAnimalHireAgreementDialog
          open={createExternalHireDialogOpen}
          onClose={() => setCreateExternalHireDialogOpen(false)}
          currentUser={currentUser}
        />
      </Box>
    </DashboardContainer>
  );
}

// Agreements Table Component
function AgreementsTable({ 
  agreements, 
  type, 
  onViewDetails, 
  getAgreementStatusInfo 
}: { 
  agreements: (AnimalHireAgreement | ExternalAnimalHireAgreement)[]; 
  type: 'income' | 'expense' | 'all' | 'reminders';
  onViewDetails: (agreement: AnimalHireAgreement | ExternalAnimalHireAgreement) => void;
  getAgreementStatusInfo: (agreement: AnimalHireAgreement | ExternalAnimalHireAgreement) => any;
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated agreements
  const paginatedAgreements = agreements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (agreements.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <DollarSign size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No agreements found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Agreement ID</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Animal</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Farm</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Purpose</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Remaining</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAgreements.map((agreement) => {
                const statusInfo = getAgreementStatusInfo(agreement);
                const isIncome = 'animal' in agreement;
                const animalTag = isIncome 
                  ? (agreement as AnimalHireAgreement).animal?.tag_number 
                  : (agreement as ExternalAnimalHireAgreement).external_animal_tag || 'N/A';
                
                return (
                  <TableRow 
                    key={agreement.agreement_id} 
                    hover
                    sx={{
                      borderLeft: statusInfo.status === 'overdue' ? '4px solid #dc2626' :
                                  statusInfo.status === 'expiring_soon' ? '4px solid #f59e0b' : 'none'
                    }}
                  >
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        #{agreement.agreement_id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {animalTag}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {agreement.external_farm?.farm_name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>
                      <Chip 
                        label={agreement.hire_purpose} 
                        size="small" 
                        sx={{ textTransform: 'capitalize', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {agreement.agreement_type.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                      {agreement.agreement_type === 'per_service' ? (
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {agreement.services_used || 0} / {agreement.service_count || 0}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {agreement.days_used || 0} days
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' }, whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        UGX {agreement.hire_rate.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        UGX {agreement.total_amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                      <Chip
                        label={agreement.payment_status}
                        size="small"
                        color={
                          agreement.payment_status === 'paid' ? 'success' :
                          agreement.payment_status === 'partial' ? 'warning' :
                          agreement.payment_status === 'overdue' ? 'error' : 'default'
                        }
                        sx={{ textTransform: 'capitalize', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                      <Chip
                        label={agreement.status}
                        size="small"
                        color={
                          agreement.status === 'active' ? 'success' :
                          agreement.status === 'completed' ? 'default' :
                          agreement.status === 'cancelled' ? 'error' : 'warning'
                        }
                        sx={{ textTransform: 'capitalize', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                      {statusInfo.daysOverdue ? (
                        <Chip
                          label={`${statusInfo.daysOverdue} days overdue`}
                          size="small"
                          color="error"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        />
                      ) : statusInfo.servicesRemaining !== undefined && statusInfo.servicesRemaining > 0 ? (
                        <Chip
                          label={`${statusInfo.servicesRemaining} service${statusInfo.servicesRemaining !== 1 ? 's' : ''} left`}
                          size="small"
                          color={statusInfo.servicesRemaining <= 2 ? 'warning' : 'default'}
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        />
                      ) : statusInfo.daysRemaining !== undefined ? (
                        <Chip
                          label={`${statusInfo.daysRemaining} days left`}
                          size="small"
                          color={statusInfo.daysRemaining <= 7 ? 'warning' : 'default'}
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => onViewDetails(agreement)}
                          sx={{ color: '#16a34a' }}
                        >
                          <Eye size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={agreements.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          sx={{
            borderTop: `1px solid ${alpha('#16a34a', 0.2)}`,
            '& .MuiTablePagination-toolbar': {
              px: 2,
            }
          }}
        />
      </CardContent>
    </Card>
  );
}

// Agreement Details Dialog Component
function AgreementDetailsDialog({
  agreement,
  type,
  open,
  onClose,
  getAgreementStatusInfo
}: {
  agreement: AnimalHireAgreement | ExternalAnimalHireAgreement;
  type: 'income' | 'expense';
  open: boolean;
  onClose: () => void;
  getAgreementStatusInfo: (agreement: AnimalHireAgreement | ExternalAnimalHireAgreement) => any;
}) {
  const statusInfo = getAgreementStatusInfo(agreement);
  const isIncome = type === 'income';
  const animalTag = isIncome 
    ? (agreement as AnimalHireAgreement).animal?.tag_number 
    : (agreement as ExternalAnimalHireAgreement).external_animal_tag || 'N/A';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="600">
          Agreement Details #{agreement.agreement_id}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {statusInfo.status === 'overdue' && (
            <MuiAlert severity="error">
              This agreement is {statusInfo.daysOverdue} days overdue!
            </MuiAlert>
          )}
          {statusInfo.status === 'expiring_soon' && (
            <MuiAlert severity="warning">
              {statusInfo.daysRemaining !== undefined 
                ? `This agreement expires in ${statusInfo.daysRemaining} days.`
                : `Only ${statusInfo.servicesRemaining} service(s) remaining.`}
            </MuiAlert>
          )}
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {isIncome ? 'Your Animal' : 'External Animal'}
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {animalTag}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              External Farm
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {agreement.external_farm?.farm_name || 'N/A'}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Purpose
                </Typography>
                <Chip label={agreement.hire_purpose} size="small" sx={{ textTransform: 'capitalize' }} />
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Agreement Type
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {agreement.agreement_type.replace('_', ' ')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Start Date
                </Typography>
                <Typography variant="body1">
                  {new Date(agreement.start_date).toLocaleDateString()}
                </Typography>
              </Paper>
            </Grid>
            {agreement.end_date && (
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(agreement.end_date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Financial Details
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Hire Rate:</Typography>
                <Typography variant="body2" fontWeight="600">
                  UGX {agreement.hire_rate.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Amount:</Typography>
                <Typography variant="body2" fontWeight="600">
                  UGX {agreement.total_amount.toLocaleString()}
                </Typography>
              </Box>
              {isIncome ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Received:</Typography>
                  <Typography variant="body2" fontWeight="600">
                    UGX {((agreement as AnimalHireAgreement).received_amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Paid:</Typography>
                  <Typography variant="body2" fontWeight="600">
                    UGX {((agreement as ExternalAnimalHireAgreement).paid_amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight="600">Amount Due:</Typography>
                <Typography variant="body1" fontWeight="600" sx={{ color: '#f59e0b' }}>
                  UGX {(agreement.total_amount - (isIncome 
                    ? ((agreement as AnimalHireAgreement).received_amount || 0)
                    : ((agreement as ExternalAnimalHireAgreement).paid_amount || 0)
                  )).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {agreement.notes && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body1">
                {agreement.notes}
              </Typography>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Create Animal Hire Agreement Dialog Component
function CreateAnimalHireAgreementDialog({
  open,
  onClose,
  currentUser
}: {
  open: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}) {
  const [formData, setFormData] = useState({
    animal_id: '',
    farm_id: '',
    external_farm_id: '',
    hire_purpose: 'breeding' as 'breeding' | 'showing' | 'other',
    agreement_type: 'per_service' as 'per_service' | 'per_day' | 'per_week' | 'per_month' | 'fixed_period',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    service_count: '',
    hire_rate: '',
    total_amount: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Get available animals for current tenant
  const availableAnimals = currentUser 
    ? mockAnimals.filter(a => a.tenant_id === currentUser.tenant_id && a.status === 'active')
    : [];

  // Get available farms for current tenant
  const availableFarms = currentUser
    ? mockFarms.filter(f => f.tenant_id === currentUser.tenant_id && f.status === 'active')
    : [];

  // Calculate total amount based on agreement type
  const calculateTotal = () => {
    if (!formData.hire_rate) return '';
    const rate = parseFloat(formData.hire_rate);
    if (isNaN(rate)) return '';

    if (formData.agreement_type === 'per_service' && formData.service_count) {
      const count = parseInt(formData.service_count);
      return (rate * count).toString();
    } else if (formData.agreement_type === 'fixed_period') {
      return rate.toString();
    } else if (formData.end_date && formData.start_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        if (formData.agreement_type === 'per_day') {
          return (rate * days).toString();
        } else if (formData.agreement_type === 'per_week') {
          return (rate * Math.ceil(days / 7)).toString();
        } else if (formData.agreement_type === 'per_month') {
          return (rate * Math.ceil(days / 30)).toString();
        }
      }
    }
    return '';
  };

  // Update total when relevant fields change
  React.useEffect(() => {
    const total = calculateTotal();
    if (total) {
      setFormData(prev => ({ ...prev, total_amount: total }));
    }
  }, [formData.hire_rate, formData.agreement_type, formData.service_count, formData.start_date, formData.end_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    if (!formData.animal_id || !formData.farm_id || !formData.external_farm_id || !formData.hire_rate) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.agreement_type === 'per_service' && !formData.service_count) {
      alert('Please specify the number of services');
      return;
    }

    if (formData.agreement_type !== 'fixed_period' && !formData.end_date) {
      alert('Please specify an end date for time-based agreements');
      return;
    }

    setSubmitting(true);

    // In a real app, this would be an API call
    // For now, we'll just log and show success
    console.log('Creating animal hire agreement:', {
      ...formData,
      tenant_id: currentUser.tenant_id,
      created_by_user_id: currentUser.user_id,
      status: 'pending',
      payment_status: 'pending',
      services_used: 0,
      days_used: 0,
      received_amount: 0
    });

    // Simulate API call
    setTimeout(() => {
      alert('Hire agreement created successfully! (This is a demo - data will be saved when backend is connected)');
      setSubmitting(false);
      onClose();
      // Reset form
      setFormData({
        animal_id: '',
        farm_id: '',
        external_farm_id: '',
        hire_purpose: 'breeding',
        agreement_type: 'per_service',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        service_count: '',
        hire_rate: '',
        total_amount: '',
        notes: ''
      });
    }, 500);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">
            Hire Out Your Animal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create an agreement to hire out one of your animals to an external farm
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Select Animal"
              required
              fullWidth
              value={formData.animal_id}
              onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
            >
              {availableAnimals.map(animal => (
                <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                  {animal.tag_number} - {animal.animal_type} ({animal.gender})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Your Farm"
              required
              fullWidth
              value={formData.farm_id}
              onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
            >
              {availableFarms.map(farm => (
                <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                  {farm.farm_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="External Farm (Hiring Your Animal)"
              required
              fullWidth
              value={formData.external_farm_id}
              onChange={(e) => setFormData({ ...formData, external_farm_id: e.target.value })}
            >
              {mockExternalFarms.map(farm => (
                <MenuItem key={farm.external_farm_id} value={farm.external_farm_id.toString()}>
                  {farm.farm_name} - {farm.location}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Hire Purpose"
                  required
                  fullWidth
                  value={formData.hire_purpose}
                  onChange={(e) => setFormData({ ...formData, hire_purpose: e.target.value as any })}
                >
                  <MenuItem value="breeding">Breeding</MenuItem>
                  <MenuItem value="showing">Showing</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Agreement Type"
                  required
                  fullWidth
                  value={formData.agreement_type}
                  onChange={(e) => setFormData({ ...formData, agreement_type: e.target.value as any })}
                >
                  <MenuItem value="per_service">Per Service</MenuItem>
                  <MenuItem value="per_day">Per Day</MenuItem>
                  <MenuItem value="per_week">Per Week</MenuItem>
                  <MenuItem value="per_month">Per Month</MenuItem>
                  <MenuItem value="fixed_period">Fixed Period</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  required
                  fullWidth
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  label="End Date"
                  fullWidth
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required={formData.agreement_type !== 'fixed_period'}
                  disabled={formData.agreement_type === 'fixed_period'}
                />
              </Grid>
            </Grid>

            {formData.agreement_type === 'per_service' && (
              <TextField
                type="number"
                label="Number of Services"
                required
                fullWidth
                value={formData.service_count}
                onChange={(e) => setFormData({ ...formData, service_count: e.target.value })}
                inputProps={{ min: 1 }}
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  label="Hire Rate (UGX)"
                  required
                  fullWidth
                  value={formData.hire_rate}
                  onChange={(e) => setFormData({ ...formData, hire_rate: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">UGX</InputAdornment>
                  }}
                  inputProps={{ min: 0, step: 1000 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {formData.agreement_type === 'per_service' ? 'Per service' :
                   formData.agreement_type === 'per_day' ? 'Per day' :
                   formData.agreement_type === 'per_week' ? 'Per week' :
                   formData.agreement_type === 'per_month' ? 'Per month' : 'Total amount'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Total Amount (UGX)"
                  fullWidth
                  value={formData.total_amount ? `UGX ${parseFloat(formData.total_amount).toLocaleString()}` : ''}
                  disabled
                  InputProps={{
                    startAdornment: <InputAdornment position="start">UGX</InputAdornment>
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Calculated automatically
                </Typography>
              </Grid>
            </Grid>

            <TextField
              label="Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details about the agreement..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#16a34a' }}>
            {submitting ? 'Creating...' : 'Create Agreement'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Create External Animal Hire Agreement Dialog Component
function CreateExternalAnimalHireAgreementDialog({
  open,
  onClose,
  currentUser
}: {
  open: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}) {
  const [formData, setFormData] = useState({
    external_farm_id: '',
    external_animal_id: '',
    external_animal_tag: '',
    farm_id: '',
    hire_purpose: 'breeding' as 'breeding' | 'showing' | 'other',
    agreement_type: 'per_service' as 'per_service' | 'per_day' | 'per_week' | 'per_month' | 'fixed_period',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    service_count: '',
    hire_rate: '',
    total_amount: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [useRegisteredAnimal, setUseRegisteredAnimal] = useState(true);

  // Get available farms for current tenant
  const availableFarms = currentUser
    ? mockFarms.filter(f => f.tenant_id === currentUser.tenant_id && f.status === 'active')
    : [];

  // Get external animals for selected farm
  const externalAnimalsForFarm = formData.external_farm_id
    ? mockExternalAnimals.filter(a => a.external_farm_id === parseInt(formData.external_farm_id))
    : [];

  // Calculate total amount
  const calculateTotal = () => {
    if (!formData.hire_rate) return '';
    const rate = parseFloat(formData.hire_rate);
    if (isNaN(rate)) return '';

    if (formData.agreement_type === 'per_service' && formData.service_count) {
      const count = parseInt(formData.service_count);
      return (rate * count).toString();
    } else if (formData.agreement_type === 'fixed_period') {
      return rate.toString();
    } else if (formData.end_date && formData.start_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        if (formData.agreement_type === 'per_day') {
          return (rate * days).toString();
        } else if (formData.agreement_type === 'per_week') {
          return (rate * Math.ceil(days / 7)).toString();
        } else if (formData.agreement_type === 'per_month') {
          return (rate * Math.ceil(days / 30)).toString();
        }
      }
    }
    return '';
  };

  React.useEffect(() => {
    const total = calculateTotal();
    if (total) {
      setFormData(prev => ({ ...prev, total_amount: total }));
    }
  }, [formData.hire_rate, formData.agreement_type, formData.service_count, formData.start_date, formData.end_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    if (!formData.external_farm_id || !formData.farm_id || !formData.hire_rate) {
      alert('Please fill in all required fields');
      return;
    }

    if (useRegisteredAnimal && !formData.external_animal_id) {
      alert('Please select an external animal');
      return;
    }

    if (!useRegisteredAnimal && !formData.external_animal_tag) {
      alert('Please enter the external animal tag');
      return;
    }

    if (formData.agreement_type === 'per_service' && !formData.service_count) {
      alert('Please specify the number of services');
      return;
    }

    if (formData.agreement_type !== 'fixed_period' && !formData.end_date) {
      alert('Please specify an end date for time-based agreements');
      return;
    }

    setSubmitting(true);

    // In a real app, this would be an API call
    console.log('Creating external animal hire agreement:', {
      ...formData,
      tenant_id: currentUser.tenant_id,
      created_by_user_id: currentUser.user_id,
      status: 'pending',
      payment_status: 'pending',
      services_used: 0,
      days_used: 0,
      paid_amount: 0,
      external_animal_id: useRegisteredAnimal ? parseInt(formData.external_animal_id) : undefined,
      external_animal_tag: useRegisteredAnimal ? undefined : formData.external_animal_tag
    });

    setTimeout(() => {
      alert('Hire agreement created successfully! (This is a demo - data will be saved when backend is connected)');
      setSubmitting(false);
      onClose();
      // Reset form
      setFormData({
        external_farm_id: '',
        external_animal_id: '',
        external_animal_tag: '',
        farm_id: '',
        hire_purpose: 'breeding',
        agreement_type: 'per_service',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        service_count: '',
        hire_rate: '',
        total_amount: '',
        notes: ''
      });
      setUseRegisteredAnimal(true);
    }, 500);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">
            Hire External Animal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create an agreement to hire an animal from an external farm
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Your Farm"
              required
              fullWidth
              value={formData.farm_id}
              onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
            >
              {availableFarms.map(farm => (
                <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                  {farm.farm_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="External Farm"
              required
              fullWidth
              value={formData.external_farm_id}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  external_farm_id: e.target.value,
                  external_animal_id: '' // Reset animal selection when farm changes
                });
              }}
            >
              {mockExternalFarms.map(farm => (
                <MenuItem key={farm.external_farm_id} value={farm.external_farm_id.toString()}>
                  {farm.farm_name} - {farm.location}
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Animal Selection
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant={useRegisteredAnimal ? 'contained' : 'outlined'}
                  onClick={() => {
                    setUseRegisteredAnimal(true);
                    setFormData({ ...formData, external_animal_tag: '' });
                  }}
                  size="small"
                >
                  Use Registered Animal
                </Button>
                <Button
                  variant={!useRegisteredAnimal ? 'contained' : 'outlined'}
                  onClick={() => {
                    setUseRegisteredAnimal(false);
                    setFormData({ ...formData, external_animal_id: '' });
                  }}
                  size="small"
                >
                  Enter Tag Manually
                </Button>
              </Stack>

              {useRegisteredAnimal ? (
                <TextField
                  select
                  label="External Animal"
                  required
                  fullWidth
                  value={formData.external_animal_id}
                  onChange={(e) => setFormData({ ...formData, external_animal_id: e.target.value })}
                  disabled={!formData.external_farm_id || externalAnimalsForFarm.length === 0}
                >
                  {externalAnimalsForFarm.length === 0 ? (
                    <MenuItem disabled>No registered animals for this farm</MenuItem>
                  ) : (
                    externalAnimalsForFarm.map(animal => (
                      <MenuItem key={animal.external_animal_id} value={animal.external_animal_id.toString()}>
                        {animal.tag_number} - {animal.animal_type} ({animal.gender})
                      </MenuItem>
                    ))
                  )}
                </TextField>
              ) : (
                <TextField
                  label="External Animal Tag"
                  required
                  fullWidth
                  value={formData.external_animal_tag}
                  onChange={(e) => setFormData({ ...formData, external_animal_tag: e.target.value })}
                  placeholder="e.g., Bull-123"
                />
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Hire Purpose"
                  required
                  fullWidth
                  value={formData.hire_purpose}
                  onChange={(e) => setFormData({ ...formData, hire_purpose: e.target.value as any })}
                >
                  <MenuItem value="breeding">Breeding</MenuItem>
                  <MenuItem value="showing">Showing</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Agreement Type"
                  required
                  fullWidth
                  value={formData.agreement_type}
                  onChange={(e) => setFormData({ ...formData, agreement_type: e.target.value as any })}
                >
                  <MenuItem value="per_service">Per Service</MenuItem>
                  <MenuItem value="per_day">Per Day</MenuItem>
                  <MenuItem value="per_week">Per Week</MenuItem>
                  <MenuItem value="per_month">Per Month</MenuItem>
                  <MenuItem value="fixed_period">Fixed Period</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  required
                  fullWidth
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  label="End Date"
                  fullWidth
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required={formData.agreement_type !== 'fixed_period'}
                  disabled={formData.agreement_type === 'fixed_period'}
                />
              </Grid>
            </Grid>

            {formData.agreement_type === 'per_service' && (
              <TextField
                type="number"
                label="Number of Services"
                required
                fullWidth
                value={formData.service_count}
                onChange={(e) => setFormData({ ...formData, service_count: e.target.value })}
                inputProps={{ min: 1 }}
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  label="Hire Rate (UGX)"
                  required
                  fullWidth
                  value={formData.hire_rate}
                  onChange={(e) => setFormData({ ...formData, hire_rate: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">UGX</InputAdornment>
                  }}
                  inputProps={{ min: 0, step: 1000 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {formData.agreement_type === 'per_service' ? 'Per service' :
                   formData.agreement_type === 'per_day' ? 'Per day' :
                   formData.agreement_type === 'per_week' ? 'Per week' :
                   formData.agreement_type === 'per_month' ? 'Per month' : 'Total amount'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Total Amount (UGX)"
                  fullWidth
                  value={formData.total_amount ? `UGX ${parseFloat(formData.total_amount).toLocaleString()}` : ''}
                  disabled
                  InputProps={{
                    startAdornment: <InputAdornment position="start">UGX</InputAdornment>
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Calculated automatically
                </Typography>
              </Grid>
            </Grid>

            <TextField
              label="Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details about the agreement..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#16a34a' }}>
            {submitting ? 'Creating...' : 'Create Agreement'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

