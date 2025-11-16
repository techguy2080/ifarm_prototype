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
  IconButton
} from '@mui/material';
import { Search, Edit, Eye, MapPin, Building2, Beef } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockFarms, mockAnimals } from '@/lib/mockData';

export default function HelperFarmsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_animals'))) {
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

  // Helpers can only manage farms in their tenant (created by owner)
  const tenantFarms = mockFarms.filter(farm => farm.tenant_id === currentUser?.tenant_id);
  
  const filteredFarms = tenantFarms.filter(farm =>
    farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFarmAnimalCount = (farmId: number) => {
    return mockAnimals.filter(a => a.farm_id === farmId && a.status === 'active').length;
  };

  const getFarmAnimalTypes = (farmId: number) => {
    const types = new Set(mockAnimals.filter(a => a.farm_id === farmId).map(a => a.animal_type));
    return Array.from(types);
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <Building2 size={32} color="white" strokeWidth={2} />
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
                  Farm Management
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Manage farms created by the owner
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <TextField
            fullWidth
            placeholder="Search by farm name, location, or district..."
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
        </Paper>

        {/* Farms Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Farm Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>District</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animals</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animal Types</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFarms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No farms found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFarms.map((farm) => {
                  const animalCount = getFarmAnimalCount(farm.farm_id);
                  const animalTypes = getFarmAnimalTypes(farm.farm_id);
                  return (
                    <TableRow key={farm.farm_id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Building2 size={16} />
                          <Typography fontWeight="medium">{farm.farm_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MapPin size={14} />
                          {farm.location}
                        </Box>
                      </TableCell>
                      <TableCell>{farm.district}</TableCell>
                      <TableCell>
                        <Chip 
                          label={farm.farm_type} 
                          size="small"
                          sx={{ bgcolor: '#c8e6c9', color: '#2d5016', textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Beef size={14} />
                          {animalCount}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {animalTypes.slice(0, 2).map(type => (
                            <Chip 
                              key={type}
                              label={type} 
                              size="small"
                              sx={{ bgcolor: '#e8f5e9', color: '#2d5016', fontSize: '0.7rem' }}
                            />
                          ))}
                          {animalTypes.length > 2 && (
                            <Chip 
                              label={`+${animalTypes.length - 2}`} 
                              size="small"
                              sx={{ bgcolor: '#f5f5f5', color: '#666', fontSize: '0.7rem' }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={farm.status} 
                          size="small"
                          sx={{ 
                            bgcolor: farm.status === 'active' ? '#c8e6c9' : '#ffcdd2',
                            color: farm.status === 'active' ? '#2d5016' : '#c62828',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            size="small" 
                            sx={{ color: '#4caf50' }}
                            component={Link}
                            href={`/dashboard/helper/farms/${farm.farm_id}`}
                          >
                            <Eye size={16} />
                          </IconButton>
                          {hasPermission(currentUser, 'edit_animals') && (
                            <IconButton 
                              size="small" 
                              sx={{ color: '#4caf50' }}
                              component={Link}
                              href={`/dashboard/helper/farms/${farm.farm_id}/edit`}
                            >
                              <Edit size={16} />
                            </IconButton>
                          )}
                        </Stack>
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

