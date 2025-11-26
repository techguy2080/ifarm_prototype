'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  alpha
} from '@mui/material';
import { Users, Plus, Search, Edit, Eye, Building2 } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockEmployees, mockFarms } from '@/lib/mockData';
import type { Employee } from '@/types';

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFarm, setFilterFarm] = useState<number | 'all'>('all');
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

  const filteredEmployees = useMemo(() => {
    let filtered = mockEmployees.filter(emp => {
      const matchesSearch = 
        emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFarm = filterFarm === 'all' || emp.farm_id === filterFarm;
      
      return matchesSearch && matchesFarm;
    });
    
    return filtered;
  }, [searchTerm, filterFarm]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
                    Employees
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Manage your workforce
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus />}
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
                Add Employee
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <Button
                variant={filterFarm === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterFarm('all')}
                startIcon={<Building2 />}
                sx={{
                  ...(filterFarm === 'all' ? {
                    background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #059669 100%)'
                    }
                  } : {
                    borderColor: '#10b981',
                    color: '#047857',
                    '&:hover': {
                      borderColor: '#059669',
                      background: alpha('#10b981', 0.1)
                    }
                  })
                }}
              >
                All Farms
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#10b981', 0.1) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee #</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Employment Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Salary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No employees found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.employee_id} hover>
                        <TableCell>{employee.employee_number}</TableCell>
                        <TableCell>
                          {employee.user?.first_name} {employee.user?.last_name}
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={employee.employment_type.replace('_', ' ')} 
                            size="small"
                            sx={{
                              textTransform: 'capitalize',
                              background: alpha('#10b981', 0.1),
                              color: '#047857',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(employee.salary_amount)} / {employee.salary_frequency}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={employee.is_active ? 'Active' : 'Inactive'} 
                            size="small"
                            sx={{
                              background: employee.is_active 
                                ? alpha('#10b981', 0.2) 
                                : alpha('#ef4444', 0.2),
                              color: employee.is_active ? '#047857' : '#dc2626',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" sx={{ color: '#047857' }}>
                              <Eye size={18} />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#047857' }}>
                              <Edit size={18} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}


