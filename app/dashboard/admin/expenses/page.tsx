'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  alpha,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search, TrendingDown, Globe, Calendar } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockExpenses, mockTenants } from '@/lib/mockData';

export default function AdminExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const currentUser = getCurrentUser();

  if (!currentUser || !currentUser.is_super_admin) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">Access Denied</Typography>
        </Box>
      </DashboardContainer>
    );
  }

  let filteredExpenses = mockExpenses;

  if (selectedTenant !== 'all') {
    filteredExpenses = filteredExpenses.filter(e => e.tenant_id === selectedTenant);
  }

  if (selectedType !== 'all') {
    filteredExpenses = filteredExpenses.filter(e => e.expense_type === selectedType);
  }

  if (searchTerm) {
    filteredExpenses = filteredExpenses.filter(e =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const expenseTypes = Array.from(new Set(mockExpenses.map(e => e.expense_type)));
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card sx={{ 
          mb: 5, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 4 }}>
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
                <TrendingDown size={32} color="white" strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" component="h1" sx={{ color: 'white', mb: 0.5, fontWeight: 400 }}>
                  All Expenses (System-Wide)
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  View expenses across all tenants
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', color: 'white' }}>
                <Typography variant="h4" fontWeight="700">UGX {totalExpenses.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Expenses</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#16a34a" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'white' } }}
              />
              <FormControl fullWidth>
                <InputLabel>Tenant</InputLabel>
                <Select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value as number | 'all')}
                  label="Tenant"
                >
                  <MenuItem value="all">All Tenants</MenuItem>
                  {mockTenants.map(tenant => (
                    <MenuItem key={tenant.tenant_id} value={tenant.tenant_id}>
                      {tenant.organization_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Expense Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Expense Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {expenseTypes.map(type => (
                    <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const tenant = mockTenants.find(t => t.tenant_id === expense.tenant_id);
                    return (
                      <TableRow key={expense.expense_id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} color="#16a34a" />
                            <Typography variant="body2">
                              {new Date(expense.expense_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe size={16} color="#16a34a" />
                            <Typography variant="body2">{tenant?.organization_name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {expense.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{expense.vendor || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={expense.expense_type}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="700" sx={{ color: 'success.main' }}>
                            UGX {expense.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={expense.payment_method?.replace('_', ' ') || 'N/A'}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
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







