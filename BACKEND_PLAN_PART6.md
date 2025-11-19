# iFarm Backend Plan - Part 6: Subscriptions Complete & Supporting Apps

## Layer Architecture Context

This document details **Layer 5 (Business Logic)** and **Layer 6 (Data Access)** components for supporting apps:

- **Layer 5 (Business Logic)**: Audit logging services, analytics computation, notification delivery, subscription billing
- **Layer 6 (Data Access)**: Audit log queries, analytics cache, notification records, subscription records
- **Layer 7 (Database)**: Audit log tables, analytics cache tables, notification tables, subscription tables

These supporting apps provide essential infrastructure for compliance, reporting, communication, and billing across the entire system.

---

## Subscriptions App (Continued)

#### Models (Continued)

**Invoice** (for subscriptions)
```python
class Invoice(BaseModel):
    """Subscription invoices"""
    invoice_id = models.AutoField(primary_key=True)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='invoices')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    
    invoice_number = models.CharField(max_length=50, unique=True)
    
    # Amounts
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    
    # Dates
    invoice_date = models.DateTimeField()
    due_date = models.DateTimeField()
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ])
    
    # Payment
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_method = models.ForeignKey('PaymentMethod', on_delete=models.SET_NULL, null=True, blank=True)
    
    # External reference
    external_invoice_id = models.CharField(max_length=255, blank=True)
    
    # PDF
    pdf_url = models.URLField(blank=True)
    
    class Meta:
        db_table = 'subscription_invoices'
        indexes = [
            models.Index(fields=['tenant', 'invoice_number']),
            models.Index(fields=['status', 'due_date']),
        ]
```

**Payment**
```python
class Payment(BaseModel):
    """Payment transactions"""
    payment_id = models.AutoField(primary_key=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    
    # Payment details
    payment_method = models.CharField(max_length=50, choices=[
        ('card', 'Credit/Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('paypal', 'PayPal'),
    ])
    
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ])
    
    # Idempotency
    idempotency_key = models.CharField(max_length=255, unique=True)
    
    # External references
    external_payment_id = models.CharField(max_length=255, blank=True)
    gateway = models.CharField(max_length=50, blank=True)  # stripe, paypal, etc.
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    failure_reason = models.TextField(blank=True)
    
    # Timestamps
    succeeded_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['idempotency_key']),
            models.Index(fields=['external_payment_id']),
        ]
```

**PaymentMethod**
```python
class PaymentMethod(BaseModel):
    """Stored payment methods"""
    payment_method_id = models.AutoField(primary_key=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    
    method_type = models.CharField(max_length=50, choices=[
        ('card', 'Card'),
        ('bank_account', 'Bank Account'),
        ('mobile_money', 'Mobile Money'),
    ])
    
    # Card info (last 4 digits only)
    card_last4 = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=20, blank=True)
    card_exp_month = models.IntegerField(null=True, blank=True)
    card_exp_year = models.IntegerField(null=True, blank=True)
    
    # Bank info (masked)
    bank_name = models.CharField(max_length=200, blank=True)
    account_last4 = models.CharField(max_length=4, blank=True)
    
    # Mobile money
    mobile_number = models.CharField(max_length=20, blank=True)
    mobile_provider = models.CharField(max_length=50, blank=True)
    
    # Status
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # External reference
    external_payment_method_id = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'payment_methods'
        indexes = [
            models.Index(fields=['tenant', 'is_default']),
        ]
```

**UsageLog**
```python
class UsageLog(BaseModel):
    """Track usage for billing and limits"""
    log_id = models.AutoField(primary_key=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    
    # Usage metrics
    metric_type = models.CharField(max_length=50, choices=[
        ('api_requests', 'API Requests'),
        ('storage', 'Storage Used'),
        ('users', 'Active Users'),
        ('animals', 'Total Animals'),
        ('farms', 'Total Farms'),
    ])
    
    metric_value = models.DecimalField(max_digits=15, decimal_places=2)
    unit = models.CharField(max_length=50)
    
    # Time period
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    
    # Billing
    is_billable = models.BooleanField(default=False)
    billed_in_invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'usage_logs'
        indexes = [
            models.Index(fields=['tenant', 'metric_type', 'period_start']),
        ]
```

#### Services

