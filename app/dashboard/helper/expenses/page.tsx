'use client';

import { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  alpha,
  Alert
} from '@mui/material';
import { Plus, TrendingDown, Search, Calendar, Filter, CheckCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockExpenses, mockFarms } from '@/lib/mockData';
import { Expense } from '@/types';

export default function HelperExpensesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const currentUser = getCurrentUser();

  // Check permissions
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'create_general'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don't have permission to log expenses.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  // Get accessible farms
  const accessibleFarms = mockFarms.filter(f => 
    currentUser?.is_owner || f.tenant_id === currentUser?.tenant_id
  );

  // Filter expenses
  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesType = filterType === 'all' || expense.expense_type === filterType;
    const matchesSearch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFarm = currentUser?.is_owner || 
      (currentUser?.accessible_farm_ids?.includes(expense.farm_id) ?? false);
    
    return matchesType && matchesSearch && matchesFarm;
  });

  // Form state
  const [formData, setFormData] = useState({
    farm_id: currentUser?.accessible_farm_ids?.[0]?.toString() || '',
    expense_type: 'feed' as Expense['expense_type'],
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor: '',
    payment_method: 'cash' as Expense['payment_method']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would call an API endpoint
    console.log('Expense logged:', {
      ...formData,
      amount: Number(formData.amount),
      tenant_id: currentUser?.tenant_id,
      created_by_user_id: currentUser?.user_id
    });

    setSubmitting(false);
    setSuccessMessage('Expense logged successfully!');
    
    // Reset form
    setFormData({
      farm_id: currentUser?.accessible_farm_ids?.[0]?.toString() || '',
      expense_type: 'feed',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      vendor: '',
      payment_method: 'cash'
    });

    // Close dialog after 2 seconds
    setTimeout(() => {
      setCreateDialogOpen(false);
      setSuccessMessage('');
    }, 2000);
  };

  const expenseTypes: Expense['expense_type'][] = [
    'feed',
    'medicine',
    'labor',
    'equipment',
    'utilities',
    'transport',
    'animal_hire',
    'other'
  ];

  const paymentMethods: Expense['payment_method'][] = [
    'cash',
    'bank_transfer',
    'check',
    'mobile_money'
  ];

  const getExpenseTypeLabel = (type: Expense['expense_type']) => {
    const labels: Record<Expense['expense_type'], string> = {
      feed: 'Feed',
      medicine: 'Medicine',
      labor: 'Labor',
      equipment: 'Equipment',
      utilities: 'Utilities',
      transport: 'Transport',
      animal_hire: 'Animal Hire',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method?: Expense['payment_method']) => {
    if (!method) return 'N/A';
    const labels: Record<Expense['payment_method'], string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      mobile_money: 'Mobile Money'
    };
    return labels[method] || method;
  };

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto', p: 3 }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
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
                  <TrendingDown size={32} color="white" strokeWidth={2} />
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
                    Log Farm Expenses
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontWeight: 400,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                  }}>
                    Record and track farm expenses
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => setCreateDialogOpen(true)}
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  bgcolor: 'white',
                  color: '#064e3b',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  mt: { xs: 2, sm: 0 }
                }}
              >
                Log Expense
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontWeight: 600, 
                  color: '#dc2626',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                }}>
                  UGX {totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} recorded
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  This Month
                </Typography>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#dc2626' }}>
                  UGX {filteredExpenses
                    .filter(e => {
                      const expenseDate = new Date(e.expense_date);
                      const now = new Date();
                      return expenseDate.getMonth() === now.getMonth() && 
                             expenseDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current month expenses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Average per Expense
                </Typography>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#dc2626' }}>
                  UGX {filteredExpenses.length > 0 
                    ? Math.round(totalExpenses / filteredExpenses.length).toLocaleString()
                    : '0'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average expense amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} style={{ marginRight: 8, color: '#6b7280' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Filter by Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  InputProps={{
                    startAdornment: <Filter size={18} style={{ marginRight: 8, color: '#6b7280' }} />
                  }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {expenseTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {getExpenseTypeLabel(type)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            {filteredExpenses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  No expenses found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Start by logging your first expense'}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Payment Method</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Farm</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.expense_id} hover>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} color="#6b7280" />
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <Chip
                            label={getExpenseTypeLabel(expense.expense_type)}
                            size="small"
                            sx={{
                              bgcolor: alpha('#16a34a', 0.1),
                              color: '#064e3b',
                              fontWeight: 500,
                              fontSize: { xs: '0.65rem', sm: '0.75rem' }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, maxWidth: { xs: 150, sm: 200, md: 'none' } }}>
                          <Typography variant="body2" sx={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box',
                            WebkitLineClamp: { xs: 2, sm: 3 },
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {expense.description}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                          {expense.vendor || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#dc2626', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                          UGX {expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>
                          {getPaymentMethodLabel(expense.payment_method)}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                          {mockFarms.find(f => f.farm_id === expense.farm_id)?.farm_name || 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Create Expense Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => {
            setCreateDialogOpen(false);
            setSuccessMessage('');
          }}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              m: { xs: 0, sm: 2 },
              borderRadius: { xs: 0, sm: 2 },
              maxHeight: { xs: '100vh', sm: '90vh' }
            }
          }}
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>
                Log New Expense
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {successMessage && (
                  <Alert severity="success" icon={<CheckCircle size={20} />}>
                    {successMessage}
                  </Alert>
                )}
                
                <TextField
                  label="Farm"
                  fullWidth
                  select
                  required
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                >
                  {accessibleFarms.map((farm) => (
                    <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                      {farm.farm_name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Expense Type"
                  fullWidth
                  select
                  required
                  value={formData.expense_type}
                  onChange={(e) => setFormData({ ...formData, expense_type: e.target.value as Expense['expense_type'] })}
                >
                  {expenseTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {getExpenseTypeLabel(type)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Description"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  placeholder="Describe the expense..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <TextField
                  label="Amount (UGX)"
                  fullWidth
                  required
                  type="number"
                  inputProps={{ min: 0, step: 1000 }}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>UGX</Typography>
                  }}
                />

                <TextField
                  label="Expense Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                />

                <TextField
                  label="Vendor/Supplier (Optional)"
                  fullWidth
                  placeholder="Name of vendor or supplier"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />

                <TextField
                  label="Payment Method"
                  fullWidth
                  select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as Expense['payment_method'] })}
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {getPaymentMethodLabel(method)}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => {
                  setCreateDialogOpen(false);
                  setSuccessMessage('');
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' },
                  fontWeight: 600
                }}
              >
                {submitting ? 'Logging...' : 'Log Expense'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}

