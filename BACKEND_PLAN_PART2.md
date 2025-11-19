# iFarm Backend Plan - Part 2: Core Infrastructure Details

## Layer Architecture Context

This document details **Layer 3 (Middleware)**, **Layer 5 (Business Logic)**, and **Layer 6 (Data Access)** components for core infrastructure apps. These layers work together to provide:

- **Layer 3 (Middleware)**: Tenant isolation, permission checking, device tracking, **Auth0 token validation** 🆕
- **Layer 5 (Business Logic)**: Tenant management, user creation, usage tracking, **Auth0 integration services** 🆕, **legal compliance data management** 🆕
- **Layer 6 (Data Access)**: Custom managers for automatic tenant/farm filtering, **Profile queries with legal compliance data** 🆕

All components follow strict layer separation - middleware processes requests, services contain business logic, and managers handle data access.

**Hybrid Authentication Context**:
- **Auth0** (External): Handles authentication (Layer 1 - Frontend integration)
- **Django** (Layer 3-7): Handles authorization, profile management, legal compliance data storage

---

## Core Infrastructure Apps (Continued)

### 1. Core App - Managers & Middleware

**Layer Context**: This app provides components for **Layer 3 (Middleware)** and **Layer 6 (Data Access)**.

#### Layer 6: Custom Managers (Data Access Layer)

**TenantManager** - Automatically filters by tenant
```python
from threading import local

_thread_locals = local()

def get_current_tenant():
    """Get current tenant ID from thread local"""
    return getattr(_thread_locals, 'tenant_id', None)

def set_current_tenant(tenant_id):
    """Set current tenant ID in thread local"""
    _thread_locals.tenant_id = tenant_id

def clear_current_tenant():
    """Clear tenant ID from thread local"""
    if hasattr(_thread_locals, 'tenant_id'):
        del _thread_locals.tenant_id

class TenantManager(models.Manager):
    """Manager that automatically filters by tenant"""
    def get_queryset(self):
        qs = super().get_queryset()
        tenant_id = get_current_tenant()
        if tenant_id:
            return qs.filter(tenant_id=tenant_id)
        # Super admins can see all
        return qs
```

**FarmManager** - Filters by accessible farms
```python
def get_accessible_farms():
    """Get farms user can access from thread local"""
    return getattr(_thread_locals, 'accessible_farms', None)

def set_accessible_farms(farm_ids):
    """Set accessible farms in thread local"""
    _thread_locals.accessible_farms = farm_ids

class FarmManager(TenantManager):
    """Manager that filters by accessible farms"""
    def get_queryset(self):
        qs = super().get_queryset()
        farm_ids = get_accessible_farms()
        if farm_ids is not None:
            return qs.filter(farm_id__in=farm_ids)
        return qs
```

#### Layer 3: Middleware Components

**TenantMiddleware** - Extracts tenant context from JWT
```python
class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Extract tenant from JWT token
        token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '')
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                tenant_id = payload.get('tenant_id')
                user_id = payload.get('user_id')
                
                # Set thread locals
                set_current_tenant(tenant_id)
                
                # Get user's accessible farms
                user = User.objects.get(pk=user_id)
                farm_ids = get_user_accessible_farms(user, tenant_id)
                set_accessible_farms(farm_ids)
                
            except (jwt.DecodeError, jwt.ExpiredSignatureError, User.DoesNotExist):
                pass
        
        response = self.get_response(request)
        
        # Clear thread locals
        clear_current_tenant()
        set_accessible_farms(None)
        
        return response
```

**PermissionCheckMiddleware** - Validates route permissions
```python
class PermissionCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip for public endpoints
        if request.path.startswith('/api/public/'):
            return self.get_response(request)
        
        # Check if user has permission for this route
        if request.user.is_authenticated:
            required_perms = get_route_permissions(request.path, request.method)
            if required_perms:
                has_access = PermissionService.has_any_permission(
                    request.user, required_perms
                )
                if not has_access:
                    return JsonResponse(
                        {'error': 'Forbidden', 'detail': 'You do not have permission to access this resource'},
                        status=403
                    )
        
        return self.get_response(request)
```

