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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { 
  mockAnimals, 
  mockExternalFarms, 
  mockExternalAnimals,
  mockAnimalHireAgreements,
  mockExternalAnimalHireAgreements
} from '@/lib/mockData';
import Link from 'next/link';

const steps = ['Animal & Sire Selection', 'Breeding Details', 'Pregnancy Tracking', 'Review'];

export default function RecordBreedingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [breedingFormData, setBreedingFormData] = useState({
    animal_id: '',
    sire_source: 'internal' as 'internal' | 'external',
    sire_id: '',
    external_farm_id: '',
    external_animal_id: '',
    animal_hire_agreement_id: '',
    external_animal_hire_agreement_id: '',
    breeding_date: '',
    breeding_method: 'natural',
    conception_date: '',
    expected_due_date: '',
    pregnancy_status: 'suspected',
    actual_birth_date: '',
    birth_outcome: '',
    offspring_count: '',
    complications: '',
    notes: ''
  });
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

  const handleNext = () => {
    // Validation based on step
    if (activeStep === 0) {
      if (!breedingFormData.animal_id) {
        alert('Please select an animal');
        return;
      }
      if (breedingFormData.sire_source === 'internal' && !breedingFormData.sire_id) {
        alert('Please select a sire for internal breeding');
        return;
      }
      if (breedingFormData.sire_source === 'external' && (!breedingFormData.external_farm_id || !breedingFormData.external_animal_id)) {
        alert('Please select an external farm and animal');
        return;
      }
    }
    if (activeStep === 1 && !breedingFormData.breeding_date) {
      alert('Please select a breeding date');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleConceptionDateChange = (date: string) => {
    setBreedingFormData({ ...breedingFormData, conception_date: date });
    if (date) {
      const conception = new Date(date);
      const dueDate = new Date(conception);
      dueDate.setDate(dueDate.getDate() + 280); // ~9 months for cattle
      setBreedingFormData(prev => ({
        ...prev,
        conception_date: date,
        expected_due_date: dueDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Breeding record created successfully! (Prototype)');
      setSubmitting(false);
      router.push('/dashboard/helper/pregnancy');
    }, 1000);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Animal (Female)"
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

            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>Sire Source</FormLabel>
              <RadioGroup
                row
                value={breedingFormData.sire_source}
                onChange={(e) => setBreedingFormData({ 
                  ...breedingFormData, 
                  sire_source: e.target.value as 'internal' | 'external',
                  sire_id: '',
                  external_farm_id: '',
                  external_animal_id: ''
                })}
              >
                <FormControlLabel value="internal" control={<Radio />} label="My Farm" />
                <FormControlLabel value="external" control={<Radio />} label="External Farm" />
              </RadioGroup>
            </FormControl>

            {breedingFormData.sire_source === 'internal' ? (
              <>
                <TextField
                  label="Sire/Bull (Internal)"
                  fullWidth
                  select
                  required
                  value={breedingFormData.sire_id}
                  onChange={(e) => setBreedingFormData({ ...breedingFormData, sire_id: e.target.value })}
                >
                  <MenuItem value="">Select a sire</MenuItem>
                  {mockAnimals.filter(a => 
                    a.gender === 'male' && 
                    a.status === 'active' && 
                    a.tenant_id === currentUser?.tenant_id &&
                    !a.is_castrated
                  ).map((animal) => (
                    <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                      {animal.tag_number} - {animal.breed || animal.animal_type}
                    </MenuItem>
                  ))}
                </TextField>
                {breedingFormData.animal_id && (
                  <TextField
                    label="Link to Animal Hire Agreement (Optional)"
                    fullWidth
                    select
                    value={breedingFormData.animal_hire_agreement_id}
                    onChange={(e) => setBreedingFormData({ ...breedingFormData, animal_hire_agreement_id: e.target.value })}
                    helperText="Link if this animal was hired out to another farm"
                  >
                    <MenuItem value="">No hire agreement</MenuItem>
                    {mockAnimalHireAgreements
                      .filter(agreement => 
                        agreement.status === 'active' &&
                        agreement.animal_id?.toString() === breedingFormData.animal_id &&
                        agreement.tenant_id === currentUser?.tenant_id &&
                        agreement.agreement_type === 'hire_out'
                      )
                      .map((agreement) => (
                        <MenuItem key={agreement.agreement_id} value={agreement.agreement_id.toString()}>
                          Agreement #{agreement.agreement_id} - {agreement.start_date} to {agreement.end_date || 'Ongoing'}
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              </>
            ) : (
              <>
                <TextField
                  label="External Farm"
                  fullWidth
                  select
                  required
                  value={breedingFormData.external_farm_id}
                  onChange={(e) => setBreedingFormData({ 
                    ...breedingFormData, 
                    external_farm_id: e.target.value,
                    external_animal_id: ''
                  })}
                >
                  <MenuItem value="">Select external farm</MenuItem>
                  {mockExternalFarms.filter(f => f.is_active && f.tenant_id === currentUser?.tenant_id).map((farm) => (
                    <MenuItem key={farm.external_farm_id} value={farm.external_farm_id.toString()}>
                      {farm.farm_name} - {farm.location || farm.district || ''}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="External Animal"
                  fullWidth
                  select
                  required
                  disabled={!breedingFormData.external_farm_id}
                  value={breedingFormData.external_animal_id}
                  onChange={(e) => setBreedingFormData({ 
                    ...breedingFormData, 
                    external_animal_id: e.target.value,
                    external_animal_hire_agreement_id: ''
                  })}
                >
                  <MenuItem value="">Select external animal</MenuItem>
                  {mockExternalAnimals
                    .filter(a => 
                      a.external_farm_id.toString() === breedingFormData.external_farm_id &&
                      (a.gender === 'male' || !a.gender)
                    )
                    .map((animal) => (
                      <MenuItem key={animal.external_animal_id} value={animal.external_animal_id.toString()}>
                        {animal.tag_number || 'Untagged'} - {animal.breed || animal.animal_type} ({animal.gender || 'unknown'})
                      </MenuItem>
                    ))}
                </TextField>
                {breedingFormData.external_animal_id && (
                  <TextField
                    label="Link to Hire Agreement (Optional)"
                    fullWidth
                    select
                    value={breedingFormData.external_animal_hire_agreement_id}
                    onChange={(e) => setBreedingFormData({ ...breedingFormData, external_animal_hire_agreement_id: e.target.value })}
                    helperText="Link this breeding to an active external animal hire agreement"
                  >
                    <MenuItem value="">No hire agreement</MenuItem>
                    {mockExternalAnimalHireAgreements
                      .filter(agreement => 
                        agreement.status === 'active' &&
                        agreement.external_animal_id?.toString() === breedingFormData.external_animal_id &&
                        agreement.tenant_id === currentUser?.tenant_id
                      )
                      .map((agreement) => (
                        <MenuItem key={agreement.agreement_id} value={agreement.agreement_id.toString()}>
                          Agreement #{agreement.agreement_id} - {agreement.start_date} to {agreement.end_date || 'Ongoing'}
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              </>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
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
              <MenuItem value="artificial_insemination">Artificial Insemination</MenuItem>
              <MenuItem value="embryo_transfer">Embryo Transfer</MenuItem>
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
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={4}
              placeholder="Additional information about the breeding..."
              value={breedingFormData.notes}
              onChange={(e) => setBreedingFormData({ ...breedingFormData, notes: e.target.value })}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Alert severity="info">
              Fill in pregnancy tracking information. You can update this later after confirmation.
            </Alert>

            <TextField
              label="Conception Date (Optional)"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={breedingFormData.conception_date}
              onChange={(e) => handleConceptionDateChange(e.target.value)}
              helperText="If provided, expected due date will be auto-calculated"
            />

            <TextField
              label="Expected Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={breedingFormData.expected_due_date}
              onChange={(e) => setBreedingFormData({ ...breedingFormData, expected_due_date: e.target.value })}
              helperText="Auto-calculated from conception date if provided"
            />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#2d5016', mt: 2 }}>
              Birth Information (Optional - fill after birth)
            </Typography>

            <TextField
              label="Actual Birth Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={breedingFormData.actual_birth_date}
              onChange={(e) => setBreedingFormData({ ...breedingFormData, actual_birth_date: e.target.value })}
              disabled={breedingFormData.pregnancy_status !== 'completed'}
            />

            <TextField
              label="Birth Outcome"
              fullWidth
              select
              value={breedingFormData.birth_outcome}
              onChange={(e) => setBreedingFormData({ ...breedingFormData, birth_outcome: e.target.value })}
              disabled={breedingFormData.pregnancy_status !== 'completed'}
            >
              <MenuItem value="">Not recorded</MenuItem>
              <MenuItem value="successful">Successful</MenuItem>
              <MenuItem value="stillborn">Stillborn</MenuItem>
              <MenuItem value="aborted">Aborted</MenuItem>
              <MenuItem value="complications">Complications</MenuItem>
            </TextField>

            <TextField
              label="Offspring Count"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              value={breedingFormData.offspring_count}
              onChange={(e) => setBreedingFormData({ ...breedingFormData, offspring_count: e.target.value })}
              disabled={breedingFormData.pregnancy_status !== 'completed'}
              helperText="Number of offspring born"
            />

            <TextField
              label="Complications"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe any complications during birth..."
              value={breedingFormData.complications}
              onChange={(e) => setBreedingFormData({ ...breedingFormData, complications: e.target.value })}
              disabled={breedingFormData.pregnancy_status !== 'completed' || breedingFormData.birth_outcome !== 'complications'}
              helperText="Only enabled if birth outcome is 'complications'"
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <Alert severity="success" icon={<CheckCircle />}>
              Review all information before submitting
            </Alert>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>Summary</Typography>
              <Stack spacing={1}>
                <Typography variant="body2"><strong>Animal:</strong> {mockAnimals.find(a => a.animal_id.toString() === breedingFormData.animal_id)?.tag_number || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Sire Source:</strong> {breedingFormData.sire_source === 'internal' ? 'My Farm' : 'External Farm'}</Typography>
                <Typography variant="body2"><strong>Breeding Date:</strong> {breedingFormData.breeding_date || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Breeding Method:</strong> {breedingFormData.breeding_method || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Pregnancy Status:</strong> {breedingFormData.pregnancy_status || 'N/A'}</Typography>
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
      <Box sx={{ p: 4, maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            component={Link}
            href="/dashboard/helper/pregnancy"
            startIcon={<ArrowLeft />}
            sx={{ color: '#2d5016' }}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="600" sx={{ color: '#2d5016' }}>
              Record New Breeding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new breeding record for your animals
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              <Box sx={{ minHeight: '400px', py: 2 }}>
                {renderStepContent()}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ color: '#2d5016' }}
                >
                  Back
                </Button>
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      startIcon={<Save />}
                      sx={{
                        bgcolor: '#4caf50',
                        '&:hover': { bgcolor: '#45a049' },
                        fontWeight: 600
                      }}
                    >
                      {submitting ? 'Saving...' : 'Save Breeding Record'}
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
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}

