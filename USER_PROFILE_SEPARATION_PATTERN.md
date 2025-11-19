# User-Profile Separation Pattern - Implementation Guide

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Implemented in Schema & Backend Plans

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [The Pattern](#the-pattern)
3. [Benefits](#benefits)
4. [Implementation Details](#implementation-details)
5. [Migration Strategy](#migration-strategy)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)

---

## Overview

The **User-Profile Separation Pattern** is an industry-standard database design pattern that separates authentication/security data from personal information. This pattern is used by major platforms like GitHub, LinkedIn, Django, and Stripe.

### The Core Principle

**Ask yourself**: "Is this field needed to authenticate the user?"
- **YES** → Goes in `users` table
- **NO** → Goes in `profiles` table

---

## The Pattern

### `users` Table = Authentication & Security

**Purpose**: "Can this user log in?"

**Contains:**
- ✅ **Email** - Username/identifier
- ✅ **Password** - Hashed password
- ✅ **MFA Settings** - Multi-factor authentication
- ✅ **Email Verification** - Tokens, timestamps
- ✅ **Password Reset** - Tokens, expiry
- ✅ **Login Tracking** - Last login, IP, failed attempts
- ✅ **Account Locks** - Security flags
- ✅ **System Flags** - is_active, is_super_admin, account_status

**Does NOT contain:**
- ❌ Name (first_name, last_name)
- ❌ Phone number
- ❌ Bio, date of birth, gender
- ❌ Address, location
- ❌ Preferences
- ❌ Profile picture

---

### `profiles` Table = Personal Information

**Purpose**: "Who is this user?"

**Contains:**
- ✅ **Personal Info** - first_name, last_name, phone
- ✅ **Demographics** - bio, date_of_birth, gender
- ✅ **Location** - address, city, district, country
- ✅ **Media** - profile_picture_id
- ✅ **Preferences** - notification_preferences, language

**Does NOT contain:**
- ❌ Authentication credentials
- ❌ Security tokens
- ❌ Login tracking
- ❌ System flags

---

## Benefits

### 1. 🚀 Performance

```sql
-- Authentication query (only touches small users table)
-- This is FAST because users table has fewer columns and rows stay small
SELECT user_id, email, password, mfa_enabled 
FROM users 
WHERE email = 'user@example.com';

-- Profile loads separately (only when needed)
-- This happens AFTER authentication, so no performance impact on login
SELECT * FROM profiles WHERE user_id = 123;
```

**Why it's faster:**
- Smaller table size = better cache utilization
- Fewer columns = less I/O per row
- Indexes are more efficient on smaller tables

---

### 2. 🔒 Security

**Authentication data is isolated:**
- Easier to apply stricter encryption
- Separate backup strategies
- Simpler security audits
- Password-related fields are contained

**Example security benefit:**
```python
# You can audit authentication attempts without touching personal data
auth_logs = AuditLog.objects.filter(
    action='login_attempt',
    entity_type='user'
)
# No exposure to names, addresses, etc.
```

---

### 3. 📈 Scalability

**Profile table can grow independently:**
```python
# Add new profile fields without touching authentication
class Profile(models.Model):
    # ... existing fields ...
    
    # NEW FIELDS - No impact on authentication!
    linkedin_url = models.URLField(blank=True)
    twitter_handle = models.CharField(max_length=100, blank=True)
    job_title = models.CharField(max_length=200, blank=True)
    company = models.CharField(max_length=200, blank=True)
```

**Sharding possibility:**
```
# Users table stays on primary DB (fast, critical)
users_db: users, user_sessions

# Profiles can be sharded by user_id
profiles_db_1: profiles (user_id 1-10000)
profiles_db_2: profiles (user_id 10001-20000)
```

---

### 4. 🌍 GDPR Compliance

**"Right to be Forgotten"** - Easy to implement:

```python
def delete_user_personal_data(user_id):
    """
    GDPR-compliant user data deletion
    Removes personal data while keeping authentication record for audit
    """
    # Delete personal information
    Profile.objects.filter(user_id=user_id).delete()
    
    # Mark user as deleted but keep for audit trail
    user = User.objects.get(user_id=user_id)
    user.account_status = 'deleted'
    user.is_active = False
    user.save()
    
    # User record remains for:
    # - Audit logs (who performed this action?)
    # - Compliance (this account existed)
    # - Foreign key integrity (user_id references)
```

---

### 5. 🔧 Flexibility

**Different caching strategies:**

```python
# Cache user authentication heavily (rarely changes)
@cache_page(60 * 60 * 24)  # 24 hours
def get_user_auth(user_id):
    return User.objects.get(pk=user_id)

# Cache profile less (changes more often)
@cache_page(60 * 15)  # 15 minutes
def get_user_profile(user_id):
    return Profile.objects.get(user_id=user_id)
```

**Profile versioning:**
```python
class ProfileHistory(models.Model):
    """Track profile changes over time"""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    data = models.JSONField()  # Profile snapshot
    changed_at = models.DateTimeField(auto_now_add=True)
```

---

## Implementation Details

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  
  -- AUTHENTICATION
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  
  -- MULTI-TENANT
  primary_tenant_id INTEGER REFERENCES tenants(tenant_id),
  
  -- SYSTEM FLAGS
  account_status VARCHAR(20) DEFAULT 'pending_invitation',
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_staff BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- EMAIL VERIFICATION
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token UUID,
  email_verification_sent_at TIMESTAMP,
  
  -- PASSWORD RESET
  password_reset_token UUID,
  password_reset_sent_at TIMESTAMP,
  password_reset_expires_at TIMESTAMP,
  
  -- MULTI-FACTOR AUTHENTICATION
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  backup_codes JSONB DEFAULT '[]',
  
  -- SECURITY TRACKING
  last_login_at TIMESTAMP,
  last_login_ip INET,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  
  -- AUDIT
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_primary_tenant ON users(primary_tenant_id);
CREATE INDEX idx_users_account_status ON users(account_status);
```

#### Profiles Table

```sql
CREATE TABLE profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- PERSONAL INFORMATION
  first_name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  
  -- DEMOGRAPHICS
  bio TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  
  -- LOCATION
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Uganda',
  
  -- MEDIA
  profile_picture_id INTEGER REFERENCES media_files(file_id),
  
  -- PREFERENCES
  notification_preferences JSONB DEFAULT '{}',
  language VARCHAR(10) DEFAULT 'en',
  
  -- AUDIT
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_name ON profiles(first_name, last_name);
```

---

### Django Models

#### User Model

```python
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    """
    Custom user model - Authentication and security only
    Personal information stored in Profile model (User-Profile Separation Pattern)
    """
    user_id = models.AutoField(primary_key=True)
    
    # Override username with email
    username = None
    email = models.EmailField(unique=True)
    
    # Primary tenant
    primary_tenant = models.ForeignKey(
        'tenants.Tenant', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='primary_users'
    )
    
    # Account status
    account_status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('pending_invitation', 'Pending Invitation'),
            ('suspended', 'Suspended'),
            ('deleted', 'Deleted'),
        ],
        default='pending_invitation'
    )
    
    # Super admin flag
    is_super_admin = models.BooleanField(default=False)
    
    # Email verification
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Password reset
    password_reset_token = models.UUIDField(null=True, blank=True)
    password_reset_sent_at = models.DateTimeField(null=True, blank=True)
    password_reset_expires_at = models.DateTimeField(null=True, blank=True)
    
    # MFA
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True)
    backup_codes = models.JSONField(default=list, blank=True)
    
    # Login tracking
    last_login_at = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No additional required fields
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['primary_tenant']),
            models.Index(fields=['account_status']),
            models.Index(fields=['is_super_admin']),
        ]
    
    def __str__(self):
        # Get name from profile if exists
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
    
    def is_account_locked(self):
        """Check if account is locked"""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False