**DeviceTrackingMiddleware** - Tracks devices and detects abuse
```python
class DeviceTrackingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.user.is_authenticated:
            # Track device
            device_fingerprint = request.META.get('HTTP_X_DEVICE_FINGERPRINT')
            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Check for abuse
            if DeviceService.is_abusive_request(request.user, ip_address):
                return JsonResponse(
                    {'error': 'Too Many Requests', 'detail': 'Rate limit exceeded'},
                    status=429
                )
            
            # Track request
            DeviceService.track_request(request.user, device_fingerprint, ip_address, user_agent)
        
        return self.get_response(request)
```

---

### 2. Tenants App

**Layer Context**: This app spans **Layer 5 (Business Logic)** and **Layer 6 (Data Access)**.

#### Layer 6: Models (Data Access Layer)

**Tenant**
```python
class Tenant(BaseModel):
    """Organization/tenant in the system"""
    tenant_id = models.AutoField(primary_key=True)
    organization_name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    owner_user = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='owned_tenants')
    
    # Subscription
    subscription = models.ForeignKey('subscriptions.Subscription', on_delete=models.SET_NULL, null=True, blank=True)
    subscription_status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('trial', 'Trial'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
    ], default='trial')
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    
    # Settings
    settings = models.JSONField(default=dict, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    currency = models.CharField(max_length=3, default='UGX')
    language = models.CharField(max_length=10, default='en')
    
    # Branding
    logo = models.ForeignKey('media.MediaFile', on_delete=models.SET_NULL, null=True, blank=True, related_name='tenant_logos')
    primary_color = models.CharField(max_length=7, default='#047857')
    
    # Status
    is_active = models.BooleanField(default=True)
    suspended_at = models.DateTimeField(null=True, blank=True)
    suspension_reason = models.TextField(blank=True)
    
    # Usage limits (enforced by subscription)
    max_users = models.IntegerField(default=5)
    max_farms = models.IntegerField(default=2)
    max_animals = models.IntegerField(default=100)
    
    class Meta:
        db_table = 'tenants'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['subscription_status']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.organization_name
    
    @property
    def is_trial(self):
        return self.subscription_status == 'trial'
    
    @property
    def trial_days_remaining(self):
        if self.trial_ends_at:
            delta = self.trial_ends_at - timezone.now()
            return max(0, delta.days)
        return 0
```

#### Layer 5: Services (Business Logic Layer)

