'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  IconButton,
  Alert,
  alpha
} from '@mui/material';
import { Package, Plus, Eye, AlertTriangle, TrendingDown, DollarSign, Search } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockInventoryItems, mockFarms } from '@/lib/mockData';
import { InventoryItem } from '@/types';

export default function InventorySuppliesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [farmFilter, setFarmFilter] = useState<string>('all');
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_animals'))) {
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

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return mockInventoryItems.filter(item => {
      const matchesSearch = 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesFarm = farmFilter === 'all' || item.farm_id === Number(farmFilter);
      return matchesSearch && matchesCategory && matchesStatus && matchesFarm;
    });
  }, [searchTerm, categoryFilter, statusFilter, farmFilter]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const items = filteredItems;
    const totalItems = items.length;
    const lowStock = items.filter(i => i.status === 'low_stock').length;
    const outOfStock = items.filter(i => i.status === 'out_of_stock').length;
    const totalValue = items.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const expiringSoon = items.filter(item => {
      if (!item.expiry_date) return false;
      const expiry = new Date(item.expiry_date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;

    return { totalItems, lowStock, outOfStock, totalValue, expiringSoon };
  }, [filteredItems]);

  // Get status color
  const getStatusColor = (status: InventoryItem['status']) => {
    const colors: Record<string, string> = {
      active: '#16a34a',
      low_stock: '#f59e0b',
      out_of_stock: '#dc2626',
      expired: '#dc2626',
      discontinued: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  // Get category color
  const getCategoryColor = (category: InventoryItem['category']) => {
    const colors: Record<string, string> = {
      feed: '#16a34a',
      medication: '#3b82f6',
      equipment: '#8b5cf6',
      tools: '#f59e0b',
      supplies: '#06b6d4',
      bedding: '#84cc16',
      other: '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const tenantFarms = mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id);

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
                  <Package size={32} color="white" strokeWidth={2} />
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
                    Inventory Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Track supplies, equipment, feed, and tools
                  </Typography>
                </Box>
              </Box>
              {hasPermission(currentUser, 'create_general') && (
                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  component={Link}
                  href="/dashboard/inventory/supplies/record"
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
                  Add Item
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Box sx={{ 
          mb: 4, 
          width: '100%', 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)'
          },
          gap: 3,
          boxSizing: 'border-box'
        }}>
          {/* Card 1: Total Items */}
          <Box sx={{ width: '100%', minHeight: '200px' }}>
            <Box
              sx={{ 
                height: '100%',
                minHeight: '200px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 8px 32px ${alpha('#16a34a', 0.25)}`,
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.01)',
                  boxShadow: `0 24px 48px ${alpha('#16a34a', 0.35)}`,
                }
              }}
            >
              <Box sx={{ p: 3, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Icon */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Package size={28} color="white" strokeWidth={2.5} />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 700,
                        mb: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Total Items
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 900,
                        mb: 2,
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                        lineHeight: 1.2,
                        wordBreak: 'break-word'
                      }}
                    >
                      {summary.totalItems}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  left: -30,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Box>

          {/* Card 2: Low Stock */}
          <Box sx={{ width: '100%', minHeight: '200px' }}>
            <Box
              sx={{ 
                height: '100%',
                minHeight: '200px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 8px 32px ${alpha('#f59e0b', 0.25)}`,
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.01)',
                  boxShadow: `0 24px 48px ${alpha('#f59e0b', 0.35)}`,
                }
              }}
            >
              <Box sx={{ p: 3, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Icon */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <AlertTriangle size={28} color="white" strokeWidth={2.5} />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 700,
                        mb: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Low Stock
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 900,
                        mb: 2,
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                        lineHeight: 1.2,
                        wordBreak: 'break-word'
                      }}
                    >
                      {summary.lowStock}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  left: -30,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Box>

          {/* Card 3: Out of Stock */}
          <Box sx={{ width: '100%', minHeight: '200px' }}>
            <Box
              sx={{ 
                height: '100%',
                minHeight: '200px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 8px 32px ${alpha('#dc2626', 0.25)}`,
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.01)',
                  boxShadow: `0 24px 48px ${alpha('#dc2626', 0.35)}`,
                }
              }}
            >
              <Box sx={{ p: 3, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Icon */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TrendingDown size={28} color="white" strokeWidth={2.5} />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 700,
                        mb: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Out of Stock
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 900,
                        mb: 2,
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                        lineHeight: 1.2,
                        wordBreak: 'break-word'
                      }}
                    >
                      {summary.outOfStock}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  left: -30,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Box>

          {/* Card 4: Total Value */}
          <Box sx={{ width: '100%', minHeight: '200px' }}>
            <Box
              sx={{ 
                height: '100%',
                minHeight: '200px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 8px 32px ${alpha('#8b5cf6', 0.25)}`,
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.01)',
                  boxShadow: `0 24px 48px ${alpha('#8b5cf6', 0.35)}`,
                }
              }}
            >
              <Box sx={{ p: 3, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Icon */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <DollarSign size={28} color="white" strokeWidth={2.5} />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 700,
                        mb: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Total Value
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 900,
                        mb: 2,
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                        lineHeight: 1.2,
                        wordBreak: 'break-word'
                      }}
                    >
                      {(summary.totalValue / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      {summary.totalValue.toLocaleString()} UGX
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  left: -30,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        {(summary.lowStock > 0 || summary.outOfStock > 0 || summary.expiringSoon > 0) && (
          <Stack spacing={2} sx={{ mb: 3 }}>
            {summary.lowStock > 0 && (
              <Alert severity="warning" icon={<AlertTriangle size={20} />}>
                <Typography variant="body2" fontWeight="600">
                  {summary.lowStock} item{summary.lowStock > 1 ? 's' : ''} {summary.lowStock > 1 ? 'are' : 'is'} running low on stock
                </Typography>
              </Alert>
            )}
            {summary.outOfStock > 0 && (
              <Alert severity="error" icon={<TrendingDown size={20} />}>
                <Typography variant="body2" fontWeight="600">
                  {summary.outOfStock} item{summary.outOfStock > 1 ? 's' : ''} {summary.outOfStock > 1 ? 'are' : 'is'} out of stock
                </Typography>
              </Alert>
            )}
            {summary.expiringSoon > 0 && (
              <Alert severity="info">
                <Typography variant="body2" fontWeight="600">
                  {summary.expiringSoon} item{summary.expiringSoon > 1 ? 's' : ''} {summary.expiringSoon > 1 ? 'are' : 'is'} expiring within 30 days
                </Typography>
              </Alert>
            )}
          </Stack>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8, color: '#6b7280' }} />
              }}
              sx={{ bgcolor: 'white' }}
            />
            <TextField
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ minWidth: 150, bgcolor: 'white' }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="feed">Feed</MenuItem>
              <MenuItem value="medication">Medication</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="tools">Tools</MenuItem>
              <MenuItem value="supplies">Supplies</MenuItem>
              <MenuItem value="bedding">Bedding</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150, bgcolor: 'white' }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="low_stock">Low Stock</MenuItem>
              <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="discontinued">Discontinued</MenuItem>
            </TextField>
            <TextField
              select
              label="Farm"
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
              sx={{ minWidth: 150, bgcolor: 'white' }}
            >
              <MenuItem value="all">All Farms</MenuItem>
              {tenantFarms.map((farm) => (
                <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                  {farm.farm_name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        {/* Inventory Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Current Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Reorder Point</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Unit Cost</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Total Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No inventory items found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.current_stock <= item.reorder_point;
                  const isExpiringSoon = item.expiry_date && (() => {
                    const expiry = new Date(item.expiry_date);
                    const today = new Date();
                    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                  })();

                  return (
                    <TableRow key={item.item_id} hover>
                      <TableCell>
                        <Box>
                          <Typography fontWeight="600">{item.item_name}</Typography>
                          {item.description && (
                            <Typography variant="caption" color="text.secondary">
                              {item.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {item.item_code || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            bgcolor: alpha(getCategoryColor(item.category), 0.1),
                            color: getCategoryColor(item.category),
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {item.current_stock} {item.unit}
                          </Typography>
                          {isLowStock && (
                            <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                              Below reorder point
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.reorder_point} {item.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.unit_cost ? `${item.unit_cost.toLocaleString()} UGX` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {item.total_value ? `${item.total_value.toLocaleString()} UGX` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status.replace('_', ' ')}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(item.status), 0.1),
                            color: getStatusColor(item.status),
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                        {isExpiringSoon && (
                          <Typography variant="caption" sx={{ color: '#dc2626', display: 'block', mt: 0.5 }}>
                            Expires: {new Date(item.expiry_date!).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          sx={{ color: '#4caf50' }}
                          component={Link}
                          href={`/dashboard/inventory/supplies/${item.item_id}`}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashboardContainer>
  );
}

