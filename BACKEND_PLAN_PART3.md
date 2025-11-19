# iFarm Backend Plan - Part 3: Domain-Specific Apps

## Layer Architecture Context

This document details **Layer 5 (Business Logic)** and **Layer 6 (Data Access)** components for domain-specific apps. These apps handle core business functionality:

- **Layer 5 (Business Logic)**: Service classes enforce business rules, orchestrate workflows, validate complex logic
- **Layer 6 (Data Access)**: Custom managers (TenantManager, FarmManager) automatically filter queries, optimize performance
- **Layer 7 (Database)**: PostgreSQL tables store domain data with constraints and indexes

All domain apps follow strict layer separation - services contain business logic, managers handle data access, and models define data structure.

---

## Domain-Specific Apps

### 1. Farms App

**Purpose**: Manage farm locations and user-farm associations.

#### Models

**Farm**
```python
class Farm(TenantModel):
    """Physical farm location"""
    farm_id = models.AutoField(primary_key=True)
    farm_name = models.CharField(max_length=200)
    
    # Location
    location = models.TextField(blank=True)
    district = models.CharField(max_length=100, blank=True)
    coordinates = models.JSONField(null=True, blank=True)  # {latitude, longitude}
    
    # Farm details
    farm_type = models.CharField(max_length=100, blank=True)
    size_acres = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('archived', 'Archived'),
    ], default='active')
    
    # Settings
    settings = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'farms'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['farm_name']),
        ]
    
    def __str__(self):
        return self.farm_name
```

**UserFarm**
```python
class UserFarm(TenantModel):
    """User-Farm association"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='user_farms')
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='user_farms')
    
    # Role at this farm
    role = models.CharField(max_length=50, choices=[
        ('owner', 'Owner'),
        ('manager', 'Manager'),
        ('worker', 'Worker'),
        ('viewer', 'Viewer'),
    ])
    
    # Permissions override (farm-specific)
    permissions_override = models.JSONField(default=dict, blank=True)
    
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='farm_assignments_made')
    
    class Meta:
        db_table = 'user_farms'
        unique_together = [('user', 'farm')]
        indexes = [
            models.Index(fields=['user', 'tenant']),
            models.Index(fields=['farm', 'role']),
        ]
```

---

### 2. Animals App

**Purpose**: Animal lifecycle management and tracking.

#### Models

**Animal**
```python
class Animal(FarmModel):
    """Core animal entity"""
    animal_id = models.AutoField(primary_key=True)
    tag_number = models.CharField(max_length=100)
    
    # Basic info
    animal_type = models.CharField(max_length=50, choices=[
        ('cattle', 'Cattle'),
        ('goat', 'Goat'),
        ('sheep', 'Sheep'),
        ('pig', 'Pig'),
        ('chicken', 'Chicken'),
        ('duck', 'Duck'),
        ('other', 'Other'),
    ])
    breed = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
    ])
    
    # Dates
    birth_date = models.DateField(null=True, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('deceased', 'Deceased'),
        ('disposed', 'Disposed'),
    ], default='active')
    
    health_status = models.CharField(max_length=20, choices=[
        ('healthy', 'Healthy'),
        ('sick', 'Sick'),
        ('recovering', 'Recovering'),
        ('quarantine', 'Quarantine'),
    ], default='healthy')
    
    # Lineage
    mother_animal = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='offspring_as_mother')
    father_animal = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='offspring_as_father')
    
    # Castration
    is_castrated = models.BooleanField(default=False)
    castration_date = models.DateField(null=True, blank=True)
    castration_method = models.CharField(max_length=20, blank=True)
    castration_notes = models.TextField(blank=True)
    
    # Additional info
    notes = models.TextField(blank=True)
    
    # Photos
    primary_photo = models.ForeignKey('media.MediaFile', on_delete=models.SET_NULL, null=True, blank=True, related_name='animals_as_primary')
    
    class Meta:
        db_table = 'animals'
        unique_together = [('tenant', 'farm', 'tag_number')]
        indexes = [
            models.Index(fields=['tenant', 'farm', 'status']),
            models.Index(fields=['tag_number']),
            models.Index(fields=['animal_type', 'status']),
        ]
    
    def __str__(self):
        return f"{self.tag_number} - {self.animal_type}"
    
    @property
    def age_days(self):
        if self.birth_date:
            return (timezone.now().date() - self.birth_date).days
        return None
    
    @property
    def age_months(self):
        days = self.age_days
        if days:
            return days // 30
        return None
```

**AnimalHistory**
```python
class AnimalHistory(BaseModel):
    """Historical snapshots of animal data"""
    history_id = models.AutoField(primary_key=True)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='history')
    
    # Snapshot data (JSON)
    data = models.JSONField()
    
    # Change tracking
    changed_fields = models.JSONField(default=list)
    changed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    change_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'animal_history'
        indexes = [
            models.Index(fields=['animal', 'created_at']),
        ]
```

---

### 3. Production App (Enhanced for Detailed Tracking)

**Purpose**: Production records with support for multiple sessions per day and quality metrics.

#### Models

