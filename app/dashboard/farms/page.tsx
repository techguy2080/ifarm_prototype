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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  alpha,
  Fade,
  Divider
} from '@mui/material';
import { Add, Edit, Delete, Users as UsersIcon, Business, LocationOn } from '@mui/icons-material';
import { Tractor } from 'lucide-react';
import { mockFarms, mockUsers, mockRoles } from '@/lib/mockData';

export default function FarmsPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

  const handleEdit = (farm: any) => {
    setSelectedFarm(farm);
    setEditDialogOpen(farm.farm_id);
  };

  const handleDelete = (farmId: number) => {
    setDeleteDialogOpen(farmId);
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
                <Tractor size={32} color="white" strokeWidth={2} />
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
                  Farms Management
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Manage your farms, assign users, and configure farm settings. Each farm operates independently with strict data isolation.
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
              Create Farm
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

      {/* Farms Grid */}
      <Grid container spacing={3}>
        {mockFarms.map((farm, index) => (
          <Grid item xs={12} md={6} lg={4} key={farm.farm_id}>
            <Fade in timeout={300 + (index * 100)}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(22, 163, 74, 0.2)',
                }
              }}>
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 2, 
                        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Business sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight="600" gutterBottom>
                          {farm.farm_name}
                        </Typography>
                        <Chip 
                          label={farm.status} 
                          size="small" 
                          color={farm.status === 'active' ? 'success' : 'default'}
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Stack spacing={1.5} sx={{ mb: 3, flex: 1 }}>
                    {farm.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {farm.location}
                        </Typography>
                      </Box>
                    )}
                    {farm.district && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          District: {farm.district}
                        </Typography>
                      </Box>
                    )}
                    {farm.farm_type && (
                      <Chip 
                        label={farm.farm_type} 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', width: 'fit-content' }}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      fullWidth
                      size="small"
                      onClick={() => handleEdit(farm)}
                      sx={{
                        borderColor: 'success.main',
                        color: 'success.main',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: 'success.dark',
                          background: alpha('#16a34a', 0.05)
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      fullWidth
                      size="small"
                      onClick={() => handleDelete(farm.farm_id)}
                      sx={{ fontWeight: 600 }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {mockFarms.length === 0 && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Tractor size={64} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
              <Typography variant="h6" fontWeight="600" gutterBottom>
                No farms created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first farm to start managing livestock and activities.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  fontWeight: 600
                }}
              >
                Create Farm
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Create Farm Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">Create New Farm</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Farm Name"
              fullWidth
              required
              placeholder="e.g., Main Farm"
            />
            <TextField
              label="Location"
              fullWidth
              placeholder="e.g., Kampala"
            />
            <TextField
              label="District"
              fullWidth
              placeholder="e.g., Kampala District"
            />
            <TextField
              label="Farm Type"
              fullWidth
              select
              defaultValue=""
            >
              <MenuItem value="dairy">Dairy</MenuItem>
              <MenuItem value="poultry">Poultry</MenuItem>
              <MenuItem value="beef">Beef</MenuItem>
              <MenuItem value="mixed">Mixed</MenuItem>
            </TextField>
            <TextField
              label="Status"
              fullWidth
              select
              defaultValue="active"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
              fontWeight: 600
            }}
          >
            Create Farm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Farm Dialog */}
      <Dialog 
        open={editDialogOpen !== null} 
        onClose={() => setEditDialogOpen(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">Edit Farm</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Farm Name"
              fullWidth
              required
              defaultValue={selectedFarm?.farm_name || ''}
            />
            <TextField
              label="Location"
              fullWidth
              defaultValue={selectedFarm?.location || ''}
            />
            <TextField
              label="District"
              fullWidth
              defaultValue={selectedFarm?.district || ''}
            />
            <TextField
              label="Farm Type"
              fullWidth
              select
              defaultValue={selectedFarm?.farm_type || ''}
            >
              <MenuItem value="dairy">Dairy</MenuItem>
              <MenuItem value="poultry">Poultry</MenuItem>
              <MenuItem value="beef">Beef</MenuItem>
              <MenuItem value="mixed">Mixed</MenuItem>
            </TextField>
            <TextField
              label="Status"
              fullWidth
              select
              defaultValue={selectedFarm?.status || 'active'}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(null)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
              fontWeight: 600
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen !== null} 
        onClose={() => setDeleteDialogOpen(null)}
      >
        <DialogTitle>Delete Farm?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this farm? This action cannot be undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(null)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => {
              // Handle delete
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

