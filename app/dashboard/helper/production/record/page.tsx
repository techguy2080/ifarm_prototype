'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowLeft, Save, CheckCircle, Droplet } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals, mockFarms, mockProduction } from '@/lib/mockData';
import Link from 'next/link';

const steps = ['Select Type & Farm', 'Select Animal', 'Enter Quantity & Quality', 'Review'];

export default function RecordProductionPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [productionFormData, setProductionFormData] = useState({
    production_type: 'milk',
    farm_id: '',
    animal_id: '',
    production_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'liters',
    quality_notes: ''
  });
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'create_general'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don&apos;t have permission to record production.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  const tenantFarms = mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id);
  const getFilteredAnimals = () => {
    return mockAnimals.filter(a => 
      a.status === 'active' && 
      a.tenant_id === currentUser?.tenant_id &&
      (!productionFormData.farm_id || a.farm_id.toString() === productionFormData.farm_id)
    );
  };

  const handleNext = () => {
    // Validation based on step
    if (activeStep === 0) {
      if (!productionFormData.production_type || !productionFormData.farm_id) {
        alert('Please select production type and farm');
        return;
      }
    }
    if (activeStep === 1 && !productionFormData.animal_id) {
      alert('Please select an animal');
      return;
    }
    if (activeStep === 2 && (!productionFormData.quantity || !productionFormData.production_date)) {
      alert('Please fill in quantity and production date');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRecord = {
        production_id: mockProduction.length + 1,
        tenant_id: currentUser.tenant_id,
        farm_id: Number(productionFormData.farm_id),
        animal_id: Number(productionFormData.animal_id),
        production_type: productionFormData.production_type,
        production_date: productionFormData.production_date,
        quantity: Number(productionFormData.quantity),
        unit: productionFormData.unit,
        quality_notes: productionFormData.quality_notes || undefined,
        recorded_by_user_id: currentUser.user_id,
        created_at: new Date().toISOString()
      };
      
      mockProduction.push(newRecord);
      alert('Production record created successfully!');
      setSubmitting(false);
      router.push('/dashboard/helper/production');
    }, 1000);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 1: Select Production Type & Farm
            </Typography>
            <TextField
              select
              label="Production Type"
              value={productionFormData.production_type}
              onChange={(e) => {
                const type = e.target.value;
                const unitMap: Record<string, string> = {
                  milk: 'liters',
                  eggs: 'pieces',
                  wool: 'kg',
                  honey: 'kg'
                };
                setProductionFormData({ 
                  ...productionFormData, 
                  production_type: type,
                  unit: unitMap[type] || 'kg'
                });
              }}
              required
              fullWidth
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
              onChange={(e) => setProductionFormData({ 
                ...productionFormData, 
                farm_id: e.target.value,
                animal_id: '' // Reset animal when farm changes
              })}
              required
              fullWidth
            >
              <MenuItem value="">Select a farm</MenuItem>
              {tenantFarms.map((farm) => (
                <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                  {farm.farm_name} - {farm.location || farm.district || ''}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 2: Select Animal
            </Typography>
            {!productionFormData.farm_id ? (
              <Alert severity="info">
                Please select a farm in the previous step first.
              </Alert>
            ) : (
              <TextField
                select
                label="Animal"
                value={productionFormData.animal_id}
                onChange={(e) => setProductionFormData({ ...productionFormData, animal_id: e.target.value })}
                required
                fullWidth
              >
                <MenuItem value="">Select an animal</MenuItem>
                {getFilteredAnimals().map((animal) => (
                  <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                    {animal.tag_number} - {animal.breed || animal.animal_type} ({animal.animal_type})
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 3: Enter Quantity & Quality
            </Typography>
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
        );

      case 3:
        const selectedAnimal = mockAnimals.find(a => a.animal_id.toString() === productionFormData.animal_id);
        const selectedFarm = mockFarms.find(f => f.farm_id.toString() === productionFormData.farm_id);
        
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 4: Review & Confirm
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#f1f8f4', borderRadius: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Production Type</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                    {productionFormData.production_type}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Farm</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedFarm?.farm_name || 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Animal</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedAnimal?.tag_number || 'N/A'} - {selectedAnimal?.breed || selectedAnimal?.animal_type || 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Production Date</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {new Date(productionFormData.production_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {productionFormData.quantity} {productionFormData.unit}
                  </Typography>
                </Box>
                {productionFormData.quality_notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Quality Notes</Typography>
                      <Typography variant="body1">
                        {productionFormData.quality_notes}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
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
                  Record Production
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Step-by-step guide to record production data
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {renderStepContent()}

            <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={activeStep === 0 ? () => router.push('/dashboard/helper/production') : handleBack}
                disabled={submitting}
              >
                {activeStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button 
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  sx={{
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#45a049' },
                    fontWeight: 600
                  }}
                >
                  {submitting ? 'Recording...' : 'Record Production'}
                </Button>
              ) : (
                <Button 
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#45a049' },
                    fontWeight: 600
                  }}
                >
                  Next
                </Button>
              )}
            </Stack>
          </form>
        </Paper>
      </Box>
    </DashboardContainer>
  );
}

