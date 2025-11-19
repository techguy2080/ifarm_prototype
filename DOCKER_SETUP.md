# Docker Containerization Setup Guide

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Production-Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Staging Environment](#staging-environment)
5. [Production Environment](#production-environment)
6. [Redis Caching](#redis-caching)
7. [Dashboard Endpoint Optimization](#dashboard-endpoint-optimization)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The iFarm project is fully containerized using Docker and Docker Compose, with separate configurations for:
- **Local Development**: SQLite + Redis
- **Staging**: PostgreSQL + Redis
- **Production**: PostgreSQL + Redis + Nginx

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Frontend   │───▶│    Redis     │                  │
│  │  (Next.js)   │    │   (Cache)    │                  │
│  └──────────────┘    └──────────────┘                  │
│         │                    │                         │
│         │                    │                         │
│         ▼                    ▼                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Backend    │───▶│  PostgreSQL  │                  │
│  │   (Django)   │    │  (Database)  │                  │
│  └──────────────┘    └──────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

### Environment Files

Create environment files based on your deployment target:

1. **`.env.local`** - Local development (SQLite)
2. **`.env.staging`** - Staging environment (PostgreSQL)
3. **`.env.production`** - Production environment (PostgreSQL)

**Template**: See `.env.example` for all available configuration options.

### Quick Setup

```bash
# Local Development
cp .env.example .env.local
# Edit .env.local with your local settings

# Staging
cp .env.example .env.staging
# Edit .env.staging with staging credentials

# Production
cp .env.example .env.production
# Edit .env.production with production credentials (use strong secrets!)
```

---

## Local Development

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

### Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd ifarm-prototype

# 2. Create .env.local file
cp .env.example .env.local
# Edit .env.local (SQLite is default)

# 3. Start services
docker-compose up -d

# 4. View logs
docker-compose logs -f frontend

# 5. Access application
# Frontend: http://localhost:3000
# Redis: localhost:6379
```

### Local Development Features

- **SQLite Database**: No separate database container needed
- **Redis Caching**: Available at `localhost:6379`
- **Hot Reload**: Code changes reflect immediately
- **Volume Mounting**: Source code mounted for live editing

### Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose build --no-cache

# Execute commands in container
docker-compose exec frontend npm run lint

# Clean up (remove volumes)
docker-compose down -v
```

---

## Staging Environment

### Setup

```bash
# 1. Create .env.staging file
cp .env.example .env.staging
# Update with staging credentials

# 2. Start staging services
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

# 3. Run migrations (when backend is ready)
docker-compose -f docker-compose.staging.yml exec backend python manage.py migrate

# 4. Create superuser (when backend is ready)
docker-compose -f docker-compose.staging.yml exec backend python manage.py createsuperuser
```

### Staging Features

- **PostgreSQL Database**: Production-like database
- **Redis Caching**: Persistent caching
- **Health Checks**: Automatic service health monitoring
- **Data Persistence**: Volumes for database and cache

---

## Production Environment

### Setup

```bash
# 1. Create .env.production file
cp .env.example .env.production
# IMPORTANT: Update with strong production secrets!

# 2. Generate secure secrets
openssl rand -base64 32  # For SECRET_KEY
openssl rand -base64 32  # For JWT_SECRET_KEY

# 3. Start production services
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# 4. Run migrations
docker-compose -f docker-compose.production.yml exec backend python manage.py migrate

# 5. Collect static files
docker-compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
```

### Production Features

- **Nginx Reverse Proxy**: Load balancing and SSL termination
- **PostgreSQL Database**: Production database with backups
- **Redis Caching**: Persistent, optimized caching
- **Resource Limits**: CPU and memory limits per service
- **Health Checks**: Automatic service monitoring
- **Auto-restart**: Services restart on failure
- **Multi-replica**: Backend can scale horizontally

### Production Checklist

- [ ] Update all secrets in `.env.production`
- [ ] Configure SSL certificates in `nginx/ssl/`
- [ ] Set up database backups
- [ ] Configure monitoring (Sentry, etc.)
- [ ] Set up log aggregation
- [ ] Configure CDN for static assets
- [ ] Set up automated deployments

---

## Redis Caching

### Configuration

Redis is used for:
- **Session Storage**: User sessions
- **Permission Caching**: User permissions and roles
- **Query Result Caching**: Dashboard data, analytics
- **Rate Limiting**: API rate limiting
- **Form State**: Multi-step form state
- **IP Geolocation**: Cached IP location data

### Redis Setup

**Local Development:**
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes --maxmemory 256mb
```

**Production:**
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
```

### Cache Keys Structure

```
ifarm:permissions:user:{user_id}:tenant:{tenant_id}
ifarm:dashboard:tenant:{tenant_id}:farm:{farm_id}
ifarm:analytics:{metric_type}:{period}:{tenant_id}
ifarm:form_state:{user_id}:{form_key}
ifarm:ip_geo:{ip_address}
ifarm:rate_limit:{rule_id}:{scope}:{identifier}
```

---

## Dashboard Endpoint Optimization

### Industry-Standard Performance Optimization

Dashboard endpoints are optimized using multiple strategies:

#### 1. Redis Caching Layer

```python
# Example: Dashboard Stats Endpoint
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

@method_decorator(cache_page(300), name='dispatch')  # 5-minute cache
class DashboardStatsView(APIView):
    def get(self, request, tenant_id):
        cache_key = f'dashboard:stats:tenant:{tenant_id}'
        cached = cache.get(cache_key)
        
        if cached:
            return Response(cached)
        
        # Calculate stats
        stats = self.calculate_stats(tenant_id)
        
        # Cache for 5 minutes
        cache.set(cache_key, stats, 300)
        
        return Response(stats)
```

#### 2. Database Query Optimization

```python
# Optimized queries with select_related and prefetch_related
def get_dashboard_data(tenant_id):
    # Single query with joins
    animals = Animal.objects.filter(
        tenant_id=tenant_id
    ).select_related(
        'farm', 'breed', 'current_health_status'
    ).prefetch_related(
        'activities', 'productions', 'sales'
    )
    
    # Aggregated queries
    from django.db.models import Sum, Count, Avg
    
    stats = animals.aggregate(
        total=Count('animal_id'),
        total_value=Sum('estimated_value'),
        avg_age=Avg('age_months')
    )
    
    return stats
```

#### 3. Pagination and Lazy Loading

```python
from rest_framework.pagination import PageNumberPagination

class DashboardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class DashboardListView(ListAPIView):
    pagination_class = DashboardPagination
    queryset = Animal.objects.all()
    
    def get_queryset(self):
        # Only fetch what's needed for current page
        return super().get_queryset()[:self.pagination_class.page_size]
```

#### 4. Response Compression

```python
# Django middleware for response compression
MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',  # Compress responses
    # ... other middleware
]
```

#### 5. CDN for Static Assets

```python
# settings.py
STATIC_URL = 'https://cdn.ifarm.com/static/'
MEDIA_URL = 'https://cdn.ifarm.com/media/'
```

#### 6. Database Indexing

```sql
-- Optimized indexes for dashboard queries
CREATE INDEX idx_animals_tenant_farm_status ON animals(tenant_id, farm_id, status);
CREATE INDEX idx_productions_tenant_date ON productions(tenant_id, production_date);
CREATE INDEX idx_sales_tenant_date ON sales(tenant_id, sale_date);
CREATE INDEX idx_expenses_tenant_date ON expenses(tenant_id, expense_date);
```

#### 7. Materialized Views (PostgreSQL)

```sql
-- Materialized view for dashboard stats
CREATE MATERIALIZED VIEW dashboard_stats_cache AS
SELECT 
    tenant_id,
    farm_id,
    COUNT(*) as total_animals,
    SUM(estimated_value) as total_value,
    AVG(age_months) as avg_age
FROM animals
GROUP BY tenant_id, farm_id;

-- Refresh periodically (via Celery)
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats_cache;
```

#### 8. Async Data Loading

```python
# Frontend: Load critical data first, then lazy load rest
async function loadDashboard() {
    // Critical data (blocking)
    const stats = await fetch('/api/dashboard/stats');
    
    // Non-critical data (lazy load)
    setTimeout(async () => {
        const analytics = await fetch('/api/dashboard/analytics');
        const recentActivities = await fetch('/api/dashboard/activities');
    }, 1000);
}
```

### Dashboard Endpoint Examples

**Optimized Dashboard Stats:**
```python
# api/views/dashboard.py

from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q
from datetime import datetime, timedelta

class DashboardStatsView(APIView):
    """
    Optimized dashboard stats endpoint
    - Redis caching (5 minutes)
    - Database query optimization
    - Aggregated calculations
    """
    
    def get(self, request, tenant_id):
        cache_key = f'dashboard:stats:tenant:{tenant_id}:user:{request.user.user_id}'
        cached = cache.get(cache_key)
        
        if cached:
            return Response(cached)
        
        # Optimized queries
        stats = {
            'animals': self.get_animal_stats(tenant_id),
            'financial': self.get_financial_stats(tenant_id),
            'production': self.get_production_stats(tenant_id),
            'health': self.get_health_stats(tenant_id),
            'breeding': self.get_breeding_stats(tenant_id),
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, stats, 300)
        
        return Response(stats)
    
    def get_animal_stats(self, tenant_id):
        """Optimized animal statistics"""
        from animals.models import Animal
        
        return Animal.objects.filter(
            tenant_id=tenant_id
        ).aggregate(
            total=Count('animal_id'),
            active=Count('animal_id', filter=Q(status='active')),
            total_value=Sum('estimated_value'),
            avg_age=Avg('age_months')
        )
    
    def get_financial_stats(self, tenant_id):
        """Optimized financial statistics"""
        from financial.models import AnimalSale, ProductSale, Expense
        
        today = datetime.now().date()
        this_month = today.replace(day=1)
        
        return {
            'revenue': AnimalSale.objects.filter(
                tenant_id=tenant_id,
                sale_date__gte=this_month
            ).aggregate(total=Sum('sale_price'))['total'] or 0,
            'expenses': Expense.objects.filter(
                tenant_id=tenant_id,
                expense_date__gte=this_month
            ).aggregate(total=Sum('amount'))['total'] or 0,
        }
```

**Cache Invalidation Strategy:**
```python
# Invalidate cache on data changes
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Animal)
def invalidate_dashboard_cache(sender, instance, **kwargs):
    """Invalidate dashboard cache when animal data changes"""
    cache_key_pattern = f'dashboard:*:tenant:{instance.tenant_id}*'
    cache.delete_pattern(cache_key_pattern)  # Requires django-redis
```

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
# Kill the process or change port in docker-compose.yml
```

**2. Redis Connection Failed**
```bash
# Check Redis is running
docker-compose ps redis
# Check Redis logs
docker-compose logs redis
```

**3. Database Connection Issues**
```bash
# Check PostgreSQL is healthy
docker-compose exec postgres pg_isready
# Check database logs
docker-compose logs postgres
```

**4. Build Failures**
```bash
# Clean build
docker-compose build --no-cache
# Remove old images
docker system prune -a
```

**5. Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

---

## Performance Monitoring

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Check specific service
docker-compose exec frontend wget -qO- http://localhost:3000/api/health
```

### Resource Usage

```bash
# View resource usage
docker stats

# View logs
docker-compose logs -f --tail=100
```

---

## Next Steps

1. **Set up CI/CD**: Automate deployments
2. **Configure Monitoring**: Set up Prometheus/Grafana
3. **Set up Logging**: Centralized log aggregation
4. **Configure Backups**: Automated database backups
5. **SSL Certificates**: Set up Let's Encrypt
6. **CDN Setup**: Configure CloudFlare or similar

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/)


