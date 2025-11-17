# iFarm Backend Plan - Part 4: More Domain Apps & Financial System

## Domain-Specific Apps (Continued)

### 5. Breeding App

**Purpose**: Breeding records and pregnancy tracking.

#### Models

**BreedingRecord**
```python
class BreedingRecord(FarmModel):
    """Breeding and pregnancy tracking"""
    breeding_id = models.AutoField(primary_key=True)
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, related_name='breeding_records')  # Female
    
    # Sire information
    sire_source = models.CharField(max_length=20, choices=[
        ('internal', 'Internal'),
        ('external', 'External'),
    ])
    sire = models.ForeignKey('animals.Animal', on_delete=models.SET_NULL, null=True, blank=True, related_name='breeding_records_as_sire')
    external_animal = models.ForeignKey('external_farms.ExternalAnimal', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Quick reference for external
    external_farm_name = models.CharField(max_length=200, blank=True)
    external_animal_tag = models.CharField(max_length=100, blank=True)
    
    # Hire agreements
    animal_hire_agreement = models.ForeignKey('external_farms.AnimalHireAgreement', on_delete=models.SET_NULL, null=True, blank=True, related_name='breeding_records_hire_out')
    external_animal_hire_agreement = models.ForeignKey('external_farms.ExternalAnimalHireAgreement', on_delete=models.SET_NULL, null=True, blank=True, related_name='breeding_records_hire_in')
    
    # Breeding details
    breeding_date = models.DateField()
    breeding_method = models.CharField(max_length=50, choices=[
        ('natural', 'Natural'),
        ('artificial_insemination', 'Artificial Insemination'),
        ('embryo_transfer', 'Embryo Transfer'),
    ], default='natural')
    
    # Pregnancy tracking
    conception_date = models.DateField(null=True, blank=True)
    expected_due_date = models.DateField(null=True, blank=True)
    actual_birth_date = models.DateField(null=True, blank=True)
    
    birth_outcome = models.CharField(max_length=20, choices=[
        ('successful', 'Successful'),
        ('stillborn', 'Stillborn'),
        ('aborted', 'Aborted'),
        ('complications', 'Complications'),
    ], blank=True)
    
    offspring_count = models.IntegerField(default=0)
    complications = models.TextField(blank=True)
    
    pregnancy_status = models.CharField(max_length=20, choices=[
        ('suspected', 'Suspected'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='suspected')
    
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='breeding_records')
    
    class Meta:
        db_table = 'breeding_records'
        indexes = [
            models.Index(fields=['animal', 'breeding_date']),
            models.Index(fields=['tenant', 'farm', 'pregnancy_status']),
            models.Index(fields=['expected_due_date']),
            models.Index(fields=['sire_source']),
        ]
    
    def __str__(self):
        return f"{self.animal.tag_number} - {self.breeding_date}"
```

**BreedingOffspring**
```python
class BreedingOffspring(BaseModel):
    """Link breeding records to offspring"""
    breeding_record = models.ForeignKey(BreedingRecord, on_delete=models.CASCADE, related_name='offspring_links')
    offspring = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, related_name='birth_record')
    birth_order = models.IntegerField(default=1)  # For twins, triplets
    birth_weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'breeding_offspring'
        unique_together = [('breeding_record', 'offspring')]
```

---

### 6. Financial App (with Approval Workflow)

**Purpose**: Financial management with expense approval workflow and invoicing.

#### Models

**Expense**
```python
class Expense(FarmModel):
    """Expense records with approval workflow"""
    expense_id = models.AutoField(primary_key=True)
    
    expense_type = models.CharField(max_length=50, choices=[
        ('feed', 'Feed'),
        ('medicine', 'Medicine'),
        ('labor', 'Labor'),
        ('equipment', 'Equipment'),
        ('utilities', 'Utilities'),
        ('transport', 'Transport'),
        ('veterinary', 'Veterinary'),
        ('animal_hire', 'Animal Hire'),
        ('other', 'Other'),
    ])
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    description = models.TextField()
    expense_date = models.DateField()
    
    # Vendor info
    vendor = models.CharField(max_length=200, blank=True)
    vendor_contact = models.CharField(max_length=100, blank=True)
    
    # Documentation
    receipt_url = models.URLField(blank=True)
    invoice = models.ForeignKey('PurchaseInvoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    
    # Links
    related_activity = models.ForeignKey('activities.Activity', on_delete=models.SET_NULL, null=True, blank=True)
    external_animal_hire_agreement = models.ForeignKey('external_farms.ExternalAnimalHireAgreement', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Approval workflow
    approval_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='pending')
    
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Submitter
    recorded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='expenses_recorded')
    
    class Meta:
        db_table = 'expenses'
        indexes = [
            models.Index(fields=['tenant', 'farm', 'expense_date']),
            models.Index(fields=['approval_status', 'recorded_by']),
            models.Index(fields=['expense_type', 'expense_date']),
        ]
    
    def __str__(self):
        return f"{self.expense_type} - {self.amount} {self.currency} - {self.expense_date}"
```

