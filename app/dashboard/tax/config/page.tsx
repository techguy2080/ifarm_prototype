'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  alpha
} from '@mui/material';
import { Calculator, Save, Info } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockTaxConfiguration, mockTaxRates } from '@/lib/mockData';

export default function TaxConfigPage() {
  const [config, setConfig] = useState(mockTaxConfiguration);
  const [saving, setSaving] = useState(false);
  const currentUser = getCurrentUser();

  // Check permissions
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'manage_roles'))) {
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

  const handleSave = () => {
    setSaving(true);
    // In production, this would make an API call
    setTimeout(() => {
      setSaving(false);
      alert('Configuration saved successfully!');
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <Calculator className="h-7 w-7 text-white" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                  Tax Configuration
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Configure tax settings for your organization (Uganda - URA Compliant)
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* URA Compliance Alert */}
        <Alert 
          severity="info" 
          icon={<Info className="h-5 w-5" />}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Uganda Revenue Authority (URA) Compliance
          </Typography>
          <Typography variant="body2">
            This configuration follows Uganda's tax regulations. Default fiscal year: July 1 - June 30. 
            VAT registration threshold: UGX {config.vat_registration_threshold.toLocaleString()}.
          </Typography>
        </Alert>

        {/* Configuration Form */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Default Tax Rate */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Default Tax Rate
                </Typography>
                <TextField
                  label="Default Tax Rate"
                  select
                  value={config.default_tax_rate_id || ''}
                  onChange={(e) => setConfig({ ...config, default_tax_rate_id: Number(e.target.value) })}
                  fullWidth
                  helperText="Select the default tax rate to apply automatically"
                >
                  {mockTaxRates
                    .filter(r => r.is_active && (r.tenant_id === currentUser?.tenant_id || r.is_system_default))
                    .map(rate => (
                      <MenuItem key={rate.tax_rate_id} value={rate.tax_rate_id}>
                        {rate.tax_name} ({rate.rate_percentage}%)
                      </MenuItem>
                    ))}
                </TextField>
              </Box>

              <Divider />

              {/* Auto-Calculation Settings */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Auto-Calculation Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.auto_calculate_tax}
                        onChange={(e) => setConfig({ ...config, auto_calculate_tax: e.target.checked })}
                      />
                    }
                    label="Automatically calculate tax on sales"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.auto_apply_to_animal_sales}
                        onChange={(e) => setConfig({ ...config, auto_apply_to_animal_sales: e.target.checked })}
                        disabled={!config.auto_calculate_tax}
                      />
                    }
                    label="Apply to animal sales"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.auto_apply_to_product_sales}
                        onChange={(e) => setConfig({ ...config, auto_apply_to_product_sales: e.target.checked })}
                        disabled={!config.auto_calculate_tax}
                      />
                    }
                    label="Apply to product sales"
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Reporting Settings */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Reporting Settings
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Tax Year Start Month"
                    select
                    value={config.tax_year_start_month}
                    onChange={(e) => setConfig({ ...config, tax_year_start_month: Number(e.target.value) })}
                    fullWidth
                    helperText={`Uganda fiscal year: ${getMonthName(config.tax_year_start_month)} 1 - ${getMonthName(config.tax_year_start_month === 7 ? 6 : config.tax_year_start_month - 1)} 30`}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <MenuItem key={month} value={month}>
                        {getMonthName(month)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Reporting Currency"
                    value={config.reporting_currency}
                    onChange={(e) => setConfig({ ...config, reporting_currency: e.target.value })}
                    fullWidth
                    disabled
                    helperText="Uganda Shilling (UGX)"
                  />
                </Stack>
              </Box>

              <Divider />

              {/* URA Compliance Settings */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  URA Compliance Settings
                </Typography>
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.require_tax_id}
                        onChange={(e) => setConfig({ ...config, require_tax_id: e.target.checked })}
                      />
                    }
                    label={`Require ${config.tax_id_label} (Tax Identification Number) for sales`}
                  />
                  <TextField
                    label="Tax ID Label"
                    value={config.tax_id_label}
                    onChange={(e) => setConfig({ ...config, tax_id_label: e.target.value })}
                    fullWidth
                    helperText="Label for tax ID field (e.g., 'TIN', 'VAT Number')"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ura_vat_registered}
                        onChange={(e) => setConfig({ ...config, ura_vat_registered: e.target.checked })}
                      />
                    }
                    label="Business is VAT registered with URA"
                  />
                  {config.ura_vat_registered && (
                    <TextField
                      label="URA VAT Number"
                      value={config.ura_vat_number || ''}
                      onChange={(e) => setConfig({ ...config, ura_vat_number: e.target.value })}
                      fullWidth
                      helperText="Your URA VAT registration number"
                    />
                  )}
                  <TextField
                    label="URA TIN (Tax Identification Number)"
                    value={config.ura_tin || ''}
                    onChange={(e) => setConfig({ ...config, ura_tin: e.target.value })}
                    fullWidth
                    helperText="Your URA Tax Identification Number"
                  />
                  <TextField
                    label="VAT Registration Threshold"
                    type="number"
                    value={config.vat_registration_threshold}
                    onChange={(e) => setConfig({ ...config, vat_registration_threshold: Number(e.target.value) })}
                    fullWidth
                    helperText={`Uganda threshold: ${formatCurrency(config.vat_registration_threshold)} annual turnover`}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>UGX</Typography>
                    }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Notification Settings */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Notification Settings
                </Typography>
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notify_on_tax_due}
                        onChange={(e) => setConfig({ ...config, notify_on_tax_due: e.target.checked })}
                      />
                    }
                    label="Notify on tax due dates"
                  />
                  <TextField
                    label="Tax Due Reminder Days"
                    type="number"
                    value={config.tax_due_reminder_days}
                    onChange={(e) => setConfig({ ...config, tax_due_reminder_days: Number(e.target.value) })}
                    fullWidth
                    disabled={!config.notify_on_tax_due}
                    helperText="Days before tax due date to send reminder"
                    inputProps={{ min: 1, max: 30 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setConfig(mockTaxConfiguration)}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={<Save className="h-4 w-4" />}
            sx={{
              background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)'
              }
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

