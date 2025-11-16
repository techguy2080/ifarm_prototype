'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  alpha,
  CircularProgress,
  Paper
} from '@mui/material';
import { ArrowBack, Save, Delete as DeleteIcon } from '@mui/icons-material';
import { Shield } from 'lucide-react';

// Mock policy data
const mockPolicy = {
  policy_id: 1,
  name: 'Business Hours Only',
  description: 'Restricts access to business hours (8 AM - 6 PM)',
  priority: 100,
  effect: 'allow' as 'allow' | 'deny',
  time_conditions: [
    { attribute: 'environment.time', operator: 'between', value: ['08:00', '18:00'] }
  ],
};

function EditPolicyContent() {
  const params = useParams();
  const router = useRouter();
  const policyId = parseInt(params.id as string);

  const [policyData, setPolicyData] = useState({
    name: mockPolicy.name,
    description: mockPolicy.description,
    priority: mockPolicy.priority,
    effect: mockPolicy.effect,
    time_conditions: mockPolicy.time_conditions,
  });

  const addTimeCondition = () => {
    setPolicyData({
      ...policyData,
      time_conditions: [
        ...policyData.time_conditions,
        { attribute: 'environment.time', operator: 'between', value: ['08:00', '18:00'] },
      ],
    });
  };

  const updateTimeCondition = (index: number, field: string, value: any) => {
    const updated = [...policyData.time_conditions];
    updated[index] = { ...updated[index], [field]: value };
    setPolicyData({ ...policyData, time_conditions: updated });
  };

  const removeTimeCondition = (index: number) => {
    setPolicyData({
      ...policyData,
      time_conditions: policyData.time_conditions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Policy would be updated! (Prototype)');
    router.push('/dashboard/policies');
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
              <Shield size={32} color="white" strokeWidth={2} />
            </Box>
            <Box sx={{ flex: 1 }}>
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
                Edit ABAC Policy
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                Modify advanced access control policies with time-based restrictions.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/dashboard/policies"
              startIcon={<ArrowBack />}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Back
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

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* Policy Details */}
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                  Policy Details
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Policy Name"
                    fullWidth
                    required
                    value={policyData.name}
                    onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
                    placeholder="e.g., Business Hours Only"
                  />
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={policyData.description}
                    onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
                    placeholder="Describe what this policy does..."
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Priority"
                      type="number"
                      fullWidth
                      value={policyData.priority}
                      onChange={(e) => setPolicyData({ ...policyData, priority: parseInt(e.target.value) })}
                      helperText="Higher priority policies are evaluated first"
                    />
                    <TextField
                      label="Effect"
                      fullWidth
                      select
                      value={policyData.effect}
                      onChange={(e) => setPolicyData({ ...policyData, effect: e.target.value as 'allow' | 'deny' })}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="allow">Allow</option>
                      <option value="deny">Deny</option>
                    </TextField>
                  </Stack>
                </Stack>
              </Box>

              {/* Time Conditions */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    Time Conditions
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addTimeCondition}
                    sx={{
                      borderColor: 'success.main',
                      color: 'success.main',
                      '&:hover': {
                        borderColor: 'success.dark',
                        background: alpha('#16a34a', 0.05)
                      }
                    }}
                  >
                    Add Condition
                  </Button>
                </Box>
                <Stack spacing={2}>
                  {policyData.time_conditions.map((condition, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: alpha('#16a34a', 0.05) }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          label="Attribute"
                          size="small"
                          select
                          value={condition.attribute}
                          onChange={(e) => updateTimeCondition(index, 'attribute', e.target.value)}
                          SelectProps={{
                            native: true,
                          }}
                          sx={{ flex: 1 }}
                        >
                          <option value="environment.time">Time</option>
                          <option value="environment.day_of_week">Day of Week</option>
                          <option value="environment.date">Date</option>
                        </TextField>
                        <TextField
                          label="Operator"
                          size="small"
                          select
                          value={condition.operator}
                          onChange={(e) => updateTimeCondition(index, 'operator', e.target.value)}
                          SelectProps={{
                            native: true,
                          }}
                          sx={{ flex: 1 }}
                        >
                          <option value="between">Between</option>
                          <option value="not_between">Not Between</option>
                          <option value="equals">Equals</option>
                        </TextField>
                        <TextField
                          label="Value"
                          size="small"
                          value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
                          onChange={(e) => updateTimeCondition(index, 'value', e.target.value.includes(',') ? e.target.value.split(', ') : e.target.value)}
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeTimeCondition(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                  {policyData.time_conditions.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No time conditions added. Click "Add Condition" to create one.
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  component={Link}
                  href="/dashboard/policies"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{
                    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                    fontWeight: 600
                  }}
                >
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
      </Box>
    </Box>
  );
}

export default function EditPolicyPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <EditPolicyContent />
    </Suspense>
  );
}