**ExpenseHistory**
```python
class ExpenseHistory(BaseModel):
    """Track expense changes"""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='history')
    data = models.JSONField()
    changed_fields = models.JSONField(default=list)
    changed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    change_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'expense_history'
        indexes = [
            models.Index(fields=['expense', 'created_at']),
        ]
```

**AnimalSale**
```python
class AnimalSale(FarmModel):
    """Animal sale records"""
    sale_id = models.AutoField(primary_key=True)
    animal = models.ForeignKey('animals.Animal', on_delete=models.PROTECT, related_name='sales')
    
    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    sale_date = models.DateField()
    
    # Buyer info
    buyer_name = models.CharField(max_length=200, blank=True)
    buyer_contact = models.CharField(max_length=100, blank=True)
    buyer_address = models.TextField(blank=True)
    
    # Payment
    payment_method = models.CharField(max_length=50, choices=[
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('check', 'Check'),
    ], default='cash')
    
    payment_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
    ], default='pending')
    
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Documentation
    receipt_url = models.URLField(blank=True)
    invoice = models.ForeignKey('SalesInvoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='animal_sales')
    
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='animal_sales_recorded')
    
    class Meta:
        db_table = 'animal_sales'
        indexes = [
            models.Index(fields=['tenant', 'farm', 'sale_date']),
            models.Index(fields=['payment_status']),
        ]
```

**ProductSale**
```python
class ProductSale(FarmModel):
    """Product sale records (milk, eggs, etc.)"""
    product_sale_id = models.AutoField(primary_key=True)
    
    product_type = models.CharField(max_length=50, choices=[
        ('milk', 'Milk'),
        ('eggs', 'Eggs'),
        ('wool', 'Wool'),
        ('honey', 'Honey'),
        ('meat', 'Meat'),
        ('other', 'Other'),
    ])
    
    animal = models.ForeignKey('animals.Animal', on_delete=models.SET_NULL, null=True, blank=True, related_name='product_sales')
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=[
        ('liters', 'Liters'),
        ('kg', 'Kilograms'),
        ('pieces', 'Pieces'),
        ('dozen', 'Dozen'),
    ])
    
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    sale_date = models.DateField()
    
    # Customer info
    customer_name = models.CharField(max_length=200, blank=True)
    customer_contact = models.CharField(max_length=100, blank=True)
    
    # Payment
    payment_method = models.CharField(max_length=50, choices=[
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('check', 'Check'),
    ], default='cash')
    
    payment_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
    ], default='paid')
    
    # Documentation
    invoice = models.ForeignKey('SalesInvoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='product_sales')
    
    recorded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='product_sales_recorded')
    
    class Meta:
        db_table = 'product_sales'
        indexes = [
            models.Index(fields=['tenant', 'farm', 'sale_date']),
            models.Index(fields=['product_type', 'sale_date']),
        ]
```

**SalesInvoice**
```python
class SalesInvoice(TenantModel):
    """Sales invoices for customers"""
    invoice_id = models.AutoField(primary_key=True)
    invoice_number = models.CharField(max_length=50, unique=True)
    
    # Customer
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=50, blank=True)
    customer_address = models.TextField(blank=True)
    
    # Invoice details
    invoice_date = models.DateField()
    due_date = models.DateField()
    
    # Amounts
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ], default='draft')
    
    # Payments
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # PDF
    pdf_url = models.URLField(blank=True)
    
    notes = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='invoices_created')
    
    class Meta:
        db_table = 'sales_invoices'
        indexes = [
            models.Index(fields=['tenant', 'invoice_number']),
            models.Index(fields=['status', 'due_date']),
        ]
    
    def __str__(self):
        return f"INV-{self.invoice_number} - {self.customer_name}"
```

