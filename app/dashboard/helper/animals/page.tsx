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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Avatar
} from '@mui/material';
import { Search, Plus, Edit, Eye, Filter, MoreVertical, Tag, Calendar, MapPin, Beef, Upload, X, Image as ImageIcon } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals, mockFarms } from '@/lib/mockData';
import { getBreedsForAnimalType } from '@/lib/breeds';

export default function HelperAnimalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<number | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<typeof mockAnimals[0] | null>(null);
  const [animalFormData, setAnimalFormData] = useState({
    tag_number: '',
    animal_type: '',
    breed: '',
    gender: '',
    farm_id: '',
    birth_date: '',
    purchase_date: '',
    purchase_price: '',
    status: 'active',
    current_weight: '',
    sire_id: '',
    dam_id: '',
    lineage: '',
    genetic_markers: '',
    breeding_value: '',
    parentage_verified: false,
    is_castrated: false,
    castration_date: '',
    castration_method: '',
    castration_notes: '',
    notes: '',
    image: null as File | null,
    imagePreview: '' as string | null
  });
  const [submitting, setSubmitting] = useState(false);
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

  const filteredAnimals = mockAnimals.filter(animal => {
    const matchesSearch = 
      animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.animal_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || animal.animal_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const animalTypes = Array.from(new Set(mockAnimals.map(a => a.animal_type)));

  const getFarmName = (farmId: number) => {
    const farm = mockFarms.find(f => f.farm_id === farmId);
    return farm?.farm_name || 'Unknown Farm';
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalFormData.tag_number || !animalFormData.animal_type || !animalFormData.gender || !animalFormData.farm_id) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // In real app, this would call the API
      alert(`Animal ${animalFormData.tag_number} would be created! (Prototype)`);
      setSubmitting(false);
      setCreateDialogOpen(false);
      setAnimalFormData({
        tag_number: '',
        animal_type: '',
        breed: '',
        gender: '',
        farm_id: '',
        birth_date: '',
        purchase_date: '',
        purchase_price: '',
        status: 'active',
        current_weight: '',
        sire_id: '',
        dam_id: '',
        lineage: '',
        genetic_markers: '',
        image: null,
        imagePreview: null,
        breeding_value: '',
        parentage_verified: false,
        is_castrated: false,
        castration_date: '',
        castration_method: '',
        castration_notes: '',
        notes: ''
      });
    }, 500);
  };

  const handleEditAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalFormData.tag_number || !animalFormData.animal_type || !animalFormData.gender || !animalFormData.farm_id) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Animal ${animalFormData.tag_number} would be updated! (Prototype)`);
      setSubmitting(false);
      setEditDialogOpen(null);
      setSelectedAnimal(null);
      setAnimalFormData({
        tag_number: '',
        animal_type: '',
        breed: '',
        gender: '',
        farm_id: '',
        birth_date: '',
        purchase_date: '',
        purchase_price: '',
        status: 'active',
        current_weight: '',
        sire_id: '',
        dam_id: '',
        lineage: '',
        genetic_markers: '',
        image: null,
        imagePreview: null,
        breeding_value: '',
        parentage_verified: false,
        is_castrated: false,
        castration_date: '',
        castration_method: '',
        castration_notes: '',
        notes: ''
      });
    }, 500);
  };

  const handleEditClick = (animal: typeof mockAnimals[0]) => {
    setSelectedAnimal(animal);
    setAnimalFormData({
      tag_number: animal.tag_number,
      animal_type: animal.animal_type,
      breed: animal.breed || '',
      gender: animal.gender,
      farm_id: animal.farm_id.toString(),
      birth_date: animal.birth_date || '',
      purchase_date: animal.purchase_date || '',
      purchase_price: animal.purchase_price?.toString() || '',
      status: animal.status,
      current_weight: animal.current_weight?.toString() || '',
      sire_id: animal.father_animal_id?.toString() || '',
      dam_id: animal.mother_animal_id?.toString() || '',
      lineage: animal.genetic_data?.lineage || '',
      genetic_markers: animal.genetic_data?.genetic_markers?.join(', ') || '',
      image: null,
      imagePreview: animal.image_url || null,
      breeding_value: animal.genetic_data?.breeding_value?.toString() || '',
      parentage_verified: animal.genetic_data?.parentage_verified || false,
      is_castrated: animal.is_castrated || false,
      castration_date: animal.castration_date || '',
      castration_method: animal.castration_method || '',
      castration_notes: animal.castration_notes || '',
      notes: animal.notes || ''
    });
    setEditDialogOpen(animal.animal_id);
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
                  <Beef size={32} color="white" strokeWidth={2} />
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
                    Animal Records
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Manage all animal records and information
                  </Typography>
                </Box>
              </Box>
              {hasPermission(currentUser, 'create_animals') && (
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
                  Add New Animal
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
              placeholder="Search by tag number, breed, or type..."
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
            <Button
              variant="outlined"
              startIcon={<Filter />}
              onClick={handleMenuOpen}
              sx={{ 
                borderColor: '#4caf50', 
                color: '#2d5016',
                '&:hover': { borderColor: '#45a049', bgcolor: '#e8f5e9' },
                minWidth: 150
              }}
            >
              {filterType === 'all' ? 'All Types' : filterType}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { setFilterType('all'); handleMenuClose(); }}>
                All Types
              </MenuItem>
              {animalTypes.map(type => (
                <MenuItem key={type} onClick={() => { setFilterType(type); handleMenuClose(); }}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Paper>

        {/* Animals Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Tag Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Breed</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Farm</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Birth Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnimals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No animals found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnimals.map((animal) => (
                  <TableRow key={animal.animal_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tag size={16} />
                        <Typography fontWeight="medium">{animal.tag_number}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={animal.animal_type} 
                        size="small" 
                        sx={{ bgcolor: '#c8e6c9', color: '#2d5016' }}
                      />
                    </TableCell>
                    <TableCell>{animal.breed || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={animal.gender} 
                        size="small"
                        sx={{ 
                          bgcolor: animal.gender === 'male' ? '#e3f2fd' : '#fce4ec',
                          color: animal.gender === 'male' ? '#1976d2' : '#c2185b'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MapPin size={14} />
                        {getFarmName(animal.farm_id)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {animal.birth_date ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={14} />
                          {new Date(animal.birth_date).toLocaleDateString()}
                        </Box>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={animal.status} 
                        size="small"
                        sx={{ 
                          bgcolor: animal.status === 'active' ? '#c8e6c9' : '#ffcdd2',
                          color: animal.status === 'active' ? '#2d5016' : '#c62828'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          sx={{ color: '#4caf50' }}
                          onClick={() => {
                            setSelectedAnimal(animal);
                            setViewDialogOpen(animal.animal_id);
                          }}
                        >
                          <Eye size={16} />
                        </IconButton>
                        {hasPermission(currentUser, 'edit_animals') && (
                          <IconButton 
                            size="small" 
                            sx={{ color: '#4caf50' }}
                            onClick={() => handleEditClick(animal)}
                          >
                            <Edit size={16} />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Create Animal Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setAnimalFormData({
            tag_number: '',
            animal_type: '',
            breed: '',
            gender: '',
            farm_id: '',
            birth_date: '',
            purchase_date: '',
            purchase_price: '',
            status: 'active',
            notes: '',
            image: null,
            imagePreview: null,
            current_weight: '',
            sire_id: '',
            dam_id: '',
            lineage: '',
            genetic_markers: '',
            breeding_value: '',
            parentage_verified: false,
            is_castrated: false,
            castration_date: '',
            castration_method: '',
            castration_notes: ''
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateAnimal}>
          <DialogTitle>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>Add New Animal</Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField 
                label="Tag Number" 
                fullWidth 
                required 
                placeholder="e.g., COW-001"
                value={animalFormData.tag_number}
                onChange={(e) => setAnimalFormData({ ...animalFormData, tag_number: e.target.value })}
              />
              <TextField
                label="Animal Type"
                fullWidth
                select
                required
                value={animalFormData.animal_type}
                onChange={(e) => setAnimalFormData({ ...animalFormData, animal_type: e.target.value, breed: '' })}
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
                fullWidth
                select
                value={animalFormData.breed}
                onChange={(e) => setAnimalFormData({ ...animalFormData, breed: e.target.value })}
                disabled={!animalFormData.animal_type}
                helperText={!animalFormData.animal_type ? 'Please select an animal type first' : ''}
              >
                <MenuItem value="">Select Breed</MenuItem>
                {animalFormData.animal_type && getBreedsForAnimalType(animalFormData.animal_type).map((breedOption) => (
                  <MenuItem key={breedOption.name} value={breedOption.name}>
                    {breedOption.name}
                    {breedOption.origin && ` (${breedOption.origin})`}
                  </MenuItem>
                ))}
              </TextField>
              
              {/* Animal Photo Upload */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                  Animal Photo
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {animalFormData.imagePreview ? (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={animalFormData.imagePreview}
                        alt="Animal preview"
                        sx={{ width: 120, height: 120, border: '2px solid #e0e0e0' }}
                        variant="rounded"
                      />
                      <IconButton
                        size="small"
                        onClick={() => setAnimalFormData({ ...animalFormData, image: null, imagePreview: null })}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                          width: 28,
                          height: 28
                        }}
                      >
                        <X size={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: '#f5f5f5',
                        border: '2px dashed #ccc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#eeeeee', borderColor: '#4caf50' }
                      }}
                      variant="rounded"
                      onClick={() => document.getElementById('animal-image-upload')?.click()}
                    >
                      <ImageIcon size={32} color="#999" />
                      <Typography variant="caption" sx={{ mt: 0.5, color: '#666' }}>
                        No photo
                      </Typography>
                    </Avatar>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="animal-image-upload"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Image size must be less than 5MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAnimalFormData({
                              ...animalFormData,
                              image: file,
                              imagePreview: reader.result as string
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      htmlFor="animal-image-upload"
                      startIcon={<Upload size={18} />}
                      sx={{
                        borderColor: '#4caf50',
                        color: '#2d5016',
                        '&:hover': { borderColor: '#45a049', bgcolor: '#f1f8f4' }
                      }}
                    >
                      {animalFormData.imagePreview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                      Max size: 5MB (JPG, PNG)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <TextField
                label="Gender"
                fullWidth
                select
                required
                value={animalFormData.gender}
                onChange={(e) => setAnimalFormData({ ...animalFormData, gender: e.target.value, is_castrated: e.target.value === 'female' ? false : animalFormData.is_castrated })}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
              {animalFormData.gender === 'male' && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={animalFormData.is_castrated}
                        onChange={(e) => setAnimalFormData({ ...animalFormData, is_castrated: e.target.checked })}
                      />
                    }
                    label="Castrated"
                  />
                  {animalFormData.is_castrated && (
                    <>
                      <TextField
                        label="Castration Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={animalFormData.castration_date}
                        onChange={(e) => setAnimalFormData({ ...animalFormData, castration_date: e.target.value })}
                      />
                      <TextField
                        label="Castration Method"
                        fullWidth
                        select
                        value={animalFormData.castration_method}
                        onChange={(e) => setAnimalFormData({ ...animalFormData, castration_method: e.target.value })}
                      >
                        <MenuItem value="surgical">Surgical</MenuItem>
                        <MenuItem value="banding">Banding (Elastrator)</MenuItem>
                        <MenuItem value="chemical">Chemical</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                      <TextField
                        label="Castration Notes"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Additional notes about castration"
                        value={animalFormData.castration_notes}
                        onChange={(e) => setAnimalFormData({ ...animalFormData, castration_notes: e.target.value })}
                      />
                    </>
                  )}
                </>
              )}
              <TextField
                label="Farm"
                fullWidth
                select
                required
                value={animalFormData.farm_id}
                onChange={(e) => setAnimalFormData({ ...animalFormData, farm_id: e.target.value })}
              >
                {mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id).map((farm) => (
                  <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                    {farm.farm_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Birth Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={animalFormData.birth_date}
                onChange={(e) => setAnimalFormData({ ...animalFormData, birth_date: e.target.value })}
              />
              <TextField
                label="Purchase Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={animalFormData.purchase_date}
                onChange={(e) => setAnimalFormData({ ...animalFormData, purchase_date: e.target.value })}
              />
              <TextField
                label="Purchase Price (UGX)"
                type="number"
                fullWidth
                placeholder="0"
                value={animalFormData.purchase_price}
                onChange={(e) => setAnimalFormData({ ...animalFormData, purchase_price: e.target.value })}
              />
              <TextField
                label="Current Weight (kg)"
                type="number"
                fullWidth
                placeholder="e.g., 450"
                value={animalFormData.current_weight}
                onChange={(e) => setAnimalFormData({ ...animalFormData, current_weight: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>
                }}
              />
              
              {/* Genetic Data Section */}
              <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600, color: '#2d5016' }}>
                Genetic Information
              </Typography>
              
              <TextField
                select
                label="Sire (Father)"
                fullWidth
                value={animalFormData.sire_id}
                onChange={(e) => setAnimalFormData({ ...animalFormData, sire_id: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {mockAnimals
                  .filter(a => a.gender === 'male' && a.tenant_id === currentUser?.tenant_id)
                  .map((animal) => (
                    <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                      {animal.tag_number} - {animal.breed || animal.animal_type}
                    </MenuItem>
                  ))}
              </TextField>
              
              <TextField
                select
                label="Dam (Mother)"
                fullWidth
                value={animalFormData.dam_id}
                onChange={(e) => setAnimalFormData({ ...animalFormData, dam_id: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {mockAnimals
                  .filter(a => a.gender === 'female' && a.tenant_id === currentUser?.tenant_id)
                  .map((animal) => (
                    <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                      {animal.tag_number} - {animal.breed || animal.animal_type}
                    </MenuItem>
                  ))}
              </TextField>
              
              <TextField
                label="Lineage"
                fullWidth
                value={animalFormData.lineage}
                onChange={(e) => setAnimalFormData({ ...animalFormData, lineage: e.target.value })}
                placeholder="e.g., Holstein-Friesian line"
              />
              
              <TextField
                label="Genetic Markers"
                fullWidth
                value={animalFormData.genetic_markers}
                onChange={(e) => setAnimalFormData({ ...animalFormData, genetic_markers: e.target.value })}
                placeholder="e.g., A1A1, BB, CC (comma separated)"
                helperText="Enter genetic markers separated by commas"
              />
              
              <TextField
                label="Breeding Value"
                type="number"
                fullWidth
                value={animalFormData.breeding_value}
                onChange={(e) => setAnimalFormData({ ...animalFormData, breeding_value: e.target.value })}
                placeholder="e.g., 85"
                helperText="Breeding value score (0-100)"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={animalFormData.parentage_verified}
                    onChange={(e) => setAnimalFormData({ ...animalFormData, parentage_verified: e.target.checked })}
                  />
                }
                label="Parentage Verified"
              />
              
              <TextField
                label="Status"
                fullWidth
                select
                value={animalFormData.status}
                onChange={(e) => setAnimalFormData({ ...animalFormData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
                <MenuItem value="deceased">Deceased</MenuItem>
                <MenuItem value="disposed">Disposed</MenuItem>
              </TextField>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                placeholder="Additional information..."
                value={animalFormData.notes}
                onChange={(e) => setAnimalFormData({ ...animalFormData, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setCreateDialogOpen(false);
                setAnimalFormData({
                  tag_number: '',
                  animal_type: '',
                  breed: '',
                  gender: '',
                  farm_id: '',
                  birth_date: '',
                  purchase_date: '',
                  purchase_price: '',
                  status: 'active',
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
              {submitting ? 'Adding...' : 'Add Animal'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Animal Dialog */}
      <Dialog 
        open={editDialogOpen !== null} 
        onClose={() => {
          setEditDialogOpen(null);
          setSelectedAnimal(null);
          setAnimalFormData({
            tag_number: '',
            animal_type: '',
            breed: '',
            gender: '',
            farm_id: '',
            birth_date: '',
            purchase_date: '',
            purchase_price: '',
            status: 'active',
            notes: '',
            image: null,
            imagePreview: null,
            current_weight: '',
            sire_id: '',
            dam_id: '',
            lineage: '',
            genetic_markers: '',
            breeding_value: '',
            parentage_verified: false,
            is_castrated: false,
            castration_date: '',
            castration_method: '',
            castration_notes: ''
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        {selectedAnimal && (
          <form onSubmit={handleEditAnimal}>
            <DialogTitle>
              <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>Edit Animal</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField 
                  label="Tag Number" 
                  fullWidth 
                  required 
                  value={animalFormData.tag_number}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, tag_number: e.target.value })}
                />
                <TextField
                  label="Animal Type"
                  fullWidth
                  select
                  required
                  value={animalFormData.animal_type}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, animal_type: e.target.value, breed: '' })}
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
                  fullWidth
                  select
                  value={animalFormData.breed}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, breed: e.target.value })}
                  disabled={!animalFormData.animal_type}
                  helperText={!animalFormData.animal_type ? 'Please select an animal type first' : ''}
                >
                  <MenuItem value="">Select Breed</MenuItem>
                  {animalFormData.animal_type && getBreedsForAnimalType(animalFormData.animal_type).map((breedOption) => (
                    <MenuItem key={breedOption.name} value={breedOption.name}>
                      {breedOption.name}
                      {breedOption.origin && ` (${breedOption.origin})`}
                    </MenuItem>
                  ))}
                </TextField>
                
                {/* Animal Photo Upload */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                    Animal Photo
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {animalFormData.imagePreview ? (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          src={animalFormData.imagePreview}
                          alt="Animal preview"
                          sx={{ width: 120, height: 120, border: '2px solid #e0e0e0' }}
                          variant="rounded"
                        />
                        <IconButton
                          size="small"
                          onClick={() => setAnimalFormData({ ...animalFormData, image: null, imagePreview: null })}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                            width: 28,
                            height: 28
                          }}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: '#f5f5f5',
                          border: '2px dashed #ccc',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#eeeeee', borderColor: '#4caf50' }
                        }}
                        variant="rounded"
                        onClick={() => document.getElementById('animal-image-upload-edit')?.click()}
                      >
                        <ImageIcon size={32} color="#999" />
                        <Typography variant="caption" sx={{ mt: 0.5, color: '#666' }}>
                          No photo
                        </Typography>
                      </Avatar>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="animal-image-upload-edit"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Image size must be less than 5MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAnimalFormData({
                                ...animalFormData,
                                image: file,
                                imagePreview: reader.result as string
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        component="label"
                        htmlFor="animal-image-upload-edit"
                        startIcon={<Upload size={18} />}
                        sx={{
                          borderColor: '#4caf50',
                          color: '#2d5016',
                          '&:hover': { borderColor: '#45a049', bgcolor: '#f1f8f4' }
                        }}
                      >
                        {animalFormData.imagePreview ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                        Max size: 5MB (JPG, PNG)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <TextField
                  label="Gender"
                  fullWidth
                  select
                  required
                  value={animalFormData.gender}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, gender: e.target.value, is_castrated: e.target.value === 'female' ? false : animalFormData.is_castrated })}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </TextField>
                {animalFormData.gender === 'male' && (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={animalFormData.is_castrated}
                          onChange={(e) => setAnimalFormData({ ...animalFormData, is_castrated: e.target.checked })}
                        />
                      }
                      label="Castrated"
                    />
                    {animalFormData.is_castrated && (
                      <>
                        <TextField
                          label="Castration Date"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={animalFormData.castration_date}
                          onChange={(e) => setAnimalFormData({ ...animalFormData, castration_date: e.target.value })}
                        />
                        <TextField
                          label="Castration Method"
                          fullWidth
                          select
                          value={animalFormData.castration_method}
                          onChange={(e) => setAnimalFormData({ ...animalFormData, castration_method: e.target.value })}
                        >
                          <MenuItem value="surgical">Surgical</MenuItem>
                          <MenuItem value="banding">Banding (Elastrator)</MenuItem>
                          <MenuItem value="chemical">Chemical</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </TextField>
                        <TextField
                          label="Castration Notes"
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Additional notes about castration"
                          value={animalFormData.castration_notes}
                          onChange={(e) => setAnimalFormData({ ...animalFormData, castration_notes: e.target.value })}
                        />
                      </>
                    )}
                  </>
                )}
                <TextField
                  label="Farm"
                  fullWidth
                  select
                  required
                  value={animalFormData.farm_id}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, farm_id: e.target.value })}
                >
                  {mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id).map((farm) => (
                    <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                      {farm.farm_name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Birth Date"
                  type="date"
                  fullWidth
                  value={animalFormData.birth_date}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, birth_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Current Weight (kg)"
                  type="number"
                  fullWidth
                  placeholder="e.g., 450"
                  value={animalFormData.current_weight}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, current_weight: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>
                  }}
                />
                
                {/* Genetic Data Section */}
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600, color: '#2d5016' }}>
                  Genetic Information
                </Typography>
                
                <TextField
                  select
                  label="Sire (Father)"
                  fullWidth
                  value={animalFormData.sire_id}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, sire_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {mockAnimals
                    .filter(a => a.gender === 'male' && a.tenant_id === currentUser?.tenant_id)
                    .map((animal) => (
                      <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                        {animal.tag_number} - {animal.breed || animal.animal_type}
                      </MenuItem>
                    ))}
                </TextField>
                
                <TextField
                  select
                  label="Dam (Mother)"
                  fullWidth
                  value={animalFormData.dam_id}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, dam_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {mockAnimals
                    .filter(a => a.gender === 'female' && a.tenant_id === currentUser?.tenant_id)
                    .map((animal) => (
                      <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                        {animal.tag_number} - {animal.breed || animal.animal_type}
                      </MenuItem>
                    ))}
                </TextField>
                
                <TextField
                  label="Lineage"
                  fullWidth
                  value={animalFormData.lineage}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, lineage: e.target.value })}
                  placeholder="e.g., Holstein-Friesian line"
                />
                
                <TextField
                  label="Genetic Markers"
                  fullWidth
                  value={animalFormData.genetic_markers}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, genetic_markers: e.target.value })}
                  placeholder="e.g., A1A1, BB, CC (comma separated)"
                  helperText="Enter genetic markers separated by commas"
                />
                
                <TextField
                  label="Breeding Value"
                  type="number"
                  fullWidth
                  value={animalFormData.breeding_value}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, breeding_value: e.target.value })}
                  placeholder="e.g., 85"
                  helperText="Breeding value score (0-100)"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={animalFormData.parentage_verified}
                      onChange={(e) => setAnimalFormData({ ...animalFormData, parentage_verified: e.target.checked })}
                    />
                  }
                  label="Parentage Verified"
                />
                
                <TextField
                  label="Status"
                  fullWidth
                  select
                  value={animalFormData.status}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="sold">Sold</MenuItem>
                  <MenuItem value="deceased">Deceased</MenuItem>
                  <MenuItem value="disposed">Disposed</MenuItem>
                </TextField>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={3}
                  value={animalFormData.notes}
                  onChange={(e) => setAnimalFormData({ ...animalFormData, notes: e.target.value })}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => {
                  setEditDialogOpen(null);
                  setSelectedAnimal(null);
                  setAnimalFormData({
                    tag_number: '',
                    animal_type: '',
                    breed: '',
                    gender: '',
                    farm_id: '',
                    birth_date: '',
                    purchase_date: '',
                    purchase_price: '',
                    status: 'active',
                    current_weight: '',
                    sire_id: '',
                    dam_id: '',
                    lineage: '',
                    genetic_markers: '',
                    breeding_value: '',
                    parentage_verified: false,
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
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* View Animal Dialog */}
      <Dialog 
        open={viewDialogOpen !== null} 
        onClose={() => {
          setViewDialogOpen(null);
          setSelectedAnimal(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>Animal Details</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedAnimal && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Tag Number</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedAnimal.tag_number}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{selectedAnimal.animal_type}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Breed</Typography>
                <Typography variant="body1">{selectedAnimal.breed || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Gender</Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{selectedAnimal.gender}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Farm</Typography>
                <Typography variant="body1">{getFarmName(selectedAnimal.farm_id)}</Typography>
              </Box>
              {selectedAnimal.birth_date && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Birth Date</Typography>
                  <Typography variant="body1">{new Date(selectedAnimal.birth_date).toLocaleDateString()}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip 
                  label={selectedAnimal.status} 
                  size="small"
                  sx={{ 
                    bgcolor: selectedAnimal.status === 'active' ? '#c8e6c9' : '#ffcdd2',
                    color: selectedAnimal.status === 'active' ? '#2d5016' : '#c62828',
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
              {selectedAnimal.notes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body1">{selectedAnimal.notes}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => {
            setViewDialogOpen(null);
            setSelectedAnimal(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
}

