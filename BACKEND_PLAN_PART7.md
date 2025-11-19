# iFarm Backend Plan - Part 7: Integration Services & Deployment

## Layer Architecture Context

This document details **Supporting Layers** and **Deployment Architecture**:

- **Supporting Layers**: Redis (caching, sessions), Kafka (event streaming), Celery (async tasks), Supabase Storage (media files)
- **Layer 4 (API)**: Dashboard endpoint optimization, API response compression
- **Layer 5 (Business Logic)**: Cache warming services, async task orchestration
- **Layer 6 (Data Access)**: Query optimization, materialized views, caching strategies
- **Layer 7 (Database)**: PostgreSQL optimization, indexing strategies, read replicas

This document covers integration services that span multiple layers and deployment strategies for production environments.

---

## Integration Services

### 1. Celery Configuration

**Purpose**: Asynchronous task processing for background jobs.

#### Setup

**celery_app/celery.py**
```python
from celery import Celery
from django.conf import settings
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ifarm.settings.production')

app = Celery('ifarm')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat schedule
app.conf.beat_schedule = {
    'process-recurring-billing': {
        'task': 'subscriptions.tasks.process_recurring_billing',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },
    'check-trial-expirations': {
        'task': 'subscriptions.tasks.check_trial_expirations',
        'schedule': crontab(hour=6, minute=0),  # Daily at 6 AM
    },
    'aggregate-usage-metrics': {
        'task': 'subscriptions.tasks.aggregate_usage_metrics',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
    },
    'archive-old-audit-logs': {
        'task': 'audit.tasks.archive_old_logs',
        'schedule': crontab(hour=2, minute=0, day_of_week=1),  # Weekly Monday 2 AM
    },
    'clean-expired-sessions': {
        'task': 'users.tasks.clean_expired_sessions',
        'schedule': crontab(hour=3, minute=0),  # Daily at 3 AM
    },
    'send-pending-notifications': {
        'task': 'notifications.tasks.send_pending_notifications',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'update-production-summaries': {
        'task': 'production.tasks.update_daily_summaries',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
    },
}
```

#### Common Tasks

**subscriptions/tasks.py**
```python
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

@shared_task
def process_recurring_billing():
    """Process recurring subscription billing"""
    from subscriptions.models import Subscription
    from subscriptions.services import BillingService
    
    # Get subscriptions due for billing
    due_subscriptions = Subscription.objects.filter(
        status='active',
        next_billing_date__lte=timezone.now()
    )
    
    for subscription in due_subscriptions:
        try:
            BillingService.process_subscription_billing(subscription.subscription_id)
        except Exception as e:
            # Log error and continue
            logger.error(f"Failed to process billing for subscription {subscription.subscription_id}: {e}")

@shared_task
def check_trial_expirations():
    """Check and handle trial expirations"""
    from subscriptions.models import Subscription
    from notifications.services import NotificationService
    
    # Get trials expiring soon
    expiring_soon = Subscription.objects.filter(
        status='trial',
        trial_end_date__lte=timezone.now() + timedelta(days=3),
        trial_end_date__gt=timezone.now()
    )
    
    for subscription in expiring_soon:
        # Notify tenant owner
        NotificationService.send_notification(
            user=subscription.tenant.owner_user,
            notification_type='trial_expiring',
            title='Trial Expiring Soon',
            message=f'Your trial expires in {(subscription.trial_end_date - timezone.now()).days} days',
            channel='email'
        )

@shared_task
def send_email_async(to_email, subject, html_content, text_content=None):
    """Send email asynchronously"""
    from django.core.mail import EmailMultiAlternatives
    
    msg = EmailMultiAlternatives(subject, text_content or '', settings.DEFAULT_FROM_EMAIL, [to_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()
```

**audit/tasks.py**
```python
from celery import shared_task

@shared_task
def archive_old_logs():
    """Archive old audit logs"""
    from audit.services import AuditService
    AuditService.archive_old_logs(days=365)

@shared_task
def log_audit_async(log_data):
    """Log audit entry asynchronously"""
    from audit.services import AuditService
    AuditService.log(**log_data)
```