```

#### Profile Model

```python
class Profile(models.Model):
    """
    User profile - Personal information and preferences
    Separated from User model following industry-standard User-Profile Pattern
    """
    profile_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    
    # Personal information
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    
    # Extended profile
    profile_picture = models.ForeignKey(
        'media.MediaFile', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='user_profiles'
    )
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    
    # Location
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Uganda')
    
    # Preferences
    notification_preferences = models.JSONField(default=dict, blank=True)
    language = models.CharField(max_length=10, default='en')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profiles'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['first_name', 'last_name']),
        ]
    
    def __str__(self):
        return self.full_name
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
```

---

## Migration Strategy

### Step 1: Add Columns to Profiles

```sql
ALTER TABLE profiles 
ADD COLUMN first_name VARCHAR(150),
ADD COLUMN last_name VARCHAR(150),
ADD COLUMN phone VARCHAR(20);
```

### Step 2: Migrate Data

```sql
UPDATE profiles p
SET 
  first_name = u.first_name,
  last_name = u.last_name,
  phone = u.phone
FROM users u
WHERE p.user_id = u.user_id;
```

### Step 3: Make Fields NOT NULL

```sql
ALTER TABLE profiles 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;
```

### Step 4: Add Indexes

```sql
CREATE INDEX idx_profiles_name ON profiles(first_name, last_name);
```

### Step 5: Update Application Code

```python
# OLD CODE (before migration)
user = User.objects.create(
    email='user@example.com',
    password='hashed',
    first_name='John',
    last_name='Doe'
)

# NEW CODE (after migration)
user = User.objects.create(
    email='user@example.com',
    password='hashed'
)

Profile.objects.create(
    user=user,
    first_name='John',
    last_name='Doe'
)
```

### Step 6: Remove from Users (After Testing)

```sql
ALTER TABLE users 
DROP COLUMN first_name,
DROP COLUMN last_name,
DROP COLUMN phone;
```

---

## Code Examples

### Creating a New User

```python
from django.db import transaction

