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
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { Search, Plus, Eye, Calendar, Droplet, TrendingUp, Filter } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockProduction, mockAnimals, mockFarms } from '@/lib/mockData';
import { Production } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HelperProductionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [productionType, setProductionType] = useState<'all' | 'milk' | 'eggs' | 'wool' | 'honey'>('all');
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<number | null>(null);
  const [productionFormData, setProductionFormData] = useState({
    animal_id: '',
    farm_id: '',
    production_type: 'milk',
    production_date: '',
    quantity: '',
    unit: 'liters',
    quality_notes: ''
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

  // Filter production records by tenant
  const tenantProduction = mockProduction.filter(p => p.tenant_id === currentUser?.tenant_id);
  
  const filteredProduction = tenantProduction.filter(prod => {
    const matchesSearch = 
      prod.animal_id ? mockAnimals.find(a => a.animal_id === prod.animal_id)?.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) : false ||
      prod.farm_id ? mockFarms.find(f => f.farm_id === prod.farm_id)?.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesType = productionType === 'all' || prod.production_type === productionType;
    return matchesSearch && matchesType;
  });

  // Group production by animal for detailed view
  const productionByAnimal = filteredProduction.reduce((acc, prod) => {
    if (!prod.animal_id) return acc;
    const animalId = prod.animal_id;
    if (!acc[animalId]) {
      const animal = mockAnimals.find(a => a.animal_id === animalId);
      acc[animalId] = {
        animal,
        records: [],
        totalQuantity: 0,
        averageQuantity: 0,
        lastProductionDate: ''
      };
    }
    acc[animalId].records.push(prod);
    acc[animalId].totalQuantity += prod.quantity;
    const prodDate = new Date(prod.production_date);
    const lastDate = acc[animalId].lastProductionDate ? new Date(acc[animalId].lastProductionDate) : new Date(0);
    if (prodDate > lastDate) {
      acc[animalId].lastProductionDate = prod.production_date;
    }
    acc[animalId].averageQuantity = acc[animalId].totalQuantity / acc[animalId].records.length;
    return acc;
  }, {} as Record<number, {
    animal: typeof mockAnimals[0] | undefined;
    records: Production[];
    totalQuantity: number;
    averageQuantity: number;
    lastProductionDate: string;
  }>);

  const getFarmName = (farmId: number) => {
    const farm = mockFarms.find(f => f.farm_id === farmId);
    return farm?.farm_name || 'Unknown Farm';
  };

  const getAnimalTag = (animalId?: number) => {
    if (!animalId) return 'N/A';
    const animal = mockAnimals.find(a => a.animal_id === animalId);
    return animal?.tag_number || 'Unknown';
  };

  const handleCreateProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productionFormData.animal_id || !productionFormData.farm_id || !productionFormData.production_date || !productionFormData.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      alert(`Production record would be created! (Prototype)`);
      setSubmitting(false);
      setCreateDialogOpen(false);
      setProductionFormData({
        animal_id: '',
        farm_id: '',
        production_type: 'milk',
        production_date: '',
        quantity: '',
        unit: 'liters',
        quality_notes: ''
      });
    }, 500);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get animals for the current tenant's farms
  const tenantFarms = mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id);
  const tenantFarmIds = tenantFarms.map(f => f.farm_id);
  const availableAnimals = mockAnimals.filter(a => 
    tenantFarmIds.includes(a.farm_id) && a.status === 'active'
  );

  // Filter animals by production type (e.g., only female animals for milk)
  const getFilteredAnimals = () => {
    if (productionFormData.production_type === 'milk') {
      return availableAnimals.filter(a => a.gender === 'female' && (a.animal_type === 'cattle' || a.animal_type === 'goat'));
    }
    if (productionFormData.production_type === 'eggs') {
      return availableAnimals.filter(a => a.animal_type === 'chicken' || a.animal_type === 'duck');
    }
    return availableAnimals;
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
                  <Droplet size={32} color="white" strokeWidth={2} />
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
                    Production Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Record and track production per animal (milk, eggs, wool, honey)
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
                Record Production
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="All Records" />
            <Tab label="By Animal" />
          </Tabs>
        </Paper>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by animal tag or farm name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Production Type"
              value={productionType}
              onChange={(e) => setProductionType(e.target.value as any)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="milk">Milk</MenuItem>
              <MenuItem value="eggs">Eggs</MenuItem>
              <MenuItem value="wool">Wool</MenuItem>
              <MenuItem value="honey">Honey</MenuItem>
            </TextField>
          </Stack>
        </Paper>

        {/* Tab Panel 1: All Records */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animal</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Farm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Quality Notes</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProduction.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No production records found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProduction.map((prod) => (
                    <TableRow key={prod.production_id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={16} color="#666" />
                          {new Date(prod.production_date).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getAnimalTag(prod.animal_id)} 
                          size="small" 
                          sx={{ bgcolor: '#e8f5e9', color: '#2d5016' }}
                        />
                      </TableCell>
                      <TableCell>{getFarmName(prod.farm_id)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={prod.production_type} 
                          size="small" 
                          sx={{ 
                            bgcolor: prod.production_type === 'milk' ? '#e3f2fd' : 
                                     prod.production_type === 'eggs' ? '#fff3e0' : 
                                     prod.production_type === 'wool' ? '#f3e5f5' : '#e8f5e9',
                            color: '#2d5016'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{prod.quantity}</TableCell>
                      <TableCell>{prod.unit}</TableCell>
                      <TableCell>{prod.quality_notes || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setViewDialogOpen(prod.production_id)}
                          sx={{ color: '#4caf50' }}
                        >
                          <Eye size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab Panel 2: By Animal */}
        <TabPanel value={activeTab} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Animal</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Farm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Total Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Avg per Record</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Records</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Last Production</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(productionByAnimal).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No production records by animal found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(productionByAnimal).map(([animalId, data]) => {
                    const firstRecord = data.records[0];
                    return (
                      <TableRow key={animalId} hover>
                        <TableCell>
                          <Chip 
                            label={data.animal?.tag_number || 'Unknown'} 
                            size="small" 
                            sx={{ bgcolor: '#e8f5e9', color: '#2d5016', fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>{getFarmName(firstRecord.farm_id)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={firstRecord.production_type} 
                            size="small" 
                            sx={{ 
                              bgcolor: firstRecord.production_type === 'milk' ? '#e3f2fd' : 
                                       firstRecord.production_type === 'eggs' ? '#fff3e0' : 
                                       firstRecord.production_type === 'wool' ? '#f3e5f5' : '#e8f5e9',
                              color: '#2d5016'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>
                          {data.totalQuantity.toFixed(2)} {firstRecord.unit}
                        </TableCell>
                        <TableCell>
                          {data.averageQuantity.toFixed(2)} {firstRecord.unit}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={data.records.length} 
                            size="small" 
                            sx={{ bgcolor: '#e8f5e9', color: '#2d5016' }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(data.lastProductionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setViewDialogOpen(parseInt(animalId))}
                            sx={{ color: '#4caf50' }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Create Production Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Record Production</DialogTitle>
          <form onSubmit={handleCreateProduction}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  select
                  label="Production Type"
                  value={productionFormData.production_type}
                  onChange={(e) => {
                    setProductionFormData({ ...productionFormData, production_type: e.target.value, unit: e.target.value === 'milk' ? 'liters' : e.target.value === 'eggs' ? 'pieces' : e.target.value === 'wool' ? 'kg' : 'kg' });
                  }}
                  required
                  fullWidth
                  SelectProps={{
                    native: false,
                  }}
                >
                  <MenuItem value="milk">Milk</MenuItem>
                  <MenuItem value="eggs">Eggs</MenuItem>
                  <MenuItem value="wool">Wool</MenuItem>
                  <MenuItem value="honey">Honey</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Farm"
                  value={productionFormData.farm_id}
                  onChange={(e) => setProductionFormData({ ...productionFormData, farm_id: e.target.value })}
                  required
                  fullWidth
                  SelectProps={{
                    native: false,
                  }}
                >
                  {tenantFarms.map((farm) => (
                    <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                      {farm.farm_name} - {farm.location}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Animal"
                  value={productionFormData.animal_id}
                  onChange={(e) => setProductionFormData({ ...productionFormData, animal_id: e.target.value })}
                  required
                  fullWidth
                  disabled={!productionFormData.farm_id}
                  SelectProps={{
                    native: false,
                  }}
                >
                  {getFilteredAnimals()
                    .filter(a => !productionFormData.farm_id || a.farm_id.toString() === productionFormData.farm_id)
                    .map((animal) => (
                      <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                        {animal.tag_number} - {animal.breed || animal.animal_type}
                      </MenuItem>
                    ))}
                </TextField>

                <TextField
                  label="Production Date"
                  type="date"
                  value={productionFormData.production_date}
                  onChange={(e) => setProductionFormData({ ...productionFormData, production_date: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={productionFormData.quantity}
                    onChange={(e) => setProductionFormData({ ...productionFormData, quantity: e.target.value })}
                    required
                    fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <TextField
                    select
                    label="Unit"
                    value={productionFormData.unit}
                    onChange={(e) => setProductionFormData({ ...productionFormData, unit: e.target.value })}
                    required
                    sx={{ minWidth: 150 }}
                    SelectProps={{
                      native: false,
                    }}
                  >
                    <MenuItem value="liters">Liters</MenuItem>
                    <MenuItem value="kg">Kilograms</MenuItem>
                    <MenuItem value="pieces">Pieces</MenuItem>
                    <MenuItem value="dozen">Dozen</MenuItem>
                  </TextField>
                </Stack>

                <TextField
                  label="Quality Notes (Optional)"
                  multiline
                  rows={3}
                  value={productionFormData.quality_notes}
                  onChange={(e) => setProductionFormData({ ...productionFormData, quality_notes: e.target.value })}
                  fullWidth
                  placeholder="Add any quality notes or observations..."
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}>
                {submitting ? 'Recording...' : 'Record Production'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* View Production Details Dialog */}
        {viewDialogOpen && (
          <Dialog open={!!viewDialogOpen} onClose={() => setViewDialogOpen(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Production Details</DialogTitle>
            <DialogContent>
              {activeTab === 0 ? (
                // Show single record details
                (() => {
                  const prod = filteredProduction.find(p => p.production_id === viewDialogOpen);
                  if (!prod) return null;
                  return (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Date</Typography>
                        <Typography variant="body1" fontWeight="bold">{new Date(prod.production_date).toLocaleDateString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Animal</Typography>
                        <Typography variant="body1" fontWeight="bold">{getAnimalTag(prod.animal_id)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Farm</Typography>
                        <Typography variant="body1">{getFarmName(prod.farm_id)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Type</Typography>
                        <Typography variant="body1">{prod.production_type}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Quantity</Typography>
                        <Typography variant="body1" fontWeight="bold">{prod.quantity} {prod.unit}</Typography>
                      </Box>
                      {prod.quality_notes && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Quality Notes</Typography>
                          <Typography variant="body1">{prod.quality_notes}</Typography>
                        </Box>
                      )}
                    </Stack>
                  );
                })()
              ) : (
                // Show animal summary with all records
                (() => {
                  const animalData = productionByAnimal[viewDialogOpen];
                  if (!animalData) return null;
                  return (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Animal</Typography>
                        <Typography variant="body1" fontWeight="bold">{animalData.animal?.tag_number || 'Unknown'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Production</Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#2d5016' }}>
                          {animalData.totalQuantity.toFixed(2)} {animalData.records[0]?.unit}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Average per Record</Typography>
                        <Typography variant="body1">{animalData.averageQuantity.toFixed(2)} {animalData.records[0]?.unit}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Records</Typography>
                        <Typography variant="body1">{animalData.records.length}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Last Production</Typography>
                        <Typography variant="body1">{new Date(animalData.lastProductionDate).toLocaleDateString()}</Typography>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Recent Records</Typography>
                        <Stack spacing={1}>
                          {animalData.records.slice(0, 5).map((record) => (
                            <Paper key={record.production_id} sx={{ p: 1.5, bgcolor: '#f1f8f4' }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">{new Date(record.production_date).toLocaleDateString()}</Typography>
                                <Typography variant="body2" fontWeight="bold">{record.quantity} {record.unit}</Typography>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  );
                })()
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </DashboardContainer>
  );
}

