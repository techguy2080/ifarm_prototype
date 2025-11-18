# iFarm Database Schema - Part 5: Audit, Analytics, Notifications, Devices & Subscriptions

## Audit & Analytics Tables

### 44. audit_logs

**Purpose**: Comprehensive audit trail for compliance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | SERIAL | PRIMARY KEY | Unique log identifier |
| user_id | INTEGER | FK → users(user_id) | User performing action |
| acting_as_user_id | INTEGER | FK → users(user_id) | If delegated |
| tenant_id | INTEGER | FK → tenants(tenant_id) | Tenant context |
| farm_id | INTEGER | FK → farms(farm_id) | Farm context |
| action | VARCHAR(100) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NULL | Entity type |
| entity_id | INTEGER | NULL | Entity ID |
| description | TEXT | NULL | Action description |
| details | JSONB | DEFAULT '{}' | Before/after data |
| ip_address | INET | NULL | Request IP |
| user_agent | TEXT | NULL | Browser/client info |
| request_path | VARCHAR(500) | NULL | API endpoint |
| request_method | VARCHAR(10) | NULL | HTTP method |
| device_id | INTEGER | FK → devices(device_id) | Device used |
| permission_used | VARCHAR(100) | NULL | Permission checked |
| delegation_id | INTEGER | FK → delegations(delegation_id) | Delegation used |
| policy_evaluated | JSONB | NULL | Policy evaluation result |
| success | BOOLEAN | DEFAULT TRUE | Action success |
| error_message | TEXT | NULL | Error if failed |
| checksum | VARCHAR(64) | NULL | SHA-256 integrity hash |
| created_at | TIMESTAMP | NOT NULL | Log timestamp |

**Indexes:**
```sql
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at);
CREATE INDEX idx_audit_logs_action_created ON audit_logs(action, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address);
```

---

### 45. audit_log_archive

**Purpose**: Long-term audit log retention

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| archive_id | SERIAL | PRIMARY KEY | Unique archive identifier |
| original_log_id | BIGINT | NOT NULL | Original log ID |
| log_data | JSONB | NOT NULL | Compressed log data |
| archived_at | TIMESTAMP | NOT NULL | Archive timestamp |
| retention_until | TIMESTAMP | NOT NULL | Retention expiry (7 years) |
| created_at | TIMESTAMP | NOT NULL | Record creation |

**Indexes:**
```sql
CREATE INDEX idx_audit_archive_original ON audit_log_archive(original_log_id);
CREATE INDEX idx_audit_archive_archived ON audit_log_archive(archived_at);
CREATE INDEX idx_audit_archive_retention ON audit_log_archive(retention_until);
```

---

### 46. analytics_cache

**Purpose**: Cached analytics data for performance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| cache_id | SERIAL | PRIMARY KEY | Unique cache identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| farm_id | INTEGER | FK → farms(farm_id) | Farm reference |
| metric_type | VARCHAR(100) | NOT NULL | Metric type |
| metric_period | VARCHAR(50) | NOT NULL | Period (daily, monthly, yearly) |
| period_start | DATE | NOT NULL | Period start |
| period_end | DATE | NOT NULL | Period end |
| data | JSONB | NOT NULL | Cached data |
| calculated_at | TIMESTAMP | NOT NULL | Calculation timestamp |
| expires_at | TIMESTAMP | NOT NULL | Cache expiry |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_analytics_cache_tenant_metric ON analytics_cache(tenant_id, metric_type, period_start);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);
```

---

### 47. reports

**Purpose**: Generated report records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| report_id | SERIAL | PRIMARY KEY | Unique report identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| report_type | VARCHAR(100) | NOT NULL | Report type |
| parameters | JSONB | DEFAULT '{}' | Report parameters |
| file_url | VARCHAR(500) | NULL | Generated file URL |
| file_format | VARCHAR(20) | NOT NULL | PDF, Excel, CSV |
| status | VARCHAR(20) | DEFAULT 'pending' | Generation status |
| generated_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | Generator |
| generated_at | TIMESTAMP | NULL | Generation completion |
| error_message | TEXT | NULL | Error if failed |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_reports_tenant_type_created ON reports(tenant_id, report_type, created_at);
CREATE INDEX idx_reports_user ON reports(generated_by_user_id);
```

