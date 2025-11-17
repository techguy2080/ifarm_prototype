'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Save, Baby } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals } from '@/lib/mockData';
import Link from 'next/link';

const steps = ['Select Animal', 'Weaning Details', 'Health & Weight', 'Review'];

export default function RecordWeaningPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [weaningFormData, setWeaningFormData] = useState({
    animal_id: '',
    mother_id: '',
    weaning_date: new Date().toISOString().split('T')[0],
    age_at_weaning: '',
    weight_at_weaning: '',
    weaning_reason: 'standard',
    notes: ''
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
            You don&apos;t have permission to record weaning data.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  // Calculate age when animal is selected
  useEffect(() => {
    if (weaningFormData.animal_id && weaningFormData.weaning_date) {
      const animal = mockAnimals.find(a => a.animal_id.toString() === weaningFormData.animal_id);
      if (animal?.birth_date) {
        const birthDate = new Date(animal.birth_date);
        const weaningDate = new Date(weaningFormData.weaning_date);
        const ageInDays = Math.floor((weaningDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        if (ageInDays > 0) {
          setWeaningFormData(prev => ({ ...prev, age_at_weaning: ageInDays.toString() }));
        }
      }
    }
  }, [weaningFormData.animal_id, weaningFormData.weaning_date]);

  const handleNext = () => {
    // Validation based on step
    if (activeStep === 0 && !weaningFormData.animal_id) {
      alert('Please select an animal');
      return;
    }
    if (activeStep === 1 && !weaningFormData.weaning_date) {
      alert('Please select a weaning date');
      return;
    }
    if (activeStep === 2 && !weaningFormData.weight_at_weaning) {
      alert('Please enter weight at weaning');
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
      alert('Weaning record created successfully!');
      setSubmitting(false);
      router.push('/dashboard/helper/weaning');
    }, 1000);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 1: Select Animal
            </Typography>
            <TextField
              label="Animal (Offspring)"
              fullWidth
              select
              required
              value={weaningFormData.animal_id}
              onChange={(e) => {
                const animalId = e.target.value;
                const animal = mockAnimals.find(a => a.animal_id.toString() === animalId);
                setWeaningFormData({ 
                  ...weaningFormData, 
                  animal_id: animalId,
                  mother_id: animal?.mother_animal_id?.toString() || ''
                });
              }}
            >
              <MenuItem value="">Select an animal</MenuItem>
              {mockAnimals
                .filter(a => a.birth_date && a.status === 'active' && a.tenant_id === currentUser?.tenant_id)
                .map((animal) => {
                  const birthDate = new Date(animal.birth_date!);
                  const today = new Date();
                  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                      {animal.tag_number} - {ageInDays} days old ({animal.breed || animal.animal_type})
                    </MenuItem>
                  );
                })}
            </TextField>

            <TextField
              label="Mother (Optional)"
              fullWidth
              select
              value={weaningFormData.mother_id}
              onChange={(e) => setWeaningFormData({ ...weaningFormData, mother_id: e.target.value })}
              helperText="Auto-filled if known, or select manually"
            >
              <MenuItem value="">Unknown</MenuItem>
              {mockAnimals
                .filter(a => a.gender === 'female' && a.status === 'active' && a.tenant_id === currentUser?.tenant_id)
                .map((animal) => (
                  <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                    {animal.tag_number} - {animal.breed || animal.animal_type}
                  </MenuItem>
                ))}
            </TextField>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 2: Weaning Details
            </Typography>
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
              value={weaningFormData.age_at_weaning}
              onChange={(e) => setWeaningFormData({ ...weaningFormData, age_at_weaning: e.target.value })}
              helperText="Auto-calculated from birth date, or enter manually"
              inputProps={{ min: 0 }}
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
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 3: Health & Weight
            </Typography>
            <TextField
              label="Weight at Weaning (kg)"
              type="number"
              fullWidth
              required
              placeholder="0.0"
              inputProps={{ step: 0.1, min: 0 }}
              value={weaningFormData.weight_at_weaning}
              onChange={(e) => setWeaningFormData({ ...weaningFormData, weight_at_weaning: e.target.value })}
              helperText="Enter the weight of the animal at weaning"
            />

            <TextField
              label="Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              placeholder="Additional information about the weaning, health status, or observations..."
              value={weaningFormData.notes}
              onChange={(e) => setWeaningFormData({ ...weaningFormData, notes: e.target.value })}
            />
          </Stack>
        );

      case 3:
        const selectedAnimal = mockAnimals.find(a => a.animal_id.toString() === weaningFormData.animal_id);
        const selectedMother = mockAnimals.find(a => a.animal_id.toString() === weaningFormData.mother_id);
        
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 4: Review & Confirm
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#f1f8f4', borderRadius: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Animal (Offspring)</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedAnimal?.tag_number || 'N/A'} - {selectedAnimal?.breed || selectedAnimal?.animal_type || 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Mother</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedMother ? `${selectedMother.tag_number} - ${selectedMother.breed || selectedMother.animal_type}` : 'Unknown'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Weaning Date</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {new Date(weaningFormData.weaning_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Age at Weaning</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {weaningFormData.age_at_weaning} days
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Weight at Weaning</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {weaningFormData.weight_at_weaning} kg
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Weaning Reason</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                    {weaningFormData.weaning_reason.replace('_', ' ')}
                  </Typography>
                </Box>
                {weaningFormData.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Notes</Typography>
                      <Typography variant="body1">
                        {weaningFormData.notes}
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
                  Record Weaning
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Step-by-step guide to record weaning data
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
                onClick={activeStep === 0 ? () => router.push('/dashboard/helper/weaning') : handleBack}
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
                  {submitting ? 'Recording...' : 'Record Weaning'}
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

