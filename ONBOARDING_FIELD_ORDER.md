# Onboarding Job Details - Field Order Update

## 📋 **Change Summary**

The Job Details section in the Onboarding module has been reordered to follow a logical organizational hierarchy.

---

## ✅ **NEW ORDER**

### **Job Details Section:**
1. **Entity** (Legal Entity) - 🔹 **FIRST**
2. **Business Unit** - 🔹 **SECOND**
3. **Function** - 🔹 **THIRD**
4. **Department** - 🔹 **FOURTH**
5. **Sub Department** - 🔹 **FIFTH**
6. Resume Source Type
7. Resume Source Name
8. Cost Centre

### **Complete Job Details Order:**
- City
- Cluster
- Role
- Reporting Manager
- Date of Joining
- Gross Salary
- **Entity** ← NEW POSITION
- **Business Unit** ← NEW POSITION
- **Function** ← NEW POSITION
- **Department** ← NEW POSITION
- **Sub Department** ← NEW POSITION
- Resume Source Type
- Resume Source Name
- Cost Centre

---

## 🔄 **Before vs After**

### **❌ OLD ORDER:**
```
Role
├── Resume Source Type
├── Resume Source Name
├── Cost Centre
├── Function
├── Business Unit
├── Department
├── Sub Department
└── Legal Entity
```

### **✅ NEW ORDER:**
```
Role
├── Entity (Legal Entity)      ← Moved to top
├── Business Unit              ← Moved up
├── Function                   ← Moved up
├── Department                 ← Stays
├── Sub Department             ← Stays
├── Resume Source Type         ← Moved down
├── Resume Source Name         ← Moved down
└── Cost Centre                ← Moved down
```

---

## 🗄️ **Database Changes**

### **Migration File:**
`server/sql/migrations/reorder_job_details_columns.sql`

### **SQL Commands:**
```sql
-- Reorder columns in onboarding table
ALTER TABLE onboarding 
MODIFY COLUMN legal_entity VARCHAR(255) AFTER role;

ALTER TABLE onboarding 
MODIFY COLUMN business_unit_name VARCHAR(255) AFTER legal_entity;

ALTER TABLE onboarding 
MODIFY COLUMN function_name VARCHAR(255) AFTER business_unit_name;

ALTER TABLE onboarding 
MODIFY COLUMN department_name VARCHAR(255) AFTER function_name;

ALTER TABLE onboarding 
MODIFY COLUMN sub_department_name VARCHAR(255) AFTER department_name;
```

### **To Apply Migration:**
```bash
mysql -u hrms_user -phrms_password hrms_db < server/sql/migrations/reorder_job_details_columns.sql
```

### **Verify Column Order:**
```sql
SELECT 
    COLUMN_NAME,
    ORDINAL_POSITION,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'onboarding' 
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN (
        'role', 
        'legal_entity', 
        'business_unit_name', 
        'function_name', 
        'department_name', 
        'sub_department_name',
        'cost_centre'
    )
ORDER BY ORDINAL_POSITION;
```

**Expected Result:**
```
COLUMN_NAME           ORDINAL_POSITION
role                  9
legal_entity          10
business_unit_name    11
function_name         12
department_name       13
sub_department_name   14
manager_name          15
...
cost_centre           19
```

---

## 🎨 **Frontend Changes**

### **File Updated:**
`client/src/pages/training/Onboarding.tsx`

### **What Changed:**

#### **1. CSV Export Headers (Line ~115-122)**
```tsx
// OLD ORDER:
"Resume Source Type (DO NOT EDIT)",
"Resume Source Name (DO NOT EDIT)",
"Cost Centre (DO NOT EDIT)",
"Function (DO NOT EDIT)",
"Business Unit (DO NOT EDIT)",
"Department (DO NOT EDIT)",
"Sub Department (DO NOT EDIT)",
"Legal Entity",

// NEW ORDER:
"Legal Entity",
"Business Unit (DO NOT EDIT)",
"Function (DO NOT EDIT)",
"Department (DO NOT EDIT)",
"Sub Department (DO NOT EDIT)",
"Resume Source Type (DO NOT EDIT)",
"Resume Source Name (DO NOT EDIT)",
"Cost Centre (DO NOT EDIT)",
```