**Constraints:**
```sql
ALTER TABLE reports ADD CONSTRAINT reports_type_check 
  CHECK (report_type IN ('financial', 'production', 'health', 'breeding', 'inventory'));

ALTER TABLE reports ADD CONSTRAINT reports_format_check 
  CHECK (file_format IN ('pdf', 'xlsx', 'csv'));

ALTER TABLE reports ADD CONSTRAINT reports_status_check 
  CHECK (status IN ('pending', 'generating', 'completed', 'failed'));
```

---

## Notification Tables

### 48. notifications

**Purpose**: Multi-channel notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | SERIAL | PRIMARY KEY | Unique notification identifier |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | Recipient |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| notification_type | VARCHAR(100) | NOT NULL | Notification type |
| channel | VARCHAR(20) | NOT NULL | Delivery channel |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| link | VARCHAR(500) | NULL | Action link |
| status | VARCHAR(20) | DEFAULT 'pending' | Notification status |
| sent_at | TIMESTAMP | NULL | Send timestamp |
| read_at | TIMESTAMP | NULL | Read timestamp |
| retry_count | INTEGER | DEFAULT 0 | Retry attempts |
| error_message | TEXT | NULL | Error if failed |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_notifications_user_status_created ON notifications(user_id, status, created_at);
CREATE INDEX idx_notifications_tenant_status ON notifications(tenant_id, status);
CREATE INDEX idx_notifications_status_sent ON notifications(status, sent_at);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
```

**Constraints:**
```sql
ALTER TABLE notifications ADD CONSTRAINT notifications_channel_check 
  CHECK (channel IN ('email', 'sms', 'push', 'in_app'));

ALTER TABLE notifications ADD CONSTRAINT notifications_status_check 
  CHECK (status IN ('pending', 'sent', 'failed', 'read'));
```

---

### 49. notification_preferences

**Purpose**: User notification preferences

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INTEGER | PRIMARY KEY, FK → users(user_id) | User reference |
| email_enabled | BOOLEAN | DEFAULT TRUE | Email notifications |
| sms_enabled | BOOLEAN | DEFAULT FALSE | SMS notifications |
| push_enabled | BOOLEAN | DEFAULT TRUE | Push notifications |
| in_app_enabled | BOOLEAN | DEFAULT TRUE | In-app notifications |
| preferences | JSONB | DEFAULT '{}' | Detailed preferences |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

---

## Device & Security Tables

### 50. devices

**Purpose**: Track user devices for security

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| device_id | SERIAL | PRIMARY KEY | Unique device identifier |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User reference |
| tenant_id | INTEGER | FK → tenants(tenant_id) | Tenant reference |
| fingerprint | VARCHAR(255) | UNIQUE, NOT NULL | Device fingerprint |
| device_name | VARCHAR(200) | NULL | Device name |
| device_type | VARCHAR(50) | NOT NULL | Device type |
| os | VARCHAR(100) | NULL | Operating system |
| os_version | VARCHAR(50) | NULL | OS version |
| browser | VARCHAR(100) | NULL | Browser |
| browser_version | VARCHAR(50) | NULL | Browser version |
| user_agent | TEXT | NOT NULL | Full user agent |
| last_ip | INET | NULL | Last IP address |
| last_seen_at | TIMESTAMP | NOT NULL | Last activity |
| is_trusted | BOOLEAN | DEFAULT FALSE | Trusted device flag |
| is_blocked | BOOLEAN | DEFAULT FALSE | Blocked flag |
| blocked_reason | TEXT | NULL | Block reason |
| blocked_at | TIMESTAMP | NULL | Block timestamp |
| total_requests | INTEGER | DEFAULT 0 | Request count |
| failed_login_attempts | INTEGER | DEFAULT 0 | Failed login count |
| last_failed_login | TIMESTAMP | NULL | Last failed login |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_devices_user_fingerprint ON devices(user_id, fingerprint);
CREATE UNIQUE INDEX idx_devices_fingerprint ON devices(fingerprint);
CREATE INDEX idx_devices_tenant ON devices(tenant_id);
CREATE INDEX idx_devices_tenant_blocked ON devices(tenant_id, is_blocked);
CREATE INDEX idx_devices_blocked ON devices(is_blocked);
CREATE INDEX idx_devices_user_last_seen ON devices(user_id, last_seen_at);
```

**Constraints:**
```sql
ALTER TABLE devices ADD CONSTRAINT devices_type_check 
  CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'other'));
```

---

