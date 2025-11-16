# Castration Activity Feature

## Overview
This feature allows workers and farm managers to log and track castration procedures performed on male animals. Castration is a common farm operation that needs proper documentation for animal welfare, traceability, and operational management.

---

## Core Functionality

### What is Tracked
- **Animal Information**: Which male animal was castrated
- **Date & Time**: When the procedure was performed
- **Method Used**: Surgical, banding (elastration), chemical, or other methods
- **Performed By**: Which worker/manager performed or assisted with the procedure
- **Veterinary Supervision**: Name of veterinarian if supervised
- **Cost**: Procedure costs (vet fees, materials, medications)
- **Post-Care Instructions**: Care instructions for recovery period
- **Notes**: Additional observations or complications

---

## Implementation Details

### 1. Data Structure

#### Activity Type Enhancement
```typescript
export interface Activity {
  activity_id: number;
  farm_id: number;
  tenant_id: number;
  activity_type: 'feeding' | 'breeding' | 'health_check' | 'vaccination' | 'castration' | 'general' | 'other';
  animal_id?: number;
  animal?: Animal;
  description: string;
  activity_date: string;
  performed_by_user_id: number;
  performed_by?: User;
  cost?: number;
  notes?: string;
  
  // Castration-specific fields
  castration_method?: 'surgical' | 'banding' | 'chemical' | 'other';
  veterinarian_name?: string;
  post_care_instructions?: string;
  
  created_at: string;
}
```

#### Animal Record Integration
When a castration activity is logged, the animal record is automatically updated:
- `is_castrated` → set to `true`
- `castration_date` → populated with activity date
- `castration_method` → populated with method used
- `castration_notes` → populated with notes

---

## User Workflows

### Worker Workflow: Log Castration Activity

1. **Navigate to Activities**
   - Go to "Farm Activities" from sidebar
   - Click "Log Activity" button

2. **Select Activity Type**
   - Choose "Castration" from activity type dropdown

3. **Select Animal**
   - Dropdown automatically filters to show only:
     - Male animals
     - Active status
     - Not already castrated
   - Select the animal to be castrated

4. **Enter Castration Details**
   - **Castration Method** (required):
     - Surgical: Traditional surgical castration
     - Banding (Elastration): Rubber band method
     - Chemical: Chemical castration
     - Other: Other methods
   - **Veterinarian Name** (optional):
     - Name of vet if procedure was supervised
   - **Post-Care Instructions** (optional):
     - Care instructions for recovery period
     - Example: "Monitor for swelling, keep area clean, check after 7 days"

5. **Complete Standard Fields**
   - **Description** (required): Brief description of the procedure
   - **Date** (required): Date procedure was performed
   - **Cost** (optional): Total cost of procedure (vet fees, materials, meds)
   - **Additional Notes** (optional): Any observations or complications

6. **Submit**
   - Click "Log Activity" button
   - Activity is recorded
   - Animal record is automatically updated with castration status

---

## Castration Methods Explained

### 1. Surgical Castration
- **Description**: Traditional surgical removal of testicles
- **Pros**: Immediate, complete removal
- **Cons**: Invasive, requires skilled person/vet, higher risk
- **Recovery**: 7-14 days
- **Cost**: Higher (vet fees, anesthesia, antibiotics)
- **Best For**: Older animals, when immediate results needed

### 2. Banding (Elastration)
- **Description**: Rubber band applied to restrict blood flow to testicles
- **Pros**: Less invasive, lower cost, can be done by trained workers
- **Cons**: Takes 2-4 weeks for testicles to fall off, discomfort period
- **Recovery**: 2-4 weeks
- **Cost**: Lower (just band and tool)
- **Best For**: Young animals (under 3 months), goats, sheep

### 3. Chemical Castration
- **Description**: Chemical injection to destroy testicular tissue
- **Pros**: Non-surgical, reversible in some cases
- **Cons**: Requires precise dosing, may not be 100% effective
- **Recovery**: Varies
- **Cost**: Medium (chemicals, vet administration)
- **Best For**: Specific breeding management scenarios

### 4. Other Methods
- **Description**: Other traditional or emerging methods
- **Examples**: Burdizzo (crushing method), immunocastration
- **Use**: Region-specific or special circumstances

---

## Post-Care Management

### Standard Post-Care Instructions by Method

#### Surgical Castration
- Monitor wound for infection (swelling, discharge, fever)
- Keep area clean and dry
- Administer antibiotics as prescribed (typically 5-7 days)
- Isolate from other animals for 3-5 days
- Restrict activity for 7-14 days
- Check wound healing at 7 days and 14 days
- Watch for complications: excessive bleeding, infection, tetanus

