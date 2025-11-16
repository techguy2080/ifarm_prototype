'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Stack,
  Checkbox,
  FormControlLabel,
  Paper,
  alpha,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { Users } from 'lucide-react';
import { mockRoles, mockPermissions } from '@/lib/mockData';
import { Permission } from '@/types';

function EditRoleContent() {
  const params = useParams();
  const router = useRouter();
  const roleId = parseInt(params.id as string);
  const role = mockRoles.find(r => r.role_id === roleId);

  const [roleName, setRoleName] = useState(role?.name || '');
  const [roleDescription, setRoleDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    role?.permissions.map(p => p.permission_id) || []
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['animals', 'activities', 'reports', 'management'] as const;

  if (!role) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Role not found</Typography>
        <Button component={Link} href="/dashboard/roles" sx={{ mt: 2 }}>
          Back to Roles
        </Button>
      </Box>
    );
  }

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getSelectedPermissions = () => {
    return mockPermissions.filter(p => selectedPermissions.includes(p.permission_id));
  };

  const filteredPermissions = mockPermissions.filter((perm) => {
    const matchesCategory = !selectedCategory || perm.category === selectedCategory;
    return matchesCategory;
  });

  const handleSave = () => {
    // Handle save
    alert('Role would be updated! (Prototype)');
    router.push('/dashboard/roles');
  };

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
              <Users size={32} color="white" strokeWidth={2} />
            </Box>
            <Box sx={{ flex: 1 }}>
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
                Edit Role
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                Modify role permissions, name, and description. Changes will affect all users with this role.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/dashboard/roles"
              startIcon={<ArrowBack />}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Back
            </Button>
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

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Role Details */}
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                Role Details
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Role Name"
                  fullWidth
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Farm Helper"
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Describe what this role can do..."
                />
              </Stack>
            </Box>

            <Divider />

            {/* Category Filter */}
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                Filter by Category
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label="All"
                  onClick={() => setSelectedCategory(null)}
                  color={selectedCategory === null ? 'primary' : 'default'}
                  sx={{ mb: 1 }}
                />
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    onClick={() => setSelectedCategory(cat)}
                    color={selectedCategory === cat ? 'primary' : 'default'}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Selected Permissions Summary */}
            {getSelectedPermissions().length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                  Selected Permissions ({getSelectedPermissions().length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {getSelectedPermissions().map((perm) => (
                    <Chip
                      key={perm.permission_id}
                      label={perm.display_name}
                      onDelete={() => togglePermission(perm.permission_id)}
                      color="success"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Divider />

            {/* Permission Selection */}
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                Select Permissions
              </Typography>
              <Stack spacing={2}>
                {categories.map((category) => {
                  const categoryPerms = filteredPermissions.filter(p => p.category === category);
                  if (categoryPerms.length === 0 || (selectedCategory && selectedCategory !== category)) return null;

                  return (
                    <Paper key={category} sx={{ p: 3, bgcolor: alpha('#16a34a', 0.05) }}>
                      <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2, color: 'success.main' }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)} Permissions
                      </Typography>
                      <Stack spacing={1}>
                        {categoryPerms.map((perm) => (
                          <FormControlLabel
                            key={perm.permission_id}
                            control={
                              <Checkbox
                                checked={selectedPermissions.includes(perm.permission_id)}
                                onChange={() => togglePermission(perm.permission_id)}
                                color="success"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  {perm.display_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {perm.description}
                                </Typography>
                              </Box>
                            }
                          />
                        ))}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                component={Link}
                href="/dashboard/roles"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  fontWeight: 600
                }}
              >
                Save Changes
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      </Box>
    </Box>
  );
}

export default function EditRolePage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <EditRoleContent />
    </Suspense>
  );
}