**PaymentGatewayService** (Idempotent)
```python
import stripe
from decimal import Decimal

class PaymentGatewayService:
    @staticmethod
    def process_payment(tenant, amount, currency, payment_method_id, idempotency_key):
        """Process payment with idempotency"""
        # Check if payment already processed
        existing_payment = Payment.objects.filter(
            idempotency_key=idempotency_key
        ).first()
        
        if existing_payment:
            if existing_payment.status == 'succeeded':
                return existing_payment
            elif existing_payment.status in ['pending', 'processing']:
                # Still processing, return existing
                return existing_payment
            # If failed, can retry
        
        # Create payment record
        payment = Payment.objects.create(
            tenant=tenant,
            amount=amount,
            currency=currency,
            payment_method=payment_method_id,
            status='pending',
            idempotency_key=idempotency_key,
            gateway='stripe'
        )
        
        try:
            # Process with Stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            
            payment_intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency.lower(),
                payment_method=payment_method_id,
                confirm=True,
                idempotency_key=idempotency_key
            )
            
            payment.external_payment_id = payment_intent.id
            payment.status = 'processing'
            payment.save()
            
            # Check status
            if payment_intent.status == 'succeeded':
                payment.status = 'succeeded'
                payment.succeeded_at = timezone.now()
                payment.save()
                
                # Publish event
                kafka_producer.send('payment.succeeded', {
                    'payment_id': payment.payment_id,
                    'tenant_id': tenant.tenant_id,
                    'amount': float(amount),
                    'timestamp': timezone.now().isoformat()
                })
            
            return payment
            
        except stripe.error.CardError as e:
            payment.status = 'failed'
            payment.failed_at = timezone.now()
            payment.failure_reason = str(e)
            payment.save()
            raise
        except Exception as e:
            payment.status = 'failed'
            payment.failed_at = timezone.now()
            payment.failure_reason = str(e)
            payment.save()
            raise
```

---

## Supporting Apps

### 1. Audit App

**Purpose**: Comprehensive audit logging for compliance and traceability.

#### Models

**AuditLog**
```python
class AuditLog(BaseModel):
    """Comprehensive audit trail"""
    log_id = models.AutoField(primary_key=True)
    
    # Who
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    acting_as_user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='delegated_actions')  # For delegations
    
    # Where
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True)
    farm = models.ForeignKey('farms.Farm', on_delete=models.SET_NULL, null=True, blank=True)
    
    # What
    action = models.CharField(max_length=100)  # e.g., 'animal_created', 'expense_approved'
    entity_type = models.CharField(max_length=50, blank=True)  # e.g., 'animal', 'expense'
    entity_id = models.IntegerField(null=True, blank=True)
    
    # Details
    description = models.TextField(blank=True)
    details = models.JSONField(default=dict, blank=True)  # Before/after data
    
    # Request context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    
    # Device
    device = models.ForeignKey('devices.Device', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Permission context
    permission_used = models.CharField(max_length=100, blank=True)
    delegation_id = models.IntegerField(null=True, blank=True)
    policy_evaluated = models.JSONField(null=True, blank=True)
    
    # Result
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    # Integrity
    checksum = models.CharField(max_length=64, blank=True)  # SHA-256 hash
    
    class Meta:
        db_table = 'audit_logs'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['tenant', 'created_at']),
            models.Index(fields=['action', 'created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['created_at']),
        ]
```

**AuditLogArchive**
```python
class AuditLogArchive(BaseModel):
    """Archived audit logs for long-term retention"""
    archive_id = models.AutoField(primary_key=True)
    original_log_id = models.BigIntegerField()
    
    # Compressed/serialized log data
    log_data = models.JSONField()
    
    # Archive metadata
    archived_at = models.DateTimeField(auto_now_add=True)
    retention_until = models.DateTimeField()
    
    class Meta:
        db_table = 'audit_log_archive'
        indexes = [
            models.Index(fields=['original_log_id']),
            models.Index(fields=['archived_at']),
        ]
```

#### Services

**AuditService**
```python
import hashlib
import json

class AuditService:
    @staticmethod
    def log(action, user, tenant=None, farm=None, entity_type='', entity_id=None, 
            details=None, ip_address=None, user_agent='', request_path='', 
            request_method='', device=None, permission_used='', delegation_id=None,
            policy_evaluated=None, success=True, error_message=''):
        """Create audit log entry"""
        
        # Generate checksum for integrity
        log_data = {
            'action': action,
            'user_id': user.user_id if user else None,
            'tenant_id': tenant.tenant_id if tenant else None,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'details': details or {},
            'timestamp': timezone.now().isoformat()
        }
        
        checksum = hashlib.sha256(
            json.dumps(log_data, sort_keys=True).encode()
        ).hexdigest()
        
        audit_log = AuditLog.objects.create(
            user=user,
            tenant=tenant,
            farm=farm,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
            request_method=request_method,
            device=device,
            permission_used=permission_used,
            delegation_id=delegation_id,
            policy_evaluated=policy_evaluated,
            success=success,
            error_message=error_message,
            checksum=checksum
        )
        
        # Publish to Kafka for real-time monitoring
        kafka_producer.send('audit.log.created', {
            'log_id': audit_log.log_id,
            'action': action,
            'user_id': user.user_id if user else None,
            'tenant_id': tenant.tenant_id if tenant else None,
            'timestamp': timezone.now().isoformat()
        })
        
        return audit_log
    
    @staticmethod
    def archive_old_logs(days=365):
        """Archive logs older than specified days"""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        old_logs = AuditLog.objects.filter(created_at__lt=cutoff_date)
        
        for log in old_logs.iterator(chunk_size=1000):
            # Create archive
            AuditLogArchive.objects.create(
                original_log_id=log.log_id,
                log_data={
                    'user_id': log.user_id,
                    'tenant_id': log.tenant_id,
                    'action': log.action,
                    'entity_type': log.entity_type,
                    'entity_id': log.entity_id,
                    'details': log.details,
                    'created_at': log.created_at.isoformat(),
                    'checksum': log.checksum
                },
                retention_until=timezone.now() + timedelta(days=2555)  # 7 years
            )
        
        # Delete original logs
        old_logs.delete()
```

