# iFarm Backend Plan - Part 5: System Apps (Devices & Subscriptions)

## Layer Architecture Context

This document details **Layer 3 (Middleware)**, **Layer 5 (Business Logic)**, and **Layer 6 (Data Access)** components for system-level apps:

- **Layer 3 (Middleware)**: Device tracking middleware, rate limiting middleware, security enforcement
- **Layer 5 (Business Logic)**: Device fingerprinting services, abuse detection, subscription management, payment processing
- **Layer 6 (Data Access)**: Device queries, subscription queries, payment records with tenant filtering
- **Layer 7 (Database)**: Device tracking tables, subscription tables, payment tables with constraints

These apps provide cross-cutting concerns that support the entire system's security and billing infrastructure.

---

## System Apps

### 1. Devices App

**Purpose**: Device tracking, IP monitoring, abuse detection, and rate limiting for security.

#### Models

**Device**
```python
class Device(BaseModel):
    """Track user devices"""
    device_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='devices')
    
    # Device fingerprint
    fingerprint = models.CharField(max_length=255, unique=True)
    
    # Device info
    device_name = models.CharField(max_length=200, blank=True)
    device_type = models.CharField(max_length=50, choices=[
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('other', 'Other'),
    ])
    
    # System info
    os = models.CharField(max_length=100, blank=True)
    os_version = models.CharField(max_length=50, blank=True)
    browser = models.CharField(max_length=100, blank=True)
    browser_version = models.CharField(max_length=50, blank=True)
    user_agent = models.TextField()
    
    # Last seen
    last_ip = models.GenericIPAddressField(null=True, blank=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    
    # Security
    is_trusted = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    blocked_reason = models.TextField(blank=True)
    blocked_at = models.DateTimeField(null=True, blank=True)
    
    # Usage stats
    total_requests = models.IntegerField(default=0)
    failed_login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'devices'
        indexes = [
            models.Index(fields=['user', 'fingerprint']),
            models.Index(fields=['fingerprint']),
            models.Index(fields=['is_blocked']),
        ]
    
    def __str__(self):
        return f"{self.device_name or self.device_type} - {self.user.email}"
```

**DeviceSession**
```python
class DeviceSession(BaseModel):
    """Track individual sessions per device"""
    session_id = models.AutoField(primary_key=True)
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='sessions')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='device_sessions')
    
    # Session info
    ip_address = models.GenericIPAddressField()
    session_token = models.CharField(max_length=255, unique=True)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Request count
    request_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'device_sessions'
        indexes = [
            models.Index(fields=['device', 'is_active']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['session_token']),
        ]
```

**IPAddress**
```python
class IPAddress(BaseModel):
    """Track IP addresses and their reputation"""
    ip_id = models.AutoField(primary_key=True)
    ip_address = models.GenericIPAddressField(unique=True)
    
    # Geographic info
    country = models.CharField(max_length=100, blank=True)
    country_code = models.CharField(max_length=2, blank=True, help_text="ISO 3166-1 alpha-2 country code (e.g., 'UG', 'US')")
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # ISP info
    isp = models.CharField(max_length=200, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    
    # Security flags
    is_vpn = models.BooleanField(default=False)
    is_proxy = models.BooleanField(default=False)
    is_tor = models.BooleanField(default=False)
    is_datacenter = models.BooleanField(default=False)
    is_bot = models.BooleanField(default=False)
    
    # Reputation
    reputation_score = models.IntegerField(default=50)  # 0-100
    is_blacklisted = models.BooleanField(default=False)
    blacklist_reason = models.TextField(blank=True)
    
    # Usage stats
    total_requests = models.IntegerField(default=0)
    failed_login_attempts = models.IntegerField(default=0)
    abuse_reports = models.IntegerField(default=0)
    
    # Last seen
    last_seen_at = models.DateTimeField(auto_now=True)
    first_seen_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ip_addresses'
        indexes = [
            models.Index(fields=['ip_address']),
            models.Index(fields=['is_blacklisted']),
            models.Index(fields=['reputation_score']),
            models.Index(fields=['country_code']),  # For suspicious location detection
        ]
```