**notifications/tasks.py**
```python
from celery import shared_task

@shared_task
def send_pending_notifications():
    """Send pending notifications"""
    from notifications.models import Notification
    from notifications.services import NotificationService
    
    pending = Notification.objects.filter(
        status='pending',
        retry_count__lt=3
    )[:100]  # Process in batches
    
    for notification in pending:
        try:
            NotificationService.send(notification)
        except Exception as e:
            notification.retry_count += 1
            notification.error_message = str(e)
            notification.save()

@shared_task
def send_notification_async(user_id, notification_type, title, message, channel='in_app', link=''):
    """Send notification asynchronously"""
    from notifications.services import NotificationService
    from users.models import User
    
    user = User.objects.get(pk=user_id)
    NotificationService.send_notification(user, notification_type, title, message, channel, link)
```

---

### 2. Kafka Integration

**Purpose**: Event-driven messaging for inter-service communication and cache invalidation.

#### Configuration

**ifarm/settings/base.py**
```python
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_GROUP_ID = 'ifarm-backend'

# Kafka topics
KAFKA_TOPICS = {
    'tenant': 'tenant.events',
    'user': 'user.events',
    'animal': 'animal.events',
    'production': 'production.events',
    'expense': 'expense.events',
    'payment': 'payment.events',
    'audit': 'audit.events',
}
```

#### Producer

**core/kafka_producer.py**
```python
from kafka import KafkaProducer
import json
from django.conf import settings

class KafkaMessageProducer:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    
    def send(self, topic, message):
        """Send message to Kafka topic"""
        try:
            self.producer.send(topic, value=message)
            self.producer.flush()
        except Exception as e:
            logger.error(f"Failed to send Kafka message: {e}")
    
    def close(self):
        self.producer.close()

# Global producer instance
kafka_producer = KafkaMessageProducer()
```

#### Consumer

**core/kafka_consumer.py**
```python
from kafka import KafkaConsumer
import json
from django.conf import settings
from django.core.cache import cache

class KafkaMessageConsumer:
    def __init__(self, topics):
        self.consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=settings.KAFKA_GROUP_ID,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
    
    def consume(self):
        """Consume messages"""
        for message in self.consumer:
            try:
                self.handle_message(message.topic, message.value)
            except Exception as e:
                logger.error(f"Failed to handle Kafka message: {e}")
    
    def handle_message(self, topic, data):
        """Handle incoming message"""
        if topic == 'animal.events':
            self.handle_animal_event(data)
        elif topic == 'production.events':
            self.handle_production_event(data)
        elif topic == 'payment.events':
            self.handle_payment_event(data)
        # Add more handlers
    
    def handle_animal_event(self, data):
        """Handle animal-related events"""
        event_type = data.get('event_type')
        
        if event_type == 'animal_created':
            # Invalidate caches
            animal_id = data.get('animal_id')
            tenant_id = data.get('tenant_id')
            farm_id = data.get('farm_id')
            
            cache.delete(f'animal:{animal_id}')
            cache.delete(f'animals:tenant:{tenant_id}')
            cache.delete(f'animals:farm:{farm_id}')
        
        elif event_type == 'animal_updated':
            animal_id = data.get('animal_id')
            cache.delete(f'animal:{animal_id}')
    
    def handle_production_event(self, data):
        """Handle production-related events"""
        # Invalidate production caches
        pass
    
    def handle_payment_event(self, data):
        """Handle payment-related events"""
        event_type = data.get('event_type')
        
        if event_type == 'payment_succeeded':
            # Update subscription status
            from subscriptions.services import SubscriptionService
            tenant_id = data.get('tenant_id')
            SubscriptionService.handle_successful_payment(tenant_id)
```

#### Signal Integration