**InvoiceLineItem**
```python
class InvoiceLineItem(BaseModel):
    """Line items for invoices"""
    invoice = models.ForeignKey(SalesInvoice, on_delete=models.CASCADE, related_name='line_items')
    
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Links to sales
    animal_sale = models.ForeignKey(AnimalSale, on_delete=models.SET_NULL, null=True, blank=True)
    product_sale = models.ForeignKey(ProductSale, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'invoice_line_items'
```

**PurchaseInvoice**
```python
class PurchaseInvoice(TenantModel):
    """Purchase invoices from vendors"""
    invoice_id = models.AutoField(primary_key=True)
    invoice_number = models.CharField(max_length=50)
    
    # Vendor
    vendor_name = models.CharField(max_length=200)
    vendor_email = models.EmailField(blank=True)
    vendor_phone = models.CharField(max_length=50, blank=True)
    
    # Invoice details
    invoice_date = models.DateField()
    due_date = models.DateField()
    
    # Amounts
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='UGX')
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ], default='pending')
    
    # Documentation
    pdf_url = models.URLField(blank=True)
    
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='purchase_invoices_recorded')
    
    class Meta:
        db_table = 'purchase_invoices'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['due_date']),
        ]
```

#### Services

**ExpenseApprovalService**
```python
class ExpenseApprovalService:
    @staticmethod
    @transaction.atomic
    def submit_for_approval(expense_id, user):
        """Submit expense for approval"""
        expense = Expense.objects.get(pk=expense_id)
        
        # Check if user is owner (no approval needed)
        if user.is_owner or user.is_super_admin:
            expense.approval_status = 'approved'
            expense.approved_by = user
            expense.approved_at = timezone.now()
            expense.save()
            
            AuditService.log(
                action='expense_auto_approved',
                user=user,
                tenant=expense.tenant,
                entity_type='expense',
                entity_id=expense_id
            )
            
            return expense
        
        # Set to pending
        expense.approval_status = 'pending'
        expense.save()
        
        # Notify farm owners/managers
        owners = User.objects.filter(
            user_tenants__tenant=expense.tenant,
            user_tenants__is_owner=True
        )
        
        for owner in owners:
            NotificationService.send_notification(
                user=owner,
                notification_type='expense_pending_approval',
                title='Expense Pending Approval',
                message=f'{user.full_name} submitted an expense of {expense.amount} {expense.currency} for approval',
                channel='in_app',
                link=f'/dashboard/expenses/{expense_id}'
            )
        
        AuditService.log(
            action='expense_submitted_for_approval',
            user=user,
            tenant=expense.tenant,
            entity_type='expense',
            entity_id=expense_id
        )
        
        return expense
    
    @staticmethod
    @transaction.atomic
    def approve_expense(expense_id, approver, approval_notes=''):
        """Approve expense"""
        expense = Expense.objects.get(pk=expense_id)
        
        # Check approver permission
        if not PermissionService.has_permission(approver, 'approve_expenses'):
            raise PermissionError('User does not have permission to approve expenses')
        
        expense.approval_status = 'approved'
        expense.approved_by = approver
        expense.approved_at = timezone.now()
        expense.save()
        
        # Notify submitter
        NotificationService.send_notification(
            user=expense.recorded_by,
            notification_type='expense_approved',
            title='Expense Approved',
            message=f'Your expense of {expense.amount} {expense.currency} has been approved',
            channel='in_app'
        )
        
        # Log
        AuditService.log(
            action='expense_approved',
            user=approver,
            tenant=expense.tenant,
            entity_type='expense',
            entity_id=expense_id,
            details={'approval_notes': approval_notes}
        )
        
        # Publish event
        kafka_producer.send('expense.approved', {
            'expense_id': expense_id,
            'amount': float(expense.amount),
            'timestamp': timezone.now().isoformat()
        })
        
        return expense
    
    @staticmethod
    @transaction.atomic
    def reject_expense(expense_id, rejector, rejection_reason):
        """Reject expense"""
        expense = Expense.objects.get(pk=expense_id)
        
        # Check rejector permission
        if not PermissionService.has_permission(rejector, 'approve_expenses'):
            raise PermissionError('User does not have permission to reject expenses')
        
        expense.approval_status = 'rejected'
        expense.approved_by = rejector
        expense.approved_at = timezone.now()
        expense.rejection_reason = rejection_reason
        expense.save()
        
        # Notify submitter
        NotificationService.send_notification(
            user=expense.recorded_by,
            notification_type='expense_rejected',
            title='Expense Rejected',
            message=f'Your expense of {expense.amount} {expense.currency} was rejected. Reason: {rejection_reason}',
            channel='in_app'
        )
        
        # Log
        AuditService.log(
            action='expense_rejected',
            user=rejector,
            tenant=expense.tenant,
            entity_type='expense',
            entity_id=expense_id,
            details={'rejection_reason': rejection_reason}
        )
        
        return expense
```

