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
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Search, Users, Building2, Activity, Shield, FileText, DollarSign } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';
import { mockTenants, mockUsers, mockFarms, mockAnimals, mockRoles, mockDelegations } from '@/lib/mockData';

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

export default function SuperAdminSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
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

  // Search across all entities
  const searchUsers = mockUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchTenants = mockTenants.filter(tenant =>
    tenant.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchFarms = mockFarms.filter(farm =>
    farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchAnimals = mockAnimals.filter(animal =>
    animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResults = searchUsers.length + searchTenants.length + searchFarms.length + searchAnimals.length + searchRoles.length;

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
                <Search size={32} color="white" strokeWidth={2} />
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
                  System-Wide Search
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Search across all tenants, users, farms, animals, and system entities
                </Typography>
              </Box>
              {searchTerm && (
                <Box sx={{ textAlign: 'right', color: 'white' }}>
                  <Typography variant="h4" fontWeight="700">
                    {totalResults}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Results Found
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search across all tenants, users, farms, animals, roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={24} color="#16a34a" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'white',
                fontSize: '1.1rem',
                py: 1
              }
            }}
          />
        </Box>

        {searchTerm ? (
          <>
            {/* Tabs */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600
                  },
                  '& .Mui-selected': {
                    color: '#16a34a'
                  }
                }}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label={`Users (${searchUsers.length})`} icon={<Users size={18} />} iconPosition="start" />
                <Tab label={`Tenants (${searchTenants.length})`} icon={<Building2 size={18} />} iconPosition="start" />
                <Tab label={`Farms (${searchFarms.length})`} icon={<Building2 size={18} />} iconPosition="start" />
                <Tab label={`Animals (${searchAnimals.length})`} icon={<Activity size={18} />} iconPosition="start" />
                <Tab label={`Roles (${searchRoles.length})`} icon={<Shield size={18} />} iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Users Tab */}
            <TabPanel value={activeTab} index={0}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                          <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {searchUsers.map((user) => (
                          <TableRow key={user.user_id} hover>
                            <TableCell>
                              <Typography variant="body1" fontWeight="600">
                                {user.first_name} {user.last_name}
                              </Typography>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={user.account_status}
                                size="small"
                                color="success"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {mockTenants.find(t => t.owner_user_id === user.user_id)?.organization_name || 'N/A'}
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
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tenants Tab */}
            <TabPanel value={activeTab} index={1}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                          <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {searchTenants.map((tenant) => (
                          <TableRow key={tenant.tenant_id} hover>
                            <TableCell>
                              <Typography variant="body1" fontWeight="600">
                                {tenant.organization_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {tenant.tenant_id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {new Date(tenant.created_at).toLocaleDateString()}
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
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Farms Tab */}
            <TabPanel value={activeTab} index={2}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                          <TableCell sx={{ fontWeight: 700 }}>Farm Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {searchFarms.map((farm) => (
                          <TableRow key={farm.farm_id} hover>
                            <TableCell>
                              <Typography variant="body1" fontWeight="600">
                                {farm.farm_name}
                              </Typography>
                            </TableCell>
                            <TableCell>{farm.location}, {farm.district}</TableCell>
                            <TableCell>
                              <Chip
                                label={farm.farm_type}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {mockTenants.find(t => t.tenant_id === farm.tenant_id)?.organization_name || 'N/A'}
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
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Animals Tab */}
            <TabPanel value={activeTab} index={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                          <TableCell sx={{ fontWeight: 700 }}>Tag Number</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Breed</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Health Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {searchAnimals.map((animal) => (
                          <TableRow key={animal.animal_id} hover>
                            <TableCell>
                              <Typography variant="body1" fontWeight="600">
                                {animal.tag_number}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>{animal.animal_type}</TableCell>
                            <TableCell>{animal.breed}</TableCell>
                            <TableCell>
                              <Chip
                                label={animal.health_status}
                                size="small"
                                color={animal.health_status === 'healthy' ? 'success' : 'error'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {mockTenants.find(t => t.tenant_id === animal.tenant_id)?.organization_name || 'N/A'}
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
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Roles Tab */}
            <TabPanel value={activeTab} index={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: alpha('#16a34a', 0.05) }}>
                          <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Permissions</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {searchRoles.map((role) => (
                          <TableRow key={role.role_id} hover>
                            <TableCell>
                              <Typography variant="body1" fontWeight="600">
                                {role.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${role.permissions.length} permissions`}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {mockTenants.find(t => t.tenant_id === role.tenant_id)?.organization_name || 'System'}
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
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>
          </>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', p: 4, textAlign: 'center' }}>
            <Search size={48} color="#16a34a" style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">
              Enter a search term to find entities across all tenants
            </Typography>
          </Card>
        )}
      </Box>
    </DashboardContainer>
  );
}





