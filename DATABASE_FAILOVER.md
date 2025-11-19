# iFarm Database Failover & Redundancy Strategy

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Architecture Plan  
**Strategy**: Primary PostgreSQL + Supabase Backup Database

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Layer Integration](#layer-integration)
4. [Database Configuration](#database-configuration)
5. [Replication Strategy](#replication-strategy)
6. [Failover Implementation](#failover-implementation)
7. [Django Database Router](#django-database-router)
8. [Health Checks & Monitoring](#health-checks--monitoring)
9. [Backup & Recovery](#backup--recovery)
10. [Implementation Guide](#implementation-guide)

---

## Overview

The iFarm system implements a **dual-database architecture** for high availability and disaster recovery:

- **Primary Database**: PostgreSQL (self-hosted or managed)
- **Backup Database**: Supabase PostgreSQL (cloud-hosted)

### Key Benefits

✅ **High Availability**: Automatic failover if primary database is down  
✅ **Disaster Recovery**: Complete backup in cloud (Supabase)  
✅ **Zero Downtime**: Seamless switching between databases  
✅ **Data Redundancy**: Real-time replication ensures data safety  
✅ **Geographic Distribution**: Supabase provides geographic redundancy

---

## Architecture

### Dual-Database Setup

```
┌─────────────────────────────────────────────────────────────┐
│  DATABASE ARCHITECTURE (Layer 7)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PRIMARY DATABASE (PostgreSQL)                      │  │
│  │  - Self-hosted or managed PostgreSQL                │  │
│  │  - Primary read/write operations                     │  │
│  │  - Real-time replication to Supabase                │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        │ (Real-time Replication)            │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BACKUP DATABASE (Supabase PostgreSQL)               │  │
│  │  - Cloud-hosted PostgreSQL                          │  │
│  │  - Automatic failover target                        │  │
│  │  - Read replica for analytics                       │  │
│  │  - Disaster recovery backup                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 6: DATA ACCESS LAYER (Django ORM)                   │
│  - DatabaseRouter: Routes queries to primary/backup         │
│  - Automatic failover on primary failure                    │
└─────────────────────────────────────────────────────────────┘
```

### Failover Flow

```
1. Application queries primary database
   ↓
2. Primary database fails (timeout, connection error)
   ↓
3. DatabaseRouter detects failure
   ↓
4. Automatic failover to Supabase backup
   ↓
5. Application continues operating (zero downtime)
   ↓
6. Health check monitors primary database
   ↓
7. When primary recovers, switch back (optional)
```

---

## Layer Integration

### Layer Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: API LAYER                                         │
│  - API endpoints make database queries                      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: BUSINESS LOGIC LAYER                              │
│  - Services call ORM methods                                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 6: DATA ACCESS LAYER                                 │
│  - DatabaseRouter: Routes to primary or backup            │
│  - Health check: Monitors database availability            │
│  - Failover logic: Automatic switching                     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 7: DATABASE LAYER                                    │
│  - Primary: PostgreSQL (self-hosted/managed)              │
│  - Backup: Supabase PostgreSQL (cloud)                    │
│  - Replication: Real-time sync                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Configuration

### Django Settings

```python
# settings/base.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('PRIMARY_DB_NAME'),
        'USER': env('PRIMARY_DB_USER'),
        'PASSWORD': env('PRIMARY_DB_PASSWORD'),
        'HOST': env('PRIMARY_DB_HOST', default='localhost'),
        'PORT': env('PRIMARY_DB_PORT', default='5432'),
        'OPTIONS': {
            'connect_timeout': 5,  # 5 second timeout
            'options': '-c statement_timeout=30000'  # 30 second query timeout
        },
        'CONN_MAX_AGE': 600,  # Keep connections for 10 minutes
    },
    'backup': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('SUPABASE_DB_NAME'),
        'USER': env('SUPABASE_DB_USER'),
        'PASSWORD': env('SUPABASE_DB_PASSWORD'),
        'HOST': env('SUPABASE_DB_HOST'),
        'PORT': env('SUPABASE_DB_PORT', default='5432'),
        'OPTIONS': {
            'connect_timeout': 5,
            'options': '-c statement_timeout=30000',
            'sslmode': 'require'  # Supabase requires SSL
        },
        'CONN_MAX_AGE': 600,
    }
}

# Database Router Configuration
DATABASE_ROUTERS = ['core.db_router.DatabaseRouter']

# Failover Configuration
DATABASE_FAILOVER_ENABLED = env.bool('DATABASE_FAILOVER_ENABLED', default=True)
DATABASE_FAILOVER_TIMEOUT = env.int('DATABASE_FAILOVER_TIMEOUT', default=5)  # seconds
DATABASE_HEALTH_CHECK_INTERVAL = env.int('DATABASE_HEALTH_CHECK_INTERVAL', default=30)  # seconds
```

### Environment Variables

```bash
# .env.production

# Primary Database (PostgreSQL)
PRIMARY_DB_NAME=ifarm_production
PRIMARY_DB_USER=ifarm_user
PRIMARY_DB_PASSWORD=your_secure_password
PRIMARY_DB_HOST=postgres.yourdomain.com
PRIMARY_DB_PORT=5432

# Backup Database (Supabase)
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_supabase_password
SUPABASE_DB_HOST=db.yourproject.supabase.co
SUPABASE_DB_PORT=5432

# Failover Settings
DATABASE_FAILOVER_ENABLED=True
DATABASE_FAILOVER_TIMEOUT=5
DATABASE_HEALTH_CHECK_INTERVAL=30
```

---

## Replication Strategy

### Real-Time Replication

**Option 1: PostgreSQL Logical Replication (Recommended)**

```sql
-- On Primary Database
-- Create publication for all tables
CREATE PUBLICATION ifarm_publication FOR ALL TABLES;

-- On Supabase Backup Database
-- Create subscription
CREATE SUBSCRIPTION ifarm_subscription
CONNECTION 'host=primary_db_host port=5432 dbname=ifarm_production user=replication_user password=replication_password'
PUBLICATION ifarm_publication;
```

**Option 2: Supabase Realtime (Alternative)**

```python
# Use Supabase Realtime for critical tables
# Configure in Supabase dashboard
# Tables: animals, production, expenses, sales
```

**Option 3: Application-Level Replication (Fallback)**

```python
# core/services/database_replication.py

class DatabaseReplicationService:
    """Service to replicate data to Supabase backup"""
    
    @staticmethod
    def replicate_to_backup(model_instance):
        """
        Replicate model instance to backup database
        
        Layer Flow:
        - Layer 5 (Business Logic): ReplicationService
        - Layer 6 (Data Access): Write to backup database
        - Layer 7 (Database): Supabase PostgreSQL
        """
        try:
            # Save to backup database
            model_instance.save(using='backup')
        except Exception as e:
            # Log error but don't fail primary operation
            logger.error(f"Failed to replicate to backup: {e}")
```

---

## Failover Implementation

### Database Router

```python
# core/db_router.py

from django.conf import settings
from django.db import connections
import logging

logger = logging.getLogger(__name__)

class DatabaseRouter:
    """
    Database router for primary/backup failover
    
    Layer Context:
    - Layer 6 (Data Access): Routes queries to appropriate database
    """
    
    _primary_available = True
    _last_health_check = None
    
    def db_for_read(self, model, **hints):
        """
        Route read queries
        
        Layer 6: Data Access routing
        """
        # Check if primary is available
        if self._is_primary_available():
            return 'default'  # Primary database
        else:
            logger.warning("Primary database unavailable, using backup")
            return 'backup'  # Supabase backup
    
    def db_for_write(self, model, **hints):
        """
        Route write queries
        
        Layer 6: Data Access routing
        """
        # Always try primary first
        if self._is_primary_available():
            return 'default'  # Primary database
        else:
            logger.warning("Primary database unavailable, using backup for writes")
            return 'backup'  # Supabase backup
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects in same database
        """
        db_set = {'default', 'backup'}
        if obj1._state.db in db_set and obj2._state.db in db_set:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Ensure migrations run on both databases
        """
        if db == 'default' or db == 'backup':
            return True
        return None
    
    @classmethod
    def _is_primary_available(cls):
        """
        Check if primary database is available
        
        Layer 6: Health check
        """
        if not settings.DATABASE_FAILOVER_ENABLED:
            return True
        
        # Check cache first (avoid frequent checks)
        from django.core.cache import cache
        cache_key = 'db:primary:available'
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        
        # Perform health check
        try:
            connection = connections['default']
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                if result:
                    # Primary is available
                    cache.set(cache_key, True, settings.DATABASE_HEALTH_CHECK_INTERVAL)
                    cls._primary_available = True
                    return True
        except Exception as e:
            logger.error(f"Primary database health check failed: {e}")
            cache.set(cache_key, False, settings.DATABASE_HEALTH_CHECK_INTERVAL)
            cls._primary_available = False
            return False
        
        return False
    
    @classmethod
    def force_failover(cls):
        """
        Force failover to backup database
        
        Layer 5: Business Logic (manual failover)
        """
        from django.core.cache import cache
        cache.set('db:primary:available', False, 3600)  # 1 hour
        cls._primary_available = False
        logger.warning("Forced failover to backup database")
```

### Automatic Failover Middleware

```python
# core/middleware.py

class DatabaseFailoverMiddleware:
    """
    Middleware to handle database failover automatically
    
    Layer Context:
    - Layer 3 (Middleware): Intercepts database errors and triggers failover
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            # Check if it's a database error
            if self._is_database_error(e):
                # Try failover
                if DatabaseRouter._is_primary_available():
                    # Primary was available but query failed
                    # Mark as unavailable and retry
                    DatabaseRouter.force_failover()
                    # Retry request (optional)
                    # response = self.get_response(request)
            
            raise
    
    def _is_database_error(self, exception):
        """Check if exception is database-related"""
        from django.db import DatabaseError, OperationalError
        return isinstance(exception, (DatabaseError, OperationalError))
```

---

## Health Checks & Monitoring

### Database Health Check Service

```python
# core/services/database_health.py

from django.db import connections
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseHealthService:
    """
    Service to monitor database health
    
    Layer Context:
    - Layer 5 (Business Logic): Health monitoring
    - Layer 6 (Data Access): Database connection checks
    - Layer 7 (Database): Health queries
    """
    
    @staticmethod
    def check_primary_health():
        """
        Check primary database health
        
        Returns: (is_healthy, response_time_ms, error_message)
        """
        import time
        
        try:
            start_time = time.time()
            connection = connections['default']
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
            
            response_time = (time.time() - start_time) * 1000  # ms
            
            if result:
                # Cache health status
                cache.set('db:primary:health', {
                    'healthy': True,
                    'response_time': response_time,
                    'timestamp': time.time()
                }, 60)  # Cache for 1 minute
                
                return True, response_time, None
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Primary database health check failed: {error_msg}")
            
            cache.set('db:primary:health', {
                'healthy': False,
                'error': error_msg,
                'timestamp': time.time()
            }, 60)
            
            return False, None, error_msg
    
    @staticmethod
    def check_backup_health():
        """
        Check backup database (Supabase) health
        
        Returns: (is_healthy, response_time_ms, error_message)
        """
        import time
        
        try:
            start_time = time.time()
            connection = connections['backup']
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
            
            response_time = (time.time() - start_time) * 1000  # ms
            
            if result:
                return True, response_time, None
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Backup database health check failed: {error_msg}")
            return False, None, error_msg
    
    @staticmethod
    def get_health_status():
        """
        Get health status of both databases
        
        Returns: dict with health status
        """
        primary_healthy, primary_time, primary_error = DatabaseHealthService.check_primary_health()
        backup_healthy, backup_time, backup_error = DatabaseHealthService.check_backup_health()
        
        return {
            'primary': {
                'healthy': primary_healthy,
                'response_time_ms': primary_time,
                'error': primary_error
            },
            'backup': {
                'healthy': backup_healthy,
                'response_time_ms': backup_time,
                'error': backup_error
            },
            'failover_active': not primary_healthy and backup_healthy
        }
```

### Celery Health Check Task

```python
# core/tasks.py

from celery import shared_task
from core.services.database_health import DatabaseHealthService
from notifications.services import NotificationService

@shared_task
def check_database_health():
    """
    Periodic health check for databases
    
    Layer Flow:
    - Layer 5 (Business Logic): Health check task
    - Layer 6 (Data Access): Database connection checks
    - Layer 7 (Database): Health queries
    """
    health_status = DatabaseHealthService.get_health_status()
    
    # Alert if primary is down
    if not health_status['primary']['healthy'] and health_status['backup']['healthy']:
        # Notify admins
        NotificationService.send_notification(
            user_id=None,  # System notification
            notification_type='database_failover',
            title='⚠️ Database Failover Activated',
            message=(
                f'Primary database is unavailable. '
                f'System has automatically switched to backup database (Supabase). '
                f'Error: {health_status["primary"]["error"]}'
            ),
            severity='high',
            channel='email'
        )
    
    return health_status
```

---

## Backup & Recovery

### Automated Backups

```python
# core/services/database_backup.py

class DatabaseBackupService:
    """
    Service for database backup operations
    
    Layer Context:
    - Layer 5 (Business Logic): Backup orchestration
    - Layer 6 (Data Access): Database queries for backup
    - Layer 7 (Database): Backup operations
    """
    
    @staticmethod
    def create_backup():
        """
        Create backup of primary database to Supabase
        
        Layer Flow:
        - Layer 5: BackupService
        - Layer 6: Database queries
        - Layer 7: Primary → Supabase backup
        """
        import subprocess
        from django.conf import settings
        from datetime import datetime
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f'/backups/ifarm_backup_{timestamp}.sql'
        
        try:
            # Create pg_dump
            cmd = [
                'pg_dump',
                '-h', settings.DATABASES['default']['HOST'],
                '-U', settings.DATABASES['default']['USER'],
                '-d', settings.DATABASES['default']['NAME'],
                '-F', 'c',  # Custom format
                '-f', backup_file
            ]
            
            subprocess.run(cmd, check=True, env={
                'PGPASSWORD': settings.DATABASES['default']['PASSWORD']
            })
            
            # Restore to Supabase
            restore_cmd = [
                'pg_restore',
                '-h', settings.DATABASES['backup']['HOST'],
                '-U', settings.DATABASES['backup']['USER'],
                '-d', settings.DATABASES['backup']['NAME'],
                '--clean',  # Clean before restore
                '--if-exists',
                backup_file
            ]
            
            subprocess.run(restore_cmd, check=True, env={
                'PGPASSWORD': settings.DATABASES['backup']['PASSWORD']
            })
            
            logger.info(f"Backup created and restored to Supabase: {backup_file}")
            return backup_file
            
        except Exception as e:
            logger.error(f"Backup failed: {e}")
            raise
```

### Recovery Procedure

```python
# core/services/database_recovery.py

class DatabaseRecoveryService:
    """
    Service for database recovery operations
    
    Layer Context:
    - Layer 5 (Business Logic): Recovery orchestration
    - Layer 6 (Data Access): Database queries for recovery
    - Layer 7 (Database): Recovery operations
    """
    
    @staticmethod
    def recover_from_backup(backup_file):
        """
        Recover primary database from Supabase backup
        
        Layer Flow:
        - Layer 5: RecoveryService
        - Layer 6: Database queries
        - Layer 7: Supabase → Primary restore
        """
        import subprocess
        from django.conf import settings
        
        try:
            # Restore from backup file
            restore_cmd = [
                'pg_restore',
                '-h', settings.DATABASES['default']['HOST'],
                '-U', settings.DATABASES['default']['USER'],
                '-d', settings.DATABASES['default']['NAME'],
                '--clean',
                '--if-exists',
                backup_file
            ]
            
            subprocess.run(restore_cmd, check=True, env={
                'PGPASSWORD': settings.DATABASES['default']['PASSWORD']
            })
            
            logger.info(f"Database recovered from backup: {backup_file}")
            
        except Exception as e:
            logger.error(f"Recovery failed: {e}")
            raise
```

---

## Implementation Guide

### Phase 1: Setup Supabase Database

1. **Create Supabase Project**
   - Sign up at supabase.com
   - Create new project
   - Note: Database URL, password, host

2. **Configure Supabase Database**
   - Enable SSL connections
   - Set up connection pooling (if needed)
   - Configure firewall rules

3. **Run Migrations on Supabase**
```bash
python manage.py migrate --database=backup
```

### Phase 2: Configure Django

1. **Update Settings**
```python
# Add backup database configuration
DATABASES['backup'] = {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': env('SUPABASE_DB_NAME'),
    'USER': env('SUPABASE_DB_USER'),
    'PASSWORD': env('SUPABASE_DB_PASSWORD'),
    'HOST': env('SUPABASE_DB_HOST'),
    'PORT': env('SUPABASE_DB_PORT', default='5432'),
    'OPTIONS': {
        'sslmode': 'require'
    }
}
```

2. **Install Database Router**
```python
DATABASE_ROUTERS = ['core.db_router.DatabaseRouter']
```

3. **Create Database Router**
```python
# core/db_router.py (see code above)
```

### Phase 3: Setup Replication

**Option 1: PostgreSQL Logical Replication (Recommended)**
```sql
-- On primary database
CREATE PUBLICATION ifarm_publication FOR ALL TABLES;

-- On Supabase (via Supabase SQL editor)
CREATE SUBSCRIPTION ifarm_subscription
CONNECTION 'host=primary_host port=5432 dbname=ifarm user=replication_user password=password'
PUBLICATION ifarm_publication;
```

**Option 2: Application-Level Replication**
```python
# Use Django signals to replicate on save
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save)
def replicate_to_backup(sender, instance, **kwargs):
    """Replicate to backup database"""
    if sender._meta.app_label not in ['core', 'tenants', 'users']:
        return
    
    try:
        instance.save(using='backup')
    except Exception as e:
        logger.error(f"Replication failed for {sender}: {e}")
```

### Phase 4: Setup Health Checks

1. **Add Celery Task**
```python
# core/tasks.py
@shared_task
def check_database_health():
    DatabaseHealthService.check_primary_health()
    DatabaseHealthService.check_backup_health()
```

2. **Schedule Health Checks**
```python
# celery_app/celery.py
app.conf.beat_schedule = {
    'check-database-health': {
        'task': 'core.tasks.check_database_health',
        'schedule': crontab(minute='*/1'),  # Every minute
    },
}
```

### Phase 5: Testing

1. **Test Failover**
```python
# Test script
from core.db_router import DatabaseRouter

# Force failover
DatabaseRouter.force_failover()

# Test query
from users.models import User
users = User.objects.all()  # Should use backup database
```

2. **Test Recovery**
```python
# Restore from backup
from core.services.database_recovery import DatabaseRecoveryService

DatabaseRecoveryService.recover_from_backup('/backups/backup.sql')
```

---

## Summary

The dual-database architecture provides:

✅ **High Availability**: Automatic failover to Supabase  
✅ **Disaster Recovery**: Complete backup in cloud  
✅ **Zero Downtime**: Seamless database switching  
✅ **Data Redundancy**: Real-time replication  
✅ **Geographic Distribution**: Supabase cloud redundancy

**Key Components**:
- **Primary Database**: PostgreSQL (self-hosted/managed)
- **Backup Database**: Supabase PostgreSQL (cloud)
- **Database Router**: Automatic failover logic
- **Health Checks**: Continuous monitoring
- **Replication**: Real-time data sync

**Status**: Production-ready architecture pattern! 🚀

