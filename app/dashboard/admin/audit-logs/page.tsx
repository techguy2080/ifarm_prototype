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
import { Search, FileSearch, Globe, Calendar, Shield } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockAuditLogs, mockTenants } from '@/lib/mockData';

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<number | 'all'>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
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

  let filteredLogs = mockAuditLogs;

  if (selectedTenant !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.tenant_id === selectedTenant);
  }

  if (selectedAction !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.action === selectedAction);
  }

  if (searchTerm) {
    filteredLogs = filteredLogs.filter(log =>
      log.user?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const actions = Array.from(new Set(mockAuditLogs.map(log => log.action)));

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
                <FileSearch size={32} color="white" strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" component="h1" sx={{ color: 'white', mb: 0.5, fontWeight: 400 }}>
                  All Audit Logs (System-Wide)
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  View audit logs across all tenants
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', color: 'white' }}>
                <Typography variant="h4" fontWeight="700">{filteredLogs.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Logs</Typography>
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
                placeholder="Search logs..."
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
                <InputLabel>Action</InputLabel>
                <Select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  {actions.map(action => (
                    <MenuItem key={action} value={action} sx={{ textTransform: 'capitalize' }}>
                      {action.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Entity Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Entity ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const tenant = mockTenants.find(t => t.tenant_id === log.tenant_id);
                    return (
                      <TableRow key={log.audit_id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} color="#16a34a" />
                            <Typography variant="body2">
                              {new Date(log.logged_at).toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {tenant ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Globe size={16} color="#16a34a" />
                              <Typography variant="body2">{tenant.organization_name}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">System</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {log.user?.first_name} {log.user?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action.replace('_', ' ')}
                            size="small"
                            icon={<Shield size={14} />}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{log.entity_type}</TableCell>
                        <TableCell>{log.entity_id || 'N/A'}</TableCell>
                        <TableCell>{log.ip_address || 'N/A'}</TableCell>
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



