'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
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
  Switch,
  FormControlLabel,
  alpha
} from '@mui/material';
import { Percent, Plus, Edit, Calendar, CheckCircle, XCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockTaxRates } from '@/lib/mockData';
import type { TaxRate } from '@/types';

export default function TaxRatesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<TaxRate | null>(null);
  const [formData, setFormData] = useState({
    tax_name: '',
    tax_code: '',
    tax_type: 'vat',
    rate_percentage: '',
    applies_to: 'all_revenue',
    calculation_method: 'exclusive',
    effective_from: '',
    effective_to: '',
    is_active: true,
    description: ''
  });
  const currentUser = getCurrentUser();

  // Check permissions
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'manage_roles'))) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTaxTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'vat': 'VAT',
      'income_tax': 'Income Tax',
      'sales_tax': 'Sales Tax',
      'withholding_tax': 'Withholding Tax',
      'custom': 'Custom'
    };
    return labels[type] || type;
  };

  const handleCreate = () => {
    setFormData({
      tax_name: '',
      tax_code: '',
      tax_type: 'vat',
      rate_percentage: '',
      applies_to: 'all_revenue',
      calculation_method: 'exclusive',
      effective_from: '',
      effective_to: '',
      is_active: true,
      description: ''
    });
    setCreateDialogOpen(true);
  };

  const handleEdit = (rate: TaxRate) => {
    setSelectedRate(rate);
    setFormData({
      tax_name: rate.tax_name,
      tax_code: rate.tax_code,
      tax_type: rate.tax_type,
      rate_percentage: rate.rate_percentage.toString(),
      applies_to: rate.applies_to,
      calculation_method: rate.calculation_method,
      effective_from: rate.effective_from,
      effective_to: rate.effective_to || '',
      is_active: rate.is_active,
      description: rate.description || ''
    });
    setEditDialogOpen(true);
  };

  const handleSubmit = () => {
    // In production, this would make an API call
    console.log('Submitting tax rate:', formData);
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
  };

  // Filter rates: show tenant-specific and system-wide (if super admin)
  const visibleRates = currentUser?.is_super_admin
    ? mockTaxRates
    : mockTaxRates.filter(r => r.tenant_id === currentUser?.tenant_id || r.is_system_default);

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
                  <Percent className="h-7 w-7 text-white" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    Tax Rates
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Manage tax rates for your organization (Uganda - URA Compliant)
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={handleCreate}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
                startIcon={<Plus className="h-4 w-4" />}
              >
                Create Tax Rate
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tax Rates Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#047857', 0.1) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Tax Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tax Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Applies To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Effective Period</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No tax rates found. Create your first tax rate.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRates.map((rate) => (
                      <TableRow key={rate.tax_rate_id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {rate.tax_name}
                        </TableCell>
                        <TableCell>
                          <Chip label={rate.tax_code} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {getTaxTypeLabel(rate.tax_type)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                          {rate.rate_percentage}%
                        </TableCell>
                        <TableCell>
                          {rate.applies_to.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </TableCell>
                        <TableCell>
                          {rate.calculation_method === 'exclusive' ? 'Exclusive' : 'Inclusive'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <Box>
                              <Typography variant="body2">
                                {formatDate(rate.effective_from)}
                              </Typography>
                              {rate.effective_to && (
                                <Typography variant="caption" color="text.secondary">
                                  to {formatDate(rate.effective_to)}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {rate.is_active ? (
                            <Chip 
                              icon={<CheckCircle className="h-3 w-3" />}
                              label="Active" 
                              size="small" 
                              color="success"
                            />
                          ) : (
                            <Chip 
                              icon={<XCircle className="h-3 w-3" />}
                              label="Inactive" 
                              size="small" 
                              color="default"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {rate.is_system_default ? (
                            <Chip label="System" size="small" color="secondary" />
                          ) : (
                            <Chip label="Tenant" size="small" color="primary" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEdit(rate)}
                            startIcon={<Edit className="h-4 w-4" />}
                            disabled={rate.is_system_default && !currentUser?.is_super_admin}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog 
          open={createDialogOpen || editDialogOpen} 
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editDialogOpen ? 'Edit Tax Rate' : 'Create Tax Rate'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Tax Name"
                value={formData.tax_name}
                onChange={(e) => setFormData({ ...formData, tax_name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Tax Code"
                value={formData.tax_code}
                onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                fullWidth
                required
                helperText="e.g., VAT-UG-18"
              />
              <TextField
                label="Tax Type"
                select
                value={formData.tax_type}
                onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="vat">VAT</MenuItem>
                <MenuItem value="income_tax">Income Tax</MenuItem>
                <MenuItem value="sales_tax">Sales Tax</MenuItem>
                <MenuItem value="withholding_tax">Withholding Tax</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </TextField>
              <TextField
                label="Rate Percentage"
                type="number"
                value={formData.rate_percentage}
                onChange={(e) => setFormData({ ...formData, rate_percentage: e.target.value })}
                fullWidth
                required
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="e.g., 18.00 for 18%"
              />
              <TextField
                label="Applies To"
                select
                value={formData.applies_to}
                onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="all_revenue">All Revenue</MenuItem>
                <MenuItem value="animal_sales">Animal Sales Only</MenuItem>
                <MenuItem value="product_sales">Product Sales Only</MenuItem>
                <MenuItem value="services">Services Only</MenuItem>
                <MenuItem value="custom">Custom Rules</MenuItem>
              </TextField>
              <TextField
                label="Calculation Method"
                select
                value={formData.calculation_method}
                onChange={(e) => setFormData({ ...formData, calculation_method: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="exclusive">Exclusive (Tax added to price)</MenuItem>
                <MenuItem value="inclusive">Inclusive (Price includes tax)</MenuItem>
              </TextField>
              <TextField
                label="Effective From"
                type="date"
                value={formData.effective_from}
                onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Effective To (Optional)"
                type="date"
                value={formData.effective_to}
                onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for ongoing rate"
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editDialogOpen ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}


