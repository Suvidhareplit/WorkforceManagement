# Onboarding Module - Complete Updates ✅

## 🎯 **CHANGES IMPLEMENTED**

---

## **1. JOB DETAILS - NEW ORDER**

### **✅ CORRECT ORDER NOW:**
```
Entity (Legal Entity)           ← FIRST
Business Unit                   ← SECOND
Function                        ← THIRD
Department                      ← FOURTH
Sub Department                  ← FIFTH
Employment Type (NEW)           ← SIXTH
City
Cluster
Role
Manager
Date of Joining
Gross Salary
Resume Source Type
Resume Source Name
Cost Centre
```

### **❌ OLD ORDER (Fixed):**
```
City  ← Was starting here (WRONG!)
Cluster
Role
...
Entity ← Was at the end
```

---

## **2. NEW BASIC DETAILS FIELDS**

### **Added 3 New Columns:**
1. **Physically Handicapped**
   - Type: Text field
   - Values: Yes / No / NA
   - Position: After "Marital Status"

2. **Nationality**
   - Type: Text field
   - Default: "Indian"
   - Position: After "Physically Handicapped"

3. **International Worker**
   - Type: Text field
   - Values: Yes / No / NA
   - Position: After "Nationality"

---

## **3. EMPLOYMENT TYPE (AUTO-CALCULATED)**

### **New Column: employment_type**
- **Position:** After "Sub Department", Before "City"
- **Auto-calculated from Resume Source:**
  - `resume_source = 'vendor'` → **Contract**
  - All other sources → **Permanent**

### **Business Logic:**
```typescript
const employmentType = resume_source === 'vendor' ? 'Contract' : 'Permanent';
```

**Examples:**
```
Resume Source: Vendor          → Employment Type: Contract
Resume Source: Field Recruiter → Employment Type: Permanent
Resume Source: Referral        → Employment Type: Permanent
Resume Source: Direct          → Employment Type: Permanent
```

---

## **4. DATABASE CHANGES**

### **Migration File:**
`server/sql/migrations/add_onboarding_new_fields.sql`

### **New Columns Added:**
```sql
-- Employment Type
ALTER TABLE onboarding 
ADD COLUMN employment_type VARCHAR(50) AFTER sub_department_name;

-- Basic Details
ALTER TABLE onboarding
ADD COLUMN physically_handicapped VARCHAR(50) AFTER marital_status,
ADD COLUMN nationality VARCHAR(100) DEFAULT 'Indian' AFTER physically_handicapped,
ADD COLUMN international_worker VARCHAR(50) AFTER nationality;
```

### **Auto-Update Existing Records:**
```sql
UPDATE onboarding 
SET employment_type = CASE 
    WHEN resume_source = 'vendor' THEN 'Contract'
    ELSE 'Permanent'
END
WHERE employment_type IS NULL;
```

### **Verify Columns:**
```sql
SELECT 
    COLUMN_NAME,
    ORDINAL_POSITION,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'onboarding' 
    AND COLUMN_NAME IN (
        'employment_type',
        'physically_handicapped',
        'nationality',
        'international_worker'
    )
ORDER BY ORDINAL_POSITION;
```

**Result:**
```
employment_type          15      varchar(50)     NULL
physically_handicapped   33      varchar(50)     NULL
nationality              34      varchar(100)    Indian
international_worker     35      varchar(50)     NULL
```

---

## **5. FRONTEND CHANGES**

### **File Updated:**
`client/src/pages/training/Onboarding.tsx`

### **CSV Export Headers (Line ~87-126):**
```typescript
// NEW ORDER:
"Physically Handicapped (Yes/No/NA)",
"Nationality",
"International Worker (Yes/No/NA)",
...
// JOB DETAILS
"Legal Entity",                      ← FIRST
"Business Unit (DO NOT EDIT)",
"Function (DO NOT EDIT)",
"Department (DO NOT EDIT)",
"Sub Department (DO NOT EDIT)",
"Employment Type (DO NOT EDIT)",     ← NEW
"City (DO NOT EDIT)",
"Cluster (DO NOT EDIT)",
...
```

