'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Grid,
  alpha
} from '@mui/material';
import { Package, TrendingUp, Users, DollarSign, Heart } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals, mockBreedingRecords, mockFarms } from '@/lib/mockData';
import { Animal } from '@/types';

export default function InventoryPage() {
  const [filterFarm, setFilterFarm] = useState<string>('all');
  const [filterAnimalType, setFilterAnimalType] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
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

  // Filter animals
  const filteredAnimals = useMemo(() => {
    return mockAnimals.filter(animal => {
      const matchesFarm = filterFarm === 'all' || animal.farm_id === Number(filterFarm);
      const matchesType = filterAnimalType === 'all' || animal.animal_type === filterAnimalType;
      const matchesStatus = filterStatus === 'all' || animal.status === filterStatus;
      
      // Age group calculation
      let ageGroup = '';
      if (animal.birth_date) {
        const birth = new Date(animal.birth_date);
        const today = new Date();
        const ageYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (ageYears < 1) ageGroup = 'young';
        else if (ageYears <= 5) ageGroup = 'adult';
        else ageGroup = 'senior';
      }
      const matchesAge = filterAgeGroup === 'all' || ageGroup === filterAgeGroup;
      
      return matchesFarm && matchesType && matchesStatus && matchesAge;
    });
  }, [filterFarm, filterAnimalType, filterAgeGroup, filterStatus]);

  // Calculate inventory summary
  const inventorySummary = useMemo(() => {
    const animals = filteredAnimals;
    const today = new Date();
    
    // Animals by type
    const byType = {
      cattle: animals.filter(a => a.animal_type === 'cattle').length,
      goat: animals.filter(a => a.animal_type === 'goat').length,
      sheep: animals.filter(a => a.animal_type === 'sheep').length,
      pig: animals.filter(a => a.animal_type === 'pig').length,
      other: animals.filter(a => !['cattle', 'goat', 'sheep', 'pig'].includes(a.animal_type)).length,
    };
    
    // Animals by status
    const byStatus = {
      active: animals.filter(a => a.status === 'active').length,
      sold: animals.filter(a => a.status === 'sold').length,
      deceased: animals.filter(a => a.status === 'deceased').length,
      disposed: animals.filter(a => a.status === 'disposed').length,
    };
    
    // Animals by age group
    const byAge = {
      young: 0,
      adult: 0,
      senior: 0,
    };
    animals.forEach(animal => {
      if (animal.birth_date) {
        const birth = new Date(animal.birth_date);
        const ageYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (ageYears < 1) byAge.young++;
        else if (ageYears <= 5) byAge.adult++;
        else byAge.senior++;
      }
    });
    
    // Reproductive status
    const females = animals.filter(a => a.gender === 'female' && a.status === 'active');
    const breedingAgeFemales = females.filter(a => {
      if (!a.birth_date) return false;
      const birth = new Date(a.birth_date);
      const ageYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return ageYears >= 1; // Breeding age typically 1+ years
    });
    
    const pregnant = mockBreedingRecords.filter(r => {
      const record = mockBreedingRecords.find(br => br.animal_id === r.animal_id);
      return record && (record.pregnancy_status === 'confirmed' || record.pregnancy_status === 'suspected') && 
             record.expected_due_date && new Date(record.expected_due_date) > today;
    }).length;
    
    const lactating = females.length; // Simplified - would check actual lactation status
    const availableForBreeding = breedingAgeFemales.length - pregnant;
    
    return {
      total_animals: animals.length,
      animals_by_type: byType,
      animals_by_status: byStatus,
      animals_by_age_group: byAge,
      reproductive_status: {
        breeding_age_females: breedingAgeFemales.length,
        pregnant,
        lactating,
        available_for_breeding: Math.max(0, availableForBreeding),
      },
      available_for_sale: animals.filter(a => a.status === 'active').length, // Simplified
    };
  }, [filteredAnimals]);

  // Get available for sale animals
  const availableForSale = useMemo(() => {
    return filteredAnimals.filter(a => a.status === 'active');
  }, [filteredAnimals]);

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: { xs: 48, sm: 56 }, 
                height: { xs: 48, sm: 56 }, 
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
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{
                    color: 'white',
                    mb: 0.5,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  Inventory Management
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)', 
                  fontWeight: 400,
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                }}>
                  Track available animals, age distribution, reproductive status, and sales inventory
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Farm"
                value={filterFarm}
                onChange={(e) => setFilterFarm(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Farms</MenuItem>
                {mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id).map((farm) => (
                  <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                    {farm.farm_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Animal Type"
                value={filterAnimalType}
                onChange={(e) => setFilterAnimalType(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="cattle">Cattle</MenuItem>
                <MenuItem value="goat">Goat</MenuItem>
                <MenuItem value="sheep">Sheep</MenuItem>
                <MenuItem value="pig">Pig</MenuItem>
              </TextField>
              <TextField
                select
                label="Age Group"
                value={filterAgeGroup}
                onChange={(e) => setFilterAgeGroup(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="young">Young (&lt;1 year)</MenuItem>
                <MenuItem value="adult">Adult (1-5 years)</MenuItem>
                <MenuItem value="senior">Senior (&gt;5 years)</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
                <MenuItem value="deceased">Deceased</MenuItem>
                <MenuItem value="disposed">Disposed</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Animals by Type Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Animals by Type
                </Typography>
                {Object.values(inventorySummary.animals_by_type).some(count => count > 0) ? (
                  <Box sx={{ mt: 3 }}>
                    {/* Pie Chart */}
                    <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', mb: 3 }}>
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        {(() => {
                          const total = Object.values(inventorySummary.animals_by_type).reduce((sum, c) => sum + c, 0);
                          const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
                          const entries = Object.entries(inventorySummary.animals_by_type).filter(([_, count]) => count > 0);
                          let currentAngle = -90;
                          return entries.map(([type, count], idx) => {
                            const percent = total > 0 ? (count / total) * 100 : 0;
                            const angle = (percent / 100) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            currentAngle = endAngle;
                            
                            const startAngleRad = (startAngle * Math.PI) / 180;
                            const endAngleRad = (endAngle * Math.PI) / 180;
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            const x1 = 100 + 80 * Math.cos(startAngleRad);
                            const y1 = 100 + 80 * Math.sin(startAngleRad);
                            const x2 = 100 + 80 * Math.cos(endAngleRad);
                            const y2 = 100 + 80 * Math.sin(endAngleRad);
                            
                            const pathData = [
                              `M 100 100`,
                              `L ${x1} ${y1}`,
                              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `Z`
                            ].join(' ');
                            
                            return (
                              <path
                                key={type}
                                d={pathData}
                                fill={colors[idx % colors.length]}
                                stroke="white"
                                strokeWidth="2"
                                style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              />
                            );
                          });
                        })()}
                        <circle cx="100" cy="100" r="50" fill="white" />
                        <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill="#16a34a">
                          {inventorySummary.total_animals}
                        </text>
                        <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6b7280">
                          Total
                        </text>
                      </svg>
                    </Box>
                    
                    {/* Legend */}
                    <Stack spacing={1.5}>
                      {Object.entries(inventorySummary.animals_by_type)
                        .filter(([_, count]) => count > 0)
                        .map(([type, count], idx) => {
                        const total = Object.values(inventorySummary.animals_by_type).reduce((sum, c) => sum + c, 0);
                        const percent = total > 0 ? (count / total) * 100 : 0;
                        const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
                        return (
                          <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%',
                              bgcolor: colors[idx % colors.length],
                              flexShrink: 0
                            }} />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                  {type}
                                </Typography>
                                <Typography variant="body2" fontWeight="700" sx={{ color: '#16a34a' }}>
                                  {count}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {percent.toFixed(1)}% of total
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No animals found
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Age Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Age Distribution
                </Typography>
                <Box sx={{ mt: 3, height: 250 }}>
                  {Object.values(inventorySummary.animals_by_age_group).some(count => count > 0) ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-end', 
                      justifyContent: 'space-around',
                      height: '100%',
                      gap: 2,
                      px: 2
                    }}>
                      {Object.entries(inventorySummary.animals_by_age_group).map(([group, count]) => {
                        const maxCount = Math.max(...Object.values(inventorySummary.animals_by_age_group));
                        const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        const colors: Record<string, string> = {
                          young: '#06b6d4',
                          adult: '#16a34a',
                          senior: '#f59e0b'
                        };
                        return (
                          <Box key={group} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 100 }}>
                            <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  width: '100%',
                                  height: `${Math.max(heightPercent, 3)}%`,
                                  bgcolor: colors[group] || '#6b7280',
                                  borderRadius: '8px 8px 0 0',
                                  minHeight: '30px',
                                  transition: 'all 0.3s',
                                  boxShadow: `0 2px 8px ${alpha(colors[group] || '#6b7280', 0.3)}`,
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 4px 12px ${alpha(colors[group] || '#6b7280', 0.5)}`,
                                  }
                                }}
                                title={`${count} ${group} animals`}
                              >
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: -25, 
                                  left: '50%', 
                                  transform: 'translateX(-50%)',
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  color: colors[group] || '#6b7280'
                                }}>
                                  {count}
                                </Box>
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', textTransform: 'capitalize' }}>
                              {group === 'young' ? '<1 year' : group === 'adult' ? '1-5 years' : '>5 years'}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No age data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Status Overview */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Status Overview
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Count</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(inventorySummary.animals_by_status).map(([status, count]) => {
                        const total = inventorySummary.total_animals;
                        const percent = total > 0 ? (count / total) * 100 : 0;
                        const colors: Record<string, string> = {
                          active: '#16a34a',
                          sold: '#f59e0b',
                          deceased: '#dc2626',
                          disposed: '#6b7280'
                        };
                        return (
                          <TableRow key={status}>
                            <TableCell>
                              <Chip
                                label={status}
                                size="small"
                                sx={{
                                  bgcolor: alpha(colors[status] || '#6b7280', 0.1),
                                  color: colors[status] || '#6b7280',
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="700">
                                {count}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ 
                                  flex: 1, 
                                  height: 8, 
                                  bgcolor: alpha(colors[status] || '#6b7280', 0.1),
                                  borderRadius: 1,
                                  overflow: 'hidden'
                                }}>
                                  <Box sx={{ 
                                    width: `${percent}%`, 
                                    height: '100%', 
                                    bgcolor: colors[status] || '#6b7280',
                                    transition: 'width 0.3s'
                                  }} />
                                </Box>
                                <Typography variant="caption" fontWeight="600">
                                  {percent.toFixed(1)}%
                                </Typography>
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
          </Grid>

          {/* Reproductive Status */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Reproductive Status
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#8b5cf6', 0.1), borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="600">Breeding Age Females</Typography>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#8b5cf6' }}>
                      {inventorySummary.reproductive_status.breeding_age_females}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="600">Currently Pregnant</Typography>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#f59e0b' }}>
                      {inventorySummary.reproductive_status.pregnant}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#3b82f6', 0.1), borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="600">Lactating</Typography>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#3b82f6' }}>
                      {inventorySummary.reproductive_status.lactating}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#16a34a', 0.1), borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="600">Available for Breeding</Typography>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#16a34a' }}>
                      {inventorySummary.reproductive_status.available_for_breeding}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Available for Sale Table */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Available for Sale
                </Typography>
                <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha('#16a34a', 0.05) }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Tag Number</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Breed</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Age</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Weight</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Farm</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableForSale.length > 0 ? (
                        availableForSale.map((animal) => {
                          const farm = mockFarms.find(f => f.farm_id === animal.farm_id);
                          let age = 'Unknown';
                          if (animal.birth_date) {
                            const birth = new Date(animal.birth_date);
                            const today = new Date();
                            const ageYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365);
                            if (ageYears < 1) {
                              const ageMonths = Math.floor(ageYears * 12);
                              age = `${ageMonths} months`;
                            } else {
                              age = `${Math.floor(ageYears)} years`;
                            }
                          }
                          return (
                            <TableRow key={animal.animal_id} hover>
                              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{animal.tag_number}</TableCell>
                              <TableCell sx={{ textTransform: 'capitalize', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{animal.animal_type}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>{animal.breed || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{age}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{animal.current_weight ? `${animal.current_weight} kg` : 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>{farm?.farm_name || 'Unknown'}</TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Chip
                                  label={animal.status}
                                  size="small"
                                  color="success"
                                  sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No animals available for sale
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardContainer>
  );
}