---

### 7. Tax App 🆕

**Purpose**: Tax rate management and tax tracking against revenue with industry-standard separation.

#### Overview

The Tax App provides comprehensive tax management capabilities:
- **Tax Rate Configuration**: Super admins and owners can set tax rates
- **Tax Calculation**: Automatic tax calculation on sales/revenue
- **Tax Tracking**: Track taxes against revenue over time
- **Tax Reports**: Generate tax reports for compliance
- **Multi-Tenant Support**: Tenant-specific or system-wide tax rates

#### Models

**TaxRate**
```python
class TaxRate(TenantModel):
    """
    Tax rate configuration
    Supports both tenant-specific and system-wide rates
    """
    tax_rate_id = models.AutoField(primary_key=True)
    
    # Tax identification
    tax_name = models.CharField(max_length=200)  # e.g., "VAT", "Income Tax", "Sales Tax"
    tax_code = models.CharField(max_length=50, unique=True)  # e.g., "VAT-UG-18"
    tax_type = models.CharField(max_length=50, choices=[
        ('vat', 'Value Added Tax (VAT)'),
        ('income_tax', 'Income Tax'),
        ('sales_tax', 'Sales Tax'),
        ('withholding_tax', 'Withholding Tax'),
        ('custom', 'Custom Tax'),
    ])
    
    # Rate configuration
    rate_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Tax rate as percentage (e.g., 18.00 for 18%)"
    )
    
    # Applicability
    applies_to = models.CharField(max_length=50, choices=[
        ('all_revenue', 'All Revenue'),
        ('animal_sales', 'Animal Sales Only'),
        ('product_sales', 'Product Sales Only'),
        ('services', 'Services Only'),
        ('custom', 'Custom Rules'),
    ], default='all_revenue')
    
    # Custom rules (JSON for complex scenarios)
    custom_rules = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom tax rules (e.g., exemptions, thresholds)"
    )
    
    # Effective dates
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)  # NULL = currently active
    
    # Status
    is_active = models.BooleanField(default=True)
    is_system_default = models.BooleanField(
        default=False,
        help_text="System-wide default (super admin only)"
    )
    
    # Configuration
    calculation_method = models.CharField(max_length=20, choices=[
        ('inclusive', 'Tax Inclusive (price includes tax)'),
        ('exclusive', 'Tax Exclusive (tax added to price)'),
    ], default='exclusive')
    
    # Metadata
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tax_rates'
    )
    
    # Tenant-specific (NULL = system-wide, super admin only)
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="NULL = system-wide tax rate (super admin only)"
    )
    
    class Meta:
        db_table = 'tax_rates'
        indexes = [
            models.Index(fields=['tenant', 'is_active', 'effective_from']),
            models.Index(fields=['tax_type', 'is_active']),
            models.Index(fields=['effective_from', 'effective_to']),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(rate_percentage__gte=0) & Q(rate_percentage__lte=100),
                name='tax_rate_percentage_range'
            ),
        ]
    
    def __str__(self):
        return f"{self.tax_name} ({self.rate_percentage}%)"
    
    def is_currently_active(self):
        """Check if tax rate is currently active"""
        today = timezone.now().date()
        if not self.is_active:
            return False
        if self.effective_from > today:
            return False
        if self.effective_to and self.effective_to < today:
            return False
        return True
```