**TenantService**
```python
class TenantService:
    @staticmethod
    @transaction.atomic
    def create_tenant(organization_name, owner_email, owner_password, owner_first_name, owner_last_name, owner_phone=''):
        """Create new tenant with owner user"""
        # Generate unique slug
        slug = slugify(organization_name)
        base_slug = slug
        counter = 1
        while Tenant.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create owner user (authentication only - following User-Profile Separation Pattern)
        owner = User.objects.create_user(
            email=owner_email,
            password=owner_password,
            account_status='active',
            email_verified=True
        )
        
        # Create tenant
        tenant = Tenant.objects.create(
            organization_name=organization_name,
            slug=slug,
            owner_user=owner,
            subscription_status='trial',
            trial_ends_at=timezone.now() + timedelta(days=14),
            is_active=True
        )
        
        # Create profile for owner (personal information)
        Profile.objects.create(
            user=owner,
            first_name=owner_first_name,
            last_name=owner_last_name,
            phone=owner_phone
        )
        
        # Link user to tenant
        UserTenant.objects.create(
            user=owner,
            tenant=tenant,
            is_owner=True
        )
        
        # Create default farm
        farm = Farm.objects.create(
            tenant=tenant,
            farm_name=f"{organization_name} Main Farm",
            status='active'
        )
        
        # Link owner to farm
        UserFarm.objects.create(
            user=owner,
            farm=farm,
            tenant=tenant,
            role='owner'
        )
        
        # Create default owner role
        owner_role = Role.objects.create(
            tenant=tenant,
            name='Owner',
            description='Farm owner with full access',
            is_default=True
        )
        # Add all permissions to owner role
        owner_role.permissions.set(Permission.objects.all())
        
        # Assign role to owner
        UserRole.objects.create(
            user=owner,
            role=owner_role,
            tenant=tenant
        )
        
        # Send welcome email
        NotificationService.send_notification(
            user=owner,
            notification_type='welcome',
            title='Welcome to iFarm!',
            message=f'Your account has been created. Your trial ends in 14 days.',
            channel='email'
        )
        
        # Log action
        AuditService.log(
            action='tenant_created',
            user=owner,
            tenant=tenant,
            details={'organization_name': organization_name}
        )
        
        return tenant, owner
    
    @staticmethod
    def suspend_tenant(tenant_id, reason, suspended_by):
        """Suspend tenant access"""
        tenant = Tenant.objects.get(pk=tenant_id)
        tenant.is_active = False
        tenant.suspended_at = timezone.now()
        tenant.suspension_reason = reason
        tenant.subscription_status = 'suspended'
        tenant.save()
        
        # Revoke all active sessions
        UserSession.objects.filter(
            tenant=tenant,
            is_active=True
        ).update(
            is_active=False,
            revoked_at=timezone.now()
        )
        
        # Notify owner
        NotificationService.send_notification(
            user=tenant.owner_user,
            notification_type='tenant_suspended',
            title='Account Suspended',
            message=f'Your account has been suspended. Reason: {reason}',
            channel='email'
        )
        
        # Log action
        AuditService.log(
            action='tenant_suspended',
            user=suspended_by,
            tenant=tenant,
            details={'reason': reason}
        )
        
        return tenant
    
    @staticmethod
    def get_tenant_usage_stats(tenant_id):
        """Get tenant usage statistics"""
        tenant = Tenant.objects.get(pk=tenant_id)
        
        stats = {
            'users': {
                'current': User.objects.filter(user_tenants__tenant=tenant).count(),
                'limit': tenant.max_users
            },
            'farms': {
                'current': Farm.objects.filter(tenant=tenant).count(),
                'limit': tenant.max_farms
            },
            'animals': {
                'current': Animal.objects.filter(tenant=tenant).count(),
                'limit': tenant.max_animals
            },
            'storage': {
                'current': MediaFile.objects.filter(tenant=tenant).aggregate(
                    total=Sum('file_size')
                )['total'] or 0,
                'limit': tenant.subscription.storage_limit if tenant.subscription else 1073741824  # 1GB
            }
        }
        
        return stats
    
    @staticmethod
    def check_usage_limits(tenant_id, resource_type):
        """Check if tenant is within usage limits"""
        stats = TenantService.get_tenant_usage_stats(tenant_id)
        resource_stats = stats.get(resource_type)
        
        if resource_stats:
            return resource_stats['current'] < resource_stats['limit']
        return True
```

#### Signals

```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Tenant)
def tenant_post_save(sender, instance, created, **kwargs):
    """Handle tenant post-save"""
    if created:
        # Publish event
        kafka_producer.send('tenant.created', {
            'tenant_id': instance.tenant_id,
            'organization_name': instance.organization_name,
            'timestamp': timezone.now().isoformat()
        })
```

---

### 3. Users App

**Layer Context**: This app spans **Layer 5 (Business Logic)** and **Layer 6 (Data Access)**.

#### Layer 6: Models (Data Access Layer)