### 51. device_sessions

**Purpose**: Track individual device sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | SERIAL | PRIMARY KEY | Unique session identifier |
| device_id | INTEGER | NOT NULL, FK → devices(device_id) | Device reference |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User reference |
| tenant_id | INTEGER | FK → tenants(tenant_id) | Tenant reference |
| ip_address | INET | NOT NULL | Session IP |
| session_token | VARCHAR(255) | UNIQUE, NOT NULL | Session token |
| started_at | TIMESTAMP | NOT NULL | Session start |
| last_activity_at | TIMESTAMP | NOT NULL | Last activity |
| ended_at | TIMESTAMP | NULL | Session end |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| request_count | INTEGER | DEFAULT 0 | Request count |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_device_sessions_device_active ON device_sessions(device_id, is_active);
CREATE INDEX idx_device_sessions_user_active ON device_sessions(user_id, is_active);
CREATE INDEX idx_device_sessions_tenant_active ON device_sessions(tenant_id, is_active);
CREATE UNIQUE INDEX idx_device_sessions_token ON device_sessions(session_token);
```

---

### 52. ip_addresses

**Purpose**: IP address reputation tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ip_id | SERIAL | PRIMARY KEY | Unique IP identifier |
| ip_address | INET | UNIQUE, NOT NULL | IP address |
| country | VARCHAR(100) | NULL | Country |
| country_code | VARCHAR(2) | NULL | ISO 3166-1 alpha-2 country code (e.g., 'UG', 'US') |
| region | VARCHAR(100) | NULL | Region |
| city | VARCHAR(100) | NULL | City |
| latitude | DECIMAL(9,6) | NULL | GPS latitude |
| longitude | DECIMAL(9,6) | NULL | GPS longitude |
| isp | VARCHAR(200) | NULL | ISP name |
| organization | VARCHAR(200) | NULL | Organization |
| is_vpn | BOOLEAN | DEFAULT FALSE | VPN flag |
| is_proxy | BOOLEAN | DEFAULT FALSE | Proxy flag |
| is_tor | BOOLEAN | DEFAULT FALSE | Tor flag |
| is_datacenter | BOOLEAN | DEFAULT FALSE | Datacenter flag |
| is_bot | BOOLEAN | DEFAULT FALSE | Bot flag |
| reputation_score | INTEGER | DEFAULT 50 | Reputation (0-100) |
| is_blacklisted | BOOLEAN | DEFAULT FALSE | Blacklist flag |
| blacklist_reason | TEXT | NULL | Blacklist reason |
| total_requests | INTEGER | DEFAULT 0 | Request count |
| failed_login_attempts | INTEGER | DEFAULT 0 | Failed logins |
| abuse_reports | INTEGER | DEFAULT 0 | Abuse count |
| last_seen_at | TIMESTAMP | NOT NULL | Last seen |
| first_seen_at | TIMESTAMP | NOT NULL | First seen |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_ip_addresses_ip ON ip_addresses(ip_address);
CREATE INDEX idx_ip_addresses_blacklisted ON ip_addresses(is_blacklisted);
CREATE INDEX idx_ip_addresses_reputation ON ip_addresses(reputation_score);
CREATE INDEX idx_ip_addresses_country ON ip_addresses(country);
CREATE INDEX idx_ip_addresses_country_code ON ip_addresses(country_code);  -- For suspicious location detection
```

---

### 53. abuse_logs

**Purpose**: Security violation logging

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | SERIAL | PRIMARY KEY | Unique log identifier |
| user_id | INTEGER | FK → users(user_id) | User involved |
| tenant_id | INTEGER | FK → tenants(tenant_id) | Tenant reference |
| device_id | INTEGER | FK → devices(device_id) | Device used |
| ip_address_id | INTEGER | FK → ip_addresses(ip_id) | IP address |
| abuse_type | VARCHAR(50) | NOT NULL | Abuse type |
| severity | VARCHAR(20) | NOT NULL | Severity level |
| description | TEXT | NOT NULL | Incident description |
| request_path | VARCHAR(500) | NULL | Request path |
| request_method | VARCHAR(10) | NULL | HTTP method |
| request_data | JSONB | NULL | Request data |
| user_agent | TEXT | NULL | User agent |
| action_taken | VARCHAR(50) | NOT NULL | Action taken |
| created_at | TIMESTAMP | NOT NULL | Incident timestamp |

