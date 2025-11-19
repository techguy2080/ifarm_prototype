# iFarm Hybrid Authentication: Auth0 + Django

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Architecture Plan  
**Approach**: Hybrid Authentication (Auth0) + Authorization (Django)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Why Hybrid Auth0 + Django](#why-hybrid-auth0--django)
3. [Architecture Overview](#architecture-overview)
4. [Layer Integration](#layer-integration)
5. [Data Separation](#data-separation)
6. [User Registration & Invitation Flow](#user-registration--invitation-flow)
7. [Login Flow](#login-flow)
8. [Profile Management with Legal Compliance](#profile-management-with-legal-compliance)
9. [Role & Permission Management](#role--permission-management)
10. [Implementation Guide](#implementation-guide)
11. [Security Considerations](#security-considerations)
12. [Migration Strategy](#migration-strategy)

---

## Overview

The iFarm system uses a **hybrid authentication approach** combining:

- **Auth0**: Identity Provider (Authentication)
  - User authentication (email/password)
  - Email verification
  - 2FA/MFA
  - Password reset
  - Social login (Google, Microsoft, etc.)
  - Suspicious login detection
  - Device tracking
  - Universal Login (hosted login page)

- **Django**: Authorization Provider (Authorization)
  - Role creation and management
  - Permission assignment (RBAC/ABAC)
  - Farm-level access control
  - Permission delegation
  - User profile management
  - Legal compliance data storage

### Key Benefits

✅ **Separation of Concerns**: Auth0 handles authentication, Django handles authorization  
✅ **Security**: Auth0's battle-tested security infrastructure  
✅ **User Experience**: Auth0 Universal Login provides excellent UX  
✅ **Legal Compliance**: Django stores all legal/compliance data (NIN, addresses, etc.)  
✅ **Owner Control**: Owners create roles and assign permissions in Django  
✅ **Less Code**: No need to implement 2FA, password reset, etc.  
✅ **Scalability**: Auth0 scales authentication, Django scales authorization

---

## Why Hybrid Auth0 + Django

### The Problem with Pure Django Auth

**Challenges**:
- ❌ Complex 2FA implementation
- ❌ Password reset complexity
- ❌ Social login integration
- ❌ Suspicious login detection
- ❌ Device tracking complexity
- ❌ Maintenance burden

### The Solution: Hybrid Approach

**Auth0 Handles**:
- ✅ Authentication complexity (2FA, password reset, social login)
- ✅ Security features (suspicious login detection, device tracking)
- ✅ User experience (Universal Login, passwordless options)

**Django Handles**:
- ✅ Authorization (roles, permissions, RBAC/ABAC)
- ✅ Business logic (farm assignments, delegations)
- ✅ Legal compliance data (NIN, addresses, personal info)
- ✅ Owner control (creating roles, assigning permissions)

---

## Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│  HYBRID AUTHENTICATION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AUTH0 (Identity Provider)                           │  │
│  │  - User authentication                               │  │
│  │  - Email verification                                 │  │
│  │  - 2FA/MFA                                            │  │
│  │  - Password reset                                     │  │
│  │  - Social login                                       │  │
│  │  - Suspicious login detection                         │  │
│  │  - Returns: Auth0 JWT (user identity)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DJANGO (Authorization Provider)                     │  │
│  │  - Validates Auth0 JWT                                │  │
│  │  - Creates/updates user in Django DB                 │  │
│  │  - Manages roles & permissions (RBAC/ABAC)           │  │
│  │  - Farm-level access control                          │  │
│  │  - Permission delegation                              │  │
│  │  - Legal compliance data storage                      │  │
│  │  - Returns: Django JWT (with permissions/roles)      │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LAYER 4: API LAYER                                  │  │
│  │  - Validates Django JWT                              │  │
│  │  - Checks permissions                                │  │
│  │  - Enforces tenant/farm isolation                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Complete Authentication Flow

```
1. Owner creates invitation (Django)
   - Inputs: Email, First Name, Last Name, Phone, NIN, Address, Role, Farms
   ↓
2. Django creates invitation record
   - Stores profile data in invitation
   ↓
3. Auth0 creates user account (via Management API)
   - Email only (password set later by user)
   - User metadata: {first_name, last_name, phone}
   ↓
4. User receives invitation email
   - Contains Auth0 Universal Login link
   ↓
5. User clicks link → Auth0 Universal Login
   - Sets password
   - Completes email verification
   - Sets up 2FA (if required)
   ↓
6. Auth0 callback → Django
   - Validates Auth0 JWT
   - Creates Django User (auth0_user_id, email)
   - Creates Profile (ALL legal compliance data)
   - Assigns role and farms
   ↓
7. Django generates JWT with permissions
   - Includes: user_id, tenant_id, permissions, accessible_farms
   ↓
8. Frontend receives Django JWT
   - Uses for all API calls
   - Permissions baked in
```

---

## Layer Integration

### Layer Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: PRESENTATION LAYER                                │
│  - Auth0 Universal Login (hosted)                           │
│  - Django admin UI (role/permission management)              │
│  - Frontend (permission-based rendering)                    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: API GATEWAY (Nginx)                               │
│  - Routes Auth0 callbacks                                    │
│  - Routes Django API requests                                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: MIDDLEWARE LAYER                                  │
│  - Auth0TokenMiddleware: Validates Auth0 JWT                │
│  - DjangoTokenMiddleware: Validates Django JWT               │
│  - TenantMiddleware: Tenant isolation                       │
│  - PermissionCheckMiddleware: Permission validation          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: API LAYER (Django REST Framework)                │
│  - Auth0 callback endpoint                                  │
│  - User management endpoints                                │
│  - Role/permission management endpoints                      │
│  - Profile management endpoints                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: BUSINESS LOGIC LAYER (Django Services)            │
│  - Auth0Service: Auth0 Management API integration          │
│  - AuthService: Authentication orchestration                 │
│  - PermissionService: RBAC/ABAC evaluation                  │
│  - RoleService: Role creation and assignment                │
│  - ProfileService: Legal compliance data management         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 6: DATA ACCESS LAYER (Django ORM)                   │
│  - User queries (linked to Auth0 user_id)                   │
│  - Profile queries (legal compliance data)                  │
│  - Role/permission queries                                  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 7: DATABASE LAYER (PostgreSQL)                       │
│  - users table (auth0_user_id, email)                       │
│  - profiles table (legal compliance data)                   │
│  - roles, permissions tables                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Separation

### What Auth0 Stores

**Authentication Data Only**:
- Email address
- Password (hashed by Auth0)
- 2FA/MFA settings
- Login history
- Device information
- Suspicious activity flags

**User Metadata (Optional, for reference)**:
- `first_name` (synced from Django)
- `last_name` (synced from Django)
- `phone` (synced from Django)

### What Django Stores

**Authorization Data**:
- `auth0_user_id` (link to Auth0)
- `email` (synced from Auth0)
- `account_status`
- `primary_tenant_id`
- Role assignments
- Permission assignments
- Farm assignments

**Legal Compliance Data (Profile)**:
- First Name, Last Name, Middle Name (REQUIRED)
- National ID Number (NIN)
- Passport Number
- Tax Identification Number (TIN)
- Driving License Number
- Phone, Alternate Phone (REQUIRED)
- Address, City, District, Region, Country (REQUIRED)
- Date of Birth
- Gender
- Emergency Contact Information
- Legal Documents (NIN copy, passport copy)
- Data Consent Flags
- Terms Acceptance Flags

---

## User Registration & Invitation Flow

### Owner Creates User with Profile Information

```python
# invitations/services.py

class InvitationService:
    @staticmethod
    @transaction.atomic
    def send_invitation(
        invited_by_user_id,
        invitee_email,
        tenant_id,
        role_id,
        farms,
        # Profile information for legal compliance
        first_name,
        last_name,
        phone,
        national_id_number=None,
        address=None,
        city=None,
        district=None,
        date_of_birth=None,
        gender=None,
        emergency_contact_name=None,
        emergency_contact_phone=None
    ):
        """
        Owner creates invitation with full profile information
        
        Layer Flow:
        - Layer 5 (Business Logic): InvitationService
        - Layer 4 (API): Auth0 Management API call
        - Layer 6 (Data Access): Django ORM
        - Layer 7 (Database): PostgreSQL
        """
        # 1. Create invitation in Django (Layer 5)
        invitation = Invitation.objects.create(
            invited_by_user_id=invited_by_user_id,
            invitee_email=invitee_email,
            tenant_id=tenant_id,
            role_id=role_id,
            farms=farms,
            invitation_token=uuid.uuid4(),
            expires_at=timezone.now() + timedelta(days=7),
            # Store profile data in invitation (Layer 6)
            profile_data={
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'national_id_number': national_id_number,
                'address': address,
                'city': city,
                'district': district,
                'date_of_birth': date_of_birth.isoformat() if date_of_birth else None,
                'gender': gender,
                'emergency_contact_name': emergency_contact_name,
                'emergency_contact_phone': emergency_contact_phone
            }
        )
        
        # 2. Create user in Auth0 (via Management API) - Layer 4
        auth0_user = Auth0Service.create_user(
            email=invitee_email,
            connection='email',
            send_verification_email=True,
            # Store minimal metadata in Auth0 (for reference only)
            user_metadata={
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'invitation_id': invitation.invitation_id
            }
        )
        
        # 3. Store Auth0 user_id in invitation (Layer 6)
        invitation.auth0_user_id = auth0_user['user_id']
        invitation.save()
        
        # 4. Send invitation email with Auth0 Universal Login link (Layer 5)
        send_invitation_email.delay(invitation.invitation_id)
        
        # 5. Log audit (Layer 5)
        AuditService.log(
            action='invitation_created',
            user_id=invited_by_user_id,
            tenant_id=tenant_id,
            entity_type='invitation',
            entity_id=invitation.invitation_id,
            details={'invitee_email': invitee_email}
        )
        
        return invitation
```

### User Accepts Invitation

```python
# users/services.py

class Auth0Service:
    @staticmethod
    @transaction.atomic
    def handle_auth0_callback(auth0_token, invitation_token=None):
        """
        Auth0 callback after user sets password
        
        Layer Flow:
        - Layer 3 (Middleware): Validates Auth0 JWT
        - Layer 4 (API): Callback endpoint
        - Layer 5 (Business Logic): Auth0Service, ProfileService
        - Layer 6 (Data Access): Django ORM
        - Layer 7 (Database): PostgreSQL
        """
        # 1. Validate Auth0 JWT (Layer 3/4)
        auth0_payload = Auth0Service.validate_auth0_token(auth0_token)
        auth0_user_id = auth0_payload['sub']  # Auth0 user ID
        email = auth0_payload['email']
        
        # 2. Get invitation if provided
        invitation = None
        if invitation_token:
            invitation = Invitation.objects.get(
                invitation_token=invitation_token,
                status='pending'
            )
            
            # Verify Auth0 user matches invitation
            if invitation.auth0_user_id != auth0_user_id:
                raise ValueError("Auth0 user does not match invitation")
        
        # 3. Get or create Django User (Layer 5/6)
        user, created = User.objects.get_or_create(
            auth0_user_id=auth0_user_id,
            defaults={
                'email': email,
                'account_status': 'active',
                'email_verified': auth0_payload.get('email_verified', False),
                'primary_tenant_id': invitation.tenant_id if invitation else None
            }
        )
        
        # 4. Create Profile with ALL legal compliance data (Layer 5/6)
        if invitation and invitation.profile_data:
            profile_data = invitation.profile_data.copy()
            
            # Create or update profile
            profile, profile_created = Profile.objects.get_or_create(
                user=user,
                defaults={
                    'first_name': profile_data['first_name'],
                    'last_name': profile_data['last_name'],
                    'phone': profile_data['phone'],
                    'national_id_number': profile_data.get('national_id_number'),
                    'address': profile_data.get('address'),
                    'city': profile_data.get('city'),
                    'district': profile_data.get('district'),
                    'date_of_birth': datetime.fromisoformat(profile_data['date_of_birth']) if profile_data.get('date_of_birth') else None,
                    'gender': profile_data.get('gender'),
                    'emergency_contact_name': profile_data.get('emergency_contact_name'),
                    'emergency_contact_phone': profile_data.get('emergency_contact_phone'),
                    'data_consent_given': True,  # Implied by accepting invitation
                    'data_consent_date': timezone.now(),
                    'terms_accepted': True,
                    'terms_accepted_date': timezone.now()
                }
            )
            
            if not profile_created:
                # Update existing profile
                profile.first_name = profile_data['first_name']
                profile.last_name = profile_data['last_name']
                profile.phone = profile_data['phone']
                # ... update other fields
                profile.save()
        
        # 5. Assign role and farms (Layer 5)
        if invitation:
            # Assign role
            UserRole.objects.create(
                user=user,
                role_id=invitation.role_id,
                tenant_id=invitation.tenant_id
            )
            
            # Assign farms
            for farm_id in invitation.farms:
                UserFarm.objects.create(
                    user=user,
                    farm_id=farm_id,
                    tenant_id=invitation.tenant_id,
                    assigned_by_user_id=invitation.invited_by_user_id
                )
            
            # Mark invitation as accepted
            invitation.status = 'accepted'
            invitation.accepted_at = timezone.now()
            invitation.save()
        
        # 6. Generate Django JWT with permissions (Layer 5)
        permissions = PermissionService.get_user_permissions(user)
        accessible_farms = FarmService.get_accessible_farms(user)
        
        django_token = TokenService.generate_django_token(
            user=user,
            permissions=permissions,
            accessible_farms=accessible_farms
        )
        
        # 7. Log audit (Layer 5)
        AuditService.log(
            action='user_created_from_auth0',
            user_id=user.user_id,
            tenant_id=user.primary_tenant_id,
            details={
                'auth0_user_id': auth0_user_id,
                'is_new_user': created,
                'invitation_id': invitation.invitation_id if invitation else None
            }
        )
        
        return {
            'user': user,
            'profile': profile if invitation else None,
            'token': django_token,
            'is_new_user': created
        }
```

---

## Login Flow

### Complete Login Process

```python
# users/services.py

class AuthService:
    @staticmethod
    def login_with_auth0(auth0_token, request):
        """
        User logs in via Auth0 → Django validates → Returns Django JWT
        
        Layer Flow:
        - Layer 1 (Frontend): Auth0 Universal Login
        - Layer 3 (Middleware): Auth0TokenMiddleware validates Auth0 JWT
        - Layer 4 (API): Login endpoint
        - Layer 5 (Business Logic): AuthService, PermissionService
        - Layer 6 (Data Access): Django ORM
        - Layer 7 (Database): PostgreSQL
        """
        # 1. Validate Auth0 JWT (Layer 3/4)
        auth0_payload = Auth0Service.validate_auth0_token(auth0_token)
        auth0_user_id = auth0_payload['sub']
        email = auth0_payload['email']
        
        # 2. Get Django user (Layer 6)
        try:
            user = User.objects.select_related('profile').get(
                auth0_user_id=auth0_user_id
            )
        except User.DoesNotExist:
            # User exists in Auth0 but not Django - sync it
            user = Auth0Service.sync_auth0_user(auth0_user_id, auth0_payload)
        
        # 3. Check account status (Layer 5)
        if user.account_status != 'active':
            raise AuthenticationError(f"Account is {user.account_status}")
        
        # 4. Sync Auth0 metadata to Django (Layer 5)
        # Update email_verified status from Auth0
        user.email_verified = auth0_payload.get('email_verified', False)
        user.last_login_at = timezone.now()
        user.last_login_ip = get_client_ip(request)
        user.save()
        
        # 5. Get permissions from Django (Layer 5)
        permissions = PermissionService.get_user_permissions(user)
        accessible_farms = FarmService.get_accessible_farms(user)
        
        # 6. Generate Django JWT with permissions (Layer 5)
        django_token = TokenService.generate_django_token(
            user=user,
            permissions=permissions,
            accessible_farms=accessible_farms
        )
        
        # 7. Device tracking (Layer 5)
        device = DeviceFingerprintingService.track_login(
            user_id=user.user_id,
            request=request
        )
        
        # 8. Create session (Layer 6)
        session = SessionService.create_session(
            user=user,
            device=device,
            tokens={'access': django_token},
            request=request
        )
        
        # 9. Log audit (Layer 5)
        AuditService.log(
            action='user_login',
            user_id=user.user_id,
            tenant_id=user.primary_tenant_id,
            details={
                'auth0_user_id': auth0_user_id,
                'ip_address': get_client_ip(request),
                'device_id': device.device_id if device else None
            }
        )
        
        return {
            'user': user,
            'token': django_token,
            'session': session
        }
```

---

## Profile Management with Legal Compliance

### Updated Profile Model

```python
# users/models.py

class Profile(models.Model):
    """
    User profile - Personal information and legal compliance data
    Separated from User model following industry-standard User-Profile Pattern
    
    Layer Context:
    - Layer 6 (Data Access): Profile queries
    - Layer 7 (Database): profiles table
    """
    profile_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
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

### Profile Service

```python
# users/services.py

class ProfileService:
    @staticmethod
    @transaction.atomic
    def update_profile(user_id, profile_data, updated_by_user_id):
        """
        Owner or user updates profile information
        
        Layer Flow:
        - Layer 4 (API): Profile update endpoint
        - Layer 5 (Business Logic): ProfileService
        - Layer 6 (Data Access): Django ORM
        - Layer 7 (Database): PostgreSQL
        """
        user = User.objects.select_related('profile').get(pk=user_id)
        profile = user.profile
        
        # Update profile fields (Layer 6)
        if 'first_name' in profile_data:
            profile.first_name = profile_data['first_name']
        if 'last_name' in profile_data:
            profile.last_name = profile_data['last_name']
        if 'phone' in profile_data:
            profile.phone = profile_data['phone']
        if 'national_id_number' in profile_data:
            profile.national_id_number = profile_data['national_id_number']
        if 'address' in profile_data:
            profile.address = profile_data['address']
        if 'city' in profile_data:
            profile.city = profile_data['city']
        if 'district' in profile_data:
            profile.district = profile_data['district']
        if 'date_of_birth' in profile_data:
            profile.date_of_birth = profile_data['date_of_birth']
        # ... other fields
        
        profile.save()
        
        # Optionally sync to Auth0 user_metadata (for reference only)
        if user.auth0_user_id:
            Auth0Service.update_user_metadata(
                auth0_user_id=user.auth0_user_id,
                metadata={
                    'first_name': profile.first_name,
                    'last_name': profile.last_name,
                    'phone': profile.phone
                }
            )
        
        # Log audit (Layer 5)
        AuditService.log(
            action='profile_updated',
            user_id=updated_by_user_id,
            entity_type='profile',
            entity_id=profile.profile_id,
            details={'updated_fields': list(profile_data.keys())}
        )
        
        return profile
```

---

## Role & Permission Management

### Owner Creates Role (Django Only)

```python
# permissions/services.py

class RoleService:
    @staticmethod
    @transaction.atomic
    def create_role(owner_user, tenant_id, role_name, role_description, permissions):
        """
        Owner creates role → Django stores role
        
        Layer Flow:
        - Layer 4 (API): Role creation endpoint
        - Layer 5 (Business Logic): RoleService
        - Layer 6 (Data Access): Django ORM
        - Layer 7 (Database): PostgreSQL
        
        Note: Auth0 NOT involved - this is pure authorization
        """
        # Create role in Django (Layer 5/6)
        role = Role.objects.create(
            tenant_id=tenant_id,
            name=role_name,
            description=role_description,
            created_by=owner_user
        )
        
        # Assign permissions (Django handles this)
        role.permissions.set(permissions)
        
        # Log audit (Layer 5)
        AuditService.log(
            action='role_created',
            user=owner_user,
            tenant_id=tenant_id,
            entity_type='role',
            entity_id=role.role_id,
            details={'role_name': role_name, 'permissions_count': len(permissions)}
        )
        
        return role
    
    @staticmethod
    @transaction.atomic
    def assign_role_to_user(owner_user, user_id, role_id, tenant_id):
        """
        Owner assigns role to user → Django updates UserRole
        
        Layer Flow:
        - Layer 4 (API): Role assignment endpoint
        - Layer 5 (Business Logic): RoleService
        - Layer 6 (Data Access): Django ORM
        - Layer 7 (Database): PostgreSQL
        
        Note: Auth0 NOT involved - this is pure authorization
        """
        # Assign role (Layer 6)
        user_role, created = UserRole.objects.get_or_create(
            user_id=user_id,
            role_id=role_id,
            tenant_id=tenant_id,
            defaults={'assigned_by': owner_user}
        )
        
        # Invalidate permission cache (Layer 6)
        cache.delete(f'permissions:user:{user_id}:tenant:{tenant_id}')
        
        # Publish event for real-time update (Layer 5)
        kafka_producer.send('permissions.updated', {
            'user_id': user_id,
            'tenant_id': tenant_id,
            'permissions': PermissionService.get_user_permissions(user_id, tenant_id)
        })
        
        # Log audit (Layer 5)
        AuditService.log(
            action='role_assigned',
            user=owner_user,
            tenant_id=tenant_id,
            entity_type='user_role',
            entity_id=user_role.user_role_id,
            details={'user_id': user_id, 'role_id': role_id}
        )
        
        return user_role
```

---

## Implementation Guide

### Phase 1: Auth0 Setup

1. **Create Auth0 Account**
   - Sign up at auth0.com
   - Create tenant (e.g., `ifarm-production`)
   - Note: Domain, Client ID, Client Secret

2. **Configure Auth0 Application**
   - Create Regular Web Application
   - Set callback URLs: `https://yourdomain.com/api/v1/auth/callback`
   - Set logout URLs: `https://yourdomain.com/logout`
   - Enable email verification
   - Enable MFA

3. **Configure Auth0 Database Connection**
   - Use Email/Password connection
   - Enable email verification
   - Set password policy

### Phase 2: Django Integration

1. **Install Dependencies**
```bash
pip install auth0-python python-jose[cryptography]
```

2. **Configure Settings**
```python
# settings/base.py

AUTH0_DOMAIN = env('AUTH0_DOMAIN')
AUTH0_CLIENT_ID = env('AUTH0_CLIENT_ID')
AUTH0_CLIENT_SECRET = env('AUTH0_CLIENT_SECRET')
AUTH0_AUDIENCE = env('AUTH0_AUDIENCE', default=f'https://{AUTH0_DOMAIN}/api/v2/')
AUTH0_ALGORITHMS = ['RS256']
```

3. **Create Auth0 Service**
```python
# users/services.py

import requests
from django.conf import settings

class Auth0Service:
    """Service for Auth0 Management API integration"""
    
    @staticmethod
    def get_management_token():
        """Get Auth0 Management API token"""
        response = requests.post(
            f'https://{settings.AUTH0_DOMAIN}/oauth/token',
            json={
                'client_id': settings.AUTH0_CLIENT_ID,
                'client_secret': settings.AUTH0_CLIENT_SECRET,
                'audience': settings.AUTH0_AUDIENCE,
                'grant_type': 'client_credentials'
            }
        )
        return response.json()['access_token']
    
    @staticmethod
    def create_user(email, connection='email', send_verification_email=True, user_metadata=None):
        """Create user in Auth0"""
        token = Auth0Service.get_management_token()
        
        response = requests.post(
            f'https://{settings.AUTH0_DOMAIN}/api/v2/users',
            headers={'Authorization': f'Bearer {token}'},
            json={
                'email': email,
                'connection': connection,
                'email_verified': False,
                'verify_email': send_verification_email,
                'user_metadata': user_metadata or {}
            }
        )
        return response.json()
    
    @staticmethod
    def validate_auth0_token(token):
        """Validate Auth0 JWT token"""
        from jose import jwt
        from jose.utils import base64url_decode
        
        jwks_client = PyJWKClient(f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json')
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=settings.AUTH0_ALGORITHMS,
            audience=settings.AUTH0_AUDIENCE,
            issuer=f'https://{settings.AUTH0_DOMAIN}/'
        )
        
        return payload
```

### Phase 3: Update User Model

```python
# users/models.py

class User(AbstractUser):
    """
    Django User model - Authorization only
    Authentication handled by Auth0
    
    Layer Context:
    - Layer 6 (Data Access): User queries
    - Layer 7 (Database): users table
    """
    user_id = models.AutoField(primary_key=True)
    
    # Auth0 Integration
    auth0_user_id = models.CharField(max_length=255, unique=True, db_index=True)
    auth0_metadata = models.JSONField(default=dict, blank=True)
    
    # Multi-tenancy
    primary_tenant = models.ForeignKey('tenants.Tenant', ...)
    
    # Account status (synced from Auth0)
    account_status = models.CharField(max_length=20, default='active')
    email_verified = models.BooleanField(default=False)  # Synced from Auth0
    
    # No password field! (Auth0 handles authentication)
    password = None
    
    # Security tracking (synced from Auth0)
    last_login_at = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # MFA status (synced from Auth0)
    mfa_enabled = models.BooleanField(default=False)  # Synced from Auth0
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['auth0_user_id']),
            models.Index(fields=['email']),
        ]
```

### Phase 4: Update Middleware

```python
# core/middleware.py

class Auth0TokenMiddleware:
    """Middleware to validate Auth0 tokens and sync with Django"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip for public endpoints
        if self.is_public_endpoint(request.path):
            return self.get_response(request)
        
        # Extract Auth0 token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Missing authorization'}, status=401)
        
        auth0_token = auth_header.split(' ')[1]
        
        try:
            # Validate Auth0 token (Layer 4)
            auth0_payload = Auth0Service.validate_auth0_token(auth0_token)
            auth0_user_id = auth0_payload['sub']
            
            # Get or sync Django user (Layer 5/6)
            user = Auth0Service.sync_auth0_user(auth0_user_id, auth0_payload)
            
            # Get Django permissions (Layer 5)
            permissions = PermissionService.get_user_permissions(user)
            accessible_farms = FarmService.get_accessible_farms(user)
            
            # Generate Django JWT with permissions (Layer 5)
            django_token = TokenService.generate_django_token(
                user=user,
                permissions=permissions,
                accessible_farms=accessible_farms
            )
            
            # Inject into request
            request.user = user
            request.auth0_payload = auth0_payload
            request.django_token = django_token
            request.permissions = permissions
            request.accessible_farms = accessible_farms
            
        except Exception as e:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        response = self.get_response(request)
        
        # Add Django token to response header
        response['X-Django-Token'] = django_token
        
        return response
```

---

## Security Considerations

### 1. Token Security

```python
# ✅ CORRECT: Use HTTP-only cookies for refresh tokens
response.set_cookie(
    'refresh_token',
    refresh_token,
    httponly=True,
    secure=True,
    samesite='strict',
    max_age=7*24*60*60  # 7 days
)

# ✅ CORRECT: Short-lived access tokens
access_token_expiry = 15 * 60  # 15 minutes
```

### 2. Data Encryption

```python
# Encrypt sensitive data (NIN) at rest
from cryptography.fernet import Fernet

class Profile(models.Model):
    # ... fields ...
    
    def save(self, *args, **kwargs):
        # Encrypt NIN before saving
        if self.national_id_number:
            self.national_id_number = encrypt_field(self.national_id_number)
        super().save(*args, **kwargs)
    
    @property
    def national_id_number_decrypted(self):
        """Decrypt NIN for display"""
        if self.national_id_number:
            return decrypt_field(self.national_id_number)
        return None
```

### 3. Audit Logging

```python
# All profile updates logged
AuditService.log(
    action='profile_updated',
    user_id=updated_by_user_id,
    entity_type='profile',
    entity_id=profile.profile_id,
    details={
        'updated_fields': list(profile_data.keys()),
        'sensitive_fields_updated': ['national_id_number' in profile_data]
    }
)
```

---

## Migration Strategy

### Phase 1: Setup (Week 1)
- Create Auth0 account and configure
- Install Auth0 dependencies
- Create Auth0Service
- Update User model (add auth0_user_id)

### Phase 2: Integration (Week 2)
- Implement Auth0 callback endpoint
- Update invitation flow
- Update login flow
- Test Auth0 → Django sync

### Phase 3: Migration (Week 3)
- Migrate existing users to Auth0
- Update frontend to use Auth0 Universal Login
- Test all authentication flows

### Phase 4: Cleanup (Week 4)
- Remove Django password fields
- Remove Django 2FA code
- Update documentation
- Deploy to production

---

## Summary

The hybrid Auth0 + Django approach provides:

✅ **Security**: Auth0's battle-tested authentication  
✅ **User Experience**: Auth0 Universal Login  
✅ **Owner Control**: Django handles all authorization  
✅ **Legal Compliance**: Django stores all legal data (NIN, addresses, etc.)  
✅ **Separation of Concerns**: Auth handles auth, Django handles authorization  
✅ **Less Code**: No need to implement 2FA, password reset, etc.  
✅ **Scalability**: Auth0 scales auth, Django scales authorization

**Key Points**:
- Auth0 handles authentication (email, password, 2FA, security)
- Django handles authorization (roles, permissions, RBAC/ABAC)
- Django Profile stores all legal compliance data (NIN, addresses, etc.)
- Owners input profile information when creating users
- All legal data stored in Django with full audit trail

**Status**: Production-ready architecture pattern! 🚀