**animals/signals.py**
```python
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Animal
from core.kafka_producer import kafka_producer

@receiver(post_save, sender=Animal)
def animal_post_save(sender, instance, created, **kwargs):
    """Publish animal events to Kafka"""
    event_type = 'animal_created' if created else 'animal_updated'
    
    kafka_producer.send('animal.events', {
        'event_type': event_type,
        'animal_id': instance.animal_id,
        'tenant_id': instance.tenant_id,
        'farm_id': instance.farm_id,
        'tag_number': instance.tag_number,
        'timestamp': timezone.now().isoformat()
    })

@receiver(post_delete, sender=Animal)
def animal_post_delete(sender, instance, **kwargs):
    """Publish animal deletion event"""
    kafka_producer.send('animal.events', {
        'event_type': 'animal_deleted',
        'animal_id': instance.animal_id,
        'tenant_id': instance.tenant_id,
        'farm_id': instance.farm_id,
        'timestamp': timezone.now().isoformat()
    })
```

---

### 3. Redis Integration

**Purpose**: Caching, session storage, and rate limiting.

#### Configuration

**ifarm/settings/base.py**
```python
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'PICKLE_VERSION': -1,
        },
        'KEY_PREFIX': 'ifarm',
        'TIMEOUT': 3600,  # 1 hour default
    }
}

# Session storage
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

#### Caching Patterns

**Permissions Caching**
```python
from django.core.cache import cache

class PermissionService:
    @staticmethod
    def get_user_permissions_cached(user_id, tenant_id):
        """Get user permissions with caching"""
        cache_key = f'permissions:user:{user_id}:tenant:{tenant_id}'
        cached = cache.get(cache_key)
        
        if cached:
            return cached
        
        # Calculate permissions
        permissions = PermissionService.get_user_permissions(user_id, tenant_id)
        
        # Cache for 1 hour
        cache.set(cache_key, permissions, 3600)
        
        return permissions
    
    @staticmethod
    def invalidate_user_permissions_cache(user_id, tenant_id):
        """Invalidate user permissions cache"""
        cache_key = f'permissions:user:{user_id}:tenant:{tenant_id}'
        cache.delete(cache_key)
```

**Query Result Caching**
```python
from django.core.cache import cache

def get_tenant_animals_cached(tenant_id):
    """Get tenant animals with caching"""
    cache_key = f'animals:tenant:{tenant_id}'
    cached = cache.get(cache_key)
    
    if cached:
        return cached
    
    animals = list(Animal.objects.filter(tenant_id=tenant_id).values())
    
    # Cache for 5 minutes
    cache.set(cache_key, animals, 300)
    
    return animals
```

---

### 4. Supabase Storage Integration

**Purpose**: Object storage for media files with separate buckets.

#### Configuration

**ifarm/settings/base.py**
```python
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_STORAGE_URL = f"{SUPABASE_URL}/storage/v1"

# Bucket configuration
SUPABASE_BUCKETS = {
    'profiles': 'profile-pictures',
    'animals': 'animal-photos',
    'farms': 'farm-photos',
    'documents': 'documents',
}
```

#### Storage Service

**media/services.py**
```python
from supabase import create_client
from django.conf import settings
import uuid

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class SupabaseStorageService:
    @staticmethod
    def upload_file(file, bucket_type, tenant_id, file_name=None):
        """Upload file to Supabase Storage"""
        bucket = settings.SUPABASE_BUCKETS[bucket_type]
        
        # Generate unique file name
        if not file_name:
            file_name = f"{uuid.uuid4()}.{file.name.split('.')[-1]}"
        
        # Add tenant prefix for organization
        path = f"{tenant_id}/{file_name}"
        
        # Upload
        response = supabase.storage.from_(bucket).upload(
            path=path,
            file=file.read(),
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket).get_public_url(path)
        
        return {
            'path': path,
            'url': public_url,
            'bucket': bucket
        }
    
    @staticmethod
    def delete_file(bucket, path):
        """Delete file from Supabase Storage"""
        supabase.storage.from_(bucket).remove([path])
    
    @staticmethod
    def get_signed_url(bucket, path, expires_in=3600):
        """Get signed URL for private file"""
        response = supabase.storage.from_(bucket).create_signed_url(
            path=path,
            expires_in=expires_in
        )
        return response['signedURL']