**Production**
```python
class Production(FarmModel):
    """Production records with session-level tracking"""
    production_id = models.AutoField(primary_key=True)
    
    PRODUCTION_TYPES = [
        ('milk', 'Milk'),
        ('eggs', 'Eggs'),
        ('wool', 'Wool'),
        ('honey', 'Honey'),
    ]
    
    MILKING_SESSIONS = [
        ('morning', 'Morning'),
        ('evening', 'Evening'),
        ('midday', 'Midday'),
        ('custom', 'Custom'),
    ]
    
    MILKING_METHODS = [
        ('manual', 'Manual'),
        ('machine', 'Machine'),
        ('automatic', 'Automatic'),
    ]
    
    production_type = models.CharField(max_length=20, choices=PRODUCTION_TYPES)
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, null=True, blank=True, related_name='production_records')
    animal_group_id = models.IntegerField(null=True, blank=True)  # For group production
    
    # Date tracking
    production_date = models.DateField()
    production_datetime = models.DateTimeField(null=True, blank=True)
    
    # Session details (for milk production)
    milking_session = models.CharField(max_length=20, choices=MILKING_SESSIONS, null=True, blank=True)
    session_number = models.IntegerField(default=1)  # 1, 2, 3... for same day
    
    # Quantity
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=[
        ('liters', 'Liters'),
        ('kg', 'Kilograms'),
        ('pieces', 'Pieces'),
        ('dozen', 'Dozen'),
    ])
    
    # Milk quality metrics
    fat_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Percentage
    protein_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Percentage
    somatic_cell_count = models.IntegerField(null=True, blank=True)  # SCC per ml
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Celsius
    ph_level = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    lactose_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Percentage
    
    # Milking details
    milking_method = models.CharField(max_length=20, choices=MILKING_METHODS, null=True, blank=True)
    milking_duration = models.IntegerField(null=True, blank=True)  # Minutes
    milker_user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='milkings')
    
    # Health indicators (for milk)
    udder_condition = models.CharField(max_length=20, choices=[
        ('normal', 'Normal'),
        ('swollen', 'Swollen'),
        ('injured', 'Injured'),
    ], null=True, blank=True)
    milk_appearance = models.CharField(max_length=20, choices=[
        ('normal', 'Normal'),
        ('watery', 'Watery'),
        ('clotted', 'Clotted'),
        ('bloody', 'Bloody'),
    ], null=True, blank=True)
    
    quality_notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='production_records')
    
    class Meta:
        db_table = 'production'
        unique_together = [
            ('animal', 'production_date', 'milking_session', 'session_number'),
        ]
        indexes = [
            models.Index(fields=['tenant', 'farm', 'production_date']),
            models.Index(fields=['animal', 'production_date']),
            models.Index(fields=['production_type', 'production_date']),
            models.Index(fields=['tenant', 'production_date']),
        ]
    
    def __str__(self):
        animal_str = self.animal.tag_number if self.animal else 'Group'
        return f"{animal_str} - {self.production_date} - {self.quantity} {self.unit}"
```

**DailyProductionSummary**
```python
class DailyProductionSummary(FarmModel):
    """Aggregated daily production for quick queries"""
    summary_id = models.AutoField(primary_key=True)
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, null=True, blank=True, related_name='daily_summaries')
    production_type = models.CharField(max_length=20)
    summary_date = models.DateField()
    
    # Aggregated metrics
    total_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    session_count = models.IntegerField(default=0)
    average_quantity_per_session = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Quality averages (for milk)
    average_fat_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    average_protein_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    average_scc = models.IntegerField(null=True, blank=True)
    
    # Time range
    first_session_time = models.TimeField(null=True, blank=True)
    last_session_time = models.TimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'daily_production_summary'
        unique_together = [
            ('animal', 'summary_date', 'production_type'),
        ]
        indexes = [
            models.Index(fields=['tenant', 'farm', 'summary_date']),
            models.Index(fields=['animal', 'summary_date']),
        ]
    
    def __str__(self):
        animal_str = self.animal.tag_number if self.animal else 'Group'
        return f"{animal_str} - {self.summary_date} - {self.total_quantity}"
```

#### Services

