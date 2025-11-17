'use client';

import { useState, useMemo } from 'react';
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
  Grid,
  MenuItem
} from '@mui/material';
import { Search, Plus, Eye, Calendar, Heart, ExternalLink, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { 
  mockAnimals, 
  mockFarms, 
  mockBreedingRecords, 
  mockExternalFarms,
  mockExternalAnimals,
  mockExternalAnimalHireAgreements
} from '@/lib/mockData';
import { BreedingRecord } from '@/types';

export default function ExternalBreedingPage() {
  const [searchTerm, setSearchTerm] = useState('');
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
        </Box>
      </DashboardContainer>
    );
  }

  // Filter external breeding records
  const externalRecords = useMemo(() => {
    return mockBreedingRecords
      .filter(r => r.sire_source === 'external')
      .map(record => ({
        ...record,
        animal: mockAnimals.find(a => a.animal_id === record.animal_id),
        externalAnimal: record.external_animal_id 
          ? mockExternalAnimals.find(a => a.external_animal_id === record.external_animal_id)
          : null,
        externalFarm: record.external_farm_name
          ? mockExternalFarms.find(f => f.farm_name === record.external_farm_name)
          : null,
        hireAgreement: record.external_animal_hire_agreement_id
          ? mockExternalAnimalHireAgreements.find(a => a.agreement_id === record.external_animal_hire_agreement_id)
          : null
      }));
  }, []);

  const filteredRecords = useMemo(() => {
    return externalRecords.filter(record => {
      const matchesSearch = 
        record.animal?.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.external_farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.external_animal_tag?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = record.pregnancy_status || record.status || 'suspected';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      const matchesFarm = farmFilter === 'all' || 
        record.external_farm_name === farmFilter;
      
      return matchesSearch && matchesStatus && matchesFarm;
    });
  }, [externalRecords, searchTerm, statusFilter, farmFilter]);


  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const uniqueFarms = useMemo(() => {
    const farmNames = new Set(externalRecords.map(r => r.external_farm_name).filter(Boolean));
    return Array.from(farmNames);
  }, [externalRecords]);

  return (
    <DashboardContainer>
      <Box sx={{ p: 4 }}>
        {/* Header Card */}
        <Card sx={{ 
          mb: 4, 
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
                  <ExternalLink size={32} color="white" strokeWidth={2} />
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
                    External Breeding Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Track breeding using animals from external farms
                  </Typography>
                </Box>
              </Box>
              {hasPermission(currentUser, 'create_breeding') && (
                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  component={Link}
                  href="/dashboard/breeding/record"
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
                  Record Breeding
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by animal tag, external farm, or external animal..."
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
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150, bgcolor: 'white' }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="suspected">Suspected</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
            <TextField
              select
              label="External Farm"
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
              sx={{ minWidth: 200, bgcolor: 'white' }}
            >
              <MenuItem value="all">All Farms</MenuItem>
              {uniqueFarms.map((farmName) => (
                <MenuItem key={farmName} value={farmName}>
                  {farmName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        {/* Records Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animal</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>External Farm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>External Animal</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Breeding Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Expected Due</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Hire Expense</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No external breeding records found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const status = record.pregnancy_status || record.status || 'suspected';
                  const dueDate = record.expected_due_date || record.expected_delivery_date;
                  const daysUntilDue = getDaysUntilDue(dueDate);
                  
                  return (
                    <TableRow key={record.breeding_id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Heart size={16} color="#e91e63" />
                          <Box>
                            <Typography fontWeight="medium">{record.animal?.tag_number || 'N/A'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.animal?.breed || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ExternalLink size={14} color="#0d9488" />
                          <Box>
                            <Typography variant="body2">{record.external_farm_name || 'N/A'}</Typography>
                            {record.externalFarm && (
                              <Typography variant="caption" color="text.secondary">
                                {record.externalFarm.location || record.externalFarm.district || ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {record.external_animal_tag ? (
                          <Box>
                            <Typography variant="body2">{record.external_animal_tag}</Typography>
                            {record.externalAnimal && (
                              <Typography variant="caption" color="text.secondary">
                                {record.externalAnimal.breed || record.externalAnimal.animal_type}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not specified</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={14} />
                          {new Date(record.breeding_date).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {dueDate ? (
                          <>
                            {new Date(dueDate).toLocaleDateString()}
                            {daysUntilDue !== null && daysUntilDue > 0 && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {daysUntilDue} days
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not calculated</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={status}
                          size="small"
                          sx={{ 
                            bgcolor: status === 'confirmed' ? '#c8e6c9' : 
                                     status === 'suspected' ? '#fff3e0' :
                                     status === 'completed' ? '#d1fae5' : 
                                     status === 'failed' ? '#ffcdd2' : '#e8f5e9',
                            color: status === 'confirmed' ? '#2d5016' : 
                                   status === 'suspected' ? '#e65100' :
                                   status === 'completed' ? '#065f46' : 
                                   status === 'failed' ? '#c62828' : '#2d5016',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {record.hireAgreement ? (
                          <Box>
                            <Typography variant="body2" fontWeight="600" sx={{ color: '#e65100' }}>
                              {record.hireAgreement.total_amount?.toLocaleString() || 0} UGX
                            </Typography>
                            <Chip
                              label={record.hireAgreement.payment_status}
                              size="small"
                              sx={{
                                mt: 0.5,
                                bgcolor: record.hireAgreement.payment_status === 'paid' ? '#fff3e0' : '#ffebee',
                                color: record.hireAgreement.payment_status === 'paid' ? '#e65100' : '#c62828',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          sx={{ color: '#4caf50' }}
                          component={Link}
                          href={`/dashboard/helper/pregnancy/${record.breeding_id}`}
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