```

---

## Database Design Patterns

### Indexing Strategy

**Key Indexes:**
1. **Tenant Isolation**: All tenant-scoped tables indexed on `tenant_id`
2. **Farm Filtering**: Farm-scoped tables indexed on `(tenant_id, farm_id)`
3. **Date Range Queries**: Date fields indexed for reporting
4. **Foreign Keys**: All foreign keys indexed
5. **Composite Indexes**: Multi-column indexes for common queries

**Example:**
```sql
-- Animals table
CREATE INDEX idx_animals_tenant_farm ON animals(tenant_id, farm_id, status);
CREATE INDEX idx_animals_tag ON animals(tag_number);
CREATE INDEX idx_animals_type_status ON animals(animal_type, status);

-- Production table
CREATE INDEX idx_production_tenant_farm_date ON production(tenant_id, farm_id, production_date);
CREATE INDEX idx_production_animal_date ON production(animal_id, production_date);
CREATE INDEX idx_production_date ON production(production_date);  -- For aggregations
```

### Query Optimization

**Use select_related() and prefetch_related()**
```python
# Bad - N+1 query problem
animals = Animal.objects.filter(tenant_id=tenant_id)
for animal in animals:
    print(animal.farm.farm_name)  # Additional query per animal

# Good - Single query with join
animals = Animal.objects.filter(tenant_id=tenant_id).select_related('farm')
for animal in animals:
    print(animal.farm.farm_name)  # No additional queries
```

**Use aggregation at database level**
```python
# Good - Aggregation in database
summary = Production.objects.filter(
    tenant_id=tenant_id,
    production_date__gte=start_date
).aggregate(
    total=Sum('quantity'),
    avg=Avg('quantity'),
    count=Count('production_id')
)
```

---

## API Design Patterns

### RESTful API Structure

**api/v1/urls.py**
```python
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'animals', AnimalViewSet)
router.register(r'farms', FarmViewSet)
router.register(r'production', ProductionViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'users', UserViewSet)

urlpatterns = router.urls
```

### ViewSet Example

**api/v1/views/animals.py**
```python
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