**ProductionService**
```python
class ProductionService:
    @staticmethod
    @transaction.atomic
    def record_production(tenant_id, farm_id, animal_id, production_data):
        """Record production with automatic summary update"""
        # Create production record
        production = Production.objects.create(
            tenant_id=tenant_id,
            farm_id=farm_id,
            animal_id=animal_id,
            **production_data
        )
        
        # Update or create daily summary
        ProductionService._update_daily_summary(production)
        
        # Publish event
        kafka_producer.send('production.recorded', {
            'production_id': production.production_id,
            'animal_id': animal_id,
            'quantity': float(production.quantity),
            'date': production.production_date.isoformat(),
            'timestamp': timezone.now().isoformat()
        })
        
        # Log action
        AuditService.log(
            action='production_recorded',
            user=production.recorded_by,
            tenant_id=tenant_id,
            entity_type='production',
            entity_id=production.production_id,
            details=production_data
        )
        
        return production
    
    @staticmethod
    def _update_daily_summary(production):
        """Update daily summary after production record"""
        summary, created = DailyProductionSummary.objects.get_or_create(
            tenant=production.tenant,
            farm=production.farm,
            animal=production.animal,
            production_type=production.production_type,
            summary_date=production.production_date,
            defaults={
                'total_quantity': 0,
                'session_count': 0,
                'average_quantity_per_session': 0,
            }
        )
        
        # Aggregate from all production records for this day
        daily_records = Production.objects.filter(
            tenant=production.tenant,
            farm=production.farm,
            animal=production.animal,
            production_type=production.production_type,
            production_date=production.production_date
        )
        
        agg = daily_records.aggregate(
            total=Sum('quantity'),
            count=Count('production_id'),
            avg_fat=Avg('fat_content'),
            avg_protein=Avg('protein_content'),
            avg_scc=Avg('somatic_cell_count'),
            first_time=Min('production_datetime__time'),
            last_time=Max('production_datetime__time'),
        )
        
        summary.total_quantity = agg['total'] or 0
        summary.session_count = agg['count'] or 0
        summary.average_quantity_per_session = agg['total'] / agg['count'] if agg['count'] else 0
        summary.average_fat_content = agg['avg_fat']
        summary.average_protein_content = agg['avg_protein']
        summary.average_scc = agg['avg_scc']
        summary.first_session_time = agg['first_time']
        summary.last_session_time = agg['last_time']
        summary.save()
        
        return summary
    
    @staticmethod
    def get_animal_production_trends(animal_id, days=30):
        """Get production trends for an animal"""
        start_date = timezone.now().date() - timedelta(days=days)
        
        summaries = DailyProductionSummary.objects.filter(
            animal_id=animal_id,
            summary_date__gte=start_date
        ).order_by('summary_date')
        
        return {
            'summaries': list(summaries),
            'average_daily': summaries.aggregate(Avg('total_quantity'))['total_quantity__avg'],
            'total': summaries.aggregate(Sum('total_quantity'))['total_quantity__sum'],
        }
```

#### Signals

```python
@receiver(post_save, sender=Production)
def production_post_save(sender, instance, created, **kwargs):
    """Handle production post-save"""
    if created:
        # Update daily summary
        ProductionService._update_daily_summary(instance)
        
        # Invalidate cache
        cache.delete(f'production_summary:{instance.animal_id}:{instance.production_date}')
```

---

### 4. Veterinary App

**Purpose**: Comprehensive veterinary and health management.

#### Models

**HealthCheck**
```python
class HealthCheck(FarmModel):
    """Health check records"""
    health_check_id = models.AutoField(primary_key=True)
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, related_name='health_checks')
    
    check_date = models.DateField()
    performed_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='health_checks_performed')
    
    # Vital signs
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    respiratory_rate = models.IntegerField(null=True, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # Assessment
    overall_condition = models.CharField(max_length=20, choices=[
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ])
    
    diagnosis = models.TextField(blank=True)
    observations = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    
    # Follow-up
    next_check_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'health_checks'
        indexes = [
            models.Index(fields=['animal', 'check_date']),
            models.Index(fields=['tenant', 'farm', 'check_date']),
        ]
```

**Vaccination**
```python
class Vaccination(FarmModel):
    """Vaccination records"""
    vaccination_id = models.AutoField(primary_key=True)
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, related_name='vaccinations')
    
    vaccine_name = models.CharField(max_length=200)
    vaccine_type = models.CharField(max_length=100, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)
    
    vaccination_date = models.DateField()
    administered_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='vaccinations_administered')
    
    dosage = models.CharField(max_length=100, blank=True)
    administration_route = models.CharField(max_length=50, blank=True)  # e.g., 'subcutaneous', 'intramuscular'
    
    # Follow-up
    next_due_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'vaccinations'
        indexes = [
            models.Index(fields=['animal', 'vaccination_date']),
            models.Index(fields=['next_due_date']),
        ]
```

**Treatment**
```python
class Treatment(FarmModel):
    """Medical treatment records"""
    treatment_id = models.AutoField(primary_key=True)
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, related_name='treatments')
    
    treatment_date = models.DateField()
    diagnosis = models.TextField()
    treatment_type = models.CharField(max_length=50, choices=[
        ('medication', 'Medication'),
        ('surgery', 'Surgery'),
        ('therapy', 'Therapy'),
        ('other', 'Other'),
    ])
    
    # Medication details
    medication = models.CharField(max_length=200, blank=True)
    dosage = models.CharField(max_length=100, blank=True)
    duration_days = models.IntegerField(null=True, blank=True)
    
    # Personnel
    veterinarian = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='treatments_performed')
    
    # Follow-up
    follow_up_date = models.DateField(null=True, blank=True)
    outcome = models.CharField(max_length=20, choices=[
        ('recovered', 'Recovered'),
        ('improving', 'Improving'),
        ('no_change', 'No Change'),
        ('worsened', 'Worsened'),
    ], blank=True)
    
    # Cost
    cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'treatments'
        indexes = [
            models.Index(fields=['animal', 'treatment_date']),
            models.Index(fields=['follow_up_date']),
        ]
```

**Continue in next file...**


