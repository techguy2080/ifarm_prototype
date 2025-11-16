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
  Stack,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha
} from '@mui/material';
import { Add, Edit, Delete, Email, Person } from '@mui/icons-material';
import { mockUsers, mockInvitations, mockRoles } from '@/lib/mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
                <Person sx={{ fontSize: 32, color: 'white' }} />
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
                  Users & Invitations
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Manage users, send invitations, and assign roles.
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              href="/dashboard/users/invite"
              variant="contained"
              startIcon={<Add />}
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
              Invite User
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

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="users tabs"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem'
            },
            '& .Mui-selected': {
              color: 'success.main'
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
              height: 3
            }
          }}
        >
          <Tab
            icon={<Person />}
            iconPosition="start"
            label={`Users (${mockUsers.length})`}
          />
          <Tab
            icon={<Email />}
            iconPosition="start"
            label={`Pending Invitations (${mockInvitations.filter(i => i.invitation_status === 'pending').length})`}
          />
        </Tabs>

        {/* Users Tab */}
        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow 
                      key={user.user_id} 
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: alpha('#16a34a', 0.02)
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                              fontWeight: 700
                            }}
                          >
                            {user.first_name[0]}{user.last_name[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight="600">
                            {user.first_name} {user.last_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {mockRoles.slice(0, 2).map((role) => (
                            <Chip
                              key={role.role_id}
                              label={role.name}
                              size="small"
                              sx={{
                                background: alpha('#16a34a', 0.1),
                                color: 'success.main',
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: alpha('#16a34a', 0.2)
                              }}
                            />
                          ))}
                          <Chip
                            label="+2 more"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, borderColor: 'divider' }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.account_status}
                          color={user.account_status === 'active' ? 'success' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: 'success.main',
                              '&:hover': { bgcolor: alpha('#16a34a', 0.1) }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialogOpen(user.user_id)}
                            sx={{
                              '&:hover': { bgcolor: alpha('#ef4444', 0.1) }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </TabPanel>

        {/* Invitations Tab */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Stack spacing={2}>
              {mockInvitations.map((invitation) => (
                <Paper 
                  key={invitation.invitation_id} 
                  sx={{ 
                    p: 3,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'success.main',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" fontWeight="700">
                          {invitation.first_name} {invitation.last_name}
                        </Typography>
                        <Chip
                          label={invitation.invitation_status}
                          color={
                            invitation.invitation_status === 'pending' ? 'warning' :
                            invitation.invitation_status === 'accepted' ? 'success' : 'error'
                          }
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {invitation.email}
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <Chip 
                          label={`By: ${invitation.invited_by.first_name} ${invitation.invited_by.last_name}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip 
                          label={`Sent: ${new Date(invitation.sent_at).toLocaleDateString()}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip 
                          label={`Expires: ${new Date(invitation.expires_at).toLocaleDateString()}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{
                          borderColor: 'success.main',
                          color: 'success.main',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: 'success.dark',
                            background: alpha('#16a34a', 0.05)
                          }
                        }}
                      >
                        Resend
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              ))}
              {mockInvitations.filter(i => i.invitation_status === 'pending').length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>📧</Typography>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    No pending invitations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All invitations have been accepted or expired
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen !== null}
        onClose={() => setDeleteDialogOpen(null)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remove User?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this user? This action cannot be undone and will revoke all their access.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(null)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={() => setDeleteDialogOpen(null)} 
            color="error" 
            variant="contained"
            sx={{ fontWeight: 600 }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}
