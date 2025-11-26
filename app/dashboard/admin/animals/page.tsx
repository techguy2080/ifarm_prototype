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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search, Filter, Activity, Building2, Globe } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockAnimals, mockTenants, mockFarms } from '@/lib/mockData';

export default function AdminAnimalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<number | 'all'>('all');
  const [selectedFarm, setSelectedFarm] = useState<number | 'all'>('all');
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

  // Filter animals
  let filteredAnimals = mockAnimals;

  if (selectedTenant !== 'all') {
    filteredAnimals = filteredAnimals.filter(a => a.tenant_id === selectedTenant);
  }

  if (selectedFarm !== 'all') {
    filteredAnimals = filteredAnimals.filter(a => a.farm_id === selectedFarm);
  }

  if (selectedType !== 'all') {
    filteredAnimals = filteredAnimals.filter(a => a.animal_type === selectedType);
  }

  if (searchTerm) {
    filteredAnimals = filteredAnimals.filter(a =>
      a.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.breed.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const animalTypes = Array.from(new Set(mockAnimals.map(a => a.animal_type)));
  const farmsByTenant = selectedTenant !== 'all' 
    ? mockFarms.filter(f => f.tenant_id === selectedTenant)
    : mockFarms;

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
                <Activity size={32} color="white" strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" component="h1" sx={{ color: 'white', mb: 0.5, fontWeight: 400 }}>
                  All Animals (System-Wide)
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  View and manage animals across all tenants
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', color: 'white' }}>
                <Typography variant="h4" fontWeight="700">{filteredAnimals.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Animals</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Search by tag or breed..."
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
                  onChange={(e) => {
                    setSelectedTenant(e.target.value as number | 'all');
                    setSelectedFarm('all');
                  }}
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
                <InputLabel>Farm</InputLabel>
                <Select
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value as number | 'all')}
                  label="Farm"
                  disabled={selectedTenant === 'all'}
                >
                  <MenuItem value="all">All Farms</MenuItem>
                  {farmsByTenant.map(farm => (
                    <MenuItem key={farm.farm_id} value={farm.farm_id}>
                      {farm.farm_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Animal Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Animal Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {animalTypes.map(type => (
                    <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Animals Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Tag Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Farm</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Breed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Health Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Birth Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAnimals.map((animal) => {
                    const tenant = mockTenants.find(t => t.tenant_id === animal.tenant_id);
                    const farm = mockFarms.find(f => f.farm_id === animal.farm_id);
                    return (
                      <TableRow key={animal.animal_id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600">
                            {animal.tag_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe size={16} color="#16a34a" />
                            <Typography variant="body2">{tenant?.organization_name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Building2 size={16} color="#16a34a" />
                            <Typography variant="body2">{farm?.farm_name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{animal.animal_type}</TableCell>
                        <TableCell>{animal.breed}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{animal.gender}</TableCell>
                        <TableCell>
                          <Chip
                            label={animal.health_status}
                            size="small"
                            color={animal.health_status === 'healthy' ? 'success' : 'error'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{new Date(animal.birth_date).toLocaleDateString()}</TableCell>
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










