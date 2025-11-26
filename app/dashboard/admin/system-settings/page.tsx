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
  Switch,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Settings, Save, RefreshCw, Database, Shield, Bell, Globe, Server } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser } from '@/lib/auth';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    auditLogRetention: '90',
    maxLoginAttempts: '5',
    sessionTimeout: '30',
    defaultLanguage: 'en',
    timezone: 'Africa/Kampala',
    apiRateLimit: '1000',
    backupFrequency: 'daily',
    dataRetention: '365'
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    }, 1000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const systemInfo = [
    { label: 'System Version', value: '1.0.0' },
    { label: 'Database Version', value: 'PostgreSQL 15.2' },
    { label: 'Server Uptime', value: '45 days, 12 hours' },
    { label: 'Total Storage Used', value: '2.4 GB / 100 GB' },
    { label: 'Active Connections', value: '127' },
    { label: 'Last Backup', value: '2024-01-20 02:00 AM' },
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
                <Settings size={32} color="white" strokeWidth={2} />
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
                  System Settings
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Configure global system settings and preferences
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Save size={20} />}
                onClick={handleSave}
                disabled={saving}
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
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSaveSuccess(false)}>
            Settings saved successfully!
          </Alert>
        )}

        {/* System Information */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Server size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                System Information
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableBody>
                  {systemInfo.map((info, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 600, width: '40%' }}>{info.label}</TableCell>
                      <TableCell>{info.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Globe size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                General Settings
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Maintenance Mode</TableCell>
                    <TableCell>
                      <Switch
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                        color="success"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Disable access for all users except super admins
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Registration Enabled</TableCell>
                    <TableCell>
                      <Switch
                        checked={settings.registrationEnabled}
                        onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
                        color="success"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Allow new tenant registrations
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Default Language</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          value={settings.defaultLanguage}
                          onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="sw">Swahili</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Timezone</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        >
                          <MenuItem value="Africa/Kampala">Africa/Kampala (EAT)</MenuItem>
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Shield size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                Security Settings
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Max Login Attempts</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Before account lockout
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Session Timeout (minutes)</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>API Rate Limit (requests/hour)</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Audit Log Retention (days)</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={settings.auditLogRetention}
                        onChange={(e) => handleSettingChange('auditLogRetention', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Bell size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                Notification Settings
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Email Notifications</TableCell>
                    <TableCell>
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>SMS Notifications</TableCell>
                    <TableCell>
                      <Switch
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Database size={24} color="#16a34a" />
              <Typography variant="h5" fontWeight="700">
                Data Management
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Backup Frequency</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          value={settings.backupFrequency}
                          onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Data Retention (days)</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={settings.dataRetention}
                        onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshCw size={16} />}
                        sx={{
                          borderColor: 'success.main',
                          color: 'success.main',
                          '&:hover': {
                            borderColor: 'success.dark',
                            background: alpha('#16a34a', 0.05)
                          }
                        }}
                      >
                        Run Backup Now
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}










