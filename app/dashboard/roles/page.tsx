'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  Paper,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Fade
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Edit, Delete, Add } from '@mui/icons-material';
import { Users } from 'lucide-react';
import { mockRoles, mockPermissions } from '@/lib/mockData';

export default function RolesPage() {
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);

  const handleExpand = (roleId: number) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
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
                <Users size={32} color="white" strokeWidth={2} />
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
                  Custom Roles
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Tenant-specific roles created by selecting permissions from the library.
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              href="/dashboard/roles/create"
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
              Create Role
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

      {/* Roles List */}
      <Grid container spacing={3}>
        {mockRoles.map((role, index) => (
          <Grid item xs={12} md={6} key={role.role_id}>
            <Fade in timeout={300 * (index + 1)}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(22, 163, 74, 0.2)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" fontWeight="700" gutterBottom>
                        {role.name}
                      </Typography>
                      {role.template_id && (
                        <Chip
                          label="From Template"
                          size="small"
                          sx={{
                            background: alpha('#16a34a', 0.1),
                            color: 'success.main',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                    <Chip
                      label={`${role.permissions.length} permissions`}
                      sx={{
                        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  {role.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {role.description}
                    </Typography>
                  )}

                  {/* Expanded Permissions View */}
                  <Box>
                    <Button
                      fullWidth
                      onClick={() => handleExpand(role.role_id)}
                      endIcon={
                        <ExpandMoreIcon
                          sx={{
                            transform: expandedRole === role.role_id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }}
                        />
                      }
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        color: 'success.main'
                      }}
                    >
                      {expandedRole === role.role_id ? 'Hide' : 'Show'} Details
                    </Button>
                    <Collapse in={expandedRole === role.role_id}>
                      <Paper sx={{ mt: 2, p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2, border: '1px solid', borderColor: alpha('#16a34a', 0.1) }}>
                        <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'success.main' }}>
                          Permissions:
                        </Typography>
                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                          {role.permissions.map((perm) => (
                            <Box
                              key={perm.permission_id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'white',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'success.main',
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.1)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="600">
                                  {perm.display_name}
                                </Typography>
                                <Chip
                                  label={perm.category}
                                  size="small"
                                  sx={{
                                    background: alpha('#16a34a', 0.1),
                                    color: 'success.main',
                                    textTransform: 'capitalize',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                              <Chip
                                label={perm.name}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  borderColor: 'success.main',
                                  color: 'success.main'
                                }}
                              />
                            </Box>
                          ))}
                        </Stack>
                        {role.policies && role.policies.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'warning.main' }}>
                              ABAC Policies:
                            </Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              {role.policies.map((policy) => (
                                <Paper
                                  key={policy.policy_id}
                                  sx={{
                                    p: 1.5,
                                    bgcolor: alpha('#fbbf24', 0.1),
                                    border: '1px solid',
                                    borderColor: alpha('#fbbf24', 0.3)
                                  }}
                                >
                                  <Typography variant="body2" fontWeight="600">
                                    {policy.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Priority: {policy.priority}
                                  </Typography>
                                </Paper>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Paper>
                    </Collapse>
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                      component={Link}
                      href={`/dashboard/roles/edit/${role.role_id}`}
                      variant="outlined"
                      startIcon={<Edit />}
                      fullWidth
                      size="small"
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
                      sx={{ fontWeight: 600 }}
                      onClick={() => setDeleteDialogOpen(role.role_id)}
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

      {mockRoles.length === 0 && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h2" sx={{ mb: 2 }}>🔐</Typography>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                No custom roles created yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Get started by creating your first custom role
              </Typography>
              <Button
                component={Link}
                href="/dashboard/roles/create"
                variant="contained"
                startIcon={<Add />}
                sx={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5
                }}
              >
                Create Your First Role
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen !== null}
        onClose={() => setDeleteDialogOpen(null)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Role?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this role? This action cannot be undone and will affect all users assigned to this role.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(null)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={() => setDeleteDialogOpen(null)} 
            color="error" 
            variant="contained"
            sx={{ fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}
