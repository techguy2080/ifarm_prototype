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
  Collapse,
  IconButton,
  Alert,
  alpha,
  Fade
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Info as InfoIcon, ContentCopy } from '@mui/icons-material';
import { Stethoscope, UserCog, HardHat, Calculator, FileText } from 'lucide-react';
import { mockRoleTemplates } from '@/lib/mockData';

const categoryColors: Record<string, string> = {
  medical: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
  operations: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
  financial: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
};

// Map template names to icons
const templateIcons: Record<string, any> = {
  veterinarian: Stethoscope,
  farm_manager: UserCog,
  field_worker: HardHat,
  accountant: Calculator,
};

export default function RoleTemplatesPage() {
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);

  const handleExpand = (templateId: number) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <Box sx={{ 
      p: { xs: 3, sm: 4, md: 5 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
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
              <FileText size={32} color="white" strokeWidth={2} />
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
                Role Templates
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                Pre-built role combinations for quick starts. Clone and customize templates to create your own roles.
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

      {/* Template Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr', 
          md: 'repeat(2, 1fr)', 
          lg: 'repeat(3, 1fr)' 
        },
        gap: 3,
        mb: 4,
        width: '100%',
        boxSizing: 'border-box',
        '& > *': {
          minWidth: 0, // Prevent grid items from overflowing
        }
      }}>
        {mockRoleTemplates.map((template) => (
          <Box key={template.template_id} sx={{ width: '100%', minWidth: 0 }}>
            <Card
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(22, 163, 74, 0.2)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: categoryColors[template.category] || categoryColors.operations,
                }
              }}
            >
              <Box 
                sx={{ 
                  background: categoryColors[template.category] || categoryColors.operations,
                  p: 3,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {(() => {
                      const IconComponent = templateIcons[template.name];
                      return IconComponent ? (
                        <IconComponent size={40} color="white" strokeWidth={2} />
                      ) : (
                        <Box sx={{ width: 40, height: 40 }} />
                      );
                    })()}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight="700">
                        {template.display_name}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        sx={{
                          mt: 1,
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                {/* Decorative circles */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }} 
                />
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {template.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={`${template.permissions.length} permissions`}
                    size="small"
                    sx={{
                      background: alpha('#16a34a', 0.1),
                      color: 'success.main',
                      fontWeight: 600
                    }}
                  />
                  <Button
                    component={Link}
                    href={`/dashboard/roles/create?template=${template.template_id}`}
                    variant="contained"
                    size="small"
                    startIcon={<ContentCopy />}
                    sx={{
                      background: categoryColors[template.category] || categoryColors.operations,
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                      }
                    }}
                  >
                    Clone
                  </Button>
                </Box>

                {/* Expanded Permissions View */}
                <Box>
                  <Button
                    fullWidth
                    onClick={() => handleExpand(template.template_id)}
                    endIcon={
                      <ExpandMoreIcon
                        sx={{
                          transform: expandedTemplate === template.template_id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s'
                        }}
                      />
                    }
                    size="small"
                    sx={{ 
                      mt: 1,
                      fontWeight: 600,
                      color: 'success.main'
                    }}
                  >
                    {expandedTemplate === template.template_id ? 'Hide' : 'Show'} Permissions
                  </Button>
                  <Collapse in={expandedTemplate === template.template_id}>
                    <Paper sx={{ mt: 2, p: 2, bgcolor: alpha('#16a34a', 0.02), borderRadius: 2, border: '1px solid', borderColor: alpha('#16a34a', 0.1) }}>
                      <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: 'success.main' }}>
                        Included Permissions:
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 1.5 }}>
                        {template.permissions.map((perm) => (
                          <Fade in timeout={300} key={perm.permission_id}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'white',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'success.main',
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.1)'
                                }
                              }}
                            >
                              <Typography variant="body2" fontWeight="600">
                                {perm.display_name}
                              </Typography>
                              <Chip
                                label={perm.name}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  borderColor: 'success.main',
                                  color: 'success.main'
                                }}
                              />
                            </Box>
                          </Fade>
                        ))}
                      </Stack>
                    </Paper>
                  </Collapse>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Info Box */}
      <Alert 
        icon={<InfoIcon />} 
        severity="success"
        sx={{
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'success.light',
          background: alpha('#16a34a', 0.05)
        }}
      >
        <Typography variant="body2" fontWeight="500">
          <strong>Using Templates:</strong> Click "Clone Template" to create a custom role based on a template. 
          You can then modify the permissions, add ABAC policies, or rename it to fit your needs. Templates are just 
          starting points - you have full control over the custom role.
        </Typography>
      </Alert>
      </Box>
    </Box>
  );
}
