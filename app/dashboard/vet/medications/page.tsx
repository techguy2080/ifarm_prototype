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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { Search, Plus, Pill, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';

// Mock medications data
const mockMedications = [
  {
    id: 1,
    name: 'Antibiotic Injection',
    animal_tag: 'COW-001',
    animal_name: 'Bella',
    dosage: '5ml',
    frequency: 'Once daily',
    start_date: '2024-01-20',
    end_date: '2024-01-27',
    status: 'active',
    prescribed_by: 'Dr. Sarah Smith'
  },
  {
    id: 2,
    name: 'Vitamin B12',
    animal_tag: 'COW-002',
    animal_name: 'Daisy',
    dosage: '10ml',
    frequency: 'Twice weekly',
    start_date: '2024-01-18',
    end_date: '2024-02-01',
    status: 'active',
    prescribed_by: 'Dr. Sarah Smith'
  },
  {
    id: 3,
    name: 'Deworming Medicine',
    animal_tag: 'CHK-001',
    animal_name: 'Hen Flock A',
    dosage: '2ml per bird',
    frequency: 'Single dose',
    start_date: '2024-01-15',
    end_date: '2024-01-15',
    status: 'completed',
    prescribed_by: 'Dr. Sarah Smith'
  },
];

export default function MedicationsPage() {
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

  const filteredMedications = mockMedications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.animal_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.animal_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Pill size={32} color="white" strokeWidth={2} />
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
                  Medications
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Track and manage animal medications and prescriptions
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
                Prescribe Medication
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search medications by name, animal tag, or animal name..."
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

        {/* Medications Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Medication</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Animal</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Dosage</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMedications.map((med) => (
                    <TableRow key={med.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="600">
                          {med.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {med.animal_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {med.animal_tag}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.frequency}</TableCell>
                      <TableCell>{new Date(med.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(med.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={med.status}
                          size="small"
                          color={med.status === 'active' ? 'success' : 'default'}
                          icon={med.status === 'active' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          sx={{
                            borderColor: 'success.main',
                            color: 'success.main',
                            '&:hover': {
                              borderColor: 'success.dark',
                              background: alpha('#16a34a', 0.05)
                            }
                          }}
                        >
                          View Details
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

