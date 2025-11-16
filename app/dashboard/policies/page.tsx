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
  IconButton,
  alpha,
  Fade,
  Paper
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { Shield } from 'lucide-react';
import { mockRoles } from '@/lib/mockData';

// Mock policies data
const mockPolicies = [
  {
    policy_id: 1,
    name: 'Business Hours Only',
    description: 'Restricts access to business hours (8 AM - 6 PM)',
    priority: 100,
    effect: 'allow' as const,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    policy_id: 2,
    name: 'Weekday Access',
    description: 'Only allows access Monday through Friday',
    priority: 90,
    effect: 'allow' as const,
    created_at: '2024-01-16T00:00:00Z'
  },
];

export default function PoliciesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<number | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  const handleView = (policy: any) => {
    setSelectedPolicy(policy);
    setViewDialogOpen(policy.policy_id);
  };

  const handleDelete = (policyId: number) => {
    setDeleteDialogOpen(policyId);
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
                <Shield size={32} color="white" strokeWidth={2} />
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
                  ABAC Policies
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Create and manage advanced access control policies with time-based restrictions and conditions.
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              href="/dashboard/policies/create"
              variant="contained"
              startIcon={<Add />}
              size="large"
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
              Create Policy
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

      {/* Policies Grid */}
      <Grid container spacing={3}>
        {mockPolicies.map((policy, index) => (
          <Grid item xs={12} md={6} key={policy.policy_id}>
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight="600" gutterBottom>
                        {policy.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {policy.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip 
                          label={policy.effect === 'allow' ? 'Allow' : 'Deny'} 
                          size="small" 
                          color={policy.effect === 'allow' ? 'success' : 'error'}
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip 
                          label={`Priority: ${policy.priority}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        size="small"
                        onClick={() => handleView(policy)}
                        sx={{ flex: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        component={Link}
                        href={`/dashboard/policies/edit/${policy.policy_id}`}
                        variant="outlined"
                        startIcon={<Edit />}
                        size="small"
                        sx={{
                          flex: 1,
                          borderColor: 'success.main',
                          color: 'success.main',
                          '&:hover': {
                            borderColor: 'success.dark',
                            background: alpha('#16a34a', 0.05)
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(policy.policy_id)}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {mockPolicies.length === 0 && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Shield size={64} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
              <Typography variant="h6" fontWeight="600" gutterBottom>
                No policies created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create ABAC policies to add advanced access control rules with time restrictions.
              </Typography>
              <Button
                component={Link}
                href="/dashboard/policies/create"
                variant="contained"
                startIcon={<Add />}
                sx={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  fontWeight: 600
                }}
              >
                Create Policy
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* View Policy Dialog */}
      <Dialog 
        open={viewDialogOpen !== null} 
        onClose={() => setViewDialogOpen(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="600">{selectedPolicy?.name}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">
                {selectedPolicy?.description}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Effect
              </Typography>
              <Chip 
                label={selectedPolicy?.effect === 'allow' ? 'Allow' : 'Deny'} 
                color={selectedPolicy?.effect === 'allow' ? 'success' : 'error'}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Priority
              </Typography>
              <Typography variant="body1">{selectedPolicy?.priority}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body1">
                {selectedPolicy?.created_at ? new Date(selectedPolicy.created_at).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialogOpen(null)}>Close</Button>
          <Button 
            component={Link}
            href={`/dashboard/policies/edit/${selectedPolicy?.policy_id}`}
            variant="contained"
            startIcon={<Edit />}
            sx={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
              fontWeight: 600
            }}
          >
            Edit Policy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen !== null} 
        onClose={() => setDeleteDialogOpen(null)}
      >
        <DialogTitle>Delete Policy?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this policy? This action cannot be undone and will remove the policy from all assigned roles.
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

