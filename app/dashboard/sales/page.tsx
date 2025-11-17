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
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
  Divider
} from '@mui/material';
import { Add, TrendingUp } from '@mui/icons-material';
import { DollarSign, Handshake } from 'lucide-react';
import { mockAnimalSales, mockProductSales, mockAnimalHireAgreements, mockFarms } from '@/lib/mockData';

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

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Calculate revenue from animal hire agreements (when our animals are hired out)
  const animalHireRevenue = useMemo(() => {
    return mockAnimalHireAgreements
      .filter(agreement => 
        agreement.agreement_type === 'hire_out' && 
        (agreement.status === 'active' || agreement.status === 'completed') &&
        agreement.payment_status === 'paid'
      )
      .reduce((sum, agreement) => sum + (agreement.hire_fee || 0), 0);
  }, []);

  const totalAnimalSales = mockAnimalSales.reduce((sum, s) => sum + s.sale_price, 0);
  const totalProductSales = mockProductSales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalRevenue = totalAnimalSales + totalProductSales + animalHireRevenue;
  const totalSalesCount = mockAnimalSales.length + mockProductSales.length + 
    mockAnimalHireAgreements.filter(a => a.agreement_type === 'hire_out' && a.payment_status === 'paid').length;

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
                <DollarSign size={32} color="white" strokeWidth={2} />
              </Box>
              <Box>
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
                  Sales Management
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontWeight: 600,
                    letterSpacing: '0',
                    lineHeight: 1.5
                  }}
                >
                  Track animal sales and product sales. Monitor revenue and payment status.
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
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
                Record Sale
              </Button>
            </Stack>
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

      {/* Revenue Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight="700" color="success.main">
                UGX {totalRevenue.toLocaleString()}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {totalSalesCount} total sales
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.25}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Animal Sales
              </Typography>
              <Typography variant="h4" fontWeight="700" color="primary.main">
                UGX {totalAnimalSales.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {mockAnimalSales.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.25}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Product Sales
              </Typography>
              <Typography variant="h4" fontWeight="700" color="info.main">
                UGX {totalProductSales.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {mockProductSales.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.25}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)', bgcolor: alpha('#8b5cf6', 0.05) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Handshake size={18} color="#8b5cf6" />
                <Typography variant="subtitle2" color="text.secondary">
                  Animal Hire
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="700" sx={{ color: '#8b5cf6' }}>
                UGX {animalHireRevenue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {mockAnimalHireAgreements.filter(a => a.agreement_type === 'hire_out' && a.payment_status === 'paid').length} agreements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.25}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Avg Sale Value
              </Typography>
              <Typography variant="h4" fontWeight="700" color="warning.main">
                UGX {totalSalesCount > 0 ? Math.round(totalRevenue / totalSalesCount).toLocaleString() : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label={`Animal Sales (${mockAnimalSales.length})`} />
            <Tab label={`Product Sales (${mockProductSales.length})`} />
          </Tabs>
        </Box>

        {/* Animal Sales Tab */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#16a34a', 0.1) }}>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Animal</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sale Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockAnimalSales.map((sale) => (
                  <TableRow key={sale.sale_id} hover>
                    <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {sale.animal?.tag_number || `Animal #${sale.animal_id}`}
                    </TableCell>
                    <TableCell>{sale.customer_name || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                      UGX {sale.sale_price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.payment_status} 
                        size="small" 
                        color={
                          sale.payment_status === 'paid' ? 'success' :
                          sale.payment_status === 'partial' ? 'warning' :
                          'error'
                        }
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {sale.payment_method?.replace('_', ' ') || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {mockAnimalSales.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                No animal sales recorded yet.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Product Sales Tab */}
        <TabPanel value={activeTab} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#16a34a', 0.1) }}>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockProductSales.map((sale) => (
                  <TableRow key={sale.product_sale_id} hover>
                    <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.product_type} 
                        size="small" 
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {sale.quantity} {sale.unit}
                    </TableCell>
                    <TableCell>UGX {sale.unit_price.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                      UGX {sale.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{sale.customer_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.payment_status} 
                        size="small" 
                        color={
                          sale.payment_status === 'paid' ? 'success' :
                          sale.payment_status === 'partial' ? 'warning' :
                          'error'
                        }
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {mockProductSales.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                No product sales recorded yet.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Card>
      </Box>
    </Box>
  );
}

