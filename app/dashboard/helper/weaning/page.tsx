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
import { Search, Plus, Eye, Calendar, Baby, CheckCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals, mockFarms } from '@/lib/mockData';

// Mock weaning data model
interface WeaningRecord {
  weaning_id: number;
  animal_id: number;
  animal?: typeof mockAnimals[0];
  mother_animal_id?: number;
  mother_animal?: typeof mockAnimals[0];
  weaning_date: string;
  age_at_weaning_days: number;
  weight_at_weaning?: number;
  notes?: string;
  created_at: string;
}

// Generate mock weaning records
const generateWeaningRecords = (): WeaningRecord[] => {
  const youngAnimals = mockAnimals.filter(a => {
    if (!a.birth_date) return false;
    const birthDate = new Date(a.birth_date);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return ageInDays > 60 && ageInDays < 300; // Between 2-10 months old
  });

  return youngAnimals.map((animal, index) => {
    const birthDate = new Date(animal.birth_date!);
    const weaningDate = new Date(birthDate);
    weaningDate.setDate(weaningDate.getDate() + 180); // ~6 months
    const ageAtWeaning = Math.floor((weaningDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      weaning_id: index + 1,
      animal_id: animal.animal_id,
      animal,
      mother_animal_id: animal.mother_animal_id,
      mother_animal: animal.mother_animal_id ? mockAnimals.find(a => a.animal_id === animal.mother_animal_id) : undefined,
      weaning_date: weaningDate.toISOString().split('T')[0],
      age_at_weaning_days: ageAtWeaning,
      weight_at_weaning: 50 + Math.random() * 30, // Mock weight
      notes: `Weaned from mother ${animal.mother_animal_id ? `COW-${animal.mother_animal_id}` : 'N/A'}`,
      created_at: weaningDate.toISOString()
    };
  });
};

export default function HelperWeaningPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [weaningFormData, setWeaningFormData] = useState({
    animal_id: '',
    mother_id: '',
    weaning_date: '',
    age_at_weaning: '',
    weight_at_weaning: '',
    weaning_reason: 'standard',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'create_general'))) {
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

  const weaningRecords = generateWeaningRecords();
  
  const filteredRecords = weaningRecords.filter(record => {
    return record.animal?.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.animal?.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.mother_animal?.tag_number.toLowerCase().includes(searchTerm.toLowerCase());
  });


  const getFarmName = (farmId: number) => {
    const farm = mockFarms.find(f => f.farm_id === farmId);
    return farm?.farm_name || 'Unknown Farm';
  };

  const handleCreateWeaning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weaningFormData.animal_id || !weaningFormData.weaning_date) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      alert('Weaning record would be created! (Prototype)');
      setSubmitting(false);
      setCreateDialogOpen(false);
      setWeaningFormData({
        animal_id: '',
        mother_id: '',
        weaning_date: '',
        age_at_weaning: '',
        weight_at_weaning: '',
        weaning_reason: 'standard',
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
                  <Baby size={32} color="white" strokeWidth={2} />
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
                    Weaning Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Track and manage animal weaning records
                  </Typography>
                </Box>
              </Box>
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
                Record Weaning
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <TextField
            fullWidth
            placeholder="Search by animal tag, breed, or mother tag..."
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

        {/* Weaning Records Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animal</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Mother</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Weaning Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Age at Weaning</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Weight (kg)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Farm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No weaning records found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.weaning_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Baby size={16} color="#ff9800" />
                        <Box>
                          <Typography fontWeight="medium">{record.animal?.tag_number || 'N/A'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.animal?.breed || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {record.mother_animal ? (
                        <Typography>{record.mother_animal.tag_number}</Typography>
                      ) : (
                        <Typography color="text.secondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={14} />
                        {new Date(record.weaning_date).toLocaleDateString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${record.age_at_weaning_days} days`}
                        size="small"
                        sx={{ bgcolor: '#e8f5e9', color: '#2d5016' }}
                      />
                    </TableCell>
                    <TableCell>
                      {record.weight_at_weaning ? (
                        <Typography fontWeight="medium">{record.weight_at_weaning.toFixed(1)} kg</Typography>
                      ) : (
                        <Typography color="text.secondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell>{getFarmName(record.animal?.farm_id || 1)}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#4caf50' }}
                        component={Link}
                        href={`/dashboard/helper/weaning/${record.weaning_id}`}
                      >
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Record Weaning Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setWeaningFormData({
            animal_id: '',
            mother_id: '',
            weaning_date: '',
            age_at_weaning: '',
            weight_at_weaning: '',
            weaning_reason: 'standard',
            notes: ''
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateWeaning}>
          <DialogTitle>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>Record Weaning</Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Animal (Offspring)"
                fullWidth
                select
                required
                value={weaningFormData.animal_id}
                onChange={(e) => setWeaningFormData({ ...weaningFormData, animal_id: e.target.value })}
              >
                {mockAnimals.filter(a => a.birth_date && a.status === 'active' && a.tenant_id === currentUser?.tenant_id).map((animal) => {
                  const birthDate = new Date(animal.birth_date!);
                  const today = new Date();
                  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                      {animal.tag_number} - {ageInDays} days old
                    </MenuItem>
                  );
                })}
              </TextField>
              <TextField
                label="Mother"
                fullWidth
                select
                value={weaningFormData.mother_id}
                onChange={(e) => setWeaningFormData({ ...weaningFormData, mother_id: e.target.value })}
              >
                <MenuItem value="">Unknown</MenuItem>
                {mockAnimals.filter(a => a.gender === 'female' && a.status === 'active' && a.tenant_id === currentUser?.tenant_id).map((animal) => (
                  <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                    {animal.tag_number} - {animal.breed || animal.animal_type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Weaning Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={weaningFormData.weaning_date}
                onChange={(e) => setWeaningFormData({ ...weaningFormData, weaning_date: e.target.value })}
              />
              <TextField
                label="Age at Weaning (days)"
                type="number"
                fullWidth
                placeholder="e.g., 180"
                value={weaningFormData.age_at_weaning}
                onChange={(e) => setWeaningFormData({ ...weaningFormData, age_at_weaning: e.target.value })}
              />
              <TextField
                label="Weight at Weaning (kg)"
                type="number"
                fullWidth
                placeholder="0.0"
                inputProps={{ step: 0.1 }}
                value={weaningFormData.weight_at_weaning}
                onChange={(e) => setWeaningFormData({ ...weaningFormData, weight_at_weaning: e.target.value })}
              />
              <TextField
                label="Weaning Reason"
                fullWidth
                select
                value={weaningFormData.weaning_reason}
                onChange={(e) => setWeaningFormData({ ...weaningFormData, weaning_reason: e.target.value })}
              >
                <MenuItem value="standard">Standard Weaning</MenuItem>
                <MenuItem value="health">Health Reasons</MenuItem>
                <MenuItem value="mother_health">Mother Health Issues</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                placeholder="Additional information about the weaning..."
                value={weaningFormData.notes}
                onChange={(e) => setWeaningFormData({ ...weaningFormData, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setCreateDialogOpen(false);
                setWeaningFormData({
                  animal_id: '',
                  mother_id: '',
                  weaning_date: '',
                  age_at_weaning: '',
                  weight_at_weaning: '',
                  weaning_reason: 'standard',
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
              {submitting ? 'Recording...' : 'Record Weaning'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </DashboardContainer>
  );
}

