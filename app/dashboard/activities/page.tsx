/**
 * Farm Activities Page
 * View and log all farm activities including castration
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper,
  alpha
} from '@mui/material';
import { 
  Activity, 
  Search, 
  Scissors, 
  Calendar, 
  Filter
} from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockActivities } from '@/lib/mockData';
import { Activity as ActivityType } from '@/types';
import CastrationActivityForm from '@/components/CastrationActivityForm';
import { useRoleAccess } from '@/components/RoleBasedComponent';

export default function ActivitiesPage() {
  const currentUser = getCurrentUser();
  const { canLogCastration } = useRoleAccess();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [castrationDialogOpen, setCastrationDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter activities by tenant
  const tenantActivities = mockActivities.filter(
    a => a.tenant_id === currentUser?.tenant_id
  );

  // Filter activities
  const filteredActivities = tenantActivities.filter(activity => {
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.animal?.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.performed_by?.first_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      activityTypeFilter === 'all' || 
      activity.activity_type === activityTypeFilter;

    return matchesSearch && matchesType;
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, activityTypeFilter]);

  // Sort activities by date (most recent first)
  const sortedActivities = [...filteredActivities].sort(
    (a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
  );

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated activities
  const paginatedActivities = sortedActivities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleLogCastration = () => {
    setCastrationDialogOpen(true);
  };

  const handleSubmitCastration = (activity: Partial<ActivityType>) => {
    // In a real app, this would make an API call
    console.log('Logging castration activity:', activity);
    alert(`Castration activity logged for animal ${activity.animal_id}! (Prototype - not saved)`);
    setCastrationDialogOpen(false);
  };

  const handleViewDetails = (activity: ActivityType) => {
    setSelectedActivity(activity);
    setViewDetailsDialogOpen(true);
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'castration':
        return 'warning';
      case 'health_check':
        return 'info';
      case 'vaccination':
        return 'success';
      case 'feeding':
        return 'primary';
      case 'breeding':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'castration':
        return <Scissors size={16} />;
      case 'health_check':
        return <Activity size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
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
                  <Activity size={32} color="white" strokeWidth={2} />
                </Box>
                <Box>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{
                      color: 'white',
                      mb: 0.5,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                    }}
                  >
                    Farm Activities
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontWeight: 400,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                  }}>
                    Track and manage all farm operations
                  </Typography>
                </Box>
              </Box>
              {canLogCastration && (
                <Button
                  variant="contained"
                  startIcon={<Scissors size={20} />}
                  onClick={handleLogCastration}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    mt: { xs: 2, sm: 0 },
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Log Castration
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#16a34a" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 2 }}
              />
              <TextField
                select
                label="Activity Type"
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                sx={{ minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Filter size={20} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Activities</MenuItem>
                <MenuItem value="castration">Castration</MenuItem>
                <MenuItem value="feeding">Feeding</MenuItem>
                <MenuItem value="breeding">Breeding</MenuItem>
                <MenuItem value="health_check">Health Check</MenuItem>
                <MenuItem value="vaccination">Vaccination</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Activities Table */}
        {filteredActivities.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Activity size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No activities found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canLogCastration && 'Click "Log Castration" to add your first activity'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Animal</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Performed By</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedActivities.map((activity) => (
                      <TableRow key={activity.activity_id} hover>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {new Date(activity.activity_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <Chip
                            icon={getActivityTypeIcon(activity.activity_type)}
                            label={activity.activity_type.replace('_', ' ')}
                            size="small"
                            color={getActivityTypeColor(activity.activity_type) as any}
                            sx={{ textTransform: 'capitalize', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {activity.animal ? (
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {activity.animal.tag_number}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, maxWidth: { xs: 150, sm: 200, md: 400 } }}>
                          <Typography variant="body2" sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: { xs: 2, sm: 3 },
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {activity.description}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                          {activity.activity_type === 'castration' && activity.metadata?.castration_method ? (
                            <Chip
                              label={activity.metadata.castration_method}
                              size="small"
                              sx={{ textTransform: 'capitalize', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                              color="warning"
                            />
                          ) : activity.activity_type === 'castration' && activity.metadata?.veterinarian_name ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {activity.metadata.veterinarian_name}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {activity.performed_by?.first_name} {activity.performed_by?.last_name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                          {activity.cost ? (
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              UGX {activity.cost.toLocaleString()}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetails(activity)}
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={sortedActivities.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Rows per page:"
                sx={{
                  borderTop: `1px solid ${alpha('#16a34a', 0.2)}`,
                  '& .MuiTablePagination-toolbar': {
                    px: 2,
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Castration Form Dialog */}
        <CastrationActivityForm
          open={castrationDialogOpen}
          onClose={() => setCastrationDialogOpen(false)}
          onSubmit={handleSubmitCastration}
        />

        {/* Activity Details Dialog */}
        <Dialog 
          open={viewDetailsDialogOpen} 
          onClose={() => setViewDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              m: { xs: 0, sm: 2 },
              borderRadius: { xs: 0, sm: 2 },
              maxHeight: { xs: '100vh', sm: '90vh' }
            }
          }}
        >
          {selectedActivity && (
            <>
              <DialogTitle>
                <Typography variant="h5" fontWeight="600" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  Activity Details
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Activity Type
                    </Typography>
                    <Chip
                      icon={getActivityTypeIcon(selectedActivity.activity_type)}
                      label={selectedActivity.activity_type.replace('_', ' ')}
                      color={getActivityTypeColor(selectedActivity.activity_type) as any}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Paper>

                  {selectedActivity.animal && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Animal
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {selectedActivity.animal.tag_number} - {selectedActivity.animal.breed || selectedActivity.animal.animal_type}
                      </Typography>
                    </Paper>
                  )}

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedActivity.activity_date).toLocaleDateString()}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {selectedActivity.description}
                    </Typography>
                  </Paper>

                  {selectedActivity.activity_type === 'castration' && selectedActivity.metadata && (
                    <>
                      {selectedActivity.metadata.castration_method && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Castration Method
                        </Typography>
                        <Chip
                          label={selectedActivity.metadata.castration_method}
                          color="warning"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Paper>
                      )}

                      {selectedActivity.metadata.veterinarian_name && (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Veterinarian
                          </Typography>
                          <Typography variant="body1">
                            {selectedActivity.metadata.veterinarian_name}
                          </Typography>
                        </Paper>
                      )}

                      {selectedActivity.metadata.post_care_instructions && (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Post-Care Instructions
                          </Typography>
                          <Typography variant="body1">
                            {selectedActivity.metadata.post_care_instructions}
                          </Typography>
                        </Paper>
                      )}
                    </>
                  )}

                  {selectedActivity.cost && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Cost
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        UGX {selectedActivity.cost.toLocaleString()}
                      </Typography>
                    </Paper>
                  )}

                  {selectedActivity.notes && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Additional Notes
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.notes}
                      </Typography>
                    </Paper>
                  )}

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Performed By
                    </Typography>
                    <Typography variant="body1">
                      {selectedActivity.performed_by?.first_name} {selectedActivity.performed_by?.last_name}
                    </Typography>
                  </Paper>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setViewDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}

