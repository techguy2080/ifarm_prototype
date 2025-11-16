'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert
} from '@mui/material';
import { Database, RefreshCw, Download, Trash2, CheckCircle, AlertCircle, Activity, HardDrive } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';

export default function DatabaseManagementPage() {
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  // Check if user is super admin
  if (!currentUser || !currentUser.is_super_admin) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Super Admin access required.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  const handleBackup = () => {
    setActionSuccess('Database backup initiated. You will be notified when complete.');
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleOptimize = () => {
    setActionSuccess('Database optimization started.');
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const databaseStats = [
    { label: 'Total Size', value: '2.4 GB', status: 'normal' },
    { label: 'Tables', value: '47', status: 'normal' },
    { label: 'Indexes', value: '128', status: 'normal' },
    { label: 'Active Connections', value: '127 / 200', status: 'normal' },
    { label: 'Query Performance', value: '98.5%', status: 'excellent' },
    { label: 'Cache Hit Ratio', value: '94.2%', status: 'excellent' },
  ];

  const recentBackups = [
    { id: 1, date: '2024-01-20 02:00 AM', size: '2.3 GB', status: 'success', type: 'automated' },
    { id: 2, date: '2024-01-19 02:00 AM', size: '2.2 GB', status: 'success', type: 'automated' },
    { id: 3, date: '2024-01-18 02:00 AM', size: '2.2 GB', status: 'success', type: 'automated' },
    { id: 4, date: '2024-01-17 02:00 AM', size: '2.1 GB', status: 'success', type: 'automated' },
  ];

  const tableSizes = [
    { name: 'animals', size: '850 MB', rows: '125,430', status: 'normal' },
    { name: 'activities', size: '420 MB', rows: '89,230', status: 'normal' },
    { name: 'audit_logs', size: '380 MB', rows: '245,120', status: 'normal' },
    { name: 'users', size: '120 MB', rows: '1,450', status: 'normal' },
    { name: 'sales', size: '280 MB', rows: '12,340', status: 'normal' },
    { name: 'expenses', size: '150 MB', rows: '8,920', status: 'normal' },
  ];

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
                <Database size={32} color="white" strokeWidth={2} />
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
                  Database Management
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Monitor database health, backups, and performance
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshCw size={20} />}
                  onClick={handleOptimize}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Optimize
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download size={20} />}
                  onClick={handleBackup}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Backup Now
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Success Alert */}
        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        {/* Database Statistics */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Activity size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                Database Statistics
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Metric</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {databaseStats.map((stat, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{stat.label}</TableCell>
                      <TableCell>{stat.value}</TableCell>
                      <TableCell>
                        <Chip
                          label={stat.status === 'excellent' ? 'Excellent' : 'Normal'}
                          size="small"
                          color={stat.status === 'excellent' ? 'success' : 'default'}
                          icon={stat.status === 'excellent' ? <CheckCircle size={16} /> : <Activity size={16} />}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Table Sizes */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <HardDrive size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                Table Sizes
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Table Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rows</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableSizes.map((table) => (
                    <TableRow key={table.name} hover>
                      <TableCell sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{table.name}</TableCell>
                      <TableCell>{table.size}</TableCell>
                      <TableCell>{table.rows}</TableCell>
                      <TableCell>
                        <Chip
                          label={table.status}
                          size="small"
                          color="success"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Recent Backups */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Download size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                Recent Backups
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBackups.map((backup) => (
                    <TableRow key={backup.id} hover>
                      <TableCell>{backup.date}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>
                        <Chip
                          label={backup.type}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={backup.status}
                          size="small"
                          color="success"
                          icon={<CheckCircle size={16} />}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download size={14} />}
                            sx={{
                              borderColor: 'success.main',
                              color: 'success.main',
                              '&:hover': {
                                borderColor: 'success.dark',
                                background: alpha('#16a34a', 0.05)
                              }
                            }}
                          >
                            Download
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Trash2 size={14} />}
                            color="error"
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}




