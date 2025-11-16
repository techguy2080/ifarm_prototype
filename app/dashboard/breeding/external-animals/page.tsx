'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  alpha,
  Paper,
  Grid
} from '@mui/material';
import { Search, Plus, Edit, Eye, Beef, Filter, Heart, Calendar } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockExternalAnimals, mockExternalFarms, mockBreedingRecords } from '@/lib/mockData';
import { ExternalAnimal } from '@/types';
import { getBreedsForAnimalType } from '@/lib/breeds';

export default function ExternalAnimalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFarm, setFilterFarm] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterHealth, setFilterHealth] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<number | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<ExternalAnimal | null>(null);
  const [animalFormData, setAnimalFormData] = useState({
    external_farm_id: '',
    tag_number: '',
    animal_type: '',
    breed: '',
    gender: '',
    age_years: '',
    weight_kg: '',
    health_status: '',
    health_certificate_available: false,
    health_certificate_expiry: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'create_breeding') && !hasPermission(currentUser, 'view_animals'))) {
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

  const filteredAnimals = useMemo(() => {
    return mockExternalAnimals.filter(animal => {
      const matchesSearch = 
        (animal.tag_number && animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (animal.breed && animal.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (animal.external_farm?.farm_name && animal.external_farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFarm = filterFarm === 'all' || animal.external_farm_id.toString() === filterFarm;
      const matchesType = filterType === 'all' || animal.animal_type === filterType;
      const matchesGender = filterGender === 'all' || animal.gender === filterGender;
      const matchesHealth = filterHealth === 'all' || animal.health_status === filterHealth;
      
      return matchesSearch && matchesFarm && matchesType && matchesGender && matchesHealth;
    });
  }, [searchTerm, filterFarm, filterType, filterGender, filterHealth]);

  const summaryStats = useMemo(() => {
    const totalAnimals = mockExternalAnimals.length;
    const byType = mockExternalAnimals.reduce((acc, animal) => {
      acc[animal.animal_type] = (acc[animal.animal_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedAnimal = mockExternalAnimals.map(animal => {
      const breedingCount = mockBreedingRecords.filter(br => 
        br.external_animal_id === animal.external_animal_id
      ).length;
      return { animal, breedingCount };
    }).sort((a, b) => b.breedingCount - a.breedingCount)[0];

    return { totalAnimals, byType, mostUsedAnimal };
  }, []);

  const handleViewDetails = (animal: ExternalAnimal) => {
    setSelectedAnimal(animal);
    setViewDialogOpen(animal.external_animal_id);
  };

  const handleEdit = (animal: ExternalAnimal) => {
    setSelectedAnimal(animal);
    setAnimalFormData({
      external_farm_id: animal.external_farm_id.toString(),
      tag_number: animal.tag_number || '',
      animal_type: animal.animal_type,
      breed: animal.breed || '',
      gender: animal.gender || '',
      age_years: animal.age_years?.toString() || '',
      weight_kg: animal.weight_kg?.toString() || '',
      health_status: animal.health_status || '',
      health_certificate_available: animal.health_certificate_available || false,
      health_certificate_expiry: animal.health_certificate_expiry || '',
      notes: animal.notes || ''
    });
    setEditDialogOpen(animal.external_animal_id);
  };

  const handleCreate = () => {
    setAnimalFormData({
      external_farm_id: '',
      tag_number: '',
      animal_type: '',
      breed: '',
      gender: '',
      age_years: '',
      weight_kg: '',
      health_status: '',
      health_certificate_available: false,
      health_certificate_expiry: '',
      notes: ''
    });
    setCreateDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // In real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSubmitting(false);
    setCreateDialogOpen(false);
    setEditDialogOpen(null);
  };

  const getBreedingCount = (animalId: number) => {
    return mockBreedingRecords.filter(br => br.external_animal_id === animalId).length;
  };

  const getLastUsedDate = (animalId: number) => {
    const records = mockBreedingRecords
      .filter(br => br.external_animal_id === animalId)
      .sort((a, b) => new Date(b.breeding_date).getTime() - new Date(a.breeding_date).getTime());
    return records[0]?.breeding_date;
  };

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
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
                  <Beef size={32} color="white" strokeWidth={2} />
                </Box>
                <Box>
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
                    External Animal Registry
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Track animals from external farms used for breeding
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleCreate}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Add External Animal
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search animals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#16a34a" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 2 }}
              />
              <TextField
                select
                label="Farm"
                value={filterFarm}
                onChange={(e) => setFilterFarm(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="all">All Farms</MenuItem>
                {mockExternalFarms.map(farm => (
                  <MenuItem key={farm.external_farm_id} value={farm.external_farm_id.toString()}>
                    {farm.farm_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Animal Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="cattle">Cattle</MenuItem>
                <MenuItem value="goat">Goat</MenuItem>
                <MenuItem value="sheep">Sheep</MenuItem>
                <MenuItem value="pig">Pig</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <TextField
                select
                label="Gender"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
              <TextField
                select
                label="Health Status"
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="sick">Sick</MenuItem>
                <MenuItem value="recovering">Recovering</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Animals Table */}
        {filteredAnimals.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Beef size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No external animals found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click &quot;Add External Animal&quot; to add your first animal
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Tag</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Farm</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Breed</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Health</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Breeding Count</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Used</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAnimals.map((animal) => {
                      const breedingCount = getBreedingCount(animal.external_animal_id);
                      const lastUsed = getLastUsedDate(animal.external_animal_id);
                      return (
                        <TableRow key={animal.external_animal_id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {animal.tag_number || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {animal.external_farm?.farm_name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={animal.animal_type} 
                              size="small" 
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {animal.breed || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {animal.gender || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {animal.age_years ? `${animal.age_years} years` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {animal.weight_kg ? `${animal.weight_kg} kg` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={animal.health_status || 'Unknown'}
                              size="small"
                              color={
                                animal.health_status === 'healthy' ? 'success' :
                                animal.health_status === 'sick' ? 'error' : 'warning'
                              }
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {breedingCount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {lastUsed ? (
                              <Typography variant="body2">
                                {new Date(lastUsed).toLocaleDateString()}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Never
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(animal)}
                                sx={{ color: '#16a34a' }}
                              >
                                <Eye size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(animal)}
                                sx={{ color: '#059669' }}
                              >
                                <Edit size={18} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* View Details Dialog */}
        {selectedAnimal && (
          <Dialog 
            open={viewDialogOpen === selectedAnimal.external_animal_id} 
            onClose={() => setViewDialogOpen(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h5" fontWeight="600">
                External Animal Details
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tag Number
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedAnimal.tag_number || 'N/A'}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    External Farm
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedAnimal.external_farm?.farm_name || 'N/A'}
                  </Typography>
                </Paper>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Animal Type
                      </Typography>
                      <Chip 
                        label={selectedAnimal.animal_type} 
                        size="small" 
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Breed
                      </Typography>
                      <Typography variant="body1">
                        {selectedAnimal.breed || 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Gender
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {selectedAnimal.gender || 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Age
                      </Typography>
                      <Typography variant="body1">
                        {selectedAnimal.age_years ? `${selectedAnimal.age_years} years` : 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Weight
                      </Typography>
                      <Typography variant="body1">
                        {selectedAnimal.weight_kg ? `${selectedAnimal.weight_kg} kg` : 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Health Status
                      </Typography>
                      <Chip
                        label={selectedAnimal.health_status || 'Unknown'}
                        size="small"
                        color={
                          selectedAnimal.health_status === 'healthy' ? 'success' :
                          selectedAnimal.health_status === 'sick' ? 'error' : 'warning'
                        }
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
                {selectedAnimal.health_certificate_available && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Health Certificate
                    </Typography>
                    <Typography variant="body2">
                      Available
                      {selectedAnimal.health_certificate_expiry && (
                        <> - Expires: {new Date(selectedAnimal.health_certificate_expiry).toLocaleDateString()}</>
                      )}
                    </Typography>
                  </Paper>
                )}
                {selectedAnimal.notes && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedAnimal.notes}
                    </Typography>
                  </Paper>
                )}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Breeding History
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {getBreedingCount(selectedAnimal.external_animal_id)} breeding record(s)
                  </Typography>
                </Paper>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setViewDialogOpen(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Create/Edit Dialog */}
        <Dialog 
          open={createDialogOpen || editDialogOpen !== null} 
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight="600">
              {editDialogOpen ? 'Edit External Animal' : 'Add External Animal'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                select
                label="External Farm"
                value={animalFormData.external_farm_id}
                onChange={(e) => setAnimalFormData({ ...animalFormData, external_farm_id: e.target.value })}
                required
                fullWidth
                SelectProps={{
                  native: false,
                }}
              >
                <MenuItem value="">Select Farm</MenuItem>
                {mockExternalFarms.map(farm => (
                  <MenuItem key={farm.external_farm_id} value={farm.external_farm_id.toString()}>
                    {farm.farm_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Tag Number"
                value={animalFormData.tag_number}
                onChange={(e) => setAnimalFormData({ ...animalFormData, tag_number: e.target.value })}
                required
                fullWidth
              />
              <TextField
                select
                label="Animal Type"
                value={animalFormData.animal_type}
                onChange={(e) => setAnimalFormData({ ...animalFormData, animal_type: e.target.value, breed: '' })}
                required
                fullWidth
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="cattle">Cattle</MenuItem>
                <MenuItem value="goat">Goat</MenuItem>
                <MenuItem value="sheep">Sheep</MenuItem>
                <MenuItem value="pig">Pig</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <TextField
                label="Breed"
                select
                value={animalFormData.breed}
                onChange={(e) => setAnimalFormData({ ...animalFormData, breed: e.target.value })}
                disabled={!animalFormData.animal_type}
                helperText={!animalFormData.animal_type ? 'Please select an animal type first' : ''}
                fullWidth
              >
                <MenuItem value="">Select Breed</MenuItem>
                {animalFormData.animal_type && getBreedsForAnimalType(animalFormData.animal_type).map((breedOption) => (
                  <MenuItem key={breedOption.name} value={breedOption.name}>
                    {breedOption.name}
                    {breedOption.origin && ` (${breedOption.origin})`}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Gender"
                value={animalFormData.gender}
                onChange={(e) => setAnimalFormData({ ...animalFormData, gender: e.target.value })}
                fullWidth
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Age (years)"
                    type="number"
                    value={animalFormData.age_years}
                    onChange={(e) => setAnimalFormData({ ...animalFormData, age_years: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Weight (kg)"
                    type="number"
                    value={animalFormData.weight_kg}
                    onChange={(e) => setAnimalFormData({ ...animalFormData, weight_kg: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <TextField
                select
                label="Health Status"
                value={animalFormData.health_status}
                onChange={(e) => setAnimalFormData({ ...animalFormData, health_status: e.target.value })}
                fullWidth
              >
                <MenuItem value="">Select Status</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="sick">Sick</MenuItem>
                <MenuItem value="recovering">Recovering</MenuItem>
              </TextField>
              <TextField
                label="Health Certificate Expiry"
                type="date"
                value={animalFormData.health_certificate_expiry}
                onChange={(e) => setAnimalFormData({ ...animalFormData, health_certificate_expiry: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Notes"
                value={animalFormData.notes}
                onChange={(e) => setAnimalFormData({ ...animalFormData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(null);
            }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
            >
              {submitting ? 'Saving...' : editDialogOpen ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}

