'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { ArrowLeft, Save, Package } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockFarms, mockInventoryItems } from '@/lib/mockData';
import Link from 'next/link';

const steps = ['Item Information', 'Stock & Pricing', 'Supplier & Location', 'Review'];

export default function RecordInventoryItemPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [inventoryFormData, setInventoryFormData] = useState({
    item_name: '',
    item_code: '',
    category: 'feed' as 'feed' | 'medication' | 'equipment' | 'tools' | 'supplies' | 'bedding' | 'other',
    subcategory: '',
    description: '',
    unit: 'kg',
    current_stock: '',
    reorder_point: '',
    reorder_quantity: '',
    unit_cost: '',
    supplier: '',
    supplier_contact: '',
    location: '',
    expiry_date: '',
    batch_number: '',
    notes: '',
    farm_id: ''
  });
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'create_general'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don&apos;t have permission to add inventory items.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  const tenantFarms = mockFarms.filter(f => f.tenant_id === currentUser?.tenant_id);

  // Auto-generate item code based on category and name
  useEffect(() => {
    if (inventoryFormData.item_name && inventoryFormData.category && !inventoryFormData.item_code) {
      const categoryPrefix: Record<string, string> = {
        feed: 'FEED',
        medication: 'MED',
        equipment: 'EQP',
        tools: 'TOOL',
        supplies: 'SUP',
        bedding: 'BED',
        other: 'OTH'
      };
      const prefix = categoryPrefix[inventoryFormData.category] || 'OTH';
      const nameCode = inventoryFormData.item_name
        .split(' ')
        .map(word => word.substring(0, 2).toUpperCase())
        .join('')
        .substring(0, 4);
      const existingCount = mockInventoryItems.filter(
        item => item.item_code?.startsWith(`${prefix}-${nameCode}`)
      ).length;
      const number = String(existingCount + 1).padStart(3, '0');
      setInventoryFormData(prev => ({
        ...prev,
        item_code: `${prefix}-${nameCode}-${number}`
      }));
    }
  }, [inventoryFormData.item_name, inventoryFormData.category]);

  // Auto-set unit based on category
  useEffect(() => {
    if (inventoryFormData.category) {
      const defaultUnits: Record<string, string> = {
        feed: 'kg',
        medication: 'vials',
        equipment: 'pieces',
        tools: 'pieces',
        supplies: 'pieces',
        bedding: 'bales',
        other: 'pieces'
      };
      if (!inventoryFormData.unit || inventoryFormData.unit === 'kg') {
        setInventoryFormData(prev => ({
          ...prev,
          unit: defaultUnits[inventoryFormData.category] || 'pieces'
        }));
      }
    }
  }, [inventoryFormData.category]);

  const handleNext = () => {
    // Validation based on step
    if (activeStep === 0) {
      if (!inventoryFormData.item_name || !inventoryFormData.category || !inventoryFormData.farm_id) {
        alert('Please fill in item name, category, and farm');
        return;
      }
    }
    if (activeStep === 1) {
      if (!inventoryFormData.current_stock || !inventoryFormData.reorder_point) {
        alert('Please fill in current stock and reorder point');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Calculate total value
    const totalValue = Number(inventoryFormData.current_stock) * Number(inventoryFormData.unit_cost || 0);
    
    // Determine status
    let status: 'active' | 'low_stock' | 'out_of_stock' | 'expired' | 'discontinued' = 'active';
    if (Number(inventoryFormData.current_stock) === 0) {
      status = 'out_of_stock';
    } else if (Number(inventoryFormData.current_stock) <= Number(inventoryFormData.reorder_point)) {
      status = 'low_stock';
    }

    // Check expiry
    if (inventoryFormData.expiry_date) {
      const expiry = new Date(inventoryFormData.expiry_date);
      const today = new Date();
      if (expiry < today) {
        status = 'expired';
      }
    }

    // Simulate API call
    setTimeout(() => {
      const newItem = {
        item_id: mockInventoryItems.length + 1,
        tenant_id: currentUser.tenant_id,
        farm_id: Number(inventoryFormData.farm_id),
        item_name: inventoryFormData.item_name,
        item_code: inventoryFormData.item_code || undefined,
        category: inventoryFormData.category,
        subcategory: inventoryFormData.subcategory || undefined,
        description: inventoryFormData.description || undefined,
        unit: inventoryFormData.unit,
        current_stock: Number(inventoryFormData.current_stock),
        reorder_point: Number(inventoryFormData.reorder_point),
        reorder_quantity: inventoryFormData.reorder_quantity ? Number(inventoryFormData.reorder_quantity) : undefined,
        unit_cost: inventoryFormData.unit_cost ? Number(inventoryFormData.unit_cost) : undefined,
        total_value: totalValue > 0 ? totalValue : undefined,
        supplier: inventoryFormData.supplier || undefined,
        supplier_contact: inventoryFormData.supplier_contact || undefined,
        location: inventoryFormData.location || undefined,
        expiry_date: inventoryFormData.expiry_date || undefined,
        batch_number: inventoryFormData.batch_number || undefined,
        status,
        notes: inventoryFormData.notes || undefined,
        created_by_user_id: currentUser.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockInventoryItems.push(newItem);
      alert('Inventory item created successfully!');
      setSubmitting(false);
      router.push('/dashboard/inventory/supplies');
    }, 1000);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 1: Item Information
            </Typography>
            <TextField
              label="Item Name"
              fullWidth
              required
              value={inventoryFormData.item_name}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, item_name: e.target.value })}
              placeholder="e.g., Cattle Feed Pellets"
            />

            <TextField
              label="Item Code (SKU)"
              fullWidth
              value={inventoryFormData.item_code}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, item_code: e.target.value })}
              helperText="Auto-generated if left empty"
              placeholder="e.g., FEED-CF-001"
            />

            <TextField
              select
              label="Category"
              fullWidth
              required
              value={inventoryFormData.category}
              onChange={(e) => setInventoryFormData({ 
                ...inventoryFormData, 
                category: e.target.value as any 
              })}
            >
              <MenuItem value="feed">Feed</MenuItem>
              <MenuItem value="medication">Medication</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="tools">Tools</MenuItem>
              <MenuItem value="supplies">Supplies</MenuItem>
              <MenuItem value="bedding">Bedding</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              label="Subcategory (Optional)"
              fullWidth
              value={inventoryFormData.subcategory}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, subcategory: e.target.value })}
              placeholder="e.g., pellets, hay, vaccine, antibiotic"
            />

            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={inventoryFormData.description}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, description: e.target.value })}
              placeholder="Additional details about the item..."
            />

            <TextField
              select
              label="Farm"
              fullWidth
              required
              value={inventoryFormData.farm_id}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, farm_id: e.target.value })}
            >
              <MenuItem value="">Select a farm</MenuItem>
              {tenantFarms.map((farm) => (
                <MenuItem key={farm.farm_id} value={farm.farm_id.toString()}>
                  {farm.farm_name} - {farm.location || farm.district || ''}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 2: Stock & Pricing
            </Typography>
            <TextField
              label="Unit of Measurement"
              fullWidth
              required
              select
              value={inventoryFormData.unit}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, unit: e.target.value })}
            >
              <MenuItem value="kg">Kilograms (kg)</MenuItem>
              <MenuItem value="liters">Liters</MenuItem>
              <MenuItem value="pieces">Pieces</MenuItem>
              <MenuItem value="bales">Bales</MenuItem>
              <MenuItem value="bags">Bags</MenuItem>
              <MenuItem value="vials">Vials</MenuItem>
              <MenuItem value="doses">Doses</MenuItem>
              <MenuItem value="meters">Meters</MenuItem>
              <MenuItem value="boxes">Boxes</MenuItem>
            </TextField>

            <TextField
              label="Current Stock"
              fullWidth
              required
              type="number"
              value={inventoryFormData.current_stock}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, current_stock: e.target.value })}
              inputProps={{ min: 0, step: 0.01 }}
              helperText={`In ${inventoryFormData.unit}`}
            />

            <TextField
              label="Reorder Point"
              fullWidth
              required
              type="number"
              value={inventoryFormData.reorder_point}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, reorder_point: e.target.value })}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Minimum stock level before reordering"
            />

            <TextField
              label="Reorder Quantity (Optional)"
              fullWidth
              type="number"
              value={inventoryFormData.reorder_quantity}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, reorder_quantity: e.target.value })}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Suggested quantity to order when stock is low"
            />

            <TextField
              label="Unit Cost (Optional)"
              fullWidth
              type="number"
              value={inventoryFormData.unit_cost}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, unit_cost: e.target.value })}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Cost per unit in UGX"
              InputProps={{
                endAdornment: <Typography variant="body2" sx={{ mr: 1 }}>UGX</Typography>
              }}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 3: Supplier & Location
            </Typography>
            <TextField
              label="Supplier Name (Optional)"
              fullWidth
              value={inventoryFormData.supplier}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, supplier: e.target.value })}
              placeholder="e.g., AgriFeed Supplies"
            />

            <TextField
              label="Supplier Contact (Optional)"
              fullWidth
              value={inventoryFormData.supplier_contact}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, supplier_contact: e.target.value })}
              placeholder="e.g., +256 700 123456"
            />

            <TextField
              label="Storage Location (Optional)"
              fullWidth
              value={inventoryFormData.location}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, location: e.target.value })}
              placeholder="e.g., Warehouse A - Feed Storage"
            />

            {(inventoryFormData.category === 'medication' || inventoryFormData.category === 'feed') && (
              <>
                <TextField
                  label="Expiry Date (Optional)"
                  type="date"
                  fullWidth
                  value={inventoryFormData.expiry_date}
                  onChange={(e) => setInventoryFormData({ ...inventoryFormData, expiry_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="For medications and perishable feed"
                />

                <TextField
                  label="Batch Number (Optional)"
                  fullWidth
                  value={inventoryFormData.batch_number}
                  onChange={(e) => setInventoryFormData({ ...inventoryFormData, batch_number: e.target.value })}
                  placeholder="e.g., BATCH-2024-001"
                />
              </>
            )}

            <TextField
              label="Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={inventoryFormData.notes}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, notes: e.target.value })}
              placeholder="Additional notes or instructions..."
            />
          </Stack>
        );

      case 3:
        const selectedFarm = mockFarms.find(f => f.farm_id.toString() === inventoryFormData.farm_id);
        const totalValue = Number(inventoryFormData.current_stock) * Number(inventoryFormData.unit_cost || 0);
        const status = Number(inventoryFormData.current_stock) === 0 ? 'out_of_stock' :
                      Number(inventoryFormData.current_stock) <= Number(inventoryFormData.reorder_point) ? 'low_stock' : 'active';
        
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2d5016', mb: 2 }}>
              Step 4: Review & Confirm
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#f1f8f4', borderRadius: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Item Name</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {inventoryFormData.item_name}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Item Code</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ fontFamily: 'monospace' }}>
                    {inventoryFormData.item_code || 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                    {inventoryFormData.category}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Farm</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedFarm?.farm_name || 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Current Stock</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {inventoryFormData.current_stock} {inventoryFormData.unit}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">Reorder Point</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {inventoryFormData.reorder_point} {inventoryFormData.unit}
                  </Typography>
                </Box>
                <Divider />
                {inventoryFormData.unit_cost && (
                  <>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Unit Cost</Typography>
                      <Typography variant="body1" fontWeight="600">
                        {Number(inventoryFormData.unit_cost).toLocaleString()} UGX
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Value</Typography>
                      <Typography variant="body1" fontWeight="600" sx={{ color: '#8b5cf6' }}>
                        {totalValue.toLocaleString()} UGX
                      </Typography>
                    </Box>
                    <Divider />
                  </>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                    {status.replace('_', ' ')}
                  </Typography>
                </Box>
                {inventoryFormData.supplier && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Supplier</Typography>
                      <Typography variant="body1" fontWeight="600">
                        {inventoryFormData.supplier}
                      </Typography>
                    </Box>
                  </>
                )}
                {inventoryFormData.location && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1" fontWeight="600">
                        {inventoryFormData.location}
                      </Typography>
                    </Box>
                  </>
                )}
                {inventoryFormData.expiry_date && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                      <Typography variant="body1" fontWeight="600">
                        {new Date(inventoryFormData.expiry_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

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
                <Package size={32} color="white" strokeWidth={2} />
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
                  Add Inventory Item
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Step-by-step guide to add new inventory items
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {renderStepContent()}

            <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={activeStep === 0 ? () => router.push('/dashboard/inventory/supplies') : handleBack}
                disabled={submitting}
              >
                {activeStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button 
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  sx={{
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#45a049' },
                    fontWeight: 600
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Item'}
                </Button>
              ) : (
                <Button 
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#45a049' },
                    fontWeight: 600
                  }}
                >
                  Next
                </Button>
              )}
            </Stack>
          </form>
        </Paper>
      </Box>
    </DashboardContainer>
  );
}

