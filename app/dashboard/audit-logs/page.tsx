'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Alert,
  alpha,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Visibility, Info as InfoIcon, Search as SearchIcon } from '@mui/icons-material';
import { FileSearch } from 'lucide-react';
import { mockAuditLogs } from '@/lib/mockData';

export default function AuditLogsPage() {
  const [selectedLog, setSelectedLog] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    date_from: '',
    date_to: '',
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesAction = !filters.action || log.action.toLowerCase().includes(filters.action.toLowerCase());
    const matchesEntity = !filters.entity_type || log.entity_type.toLowerCase().includes(filters.entity_type.toLowerCase());
    const matchesDateFrom = !filters.date_from || new Date(log.logged_at) >= new Date(filters.date_from);
    const matchesDateTo = !filters.date_to || new Date(log.logged_at) <= new Date(filters.date_to);
    
    return matchesAction && matchesEntity && matchesDateFrom && matchesDateTo;
  });

  const selectedLogData = selectedLog ? mockAuditLogs.find(l => l.audit_id === selectedLog) : null;

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
              <FileSearch size={32} color="white" strokeWidth={2} />
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
                Audit Logs
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                Complete audit trail of all user actions and access attempts.
              </Typography>
            </Box>
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

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 3, color: 'success.main' }}>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Action"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                placeholder="e.g., create_animal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'success.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'success.main',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'success.main',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Entity Type"
                value={filters.entity_type}
                onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                placeholder="e.g., animal"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'success.main',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'success.main',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'success.main',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'success.main',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'success.main',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'success.main',
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#16a34a', 0.05) }}>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.audit_id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha('#16a34a', 0.02)
                      }
                    }}
                    onClick={() => setSelectedLog(log.audit_id)}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontWeight="600">
                        {new Date(log.logged_at).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                          width: 32, 
                          height: 32,
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {log.user.first_name[0]}{log.user.last_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {log.user.first_name} {log.user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        sx={{
                          background: alpha('#16a34a', 0.1),
                          color: 'success.main',
                          fontWeight: 600,
                          border: '1px solid',
                          borderColor: alpha('#16a34a', 0.2)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {log.entity_type}
                        {log.entity_id && (
                          <Typography component="span" variant="caption" color="text.secondary">
                            {' '}#{log.entity_id}
                          </Typography>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {JSON.stringify(log.details)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        sx={{ 
                          color: 'success.main',
                          '&:hover': { bgcolor: alpha('#16a34a', 0.1) }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log.audit_id);
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredLogs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h2" sx={{ mb: 2 }}>📋</Typography>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                No audit logs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filter criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Selected Log Details Dialog */}
      <Dialog
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="700">
              Audit Log Details
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSelectedLog(null)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'error.main' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLogData && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      Timestamp
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
                      {new Date(selectedLogData.logged_at).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      User
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
                      {selectedLogData.user.first_name} {selectedLogData.user.last_name}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      Action
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
                      {selectedLogData.action}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      Entity
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ mt: 0.5 }}>
                      {selectedLogData.entity_type}
                      {selectedLogData.entity_id && ` #${selectedLogData.entity_id}`}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box>
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'success.main' }}>
                  Details
                </Typography>
                <Paper sx={{ p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2 }}>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0
                    }}
                  >
                    {JSON.stringify(selectedLogData.details, null, 2)}
                  </Typography>
                </Paper>
              </Box>

              {selectedLogData.policy_evaluation && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'warning.main' }}>
                    Policy Evaluation
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: alpha('#fbbf24', 0.1), borderRadius: 2, border: '1px solid', borderColor: alpha('#fbbf24', 0.2) }}>
                    <Typography
                      component="pre"
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        m: 0
                      }}
                    >
                      {JSON.stringify(selectedLogData.policy_evaluation, null, 2)}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setSelectedLog(null)}
            sx={{ fontWeight: 600, color: 'success.main' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Box */}
      <Alert
        icon={<InfoIcon />}
        severity="success"
        sx={{ 
          mt: 4,
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'success.light',
          background: alpha('#16a34a', 0.05)
        }}
      >
        <Typography variant="body2" fontWeight="500">
          <strong>About Audit Logs:</strong> All user actions, access attempts, and permission evaluations are logged here.
          Audit logs include user context, delegation information, policy evaluations, and complete action details. 
          Logs are immutable and provide full traceability.
        </Typography>
      </Alert>
      </Box>
    </Box>
  );
}
