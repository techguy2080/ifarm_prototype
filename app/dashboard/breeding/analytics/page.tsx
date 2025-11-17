'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import { TrendingUp, ExternalLink, BarChart3, DollarSign, AlertCircle, Heart } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { 
  mockBreedingRecords, 
  mockAnimals,
  mockAnimalHireAgreements,
  mockExternalAnimalHireAgreements
} from '@/lib/mockData';

export default function BreedingAnalyticsPage() {
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_operational_reports'))) {
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

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const internalRecords = mockBreedingRecords.filter(r => r.sire_source === 'internal');
    const externalRecords = mockBreedingRecords.filter(r => r.sire_source === 'external');
    
    // Success rates
    const internalTotal = internalRecords.length;
    const internalSuccessful = internalRecords.filter(r => 
      r.birth_outcome === 'successful' || 
      (r.pregnancy_status === 'completed' && !r.birth_outcome) ||
      (r.status === 'successful')
    ).length;
    const internalSuccessRate = internalTotal > 0 ? (internalSuccessful / internalTotal) * 100 : 0;
    
    const externalTotal = externalRecords.length;
    const externalSuccessful = externalRecords.filter(r => 
      r.birth_outcome === 'successful' || 
      (r.pregnancy_status === 'completed' && !r.birth_outcome) ||
      (r.status === 'successful')
    ).length;
    const externalSuccessRate = externalTotal > 0 ? (externalSuccessful / externalTotal) * 100 : 0;
    
    // Financial analytics
    // Revenue from our animals hired out
    const revenueFromHires = internalRecords
      .filter(r => r.animal_hire_agreement_id)
      .reduce((sum, r) => {
        const agreement = mockAnimalHireAgreements.find(a => 
          a.agreement_id === r.animal_hire_agreement_id
        );
        if (agreement && agreement.payment_status === 'paid') {
          return sum + (agreement.hire_fee || 0);
        }
        return sum;
      }, 0);
    
    // Expenses from external animal hires
    const expensesFromHires = externalRecords
      .filter(r => r.external_animal_hire_agreement_id)
      .reduce((sum, r) => {
        const agreement = mockExternalAnimalHireAgreements.find(a => 
          a.agreement_id === r.external_animal_hire_agreement_id
        );
        if (agreement) {
          const paidAmount = agreement.paid_amount || 0;
          const totalAmount = agreement.total_amount || 0;
          return sum + (agreement.payment_status === 'paid' ? totalAmount : paidAmount);
        }
        return sum;
      }, 0);
    
    const netProfit = revenueFromHires - expensesFromHires;
    
    // Average offspring
    const internalOffspring = internalRecords
      .filter(r => r.birth_outcome === 'successful' || r.pregnancy_status === 'completed')
      .reduce((sum, r) => sum + (r.offspring_count || 1), 0);
    const internalSuccessfulCount = internalRecords.filter(r => 
      r.birth_outcome === 'successful' || r.pregnancy_status === 'completed'
    ).length;
    const internalAvgOffspring = internalSuccessfulCount > 0 
      ? (internalOffspring / internalSuccessfulCount) 
      : 0;
    
    const externalOffspring = externalRecords
      .filter(r => r.birth_outcome === 'successful' || r.pregnancy_status === 'completed')
      .reduce((sum, r) => sum + (r.offspring_count || 1), 0);
    const externalSuccessfulCount = externalRecords.filter(r => 
      r.birth_outcome === 'successful' || r.pregnancy_status === 'completed'
    ).length;
    const externalAvgOffspring = externalSuccessfulCount > 0 
      ? (externalOffspring / externalSuccessfulCount) 
      : 0;
    
    // Complications
    const internalComplications = internalRecords.filter(r => 
      r.birth_outcome === 'complications' || r.complications
    ).length;
    const internalComplicationsRate = internalTotal > 0 ? (internalComplications / internalTotal) * 100 : 0;
    
    const externalComplications = externalRecords.filter(r => 
      r.birth_outcome === 'complications' || r.complications
    ).length;
    const externalComplicationsRate = externalTotal > 0 ? (externalComplications / externalTotal) * 100 : 0;
    
    // Cost per successful birth
    const internalCostPerBirth = internalSuccessfulCount > 0 
      ? (revenueFromHires > 0 ? 0 : 0) // Internal breeding has no direct cost
      : 0;
    const externalCostPerBirth = externalSuccessfulCount > 0
      ? (expensesFromHires / externalSuccessfulCount)
      : 0;
    
    return {
      internal: {
        total: internalTotal,
        successful: internalSuccessful,
        successRate: internalSuccessRate,
        avgOffspring: internalAvgOffspring,
        complications: internalComplications,
        complicationsRate: internalComplicationsRate,
        revenue: revenueFromHires,
        costPerBirth: internalCostPerBirth
      },
      external: {
        total: externalTotal,
        successful: externalSuccessful,
        successRate: externalSuccessRate,
        avgOffspring: externalAvgOffspring,
        complications: externalComplications,
        complicationsRate: externalComplicationsRate,
        expenses: expensesFromHires,
        costPerBirth: externalCostPerBirth
      },
      financial: {
        revenue: revenueFromHires,
        expenses: expensesFromHires,
        netProfit
      }
    };
  }, []);

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
                <BarChart3 size={32} color="white" strokeWidth={2} />
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
                  Breeding Analytics
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Comprehensive analysis of breeding performance and financial impact
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Internal Breeding Statistics */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', mb: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ mb: 3, color: '#2d5016' }}>
              Internal Breeding Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Records
                    </Typography>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#2d5016' }}>
                      {analytics.internal.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Successful Births
                    </Typography>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                      {analytics.internal.successful}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Success Rate
                    </Typography>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                      {analytics.internal.successRate.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingUp size={20} color="#16a34a" />
                      <Typography variant="body2" color="text.secondary">
                        Revenue from Hires
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                      {analytics.internal.revenue.toLocaleString()} UGX
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      From animals hired out
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', bgcolor: alpha('#16a34a', 0.05), border: '2px solid', borderColor: alpha('#16a34a', 0.2) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DollarSign size={24} color="#16a34a" />
                  <Typography variant="h6" fontWeight="600" sx={{ color: '#16a34a' }}>
                    Revenue from Hires
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="700" sx={{ color: '#16a34a', mb: 1 }}>
                  {analytics.financial.revenue.toLocaleString()} UGX
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From animals hired out to other farms
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', bgcolor: alpha('#e65100', 0.05), border: '2px solid', borderColor: alpha('#e65100', 0.2) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DollarSign size={24} color="#e65100" />
                  <Typography variant="h6" fontWeight="600" sx={{ color: '#e65100' }}>
                    Expenses from Hires
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="700" sx={{ color: '#e65100', mb: 1 }}>
                  {analytics.financial.expenses.toLocaleString()} UGX
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For external animals hired for breeding
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', bgcolor: alpha('#8b5cf6', 0.05), border: '2px solid', borderColor: alpha('#8b5cf6', 0.2) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp size={24} color="#8b5cf6" />
                  <Typography variant="h6" fontWeight="600" sx={{ color: '#8b5cf6' }}>
                    Net Profit/Loss
                  </Typography>
                </Box>
                <Typography 
                  variant="h3" 
                  fontWeight="700" 
                  sx={{ 
                    color: analytics.financial.netProfit >= 0 ? '#16a34a' : '#e65100',
                    mb: 1 
                  }}
                >
                  {analytics.financial.netProfit >= 0 ? '+' : ''}{analytics.financial.netProfit.toLocaleString()} UGX
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue minus expenses from breeding hires
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Success Rate Comparison */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={20} />
                Success Rate Comparison
              </Box>
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: alpha('#16a34a', 0.05), borderRadius: 2, border: '2px solid', borderColor: alpha('#16a34a', 0.2) }}>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ color: '#16a34a', mb: 2 }}>
                    Internal Breeding
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                          {analytics.internal.successRate.toFixed(1)}%
                        </Typography>
                        <Chip
                          label={`${analytics.internal.successful}/${analytics.internal.total}`}
                          size="small"
                          sx={{ bgcolor: '#16a34a', color: 'white' }}
                        />
                      </Box>
                      <Box sx={{ mt: 1, height: 8, bgcolor: alpha('#16a34a', 0.1), borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${analytics.internal.successRate}%`,
                            bgcolor: '#16a34a',
                            transition: 'width 0.5s'
                          }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Average Offspring</Typography>
                      <Typography variant="h6" fontWeight="700" sx={{ color: '#16a34a' }}>
                        {analytics.internal.avgOffspring.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Revenue Generated</Typography>
                      <Typography variant="h6" fontWeight="700" sx={{ color: '#16a34a' }}>
                        {analytics.internal.revenue.toLocaleString()} UGX
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: alpha('#3b82f6', 0.05), borderRadius: 2, border: '2px solid', borderColor: alpha('#3b82f6', 0.2) }}>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ color: '#3b82f6', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      External Breeding
                      <ExternalLink size={16} />
                    </Box>
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="h4" fontWeight="700" sx={{ color: '#3b82f6' }}>
                          {analytics.external.successRate.toFixed(1)}%
                        </Typography>
                        <Chip
                          label={`${analytics.external.successful}/${analytics.external.total}`}
                          size="small"
                          sx={{ bgcolor: '#3b82f6', color: 'white' }}
                        />
                      </Box>
                      <Box sx={{ mt: 1, height: 8, bgcolor: alpha('#3b82f6', 0.1), borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${analytics.external.successRate}%`,
                            bgcolor: '#3b82f6',
                            transition: 'width 0.5s'
                          }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Average Offspring</Typography>
                      <Typography variant="h6" fontWeight="700" sx={{ color: '#3b82f6' }}>
                        {analytics.external.avgOffspring.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Expenses Incurred</Typography>
                      <Typography variant="h6" fontWeight="700" sx={{ color: '#e65100' }}>
                        {analytics.external.expenses.toLocaleString()} UGX
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Cost per Successful Birth</Typography>
                      <Typography variant="h6" fontWeight="700" sx={{ color: '#e65100' }}>
                        {analytics.external.costPerBirth.toFixed(0)} UGX
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ROI Analysis */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
              Return on Investment (ROI) Analysis
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Metric</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Internal Breeding</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>External Breeding</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Difference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Success Rate</TableCell>
                    <TableCell align="right">{analytics.internal.successRate.toFixed(1)}%</TableCell>
                    <TableCell align="right">{analytics.external.successRate.toFixed(1)}%</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${(analytics.internal.successRate - analytics.external.successRate).toFixed(1)}%`}
                        size="small"
                        sx={{
                          bgcolor: analytics.internal.successRate > analytics.external.successRate ? '#c8e6c9' : '#ffcdd2',
                          color: analytics.internal.successRate > analytics.external.successRate ? '#2d5016' : '#c62828'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average Offspring per Birth</TableCell>
                    <TableCell align="right">{analytics.internal.avgOffspring.toFixed(2)}</TableCell>
                    <TableCell align="right">{analytics.external.avgOffspring.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${(analytics.internal.avgOffspring - analytics.external.avgOffspring).toFixed(2)}`}
                        size="small"
                        sx={{
                          bgcolor: analytics.internal.avgOffspring > analytics.external.avgOffspring ? '#c8e6c9' : '#ffcdd2',
                          color: analytics.internal.avgOffspring > analytics.external.avgOffspring ? '#2d5016' : '#c62828'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Complications Rate</TableCell>
                    <TableCell align="right">{analytics.internal.complicationsRate.toFixed(1)}%</TableCell>
                    <TableCell align="right">{analytics.external.complicationsRate.toFixed(1)}%</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${(analytics.internal.complicationsRate - analytics.external.complicationsRate).toFixed(1)}%`}
                        size="small"
                        sx={{
                          bgcolor: analytics.internal.complicationsRate < analytics.external.complicationsRate ? '#c8e6c9' : '#ffcdd2',
                          color: analytics.internal.complicationsRate < analytics.external.complicationsRate ? '#2d5016' : '#c62828'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: alpha('#8b5cf6', 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Financial Impact</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#16a34a' }}>
                      +{analytics.internal.revenue.toLocaleString()} UGX
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#e65100' }}>
                      -{analytics.external.expenses.toLocaleString()} UGX
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      <Chip
                        label={`${analytics.financial.netProfit >= 0 ? '+' : ''}${analytics.financial.netProfit.toLocaleString()} UGX`}
                        size="small"
                        sx={{
                          bgcolor: analytics.financial.netProfit >= 0 ? '#c8e6c9' : '#ffcdd2',
                          color: analytics.financial.netProfit >= 0 ? '#2d5016' : '#c62828'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Related Pages
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component={Link}
                href="/dashboard/breeding/internal"
                sx={{ borderColor: '#16a34a', color: '#16a34a' }}
              >
                Internal Breeding
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/dashboard/breeding/external"
                sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
              >
                External Breeding
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/dashboard/breeding/hire-agreements"
                sx={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
              >
                Hire Agreements
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/dashboard/analytics/birth-rates"
                sx={{ borderColor: '#0d9488', color: '#0d9488' }}
              >
                Birth Rate Analytics
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardContainer>
  );
}