**TaxCalculation**
```python
class TaxCalculation(TenantModel):
    """
    Tax calculation record
    Links to sales/revenue transactions
    """
    tax_calculation_id = models.AutoField(primary_key=True)
    
    # Source transaction
    source_type = models.CharField(max_length=50, choices=[
        ('animal_sale', 'Animal Sale'),
        ('product_sale', 'Product Sale'),
        ('service_revenue', 'Service Revenue'),
        ('other_revenue', 'Other Revenue'),
    ])
    source_id = models.IntegerField()  # ID of the source transaction
    
    # Tax rate used
    tax_rate = models.ForeignKey(
        TaxRate,
        on_delete=models.PROTECT,
        related_name='calculations'
    )
    
    # Amounts
    revenue_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Revenue amount before tax"
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Calculated tax amount"
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total amount (revenue + tax)"
    )
    
    # Calculation details
    calculation_method = models.CharField(max_length=20)  # inclusive/exclusive
    tax_rate_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Tax rate at time of calculation"
    )
    
    # Transaction date
    transaction_date = models.DateField()
    
    # Farm reference (if applicable)
    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Metadata
    notes = models.TextField(blank=True)
    calculated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tax_calculations'
        indexes = [
            models.Index(fields=['tenant', 'transaction_date']),
            models.Index(fields=['source_type', 'source_id']),
            models.Index(fields=['farm', 'transaction_date']),
            models.Index(fields=['tax_rate', 'transaction_date']),
        ]
    
    def __str__(self):
        return f"Tax: {self.tax_amount} on {self.revenue_amount} ({self.transaction_date})"
```

**TaxRecord**
```python
class TaxRecord(TenantModel):
    """
    Historical tax record for reporting
    Aggregated tax data by period
    """
    tax_record_id = models.AutoField(primary_key=True)
    
    # Period
    period_type = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ])
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Tax summary
    tax_rate = models.ForeignKey(
        TaxRate,
        on_delete=models.PROTECT,
        related_name='records'
    )
    
    total_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total revenue for period"
    )
    total_tax = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total tax for period"
    )
    transaction_count = models.IntegerField(
        default=0,
        help_text="Number of transactions in period"
    )
    
    # Farm breakdown (if applicable)
    farm_breakdown = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tax breakdown by farm"
    )
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('finalized', 'Finalized'),
        ('filed', 'Filed'),
    ], default='draft')
    
    # Filing information
    filed_at = models.DateTimeField(null=True, blank=True)
    filed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='filed_tax_records'
    )
    filing_reference = models.CharField(max_length=200, blank=True)
    
    # Farm reference (optional - NULL = all farms)
    farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tax_records'
        unique_together = [
            ('tenant', 'tax_rate', 'period_type', 'period_start', 'farm')
        ]
        indexes = [
            models.Index(fields=['tenant', 'period_start', 'period_end']),
            models.Index(fields=['tax_rate', 'status']),
            models.Index(fields=['farm', 'period_start']),
        ]
    
    def __str__(self):
        return f"Tax Record: {self.tax_rate.tax_name} - {self.period_start} to {self.period_end}"
```

**TaxConfiguration**
```python
class TaxConfiguration(TenantModel):
    """
    Tenant-specific tax configuration
    Settings for tax calculation and reporting
    """
    config_id = models.AutoField(primary_key=True)
    
    # Default tax rate
    default_tax_rate = models.ForeignKey(
        TaxRate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='configurations'
    )
    
    # Auto-calculation settings
    auto_calculate_tax = models.BooleanField(
        default=True,
        help_text="Automatically calculate tax on sales"
    )
    auto_apply_to_animal_sales = models.BooleanField(default=True)
    auto_apply_to_product_sales = models.BooleanField(default=True)
    
    # Reporting settings
    tax_year_start_month = models.IntegerField(
        default=1,
        choices=[(i, calendar.month_name[i]) for i in range(1, 13)],
        help_text="Month when tax year starts (1=January, etc.)"
    )
    reporting_currency = models.CharField(max_length=3, default='UGX')
    
    # Compliance settings
    require_tax_id = models.BooleanField(
        default=False,
        help_text="Require tax ID for sales"
    )
    tax_id_label = models.CharField(
        max_length=100,
        default='Tax ID',
        help_text="Label for tax ID field (e.g., 'TIN', 'VAT Number')"
    )
    
    # Notification settings
    notify_on_tax_due = models.BooleanField(default=True)
    tax_due_reminder_days = models.IntegerField(
        default=7,
        help_text="Days before tax due date to send reminder"
    )
    
    # Metadata
    updated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tax_configurations'
        unique_together = [('tenant',)]
    
    def __str__(self):
        return f"Tax Configuration for {self.tenant.organization_name}"
```

#### Services

