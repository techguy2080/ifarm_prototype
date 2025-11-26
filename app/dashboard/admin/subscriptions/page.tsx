'use client';

import { useState } from 'react';
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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search, DollarSign, CheckCircle, XCircle, Edit, Plus, Calendar } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockTenants, mockTenantSubscriptions, mockSubscriptionPlans } from '@/lib/mockData';

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);
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

  const filteredSubscriptions = mockTenantSubscriptions.filter(sub => {
    const tenant = mockTenants.find(t => t.tenant_id === sub.tenant_id);
    return tenant?.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleSubscription = (tenantId: number, currentStatus: string) => {
    setSelectedSubscription(tenantId);
    if (currentStatus === 'active') {
      setDisableDialogOpen(true);
    } else {
      setEnableDialogOpen(true);
    }
  };

  const handleConfirmToggle = () => {
    const sub = mockTenantSubscriptions.find(s => s.tenant_id === selectedSubscription);
    const action = sub?.status === 'active' ? 'disabled' : 'enabled';
    setActionSuccess(`Subscription ${action} successfully`);
    setEnableDialogOpen(false);
    setDisableDialogOpen(false);
    setSelectedSubscription(null);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const totalRevenue = mockTenantSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const plan = mockSubscriptionPlans.find(p => p.plan_id === s.plan_id);
      return sum + (plan?.price || 0);
    }, 0);

  const activeSubscriptions = mockTenantSubscriptions.filter(s => s.status === 'active').length;
  const overdueSubscriptions = mockTenantSubscriptions.filter(s => s.payment_status === 'overdue').length;

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
                <DollarSign size={32} color="white" strokeWidth={2} />
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
                  Subscription Management
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Manage tenant subscriptions, plans, and billing
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', color: 'white' }}>
                <Typography variant="h4" fontWeight="700">
                  UGX {totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Monthly Recurring Revenue
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
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
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
                    {activeSubscriptions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Subscriptions
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
                    {overdueSubscriptions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Payments
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
                  <DollarSign size={24} color="#16a34a" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                    {mockSubscriptionPlans.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Plans
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
            placeholder="Search subscriptions by tenant name..."
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

        {/* Subscriptions Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Auto Renew</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => {
                    const tenant = mockTenants.find(t => t.tenant_id === subscription.tenant_id);
                    const plan = mockSubscriptionPlans.find(p => p.plan_id === subscription.plan_id);
                    
                    return (
                      <TableRow key={subscription.tenant_id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600">
                            {tenant?.organization_name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tenant ID: {subscription.tenant_id}
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
                            label={subscription.status}
                            size="small"
                            color={subscription.status === 'active' ? 'success' : 'error'}
                            icon={subscription.status === 'active' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription.payment_status}
                            size="small"
                            color={subscription.payment_status === 'current' ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.start_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription.auto_renew ? 'Yes' : 'No'}
                            size="small"
                            color={subscription.auto_renew ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Switch
                              checked={subscription.status === 'active'}
                              onChange={() => handleToggleSubscription(subscription.tenant_id, subscription.status)}
                              color="success"
                              size="small"
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Edit size={14} />}
                              sx={{
                                borderColor: 'success.main',
                                color: 'success.main',
                                '&:hover': {
                                  borderColor: 'success.dark',
                                  background: alpha('#16a34a', 0.05)
                                }
                              }}
                            >
                              Edit
                            </Button>
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

        {/* Enable Dialog */}
        <Dialog open={enableDialogOpen} onClose={() => setEnableDialogOpen(false)}>
          <DialogTitle>Enable Subscription</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to enable this subscription? The tenant will regain full access to the system.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnableDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmToggle} variant="contained" color="success">
              Enable
            </Button>
          </DialogActions>
        </Dialog>

        {/* Disable Dialog */}
        <Dialog open={disableDialogOpen} onClose={() => setDisableDialogOpen(false)}>
          <DialogTitle>Disable Subscription</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to disable this subscription? The tenant will lose access to the system until reactivated.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisableDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmToggle} variant="contained" color="error">
              Disable
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}










