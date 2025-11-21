/**
 * Castration Activity Form Component
 * Allows users to log castration procedures performed on male animals
 * Based on CASTRATION_ACTIVITY_FEATURE.md specifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  Box,
  Alert,
  InputAdornment,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { Scissors, AlertCircle, Info } from 'lucide-react';
import { Activity, Animal } from '@/types';
import { mockAnimals } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';
import { useRoleAccess } from './RoleBasedComponent';

interface CastrationActivityFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (activity: Partial<Activity>) => void;
  selectedAnimalId?: number;
}

const CASTRATION_METHODS = [
  { value: 'surgical', label: 'Surgical', description: 'Traditional surgical removal of testicles' },
  { value: 'banding', label: 'Banding (Elastration)', description: 'Rubber band method - less invasive' },
  { value: 'chemical', label: 'Chemical', description: 'Chemical injection method' },
  { value: 'other', label: 'Other', description: 'Other castration methods' },
];

export default function CastrationActivityForm({
  open,
  onClose,
  onSubmit,
  selectedAnimalId
}: CastrationActivityFormProps) {
  const currentUser = getCurrentUser();
  const { canLogCastration } = useRoleAccess();
  const [formData, setFormData] = useState({
    animal_id: selectedAnimalId?.toString() || '',
    activity_date: new Date().toISOString().split('T')[0],
    castration_method: '' as 'surgical' | 'banding' | 'chemical' | 'other' | '',
    description: '',
    veterinarian_name: '',
    post_care_instructions: '',
    cost: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter animals: only male, active, not already castrated
  const availableAnimals = mockAnimals.filter(animal => {
    if (currentUser?.tenant_id && animal.tenant_id !== currentUser.tenant_id) return false;
    if (animal.gender !== 'male') return false;
    if (animal.status !== 'active') return false;
    if (animal.is_castrated) return false;
    return true;
  });

  // Pre-select animal if provided
  useEffect(() => {
    if (selectedAnimalId) {
      setFormData(prev => ({ ...prev, animal_id: selectedAnimalId.toString() }));
    }
  }, [selectedAnimalId]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        animal_id: selectedAnimalId?.toString() || '',
        activity_date: new Date().toISOString().split('T')[0],
        castration_method: '',
        description: '',
        veterinarian_name: '',
        post_care_instructions: '',
        cost: '',
        notes: '',
      });
      setErrors({});
    }
  }, [open, selectedAnimalId]);

  const selectedAnimal = availableAnimals.find(
    a => a.animal_id === Number(formData.animal_id)
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.animal_id) {
      newErrors.animal_id = 'Please select an animal';
    } else if (selectedAnimal?.is_castrated) {
      newErrors.animal_id = 'This animal is already castrated';
    }

    if (!formData.activity_date) {
      newErrors.activity_date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.activity_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.activity_date = 'Date cannot be in the future';
      }
    }

    if (!formData.castration_method) {
      newErrors.castration_method = 'Castration method is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser || !canLogCastration) {
      alert('You do not have permission to log castration activities');
      return;
    }

    setSubmitting(true);

    // Build activity object
    const activity: Partial<Activity> = {
      activity_type: 'castration',
      animal_id: Number(formData.animal_id),
      activity_date: formData.activity_date,
      description: formData.description,
      performed_by_user_id: currentUser.user_id,
      cost: formData.cost ? Number(formData.cost) : undefined,
      notes: formData.notes || undefined,
      metadata: {
        castration_method: formData.castration_method as 'surgical' | 'banding' | 'chemical' | 'other',
        veterinarian_name: formData.veterinarian_name || undefined,
        post_care_instructions: formData.post_care_instructions || undefined,
        recovery_status: 'normal',
      },
    };

    try {
      onSubmit(activity);
      setSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Error submitting castration activity:', error);
      setSubmitting(false);
      alert('Failed to log castration activity. Please try again.');
    }
  };

  const getMethodInfo = (method: string) => {
    const methodInfo = CASTRATION_METHODS.find(m => m.value === method);
    return methodInfo?.description || '';
  };

  if (!canLogCastration) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Access Denied</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            You do not have permission to log castration activities.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Scissors size={24} color="#f59e0b" />
            <Typography variant="h5" fontWeight="600">
              Log Castration Activity
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Animal Selection */}
            <TextField
              select
              label="Animal *"
              fullWidth
              required
              value={formData.animal_id}
              onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
              error={!!errors.animal_id}
              helperText={errors.animal_id || (availableAnimals.length === 0 ? 'No eligible animals found (must be male, active, and not castrated)' : '')}
              disabled={!!selectedAnimalId}
            >
              {availableAnimals.map((animal) => (
                <MenuItem key={animal.animal_id} value={animal.animal_id.toString()}>
                  {animal.tag_number} - {animal.breed || animal.animal_type} ({animal.gender})
                </MenuItem>
              ))}
            </TextField>

            {selectedAnimal && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fef3c7' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Selected Animal Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={`Type: ${selectedAnimal.animal_type}`} size="small" />
                  <Chip label={`Breed: ${selectedAnimal.breed || 'N/A'}`} size="small" />
                  <Chip label={`Age: ${selectedAnimal.birth_date ? Math.floor((new Date().getTime() - new Date(selectedAnimal.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 'N/A'} months`} size="small" />
                </Box>
              </Paper>
            )}

            {/* Date */}
            <TextField
              label="Procedure Date *"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.activity_date}
              onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
              error={!!errors.activity_date}
              helperText={errors.activity_date}
            />

            {/* Castration Method */}
            <TextField
              select
              label="Castration Method *"
              fullWidth
              required
              value={formData.castration_method}
              onChange={(e) => setFormData({ ...formData, castration_method: e.target.value as any })}
              error={!!errors.castration_method}
              helperText={errors.castration_method || (formData.castration_method ? getMethodInfo(formData.castration_method) : '')}
            >
              {CASTRATION_METHODS.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Veterinarian Name */}
            <TextField
              label="Veterinarian Name (Optional)"
              fullWidth
              value={formData.veterinarian_name}
              onChange={(e) => setFormData({ ...formData, veterinarian_name: e.target.value })}
              placeholder="e.g., Dr. Sarah Wilson"
              helperText="Enter if procedure was supervised by a veterinarian"
            />

            {/* Description */}
            <TextField
              label="Description *"
              fullWidth
              required
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description || 'Brief description of the castration procedure'}
              placeholder="e.g., Routine castration using elastrator. Animal handled well."
            />

            {/* Post-Care Instructions */}
            <TextField
              label="Post-Care Instructions (Optional)"
              fullWidth
              multiline
              rows={4}
              value={formData.post_care_instructions}
              onChange={(e) => setFormData({ ...formData, post_care_instructions: e.target.value })}
              placeholder="e.g., Monitor for swelling, keep area clean, check after 7 days. Administer antibiotics 2x daily for 5 days."
              helperText="Care instructions for the recovery period"
            />

            {/* Cost */}
            <TextField
              label="Procedure Cost (Optional)"
              type="number"
              fullWidth
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
              }}
              helperText="Total cost including vet fees, materials, medications"
            />

            {/* Additional Notes */}
            <TextField
              label="Additional Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any observations, complications, or additional information"
            />

            {/* Info Alert */}
            {formData.castration_method && (
              <Alert 
                icon={<Info size={20} />} 
                severity="info"
                sx={{ mt: 1 }}
              >
                <Typography variant="body2" fontWeight="600" gutterBottom>
                  {CASTRATION_METHODS.find(m => m.value === formData.castration_method)?.label} Method
                </Typography>
                <Typography variant="caption" component="div">
                  {formData.castration_method === 'surgical' && (
                    <>Recovery: 7-14 days. Monitor wound for infection, keep area clean, administer antibiotics as prescribed.</>
                  )}
                  {formData.castration_method === 'banding' && (
                    <>Recovery: 2-4 weeks. Monitor for swelling (normal for first 48 hours), check band placement, testicles should fall off within 2-4 weeks.</>
                  )}
                  {formData.castration_method === 'chemical' && (
                    <>Follow veterinarian's specific post-injection instructions. Monitor injection site for reactions.</>
                  )}
                  {formData.castration_method === 'other' && (
                    <>Follow appropriate post-care procedures for the method used.</>
                  )}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={<Scissors size={18} />}
            sx={{
              bgcolor: '#f59e0b',
              '&:hover': { bgcolor: '#d97706' }
            }}
          >
            {submitting ? 'Logging...' : 'Log Castration Activity'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}





