'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Grid,
  alpha
} from '@mui/material';
import { TrendingUp, Calendar, BarChart3, PieChart, ExternalLink } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockBreedingRecords, mockAnimals } from '@/lib/mockData';

// Helper function to determine season from date
const getSeason = (date: string): 'dry' | 'wet' => {
  const month = new Date(date).getMonth() + 1;
  // Dry season: Nov-Apr (11, 12, 1, 2, 3, 4)
  // Wet season: May-Oct (5, 6, 7, 8, 9, 10)
  return (month >= 11 || month <= 4) ? 'dry' : 'wet';
};

// Helper function to get month name
const getMonthName = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', { month: 'long' });
};

export default function BirthRatesAnalyticsPage() {
  const [filterAnimalType, setFilterAnimalType] = useState<string>('all');
  const [filterSeason, setFilterSeason] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const currentUser = getCurrentUser();

  // Check if user has permission
  if (!currentUser || (!currentUser.is_owner && !hasPermission(currentUser, 'view_operational_reports'))) {
    return (
      <DashboardContainer>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don&apos;t have permission to access this page.
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  // Filter breeding records
  const filteredRecords = useMemo(() => {
    return mockBreedingRecords.filter(record => {
      const animal = mockAnimals.find(a => a.animal_id === record.animal_id);
      const matchesAnimalType = filterAnimalType === 'all' || animal?.animal_type === filterAnimalType;
      const matchesYear = filterYear === 'all' || 
        (record.actual_birth_date && new Date(record.actual_birth_date).getFullYear().toString() === filterYear);
      const matchesSeason = filterSeason === 'all' || 
        (record.actual_birth_date && getSeason(record.actual_birth_date) === filterSeason);
      
      return matchesAnimalType && matchesYear && matchesSeason && record.birth_outcome === 'successful';
    });
  }, [filterAnimalType, filterSeason, filterYear]);

  // Calculate analytics
  const monthlyData = useMemo(() => {
    const monthly: Record<string, number> = {};
    filteredRecords.forEach(record => {
      if (record.actual_birth_date) {
        const monthKey = new Date(record.actual_birth_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthly[monthKey] = (monthly[monthKey] || 0) + (record.offspring_count || 1);
      }
    });
    return monthly;
  }, [filteredRecords]);

  const animalTypeData = useMemo(() => {
    const byType: Record<string, number> = {};
    filteredRecords.forEach(record => {
      const animal = mockAnimals.find(a => a.animal_id === record.animal_id);
      if (animal) {
        byType[animal.animal_type] = (byType[animal.animal_type] || 0) + (record.offspring_count || 1);
      }
    });
    return byType;
  }, [filteredRecords]);

  const seasonalData = useMemo(() => {
    const bySeason: Record<string, number> = { dry: 0, wet: 0 };
    filteredRecords.forEach(record => {
      if (record.actual_birth_date) {
        const season = getSeason(record.actual_birth_date);
        bySeason[season] += (record.offspring_count || 1);
      }
    });
    return bySeason;
  }, [filteredRecords]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    mockBreedingRecords.forEach(record => {
      if (record.actual_birth_date) {
        years.add(new Date(record.actual_birth_date).getFullYear().toString());
      }
    });
    return Array.from(years).sort().reverse();
  }, []);

  // Top breeding months
  const topMonths = useMemo(() => {
    return Object.entries(monthlyData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [monthlyData]);

  const totalBirths = filteredRecords.reduce((sum, r) => sum + (r.offspring_count || 1), 0);
  const averagePerMonth = Object.keys(monthlyData).length > 0 
    ? (totalBirths / Object.keys(monthlyData).length).toFixed(1) 
    : '0';

  // External vs Internal Breeding Success Rate Analytics
  const sireSourceAnalytics = useMemo(() => {
    const internalRecords = mockBreedingRecords.filter(r => r.sire_source === 'internal');
    const externalRecords = mockBreedingRecords.filter(r => r.sire_source === 'external');
    
    // Calculate success rates
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
    
    // Calculate average offspring per successful birth
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
    
    // Calculate complications rate
    const internalComplications = internalRecords.filter(r => 
      r.birth_outcome === 'complications' || r.complications
    ).length;
    const internalComplicationsRate = internalTotal > 0 ? (internalComplications / internalTotal) * 100 : 0;
    
    const externalComplications = externalRecords.filter(r => 
      r.birth_outcome === 'complications' || r.complications
    ).length;
    const externalComplicationsRate = externalTotal > 0 ? (externalComplications / externalTotal) * 100 : 0;
    
    return {
      internal: {
        total: internalTotal,
        successful: internalSuccessful,
        successRate: internalSuccessRate,
        avgOffspring: internalAvgOffspring,
        complications: internalComplications,
        complicationsRate: internalComplicationsRate
      },
      external: {
        total: externalTotal,
        successful: externalSuccessful,
        successRate: externalSuccessRate,
        avgOffspring: externalAvgOffspring,
        complications: externalComplications,
        complicationsRate: externalComplicationsRate
      }
    };
  }, []);

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
                  sx={{
                    color: 'white',
                    mb: 0.5,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Birth Rate Analytics
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                  Analyze birth patterns, seasonal trends, and breeding performance
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Animal Type"
                value={filterAnimalType}
                onChange={(e) => setFilterAnimalType(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="cattle">Cattle</MenuItem>
                <MenuItem value="goat">Goat</MenuItem>
                <MenuItem value="sheep">Sheep</MenuItem>
                <MenuItem value="pig">Pig</MenuItem>
              </TextField>
              <TextField
                select
                label="Season"
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Seasons</MenuItem>
                <MenuItem value="dry">Dry Season</MenuItem>
                <MenuItem value="wet">Wet Season</MenuItem>
              </TextField>
              <TextField
                select
                label="Year"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Years</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={3}>
          {/* Births by Month Chart */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Births by Month
              </Typography>
              <Box sx={{ height: 350, position: 'relative', mt: 2 }}>
                {Object.keys(monthlyData).length > 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'space-around',
                    height: '100%',
                    gap: 2,
                    px: 2
                  }}>
                    {Object.entries(monthlyData)
                      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                      .map(([month, count]) => {
                      const maxCount = Math.max(...Object.values(monthlyData));
                      const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      const monthName = month.split(' ')[0];
                      return (
                        <Box key={month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 80 }}>
                          <Box sx={{ position: 'relative', width: '100%', height: 250 }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                height: `${Math.max(heightPercent, 3)}%`,
                                bgcolor: '#16a34a',
                                borderRadius: '8px 8px 0 0',
                                minHeight: '30px',
                                transition: 'all 0.3s',
                                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                                '&:hover': {
                                  bgcolor: '#15803d',
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.5)',
                                }
                              }}
                              title={`${count} births in ${month}`}
                            >
                              <Box sx={{ 
                                position: 'absolute', 
                                top: -25, 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                color: '#16a34a'
                              }}>
                                {count}
                              </Box>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
                            {monthName}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      No birth data available for selected filters
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Births by Animal Type - Pie Chart */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Births by Animal Type
                </Typography>
                {Object.keys(animalTypeData).length > 0 ? (
                  <Box sx={{ mt: 3 }}>
                    {/* Pie Chart */}
                    <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', mb: 3 }}>
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        {(() => {
                          const total = Object.values(animalTypeData).reduce((sum, c) => sum + c, 0);
                          const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
                          let currentAngle = -90;
                          return Object.entries(animalTypeData).map(([type, count], idx) => {
                            const percent = total > 0 ? (count / total) * 100 : 0;
                            const angle = (percent / 100) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            currentAngle = endAngle;
                            
                            const startAngleRad = (startAngle * Math.PI) / 180;
                            const endAngleRad = (endAngle * Math.PI) / 180;
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            const x1 = 100 + 80 * Math.cos(startAngleRad);
                            const y1 = 100 + 80 * Math.sin(startAngleRad);
                            const x2 = 100 + 80 * Math.cos(endAngleRad);
                            const y2 = 100 + 80 * Math.sin(endAngleRad);
                            
                            const pathData = [
                              `M 100 100`,
                              `L ${x1} ${y1}`,
                              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `Z`
                            ].join(' ');
                            
                            return (
                              <path
                                key={type}
                                d={pathData}
                                fill={colors[idx % colors.length]}
                                stroke="white"
                                strokeWidth="2"
                                style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              />
                            );
                          });
                        })()}
                        <circle cx="100" cy="100" r="50" fill="white" />
                        <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill="#16a34a">
                          {Object.values(animalTypeData).reduce((sum, c) => sum + c, 0)}
                        </text>
                        <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6b7280">
                          Total
                        </text>
                      </svg>
                    </Box>
                    
                    {/* Legend */}
                    <Stack spacing={1.5}>
                      {Object.entries(animalTypeData).map(([type, count], idx) => {
                        const total = Object.values(animalTypeData).reduce((sum, c) => sum + c, 0);
                        const percent = total > 0 ? (count / total) * 100 : 0;
                        const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
                        return (
                          <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%',
                              bgcolor: colors[idx % colors.length],
                              flexShrink: 0
                            }} />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                  {type}
                                </Typography>
                                <Typography variant="body2" fontWeight="700" sx={{ color: '#16a34a' }}>
                                  {count}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {percent.toFixed(1)}% of total
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  </Box>
                )}
            </CardContent>
          </Card>

          {/* Seasonal Distribution - Pie Chart */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Seasonal Distribution
              </Typography>
                {(seasonalData.dry > 0 || seasonalData.wet > 0) ? (
                  <Box sx={{ mt: 3 }}>
                    {/* Pie Chart */}
                    <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', mb: 3 }}>
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        {(() => {
                          const total = seasonalData.dry + seasonalData.wet;
                          if (total === 0) return null;
                          
                          const dryPercent = (seasonalData.dry / total) * 100;
                          const wetPercent = (seasonalData.wet / total) * 100;
                          
                          const dryAngle = (dryPercent / 100) * 360;
                          const wetAngle = (wetPercent / 100) * 360;
                          
                          // Dry season (orange)
                          const dryStartAngle = -90;
                          const dryEndAngle = dryStartAngle + dryAngle;
                          const dryStartRad = (dryStartAngle * Math.PI) / 180;
                          const dryEndRad = (dryEndAngle * Math.PI) / 180;
                          const dryLargeArc = dryAngle > 180 ? 1 : 0;
                          
                          const dryX1 = 100 + 80 * Math.cos(dryStartRad);
                          const dryY1 = 100 + 80 * Math.sin(dryStartRad);
                          const dryX2 = 100 + 80 * Math.cos(dryEndRad);
                          const dryY2 = 100 + 80 * Math.sin(dryEndRad);
                          
                          const dryPath = [
                            `M 100 100`,
                            `L ${dryX1} ${dryY1}`,
                            `A 80 80 0 ${dryLargeArc} 1 ${dryX2} ${dryY2}`,
                            `Z`
                          ].join(' ');
                          
                          // Wet season (blue)
                          const wetStartAngle = dryEndAngle;
                          const wetEndAngle = wetStartAngle + wetAngle;
                          const wetStartRad = (wetStartAngle * Math.PI) / 180;
                          const wetEndRad = (wetEndAngle * Math.PI) / 180;
                          const wetLargeArc = wetAngle > 180 ? 1 : 0;
                          
                          const wetX1 = 100 + 80 * Math.cos(wetStartRad);
                          const wetY1 = 100 + 80 * Math.sin(wetStartRad);
                          const wetX2 = 100 + 80 * Math.cos(wetEndRad);
                          const wetY2 = 100 + 80 * Math.sin(wetEndRad);
                          
                          const wetPath = [
                            `M 100 100`,
                            `L ${wetX1} ${wetY1}`,
                            `A 80 80 0 ${wetLargeArc} 1 ${wetX2} ${wetY2}`,
                            `Z`
                          ].join(' ');
                          
                          return (
                            <>
                              {dryPercent > 0 && (
                                <path
                                  d={dryPath}
                                  fill="#f59e0b"
                                  stroke="white"
                                  strokeWidth="3"
                                  style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                />
                              )}
                              {wetPercent > 0 && (
                                <path
                                  d={wetPath}
                                  fill="#3b82f6"
                                  stroke="white"
                                  strokeWidth="3"
                                  style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                />
                              )}
                              <circle cx="100" cy="100" r="50" fill="white" />
                              <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill="#16a34a">
                                {total}
                              </text>
                              <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6b7280">
                                Total Births
                              </text>
                            </>
                          );
                        })()}
                      </svg>
                    </Box>
                    
                    {/* Legend */}
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                          <Typography variant="body1" fontWeight="600">
                            Dry Season
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#f59e0b' }}>
                          {seasonalData.dry} births
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha('#3b82f6', 0.1), borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                          <Typography variant="body1" fontWeight="600">
                            Wet Season
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#3b82f6' }}>
                          {seasonalData.wet} births
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No seasonal data available
                    </Typography>
                  </Box>
                )}
            </CardContent>
          </Card>

          {/* Top Producing Animals */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Top Producing Animals
              </Typography>
              {(() => {
                // Calculate births per animal
                const animalBirths: Record<number, { count: number; totalOffspring: number; lastBirth: string | null }> = {};
                filteredRecords.forEach(record => {
                  if (!animalBirths[record.animal_id]) {
                    animalBirths[record.animal_id] = { count: 0, totalOffspring: 0, lastBirth: null };
                  }
                  animalBirths[record.animal_id].count++;
                  animalBirths[record.animal_id].totalOffspring += (record.offspring_count || 1);
                  const birthDate = record.actual_birth_date || record.expected_due_date;
                  if (birthDate && (!animalBirths[record.animal_id].lastBirth || birthDate > animalBirths[record.animal_id].lastBirth!)) {
                    animalBirths[record.animal_id].lastBirth = birthDate;
                  }
                });

                const topProducers = Object.entries(animalBirths)
                  .map(([animalId, data]) => {
                    const animal = mockAnimals.find(a => a.animal_id === Number(animalId));
                    return {
                      animalId: Number(animalId),
                      animal,
                      ...data,
                      avgOffspring: data.totalOffspring / data.count
                    };
                  })
                  .filter(item => item.animal && item.animal.gender === 'female')
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5);

                return topProducers.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Animal</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Total Births</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Avg Offspring</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Last Birth</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topProducers.map((producer, idx) => (
                          <TableRow key={producer.animalId}>
                            <TableCell>
                              <Chip
                                label={idx + 1}
                                size="small"
                                sx={{
                                  bgcolor: idx === 0 ? '#16a34a' : alpha('#16a34a', 0.1),
                                  color: idx === 0 ? 'white' : '#16a34a',
                                  fontWeight: 600,
                                  minWidth: 32
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="600">
                                  {producer.animal?.tag_number || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {producer.animal?.breed || producer.animal?.animal_type}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="700" sx={{ color: '#16a34a' }}>
                                {producer.count}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="600">
                                {producer.avgOffspring.toFixed(1)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {producer.lastBirth ? (
                                <Typography variant="body2">
                                  {new Date(producer.lastBirth).toLocaleDateString()}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">N/A</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No production data available
                    </Typography>
                  </Box>
                );
              })()}
            </CardContent>
          </Card>

          {/* External vs Internal Breeding Success Rates */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={20} />
                  External vs Internal Breeding Success Rates
                </Box>
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Internal Breeding */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: alpha('#16a34a', 0.05), borderRadius: 2, border: '2px solid', borderColor: alpha('#16a34a', 0.2) }}>
                    <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ color: '#16a34a', mb: 2 }}>
                      Internal Breeding (My Farm)
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Breeding Records</Typography>
                        <Typography variant="h5" fontWeight="700" sx={{ color: '#16a34a' }}>
                          {sireSourceAnalytics.internal.total}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="h4" fontWeight="700" sx={{ color: '#16a34a' }}>
                            {sireSourceAnalytics.internal.successRate.toFixed(1)}%
                          </Typography>
                          <Chip
                            label={`${sireSourceAnalytics.internal.successful} successful`}
                            size="small"
                            sx={{ bgcolor: '#16a34a', color: 'white' }}
                          />
                        </Box>
                        <Box sx={{ mt: 1, height: 8, bgcolor: alpha('#16a34a', 0.1), borderRadius: 1, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              height: '100%',
                              width: `${sireSourceAnalytics.internal.successRate}%`,
                              bgcolor: '#16a34a',
                              transition: 'width 0.5s'
                            }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Average Offspring per Birth</Typography>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#16a34a' }}>
                          {sireSourceAnalytics.internal.avgOffspring.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Complications Rate</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ color: '#e65100' }}>
                          {sireSourceAnalytics.internal.complicationsRate.toFixed(1)}% ({sireSourceAnalytics.internal.complications} cases)
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* External Breeding */}
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
                        <Typography variant="body2" color="text.secondary">Total Breeding Records</Typography>
                        <Typography variant="h5" fontWeight="700" sx={{ color: '#3b82f6' }}>
                          {sireSourceAnalytics.external.total}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="h4" fontWeight="700" sx={{ color: '#3b82f6' }}>
                            {sireSourceAnalytics.external.successRate.toFixed(1)}%
                          </Typography>
                          <Chip
                            label={`${sireSourceAnalytics.external.successful} successful`}
                            size="small"
                            sx={{ bgcolor: '#3b82f6', color: 'white' }}
                          />
                        </Box>
                        <Box sx={{ mt: 1, height: 8, bgcolor: alpha('#3b82f6', 0.1), borderRadius: 1, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              height: '100%',
                              width: `${sireSourceAnalytics.external.successRate}%`,
                              bgcolor: '#3b82f6',
                              transition: 'width 0.5s'
                            }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Average Offspring per Birth</Typography>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#3b82f6' }}>
                          {sireSourceAnalytics.external.avgOffspring.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Complications Rate</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ color: '#e65100' }}>
                          {sireSourceAnalytics.external.complicationsRate.toFixed(1)}% ({sireSourceAnalytics.external.complications} cases)
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Comparison Summary */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: alpha('#8b5cf6', 0.05), borderRadius: 2, border: '2px solid', borderColor: alpha('#8b5cf6', 0.2) }}>
                    <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ color: '#8b5cf6', mb: 2 }}>
                      Comparison Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Success Rate Difference</Typography>
                          <Typography 
                            variant="h5" 
                            fontWeight="700"
                            sx={{ 
                              color: sireSourceAnalytics.internal.successRate > sireSourceAnalytics.external.successRate 
                                ? '#16a34a' 
                                : '#3b82f6'
                            }}
                          >
                            {Math.abs(sireSourceAnalytics.internal.successRate - sireSourceAnalytics.external.successRate).toFixed(1)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sireSourceAnalytics.internal.successRate > sireSourceAnalytics.external.successRate 
                              ? 'Internal performs better' 
                              : 'External performs better'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Offspring Difference</Typography>
                          <Typography 
                            variant="h5" 
                            fontWeight="700"
                            sx={{ 
                              color: sireSourceAnalytics.internal.avgOffspring > sireSourceAnalytics.external.avgOffspring 
                                ? '#16a34a' 
                                : '#3b82f6'
                            }}
                          >
                            {Math.abs(sireSourceAnalytics.internal.avgOffspring - sireSourceAnalytics.external.avgOffspring).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sireSourceAnalytics.internal.avgOffspring > sireSourceAnalytics.external.avgOffspring 
                              ? 'Internal produces more' 
                              : 'External produces more'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Complications Difference</Typography>
                          <Typography 
                            variant="h5" 
                            fontWeight="700"
                            sx={{ 
                              color: sireSourceAnalytics.internal.complicationsRate < sireSourceAnalytics.external.complicationsRate 
                                ? '#16a34a' 
                                : '#e65100'
                            }}
                          >
                            {Math.abs(sireSourceAnalytics.internal.complicationsRate - sireSourceAnalytics.external.complicationsRate).toFixed(1)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sireSourceAnalytics.internal.complicationsRate < sireSourceAnalytics.external.complicationsRate 
                              ? 'Internal has fewer complications' 
                              : 'External has fewer complications'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Top Breeding Months */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Top Breeding Months
              </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Births</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topMonths.length > 0 ? (
                        topMonths.map(([month, count], idx) => (
                          <TableRow key={month}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={idx + 1} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: idx === 0 ? '#16a34a' : alpha('#16a34a', 0.1),
                                    color: idx === 0 ? 'white' : '#16a34a',
                                    fontWeight: 600,
                                    minWidth: 32
                                  }} 
                                />
                                <Typography>{month}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="600">{count}</Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No data available
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </DashboardContainer>
  );
}