**TaxService**
```python
class TaxService:
    @staticmethod
    def get_active_tax_rate(tenant_id, tax_type='vat', farm_id=None):
        """
        Get currently active tax rate for tenant
        
        Args:
            tenant_id: Tenant ID
            tax_type: Type of tax (vat, income_tax, etc.)
            farm_id: Optional farm ID for farm-specific rates
        
        Returns:
            TaxRate object or None
        """
        today = timezone.now().date()
        
        # Try tenant-specific rate first
        tax_rate = TaxRate.objects.filter(
            tenant_id=tenant_id,
            tax_type=tax_type,
            is_active=True,
            effective_from__lte=today
        ).filter(
            Q(effective_to__isnull=True) | Q(effective_to__gte=today)
        ).order_by('-effective_from').first()
        
        # Fall back to system-wide rate
        if not tax_rate:
            tax_rate = TaxRate.objects.filter(
                tenant_id__isnull=True,
                tax_type=tax_type,
                is_active=True,
                is_system_default=True,
                effective_from__lte=today
            ).filter(
                Q(effective_to__isnull=True) | Q(effective_to__gte=today)
            ).order_by('-effective_from').first()
        
        return tax_rate
    
    @staticmethod
    def calculate_tax(revenue_amount, tax_rate, calculation_method=None):
        """
        Calculate tax amount based on revenue and tax rate
        
        Args:
            revenue_amount: Revenue amount
            tax_rate: TaxRate object
            calculation_method: 'inclusive' or 'exclusive' (defaults to tax_rate.calculation_method)
        
        Returns:
            dict with 'tax_amount', 'total_amount', 'revenue_amount'
        """
        if not tax_rate:
            return {
                'tax_amount': Decimal('0.00'),
                'total_amount': revenue_amount,
                'revenue_amount': revenue_amount
            }
        
        method = calculation_method or tax_rate.calculation_method
        rate = tax_rate.rate_percentage / 100
        
        if method == 'inclusive':
            # Tax is included in revenue_amount
            # revenue_amount = total_amount
            # tax_amount = total_amount * rate / (1 + rate)
            tax_amount = revenue_amount * rate / (1 + rate)
            total_amount = revenue_amount
            actual_revenue = revenue_amount - tax_amount
        else:
            # Tax is added to revenue_amount
            # total_amount = revenue_amount + tax_amount
            # tax_amount = revenue_amount * rate
            tax_amount = revenue_amount * rate
            total_amount = revenue_amount + tax_amount
            actual_revenue = revenue_amount
        
        return {
            'tax_amount': round(tax_amount, 2),
            'total_amount': round(total_amount, 2),
            'revenue_amount': round(actual_revenue, 2)
        }
    
    @staticmethod
    @transaction.atomic
    def create_tax_calculation(source_type, source_id, revenue_amount, tenant_id, farm_id=None, tax_rate=None):
        """
        Create tax calculation record
        
        Args:
            source_type: 'animal_sale', 'product_sale', etc.
            source_id: ID of source transaction
            revenue_amount: Revenue amount
            tenant_id: Tenant ID
            farm_id: Optional farm ID
            tax_rate: Optional TaxRate (if None, uses default)
        
        Returns:
            TaxCalculation object
        """
        # Get tax rate if not provided
        if not tax_rate:
            tax_rate = TaxService.get_active_tax_rate(tenant_id)
        
        if not tax_rate:
            # No tax rate configured, create zero-tax calculation
            return TaxCalculation.objects.create(
                tenant_id=tenant_id,
                farm_id=farm_id,
                source_type=source_type,
                source_id=source_id,
                tax_rate=None,
                revenue_amount=revenue_amount,
                tax_amount=Decimal('0.00'),
                total_amount=revenue_amount,
                calculation_method='exclusive',
                tax_rate_percentage=Decimal('0.00'),
                transaction_date=timezone.now().date()
            )
        
        # Calculate tax
        calculation = TaxService.calculate_tax(revenue_amount, tax_rate)
        
        # Create tax calculation record
        tax_calc = TaxCalculation.objects.create(
            tenant_id=tenant_id,
            farm_id=farm_id,
            source_type=source_type,
            source_id=source_id,
            tax_rate=tax_rate,
            revenue_amount=calculation['revenue_amount'],
            tax_amount=calculation['tax_amount'],
            total_amount=calculation['total_amount'],
            calculation_method=tax_rate.calculation_method,
            tax_rate_percentage=tax_rate.rate_percentage,
            transaction_date=timezone.now().date()
        )
        
        # Publish event
        kafka_producer.send('tax.calculated', {
            'tax_calculation_id': tax_calc.tax_calculation_id,
            'source_type': source_type,
            'source_id': source_id,
            'tax_amount': float(calculation['tax_amount']),
            'timestamp': timezone.now().isoformat()
        })
        
        # Log to audit
        AuditService.log(
            action='tax_calculated',
            tenant_id=tenant_id,
            entity_type='tax_calculation',
            entity_id=tax_calc.tax_calculation_id,
            details={
                'source_type': source_type,
                'source_id': source_id,
                'tax_amount': float(calculation['tax_amount']),
                'tax_rate': float(tax_rate.rate_percentage)
            }
        )
        
        return tax_calc
    
    @staticmethod
    def get_tax_summary(tenant_id, start_date, end_date, farm_id=None):
        """
        Get tax summary for period
        
        Returns:
            dict with total_revenue, total_tax, transaction_count, breakdown
        """
        queryset = TaxCalculation.objects.filter(
            tenant_id=tenant_id,
            transaction_date__gte=start_date,
            transaction_date__lte=end_date
        )
        
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        
        summary = queryset.aggregate(
            total_revenue=Sum('revenue_amount'),
            total_tax=Sum('tax_amount'),
            total_amount=Sum('total_amount'),
            transaction_count=Count('tax_calculation_id')
        )
        
        # Breakdown by tax rate
        breakdown = queryset.values('tax_rate__tax_name', 'tax_rate__rate_percentage').annotate(
            revenue=Sum('revenue_amount'),
            tax=Sum('tax_amount'),
            count=Count('tax_calculation_id')
        )
        
        return {
            'total_revenue': summary['total_revenue'] or Decimal('0.00'),
            'total_tax': summary['total_tax'] or Decimal('0.00'),
            'total_amount': summary['total_amount'] or Decimal('0.00'),
            'transaction_count': summary['transaction_count'] or 0,
            'breakdown': list(breakdown)
        }
    
    @staticmethod
    @transaction.atomic
    def create_tax_record(tenant_id, period_type, period_start, period_end, farm_id=None):
        """
        Create aggregated tax record for period
        
        Returns:
            TaxRecord object
        """
        # Get all tax calculations for period
        calculations = TaxCalculation.objects.filter(
            tenant_id=tenant_id,
            transaction_date__gte=period_start,
            transaction_date__lte=period_end
        )
        
        if farm_id:
            calculations = calculations.filter(farm_id=farm_id)
        
        # Group by tax rate
        tax_records = []
        for tax_rate in TaxRate.objects.filter(
            tenant_id=tenant_id,
            is_active=True
        ).distinct():
            rate_calculations = calculations.filter(tax_rate=tax_rate)
            
            if not rate_calculations.exists():
                continue
            
            summary = rate_calculations.aggregate(
                total_revenue=Sum('revenue_amount'),
                total_tax=Sum('tax_amount'),
                count=Count('tax_calculation_id')
            )
            
            # Farm breakdown
            farm_breakdown = rate_calculations.values('farm__farm_name').annotate(
                revenue=Sum('revenue_amount'),
                tax=Sum('tax_amount'),
                count=Count('tax_calculation_id')
            )
            
            tax_record = TaxRecord.objects.create(
                tenant_id=tenant_id,
                farm_id=farm_id,
                period_type=period_type,
                period_start=period_start,
                period_end=period_end,
                tax_rate=tax_rate,
                total_revenue=summary['total_revenue'] or Decimal('0.00'),
                total_tax=summary['total_tax'] or Decimal('0.00'),
                transaction_count=summary['count'] or 0,
                farm_breakdown={item['farm__farm_name']: item for item in farm_breakdown},
                status='draft'
            )
            
            tax_records.append(tax_record)
        
        return tax_records
```