#### **2. CSV Export Data (Line ~195-202)**
```tsx
// OLD ORDER:
resumeSourceType,
resumeSourceName,
record.costCentre || record.cost_centre || '',
record.functionName || record.function_name || '',
record.businessUnitName || record.business_unit_name || '',
record.departmentName || record.department_name || '',
record.subDepartmentName || record.sub_department_name || '',
record.legalEntity || record.legal_entity || '',

// NEW ORDER:
record.legalEntity || record.legal_entity || '',
record.businessUnitName || record.business_unit_name || '',
record.functionName || record.function_name || '',
record.departmentName || record.department_name || '',
record.subDepartmentName || record.sub_department_name || '',
resumeSourceType,
resumeSourceName,
record.costCentre || record.cost_centre || '',
```

#### **3. Table Headers (Line ~954-961)**
```tsx
// OLD ORDER:
<TableHead>Resume Source Type</TableHead>
<TableHead>Resume Source Name</TableHead>
<TableHead>Cost Centre</TableHead>
<TableHead>Function</TableHead>
<TableHead>Business Unit</TableHead>
<TableHead>Department</TableHead>
<TableHead>Sub Department</TableHead>
<TableHead>Legal Entity</TableHead>

// NEW ORDER:
<TableHead>Entity</TableHead>              ← Renamed from "Legal Entity"
<TableHead>Business Unit</TableHead>
<TableHead>Function</TableHead>
<TableHead>Department</TableHead>
<TableHead>Sub Department</TableHead>
<TableHead>Resume Source Type</TableHead>
<TableHead>Resume Source Name</TableHead>
<TableHead>Cost Centre</TableHead>
```

#### **4. Table Cells (Line ~1100-1121)**
- Reordered `<TableCell>` components to match new header order
- Entity field now displays first
- Followed by Business Unit, Function, Department, Sub Department

---

## 📊 **Visual Comparison**

### **Table Display (OLD):**
```
| City | Cluster | Role | Manager | DOJ | Salary | Source Type | Source Name | Cost Centre | Function | Business Unit | Dept | Sub Dept | Legal Entity |
```

### **Table Display (NEW):**
```
| City | Cluster | Role | Manager | DOJ | Salary | Entity | Business Unit | Function | Dept | Sub Dept | Source Type | Source Name | Cost Centre |
```

---

## 🎯 **Benefits**

1. ✅ **Logical Hierarchy**
   - Follows organizational structure: Entity → BU → Function → Dept → Sub Dept

2. ✅ **Better UX**
   - Users see high-level organization first
   - Drill down to specific details

3. ✅ **Consistency**
   - Database order matches UI order
   - CSV export matches table display

4. ✅ **Clarity**
   - "Legal Entity" renamed to "Entity" (shorter, clearer)
   - Related fields grouped together

---

## 🧪 **Testing**

### **1. Verify Database:**
```sql
-- Check column order
DESCRIBE onboarding;

-- Or use:
SHOW COLUMNS FROM onboarding;
```

### **2. Test Frontend:**
1. Go to Onboarding page
2. Check table headers order
3. Export CSV and verify column order
4. Import CSV template and verify fields

### **3. Test Data Flow:**
1. Create new onboarding record
2. Verify fields save in correct order
3. Export and re-import to verify consistency

---

## 📝 **Notes**

- **Migration Already Applied:** ✅ Database columns reordered
- **Frontend Already Updated:** ✅ UI reflects new order
- **No Data Loss:** Column reordering doesn't affect existing data
- **Backward Compatible:** API responses still include all fields

---

## 🔄 **Rollback (If Needed)**

If you need to revert to the old order:

```sql
-- Rollback migration
ALTER TABLE onboarding 
MODIFY COLUMN cost_centre VARCHAR(255) AFTER gross_salary;

ALTER TABLE onboarding 
MODIFY COLUMN function_name VARCHAR(255) AFTER cost_centre;

ALTER TABLE onboarding 
MODIFY COLUMN business_unit_name VARCHAR(255) AFTER function_name;

ALTER TABLE onboarding 
MODIFY COLUMN department_name VARCHAR(255) AFTER business_unit_name;

ALTER TABLE onboarding 
MODIFY COLUMN sub_department_name VARCHAR(255) AFTER department_name;

ALTER TABLE onboarding 
MODIFY COLUMN legal_entity VARCHAR(255) AFTER sub_department_name;
```

Then revert the frontend changes in `Onboarding.tsx`.

---

## ✅ **Implementation Complete**

- [x] Database migration created
- [x] Database columns reordered
- [x] CSV export headers updated
- [x] CSV export data updated
- [x] Table headers updated
- [x] Table cells updated
- [x] "Legal Entity" renamed to "Entity"
- [x] All changes committed

**Status:** ✅ **READY FOR USE**
