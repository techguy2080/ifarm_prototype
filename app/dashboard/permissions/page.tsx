'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Stack,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  alpha,
  InputAdornment
} from '@mui/material';
import { Info as InfoIcon, Search as SearchIcon } from '@mui/icons-material';
import { Shield, Activity, FileText, Settings, Users, ClipboardList, BarChart } from 'lucide-react';
import { mockPermissions } from '@/lib/mockData';
import { Permission } from '@/types';

const categoryIcons: Record<string, any> = {
  animals: Users,
  activities: ClipboardList,
  reports: BarChart,
  management: Settings
};

const categoryColors: Record<string, string> = {
  animals: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
  activities: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
  reports: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
  management: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
};

export default function PermissionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['animals', 'activities', 'reports', 'management'] as const;

  const filteredPermissions = mockPermissions.filter((perm) => {
    const matchesCategory = !selectedCategory || perm.category === selectedCategory;
    const matchesSearch = 
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const permissionsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = filteredPermissions.filter(p => p.category === cat);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCategoryChange = (
    event: React.MouseEvent<HTMLElement>,
    newCategory: string | null,
  ) => {
    setSelectedCategory(newCategory);
  };

  return (
    <Box sx={{ 
      p: 4, 
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      maxWidth: '100%'
    }}>
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
              <Shield size={32} color="white" strokeWidth={2} />
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
                Permission Library
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                System-wide permissions available to all tenants. Select permissions when creating custom roles.
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

      {/* Search and Filter */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              placeholder="Search permissions by name, action, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'success.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: alpha('#16a34a', 0.02),
                  '&:hover': {
                    background: alpha('#16a34a', 0.04),
                  },
                  '&.Mui-focused': {
                    background: 'white',
                  }
                }
              }}
            />
            <Box>
              <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ mb: 2 }}>
                Filter by Category:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {categories.map((cat) => {
                  const IconComponent = categoryIcons[cat];
                  return (
                    <Chip
                      key={cat}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconComponent size={18} />
                          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{cat}</span>
                        </Box>
                      }
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    sx={{
                      py: 2.5,
                      px: 2,
                      borderRadius: 2,
                      fontSize: '0.9rem',
                      background: selectedCategory === cat ? categoryColors[cat] : 'white',
                      color: selectedCategory === cat ? 'white' : 'text.primary',
                      border: '2px solid',
                      borderColor: selectedCategory === cat ? 'transparent' : 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                        borderColor: 'transparent',
                        background: categoryColors[cat]
                      }
                    }}
                    />
                  );
                })}
                {selectedCategory && (
                  <Chip
                    label="Clear Filter"
                    onClick={() => setSelectedCategory(null)}
                    color="default"
                    sx={{
                      py: 2.5,
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 600
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Permissions by Category */}
      <Stack spacing={4}>
        {categories.map((category) => {
          const perms = permissionsByCategory[category];
          if (selectedCategory && selectedCategory !== category) return null;
          if (perms.length === 0) return null;

          return (
            <Card key={category} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  background: categoryColors[category],
                  p: 3,
                  color: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {(() => {
                    const IconComponent = categoryIcons[category];
                    return <IconComponent size={40} color="white" strokeWidth={2} />;
                  })()}
                  <Box>
                    <Typography variant="h5" fontWeight="700" sx={{ textTransform: 'capitalize' }}>
                      {category} Permissions
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {perms.length} {perms.length === 1 ? 'permission' : 'permissions'} available
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {perms.map((permission) => (
                    <Grid item xs={12} md={6} key={permission.permission_id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: '2px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          height: '100%',
                          '&:hover': {
                            borderColor: 'success.main',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.15)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" fontWeight="700">
                            {permission.display_name}
                          </Typography>
                          {permission.system_defined && (
                            <Chip 
                              label="System" 
                              size="small" 
                              sx={{ 
                                background: categoryColors[category],
                                color: 'white',
                                fontWeight: 600
                              }} 
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {permission.description}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            label={permission.name}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontFamily: 'monospace', 
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              borderWidth: 2,
                              borderColor: 'success.main',
                              color: 'success.main'
                            }}
                          />
                          <Chip
                            label={`Action: ${permission.action}`}
                            size="small"
                            sx={{
                              background: alpha('#16a34a', 0.1),
                              color: 'success.main',
                              fontWeight: 600
                            }}
                          />
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {filteredPermissions.length === 0 && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight="600" gutterBottom>
                No permissions found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

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
          <strong>About Permission Library:</strong> Permissions are system-defined and available to all tenants. 
          When creating custom roles, you select from this library. Permissions map to actions (e.g., "view_animals", 
          "edit_health")           that are evaluated during access control.
        </Typography>
      </Alert>
    </Box>
  );
}