**TaxRateService**
```python
class TaxRateService:
    @staticmethod
    @transaction.atomic
    def create_tax_rate(tenant_id, tax_data, created_by_user_id, is_super_admin=False):
        """
        Create tax rate (owner or super admin)
        
        Args:
            tenant_id: Tenant ID (None for system-wide, super admin only)
            tax_data: Dict with tax rate fields
            created_by_user_id: User creating the rate
            is_super_admin: Whether user is super admin
        
        Returns:
            TaxRate object
        """
        # Validate permissions
        if tenant_id is None and not is_super_admin:
            raise PermissionError("Only super admins can create system-wide tax rates")
        
        # Create tax rate
        tax_rate = TaxRate.objects.create(
            tenant_id=tenant_id,
            created_by_id=created_by_user_id,
            **tax_data
        )
        
        # Log creation
        AuditService.log(
            action='tax_rate_created',
            user_id=created_by_user_id,
            tenant_id=tenant_id,
            entity_type='tax_rate',
            entity_id=tax_rate.tax_rate_id,
            details={
                'tax_name': tax_rate.tax_name,
                'rate_percentage': float(tax_rate.rate_percentage),
                'is_system_default': tax_rate.is_system_default
            }
        )
        
        return tax_rate
    
    @staticmethod
    def update_tax_rate(tax_rate_id, update_data, updated_by_user_id):
        """Update tax rate"""
        tax_rate = TaxRate.objects.get(pk=tax_rate_id)
        
        # Store old values for audit
        old_values = {
            'rate_percentage': float(tax_rate.rate_percentage),
            'is_active': tax_rate.is_active,
            'effective_to': tax_rate.effective_to.isoformat() if tax_rate.effective_to else None
        }
        
        # Update fields
        for key, value in update_data.items():
            setattr(tax_rate, key, value)
        
        tax_rate.save()
        
        # Log update
        AuditService.log(
            action='tax_rate_updated',
            user_id=updated_by_user_id,
            tenant_id=tax_rate.tenant_id,
            entity_type='tax_rate',
            entity_id=tax_rate_id,
            changes={
                'old': old_values,
                'new': {
                    'rate_percentage': float(tax_rate.rate_percentage),
                    'is_active': tax_rate.is_active,
                    'effective_to': tax_rate.effective_to.isoformat() if tax_rate.effective_to else None
                }
            }
        )
        
        return tax_rate
```