**AbuseLog**
```python
class AbuseLog(BaseModel):
    """Log security violations"""
    log_id = models.AutoField(primary_key=True)
    
    # Who
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True, related_name='abuse_logs')
    device = models.ForeignKey(Device, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.ForeignKey(IPAddress, on_delete=models.SET_NULL, null=True, blank=True)
    
    # What
    abuse_type = models.CharField(max_length=50, choices=[
        ('brute_force', 'Brute Force'),
        ('rate_limit', 'Rate Limit Exceeded'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('invalid_token', 'Invalid Token'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('multiple_failed_logins', 'Multiple Failed Logins'),
        ('bot_detected', 'Bot Detected'),
    ])
    
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ])
    
    # Details
    description = models.TextField()
    request_path = models.CharField(max_length=500, blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    request_data = models.JSONField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Action taken
    action_taken = models.CharField(max_length=50, choices=[
        ('logged', 'Logged Only'),
        ('warning', 'Warning Sent'),
        ('blocked', 'Request Blocked'),
        ('account_locked', 'Account Locked'),
        ('ip_banned', 'IP Banned'),
    ])
    
    class Meta:
        db_table = 'abuse_logs'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['abuse_type', 'severity']),
            models.Index(fields=['created_at']),
        ]
```

**RateLimitRule**
```python
class RateLimitRule(BaseModel):
    """Configurable rate limiting rules"""
    rule_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Rule configuration
    endpoint_pattern = models.CharField(max_length=500)  # e.g., '/api/animals/*'
    method = models.CharField(max_length=10, blank=True)  # GET, POST, etc. Empty = all
    
    # Limits
    requests_per_minute = models.IntegerField(default=60)
    requests_per_hour = models.IntegerField(default=1000)
    requests_per_day = models.IntegerField(default=10000)
    
    # Scope
    scope = models.CharField(max_length=20, choices=[
        ('global', 'Global'),
        ('per_user', 'Per User'),
        ('per_ip', 'Per IP'),
        ('per_tenant', 'Per Tenant'),
    ])
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'rate_limit_rules'
```

**SecurityAlert**
```python
class SecurityAlert(BaseModel):
    """Real-time security alerts"""
    alert_id = models.AutoField(primary_key=True)
    
    alert_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=20, choices=[
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ])
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related entities
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True)
    device = models.ForeignKey(Device, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='alerts_resolved')
    
    class Meta:
        db_table = 'security_alerts'
        indexes = [
            models.Index(fields=['severity', 'is_resolved']),
            models.Index(fields=['created_at']),
        ]
```

#### Services

**DeviceFingerprintingService**
```python
class DeviceFingerprintingService:
    @staticmethod
    def generate_fingerprint(request):
        """Generate device fingerprint from request"""
        # Combine multiple attributes
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
        accept_encoding = request.META.get('HTTP_ACCEPT_ENCODING', '')
        
        # Custom header if sent by client
        custom_fingerprint = request.META.get('HTTP_X_DEVICE_FINGERPRINT')
        if custom_fingerprint:
            return custom_fingerprint
        
        # Generate hash
        fingerprint_string = f"{user_agent}|{accept_language}|{accept_encoding}"
        return hashlib.sha256(fingerprint_string.encode()).hexdigest()
    
    @staticmethod
    def get_or_create_device(user, fingerprint, user_agent, ip_address):
        """Get or create device record"""
        device, created = Device.objects.get_or_create(
            user=user,
            fingerprint=fingerprint,
            defaults={
                'user_agent': user_agent,
                'last_ip': ip_address,
                'device_type': DeviceFingerprintingService._detect_device_type(user_agent),
                'os': DeviceFingerprintingService._detect_os(user_agent),
                'browser': DeviceFingerprintingService._detect_browser(user_agent),
            }
        )
        
        if not created:
            device.last_ip = ip_address
            device.last_seen_at = timezone.now()
            device.total_requests += 1
            device.save()
        
        return device
    
    @staticmethod
    def _detect_device_type(user_agent):
        """Detect device type from user agent"""
        ua_lower = user_agent.lower()
        if 'mobile' in ua_lower or 'android' in ua_lower or 'iphone' in ua_lower:
            return 'mobile'
        elif 'tablet' in ua_lower or 'ipad' in ua_lower:
            return 'tablet'
        return 'desktop'
    
    @staticmethod
    def _detect_os(user_agent):
        """Detect OS from user agent"""
        # Simple detection logic
        if 'Windows' in user_agent:
            return 'Windows'
        elif 'Mac' in user_agent:
            return 'macOS'
        elif 'Linux' in user_agent:
            return 'Linux'
        elif 'Android' in user_agent:
            return 'Android'
        elif 'iOS' in user_agent or 'iPhone' in user_agent:
            return 'iOS'
        return 'Unknown'
    
    @staticmethod
    def _detect_browser(user_agent):
        """Detect browser from user agent"""
        if 'Chrome' in user_agent:
            return 'Chrome'
        elif 'Firefox' in user_agent:
            return 'Firefox'
        elif 'Safari' in user_agent:
            return 'Safari'
        elif 'Edge' in user_agent:
            return 'Edge'
        return 'Unknown'
```

