'use client';

import { useParams, useRouter } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
  IconButton
} from '@mui/material';
import { 
  ArrowLeft, 
  Calendar, 
  Heart, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Link as LinkIcon
} from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { 
  mockAnimals, 
  mockFarms, 
  mockBreedingRecords, 
  mockExternalFarms, 
  mockExternalAnimals,
  mockAnimalHireAgreements,
  mockExternalAnimalHireAgreements
} from '@/lib/mockData';
import { BreedingRecord } from '@/types';

export default function BreedingRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const breedingId = parseInt(params.id as string);
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

  // Find the breeding record
  const record = mockBreedingRecords.find(r => r.breeding_id === breedingId);
  
  if (!record) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Breeding Record Not Found
          </Typography>
          <Button
            component={Link}
            href="/dashboard/helper/pregnancy"
            startIcon={<ArrowLeft />}
            sx={{ mt: 2 }}
          >
            Back to Pregnancy Management
          </Button>
        </Box>
      </DashboardContainer>
    );
  }

  // Get related data
  const animal = mockAnimals.find(a => a.animal_id === record.animal_id);
  const farm = mockFarms.find(f => f.farm_id === record.farm_id);
  const sire = record.sire_id ? mockAnimals.find(a => a.animal_id === record.sire_id) : null;
  const externalAnimal = record.external_animal_id 
    ? mockExternalAnimals.find(a => a.external_animal_id === record.external_animal_id)
    : null;
  const externalFarm = record.external_farm_name 
    ? mockExternalFarms.find(f => f.farm_name === record.external_farm_name)
    : null;
  
  const animalHireAgreement = record.animal_hire_agreement_id
    ? mockAnimalHireAgreements.find(a => a.agreement_id === record.animal_hire_agreement_id)
    : null;
  
  const externalHireAgreement = record.external_animal_hire_agreement_id
    ? mockExternalAnimalHireAgreements.find(a => a.agreement_id === record.external_animal_hire_agreement_id)
    : null;

  const status = record.pregnancy_status || record.status || 'suspected';
  const dueDate = record.expected_due_date || record.expected_delivery_date;
  const birthDate = record.actual_birth_date || record.actual_delivery_date;

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilDue = getDaysUntilDue(dueDate);

  return (
    <DashboardContainer>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton
            component={Link}
            href="/dashboard/helper/pregnancy"
            sx={{ color: '#2d5016' }}
          >
            <ArrowLeft size={24} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="600" sx={{ color: '#2d5016' }}>
              Breeding Record #{record.breeding_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {animal?.tag_number || 'Unknown Animal'} - {farm?.farm_name || 'Unknown Farm'}
            </Typography>
          </Box>
          {hasPermission(currentUser, 'create_breeding') && (
            <Button
              variant="outlined"
              startIcon={<Edit size={16} />}
              sx={{ borderColor: '#4caf50', color: '#4caf50' }}
            >
              Edit Record
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Main Information */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Animal Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#2d5016', mb: 2 }}>
                    Animal Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%' }}>Animal</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Heart size={16} color="#e91e63" />
                              <Typography>{animal?.tag_number || 'N/A'}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Breed</TableCell>
                          <TableCell>{animal?.breed || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Farm</TableCell>
                          <TableCell>{farm?.farm_name || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                          <TableCell>{farm?.location || farm?.district || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Sire Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#2d5016', mb: 2 }}>
                    Sire Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%' }}>Source</TableCell>
                          <TableCell>
                            <Chip
                              label={record.sire_source === 'external' ? 'External Farm' : 'My Farm'}
                              size="small"
                              icon={record.sire_source === 'external' ? <ExternalLink size={14} /> : undefined}
                              sx={{
                                bgcolor: record.sire_source === 'external' ? '#e3f2fd' : '#e8f5e9',
                                color: record.sire_source === 'external' ? '#1976d2' : '#2d5016'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        {record.sire_source === 'internal' && sire ? (
                          <>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Sire Tag</TableCell>
                              <TableCell>{sire.tag_number}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Breed</TableCell>
                              <TableCell>{sire.breed || sire.animal_type}</TableCell>
                            </TableRow>
                          </>
                        ) : record.sire_source === 'external' ? (
                          <>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>External Farm</TableCell>
                              <TableCell>
                                {externalFarm ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <ExternalLink size={14} />
                                    {record.external_farm_name}
                                  </Box>
                                ) : (
                                  record.external_farm_name || 'N/A'
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>External Animal Tag</TableCell>
                              <TableCell>{record.external_animal_tag || 'N/A'}</TableCell>
                            </TableRow>
                            {externalAnimal && (
                              <>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600 }}>Breed</TableCell>
                                  <TableCell>{externalAnimal.breed || externalAnimal.animal_type}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600 }}>Health Status</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={externalAnimal.health_status || 'N/A'}
                                      size="small"
                                      sx={{
                                        bgcolor: externalAnimal.health_status === 'healthy' ? '#c8e6c9' : '#fff3e0',
                                        color: externalAnimal.health_status === 'healthy' ? '#2d5016' : '#e65100'
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              </>
                            )}
                          </>
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2}>Sire information not available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Breeding Details */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#2d5016', mb: 2 }}>
                    Breeding Details
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%' }}>Breeding Date</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Calendar size={14} />
                              {new Date(record.breeding_date).toLocaleDateString()}
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Breeding Method</TableCell>
                          <TableCell>
                            <Chip
                              label={record.breeding_method?.replace('_', ' ') || 'N/A'}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                        </TableRow>
                        {record.conception_date && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Conception Date</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Calendar size={14} />
                                {new Date(record.conception_date).toLocaleDateString()}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                        {dueDate && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Expected Due Date</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Calendar size={14} />
                                {new Date(dueDate).toLocaleDateString()}
                                {daysUntilDue !== null && (
                                  <Chip
                                    label={daysUntilDue > 0 ? `${daysUntilDue} days remaining` : 'Overdue'}
                                    size="small"
                                    sx={{
                                      bgcolor: daysUntilDue > 0 && daysUntilDue <= 30 ? '#fff3e0' : daysUntilDue > 0 ? '#e8f5e9' : '#ffcdd2',
                                      color: daysUntilDue > 0 && daysUntilDue <= 30 ? '#e65100' : daysUntilDue > 0 ? '#2d5016' : '#c62828',
                                      ml: 1
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Pregnancy Status</TableCell>
                          <TableCell>
                            <Chip
                              label={status}
                              size="small"
                              sx={{
                                bgcolor: status === 'confirmed' ? '#c8e6c9' : 
                                         status === 'suspected' ? '#fff3e0' :
                                         status === 'completed' ? '#e3f2fd' : 
                                         status === 'failed' ? '#ffcdd2' : '#e8f5e9',
                                color: status === 'confirmed' ? '#2d5016' : 
                                       status === 'suspected' ? '#e65100' :
                                       status === 'completed' ? '#1976d2' : 
                                       status === 'failed' ? '#c62828' : '#2d5016',
                                textTransform: 'capitalize'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Birth Information */}
              {birthDate && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#2d5016', mb: 2 }}>
                      Birth Information
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: '40%' }}>Actual Birth Date</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Calendar size={14} />
                                {new Date(birthDate).toLocaleDateString()}
                              </Box>
                            </TableCell>
                          </TableRow>
                          {record.birth_outcome && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Birth Outcome</TableCell>
                              <TableCell>
                                <Chip
                                  label={record.birth_outcome}
                                  size="small"
                                  icon={
                                    record.birth_outcome === 'successful' ? <CheckCircle size={14} /> :
                                    record.birth_outcome === 'complications' ? <AlertCircle size={14} /> :
                                    <XCircle size={14} />
                                  }
                                  sx={{
                                    bgcolor: record.birth_outcome === 'successful' ? '#c8e6c9' :
                                             record.birth_outcome === 'complications' ? '#fff3e0' :
                                             '#ffcdd2',
                                    color: record.birth_outcome === 'successful' ? '#2d5016' :
                                           record.birth_outcome === 'complications' ? '#e65100' :
                                           '#c62828',
                                    textTransform: 'capitalize'
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )}
                          {record.offspring_count !== undefined && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Offspring Count</TableCell>
                              <TableCell>{record.offspring_count}</TableCell>
                            </TableRow>
                          )}
                          {record.complications && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Complications</TableCell>
                              <TableCell>
                                <Paper sx={{ p: 1.5, bgcolor: '#fff3e0' }}>
                                  <Typography variant="body2">{record.complications}</Typography>
                                </Paper>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {record.notes && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#2d5016', mb: 2 }}>
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {record.notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Hire Agreements */}
              {(animalHireAgreement || externalHireAgreement) && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#2d5016', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon size={18} />
                        Linked Hire Agreements
                      </Box>
                    </Typography>
                    <Stack spacing={2}>
                      {animalHireAgreement && (
                        <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                          <Typography variant="subtitle2" fontWeight="600">
                            Your Animal Hired Out
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Agreement #{animalHireAgreement.agreement_id}
                          </Typography>
                          <Button
                            size="small"
                            component={Link}
                            href={`/dashboard/breeding/hire-agreements`}
                            sx={{ mt: 1 }}
                          >
                            View Agreement
                          </Button>
                        </Paper>
                      )}
                      {externalHireAgreement && (
                        <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                          <Typography variant="subtitle2" fontWeight="600">
                            External Animal Hired
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Agreement #{externalHireAgreement.agreement_id}
                          </Typography>
                          <Button
                            size="small"
                            component={Link}
                            href={`/dashboard/breeding/hire-agreements`}
                            sx={{ mt: 1 }}
                          >
                            View Agreement
                          </Button>
                        </Paper>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#2d5016', mb: 2 }}>
                    Quick Information
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Recorded</Typography>
                      <Typography variant="body2">
                        {new Date(record.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {record.updated_at && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                        <Typography variant="body2">
                          {new Date(record.updated_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                    {record.offspring_ids && record.offspring_ids.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Offspring</Typography>
                        <Typography variant="body2">
                          {record.offspring_ids.length} offspring linked
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </DashboardContainer>
  );
}

