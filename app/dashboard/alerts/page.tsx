'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Paper,
  Grid,
  alpha,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { Bell, Clock, CheckCircle, X, AlertCircle, Milk, UtensilsCrossed, Pill, Stethoscope, Heart, Filter, Search } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAlerts, mockAnimals } from '@/lib/mockData';
import { Alert } from '@/types';

export default function AlertsPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_animals'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don&apos;t have permission to access this page.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  // Get alerts for current user's tenant
  const tenantAlerts = useMemo(() => {
    return mockAlerts.filter(alert => {
      if (!alert.animal_id) return true;
      const animal = mockAnimals.find(a => a.animal_id === alert.animal_id);
      return animal && animal.tenant_id === currentUser?.tenant_id;
    });
  }, [currentUser]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return tenantAlerts.filter(alert => {
      const matchesType = filterType === 'all' || alert.type === filterType;
      const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
      const matchesSearch = searchQuery === '' || 
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesView = true;
      if (viewMode === 'pending') matchesView = alert.status === 'pending';
      else if (viewMode === 'completed') matchesView = alert.status === 'completed';
      else if (viewMode === 'overdue') matchesView = alert.status === 'overdue';
      
      return matchesType && matchesPriority && matchesStatus && matchesSearch && matchesView;
    }).sort((a, b) => {
      // Sort by priority first, then by scheduled time
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
    });
  }, [tenantAlerts, filterType, filterPriority, filterStatus, searchQuery, viewMode]);

  // Pagination
  const paginatedAlerts = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredAlerts.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAlerts, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get alert icon
  const getAlertIcon = (type: string) => {
    const icons: Record<string, any> = {
      milking: Milk,
      feeding: UtensilsCrossed,
      vaccination: Pill,
      deworming: Pill,
      health_check: Stethoscope,
      breeding: Heart,
      other: Bell
    };
    return icons[type] || Bell;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: '#dc2626',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#16a34a'
    };
    return colors[priority] || '#6b7280';
  };

  const handleAlertAction = (alertId: number, action: 'complete' | 'dismiss') => {
    // In real app, would update alert status
    alert(`Alert ${action === 'complete' ? 'completed' : 'dismissed'}! (Prototype)`);
  };

  return (
    <DashboardContainer>
      <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
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
                <Bell size={32} color="white" strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{
                    color: 'white',
                    mb: 0.5,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Alerts & Notifications
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Monitor feeding, milking, vaccinations, and health check alerts for your farm
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} color="#6b7280" style={{ marginRight: 8 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Type"
                  size="small"
                  fullWidth
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="milking">Milking</MenuItem>
                  <MenuItem value="feeding">Feeding</MenuItem>
                  <MenuItem value="vaccination">Vaccination</MenuItem>
                  <MenuItem value="deworming">Deworming</MenuItem>
                  <MenuItem value="health_check">Health Check</MenuItem>
                  <MenuItem value="breeding">Breeding</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Priority"
                  size="small"
                  fullWidth
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Status"
                  size="small"
                  fullWidth
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="dismissed">Dismissed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Tabs value={viewMode} onChange={(_, newValue) => setViewMode(newValue)}>
                  <Tab label="All" value="all" sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }} />
                  <Tab label="Pending" value="pending" sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }} />
                  <Tab label="Overdue" value="overdue" sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }} />
                  <Tab label="Completed" value="completed" sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }} />
                </Tabs>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            {filteredAlerts.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha('#16a34a', 0.05) }}>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Animal</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Scheduled Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedAlerts.map((alert) => {
                      const Icon = getAlertIcon(alert.type);
                      const animal = alert.animal_id ? mockAnimals.find(a => a.animal_id === alert.animal_id) : null;
                      const isOverdue = alert.status === 'overdue' || (alert.status === 'pending' && new Date(alert.scheduled_time) < new Date());
                      
                      return (
                        <TableRow 
                          key={alert.alert_id}
                          sx={{ 
                            '&:hover': { bgcolor: alpha('#16a34a', 0.02) },
                            bgcolor: alert.priority === 'urgent' ? alpha('#dc2626', 0.03) : 
                                     alert.status === 'completed' ? alpha('#16a34a', 0.02) : 'white',
                            borderLeft: isOverdue ? '4px solid #dc2626' : 'none'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: 1, 
                                bgcolor: alpha(getPriorityColor(alert.priority), 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Icon size={18} color={getPriorityColor(alert.priority)} />
                              </Box>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {alert.type.replace('_', ' ')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {alert.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {alert.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {animal ? (
                              <Chip 
                                label={animal.tag_number}
                                size="small"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                All Animals
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.priority}
                              size="small"
                              sx={{
                                bgcolor: alpha(getPriorityColor(alert.priority), 0.1),
                                color: getPriorityColor(alert.priority),
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.status}
                              size="small"
                              icon={alert.status === 'completed' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              sx={{
                                bgcolor: alert.status === 'completed' 
                                  ? alpha('#16a34a', 0.1) 
                                  : alert.status === 'overdue' || isOverdue
                                  ? alpha('#dc2626', 0.1)
                                  : alpha('#f59e0b', 0.1),
                                color: alert.status === 'completed' 
                                  ? '#16a34a' 
                                  : alert.status === 'overdue' || isOverdue
                                  ? '#dc2626'
                                  : '#f59e0b',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Clock size={14} color="#6b7280" />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(alert.scheduled_time).toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {alert.status !== 'completed' && (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<CheckCircle size={14} />}
                                  onClick={() => handleAlertAction(alert.alert_id, 'complete')}
                                  sx={{ 
                                    bgcolor: '#16a34a',
                                    '&:hover': { bgcolor: '#15803d' },
                                    fontSize: '0.7rem',
                                    px: 1
                                  }}
                                >
                                  Complete
                                </Button>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAlertAction(alert.alert_id, 'dismiss')}
                                  sx={{ color: '#6b7280' }}
                                >
                                  <X size={16} />
                                </IconButton>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredAlerts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-toolbar': {
                    px: 2
                  }
                }}
              />
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Bell size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No alerts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or search query
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}

