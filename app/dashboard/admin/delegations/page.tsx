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
import { Search, Link2, Globe, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockDelegations, mockTenants } from '@/lib/mockData';

export default function AdminDelegationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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

  let filteredDelegations = mockDelegations;

  if (selectedTenant !== 'all') {
    filteredDelegations = filteredDelegations.filter(d => d.tenant_id === selectedTenant);
  }

  if (selectedStatus !== 'all') {
    filteredDelegations = filteredDelegations.filter(d => d.status === selectedStatus);
  }

  if (searchTerm) {
    filteredDelegations = filteredDelegations.filter(d =>
      d.delegator?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.delegator?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.delegate?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.delegate?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

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
                <Link2 size={32} color="white" strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" component="h1" sx={{ color: 'white', mb: 0.5, fontWeight: 400 }}>
                  All Delegations (System-Wide)
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  View delegations across all tenants
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', color: 'white' }}>
                <Typography variant="h4" fontWeight="700">{filteredDelegations.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Delegations</Typography>
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
                placeholder="Search by delegator or delegate..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="revoked">Revoked</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Delegations Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Delegator</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Delegate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDelegations.map((delegation) => {
                    const tenant = mockTenants.find(t => t.tenant_id === delegation.tenant_id);
                    const now = new Date().getTime();
                    const endDate = new Date(delegation.end_date).getTime();
                    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <TableRow key={delegation.delegation_id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe size={16} color="#16a34a" />
                            <Typography variant="body2">{tenant?.organization_name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {delegation.delegator?.first_name} {delegation.delegator?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {delegation.delegator?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {delegation.delegate?.first_name} {delegation.delegate?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {delegation.delegate?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={delegation.delegation_type.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} color="#16a34a" />
                            <Typography variant="body2">
                              {new Date(delegation.start_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} color="#16a34a" />
                            <Typography variant="body2">
                              {new Date(delegation.end_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          {delegation.status === 'active' && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={delegation.status}
                            size="small"
                            color={
                              delegation.status === 'active' ? 'success' :
                              delegation.status === 'revoked' ? 'error' : 'default'
                            }
                            icon={
                              delegation.status === 'active' ? <CheckCircle size={14} /> :
                              delegation.status === 'revoked' ? <XCircle size={14} /> : <Clock size={14} />
                            }
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