**User** (Custom AbstractUser - Authorization Only, Authentication by Auth0)
```python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom user model - Authorization only
    Authentication handled by Auth0 (hybrid Auth0 + Django approach)
    Personal information stored in Profile model (User-Profile Separation Pattern)
    
    Layer Context:
    - Layer 6 (Data Access): User queries
    - Layer 7 (Database): users table
    """
    user_id = models.AutoField(primary_key=True)
    
    # Override username with email
    username = None
    email = models.EmailField(unique=True)
    
    # Auth0 Integration
    auth0_user_id = models.CharField(max_length=255, unique=True, db_index=True)  # Link to Auth0
    auth0_metadata = models.JSONField(default=dict, blank=True)  # Auth0 user metadata
    
    # Primary tenant (for multi-tenant isolation)
    primary_tenant = models.ForeignKey('tenants.Tenant', on_delete=models.SET_NULL, null=True, blank=True, related_name='primary_users')
    
    # Account status
    account_status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('pending_invitation', 'Pending Invitation'),
        ('suspended', 'Suspended'),
        ('deleted', 'Deleted'),
    ], default='pending_invitation')
    
    # Super admin flag (platform-wide access)
    is_super_admin = models.BooleanField(default=False)
    
    # Email verification (synced from Auth0)
    email_verified = models.BooleanField(default=False)
    
    # Multi-factor authentication (synced from Auth0)
    mfa_enabled = models.BooleanField(default=False)
    
    # Login tracking (synced from Auth0)
    last_login_at = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # No password field! Auth0 handles authentication
    password = None
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No additional required fields
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['auth0_user_id']),  # For Auth0 lookups
            models.Index(fields=['email']),
            models.Index(fields=['primary_tenant']),
            models.Index(fields=['account_status']),
            models.Index(fields=['is_super_admin']),
        ]
    
    def __str__(self):
        # Get name from profile if exists, else use email
        try:
            return f"{self.profile.full_name} ({self.email})"
        except:
            return self.email
    
    @property
    def full_name(self):
        """Get full name from profile"""
        try:
            return self.profile.full_name
        except:
            return self.email
```

**Profile** (User Personal Information & Legal Compliance)
```python
class Profile(models.Model):
    """
    User profile - Personal information, preferences, and legal compliance data
    Separated from User model following industry-standard User-Profile Pattern
    
    Layer Context:
    - Layer 6 (Data Access): Profile queries
    - Layer 7 (Database): profiles table
    """
    profile_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal information (REQUIRED for legal compliance)
    first_name = models.CharField(max_length=150)  # REQUIRED
    last_name = models.CharField(max_length=150)   # REQUIRED
    middle_name = models.CharField(max_length=150, blank=True)
    
    # Legal compliance fields (Uganda-specific)
    national_id_number = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        db_index=True  # For legal lookups
    )  # NIN
    passport_number = models.CharField(max_length=50, blank=True)
    tax_identification_number = models.CharField(max_length=50, blank=True)  # TIN
    driving_license_number = models.CharField(max_length=50, blank=True)
    
    # Contact information (REQUIRED)
    phone = models.CharField(max_length=20)  # REQUIRED
    alternate_phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField()  # Synced from Auth0
    
    # Location (REQUIRED for legal compliance)
    address = models.TextField()  # REQUIRED
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Uganda')
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Personal details
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other'),
            ('prefer_not_to_say', 'Prefer not to say'),
        ],
        null=True,
        blank=True
    )
    
    # Emergency contact (for legal compliance)
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)
    
    # Legal documents (references to media files)
    national_id_document = models.ForeignKey(
        'media.MediaFile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='national_id_docs'
    )
    passport_document = models.ForeignKey(
        'media.MediaFile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='passport_docs'
    )
    
    # Profile picture
    profile_picture = models.ForeignKey(
        'media.MediaFile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profiles'
    )
    
    # Preferences
    notification_preferences = models.JSONField(default=dict, blank=True)
    language = models.CharField(max_length=10, default='en')
    
    # Legal compliance flags
    data_consent_given = models.BooleanField(default=False)
    data_consent_date = models.DateTimeField(null=True, blank=True)
    terms_accepted = models.BooleanField(default=False)
    terms_accepted_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profiles'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['national_id_number']),  # For legal lookups
            models.Index(fields=['phone']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return self.full_name
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_compliant(self):
        """
        Check if profile has all required legal compliance fields
        
        Layer 5: Business Logic validation
        """
        required_fields = [
            self.first_name,
            self.last_name,
            self.phone,
            self.address,
            self.data_consent_given,
            self.terms_accepted
        ]
        return all(required_fields)
```

**Continue in next file...**

