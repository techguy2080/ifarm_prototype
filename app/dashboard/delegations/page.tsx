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
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Fade
} from '@mui/material';
import { Add, Block, Visibility } from '@mui/icons-material';
import { ArrowRight } from 'lucide-react';
import { mockDelegations } from '@/lib/mockData';

export default function DelegationsPage() {
  const [activeFilter, setActiveFilter] = useState<'active' | 'all'>('active');
  const [revokeDialogOpen, setRevokeDialogOpen] = useState<number | null>(null);

  const filteredDelegations = activeFilter === 'active'
    ? mockDelegations.filter(d => d.status === 'active')
    : mockDelegations;

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: 'active' | 'all' | null,
  ) => {
    if (newFilter !== null) {
      setActiveFilter(newFilter);
    }
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
                <ArrowRight size={32} color="white" strokeWidth={2} />
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
                  Delegations
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Manage temporary access delegations for users. All delegated actions are audited.
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              href="/dashboard/delegations/create"
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
              Create Delegation
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
      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={activeFilter}
          exclusive
          onChange={handleFilterChange}
          aria-label="delegation filter"
          sx={{
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                color: 'white',
                borderColor: 'transparent',
                '&:hover': {
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                }
              }
            }
          }}
        >
          <ToggleButton value="active" aria-label="active">
            Active ({mockDelegations.filter(d => d.status === 'active').length})
          </ToggleButton>
          <ToggleButton value="all" aria-label="all">
            All ({mockDelegations.length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Delegations List */}
      <Stack spacing={3}>
        {filteredDelegations.map((delegation, index) => (
          <Fade in timeout={300 * (index + 1)} key={delegation.delegation_id}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
              border: '2px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'success.main',
                boxShadow: '0 8px 32px rgba(22, 163, 74, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                          width: 40, 
                          height: 40,
                          fontWeight: 700
                        }}>
                          {delegation.delegator.first_name[0]}
                        </Avatar>
                        <ArrowRight size={20} color="#16a34a" />
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                          width: 40, 
                          height: 40,
                          fontWeight: 700
                        }}>
                          {delegation.delegate.first_name[0]}
                        </Avatar>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          {delegation.delegator.first_name} → {delegation.delegate.first_name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            label={delegation.status}
                            color={
                              delegation.status === 'active' ? 'success' :
                              delegation.status === 'expired' ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                          />
                          <Chip
                            label={delegation.delegation_type}
                            size="small"
                            sx={{
                              background: alpha('#16a34a', 0.1),
                              color: 'success.main',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}
                          />
                        </Stack>
                      </Box>
                    </Box>

                    {delegation.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {delegation.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
                      <Box>
                        <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">
                            Start Date
                          </Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
                            {new Date(delegation.start_date).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Box>
                      <Box>
                        <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">
                            End Date
                          </Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
                            {new Date(delegation.end_date).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Box>
                      <Box>
                        <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">
                            Days Remaining
                          </Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5, color: 'success.main' }}>
                            {(() => {
                              const now = new Date().getTime();
                              const endDate = new Date(delegation.end_date).getTime();
                              return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                            })()} days
                          </Typography>
                        </Paper>
                      </Box>
                      <Box>
                        <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">
                            Created
                          </Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
                            {new Date(delegation.created_at).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Delegation Details */}
                    {delegation.delegation_type === 'permission' && delegation.delegated_permissions && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'success.main' }}>
                          Delegated Permissions:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {delegation.delegated_permissions.map((perm) => (
                            <Chip
                              key={perm.permission_id}
                              label={perm.display_name}
                              size="small"
                              sx={{
                                background: alpha('#16a34a', 0.1),
                                color: 'success.main',
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: alpha('#16a34a', 0.2)
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    {delegation.delegation_type === 'role' && delegation.delegated_role && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'success.main' }}>
                          Delegated Role:
                        </Typography>
                        <Chip
                          label={delegation.delegated_role.name}
                          size="small"
                          sx={{
                            background: alpha('#16a34a', 0.1),
                            color: 'success.main',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: alpha('#16a34a', 0.2)
                          }}
                        />
                      </Box>
                    )}
                    {delegation.restrictions && (
                      <Paper sx={{ p: 2, bgcolor: alpha('#fbbf24', 0.1), mt: 2, borderRadius: 2, border: '1px solid', borderColor: alpha('#fbbf24', 0.2) }}>
                        <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'warning.main' }}>
                          Restrictions:
                        </Typography>
                        {delegation.restrictions.time_restriction && (
                          <Typography variant="body2" fontWeight="600">
                            Time: {delegation.restrictions.time_restriction.start} - {delegation.restrictions.time_restriction.end}
                          </Typography>
                        )}
                        {delegation.restrictions.resource_restriction?.animal_ids && (
                          <Typography variant="body2" fontWeight="600">
                            Animals only: {delegation.restrictions.resource_restriction.animal_ids.length} selected
                          </Typography>
                        )}
                      </Paper>
                    )}
                  </Box>
                  <Stack direction="column" spacing={1} sx={{ ml: 2 }}>
                    {delegation.status === 'active' && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Block />}
                        size="small"
                        sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        onClick={() => setRevokeDialogOpen(delegation.delegation_id)}
                      >
                        Revoke
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      size="small"
                      sx={{
                        borderColor: 'success.main',
                        color: 'success.main',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          borderColor: 'success.dark',
                          background: alpha('#16a34a', 0.05)
                        }
                      }}
                    >
                      Details
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </Stack>

      {filteredDelegations.length === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h2" sx={{ mb: 2 }}>🔄</Typography>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                No delegations found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Get started by creating a delegation
              </Typography>
              <Button
                component={Link}
                href="/dashboard/delegations/create"
                variant="contained"
                startIcon={<Add />}
                sx={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5
                }}
              >
                Create Delegation
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={revokeDialogOpen !== null}
        onClose={() => setRevokeDialogOpen(null)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Revoke Delegation?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to revoke this delegation? This action cannot be undone and will immediately remove delegated access.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRevokeDialogOpen(null)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={() => setRevokeDialogOpen(null)} 
            color="error" 
            variant="contained"
            sx={{ fontWeight: 600 }}
          >
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}