@transaction.atomic
def create_user_with_profile(email, password, first_name, last_name, phone=''):
    """Create user and profile together"""
    # Create authentication user
    user = User.objects.create_user(
        email=email,
        password=password,
        account_status='active'
    )
    
    # Create profile
    profile = Profile.objects.create(
        user=user,
        first_name=first_name,
        last_name=last_name,
        phone=phone
    )
    
    return user, profile
```

### Accessing User Information

```python
# Get user (authentication info)
user = User.objects.get(email='user@example.com')

# Get profile (personal info)
profile = user.profile  # OneToOne relationship

# Display full name
print(profile.full_name)  # "John Doe"

# Or use property on user
print(user.full_name)  # Calls user.profile.full_name
```

### Serializers (Django REST Framework)

```python
class UserSerializer(serializers.ModelSerializer):
    """Serializer for authentication data"""
    class Meta:
        model = User
        fields = ['user_id', 'email', 'account_status', 'is_active', 
                  'email_verified', 'mfa_enabled']

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for personal information"""
    class Meta:
        model = Profile
        fields = ['profile_id', 'first_name', 'last_name', 'phone', 
                  'bio', 'date_of_birth', 'gender', 'address', 'city', 
                  'district', 'country', 'profile_picture', 
                  'notification_preferences', 'language']

class UserWithProfileSerializer(serializers.ModelSerializer):
    """Combined serializer"""
    profile = ProfileSerializer()
    
    class Meta:
        model = User
        fields = ['user_id', 'email', 'account_status', 'profile']
```

---

## Best Practices

### 1. Always Create Profile with User

```python
# Use Django signals to auto-create profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create profile when user is created"""
    if created:
        Profile.objects.create(user=instance)
```

### 2. Prefetch Profile When Needed

```python
# BAD - N+1 queries
users = User.objects.all()
for user in users:
    print(user.profile.full_name)  # Additional query each time!

# GOOD - Single query with join
users = User.objects.select_related('profile').all()
for user in users:
    print(user.profile.full_name)  # No additional queries
```

### 3. Separate Serializers for Different Use Cases

```python
# For authentication
class LoginSerializer:
    email, password

# For profile display
class PublicProfileSerializer:
    first_name, last_name, bio, profile_picture

# For profile editing
class ProfileUpdateSerializer:
    first_name, last_name, phone, bio, address, city, etc.
```

### 4. Cache Authentication Data Longer

```python
# Cache user auth for 24 hours (rarely changes)
cache.set(f'user_auth:{user_id}', user_auth_data, 86400)

# Cache profile for 1 hour (changes more often)
cache.set(f'user_profile:{user_id}', profile_data, 3600)
```

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting to Create Profile

```python
# BAD - Profile not created
user = User.objects.create_user(email='user@example.com', password='pass')
# user.profile will raise DoesNotExist error!

# GOOD - Always create profile
user = User.objects.create_user(email='user@example.com', password='pass')
Profile.objects.create(user=user, first_name='John', last_name='Doe')
```

**Solution**: Use signals (see Best Practices #1)

---

### ❌ Pitfall 2: N+1 Query Problem

```python
# BAD
users = User.objects.all()
for user in users:
    print(user.profile.first_name)  # N+1 queries!

# GOOD
users = User.objects.select_related('profile').all()
for user in users:
    print(user.profile.first_name)  # Single query
```

---

### ❌ Pitfall 3: Circular Import

```python
# BAD - models.py
from users.models import Profile

class User(AbstractUser):
    def get_full_name(self):
        return self.profile.full_name  # May cause circular import

# GOOD - Use related name
class User(AbstractUser):
    @property
    def full_name(self):
        try:
            return self.profile.full_name
        except Profile.DoesNotExist:
            return self.email
```

---

### ❌ Pitfall 4: Not Handling Profile DoesNotExist

```python
# BAD
name = user.profile.full_name  # May crash!

# GOOD
try:
    name = user.profile.full_name
except Profile.DoesNotExist:
    name = user.email
    # Or create profile automatically
    Profile.objects.create(user=user, first_name='', last_name='')
```

---

## Industry Examples

### Django (Built-in)
- `User` model (authentication)
- Custom `Profile` model (extend with OneToOne)

### GitHub
- User account (credentials)
- Profile (public information)

### LinkedIn
- Account (login, security)
- Profile (career, skills, education)

### Stripe
- Customer (identity, authentication)
- Customer Details (billing, shipping address)

---

## Summary

### ✅ DO:
- Keep authentication in `users` table
- Keep personal info in `profiles` table
- Auto-create profile with signals
- Use `select_related('profile')` for queries
- Cache auth data longer than profile data

### ❌ DON'T:
- Mix authentication and personal data
- Forget to create profiles
- Cause N+1 queries
- Skip error handling for missing profiles

---

**Pattern Status**: ✅ Fully Implemented  
**Documentation Status**: ✅ Complete  
**Ready for**: Development & Production