#### Integration with Financial App

**Automatic Tax Calculation on Sales**
```python
# financial/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from tax.services import TaxService

@receiver(post_save, sender=AnimalSale)
def calculate_tax_on_animal_sale(sender, instance, created, **kwargs):
    """Automatically calculate tax when animal sale is created"""
    if created and instance.payment_status == 'paid':
        # Get tax configuration
        config = TaxConfiguration.objects.filter(
            tenant_id=instance.tenant_id
        ).first()
        
        if config and config.auto_calculate_tax and config.auto_apply_to_animal_sales:
            # Calculate tax
            TaxService.create_tax_calculation(
                source_type='animal_sale',
                source_id=instance.sale_id,
                revenue_amount=instance.sale_price,
                tenant_id=instance.tenant_id,
                farm_id=instance.farm_id
            )

@receiver(post_save, sender=ProductSale)
def calculate_tax_on_product_sale(sender, instance, created, **kwargs):
    """Automatically calculate tax when product sale is created"""
    if created and instance.payment_status == 'paid':
        config = TaxConfiguration.objects.filter(
            tenant_id=instance.tenant_id
        ).first()
        
        if config and config.auto_calculate_tax and config.auto_apply_to_product_sales:
            TaxService.create_tax_calculation(
                source_type='product_sale',
                source_id=instance.product_sale_id,
                revenue_amount=instance.total_amount,
                tenant_id=instance.tenant_id,
                farm_id=instance.farm_id
            )
```

#### API Endpoints

```python
# Tax Rate Management
GET    /api/v1/tax/rates/                    # List tax rates
POST   /api/v1/tax/rates/                   # Create tax rate (owner/admin)
GET    /api/v1/tax/rates/{id}/              # Get tax rate details
PUT    /api/v1/tax/rates/{id}/              # Update tax rate
DELETE /api/v1/tax/rates/{id}/              # Deactivate tax rate

# Tax Calculations
GET    /api/v1/tax/calculations/             # List tax calculations
GET    /api/v1/tax/calculations/{id}/        # Get calculation details
POST   /api/v1/tax/calculations/calculate/   # Manual tax calculation

# Tax Records (Reports)
GET    /api/v1/tax/records/                  # List tax records
POST   /api/v1/tax/records/generate/         # Generate tax record for period
GET    /api/v1/tax/records/{id}/            # Get tax record details
PUT    /api/v1/tax/records/{id}/finalize/   # Finalize tax record
PUT    /api/v1/tax/records/{id}/file/       # Mark as filed

# Tax Summary
GET    /api/v1/tax/summary/                  # Get tax summary for period
GET    /api/v1/tax/summary/by-farm/          # Tax summary by farm

# Tax Configuration
GET    /api/v1/tax/config/                   # Get tax configuration
PUT    /api/v1/tax/config/                   # Update tax configuration

# Super Admin Endpoints
POST   /api/v1/admin/tax/rates/system/      # Create system-wide tax rate
GET    /api/v1/admin/tax/rates/system/       # List system-wide tax rates
```

---

**Continue in next file...**