**AbuseDetectionService**
```python
class AbuseDetectionService:
    @staticmethod
    def is_abusive_request(user, ip_address):
        """Check if request is abusive"""
        # Check IP blacklist
        try:
            ip = IPAddress.objects.get(ip_address=ip_address)
            if ip.is_blacklisted:
                return True
            
            # Check reputation score
            if ip.reputation_score < 20:
                return True
        except IPAddress.DoesNotExist:
            pass
        
        # Check user's device
        devices = Device.objects.filter(user=user, is_blocked=True)
        if devices.exists():
            return True
        
        # Check failed login attempts
        recent_failures = AbuseLog.objects.filter(
            user=user,
            abuse_type='multiple_failed_logins',
            created_at__gte=timezone.now() - timedelta(minutes=15)
        ).count()
        
        if recent_failures >= 5:
            return True
        
        return False
    
    @staticmethod
    def log_abuse(user, ip_address, abuse_type, severity, description, action_taken='logged'):
        """Log security violation"""
        # Get or create IP record
        ip_obj, _ = IPAddress.objects.get_or_create(ip_address=ip_address)
        
        # Get device if available
        device = None
        if user:
            device = Device.objects.filter(user=user).order_by('-last_seen_at').first()
        
        # Create abuse log
        abuse_log = AbuseLog.objects.create(
            user=user,
            device=device,
            ip_address=ip_obj,
            abuse_type=abuse_type,
            severity=severity,
            description=description,
            action_taken=action_taken
        )
        
        # Update IP reputation
        if severity == 'high' or severity == 'critical':
            ip_obj.reputation_score = max(0, ip_obj.reputation_score - 10)
            ip_obj.abuse_reports += 1
            ip_obj.save()
        
        # Create security alert for critical issues
        if severity == 'critical':
            SecurityAlert.objects.create(
                alert_type=abuse_type,
                severity='critical',
                title=f"Critical Security Alert: {abuse_type}",
                message=description,
                user=user
            )
        
        return abuse_log
```

**RateLimitService**
```python
import redis
from django.conf import settings

redis_client = redis.Redis.from_url(settings.REDIS_URL)

class RateLimitService:
    @staticmethod
    def check_rate_limit(user, endpoint, method='GET'):
        """Check if request exceeds rate limit"""
        # Get applicable rules
        rules = RateLimitRule.objects.filter(
            is_active=True,
            endpoint_pattern=endpoint
        ).filter(
            Q(method='') | Q(method=method)
        )
        
        for rule in rules:
            if rule.scope == 'per_user':
                key = f"rate_limit:{rule.rule_id}:user:{user.user_id}"
            elif rule.scope == 'per_tenant':
                key = f"rate_limit:{rule.rule_id}:tenant:{user.tenant_id}"
            else:
                key = f"rate_limit:{rule.rule_id}:global"
            
            # Check minute limit
            minute_key = f"{key}:minute"
            minute_count = redis_client.incr(minute_key)
            redis_client.expire(minute_key, 60)
            
            if minute_count > rule.requests_per_minute:
                AbuseDetectionService.log_abuse(
                    user=user,
                    ip_address=get_client_ip(),
                    abuse_type='rate_limit',
                    severity='medium',
                    description=f"Rate limit exceeded: {minute_count} requests per minute",
                    action_taken='blocked'
                )
                return False
            
            # Check hour limit
            hour_key = f"{key}:hour"
            hour_count = redis_client.incr(hour_key)
            redis_client.expire(hour_key, 3600)
            
            if hour_count > rule.requests_per_hour:
                return False
        
        return True
```

