'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  alpha
} from '@mui/material';
import { FileCheck, Download, Calendar, Filter } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockTaxRecords, mockTaxRates, mockFarms } from '@/lib/mockData';
import type { TaxRecord } from '@/types';

export default function TaxRecordsPage() {
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const currentUser = getCurrentUser();

  // Check permissions
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_financial_reports'))) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'default',
      'finalized': 'primary',
      'filed': 'success'
    };
    return colors[status] || 'default';
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = mockTaxRecords;

    if (filterPeriod !== 'all') {
      filtered = filtered.filter(r => r.period_type === filterPeriod);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    return filtered;
  }, [filterPeriod, filterStatus]);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 2, 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileCheck className="h-7 w-7 text-white" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    Tax Records
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    View and manage tax records for URA compliance
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Filter className="h-5 w-5 text-gray-600" />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Filters:
              </Typography>
              <TextField
                select
                label="Period Type"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Periods</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="finalized">Finalized</MenuItem>
                <MenuItem value="filed">Filed</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Tax Records Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha('#047857', 0.1) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tax Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tax Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Transactions</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Farm</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No tax records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.tax_record_id} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatDate(record.period_start)} - {formatDate(record.period_end)}
                            </Typography>
                            <Chip 
                              label={record.period_type} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ mt: 0.5, width: 'fit-content' }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {record.tax_rate?.tax_name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.tax_rate?.rate_percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {formatCurrency(record.total_revenue)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                          {formatCurrency(record.total_tax)}
                        </TableCell>
                        <TableCell>
                          {record.transaction_count}
                        </TableCell>
                        <TableCell>
                          {record.farm_id 
                            ? mockFarms.find(f => f.farm_id === record.farm_id)?.farm_name || 'N/A'
                            : 'All Farms'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            size="small" 
                            color={getStatusColor(record.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              component={Link}
                              href={`/dashboard/tax/records/${record.tax_record_id}`}
                              size="small"
                              variant="outlined"
                              startIcon={<FileCheck className="h-4 w-4" />}
                            >
                              View
                            </Button>
                            {record.status === 'finalized' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<Download className="h-4 w-4" />}
                              >
                                Export
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}