class AnimalViewSet(viewsets.ModelViewSet):
    """Animal API endpoints"""
    serializer_class = AnimalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter by tenant"""
        return Animal.objects.filter(tenant_id=self.request.user.tenant_id)
    
    @action(detail=True, methods=['get'])
    def production_history(self, request, pk=None):
        """Get production history for animal"""
        animal = self.get_object()
        production = Production.objects.filter(
            animal=animal
        ).order_by('-production_date')[:30]
        
        serializer = ProductionSerializer(production, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def health_records(self, request, pk=None):
        """Get health records for animal"""
        animal = self.get_object()
        health_checks = HealthCheck.objects.filter(animal=animal)
        vaccinations = Vaccination.objects.filter(animal=animal)
        
        return Response({
            'health_checks': HealthCheckSerializer(health_checks, many=True).data,
            'vaccinations': VaccinationSerializer(vaccinations, many=True).data
        })
```

---

## Dashboard Endpoint Optimization 🆕

**Industry-Standard Performance Optimization**: Optimize dashboard endpoints for speed and performance using multiple strategies.

### Overview

Dashboard endpoints are critical for user experience. They must be:
- **Fast**: < 200ms response time
- **Cached**: Aggressive Redis caching
- **Optimized**: Database query optimization
- **Scalable**: Handle high concurrent requests

### Optimization Strategies

#### 1. Redis Caching Layer

**Multi-Level Caching:**
```python
# api/views/dashboard.py

from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.views import APIView
from rest_framework.response import Response

class DashboardStatsView(APIView):
    """
    Optimized dashboard stats with Redis caching
    Cache TTL: 5 minutes (300 seconds)
    """
    
    def get(self, request, tenant_id):
        # Cache key includes user_id for personalized data
        cache_key = f'dashboard:stats:tenant:{tenant_id}:user:{request.user.user_id}'
        cached = cache.get(cache_key)
        
        if cached:
            return Response(cached)
        
        # Calculate stats (expensive operation)
        stats = self.calculate_stats(tenant_id, request.user)
        
        # Cache for 5 minutes
        cache.set(cache_key, stats, 300)
        
        return Response(stats)
    
    def calculate_stats(self, tenant_id, user):
        """Calculate dashboard statistics"""
        from animals.models import Animal
        from financial.models import AnimalSale, Expense
        from production.models import Production
        from django.db.models import Sum, Count, Avg, Q
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        this_month = today.replace(day=1)
        last_month = (this_month - timedelta(days=1)).replace(day=1)
        
        # Get accessible farms for user
        accessible_farms = user.get_accessible_farm_ids(tenant_id)
        
        return {
            'animals': {
                'total': Animal.objects.filter(
                    tenant_id=tenant_id,
                    farm_id__in=accessible_farms
                ).count(),
                'active': Animal.objects.filter(
                    tenant_id=tenant_id,
                    farm_id__in=accessible_farms,
                    status='active'
                ).count(),
                'total_value': Animal.objects.filter(
                    tenant_id=tenant_id,
                    farm_id__in=accessible_farms
                ).aggregate(total=Sum('estimated_value'))['total'] or 0,
            },
            'financial': {
                'revenue_this_month': AnimalSale.objects.filter(
                    tenant_id=tenant_id,
                    farm_id__in=accessible_farms,
                    sale_date__gte=this_month
                ).aggregate(total=Sum('sale_price'))['total'] or 0,
                'expenses_this_month': Expense.objects.filter(
                    tenant_id=tenant_id,
                    farm_id__in=accessible_farms,
                    expense_date__gte=this_month,
                    status='approved'
                ).aggregate(total=Sum('amount'))['total'] or 0,
            },
            'production': {
                'milk_today': Production.objects.filter(
                    tenant_id=tenant_id,
                    farm_id__in=accessible_farms,
                    production_date=today,
                    production_type='milk'
                ).aggregate(total=Sum('quantity'))['total'] or 0,
            }
        }
```

**Cache Invalidation:**
```python
# Invalidate cache on data changes
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Animal)
def invalidate_dashboard_cache(sender, instance, **kwargs):
    """Invalidate dashboard cache when animal data changes"""
    from django.core.cache import cache
    
    # Invalidate all dashboard caches for this tenant
    cache_key_pattern = f'dashboard:*:tenant:{instance.tenant_id}*'
    
    # Delete matching keys (requires django-redis)
    try:
        from django_redis import get_redis_connection
        redis_client = get_redis_connection("default")
        keys = redis_client.keys(cache_key_pattern)
        if keys:
            redis_client.delete(*keys)
    except:
        # Fallback: delete known cache keys
        cache.delete(f'dashboard:stats:tenant:{instance.tenant_id}:*')
```

#### 2. Database Query Optimization

**Optimized Queries with select_related and prefetch_related:**
```python
# api/views/dashboard.py

class DashboardAnimalsView(APIView):
    """Optimized animal list for dashboard"""
    
    def get(self, request, tenant_id):
        from animals.models import Animal
        from django.db.models import Prefetch
        
        # Single optimized query with joins
        animals = Animal.objects.filter(
            tenant_id=tenant_id,
            farm_id__in=request.user.get_accessible_farm_ids(tenant_id)
        ).select_related(
            'farm',           # Join farms table
            'breed',          # Join breeds table
            'current_health_status'  # Join health status
        ).prefetch_related(
            Prefetch('activities', queryset=Activity.objects.order_by('-activity_date')[:5]),
            Prefetch('productions', queryset=Production.objects.order_by('-production_date')[:5]),
        ).only(
            'animal_id', 'tag_number', 'name', 'status',
            'farm__farm_name', 'breed__breed_name',
            'current_health_status__health_status'
        )[:20]  # Limit to 20 for dashboard
        
        return Response({
            'animals': [self.serialize_animal(a) for a in animals]
        })
```

**Aggregated Queries:**
```python
# Use aggregation instead of Python loops
from django.db.models import Sum, Count, Avg, Max, Min, Q
from datetime import datetime, timedelta

def get_dashboard_analytics(tenant_id, farm_ids):
    """Get analytics with optimized aggregated queries"""
    from animals.models import Animal
    from financial.models import AnimalSale
    
    today = datetime.now().date()
    last_30_days = today - timedelta(days=30)
    
    # Single aggregated query
    analytics = Animal.objects.filter(
        tenant_id=tenant_id,
        farm_id__in=farm_ids
    ).aggregate(
        total_animals=Count('animal_id'),
        active_animals=Count('animal_id', filter=Q(status='active')),
        total_value=Sum('estimated_value'),
        avg_age=Avg('age_months'),
        oldest_animal=Max('age_months'),
        youngest_animal=Min('age_months'),
    )
    
    # Sales analytics
    sales_analytics = AnimalSale.objects.filter(
        tenant_id=tenant_id,
        farm_id__in=farm_ids,
        sale_date__gte=last_30_days
    ).aggregate(
        total_revenue=Sum('sale_price'),
        total_sales=Count('sale_id'),
        avg_sale_price=Avg('sale_price'),
    )
    
    return {**analytics, **sales_analytics}
```

#### 3. Materialized Views (PostgreSQL)

**Pre-computed Dashboard Data:**
```sql
-- Create materialized view for dashboard stats
CREATE MATERIALIZED VIEW dashboard_stats_cache AS
SELECT 
    a.tenant_id,
    a.farm_id,
    COUNT(*) as total_animals,
    COUNT(*) FILTER (WHERE a.status = 'active') as active_animals,
    SUM(a.estimated_value) as total_value,
    AVG(a.age_months) as avg_age,
    MAX(a.age_months) as oldest_animal,
    MIN(a.age_months) as youngest_animal,
    NOW() as last_updated
FROM animals a
GROUP BY a.tenant_id, a.farm_id;

-- Create index for fast lookups
CREATE UNIQUE INDEX idx_dashboard_stats_cache_tenant_farm 
ON dashboard_stats_cache(tenant_id, farm_id);

-- Refresh materialized view (run via Celery every 5 minutes)
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats_cache;
```

**Django Integration:**
```python
# api/views/dashboard.py

from django.db import connection

class DashboardStatsMaterializedView(APIView):
    """Use materialized view for ultra-fast dashboard stats"""
    
    def get(self, request, tenant_id):
        farm_ids = request.user.get_accessible_farm_ids(tenant_id)
        
        # Query materialized view (very fast)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    total_animals,
                    active_animals,
                    total_value,
                    avg_age,
                    oldest_animal,
                    youngest_animal,
                    last_updated
                FROM dashboard_stats_cache
                WHERE tenant_id = %s AND farm_id = ANY(%s)
            """, [tenant_id, farm_ids])
            
            rows = cursor.fetchall()
            
        return Response({
            'stats': rows,
            'cached_at': rows[0][6] if rows else None
        })
