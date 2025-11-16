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
  Chip,
  Paper,
  Grid,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Calendar, Clock, CheckCircle, AlertCircle, Plus, Edit, Trash2, CalendarDays, List } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { mockWorkerSchedules, mockAnimals, mockUsers } from '@/lib/mockData';
import { WorkerSchedule, ScheduleTask } from '@/types';

export default function SchedulesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedWorker, setSelectedWorker] = useState<string>('all');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [taskFormData, setTaskFormData] = useState({
    assigned_worker_id: '',
    task_type: 'feeding',
    assigned_animals: [] as number[],
    time_slot: '08:00',
    duration_minutes: '60',
    priority: 'medium',
    notes: ''
  });
  const currentUser = getCurrentUser();

  // Check if user has permission - workers can view their own schedules, owners can view all
  const isWorker = currentUser && !currentUser.is_owner && !currentUser.is_super_admin;
  const canAccess = currentUser && (
    currentUser.is_owner || 
    hasPermission(currentUser, 'create_general') ||
    isWorker
  );
  
  if (!canAccess) {
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

  // For workers, filter to show only their tasks
  const effectiveWorkerFilter = isWorker && currentUser?.user_id 
    ? currentUser.user_id.toString() 
    : selectedWorker;

  // Get schedule for selected date
  const currentSchedule = useMemo(() => {
    return mockWorkerSchedules.find(s => 
      s.schedule_date === selectedDate && 
      (effectiveWorkerFilter === 'all' || s.worker_id === Number(effectiveWorkerFilter))
    );
  }, [selectedDate, effectiveWorkerFilter, refreshKey]);

  // Get all tasks for selected date (across all workers if 'all' selected)
  const allTasks = useMemo(() => {
    const schedules = effectiveWorkerFilter === 'all' 
      ? mockWorkerSchedules.filter(s => s.schedule_date === selectedDate)
      : mockWorkerSchedules.filter(s => s.schedule_date === selectedDate && s.worker_id === Number(effectiveWorkerFilter));
    
    return schedules.flatMap(schedule => 
      schedule.tasks.map(task => ({ ...task, worker_id: schedule.worker_id, schedule_id: schedule.schedule_id }))
    ).sort((a, b) => a.time_slot.localeCompare(b.time_slot));
  }, [selectedDate, effectiveWorkerFilter, refreshKey]);

  // Group tasks by time slot
  const tasksByTimeSlot = useMemo(() => {
    const grouped: Record<string, typeof allTasks> = {};
    allTasks.forEach(task => {
      if (!grouped[task.time_slot]) {
        grouped[task.time_slot] = [];
      }
      grouped[task.time_slot].push(task);
    });
    return grouped;
  }, [allTasks]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const overdue = allTasks.filter(t => {
      if (t.status === 'completed') return false;
      const taskTime = new Date(`${selectedDate}T${t.time_slot}`);
      return taskTime < new Date();
    }).length;
    
    return { total, completed, pending, overdue, completionRate: total > 0 ? (completed / total) * 100 : 0 };
  }, [allTasks, selectedDate]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskFormData({
      assigned_worker_id: '',
      task_type: 'feeding',
      assigned_animals: [],
      time_slot: '08:00',
      duration_minutes: '60',
      priority: 'medium',
      notes: ''
    });
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: ScheduleTask) => {
    setEditingTask(task);
    // Find the schedule this task belongs to
    const taskSchedule = mockWorkerSchedules.find(s => 
      s.tasks.some(t => t.task_id === task.task_id)
    );
    setTaskFormData({
      assigned_worker_id: taskSchedule ? taskSchedule.worker_id.toString() : '',
      task_type: task.task_type,
      assigned_animals: task.assigned_animals || [],
      time_slot: task.time_slot,
      duration_minutes: task.duration_minutes?.toString() || '60',
      priority: task.priority,
      notes: task.notes || ''
    });
    setTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    // In real app, would save to backend
    alert(editingTask ? 'Task updated! (Prototype)' : 'Task created! (Prototype)');
    setTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleToggleTaskStatus = (task: ScheduleTask & { worker_id: number; schedule_id: number }) => {
    // Find the schedule and task
    const schedule = mockWorkerSchedules.find(s => s.schedule_id === task.schedule_id);
    if (schedule) {
      const taskIndex = schedule.tasks.findIndex(t => t.task_id === task.task_id);
      if (taskIndex !== -1) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        schedule.tasks[taskIndex] = {
          ...schedule.tasks[taskIndex],
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
        
        // Update schedule status based on tasks
        const allCompleted = schedule.tasks.every(t => t.status === 'completed');
        const hasPending = schedule.tasks.some(t => t.status === 'pending');
        if (allCompleted) {
          schedule.status = 'completed';
        } else if (hasPending) {
          schedule.status = 'in_progress';
        }
        
        // Force re-render
        setRefreshKey(prev => prev + 1);
      }
    }
  };

  const getTaskIcon = (taskType: string) => {
    const icons: Record<string, string> = {
      feeding: '🌾',
      milking: '🥛',
      health_check: '🏥',
      cleaning: '🧹',
      breeding: '❤️',
      vaccination: '💉',
      other: '📋'
    };
    return icons[taskType] || '📋';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#dc2626',
      medium: '#f59e0b',
      low: '#16a34a'
    };
    return colors[priority] || '#6b7280';
  };

  const tenantAnimals = mockAnimals.filter(a => a.tenant_id === currentUser?.tenant_id);
  const workers = mockUsers.filter(u => u.user_id !== currentUser?.user_id && !u.is_super_admin);

  // Calendar helper functions
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    return date.getTime() === today.getTime();
  };

  const isSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
  };

  // Get calendar days for the current month
  const getCalendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; tasks: ScheduleTask[] }> = [];
    
    // Add previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = mockWorkerSchedules
        .filter(s => s.schedule_date === dateStr && (effectiveWorkerFilter === 'all' || s.worker_id === Number(effectiveWorkerFilter)))
        .flatMap(s => s.tasks);
      days.push({ date, isCurrentMonth: false, tasks: dayTasks });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = mockWorkerSchedules
        .filter(s => s.schedule_date === dateStr && (effectiveWorkerFilter === 'all' || s.worker_id === Number(effectiveWorkerFilter)))
        .flatMap(s => s.tasks);
      days.push({ date, isCurrentMonth: true, tasks: dayTasks });
    }
    
    // Add next month's leading days to fill the week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = mockWorkerSchedules
        .filter(s => s.schedule_date === dateStr && (effectiveWorkerFilter === 'all' || s.worker_id === Number(effectiveWorkerFilter)))
        .flatMap(s => s.tasks);
      days.push({ date, isCurrentMonth: false, tasks: dayTasks });
    }
    
    return days;
  }, [currentMonth, effectiveWorkerFilter, refreshKey]);

  const calendarDays = getCalendarDays;

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                  <Calendar size={32} color="white" strokeWidth={2} />
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
                    Daily Activity Schedule
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 400 }}>
                    Manage worker schedules, track task completion, and assign daily activities
                  </Typography>
                </Box>
              </Box>
              {!isWorker && (
                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  onClick={handleCreateTask}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                    },
                    px: 3,
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  Add Task
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* View Mode Tabs */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Tabs value={viewMode} onChange={(_, newValue) => setViewMode(newValue)}>
                <Tab 
                  icon={<CalendarDays size={20} />} 
                  label="Calendar View" 
                  value="calendar"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
                <Tab 
                  icon={<List size={20} />} 
                  label="List View" 
                  value="list"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
              </Tabs>
              {!isWorker && (
                <TextField
                  select
                  label="Worker"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  sx={{ minWidth: 200 }}
                  size="small"
                >
                  <MenuItem value="all">All Workers</MenuItem>
                  {workers.map((worker) => (
                    <MenuItem key={worker.user_id} value={worker.user_id.toString()}>
                      {worker.first_name} {worker.last_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {isWorker && (
                <Chip
                  label={`My Tasks - ${currentUser?.first_name} ${currentUser?.last_name}`}
                  sx={{
                    bgcolor: alpha('#16a34a', 0.1),
                    color: '#16a34a',
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              {/* Calendar Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button onClick={handlePreviousMonth} sx={{ minWidth: 'auto', px: 2 }}>
                  ←
                </Button>
                <Typography variant="h5" fontWeight="700" sx={{ color: '#2d5016' }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                <Button onClick={handleNextMonth} sx={{ minWidth: 'auto', px: 2 }}>
                  →
                </Button>
              </Box>

              {/* Calendar Grid */}
              <Grid container spacing={0.5}>
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Grid item xs={12/7} key={day}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 1.5, 
                      fontWeight: 700, 
                      color: '#16a34a',
                      bgcolor: alpha('#16a34a', 0.05),
                      borderRadius: 1
                    }}>
                      {day}
                    </Box>
                  </Grid>
                ))}
                
                {/* Calendar Days */}
                {calendarDays.map((dayData, index) => {
                  const dateStr = dayData.date.toISOString().split('T')[0];
                  const dayTasks = dayData.tasks;
                  const completedCount = dayTasks.filter(t => t.status === 'completed').length;
                  const pendingCount = dayTasks.filter(t => t.status === 'pending').length;
                  const overdueCount = dayTasks.filter(t => {
                    if (t.status === 'completed') return false;
                    const taskTime = new Date(`${dateStr}T${t.time_slot}`);
                    return taskTime < new Date();
                  }).length;
                  
                  return (
                    <Grid item xs={12/7} key={index}>
                      <Box
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setViewMode('list');
                        }}
                        sx={{
                          minHeight: 100,
                          p: 1,
                          border: '2px solid',
                          borderColor: isSelected(dayData.date) 
                            ? '#16a34a' 
                            : isToday(dayData.date)
                            ? alpha('#16a34a', 0.5)
                            : alpha('#e5e7eb', 1),
                          borderRadius: 2,
                          bgcolor: isSelected(dayData.date) 
                            ? alpha('#16a34a', 0.1)
                            : isToday(dayData.date)
                            ? alpha('#16a34a', 0.05)
                            : dayData.isCurrentMonth 
                            ? 'white' 
                            : alpha('#f3f4f6', 1),
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: alpha('#16a34a', 0.1),
                            borderColor: '#16a34a',
                            transform: 'scale(1.02)',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
                          },
                          opacity: dayData.isCurrentMonth ? 1 : 0.4
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          fontWeight={isToday(dayData.date) ? 700 : 600}
                          sx={{ 
                            color: isToday(dayData.date) ? '#16a34a' : 'text.primary',
                            mb: 0.5
                          }}
                        >
                          {dayData.date.getDate()}
                        </Typography>
                        
                        {dayTasks.length > 0 && (
                          <Stack spacing={0.5}>
                            {completedCount > 0 && (
                              <Chip
                                label={completedCount}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha('#16a34a', 0.2),
                                  color: '#16a34a',
                                  fontWeight: 700
                                }}
                              />
                            )}
                            {pendingCount > 0 && (
                              <Chip
                                label={pendingCount}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha('#f59e0b', 0.2),
                                  color: '#f59e0b',
                                  fontWeight: 700
                                }}
                              />
                            )}
                            {overdueCount > 0 && (
                              <Chip
                                label={overdueCount}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha('#dc2626', 0.2),
                                  color: '#dc2626',
                                  fontWeight: 700
                                }}
                              />
                            )}
                          </Stack>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Filters and Stats */}
        {viewMode === 'list' && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <TextField
                      label="Select Date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Daily Schedule - List View */}
        {viewMode === 'list' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(5, 150, 105, 0.15)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                  Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>

            {allTasks.length > 0 ? (
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha('#16a34a', 0.05) }}>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Task</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Animals</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allTasks.map((task) => {
                      const isOverdue = task.status !== 'completed' && new Date(`${selectedDate}T${task.time_slot}`) < new Date();
                      const assignedAnimals = task.assigned_animals?.map(id => 
                        tenantAnimals.find(a => a.animal_id === id)
                      ).filter(Boolean) || [];
                      
                      // Get assigned worker info
                      const taskSchedule = mockWorkerSchedules.find(s => 
                        s.tasks.some(t => t.task_id === task.task_id)
                      );
                      const assignedWorker = taskSchedule ? workers.find(w => w.user_id === taskSchedule.worker_id) : null;
                      
                      return (
                        <TableRow 
                          key={task.task_id}
                          sx={{ 
                            '&:hover': { bgcolor: alpha('#16a34a', 0.02) },
                            bgcolor: task.status === 'completed' ? alpha('#16a34a', 0.03) : 'white',
                            borderLeft: isOverdue ? '4px solid #dc2626' : 'none'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Clock size={16} color="#16a34a" />
                              <Typography variant="body2" fontWeight="600">
                                {task.time_slot}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6">{getTaskIcon(task.task_type)}</Typography>
                              <Box>
                                <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                                  {task.task_type.replace('_', ' ')}
                                </Typography>
                                {task.duration_minutes && (
                                  <Typography variant="caption" color="text.secondary">
                                    {task.duration_minutes} minutes
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {assignedWorker ? (
                              <Typography variant="body2">
                                {assignedWorker.first_name} {assignedWorker.last_name}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Unassigned
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {assignedAnimals.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {assignedAnimals.map(animal => (
                                  <Chip
                                    key={animal.animal_id}
                                    label={animal.tag_number}
                                    size="small"
                                    sx={{ fontSize: '0.7rem', height: 22 }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                None
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                                color: getPriorityColor(task.priority),
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip
                                label={task.status}
                                size="small"
                                icon={task.status === 'completed' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                sx={{
                                  bgcolor: task.status === 'completed' 
                                    ? alpha('#16a34a', 0.1) 
                                    : isOverdue 
                                    ? alpha('#dc2626', 0.1)
                                    : alpha('#f59e0b', 0.1),
                                  color: task.status === 'completed' 
                                    ? '#16a34a' 
                                    : isOverdue 
                                    ? '#dc2626'
                                    : '#f59e0b',
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                  fontSize: '0.75rem'
                                }}
                              />
                              {isOverdue && (
                                <Chip
                                  label="Overdue"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#dc2626', 0.1),
                                    color: '#dc2626',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Box>
                            {task.completed_at && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {new Date(task.completed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: task.notes ? 'italic' : 'normal' }}>
                              {task.notes || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              {!isWorker && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditTask(task)}
                                  sx={{ color: '#3b82f6' }}
                                  title="Edit task"
                                >
                                  <Edit size={16} />
                                </IconButton>
                              )}
                              {task.status === 'completed' ? (
                                <Chip
                                  label="Completed"
                                  size="small"
                                  icon={<CheckCircle size={14} />}
                                  sx={{
                                    bgcolor: alpha('#16a34a', 0.1),
                                    color: '#16a34a',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              ) : (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<CheckCircle size={14} />}
                                  onClick={() => handleToggleTaskStatus(task as ScheduleTask & { worker_id: number; schedule_id: number })}
                                  sx={{ 
                                    bgcolor: '#16a34a',
                                    '&:hover': { bgcolor: '#15803d' },
                                    fontSize: '0.7rem',
                                    px: 1.5,
                                    py: 0.5
                                  }}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Calendar size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click &quot;Add Task&quot; to create a new task for this date
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        )}

        {/* Create/Edit Task Dialog */}
        <Dialog 
          open={taskDialogOpen} 
          onClose={() => setTaskDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#2d5016' }}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                select
                label="Assign To Worker/Manager"
                fullWidth
                required
                value={taskFormData.assigned_worker_id}
                onChange={(e) => setTaskFormData({ ...taskFormData, assigned_worker_id: e.target.value })}
                helperText="Select the worker or manager who will complete this task"
              >
                <MenuItem value="">-- Select Worker --</MenuItem>
                {workers.map((worker) => (
                  <MenuItem key={worker.user_id} value={worker.user_id.toString()}>
                    {worker.first_name} {worker.last_name} ({worker.email})
                    {worker.roles && worker.roles.some(r => r.role_name.toLowerCase().includes('manager')) && ' - Manager'}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Task Type"
                fullWidth
                value={taskFormData.task_type}
                onChange={(e) => setTaskFormData({ ...taskFormData, task_type: e.target.value })}
              >
                <MenuItem value="feeding">Feeding</MenuItem>
                <MenuItem value="milking">Milking</MenuItem>
                <MenuItem value="health_check">Health Check</MenuItem>
                <MenuItem value="cleaning">Cleaning</MenuItem>
                <MenuItem value="breeding">Breeding</MenuItem>
                <MenuItem value="vaccination">Vaccination</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              
              <TextField
                label="Time Slot"
                type="time"
                fullWidth
                value={taskFormData.time_slot}
                onChange={(e) => setTaskFormData({ ...taskFormData, time_slot: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={taskFormData.duration_minutes}
                onChange={(e) => setTaskFormData({ ...taskFormData, duration_minutes: e.target.value })}
              />
              
              <TextField
                select
                label="Priority"
                fullWidth
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
              
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Assign Animals (Optional)
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                  <Stack spacing={1}>
                    {tenantAnimals.map(animal => (
                      <FormControlLabel
                        key={animal.animal_id}
                        control={
                          <Checkbox
                            checked={taskFormData.assigned_animals.includes(animal.animal_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTaskFormData({
                                  ...taskFormData,
                                  assigned_animals: [...taskFormData.assigned_animals, animal.animal_id]
                                });
                              } else {
                                setTaskFormData({
                                  ...taskFormData,
                                  assigned_animals: taskFormData.assigned_animals.filter(id => id !== animal.animal_id)
                                });
                              }
                            }}
                          />
                        }
                        label={`${animal.tag_number} - ${animal.breed || animal.animal_type}`}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Box>
              
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={taskFormData.notes}
                onChange={(e) => setTaskFormData({ ...taskFormData, notes: e.target.value })}
                placeholder="Additional notes or instructions..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleSaveTask}
              sx={{
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' },
                fontWeight: 600
              }}
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardContainer>
  );
}