**Indexes:**
```sql
CREATE INDEX idx_abuse_logs_user_created ON abuse_logs(user_id, created_at);
CREATE INDEX idx_abuse_logs_tenant_created ON abuse_logs(tenant_id, created_at);
CREATE INDEX idx_abuse_logs_type_severity ON abuse_logs(abuse_type, severity);
CREATE INDEX idx_abuse_logs_created ON abuse_logs(created_at);
CREATE INDEX idx_abuse_logs_ip ON abuse_logs(ip_address_id);
```

**Constraints:**
```sql
ALTER TABLE abuse_logs ADD CONSTRAINT abuse_logs_type_check 
  CHECK (abuse_type IN ('brute_force', 'rate_limit', 'suspicious_activity', 
                        'invalid_token', 'unauthorized_access', 'multiple_failed_logins', 'bot_detected'));

ALTER TABLE abuse_logs ADD CONSTRAINT abuse_logs_severity_check 
  CHECK (severity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE abuse_logs ADD CONSTRAINT abuse_logs_action_check 
  CHECK (action_taken IN ('logged', 'warning', 'blocked', 'account_locked', 'ip_banned'));
```

---

### 54. rate_limit_rules

**Purpose**: Configurable rate limiting rules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| rule_id | SERIAL | PRIMARY KEY | Unique rule identifier |
| name | VARCHAR(200) | NOT NULL | Rule name |
| description | TEXT | NULL | Rule description |
| endpoint_pattern | VARCHAR(500) | NOT NULL | Endpoint pattern |
| method | VARCHAR(10) | NULL | HTTP method (empty = all) |
| requests_per_minute | INTEGER | DEFAULT 60 | Per-minute limit |
| requests_per_hour | INTEGER | DEFAULT 1000 | Per-hour limit |
| requests_per_day | INTEGER | DEFAULT 10000 | Per-day limit |
| scope | VARCHAR(20) | NOT NULL | Scope |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_rate_limit_rules_active ON rate_limit_rules(is_active);
CREATE INDEX idx_rate_limit_rules_endpoint ON rate_limit_rules(endpoint_pattern);
```

**Constraints:**
```sql
ALTER TABLE rate_limit_rules ADD CONSTRAINT rate_limit_scope_check 
  CHECK (scope IN ('global', 'per_user', 'per_ip', 'per_tenant'));
```

---

### 55. security_alerts

**Purpose**: Real-time security alerts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| alert_id | SERIAL | PRIMARY KEY | Unique alert identifier |
| alert_type | VARCHAR(50) | NOT NULL | Alert type |
| severity | VARCHAR(20) | NOT NULL | Severity level |
| title | VARCHAR(200) | NOT NULL | Alert title |
| message | TEXT | NOT NULL | Alert message |
| user_id | INTEGER | FK → users(user_id) | Related user |
| tenant_id | INTEGER | FK → tenants(tenant_id) | Related tenant |
| device_id | INTEGER | FK → devices(device_id) | Related device |
| is_resolved | BOOLEAN | DEFAULT FALSE | Resolution status |
| resolved_at | TIMESTAMP | NULL | Resolution time |
| resolved_by_user_id | INTEGER | FK → users(user_id) | Resolver |
| created_at | TIMESTAMP | NOT NULL | Alert timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_security_alerts_severity_resolved ON security_alerts(severity, is_resolved);
CREATE INDEX idx_security_alerts_created ON security_alerts(created_at);
CREATE INDEX idx_security_alerts_user ON security_alerts(user_id);
```

**Constraints:**
```sql
ALTER TABLE security_alerts ADD CONSTRAINT security_alerts_severity_check 
  CHECK (severity IN ('info', 'warning', 'critical'));
```

---

## Subscription & Billing Tables

### 56. subscription_plans

**Purpose**: Available subscription plans

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| plan_id | SERIAL | PRIMARY KEY | Unique plan identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Plan name (code) |
| display_name | VARCHAR(200) | NOT NULL | Display name |
| description | TEXT | NOT NULL | Plan description |
| price | DECIMAL(10,2) | NOT NULL | Price |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| billing_period | VARCHAR(20) | NOT NULL | Billing period |
| max_users | INTEGER | NOT NULL | User limit |
| max_farms | INTEGER | NOT NULL | Farm limit |
| max_animals | INTEGER | NOT NULL | Animal limit |
| storage_limit | BIGINT | NOT NULL | Storage limit (bytes) |
| features | JSONB | DEFAULT '[]' | Feature list |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| is_popular | BOOLEAN | DEFAULT FALSE | Popular badge |
| trial_days | INTEGER | DEFAULT 14 | Trial period |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
```

**Constraints:**
```sql
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_billing_check 
  CHECK (billing_period IN ('monthly', 'quarterly', 'yearly'));