```

#### 4. Pagination and Lazy Loading

**Efficient Pagination:**
```python
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class DashboardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page_size': self.page_size,
            'total_pages': self.page.paginator.num_pages,
            'results': data
        })

class DashboardAnimalsView(APIView):
    pagination_class = DashboardPagination
    
    def get(self, request, tenant_id):
        queryset = Animal.objects.filter(
            tenant_id=tenant_id,
            farm_id__in=request.user.get_accessible_farm_ids(tenant_id)
        ).select_related('farm', 'breed')[:100]  # Limit to 100 for dashboard
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = AnimalSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = AnimalSerializer(queryset, many=True)
        return Response(serializer.data)
```

#### 5. Response Compression

**GZip Middleware:**
```python
# ifarm/settings/base.py

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.gzip.GZipMiddleware',  # Compress responses
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# Compress responses > 200 bytes
GZIP_MIN_LENGTH = 200
```

#### 6. Database Indexing Strategy

**Optimized Indexes for Dashboard Queries:**
```sql
-- Composite indexes for common dashboard queries
CREATE INDEX idx_animals_tenant_farm_status 
ON animals(tenant_id, farm_id, status) 
WHERE status = 'active';

CREATE INDEX idx_productions_tenant_date_type 
ON productions(tenant_id, production_date, production_type);