#### Banding
- Monitor for swelling and discomfort (normal for first 48 hours)
- Check band is secure and properly placed
- Watch for signs of infection
- Keep animal calm and minimize stress
- Provide pain relief if needed (consult vet)
- Check at 7 days, 14 days, and 21 days
- Testicles should fall off within 2-4 weeks

#### Chemical
- Follow veterinarian's specific post-injection instructions
- Monitor injection site for reactions
- Watch for behavioral changes
- Schedule follow-up to verify effectiveness
- May require repeated doses

---

## Integration Points

### With Animal Records
- Animal detail view shows castration status
- Castration history displayed in animal profile
- Filter animals by castration status
- Breeding logic excludes castrated males automatically

### With Activities Log
- All farm activities shown in unified timeline
- Filter activities by type (including castration)
- Search activities by animal, date, worker
- Export activity reports

### With Financial Tracking
- Castration costs tracked as operational expenses
- Categorized under "Animal Management" or "Medical"
- Included in cost-per-animal calculations
- Financial reports include castration expenses

### With Worker Schedules
- Can assign castration tasks to workers
- Schedule castration procedures in advance
- Track completion status
- Send reminders for scheduled castrations

### With Alerts System
- Generate alerts for post-care checkups
- Reminder alerts (e.g., "Check banding at 7 days")
- Flag complications that need attention
- Alert for follow-up examinations

---

## Role Permissions

### Who Can Log Castration Activities

#### ✅ Owner
- Full access to log, view, edit, delete castration activities
- Can assign castration tasks
- View all castration records across all farms

#### ✅ Farm Manager (Helper with elevated permissions)
- Can log castration activities
- View castration records for assigned farms
- Assign castration tasks to workers
- Monitor completion and compliance

#### ✅ Field Worker (Helper)
- Can log castration activities they performed
- View castration activities they logged
- Complete assigned castration tasks
- Update activity status

#### ✅ Veterinarian
- Can log castration activities when supervised
- View animal castration history for medical assessment
- Update post-care instructions
- Flag complications requiring attention

#### ❌ Accountant
- Cannot log castration activities (read-only on financial aspects)
- Can view castration costs in financial reports

---

## Best Practices

### Timing
- **Goats**: 8-12 weeks old (banding) or 3-6 months (surgical)
- **Sheep**: 2-8 weeks old (banding) or 2-4 months (surgical)
- **Cattle**: 2-4 months old (ideal for banding)
- **Pigs**: 1-3 weeks old (surgical preferred)

### Safety
- Always have skilled person or veterinarian present
- Use proper restraint methods
- Maintain sterile conditions for surgical methods
- Have emergency plan for complications
- Follow local regulations and welfare standards

### Documentation
- Log immediately after procedure (while fresh in memory)
- Be specific in descriptions
- Document any deviations from standard procedure
- Record all complications, even minor ones
- Take photos if permitted (for documentation)

### Follow-Up
- Schedule post-care checkups in advance
- Set alerts for critical checkpoints
- Monitor animal behavior and recovery
- Document recovery progress
- Report complications promptly

---

## Reporting & Analytics

### Available Reports

#### 1. Castration Activity Report
- Total castrations by period (month, quarter, year)
- Breakdown by animal type
- Breakdown by method used
- Costs summary
- Worker performance

#### 2. Animal Castration Status Report
- List of all male animals
- Castration status (castrated vs. intact)
- Castration dates and methods
- Post-care compliance
- Animals requiring castration

#### 3. Compliance Report
- Scheduled vs. completed castrations
- Post-care checkup compliance
- Complications and outcomes
- Veterinary supervision rates

#### 4. Financial Report
- Total castration costs by period
- Cost per animal by type
- Method cost comparison
- Budget variance analysis

---

## Example Scenarios

### Scenario 1: Routine Goat Castration
**Situation**: 3-month-old male goat kid needs castration for meat production

**Steps**:
1. Worker navigates to Farm Activities
2. Clicks "Log Activity" → Selects "Castration"
3. Selects goat kid (GOAT-004) from dropdown
4. Enters details:
   - Method: Banding
   - Description: "Routine castration using elastrator"
   - Date: Today's date
   - Cost: 5,000 UGX (band + tool use)
   - Post-Care: "Monitor for swelling, check band placement daily, expect testicles to fall off in 2-3 weeks"
   - Notes: "Kid handled well, minimal stress"
5. Submits activity
6. System updates GOAT-004 record: is_castrated = true

**Follow-Up**:
- Alert set for 7-day checkup
- Alert set for 14-day checkup
- Alert set for 21-day final check

### Scenario 2: Surgical Castration with Vet
**Situation**: 6-month-old bull calf requires surgical castration

