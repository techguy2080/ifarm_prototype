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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import { Search, Plus, Eye, Calendar, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals, mockActivities, mockFarms } from '@/lib/mockData';

// Mock pregnancy data model
interface PregnancyRecord {
  pregnancy_id: number;
  animal_id: number;
  animal?: typeof mockAnimals[0];
  breeding_date: string;
  expected_due_date: string;
  confirmed_date?: string;
  status: 'confirmed' | 'suspected' | 'completed' | 'failed';
  notes?: string;
  created_at: string;
}

// Generate mock pregnancy records from breeding activities
const generatePregnancyRecords = (): PregnancyRecord[] => {
  const breedingActivities = mockActivities.filter(a => a.activity_type === 'breeding');
  return breedingActivities.map((activity, index) => {
    const breedingDate = new Date(activity.activity_date);
    const expectedDueDate = new Date(breedingDate);
    expectedDueDate.setDate(expectedDueDate.getDate() + 280); // ~9 months for cattle
    
    return {
      pregnancy_id: index + 1,
      animal_id: activity.animal_id || 1,
      animal: mockAnimals.find(a => a.animal_id === activity.animal_id),
      breeding_date: activity.activity_date,
      expected_due_date: expectedDueDate.toISOString().split('T')[0],
      confirmed_date: activity.activity_date,
      status: index % 3 === 0 ? 'confirmed' : index % 3 === 1 ? 'suspected' : 'completed',
      notes: activity.description,
      created_at: activity.created_at
    };
  });
};

export default function HelperPregnancyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [breedingFormData, setBreedingFormData] = useState({
    animal_id: '',
    breeding_date: '',
    breeding_method: 'natural',
    sire_id: '',
    pregnancy_status: 'suspected',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
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

  const pregnancyRecords = generatePregnancyRecords();
  
  const filteredRecords = pregnancyRecords.filter(record => {
    const matchesSearch = 
      record.animal?.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animal?.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const getFarmName = (farmId: number) => {
    const farm = mockFarms.find(f => f.farm_id === farmId);
    return farm?.farm_name || 'Unknown Farm';
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleCreateBreeding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breedingFormData.animal_id || !breedingFormData.breeding_date) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      alert('Breeding record would be created! (Prototype)');
      setSubmitting(false);
      setCreateDialogOpen(false);
      setBreedingFormData({
        animal_id: '',
        breeding_date: '',
        breeding_method: 'natural',
        sire_id: '',
        pregnancy_status: 'suspected',
        notes: ''
      });
    }, 500);
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
                    Track and manage animal pregnancies and breeding records
                  </Typography>
                </Box>
              </Box>
              {hasPermission(currentUser, 'create_breeding') && (
                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  onClick={() => setCreateDialogOpen(true)}
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

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by tag number or breed..."
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
          </Stack>
        </Paper>

        {/* Pregnancy Records Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animal</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Breeding Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Expected Due Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Days Until Due</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Farm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No pregnancy records found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const daysUntilDue = getDaysUntilDue(record.expected_due_date);
                  return (
                    <TableRow key={record.pregnancy_id} hover>
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
                          <Calendar size={14} />
                          {new Date(record.breeding_date).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={14} />
                          {new Date(record.expected_due_date).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {daysUntilDue > 0 ? (
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
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status}
                          size="small"
                          sx={{ 
                            bgcolor: record.status === 'confirmed' ? '#c8e6c9' : 
                                     record.status === 'suspected' ? '#fff3e0' :
                                     record.status === 'completed' ? '#e3f2fd' : '#ffcdd2',
                            color: record.status === 'confirmed' ? '#2d5016' : 
                                   record.status === 'suspected' ? '#e65100' :
                                   record.status === 'completed' ? '#1976d2' : '#c62828',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>{getFarmName(record.animal?.farm_id || 1)}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          sx={{ color: '#4caf50' }}
                          component={Link}
                          href={`/dashboard/helper/pregnancy/${record.pregnancy_id}`}
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

      {/* Record Breeding Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setBreedingFormData({
            animal_id: '',
            breeding_date: '',
            breeding_method: 'natural',
            sire_id: '',
            pregnancy_status: 'suspected',
            notes: ''
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateBreeding}>
          <DialogTitle>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>Record Breeding</Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Animal"
                fullWidth
                select
                required
                value={breedingFormData.animal_id}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, animal_id: e.target.value })}
              >
                {mockAnimals.filter(a => a.gender === 'female' && a.status === 'active' && a.tenant_id === currentUser?.tenant_id).map((animal) => (
                  <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                    {animal.tag_number} - {animal.breed || animal.animal_type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Breeding Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={breedingFormData.breeding_date}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, breeding_date: e.target.value })}
              />
              <TextField
                label="Breeding Method"
                fullWidth
                select
                value={breedingFormData.breeding_method}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, breeding_method: e.target.value })}
              >
                <MenuItem value="natural">Natural</MenuItem>
                <MenuItem value="artificial">Artificial Insemination</MenuItem>
              </TextField>
              <TextField
                label="Sire/Bull (Optional)"
                fullWidth
                select
                value={breedingFormData.sire_id}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, sire_id: e.target.value })}
              >
                <MenuItem value="">Unknown</MenuItem>
                {mockAnimals.filter(a => a.gender === 'male' && a.status === 'active' && a.tenant_id === currentUser?.tenant_id).map((animal) => (
                  <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                    {animal.tag_number} - {animal.breed || animal.animal_type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Pregnancy Status"
                fullWidth
                select
                value={breedingFormData.pregnancy_status}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, pregnancy_status: e.target.value })}
              >
                <MenuItem value="suspected">Suspected</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
              </TextField>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                placeholder="Additional information about the breeding..."
                value={breedingFormData.notes}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setCreateDialogOpen(false);
                setBreedingFormData({
                  animal_id: '',
                  breeding_date: '',
                  breeding_method: 'natural',
                  sire_id: '',
                  pregnancy_status: 'suspected',
                  notes: ''
                });
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' },
                fontWeight: 600
              }}
            >
              {submitting ? 'Recording...' : 'Record Breeding'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </DashboardContainer>
  );
}