CREATE INDEX idx_sales_tenant_date 
ON sales(tenant_id, sale_date) 
WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days';

CREATE INDEX idx_expenses_tenant_date_status 
ON expenses(tenant_id, expense_date, status) 
WHERE status = 'approved';

-- Partial indexes for active records
CREATE INDEX idx_animals_active 
ON animals(tenant_id, farm_id) 
WHERE status = 'active' AND is_deleted = FALSE;
```

#### 7. Async Data Loading (Frontend)

**Progressive Dashboard Loading:**
```typescript
// Frontend: Load critical data first, then lazy load rest
async function loadDashboard(tenantId: string) {
    // Critical data (blocking) - Load first
    const [stats, animals] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/animals?page=1')
    ]);
    
    // Non-critical data (lazy load) - Load after 1 second
    setTimeout(async () => {
        const [analytics, activities, recentSales] = await Promise.all([
            fetch('/api/dashboard/analytics'),
            fetch('/api/dashboard/activities?limit=10'),
            fetch('/api/dashboard/recent-sales?limit=5')
        ]);
        
        // Update UI with lazy-loaded data
        updateDashboard(await analytics.json());
    }, 1000);
}
```

#### 8. Cache Warming

**Pre-populate Cache:**
```python
# celery_app/tasks.py

from celery import shared_task
from django.core.cache import cache
from django.db.models import Q

@shared_task
def warm_dashboard_cache():
    """Pre-populate dashboard cache for all active tenants"""
    from tenants.models import Tenant
    from users.models import User
    
    active_tenants = Tenant.objects.filter(status='active')
    
    for tenant in active_tenants:
        # Get tenant owner
        owner = tenant.owner_user
        
        if owner:
            # Warm cache for owner
            cache_key = f'dashboard:stats:tenant:{tenant.tenant_id}:user:{owner.user_id}'
            
            # Calculate and cache stats
            from api.views.dashboard import DashboardStatsView
            view = DashboardStatsView()
            stats = view.calculate_stats(tenant.tenant_id, owner)
            
            cache.set(cache_key, stats, 300)  # 5 minutes

# Schedule to run every 4 minutes (before cache expires)
app.conf.beat_schedule['warm-dashboard-cache'] = {
    'task': 'celery_app.tasks.warm_dashboard_cache',
    'schedule': crontab(minute='*/4'),
}
```

### Performance Targets

**Response Time Goals:**
- Dashboard stats: < 200ms (cached), < 1000ms (uncached)
- Animal list: < 300ms (first page)
- Analytics: < 500ms (cached)
- Financial summary: < 400ms (cached)

**Cache Hit Rate Goals:**
- Target: > 80% cache hit rate
- Monitor: Track cache hit/miss ratios

### Monitoring

**Performance Metrics:**
```python
# api/middleware/performance.py

import time
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin

class PerformanceMonitoringMiddleware(MiddlewareMixin):
    """Monitor dashboard endpoint performance"""
    
    def process_request(self, request):
        if request.path.startswith('/api/dashboard'):
            request._start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
            
            # Log slow requests
            if duration > 1.0:  # > 1 second
                logger.warning(f"Slow dashboard request: {request.path} took {duration:.2f}s")
            
            # Track metrics
            cache_key = f'perf:dashboard:{request.path}'
            cache.incr(cache_key, timeout=3600)
        
        return response
```

---

## Deployment Strategy

### Hostinger KVM 2 Configuration

**Specifications:**
- 2 CPU cores
- 4 GB RAM
- 80 GB SSD storage

**Optimized Setup:**

**1. Database Optimization**
```bash
# PostgreSQL configuration for 4GB RAM
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
max_connections = 100
work_mem = 10MB
```

**2. Application Configuration**
```python
# Django settings for production
CONN_MAX_AGE = 600  # Keep database connections for 10 minutes
```

**3. Docker Compose**
```yaml
version: '3.8'

services:
  web:
    build: .
    command: gunicorn ifarm.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/ifarm
      - SUPABASE_DB_URL=postgresql://postgres:pass@db.backup.supabase.co:5432/postgres
      - REDIS_URL=redis://redis:6379/0
      - DATABASE_FAILOVER_ENABLED=True
    depends_on:
      - db
      - redis
    restart: always
  
  celery:
    build: .
    command: celery -A celery_app worker -l info --concurrency=2
    depends_on:
      - db
      - redis
    restart: always
  
  celery-beat:
    build: .
    command: celery -A celery_app beat -l info
    depends_on:
      - db
      - redis
    restart: always
  
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=ifarm
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    restart: always
  
  redis:
    image: redis:7-alpine
    restart: always
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./static:/static
    depends_on:
      - web
    restart: always

volumes:
  postgres_data:
```

**Note**: Backup database (Supabase) is external and configured via environment variables. See [DATABASE_FAILOVER.md](./DATABASE_FAILOVER.md) for complete setup.

---

## Database Failover & Redundancy

### Dual-Database Architecture

The iFarm system implements a **dual-database architecture** for high availability:

- **Primary Database**: PostgreSQL (self-hosted or managed)
- **Backup Database**: Supabase PostgreSQL (cloud-hosted)

**Layer Context**:
- **Layer 6 (Data Access)**: DatabaseRouter routes queries to primary/backup
- **Layer 5 (Business Logic)**: DatabaseHealthService monitors database health
- **Layer 7 (Database)**: Primary PostgreSQL + Supabase backup with replication

### Key Features

✅ **Automatic Failover**: Seamless switching to Supabase if primary fails  
✅ **Real-Time Replication**: Data synced to backup continuously  
✅ **Zero Downtime**: Application continues operating during failover  
✅ **Health Monitoring**: Continuous health checks for both databases  
✅ **Disaster Recovery**: Complete backup in cloud (Supabase)

### Implementation

```python
# Django Settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('PRIMARY_DB_NAME'),
        'HOST': env('PRIMARY_DB_HOST'),
        # ... primary database config
    },
    'backup': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('SUPABASE_DB_NAME'),
        'HOST': env('SUPABASE_DB_HOST'),
        'OPTIONS': {'sslmode': 'require'},  # Supabase requires SSL
        # ... Supabase backup database config
    }
}

# Database Router for failover
DATABASE_ROUTERS = ['core.db_router.DatabaseRouter']
```

**See [DATABASE_FAILOVER.md](./DATABASE_FAILOVER.md) for complete documentation.**

---

**Backend Plan Complete! 🎉**

All 7 parts have been created covering:
1. Overview & Architecture
2. Core Infrastructure (core, tenants, users, permissions)
3. Domain Apps (farms, animals, production, breeding)
4. Financial System (with approval workflow & invoicing)
5. System Apps (devices & subscriptions)
6. Supporting Apps (audit, analytics, notifications)
7. Integration Services (Celery, Kafka, Redis, Supabase) & Deployment
8. **Database Failover & Redundancy** 🆕 (Primary PostgreSQL + Supabase Backup)

