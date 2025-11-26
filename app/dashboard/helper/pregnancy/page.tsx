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
  MenuItem,
  Divider,
  Grid
} from '@mui/material';
import { Search, Plus, Eye, Calendar, Heart, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { 
  mockAnimals, 
  mockFarms, 
  mockBreedingRecords, 
  mockExternalFarms, 
  mockExternalAnimals,
  mockAnimalHireAgreements,
  mockExternalAnimalHireAgreements
} from '@/lib/mockData';
import { BreedingRecord } from '@/types';

export default function HelperPregnancyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sireSourceFilter, setSireSourceFilter] = useState<string>('all');
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'create_breeding'))) {
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

  // Use actual breeding records instead of generating from activities
  const breedingRecords = mockBreedingRecords.map(record => ({
    ...record,
    animal: mockAnimals.find(a => a.animal_id === record.animal_id)
  }));
  
  const filteredRecords = breedingRecords.filter(record => {
    const matchesSearch = 
      record.animal?.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animal?.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.external_farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.external_animal_tag?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = record.pregnancy_status || record.status || 'suspected';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    const matchesSireSource = sireSourceFilter === 'all' || record.sire_source === sireSourceFilter;
    
    return matchesSearch && matchesStatus && matchesSireSource;
  });

  const getFarmName = (farmId: number) => {
    const farm = mockFarms.find(f => f.farm_id === farmId);
    return farm?.farm_name || 'Unknown Farm';
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getSireDisplay = (record: BreedingRecord) => {
    if (record.sire_source === 'external') {
      return `External: ${record.external_farm_name || 'Unknown Farm'} - ${record.external_animal_tag || 'N/A'}`;
    } else if (record.sire_id) {
      const sire = mockAnimals.find(a => a.animal_id === record.sire_id);
      return sire ? `${sire.tag_number} (${sire.breed || sire.animal_type})` : 'Unknown';
    }
    return 'Not specified';
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
                  <Heart size={32} color="white" strokeWidth={2} />
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
                    Pregnancy Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Overview of all breeding records and pregnancy tracking
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

        {/* Quick Navigation Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={Link}
              href="/dashboard/breeding/internal"
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#16a34a', mb: 1 }}>
                  Internal Breeding
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View breeding using your own animals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={Link}
              href="/dashboard/breeding/external"
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#3b82f6', mb: 1 }}>
                  External Breeding
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View breeding with external animals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={Link}
              href="/dashboard/breeding/analytics"
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#8b5cf6', mb: 1 }}>
                  Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View breeding analytics & finances
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={Link}
              href="/dashboard/breeding/hire-agreements"
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#0d9488', mb: 1 }}>
                  Hire Agreements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage animal hire agreements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by tag number, breed, or external farm..."
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
            <Stack direction="row" spacing={1} flexWrap="wrap">
            <Stack direction="row" spacing={1}>
              {['all', 'confirmed', 'suspected', 'completed', 'failed'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter(status)}
                  sx={{
                    bgcolor: statusFilter === status ? '#4caf50' : 'transparent',
                    color: statusFilter === status ? 'white' : '#2d5016',
                    borderColor: '#4caf50',
                    textTransform: 'capitalize',
                    '&:hover': { bgcolor: statusFilter === status ? '#45a049' : '#e8f5e9' }
                  }}
                >
                  {status}
                </Button>
              ))}
              </Stack>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Stack direction="row" spacing={1}>
                {['all', 'internal', 'external'].map(source => (
                  <Button
                    key={source}
                    variant={sireSourceFilter === source ? 'contained' : 'outlined'}
                    onClick={() => setSireSourceFilter(source)}
                    sx={{
                      bgcolor: sireSourceFilter === source ? '#1976d2' : 'transparent',
                      color: sireSourceFilter === source ? 'white' : '#1565c0',
                      borderColor: '#1976d2',
                      textTransform: 'capitalize',
                      '&:hover': { bgcolor: sireSourceFilter === source ? '#1565c0' : '#e3f2fd' }
                    }}
                  >
                    {source === 'all' ? 'All Sources' : source === 'internal' ? 'My Farm' : 'External'}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Breeding Records Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animal</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Sire Source</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Breeding Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Conception Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Expected Due Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Days Until Due</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No breeding records found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const status = record.pregnancy_status || record.status || 'suspected';
                  const dueDate = record.expected_due_date || record.expected_delivery_date;
                  const daysUntilDue = getDaysUntilDue(dueDate);
                  const sireDisplay = getSireDisplay(record);
                  
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
                          {record.sire_source === 'external' && <ExternalLink size={14} />}
                          <Typography variant="body2" sx={{ 
                            color: record.sire_source === 'external' ? '#1976d2' : '#2d5016',
                            fontWeight: record.sire_source === 'external' ? 500 : 400
                          }}>
                            {sireDisplay}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={14} />
                          {new Date(record.breeding_date).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {record.conception_date ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Calendar size={14} />
                            {new Date(record.conception_date).toLocaleDateString()}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not recorded</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {dueDate ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Calendar size={14} />
                            {new Date(dueDate).toLocaleDateString()}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not calculated</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {daysUntilDue !== null ? (
                          daysUntilDue > 0 ? (
                          <Chip 
                            label={`${daysUntilDue} days`}
                            size="small"
                            sx={{ 
                              bgcolor: daysUntilDue <= 30 ? '#fff3e0' : '#e8f5e9',
                              color: daysUntilDue <= 30 ? '#e65100' : '#2d5016'
                            }}
                            icon={daysUntilDue <= 30 ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                          />
                        ) : (
                          <Chip label="Overdue" size="small" sx={{ bgcolor: '#ffcdd2', color: '#c62828' }} />
                          )
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={status}
                          size="small"
                          sx={{ 
                            bgcolor: status === 'confirmed' ? '#c8e6c9' : 
                                     status === 'suspected' ? '#fff3e0' :
                                     status === 'completed' ? '#e3f2fd' : 
                                     status === 'failed' ? '#ffcdd2' : '#e8f5e9',
                            color: status === 'confirmed' ? '#2d5016' : 
                                   status === 'suspected' ? '#e65100' :
                                   status === 'completed' ? '#1976d2' : 
                                   status === 'failed' ? '#c62828' : '#2d5016',
                            textTransform: 'capitalize'
                          }}
                        />
                        {record.birth_outcome && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            {record.birth_outcome}
                          </Typography>
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