**Steps**:
1. Owner schedules castration task for next Tuesday
2. Assigns task to farm manager and worker
3. Veterinarian (Dr. Sarah Wilson) arrives on Tuesday
4. After procedure, worker logs activity:
   - Method: Surgical
   - Veterinarian: Dr. Sarah Wilson
   - Description: "Surgical castration performed under local anesthetic"
   - Cost: 50,000 UGX (vet fee + anesthetic + antibiotics)
   - Post-Care: "Administer antibiotics twice daily for 5 days, keep isolated for 3 days, monitor wound for infection, restrict activity for 14 days"
   - Notes: "Procedure successful, minimal bleeding, calf recovering well"
5. Submits activity

**Follow-Up**:
- Daily alerts for antibiotic administration (5 days)
- Alert for 3-day isolation end
- Alert for 7-day wound check
- Alert for 14-day final examination
- Expense automatically added to medical costs

### Scenario 3: Emergency Castration
**Situation**: Adult ram showing aggressive behavior, needs immediate castration

**Steps**:
1. Owner calls veterinarian for emergency procedure
2. Vet performs surgical castration same day
3. Owner logs activity immediately:
   - Method: Surgical
   - Veterinarian: Dr. James Okello
   - Description: "Emergency surgical castration due to aggressive behavior"
   - Cost: 75,000 UGX (emergency call + procedure)
   - Post-Care: "Pain management for 3 days, antibiotics for 7 days, isolate for 5 days, daily wound checks for 14 days"
   - Notes: "Procedure performed under general anesthetic, animal recovering, behavior expected to improve in 2-3 weeks"
4. Submits activity
5. Creates expense record for emergency vet call

**Follow-Up**:
- Daily medication alerts
- Daily wound check reminders
- 5-day isolation end alert
- 14-day final check alert
- Behavior reassessment scheduled for 3 weeks

---

## Benefits

### For Farm Operations
- **Complete Traceability**: Full record of all castration procedures
- **Compliance**: Meet animal welfare regulations and documentation requirements
- **Planning**: Schedule and track castration procedures systematically
- **Cost Control**: Monitor castration costs and optimize methods

### For Animal Welfare
- **Proper Documentation**: Every procedure recorded with details
- **Post-Care Tracking**: Ensure animals receive appropriate follow-up care
- **Complication Monitoring**: Early detection and response to issues
- **Method Optimization**: Identify most humane and effective methods

### For Workers
- **Clear Guidelines**: Step-by-step documentation of procedures
- **Task Management**: Scheduled castrations appear in daily tasks
- **Accountability**: Clear record of who performed each procedure
- **Training**: Historical records serve as training references

### For Management
- **Overview**: See all castration activities at a glance
- **Analytics**: Understand patterns and optimize scheduling
- **Quality Control**: Monitor compliance with procedures
- **Financial Planning**: Accurate cost projections for castration programs

---

## Technical Implementation Notes

### Database Changes Required
1. Add 'castration' to Activity.activity_type enum
2. Add castration-specific fields to Activity table:
   - castration_method (enum)
   - veterinarian_name (string, optional)
   - post_care_instructions (text, optional)

### API Endpoints Needed
- `POST /api/activities/castration` - Create castration activity
- `GET /api/activities?type=castration` - Fetch castration activities
- `GET /api/animals/:id/castration-history` - Get animal's castration record
- `PUT /api/animals/:id/castration-status` - Update animal castration status

### UI Components
- CastrationActivityForm component
- CastrationMethodSelector component
- PostCareInstructionsField component
- CastrationHistoryView component
- CastrationScheduleCalendar component

### Validation Rules
- Only male animals can be castrated
- Cannot castrate already castrated animals
- Activity date cannot be in future
- Castration method is required when activity type is 'castration'
- Animal must be active status

### Permissions
- Uses `create_general` permission for logging activities
- Workers, managers, and owners can log castration
- Veterinarians can view and update if involved

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic castration activity logging
- ✅ Animal record integration
- ✅ Post-care instruction tracking
- ✅ Cost tracking

### Phase 2 (Planned)
- 📋 Castration scheduling and calendar
- 📋 Automated post-care reminders
- 📋 Photo documentation upload
- 📋 Weight tracking before/after castration

### Phase 3 (Future)
- 📋 Castration outcome analytics (success rates by method)
- 📋 Growth rate comparison (castrated vs intact)
- 📋 Market value impact analysis
- 📋 Veterinarian performance tracking
- 📋 Weather correlation analysis (best conditions)
- 📋 AI recommendations for optimal timing and method

---

## Related Documentation
- [Phase 7: External Breeding](PHASE7_EXTERNAL_BREEDING.md) - Breeding management
- [Phase 8: Lineage Tracking](PHASE8_LINEAGE_TRACKING.md) - Animal genetics
- [Role Functionalities](ROLE_FUNCTIONALITIES.md) - Complete role permissions
- Animal Management Guide - Animal care procedures
- Worker Training Guide - Activity logging procedures