### **CSV Export Data (Line ~171-210):**
```typescript
// NEW ORDER:
record.physicallyHandicapped || record.physically_handicapped || '',
record.nationality || 'Indian',
record.internationalWorker || record.international_worker || '',
...
// JOB DETAILS
record.legalEntity || record.legal_entity || '',           // FIRST
record.businessUnitName || record.business_unit_name || '',
record.functionName || record.function_name || '',
record.departmentName || record.department_name || '',
record.subDepartmentName || record.sub_department_name || '',
record.employmentType || record.employment_type || '',     // NEW
record.city || '',
record.cluster || '',
...
```

### **Table Headers (Line ~934-973):**
```typescript
// Basic Details
<TableHead>Physically Handicapped</TableHead>
<TableHead>Nationality</TableHead>
<TableHead>International Worker</TableHead>

// Job Details (NEW ORDER)
<TableHead>Entity</TableHead>                    ← FIRST
<TableHead>Business Unit</TableHead>
<TableHead>Function</TableHead>
<TableHead>Department</TableHead>
<TableHead>Sub Department</TableHead>
<TableHead>Employment Type</TableHead>           ← NEW
<TableHead>City</TableHead>
<TableHead>Cluster</TableHead>
...
```

### **Table Cells (Line ~1044-1137):**
```typescript
// Basic Details
<TableCell>{record.physicallyHandicapped || record.physically_handicapped || 'N/A'}</TableCell>
<TableCell>{record.nationality || 'Indian'}</TableCell>
<TableCell>{record.internationalWorker || record.international_worker || 'N/A'}</TableCell>

// Job Details (NEW ORDER)
<TableCell>{record.legalEntity || record.legal_entity || 'N/A'}</TableCell>        // FIRST
<TableCell>{record.businessUnitName || record.business_unit_name || 'N/A'}</TableCell>
<TableCell>{record.functionName || record.function_name || 'N/A'}</TableCell>
<TableCell>{record.departmentName || record.department_name || 'N/A'}</TableCell>
<TableCell>{record.subDepartmentName || record.sub_department_name || 'N/A'}</TableCell>
<TableCell>{record.employmentType || record.employment_type || 'N/A'}</TableCell>  // NEW
<TableCell>{record.city || 'N/A'}</TableCell>
<TableCell>{record.cluster || 'N/A'}</TableCell>
...
```

---

## **6. BACKEND CHANGES**

### **File Updated:**
`server/controllers/onboardingController.ts`

### **Employment Type Calculation:**
```typescript
// Calculate employment type based on resume source
const employmentType = onboardingRecord.resume_source === 'vendor' ? 'Contract' : 'Permanent';
```

### **UPDATE Query (Line ~211-228):**
```sql
UPDATE onboarding SET 
  employee_id = ?, user_id = ?, email = ?, gender = ?, date_of_birth = ?, blood_group = ?,
  marital_status = ?,
  physically_handicapped = ?,        -- NEW
  nationality = ?,                    -- NEW
  international_worker = ?,           -- NEW
  pan_number = ?, name_as_per_pan = ?,
  ...
  legal_entity = ?,
  employment_type = ?,                -- NEW
  migrated_data = 'NO'
WHERE id = ?
```

### **INSERT Query (Line ~357-385):**
```sql
INSERT INTO onboarding (
  candidate_id, field_training_id, name, mobile_number, email, employee_id, user_id,
  gender, date_of_birth, blood_group, marital_status,
  physically_handicapped,           -- NEW
  nationality,                       -- NEW
  international_worker,              -- NEW
  name_as_per_aadhar, aadhar_number,
  ...
  legal_entity, 
  employment_type,                   -- NEW
  onboarding_status, migrated_data,
  created_at, updated_at
) VALUES (?, ?, ..., ?, 'yet_to_be_onboarded', 'YES', NOW(), NOW())
```

### **Values Array:**
```typescript
[
  ...
  record.physically_handicapped,
  record.nationality || 'Indian',
  record.international_worker,
  ...
  employmentType
]
```

---

## **7. COMPLETE FIELD ORDER**

### **Basic Details Section:**
```
1. Employee ID
2. User ID
3. Name
4. Phone Number
5. Email
6. Gender
7. Date of Birth
8. Blood Group
9. Marital Status
10. Physically Handicapped ← NEW
11. Nationality ← NEW
12. International Worker ← NEW
13. Name as per Aadhar
14. Aadhar Number
... (family, address, emergency contact)
```