```

---

### 57. subscriptions

**Purpose**: Tenant subscriptions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| subscription_id | SERIAL | PRIMARY KEY | Unique subscription identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| plan_id | INTEGER | NOT NULL, FK → subscription_plans(plan_id) | Plan reference |
| status | VARCHAR(20) | NOT NULL | Subscription status |
| start_date | TIMESTAMP | NOT NULL | Start date |
| trial_end_date | TIMESTAMP | NULL | Trial end |
| current_period_start | TIMESTAMP | NOT NULL | Current period start |
| current_period_end | TIMESTAMP | NOT NULL | Current period end |
| cancelled_at | TIMESTAMP | NULL | Cancellation time |
| next_billing_date | TIMESTAMP | NOT NULL | Next billing |
| last_billing_date | TIMESTAMP | NULL | Last billing |
| payment_method_id | INTEGER | FK → payment_methods(payment_method_id) | Payment method |
| external_subscription_id | VARCHAR(255) | NULL | Stripe/PayPal ID |
| external_customer_id | VARCHAR(255) | NULL | External customer ID |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_subscriptions_tenant_status ON subscriptions(tenant_id, status);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
```

**Constraints:**
```sql
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
  CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'suspended'));
```

---

### 58. subscription_invoices

**Purpose**: Subscription billing invoices

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| invoice_id | SERIAL | PRIMARY KEY | Unique invoice identifier |
| subscription_id | INTEGER | NOT NULL, FK → subscriptions(subscription_id) | Subscription reference |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL | Invoice number |
| subtotal | DECIMAL(12,2) | NOT NULL | Subtotal |
| tax_amount | DECIMAL(12,2) | DEFAULT 0 | Tax amount |
| discount_amount | DECIMAL(12,2) | DEFAULT 0 | Discount |
| total_amount | DECIMAL(12,2) | NOT NULL | Total amount |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| invoice_date | TIMESTAMP | NOT NULL | Invoice date |
| due_date | TIMESTAMP | NOT NULL | Due date |
| period_start | TIMESTAMP | NOT NULL | Billing period start |
| period_end | TIMESTAMP | NOT NULL | Billing period end |
| status | VARCHAR(20) | NOT NULL | Invoice status |
| paid_at | TIMESTAMP | NULL | Payment timestamp |
| payment_method_id | INTEGER | FK → payment_methods(payment_method_id) | Payment method |
| external_invoice_id | VARCHAR(255) | NULL | Stripe invoice ID |
| pdf_url | VARCHAR(500) | NULL | PDF URL |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_subscription_invoices_number ON subscription_invoices(invoice_number);
CREATE INDEX idx_subscription_invoices_tenant ON subscription_invoices(tenant_id);
CREATE INDEX idx_subscription_invoices_status_due ON subscription_invoices(status, due_date);
```

**Constraints:**
```sql
ALTER TABLE subscription_invoices ADD CONSTRAINT subscription_invoices_status_check 
  CHECK (status IN ('draft', 'pending', 'paid', 'failed', 'refunded'));
```

---

### 59. payments

**Purpose**: Payment transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| payment_id | SERIAL | PRIMARY KEY | Unique payment identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| invoice_id | INTEGER | FK → subscription_invoices(invoice_id) | Invoice reference |
| amount | DECIMAL(12,2) | NOT NULL | Payment amount |
| currency | VARCHAR(3) | DEFAULT 'UGX' | Currency |
| payment_method | VARCHAR(50) | NOT NULL | Payment method |
| status | VARCHAR(20) | NOT NULL | Payment status |
| idempotency_key | VARCHAR(255) | UNIQUE, NOT NULL | Idempotency key |
| external_payment_id | VARCHAR(255) | NULL | Gateway payment ID |
| gateway | VARCHAR(50) | NULL | Payment gateway |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| failure_reason | TEXT | NULL | Failure reason |
| succeeded_at | TIMESTAMP | NULL | Success timestamp |
| failed_at | TIMESTAMP | NULL | Failure timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_payments_tenant_status ON payments(tenant_id, status);
CREATE UNIQUE INDEX idx_payments_idempotency ON payments(idempotency_key);
CREATE INDEX idx_payments_external_id ON payments(external_payment_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
```

