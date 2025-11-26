'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  alpha,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Calendar, Plus, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockLeaveRequests, mockEmployees } from '@/lib/mockData';
import type { LeaveRequest } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentUser = getCurrentUser();

  // Check permissions
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'manage_users'))) {
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

  const filteredLeave = useMemo(() => {
    return mockLeaveRequests.filter(l => {
      const employeeName = `${l.employee?.user?.first_name || ''} ${l.employee?.user?.last_name || ''}`.toLowerCase();
      return employeeName.includes(searchTerm.toLowerCase()) ||
             l.leave_type.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  const pendingLeave = filteredLeave.filter(l => l.status === 'pending');
  const approvedLeave = filteredLeave.filter(l => l.status === 'approved');
  const rejectedLeave = filteredLeave.filter(l => l.status === 'rejected');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} />;
      case 'rejected':
        return <XCircle size={18} />;
      case 'pending':
        return <Clock size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: alpha('#10b981', 0.2), color: '#047857' };
      case 'rejected':
        return { bg: alpha('#ef4444', 0.2), color: '#dc2626' };
      case 'pending':
        return { bg: alpha('#f59e0b', 0.2), color: '#d97706' };
      default:
        return { bg: alpha('#6b7280', 0.2), color: '#4b5563' };
    }
  };

  const handleViewDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setDialogOpen(true);
  };

  const handleApprove = () => {
    // TODO: Implement approval logic
    setDialogOpen(false);
  };

  const handleReject = () => {
    // TODO: Implement rejection logic
    setDialogOpen(false);
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
                  <Calendar size={32} color="white" strokeWidth={2} />
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
                    Leave Management
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Manage employee leave requests and calendar
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                Pending Requests
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {pendingLeave.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                Approved This Month
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                {approvedLeave.length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Tabs */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={`All (${filteredLeave.length})`} />
              <Tab label={`Pending (${pendingLeave.length})`} />
              <Tab label={`Approved (${approvedLeave.length})`} />
              <Tab label={`Rejected (${rejectedLeave.length})`} />
            </Tabs>
          </Box>

          {/* Search */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder="Search by employee name or leave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TabPanel value={activeTab} index={0}>
            <LeaveTable 
              leave={filteredLeave} 
              formatDate={formatDate} 
              getStatusIcon={getStatusIcon} 
              getStatusColor={getStatusColor}
              onViewDetails={handleViewDetails}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <LeaveTable 
              leave={pendingLeave} 
              formatDate={formatDate} 
              getStatusIcon={getStatusIcon} 
              getStatusColor={getStatusColor}
              onViewDetails={handleViewDetails}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <LeaveTable 
              leave={approvedLeave} 
              formatDate={formatDate} 
              getStatusIcon={getStatusIcon} 
              getStatusColor={getStatusColor}
              onViewDetails={handleViewDetails}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <LeaveTable 
              leave={rejectedLeave} 
              formatDate={formatDate} 
              getStatusIcon={getStatusIcon} 
              getStatusColor={getStatusColor}
              onViewDetails={handleViewDetails}
            />
          </TabPanel>
        </Card>

        {/* Leave Details Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Leave Request Details
          </DialogTitle>
          <DialogContent>
            {selectedLeave && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Employee</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedLeave.employee?.user?.first_name} {selectedLeave.employee?.user?.last_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Leave Type</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {selectedLeave.leave_type.replace('_', ' ')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Period</Typography>
                  <Typography variant="body1">
                    {formatDate(selectedLeave.start_date)} - {formatDate(selectedLeave.end_date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({selectedLeave.days_requested} days)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Reason</Typography>
                  <Typography variant="body1">
                    {selectedLeave.reason}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip 
                    icon={getStatusIcon(selectedLeave.status)}
                    label={selectedLeave.status} 
                    size="small"
                    sx={{
                      ...getStatusColor(selectedLeave.status),
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      mt: 1
                    }}
                  />
                </Box>
                {selectedLeave.notes && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Notes</Typography>
                    <Typography variant="body2">
                      {selectedLeave.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            {selectedLeave?.status === 'pending' && (
              <>
                <Button onClick={handleReject} color="error">
                  Reject
                </Button>
                <Button onClick={handleApprove} variant="contained" sx={{ background: '#10b981' }}>
                  Approve
                </Button>
              </>
            )}
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}

function LeaveTable({ leave, formatDate, getStatusIcon, getStatusColor, onViewDetails }: {
  leave: LeaveRequest[];
  formatDate: (dateString: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => { bg: string; color: string };
  onViewDetails: (leave: LeaveRequest) => void;
}) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ background: alpha('#10b981', 0.1) }}>
            <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leave.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No leave requests found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            leave.map((request) => {
              const statusColors = getStatusColor(request.status);
              return (
                <TableRow key={request.leave_id} hover>
                  <TableCell>
                    {request.employee?.user?.first_name} {request.employee?.user?.last_name}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {request.employee?.employee_number}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {request.leave_type.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{formatDate(request.start_date)}</TableCell>
                  <TableCell>{formatDate(request.end_date)}</TableCell>
                  <TableCell>{request.days_requested}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(request.status)}
                      label={request.status} 
                      size="small"
                      sx={{
                        background: statusColors.bg,
                        color: statusColors.color,
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => onViewDetails(request)}
                      sx={{ color: '#047857' }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


