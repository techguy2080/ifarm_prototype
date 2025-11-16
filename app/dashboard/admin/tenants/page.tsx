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
  alpha,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Search, MoreVertical, Globe, Users, Building2, Activity, Eye, Edit, Ban, CheckCircle, XCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockTenants, mockFarms, mockUsers, mockAnimals, mockTenantSubscriptions, mockSubscriptionPlans } from '@/lib/mockData';

export default function AllTenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
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

  const filteredTenants = mockTenants.filter(tenant =>
    tenant.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get tenant stats
  const getTenantStats = (tenantId: number) => {
    const farms = mockFarms.filter(f => f.tenant_id === tenantId);
    const users = mockUsers.filter(u => u.user_id === tenantId || tenantId === 1); // Simplified
    const animals = mockAnimals.filter(a => a.tenant_id === tenantId);
    const subscription = mockTenantSubscriptions.find(s => s.tenant_id === tenantId);
    const plan = subscription ? mockSubscriptionPlans.find(p => p.plan_id === subscription.plan_id) : null;
    
    return { farms: farms.length, users: users.length, animals: animals.length, subscription, plan };
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tenantId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenant(tenantId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTenant(null);
  };

  const handleSuspend = () => {
    // In real app, this would call an API
    setActionSuccess(`Tenant ${selectedTenant} ${mockTenantSubscriptions.find(s => s.tenant_id === selectedTenant)?.status === 'suspended' ? 'activated' : 'suspended'} successfully`);
    setSuspendDialogOpen(false);
    handleMenuClose();
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const totalTenants = mockTenants.length;
  const activeTenants = mockTenantSubscriptions.filter(s => s.status === 'active').length;
  const suspendedTenants = mockTenantSubscriptions.filter(s => s.status === 'suspended').length;
  const totalRevenue = mockTenantSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const plan = mockSubscriptionPlans.find(p => p.plan_id === s.plan_id);
      return sum + (plan?.price || 0);
    }, 0);

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
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
                <Globe size={32} color="white" strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1 }}>
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
                  All Tenants
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  System-wide tenant management and oversight
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', color: 'white' }}>
                <Typography variant="h4" fontWeight="700">
                  {totalTenants}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Tenants
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Success Alert */}
        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4
        }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: alpha('#16a34a', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={24} color="#16a34a" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                    {activeTenants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Tenants
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: alpha('#dc2626', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <XCircle size={24} color="#dc2626" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#dc2626' }}>
                    {suspendedTenants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Suspended
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: alpha('#16a34a', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={24} color="#16a34a" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                    UGX {totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: alpha('#16a34a', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={24} color="#16a34a" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                    {mockUsers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search tenants by organization name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#16a34a" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'white',
              }
            }}
          />
        </Box>

        {/* Tenants Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subscription Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Farms</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Users</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Animals</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTenants.map((tenant) => {
                    const stats = getTenantStats(tenant.tenant_id);
                    const subscription = stats.subscription;
                    const plan = stats.plan;
                    const isSuspended = subscription?.status === 'suspended';
                    
                    return (
                      <TableRow key={tenant.tenant_id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600">
                            {tenant.organization_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {tenant.tenant_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {plan ? (
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {plan.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                UGX {plan.price.toLocaleString()}/mo
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No Plan</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription?.status || 'inactive'}
                            size="small"
                            color={isSuspended ? 'error' : subscription?.status === 'active' ? 'success' : 'default'}
                            icon={isSuspended ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Building2 size={16} color="#16a34a" />
                            <Typography variant="body2" fontWeight="600">
                              {stats.farms}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Users size={16} color="#16a34a" />
                            <Typography variant="body2" fontWeight="600">
                              {stats.users}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Activity size={16} color="#16a34a" />
                            <Typography variant="body2" fontWeight="600">
                              {stats.animals}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(tenant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Eye size={16} />}
                              sx={{
                                borderColor: 'success.main',
                                color: 'success.main',
                                '&:hover': {
                                  borderColor: 'success.dark',
                                  background: alpha('#16a34a', 0.05)
                                }
                              }}
                            >
                              View
                            </Button>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, tenant.tenant_id)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                  background: alpha('#16a34a', 0.05)
                                }
                              }}
                            >
                              <MoreVertical size={16} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { handleMenuClose(); }}>
            <Eye size={16} style={{ marginRight: 8 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); }}>
            <Edit size={16} style={{ marginRight: 8 }} />
            Edit Tenant
          </MenuItem>
          <MenuItem onClick={() => {
            setSuspendDialogOpen(true);
          }}>
            {mockTenantSubscriptions.find(s => s.tenant_id === selectedTenant)?.status === 'suspended' ? (
              <>
                <CheckCircle size={16} style={{ marginRight: 8 }} />
                Activate Tenant
              </>
            ) : (
              <>
                <Ban size={16} style={{ marginRight: 8 }} />
                Suspend Tenant
              </>
            )}
          </MenuItem>
        </Menu>

        {/* Suspend/Activate Dialog */}
        <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)}>
          <DialogTitle>
            {mockTenantSubscriptions.find(s => s.tenant_id === selectedTenant)?.status === 'suspended' 
              ? 'Activate Tenant' 
              : 'Suspend Tenant'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {mockTenantSubscriptions.find(s => s.tenant_id === selectedTenant)?.status === 'suspended' ? 'activate' : 'suspend'} this tenant? 
              {mockTenantSubscriptions.find(s => s.tenant_id === selectedTenant)?.status !== 'suspended' && 
                ' This will restrict their access to the system.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSuspend} 
              variant="contained"
              color={mockTenantSubscriptions.find(s => s.tenant_id === selectedTenant)?.status === 'suspended' ? 'success' : 'error'}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}

