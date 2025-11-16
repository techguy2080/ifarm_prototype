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
  Paper,
  Stack,
  alpha,
  TextField,
  InputAdornment,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Search, Plus, Stethoscope, Heart, AlertCircle, CheckCircle, Calendar, Activity } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals } from '@/lib/mockData';

export default function AnimalTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'edit_health'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don't have permission to access this page.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  const filteredAnimals = mockAnimals.filter(animal =>
    animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const animalsNeedingAttention = mockAnimals.filter(a => 
    a.health_status === 'sick' || a.health_status === 'injured'
  );

  const healthyAnimals = mockAnimals.filter(a => a.health_status === 'healthy');

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
                <Stethoscope size={32} color="white" strokeWidth={2} />
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
                  Animal Health Tracking
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Monitor animal health status, vaccinations, and medical records
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
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
                Log Health Check
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4
        }}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
            border: '1px solid',
            borderColor: alpha('#dc2626', 0.2)
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#dc2626', 0.1), width: 56, height: 56 }}>
                  <AlertCircle size={28} color="#dc2626" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#dc2626' }}>
                    {animalsNeedingAttention}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Need Attention
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
            border: '1px solid',
            borderColor: alpha('#16a34a', 0.2)
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#16a34a', 0.1), width: 56, height: 56 }}>
                  <CheckCircle size={28} color="#16a34a" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                    {healthyAnimals.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Healthy Animals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
            border: '1px solid',
            borderColor: alpha('#16a34a', 0.2)
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#16a34a', 0.1), width: 56, height: 56 }}>
                  <Heart size={28} color="#16a34a" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                    5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Vaccinations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search animals by tag number or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#16a34a" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'white',
              }
            }}
          />
        </Box>

        {/* Animals Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Tag Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Animal Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Breed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Birth Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Health Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Check</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAnimals.map((animal) => (
                    <TableRow key={animal.animal_id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="600">
                          {animal.tag_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {animal.animal_type}
                        </Typography>
                      </TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{animal.gender}</TableCell>
                      <TableCell>
                        {new Date(animal.birth_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={animal.health_status}
                          size="small"
                          color={animal.health_status === 'healthy' ? 'success' : 'error'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(animal.updated_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                          startIcon={<Activity size={16} />}
                          sx={{
                            borderColor: 'success.main',
                            color: 'success.main',
                            '&:hover': {
                              borderColor: 'success.dark',
                              background: alpha('#16a34a', 0.05)
                            }
                          }}
                        >
                          View Records
                        </Button>
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