---

### 2. Analytics App

**Purpose**: Analytics, reporting, and business intelligence.

#### Models

**AnalyticsCache**
```python
class AnalyticsCache(TenantModel):
    """Cached analytics data"""
    cache_id = models.AutoField(primary_key=True)
    farm = models.ForeignKey('farms.Farm', on_delete=models.CASCADE, null=True, blank=True)
    
    # Cache key
    metric_type = models.CharField(max_length=100)  # e.g., 'daily_production', 'animal_count'
    metric_period = models.CharField(max_length=50)  # e.g., 'daily', 'monthly', 'yearly'
    
    # Date range
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Cached data
    data = models.JSONField()
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'analytics_cache'
        indexes = [
            models.Index(fields=['tenant', 'metric_type', 'period_start']),
            models.Index(fields=['expires_at']),
        ]
```

**Report**
```python
class Report(TenantModel):
    """Generated reports"""
    report_id = models.AutoField(primary_key=True)
    
    report_type = models.CharField(max_length=100, choices=[
        ('financial', 'Financial Report'),
        ('production', 'Production Report'),
        ('health', 'Health Report'),
        ('breeding', 'Breeding Report'),
        ('inventory', 'Inventory Report'),
    ])
    
    # Parameters
    parameters = models.JSONField(default=dict)  # Filters, date ranges, etc.
    
    # Generated report
    file_url = models.URLField(blank=True)
    file_format = models.CharField(max_length=20, choices=[
        ('pdf', 'PDF'),
        ('xlsx', 'Excel'),
        ('csv', 'CSV'),
    ])
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ])
    
    # Metadata
    generated_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    generated_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'reports'
        indexes = [
            models.Index(fields=['tenant', 'report_type', 'created_at']),
        ]
```

#### Services

**AnalyticsService**
```python
class AnalyticsService:
    @staticmethod
    def get_production_trends(tenant_id, farm_id=None, days=30):
        """Get production trends"""
        # Check cache
        cache_key = f'production_trends:{tenant_id}:{farm_id}:{days}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Calculate
        start_date = timezone.now().date() - timedelta(days=days)
        
        query = DailyProductionSummary.objects.filter(
            tenant_id=tenant_id,
            summary_date__gte=start_date
        )
        
        if farm_id:
            query = query.filter(farm_id=farm_id)
        
        trends = query.values('summary_date', 'production_type').annotate(
            total=Sum('total_quantity'),
            avg=Avg('average_quantity_per_session')
        ).order_by('summary_date')
        
        result = list(trends)
        
        # Cache for 1 hour
        cache.set(cache_key, result, 3600)
        
        return result
    
    @staticmethod
    def get_financial_summary(tenant_id, start_date, end_date):
        """Get financial summary"""
        # Revenue
        animal_sales = AnimalSale.objects.filter(
            tenant_id=tenant_id,
            sale_date__range=[start_date, end_date],
            payment_status='paid'
        ).aggregate(total=Sum('sale_price'))['total'] or 0
        
        product_sales = ProductSale.objects.filter(
            tenant_id=tenant_id,
            sale_date__range=[start_date, end_date],
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Expenses
        expenses = Expense.objects.filter(
            tenant_id=tenant_id,
            expense_date__range=[start_date, end_date],
            approval_status='approved'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return {
            'revenue': animal_sales + product_sales,
            'expenses': expenses,
            'profit': (animal_sales + product_sales) - expenses
        }
```

---

### 3. Notifications App

**Purpose**: Multi-channel notification system.

#### Models

**Notification**
```python
class Notification(BaseModel):
    """Notification records"""
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    
    notification_type = models.CharField(max_length=100)
    channel = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push'),
        ('in_app', 'In-App'),
    ])
    
    # Content
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.URLField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    ], default='pending')
    
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Retry
    retry_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['user', 'status', 'created_at']),
            models.Index(fields=['status', 'sent_at']),
        ]
```

**Continue in next file...**


