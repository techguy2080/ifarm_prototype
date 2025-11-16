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
import { Search, Plus, Edit, Eye, MapPin, Phone, Mail, Building2, Filter } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockExternalFarms, mockExternalAnimals, mockAnimalHireAgreements, mockExternalAnimalHireAgreements, mockBreedingRecords } from '@/lib/mockData';
import { ExternalFarm } from '@/types';

export default function ExternalFarmsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<number | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<ExternalFarm | null>(null);
  const [farmFormData, setFarmFormData] = useState({
    farm_name: '',
    owner_name: '',
    contact_person: '',
    phone: '',
    email: '',
    location: '',
    district: '',
    latitude: '',
    longitude: '',
    farm_type: '',
    specialties: [] as string[],
    notes: '',
    is_active: true
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

  const filteredFarms = useMemo(() => {
    return mockExternalFarms.filter(farm => {
      const matchesSearch = 
        farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (farm.owner_name && farm.owner_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (farm.location && farm.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        farm.phone.includes(searchTerm);
      
      const matchesType = filterType === 'all' || farm.farm_type === filterType;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && farm.is_active) ||
        (filterStatus === 'inactive' && !farm.is_active);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, filterType, filterStatus]);

  const summaryStats = useMemo(() => {
    const totalFarms = mockExternalFarms.length;
    const activeFarms = mockExternalFarms.filter(f => f.is_active).length;
    const thisYear = new Date().getFullYear();
    const farmsUsedThisYear = new Set([
      ...mockAnimalHireAgreements.filter(a => 
        new Date(a.start_date).getFullYear() === thisYear
      ).map(a => a.external_farm_id),
      ...mockExternalAnimalHireAgreements.filter(a => 
        new Date(a.start_date).getFullYear() === thisYear
      ).map(a => a.external_farm_id)
    ]).size;
    
    return { totalFarms, activeFarms, farmsUsedThisYear };
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSubmitting(false);
    setCreateDialogOpen(false);
    setFarmFormData({
      farm_name: '',
      owner_name: '',
      contact_person: '',
      phone: '',
      email: '',
      location: '',
      district: '',
      latitude: '',
      longitude: '',
      farm_type: '',
      specialties: [],
      notes: '',
      is_active: true
    });
  };

  const handleEditFarm = (farm: ExternalFarm) => {
    setSelectedFarm(farm);
    setFarmFormData({
      farm_name: farm.farm_name,
      owner_name: farm.owner_name || '',
      contact_person: farm.contact_person || '',
      phone: farm.phone,
      email: farm.email || '',
      location: farm.location || '',
      district: farm.district || '',
      latitude: farm.coordinates?.latitude.toString() || '',
      longitude: farm.coordinates?.longitude.toString() || '',
      farm_type: farm.farm_type || '',
      specialties: farm.specialties || [],
      notes: farm.notes || '',
      is_active: farm.is_active
    });
    setEditDialogOpen(farm.external_farm_id);
  };

  const handleUpdateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSubmitting(false);
    setEditDialogOpen(null);
    setSelectedFarm(null);
  };

  const handleViewDetails = (farm: ExternalFarm) => {
    setSelectedFarm(farm);
    setViewDialogOpen(farm.external_farm_id);
  };

  const getFarmAnimals = (farmId: number) => {
    return mockExternalAnimals.filter(a => a.external_farm_id === farmId);
  };

  const getFarmBreedingHistory = (farmId: number) => {
    return mockBreedingRecords.filter(b => 
      b.external_farm_name && 
      mockExternalFarms.find(f => f.external_farm_id === farmId)?.farm_name === b.external_farm_name
    );
  };

  const getFarmHireAgreements = (farmId: number) => {
    return [
      ...mockAnimalHireAgreements.filter(a => a.external_farm_id === farmId),
      ...mockExternalAnimalHireAgreements.filter(a => a.external_farm_id === farmId)
    ];
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
                  <Building2 size={32} color="white" strokeWidth={2} />
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
                    External Farm Directory
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Manage contacts for farms outside the system
                  </Typography>
                </Box>
              </Box>
              {(currentUser?.is_owner || hasPermission(currentUser, 'create_breeding')) && (
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => setCreateDialogOpen(true)}
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
                  Add External Farm
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search farms..."
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
                label="Farm Type"
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
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Farms Table */}
        {filteredFarms.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Building2 size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No external farms found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(currentUser?.is_owner || hasPermission(currentUser, 'create_breeding')) && 'Click "Add External Farm" to add your first farm'}
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
                      <TableCell sx={{ fontWeight: 700 }}>Farm Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFarms.map((farm) => (
                      <TableRow key={farm.external_farm_id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {farm.farm_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {farm.owner_name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone size={14} /> {farm.phone}
                            </Typography>
                            {farm.email && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Mail size={14} /> {farm.email}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MapPin size={14} /> {farm.location || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={farm.farm_type || 'N/A'}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={farm.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={farm.is_active ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(farm)}
                              sx={{ color: '#16a34a' }}
                            >
                              <Eye size={18} />
                            </IconButton>
                            {(currentUser?.is_owner || hasPermission(currentUser, 'create_breeding')) && (
                              <IconButton
                                size="small"
                                onClick={() => handleEditFarm(farm)}
                                sx={{ color: '#16a34a' }}
                              >
                                <Edit size={18} />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Farm Dialog */}
        <Dialog 
          open={createDialogOpen || editDialogOpen !== null} 
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(null);
            setSelectedFarm(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <form onSubmit={editDialogOpen ? handleUpdateFarm : handleCreateFarm}>
            <DialogTitle>
              <Typography variant="h5" fontWeight="600">
                {editDialogOpen ? 'Edit External Farm' : 'Add External Farm'}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  label="Farm Name"
                  fullWidth
                  required
                  value={farmFormData.farm_name}
                  onChange={(e) => setFarmFormData({ ...farmFormData, farm_name: e.target.value })}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Owner Name"
                    fullWidth
                    value={farmFormData.owner_name}
                    onChange={(e) => setFarmFormData({ ...farmFormData, owner_name: e.target.value })}
                  />
                  <TextField
                    label="Contact Person"
                    fullWidth
                    value={farmFormData.contact_person}
                    onChange={(e) => setFarmFormData({ ...farmFormData, contact_person: e.target.value })}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Phone"
                    fullWidth
                    required
                    value={farmFormData.phone}
                    onChange={(e) => setFarmFormData({ ...farmFormData, phone: e.target.value })}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    type="email"
                    value={farmFormData.email}
                    onChange={(e) => setFarmFormData({ ...farmFormData, email: e.target.value })}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Location"
                    fullWidth
                    value={farmFormData.location}
                    onChange={(e) => setFarmFormData({ ...farmFormData, location: e.target.value })}
                  />
                  <TextField
                    label="District"
                    fullWidth
                    value={farmFormData.district}
                    onChange={(e) => setFarmFormData({ ...farmFormData, district: e.target.value })}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Latitude"
                    fullWidth
                    type="number"
                    value={farmFormData.latitude}
                    onChange={(e) => setFarmFormData({ ...farmFormData, latitude: e.target.value })}
                  />
                  <TextField
                    label="Longitude"
                    fullWidth
                    type="number"
                    value={farmFormData.longitude}
                    onChange={(e) => setFarmFormData({ ...farmFormData, longitude: e.target.value })}
                  />
                </Stack>
                <TextField
                  label="Farm Type"
                  fullWidth
                  select
                  value={farmFormData.farm_type}
                  onChange={(e) => setFarmFormData({ ...farmFormData, farm_type: e.target.value })}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="cattle">Cattle</MenuItem>
                  <MenuItem value="goat">Goat</MenuItem>
                  <MenuItem value="sheep">Sheep</MenuItem>
                  <MenuItem value="pig">Pig</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={3}
                  value={farmFormData.notes}
                  onChange={(e) => setFarmFormData({ ...farmFormData, notes: e.target.value })}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(null);
                setSelectedFarm(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#16a34a' }}>
                {submitting ? 'Saving...' : editDialogOpen ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* View Farm Details Dialog */}
        <Dialog 
          open={viewDialogOpen !== null} 
          onClose={() => {
            setViewDialogOpen(null);
            setSelectedFarm(null);
          }}
          maxWidth="md"
          fullWidth
        >
          {selectedFarm && (
            <>
              <DialogTitle>
                <Typography variant="h5" fontWeight="600">
                  {selectedFarm.farm_name}
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contact Information
                    </Typography>
                    <Stack spacing={1}>
                      {selectedFarm.owner_name && (
                        <Typography variant="body1"><strong>Owner:</strong> {selectedFarm.owner_name}</Typography>
                      )}
                      {selectedFarm.contact_person && (
                        <Typography variant="body1"><strong>Contact Person:</strong> {selectedFarm.contact_person}</Typography>
                      )}
                      <Typography variant="body1"><strong>Phone:</strong> {selectedFarm.phone}</Typography>
                      {selectedFarm.email && (
                        <Typography variant="body1"><strong>Email:</strong> {selectedFarm.email}</Typography>
                      )}
                    </Stack>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Location
                    </Typography>
                    <Stack spacing={1}>
                      {selectedFarm.location && (
                        <Typography variant="body1"><strong>Location:</strong> {selectedFarm.location}</Typography>
                      )}
                      {selectedFarm.district && (
                        <Typography variant="body1"><strong>District:</strong> {selectedFarm.district}</Typography>
                      )}
                      {selectedFarm.coordinates && (
                        <Typography variant="body1">
                          <strong>Coordinates:</strong> {selectedFarm.coordinates.latitude}, {selectedFarm.coordinates.longitude}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                  {selectedFarm.farm_type && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Farm Type
                      </Typography>
                      <Chip label={selectedFarm.farm_type} sx={{ textTransform: 'capitalize' }} />
                    </Paper>
                  )}
                  {selectedFarm.specialties && selectedFarm.specialties.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Specialties
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedFarm.specialties.map((specialty, idx) => (
                          <Chip key={idx} label={specialty} size="small" />
                        ))}
                      </Stack>
                    </Paper>
                  )}
                  {selectedFarm.notes && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body1">{selectedFarm.notes}</Typography>
                    </Paper>
                  )}
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Statistics
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body1">
                        <strong>Animals Registered:</strong> {getFarmAnimals(selectedFarm.external_farm_id).length}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Breeding Records:</strong> {getFarmBreedingHistory(selectedFarm.external_farm_id).length}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Hire Agreements:</strong> {getFarmHireAgreements(selectedFarm.external_farm_id).length}
                      </Typography>
                    </Stack>
                  </Paper>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => {
                  setViewDialogOpen(null);
                  setSelectedFarm(null);
                }}>
                  Close
                </Button>
                {(currentUser?.is_owner || hasPermission(currentUser, 'create_breeding')) && (
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      handleEditFarm(selectedFarm);
                      setViewDialogOpen(null);
                    }}
                    sx={{ bgcolor: '#16a34a' }}
                  >
                    Edit
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}

