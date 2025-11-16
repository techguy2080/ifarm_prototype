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
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import { Search, Plus, Eye, DollarSign, Calendar, User, CreditCard } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimalSales, mockProductSales, mockAnimals, mockFarms } from '@/lib/mockData';

export default function HelperSalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [saleType, setSaleType] = useState<'all' | 'animal' | 'product'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saleFormType, setSaleFormType] = useState<'animal' | 'product'>('animal');
  const [saleFormData, setSaleFormData] = useState<any>({
    sale_type: 'animal',
    animal_id: '',
    product_type: '',
    farm_id: '',
    quantity: '',
    unit: 'liters',
    unit_price: '',
    sale_date: '',
    sale_type_detail: 'direct',
    customer_name: '',
    customer_contact: '',
    sale_price: '',
    payment_method: 'cash',
    payment_status: 'pending',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_financial_reports'))) {
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

  const allSales = [
    ...mockAnimalSales.map(sale => ({
      ...sale,
      sale_type: 'animal' as const,
      product_type: null,
      quantity: null,
      unit: null,
      display_name: `Animal Sale - ${sale.animal?.tag_number || 'N/A'}`,
      amount: sale.sale_price
    })),
    ...mockProductSales.map(sale => ({
      ...sale,
      sale_type: 'product' as const,
      animal_id: sale.animal_id || null,
      display_name: `${sale.product_type} - ${sale.quantity} ${sale.unit}`,
      amount: sale.total_amount
    }))
  ];

  const filteredSales = allSales.filter(sale => {
    const matchesSearch = 
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = saleType === 'all' || sale.sale_type === saleType;
    return matchesSearch && matchesType;
  });


  const getFarmName = (farmId: number) => {
    const farm = mockFarms.find(f => f.farm_id === farmId);
    return farm?.farm_name || 'Unknown Farm';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleFormType === 'animal') {
      if (!saleFormData.animal_id || !saleFormData.sale_date || !saleFormData.sale_price) {
        alert('Please fill in all required fields for animal sale');
        return;
      }
    } else {
      if (!saleFormData.product_type || !saleFormData.farm_id || !saleFormData.quantity || !saleFormData.unit_price || !saleFormData.sale_date) {
        alert('Please fill in all required fields for product sale');
        return;
      }
    }

    setSubmitting(true);
    setTimeout(() => {
      alert(`${saleFormType === 'animal' ? 'Animal' : 'Product'} sale would be recorded! (Prototype)`);
      setSubmitting(false);
      setCreateDialogOpen(false);
      setSaleFormData({
        sale_type: 'animal',
        animal_id: '',
        product_type: '',
        farm_id: '',
        quantity: '',
        unit: 'liters',
        unit_price: '',
        sale_date: '',
        sale_type_detail: 'direct',
        customer_name: '',
        customer_contact: '',
        sale_price: '',
        payment_method: 'cash',
        payment_status: 'pending',
        notes: ''
      });
      setSaleFormType('animal');
    }, 500);
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
                    Sales Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Track and manage all sales transactions
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                  },
                  px: 3,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Record Sale
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by customer name or sale details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'white' }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant={saleType === 'all' ? 'contained' : 'outlined'}
                onClick={() => setSaleType('all')}
                sx={{
                  bgcolor: saleType === 'all' ? '#4caf50' : 'transparent',
                  color: saleType === 'all' ? 'white' : '#2d5016',
                  borderColor: '#4caf50',
                  '&:hover': { bgcolor: saleType === 'all' ? '#45a049' : '#e8f5e9' }
                }}
              >
                All
              </Button>
              <Button
                variant={saleType === 'animal' ? 'contained' : 'outlined'}
                onClick={() => setSaleType('animal')}
                sx={{
                  bgcolor: saleType === 'animal' ? '#4caf50' : 'transparent',
                  color: saleType === 'animal' ? 'white' : '#2d5016',
                  borderColor: '#4caf50',
                  '&:hover': { bgcolor: saleType === 'animal' ? '#45a049' : '#e8f5e9' }
                }}
              >
                Animals
              </Button>
              <Button
                variant={saleType === 'product' ? 'contained' : 'outlined'}
                onClick={() => setSaleType('product')}
                sx={{
                  bgcolor: saleType === 'product' ? '#4caf50' : 'transparent',
                  color: saleType === 'product' ? 'white' : '#2d5016',
                  borderColor: '#4caf50',
                  '&:hover': { bgcolor: saleType === 'product' ? '#45a049' : '#e8f5e9' }
                }}
              >
                Products
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Sales Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Farm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No sales found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={14} />
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.sale_type === 'animal' ? 'Animal' : 'Product'} 
                        size="small"
                        sx={{ 
                          bgcolor: sale.sale_type === 'animal' ? '#e3f2fd' : '#fff3e0',
                          color: sale.sale_type === 'animal' ? '#1976d2' : '#e65100'
                        }}
                      />
                    </TableCell>
                    <TableCell>{sale.display_name}</TableCell>
                    <TableCell>
                      {sale.customer_name ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <User size={14} />
                          {sale.customer_name}
                        </Box>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{getFarmName(sale.farm_id)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold', color: '#2d5016' }}>
                        <DollarSign size={14} />
                        {formatCurrency(sale.amount)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {sale.payment_method && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CreditCard size={14} />
                          {sale.payment_method.replace('_', ' ')}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.payment_status} 
                        size="small"
                        sx={{ 
                          bgcolor: sale.payment_status === 'paid' ? '#c8e6c9' : '#ffcdd2',
                          color: sale.payment_status === 'paid' ? '#2d5016' : '#c62828'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#4caf50' }}
                        component={Link}
                        href={`/dashboard/helper/sales/${sale.sale_type === 'animal' ? sale.sale_id : sale.product_sale_id}`}
                      >
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Record Sale Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setSaleFormData({
            sale_type: 'animal',
            animal_id: '',
            product_type: '',
            farm_id: '',
            quantity: '',
            unit: 'liters',
            unit_price: '',
            sale_date: '',
            sale_type_detail: 'direct',
            customer_name: '',
            customer_contact: '',
            sale_price: '',
            payment_method: 'cash',
            payment_status: 'pending',
            notes: ''
          });
          setSaleFormType('animal');
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateSale}>
          <DialogTitle>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>Record Sale</Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Sale Type"
                fullWidth
                select
                required
                value={saleFormType}
                onChange={(e) => {
                  setSaleFormType(e.target.value as 'animal' | 'product');
                  setSaleFormData({ ...saleFormData, sale_type: e.target.value });
                }}
              >
                <MenuItem value="animal">Animal Sale</MenuItem>
                <MenuItem value="product">Product Sale</MenuItem>
              </TextField>
            
            {saleFormType === 'animal' ? (
              <>
                <TextField
                  label="Animal"
                  fullWidth
                  select
                  required
                  value={saleFormData.animal_id}
                  onChange={(e) => setSaleFormData({ ...saleFormData, animal_id: e.target.value })}
                >
                  {mockAnimals.filter(a => a.status === 'active' && a.tenant_id === currentUser?.tenant_id).map((animal) => (
                    <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                      {animal.tag_number} - {animal.animal_type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Sale Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={saleFormData.sale_date}
                  onChange={(e) => setSaleFormData({ ...saleFormData, sale_date: e.target.value })}
                />
                <TextField
                  label="Sale Type"
                  fullWidth
                  select
                  value={saleFormData.sale_type_detail}
                  onChange={(e) => setSaleFormData({ ...saleFormData, sale_type_detail: e.target.value })}
                >
                  <MenuItem value="direct">Direct</MenuItem>
                  <MenuItem value="auction">Auction</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                </TextField>
                <TextField
                  label="Customer Name"
                  fullWidth
                  placeholder="e.g., Local Market"
                  value={saleFormData.customer_name}
                  onChange={(e) => setSaleFormData({ ...saleFormData, customer_name: e.target.value })}
                />
                <TextField
                  label="Customer Contact"
                  fullWidth
                  placeholder="Phone or email"
                  value={saleFormData.customer_contact}
                  onChange={(e) => setSaleFormData({ ...saleFormData, customer_contact: e.target.value })}
                />
                <TextField
                  label="Sale Price (UGX)"
                  type="number"
                  fullWidth
                  required
                  placeholder="0"
                  value={saleFormData.sale_price}
                  onChange={(e) => setSaleFormData({ ...saleFormData, sale_price: e.target.value })}
                />
                <TextField
                  label="Payment Method"
                  fullWidth
                  select
                  value={saleFormData.payment_method}
                  onChange={(e) => setSaleFormData({ ...saleFormData, payment_method: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                </TextField>
                <TextField
                  label="Payment Status"
                  fullWidth
                  select
                  value={saleFormData.payment_status}
                  onChange={(e) => setSaleFormData({ ...saleFormData, payment_status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </TextField>
              </>
            ) : (
              <>
                <TextField
                  label="Product Type"
                  fullWidth
                  select
                  required
                  value={saleFormData.product_type}
                  onChange={(e) => setSaleFormData({ ...saleFormData, product_type: e.target.value })}
                >
                  <MenuItem value="milk">Milk</MenuItem>
                  <MenuItem value="eggs">Eggs</MenuItem>
                  <MenuItem value="wool">Wool</MenuItem>
                  <MenuItem value="honey">Honey</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                  label="Farm"
                  fullWidth
                  select
                  required
                  value={saleFormData.farm_id}
                  onChange={(e) => setSaleFormData({ ...saleFormData, farm_id: e.target.value })}
                >
                  {mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id).map((farm) => (
                    <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                      {farm.farm_name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Animal (Optional)"
                  fullWidth
                  select
                  value={saleFormData.animal_id || ''}
                  onChange={(e) => setSaleFormData({ ...saleFormData, animal_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {mockAnimals.filter(a => a.tenant_id === currentUser?.tenant_id).map((animal) => (
                    <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                      {animal.tag_number}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  required
                  placeholder="0"
                  value={saleFormData.quantity}
                  onChange={(e) => setSaleFormData({ ...saleFormData, quantity: e.target.value })}
                />
                <TextField
                  label="Unit"
                  fullWidth
                  select
                  value={saleFormData.unit}
                  onChange={(e) => setSaleFormData({ ...saleFormData, unit: e.target.value })}
                >
                  <MenuItem value="liters">Liters</MenuItem>
                  <MenuItem value="pieces">Pieces</MenuItem>
                  <MenuItem value="kg">Kilograms</MenuItem>
                </TextField>
                <TextField
                  label="Unit Price (UGX)"
                  type="number"
                  fullWidth
                  required
                  placeholder="0"
                  value={saleFormData.unit_price}
                  onChange={(e) => setSaleFormData({ ...saleFormData, unit_price: e.target.value })}
                />
                <TextField
                  label="Sale Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={saleFormData.sale_date}
                  onChange={(e) => setSaleFormData({ ...saleFormData, sale_date: e.target.value })}
                />
                <TextField
                  label="Customer Name"
                  fullWidth
                  placeholder="e.g., Dairy Co-op"
                  value={saleFormData.customer_name}
                  onChange={(e) => setSaleFormData({ ...saleFormData, customer_name: e.target.value })}
                />
                <TextField
                  label="Payment Method"
                  fullWidth
                  select
                  value={saleFormData.payment_method}
                  onChange={(e) => setSaleFormData({ ...saleFormData, payment_method: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                </TextField>
                <TextField
                  label="Payment Status"
                  fullWidth
                  select
                  value={saleFormData.payment_status}
                  onChange={(e) => setSaleFormData({ ...saleFormData, payment_status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </TextField>
              </>
            )}
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              placeholder="Additional information..."
              value={saleFormData.notes}
              onChange={(e) => setSaleFormData({ ...saleFormData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setCreateDialogOpen(false);
              setSaleFormData({
                sale_type: 'animal',
                animal_id: '',
                product_type: '',
                farm_id: '',
                quantity: '',
                unit: 'liters',
                unit_price: '',
                sale_date: '',
                sale_type_detail: 'direct',
                customer_name: '',
                customer_contact: '',
                sale_price: '',
                payment_method: 'cash',
                payment_status: 'pending',
                notes: ''
              });
              setSaleFormType('animal');
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
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#45a049' },
              fontWeight: 600
            }}
          >
            {submitting ? 'Recording...' : 'Record Sale'}
          </Button>
        </DialogActions>
        </form>
      </Dialog>
    </DashboardContainer>
  );
}