**SuspiciousLocationDetectionService** 🆕
```python
# devices/services.py

import requests
from geopy.distance import geodesic
from django.conf import settings
from django.core.cache import cache
from celery import shared_task

class SuspiciousLocationDetectionService:
    """
    Industry-Standard Suspicious Location Detection
    
    Automatically detects suspicious login locations based on:
    - IP geolocation
    - VPN/Proxy/Tor detection
    - Impossible travel detection
    - New country detection
    - IP reputation
    
    Automatically enforces 2FA for suspicious logins and notifies:
    - Farm owner
    - System admins
    """
    
    # Configurable suspicious indicators
    SUSPICIOUS_COUNTRIES = settings.SUSPICIOUS_COUNTRIES if hasattr(settings, 'SUSPICIOUS_COUNTRIES') else []
    MAX_DISTANCE_KM = 1000  # Maximum reasonable distance between logins
    TIME_WINDOW_HOURS = 24  # Time window for location comparison
    RISK_THRESHOLD = 50  # Risk score threshold for auto 2FA
    
    @staticmethod
    def check_suspicious_location(user, ip_address, request):
        """
        Check if login is from suspicious location
        
        Returns:
            dict with is_suspicious, risk_score, location, previous_locations, reason
        """
        # Get IP geolocation
        ip_info = IPGeolocationService.get_ip_info(ip_address)
        
        if not ip_info:
            return {
                'is_suspicious': True,
                'risk_score': 70,
                'location': {'country': 'Unknown', 'city': 'Unknown'},
                'previous_locations': [],
                'reason': 'Unable to determine location'
            }
        
        location = {
            'country': ip_info.get('country', 'Unknown'),
            'country_code': ip_info.get('country_code', ''),
            'region': ip_info.get('region', 'Unknown'),
            'city': ip_info.get('city', 'Unknown'),
            'latitude': ip_info.get('latitude'),
            'longitude': ip_info.get('longitude'),
            'isp': ip_info.get('isp', 'Unknown'),
            'is_vpn': ip_info.get('is_vpn', False),
            'is_proxy': ip_info.get('is_proxy', False),
            'is_tor': ip_info.get('is_tor', False)
        }
        
        risk_score = 0
        reasons = []
        
        # Check 1: VPN/Proxy/Tor usage
        if location['is_vpn'] or location['is_proxy']:
            risk_score += 30
            reasons.append('VPN/Proxy detected')
        if location['is_tor']:
            risk_score += 50
            reasons.append('Tor network detected')
        
        # Check 2: Suspicious countries
        if location['country_code'] in SuspiciousLocationDetectionService.SUSPICIOUS_COUNTRIES:
            risk_score += 40
            reasons.append(f'Login from high-risk country: {location["country"]}')
        
        # Check 3: Geographic anomaly (impossible travel)
        previous_locations = SuspiciousLocationDetectionService.get_recent_locations(user)
        if previous_locations:
            last_location = previous_locations[0]
            if last_location.get('latitude') and last_location.get('longitude') and \
               location.get('latitude') and location.get('longitude'):
                
                distance_km = geodesic(
                    (last_location['latitude'], last_location['longitude']),
                    (location['latitude'], location['longitude'])
                ).kilometers
                
                time_diff_hours = (timezone.now() - last_location['timestamp']).total_seconds() / 3600
                max_possible_distance = time_diff_hours * 1000  # Max 1000 km/h
                
                if distance_km > max_possible_distance and time_diff_hours < SuspiciousLocationDetectionService.TIME_WINDOW_HOURS:
                    risk_score += 50
                    reasons.append(f'Impossible travel: {distance_km:.0f}km in {time_diff_hours:.1f} hours')
                
                if distance_km > SuspiciousLocationDetectionService.MAX_DISTANCE_KM:
                    risk_score += 30
                    reasons.append(f'Significant location change: {distance_km:.0f}km')
        
        # Check 4: New country
        user_countries = {loc.get('country_code') for loc in previous_locations if loc.get('country_code')}
        if location['country_code'] not in user_countries and len(user_countries) > 0:
            risk_score += 25
            reasons.append(f'First login from new country: {location["country"]}')
        
        # Check 5: IP reputation
        ip_record = IPGeolocationService.get_ip_record(ip_address)
        if ip_record:
            if ip_record.is_blacklisted:
                risk_score += 60
                reasons.append('IP address is blacklisted')
            elif ip_record.reputation_score < 30:
                risk_score += 20
                reasons.append(f'Low IP reputation: {ip_record.reputation_score}')
        
        is_suspicious = risk_score >= SuspiciousLocationDetectionService.RISK_THRESHOLD
        
        return {
            'is_suspicious': is_suspicious,
            'risk_score': min(100, risk_score),
            'location': location,
            'previous_locations': previous_locations[:5],
            'reason': '; '.join(reasons) if reasons else 'Normal login location'
        }
    
    @staticmethod
    def get_recent_locations(user):
        """Get user's recent login locations from device sessions"""
        recent_sessions = DeviceSession.objects.filter(
            user=user,
            is_active=False
        ).order_by('-created_at')[:10]
        
        locations = []
        for session in recent_sessions:
            ip_record = IPGeolocationService.get_ip_record(session.ip_address)
            if ip_record and ip_record.country:
                locations.append({
                    'country': ip_record.country,
                    'country_code': ip_record.country_code or '',
                    'city': ip_record.city or 'Unknown',
                    'latitude': float(ip_record.latitude) if ip_record.latitude else None,
                    'longitude': float(ip_record.longitude) if ip_record.longitude else None,
                    'timestamp': session.created_at,
                    'ip_address': str(session.ip_address)
                })
        
        return locations
    
    @staticmethod
    @shared_task
    def notify_suspicious_login(user_id, ip_address, location, risk_score):
        """
        Notify farm owner and system admins of suspicious login
        
        Industry-standard: Multi-party notification for security events
        """
        user = User.objects.select_related('profile', 'primary_tenant').get(pk=user_id)
        tenant = user.primary_tenant
        
        if not tenant:
            return
        
        # Notify farm owner
        owner = tenant.owner_user
        if owner and owner.user_id != user.user_id:
            NotificationService.send_notification(
                user_id=owner.user_id,
                notification_type='suspicious_login_detected',
                title='⚠️ Suspicious Login Detected',
                message=(
                    f'User {user.profile.full_name} ({user.email}) attempted to login '
                    f'from suspicious location: {location["city"]}, {location["country"]} '
                    f'(IP: {ip_address}). Risk Score: {risk_score}/100. 2FA enforced.'
                ),
                severity='high'
            )
            
            # Send email
            EmailService.send_email(
                to=owner.email,
                subject='⚠️ Suspicious Login Detected',
                template='suspicious_login_alert',
                context={
                    'user_name': user.profile.full_name,
                    'user_email': user.email,
                    'location': f"{location['city']}, {location['country']}",
                    'ip_address': ip_address,
                    'risk_score': risk_score
                }
            )
        
        # Notify system admins
        super_admins = User.objects.filter(is_super_admin=True, is_active=True)
        for admin in super_admins:
            NotificationService.send_notification(
                user_id=admin.user_id,
                notification_type='suspicious_login_detected',
                title='🔒 System Security Alert',
                message=(
                    f'User {user.profile.full_name} ({user.email}) from tenant '
                    f'"{tenant.organization_name}" attempted login from suspicious location: '
                    f'{location["city"]}, {location["country"]} (IP: {ip_address}). '
                    f'Risk Score: {risk_score}/100.'
                ),
                severity='critical'
            )
        
        # Log security event
        AuditService.log(
            action='suspicious_login_notification_sent',
            user_id=user.user_id,
            tenant_id=tenant.tenant_id,
            details={
                'ip_address': ip_address,
                'location': location,
                'risk_score': risk_score
            }
        )


class IPGeolocationService:
    """
    IP geolocation service
    Supports: MaxMind GeoIP2, ipapi.co, ip-api.com
    """
    
    @staticmethod
    def get_ip_info(ip_address):
        """Get IP geolocation information"""
        cache_key = f"ip_geo:{ip_address}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Try MaxMind GeoIP2 (if available)
        try:
            from maxminddb import open_database
            reader = open_database(settings.MAXMIND_DB_PATH)
            response = reader.get(ip_address)
            if response:
                ip_info = {
                    'country': response.get('country', {}).get('names', {}).get('en', 'Unknown'),
                    'country_code': response.get('country', {}).get('iso_code', ''),
                    'region': response.get('subdivisions', [{}])[0].get('names', {}).get('en', 'Unknown') if response.get('subdivisions') else 'Unknown',
                    'city': response.get('city', {}).get('names', {}).get('en', 'Unknown'),
                    'latitude': response.get('location', {}).get('latitude'),
                    'longitude': response.get('location', {}).get('longitude'),
                    'isp': response.get('traits', {}).get('isp', 'Unknown'),
                    'is_vpn': response.get('traits', {}).get('is_anonymous_vpn', False),
                    'is_proxy': response.get('traits', {}).get('is_anonymous_proxy', False),
                    'is_tor': response.get('traits', {}).get('is_tor_exit_node', False)
                }
                cache.set(cache_key, ip_info, 86400)  # 24 hours
                return ip_info
        except Exception:
            pass
        
        # Fallback to ipapi.co
        try:
            response = requests.get(f'https://ipapi.co/{ip_address}/json/', timeout=5)
            if response.status_code == 200:
                data = response.json()
                ip_info = {
                    'country': data.get('country_name', 'Unknown'),
                    'country_code': data.get('country_code', ''),
                    'region': data.get('region', 'Unknown'),
                    'city': data.get('city', 'Unknown'),
                    'latitude': data.get('latitude'),
                    'longitude': data.get('longitude'),
                    'isp': data.get('org', 'Unknown'),
                    'is_vpn': data.get('vpn', False),
                    'is_proxy': data.get('proxy', False),
                    'is_tor': False
                }
                cache.set(cache_key, ip_info, 86400)
                return ip_info
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def update_ip_record(ip_address, ip_info):
        """Update or create IP address record with geolocation"""
        if not ip_info:
            return
        
        ip_record, created = IPAddress.objects.get_or_create(
            ip_address=ip_address,
            defaults={
                'country': ip_info.get('country', ''),
                'country_code': ip_info.get('country_code', ''),
                'region': ip_info.get('region', ''),
                'city': ip_info.get('city', ''),
                'latitude': ip_info.get('latitude'),
                'longitude': ip_info.get('longitude'),
                'isp': ip_info.get('isp', ''),
                'is_vpn': ip_info.get('is_vpn', False),
                'is_proxy': ip_info.get('is_proxy', False),
                'is_tor': ip_info.get('is_tor', False)
            }
        )
        
        if not created:
            ip_record.country = ip_info.get('country', ip_record.country)
            ip_record.country_code = ip_info.get('country_code', ip_record.country_code)
            ip_record.region = ip_info.get('region', ip_record.region)
            ip_record.city = ip_info.get('city', ip_record.city)
            ip_record.latitude = ip_info.get('latitude', ip_record.latitude)
            ip_record.longitude = ip_info.get('longitude', ip_record.longitude)
            ip_record.isp = ip_info.get('isp', ip_record.isp)
            ip_record.is_vpn = ip_info.get('is_vpn', ip_record.is_vpn)
            ip_record.is_proxy = ip_info.get('is_proxy', ip_record.is_proxy)
            ip_record.is_tor = ip_info.get('is_tor', ip_record.is_tor)
            ip_record.last_seen_at = timezone.now()
            ip_record.save()
        
        return ip_record
    
    @staticmethod
    def get_ip_record(ip_address):
        """Get IP address record from database"""
        try:
            return IPAddress.objects.get(ip_address=ip_address)
        except IPAddress.DoesNotExist:
            return None
```