### **Job Details Section:**
```
1. Entity ← FIRST
2. Business Unit ← SECOND
3. Function ← THIRD
4. Department ← FOURTH
5. Sub Department ← FIFTH
6. Employment Type ← NEW (SIXTH)
7. City
8. Cluster
9. Role
10. Manager
11. Date of Joining
12. Gross Salary
13. Resume Source Type
14. Resume Source Name
15. Cost Centre
```

### **Financial Details Section:**
```
(No changes - remains the same)
```

---

## **8. TESTING CHECKLIST**

### **✅ Database:**
- [x] New columns created
- [x] employment_type column added
- [x] physically_handicapped column added
- [x] nationality column added (default: Indian)
- [x] international_worker column added
- [x] Existing records updated with employment_type

### **✅ Frontend:**
- [x] Table headers show correct order (Entity first)
- [x] Table cells display in correct order
- [x] New basic detail fields visible
- [x] CSV export headers correct
- [x] CSV export data correct

### **✅ Backend:**
- [x] Controller calculates employment_type
- [x] UPDATE query includes new fields
- [x] INSERT query includes new fields
- [x] Bulk upload works with new fields

### **✅ Data Flow:**
- [x] Upload CSV with new fields
- [x] New records get employment_type auto-set
- [x] Export CSV shows new fields
- [x] Table displays all fields correctly

---

## **9. EXAMPLE DATA**

### **Sample Record (Vendor):**
```
Name: John Doe
Resume Source: vendor
Employment Type: Contract ← Auto-calculated
Entity: YULU
Business Unit: Yulu Mobility
Function: Yulu Ground Operations
Department: Revenue and Operations
Sub Department: Repair and Maintenance
Physically Handicapped: No
Nationality: Indian
International Worker: No
City: Bangalore
Role: Workshop Technician
```

### **Sample Record (Field Recruiter):**
```
Name: Jane Smith
Resume Source: field_recruiter
Employment Type: Permanent ← Auto-calculated
Entity: YULU
Business Unit: Yulu Mobility
Function: Yulu Ground Operations
Department: Revenue and Operations
Sub Department: Repair and Maintenance
Physically Handicapped: No
Nationality: Indian
International Worker: No
City: Hyderabad
Role: Workshop Technician
```

---

## **10. FILES CHANGED**

```
✅ server/sql/migrations/add_onboarding_new_fields.sql (new)
✅ server/controllers/onboardingController.ts (updated)
✅ client/src/pages/training/Onboarding.tsx (updated)
✅ ONBOARDING_FIELD_ORDER.md (documentation)
✅ ONBOARDING_UPDATES_COMPLETE.md (this file)
```

---

## **11. USAGE**

### **To Apply Database Changes:**
```bash
mysql -u hrms_user -phrms_password hrms_db < server/sql/migrations/add_onboarding_new_fields.sql
```

### **To Verify:**
```bash
# Check columns
mysql -u hrms_user -phrms_password hrms_db -e "DESCRIBE onboarding;"

# Check employment type distribution
mysql -u hrms_user -phrms_password hrms_db -e "
SELECT 
    resume_source,
    employment_type,
    COUNT(*) as count
FROM onboarding
GROUP BY resume_source, employment_type;
"
```

### **To Test Frontend:**
1. Go to `/training/onboarding`
2. Check table headers - Entity should be first in Job Details
3. Export CSV - verify column order
4. Import CSV with new fields
5. Verify data saves correctly

---

## **12. BUSINESS RULES**

### **Employment Type:**
- Automatically calculated from `resume_source`
- NOT user-editable (marked as "DO NOT EDIT" in CSV)
- Vendor source → Contract
- All other sources → Permanent

### **Nationality:**
- Defaults to "Indian" if not provided
- User can edit to any text value
- No validation constraints

### **Physically Handicapped & International Worker:**
- Text fields accepting any value
- Recommended values: Yes / No / NA
- No strict validation

---

## **✅ IMPLEMENTATION COMPLETE**

All requested changes have been implemented:
- ✅ Job Details reordered (Entity first, before City)
- ✅ Employment Type added (auto-calculated from resume source)
- ✅ Physically Handicapped field added
- ✅ Nationality field added (default: Indian)
- ✅ International Worker field added
- ✅ Database schema updated
- ✅ Frontend UI updated
- ✅ Backend API updated
- ✅ CSV export/import updated
- ✅ All fields accept text input
- ✅ Tested and committed

**Status:** 🎉 **READY FOR USE**
