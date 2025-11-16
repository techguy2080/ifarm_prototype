'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Stack,
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
import { Search, Eye, Beef } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockAnimals } from '@/lib/mockData';

interface AnimalTypeSummary {
  type: string;
  total: number;
  active: number;
  male: number;
  female: number;
  breeds: string[];
  avgAge?: number;
}

export default function HelperAnimalTypesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_animals'))) {
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

  // Group animals by type
  const animalTypesMap = new Map<string, AnimalTypeSummary>();
  
  mockAnimals.forEach(animal => {
    if (!animalTypesMap.has(animal.animal_type)) {
      animalTypesMap.set(animal.animal_type, {
        type: animal.animal_type,
        total: 0,
        active: 0,
        male: 0,
        female: 0,
        breeds: [],
        avgAge: 0
      });
    }
    
    const summary = animalTypesMap.get(animal.animal_type)!;
    summary.total++;
    if (animal.status === 'active') summary.active++;
    if (animal.gender === 'male') summary.male++;
    if (animal.gender === 'female') summary.female++;
    if (animal.breed && !summary.breeds.includes(animal.breed)) {
      summary.breeds.push(animal.breed);
    }
    
    if (animal.birth_date) {
      const birthDate = new Date(animal.birth_date);
      const today = new Date();
      const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      summary.avgAge = (summary.avgAge || 0) + ageInDays;
    }
  });

  // Calculate average age
  animalTypesMap.forEach((summary, type) => {
    const animalsWithAge = mockAnimals.filter(a => a.animal_type === type && a.birth_date);
    if (animalsWithAge.length > 0) {
      summary.avgAge = Math.round(summary.avgAge! / animalsWithAge.length);
    }
  });

  const animalTypes = Array.from(animalTypesMap.values());
  
  const filteredTypes = animalTypes.filter(type =>
    type.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.breeds.some(breed => breed.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      cattle: '🐄',
      goat: '🐐',
      sheep: '🐑',
      pig: '🐷',
      chicken: '🐔',
      duck: '🦆'
    };
    return icons[type] || '🐾';
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
                <Beef size={32} color="white" strokeWidth={2} />
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
                  Animal Types
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  View animal types and breeds in the system
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8f4' }}>
          <TextField
            fullWidth
            placeholder="Search by animal type or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'white' }}
          />
        </Paper>

        {/* Animal Types Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Male</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Female</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Avg Age</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Breeds</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2d5016' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No animal types found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTypes.map((type) => (
                  <TableRow key={type.type} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5">{getTypeIcon(type.type)}</Typography>
                        <Typography fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                          {type.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{type.total}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" sx={{ color: '#2d5016' }}>
                        {type.active}
                      </Typography>
                    </TableCell>
                    <TableCell>{type.male}</TableCell>
                    <TableCell>{type.female}</TableCell>
                    <TableCell>
                      {type.avgAge ? (
                        <Typography>{Math.floor(type.avgAge / 30)} months</Typography>
                      ) : (
                        <Typography color="text.secondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {type.breeds.slice(0, 3).map(breed => (
                          <Chip 
                            key={breed}
                            label={breed} 
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#2d5016', fontSize: '0.7rem' }}
                          />
                        ))}
                        {type.breeds.length > 3 && (
                          <Chip 
                            label={`+${type.breeds.length - 3}`} 
                            size="small"
                            sx={{ bgcolor: '#f5f5f5', color: '#666', fontSize: '0.7rem' }}
                          />
                        )}
                        {type.breeds.length === 0 && (
                          <Typography variant="caption" color="text.secondary">N/A</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#4caf50' }}
                        component={Link}
                        href={`/dashboard/helper/animal-types/${type.type}`}
                      >
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashboardContainer>
  );
}

