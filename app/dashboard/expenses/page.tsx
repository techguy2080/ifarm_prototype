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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  alpha
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { DollarSign, TrendingDown, ExternalLink } from 'lucide-react';
import { mockExpenses, mockFarms, mockExternalAnimalHireAgreements, mockExternalFarms } from '@/lib/mockData';

export default function ExpensesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const filteredExpenses = filterType === 'all' 
    ? mockExpenses 
    : mockExpenses.filter(e => e.expense_type === filterType);

  // Combine manual expenses with external animal hire expenses
  const allExpenses = useMemo(() => {
    const manualExpenses = mockExpenses;
    
    // Convert external animal hire agreements to expenses
    const hireExpenses = mockExternalAnimalHireAgreements
      .filter(agreement => agreement.status === 'active' || agreement.status === 'completed')
      .map(agreement => {
        const externalFarm = mockExternalFarms.find(f => f.external_farm_id === agreement.external_farm_id);
        return {
          expense_id: 10000 + agreement.agreement_id, // Offset to avoid conflicts
          tenant_id: agreement.tenant_id,
          farm_id: agreement.farm_id,
          expense_type: 'animal_hire' as const,
          description: `External animal hire: ${agreement.external_animal_tag || 'External Animal'} from ${externalFarm?.farm_name || 'External Farm'}`,
          amount: agreement.paid_amount || agreement.total_amount || 0,
          expense_date: agreement.payment_date || agreement.start_date,
          vendor: externalFarm?.farm_name,
          payment_method: agreement.payment_method,
          external_animal_hire_agreement_id: agreement.agreement_id,
          created_by_user_id: agreement.created_by_user_id || 1,
          created_at: agreement.created_at
        };
      });
    
    return [...manualExpenses, ...hireExpenses];
  }, []);

  const expenseTypes = ['feed', 'medicine', 'labor', 'equipment', 'utilities', 'transport', 'animal_hire', 'other'];
  const expenseByType = expenseTypes.reduce((acc, type) => {
    acc[type] = allExpenses
      .filter(e => e.expense_type === type)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const filteredExpenses = filterType === 'all' 
    ? allExpenses 
    : allExpenses.filter(e => e.expense_type === filterType);

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
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Expenses Tracking
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
                  Track all farm expenses by category. Monitor spending and optimize costs.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={() => setCreateDialogOpen(true)}
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
              Record Expense
            </Button>
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" fontWeight="700" color="error.main">
                UGX {totalExpenses.toLocaleString()}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {mockExpenses.length} transactions
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Avg Expense
              </Typography>
              <Typography variant="h4" fontWeight="700" color="warning.main">
                UGX {mockExpenses.length > 0 ? Math.round(totalExpenses / mockExpenses.length).toLocaleString() : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top Expense Category
              </Typography>
              <Typography variant="h4" fontWeight="700" color="info.main">
                {Object.entries(expenseByType).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                UGX {Object.values(expenseByType).sort((a, b) => b - a)[0]?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Expense Categories */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
            Filter by Category
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="All"
              onClick={() => setFilterType('all')}
              color={filterType === 'all' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            {expenseTypes.map((type) => (
              <Chip
                key={type}
                label={`${type.charAt(0).toUpperCase() + type.slice(1)} (UGX ${expenseByType[type].toLocaleString()})`}
                onClick={() => setFilterType(type)}
                color={filterType === type ? 'primary' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#16a34a', 0.1) }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Farm</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((expense) => {
                const farm = mockFarms.find(f => f.farm_id === expense.farm_id);
                const isHireExpense = expense.expense_type === 'animal_hire' && expense.external_animal_hire_agreement_id;
                return (
                  <TableRow key={expense.expense_id} hover>
                    <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.expense_type.replace('_', ' ')} 
                        size="small" 
                        sx={{ 
                          textTransform: 'capitalize', 
                          fontWeight: 600,
                          bgcolor: isHireExpense ? alpha('#3b82f6', 0.1) : undefined,
                          color: isHireExpense ? '#3b82f6' : undefined
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isHireExpense && <ExternalLink size={14} color="#3b82f6" />}
                        {expense.description}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>
                      UGX {expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{expense.vendor || 'N/A'}</TableCell>
                    <TableCell>{farm?.farm_name || 'N/A'}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {expense.payment_method?.replace('_', ' ') || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {isHireExpense ? (
                        <Button
                          size="small"
                          component={Link}
                          href={`/dashboard/breeding/hire-agreements?agreement=${expense.external_animal_hire_agreement_id}`}
                          sx={{ textTransform: 'none' }}
                        >
                          View Agreement
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredExpenses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <DollarSign size={64} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h6" fontWeight="600" gutterBottom>
              No expenses found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filterType === 'all' 
                ? 'Start tracking your farm expenses to optimize costs.'
                : `No expenses in category "${filterType}".`}
            </Typography>
            {filterType === 'all' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  fontWeight: 600
                }}
              >
                Record Expense
              </Button>
            )}
          </Box>
        )}
      </Card>

      {/* Create Expense Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">Record New Expense</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Expense Type"
              fullWidth
              select
              defaultValue=""
            >
              {expenseTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={2}
              placeholder="e.g., Animal feed purchase"
            />
            <TextField
              label="Amount (UGX)"
              type="number"
              fullWidth
              required
              placeholder="0"
            />
            <TextField
              label="Expense Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Farm"
              fullWidth
              select
              defaultValue=""
            >
              {mockFarms.map((farm) => (
                <MenuItem key={farm.farm_id} value={farm.farm_id}>
                  {farm.farm_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Vendor"
              fullWidth
              placeholder="e.g., Feed Suppliers Ltd"
            />
            <TextField
              label="Payment Method"
              fullWidth
              select
              defaultValue=""
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="mobile_money">Mobile Money</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
              fontWeight: 600
            }}
          >
            Record Expense
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}

