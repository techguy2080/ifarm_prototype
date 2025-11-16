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
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  alpha,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { Activity, Heart } from 'lucide-react';
import { mockAnimals, mockFarms } from '@/lib/mockData';
import { Animal } from '@/types';

export default function AnimalsPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold' | 'deceased'>('all');

  const filteredAnimals = filterStatus === 'all' 
    ? mockAnimals 
    : mockAnimals.filter(a => a.status === filterStatus);

  const handleView = (animal: Animal) => {
    setSelectedAnimal(animal);
    setViewDialogOpen(animal.animal_id);
  };

  const handleDelete = (animalId: number) => {
    setDeleteDialogOpen(animalId);
  };

  return (
    <Box sx={{ 
      p: { xs: 3, sm: 4, md: 5 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      justifyContent: 'center',
      '& > *': {
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
      },
    }}>
      <Box sx={{ width: '100%', maxWidth: '1400px' }}>
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
                <Activity size={32} color="white" strokeWidth={2} />
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
                  Animals Management
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontWeight: 600,
                    letterSpacing: '0',
                    lineHeight: 1.5
                  }}
                >
                  Track and manage all your livestock. View health status, breeding records, and animal history.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Add Animal
            </Button>
          </Box>
          {/* Decorative elements */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }} 
          />
          <Box 
            sx={{ 
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} 
          />
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              label="All"
              onClick={() => setFilterStatus('all')}
              color={filterStatus === 'all' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Active"
              onClick={() => setFilterStatus('active')}
              color={filterStatus === 'active' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Sold"
              onClick={() => setFilterStatus('sold')}
              color={filterStatus === 'sold' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Deceased"
              onClick={() => setFilterStatus('deceased')}
              color={filterStatus === 'deceased' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Animals Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#16a34a', 0.1) }}>
                <TableCell sx={{ fontWeight: 700 }}>Tag Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Breed</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Health</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Farm</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnimals.map((animal) => {
                const farm = mockFarms.find(f => f.farm_id === animal.farm_id);
                return (
                  <TableRow key={animal.animal_id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{animal.tag_number}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{animal.animal_type}</TableCell>
                    <TableCell>{animal.breed || 'N/A'}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{animal.gender}</TableCell>
                    <TableCell>
                      <Chip 
                        label={animal.status} 
                        size="small" 
                        color={
                          animal.status === 'active' ? 'success' :
                          animal.status === 'sold' ? 'warning' :
                          'default'
                        }
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={animal.health_status || 'Unknown'} 
                        size="small" 
                        variant="outlined"
                        icon={<Heart size={14} />}
                        color={
                          animal.health_status === 'healthy' ? 'success' :
                          animal.health_status === 'sick' ? 'error' :
                          'default'
                        }
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{farm?.farm_name || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleView(animal)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: 'success.main' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(animal.animal_id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredAnimals.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Activity size={64} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h6" fontWeight="600" gutterBottom>
              No animals found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filterStatus === 'all' 
                ? 'Add your first animal to start tracking livestock.'
                : `No animals with status "${filterStatus}".`}
            </Typography>
            {filterStatus === 'all' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  fontWeight: 600
                }}
              >
                Add Animal
              </Button>
            )}
          </Box>
        )}
      </Card>

      {/* Create Animal Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">Add New Animal</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Tag Number" fullWidth required placeholder="e.g., COW-001" />
            <TextField
              label="Animal Type"
              fullWidth
              select
              defaultValue=""
            >
              <MenuItem value="cattle">Cattle</MenuItem>
              <MenuItem value="goat">Goat</MenuItem>
              <MenuItem value="sheep">Sheep</MenuItem>
              <MenuItem value="pig">Pig</MenuItem>
              <MenuItem value="chicken">Chicken</MenuItem>
              <MenuItem value="duck">Duck</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField label="Breed" fullWidth placeholder="e.g., Holstein" />
            <TextField
              label="Gender"
              fullWidth
              select
              defaultValue=""
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
            <TextField
              label="Farm"
              fullWidth
              select
              defaultValue=""
            >
              {mockFarms.map((farm) => (
                <MenuItem key={farm.farm_id} value={farm.farm_id}>
                  {farm.farm_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Status"
              fullWidth
              select
              defaultValue="active"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="sold">Sold</MenuItem>
              <MenuItem value="deceased">Deceased</MenuItem>
              <MenuItem value="disposed">Disposed</MenuItem>
            </TextField>
            <TextField
              label="Health Status"
              fullWidth
              select
              defaultValue="healthy"
            >
              <MenuItem value="healthy">Healthy</MenuItem>
              <MenuItem value="sick">Sick</MenuItem>
              <MenuItem value="recovering">Recovering</MenuItem>
              <MenuItem value="quarantine">Quarantine</MenuItem>
            </TextField>
            <TextField
              label="Birth Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
              fontWeight: 600
            }}
          >
            Add Animal
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Animal Dialog */}
      <Dialog 
        open={viewDialogOpen !== null} 
        onClose={() => setViewDialogOpen(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">
            Animal Details - {selectedAnimal?.tag_number}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedAnimal && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tag Number</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedAnimal.tag_number}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                    {selectedAnimal.animal_type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Breed</Typography>
                  <Typography variant="body1">{selectedAnimal.breed || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedAnimal.gender}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedAnimal.status} 
                    size="small" 
                    color={selectedAnimal.status === 'active' ? 'success' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Health Status</Typography>
                  <Chip 
                    label={selectedAnimal.health_status || 'Unknown'} 
                    size="small" 
                    color={selectedAnimal.health_status === 'healthy' ? 'success' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialogOpen(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen !== null} 
        onClose={() => setDeleteDialogOpen(null)}
      >
        <DialogTitle>Delete Animal?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this animal? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(null)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => {
              setDeleteDialogOpen(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}