**Constraints:**
```sql
ALTER TABLE payments ADD CONSTRAINT payments_method_check 
  CHECK (payment_method IN ('card', 'bank_transfer', 'mobile_money', 'paypal'));

ALTER TABLE payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'));
```

---

### 60. payment_methods

**Purpose**: Stored payment methods

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| payment_method_id | SERIAL | PRIMARY KEY | Unique payment method identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| method_type | VARCHAR(50) | NOT NULL | Method type |
| card_last4 | VARCHAR(4) | NULL | Card last 4 digits |
| card_brand | VARCHAR(20) | NULL | Card brand |
| card_exp_month | INTEGER | NULL | Expiry month |
| card_exp_year | INTEGER | NULL | Expiry year |
| bank_name | VARCHAR(200) | NULL | Bank name |
| account_last4 | VARCHAR(4) | NULL | Account last 4 digits |
| mobile_number | VARCHAR(20) | NULL | Mobile number |
| mobile_provider | VARCHAR(50) | NULL | Mobile provider |
| is_default | BOOLEAN | DEFAULT FALSE | Default method |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| external_payment_method_id | VARCHAR(255) | NULL | Stripe payment method ID |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_payment_methods_tenant_default ON payment_methods(tenant_id, is_default);
CREATE INDEX idx_payment_methods_tenant_active ON payment_methods(tenant_id, is_active);
```

**Constraints:**
```sql
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_type_check 
  CHECK (method_type IN ('card', 'bank_account', 'mobile_money'));
```

---

### 61. usage_logs

**Purpose**: Usage tracking for billing

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | SERIAL | PRIMARY KEY | Unique log identifier |
| tenant_id | INTEGER | NOT NULL, FK → tenants(tenant_id) | Tenant reference |
| metric_type | VARCHAR(50) | NOT NULL | Metric type |
| metric_value | DECIMAL(15,2) | NOT NULL | Metric value |
| unit | VARCHAR(50) | NOT NULL | Unit of measure |
| period_start | TIMESTAMP | NOT NULL | Period start |
| period_end | TIMESTAMP | NOT NULL | Period end |
| is_billable | BOOLEAN | DEFAULT FALSE | Billable flag |
| billed_in_invoice_id | INTEGER | FK → subscription_invoices(invoice_id) | Invoice reference |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
```sql
CREATE INDEX idx_usage_logs_tenant_metric_period ON usage_logs(tenant_id, metric_type, period_start);
CREATE INDEX idx_usage_logs_billable ON usage_logs(is_billable);
```

**Constraints:**
```sql
ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_metric_check 
  CHECK (metric_type IN ('api_requests', 'storage', 'users', 'animals', 'farms'));
```

---

## Database Schema Summary

**Total Tables**: 61

**By Category:**
- Core Infrastructure: 2 (tenants, users)
- Authentication & Users: 5 (profiles, user_sessions, user_tenants, identity_providers, user_farms)
- Permissions: 9 (permissions, role_templates, roles, policies, user_roles, and junction tables)
- Farms & Animals: 3 (farms, animals, animal_history)
- Production & Veterinary: 7 (production, daily_production_summary, health_checks, vaccinations, treatments, weight_records, deworming)
- Breeding & External: 5 (breeding_records, breeding_offspring, external_farms, external_animals, hire agreements)
- Financial: 7 (expenses, expense_history, animal_sales, product_sales, sales_invoices, line_items, purchase_invoices)
- Inventory: 2 (inventory_items, inventory_movements)
- Activities: 3 (activities, weaning_records, disposal_records)
- Media: 1 (media_files)
- Invitations & Delegations: 2 (invitations, delegations)
- Audit & Analytics: 4 (audit_logs, audit_log_archive, analytics_cache, reports)
- Notifications: 2 (notifications, notification_preferences)
- Devices & Security: 6 (devices, device_sessions, ip_addresses, abuse_logs, rate_limit_rules, security_alerts)
- Subscriptions & Billing: 6 (subscription_plans, subscriptions, subscription_invoices, payments, payment_methods, usage_logs)

---

**End of Database Schema Documentation**