---

### 2. Subscriptions App

**Purpose**: Subscription and billing management with payment gateway integration.

#### Models

**SubscriptionPlan**
```python
class SubscriptionPlan(BaseModel):
    """Available subscription plans"""
    plan_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    billing_period = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ])
    
    # Limits
    max_users = models.IntegerField()
    max_farms = models.IntegerField()
    max_animals = models.IntegerField()
    storage_limit = models.BigIntegerField()  # bytes
    
    # Features
    features = models.JSONField(default=list)  # List of feature slugs
    
    # Status
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    
    # Trial
    trial_days = models.IntegerField(default=14)
    
    class Meta:
        db_table = 'subscription_plans'
        indexes = [
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.price} {self.currency}/{self.billing_period}"
```

**Subscription**
```python
class Subscription(BaseModel):
    """Tenant subscription"""
    subscription_id = models.AutoField(primary_key=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('trial', 'Trial'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('cancelled', 'Cancelled'),
        ('suspended', 'Suspended'),
    ])
    
    # Dates
    start_date = models.DateTimeField()
    trial_end_date = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Billing
    next_billing_date = models.DateTimeField()
    last_billing_date = models.DateTimeField(null=True, blank=True)
    
    # Payment
    payment_method = models.ForeignKey('PaymentMethod', on_delete=models.SET_NULL, null=True, blank=True)
    
    # External references (Stripe, PayPal, etc.)
    external_subscription_id = models.CharField(max_length=255, blank=True)
    external_customer_id = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'subscriptions'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['next_billing_date']),
        ]
```

**Continue in next file...**

