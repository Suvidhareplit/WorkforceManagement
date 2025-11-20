# Employee Exit Management System

## Overview

This document describes the changes made to the employee management system to handle employee exits more comprehensively.

## Database Changes

### Modified Columns

#### `working_status`
- **OLD**: `ENUM('active', 'inactive', 'terminated', 'resigned')`
- **NEW**: `ENUM('working', 'relieved')`
- **Logic**: 
  - `working`: Employee is currently active (date_of_exit is NULL or empty)
  - `relieved`: Employee has left the company (date_of_exit is set)

### New Columns

#### `exit_type`
- **Type**: `ENUM('voluntary', 'involuntary', 'absconding')`
- **Nullable**: Yes
- **Description**: Categorizes the type of employee exit

#### `exit_reason`
- **Type**: `TEXT`
- **Nullable**: Yes
- **Description**: Stores the specific reason for exit from predefined dropdown lists

## Exit Type Categories

### 1. Voluntary Exit
Employee chooses to leave the organization on their own accord.

**Available Reasons:**
1. Better Career Opportunity
2. Higher Studies / Education
3. Relocation (Family / Personal)
4. Health Reasons
5. Personal Reasons / Family Commitments
6. Job Role Mismatch
7. Compensation / Benefits
8. Work-Life Balance
9. Unhappy with Manager / Team
10. Lack of Growth / Learning Opportunities
11. Long Commute / Travel Fatigue
12. Returning to Hometown
13. Entrepreneurship / Self-employment
14. Retirement
15. Peer Influence / Reference

### 2. Involuntary Exit
Company terminates the employee's employment.

**Available Reasons:**
1. Performance Issues
2. Misconduct
3. Violation of Company Policy
4. Absenteeism / Job Abandonment
5. Redundancy / Downsizing
6. Disciplinary Termination
7. Medical Unfitness
8. Probation Non-confirmation
9. Background Verification Failure
10. Contract / Project Completion
11. ATL - Resign

### 3. Absconding
Employee leaves without proper notice or approval.

**Note:** Absconding typically doesn't require additional reason selection.

## Migration Instructions

### Step 1: Backup Database
```bash
mysqldump -u hrms_user -p hrms_db > backup_before_exit_management_$(date +%Y%m%d).sql
```

### Step 2: Run Migration
```bash
mysql -u hrms_user -p hrms_db < server/sql/migrations/update_employee_exit_management.sql
```

### Step 3: Verify Migration
```bash
mysql -u hrms_user -p hrms_db -e "DESCRIBE employees;"
```

**Expected Output Should Include:**
```
working_status  | enum('working','relieved') | NO   |     | working |
date_of_exit    | date                       | YES  |     | NULL    |
exit_type       | enum('voluntary','involuntary','absconding') | YES  |     | NULL    |
exit_reason     | text                       | YES  |     | NULL    |
```

## Usage in Code

### Backend (TypeScript)

#### Import Constants
```typescript
import {
  EXIT_TYPES,
  VOLUNTARY_EXIT_REASONS,
  INVOLUNTARY_EXIT_REASONS,
  getExitReasons,
  isValidExitReason,
} from './constants/exitReasons';
```

#### Validate Exit Data
```typescript
// Check if exit reason is valid for exit type
const isValid = isValidExitReason(EXIT_TYPES.VOLUNTARY, 'Retirement');

// Get all reasons for a specific exit type
const reasons = getExitReasons(EXIT_TYPES.VOLUNTARY);
```

### Frontend (React/TypeScript)

#### Import Constants
```typescript
import {
  EXIT_TYPES,
  getExitReasons,
  getExitTypeLabel,
} from '@/constants/exitReasons';
```

#### Example Dropdown Component
```tsx
const [exitType, setExitType] = useState<ExitType | ''>('');
const [exitReason, setExitReason] = useState('');

// Exit Type Dropdown
<Select value={exitType} onValueChange={setExitType}>
  <SelectTrigger>
    <SelectValue placeholder="Select Exit Type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value={EXIT_TYPES.VOLUNTARY}>Voluntary</SelectItem>
    <SelectItem value={EXIT_TYPES.INVOLUNTARY}>Involuntary</SelectItem>
    <SelectItem value={EXIT_TYPES.ABSCONDING}>Absconding</SelectItem>
  </SelectContent>
</Select>

// Exit Reason Dropdown (conditional)
{exitType && exitType !== EXIT_TYPES.ABSCONDING && (
  <Select value={exitReason} onValueChange={setExitReason}>
    <SelectTrigger>
      <SelectValue placeholder="Select Reason" />
    </SelectTrigger>
    <SelectContent>
      {getExitReasons(exitType).map((reason) => (
        <SelectItem key={reason} value={reason}>
          {reason}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
```

## Testing

### Run Test Suite
```bash
cd server
npx tsx tests/test-exit-management.ts
```

### Expected Test Results
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Employee Exit Management - Test Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Group: Exit Types
✓ EXIT_TYPES.VOLUNTARY should equal "voluntary"
✓ EXIT_TYPES.INVOLUNTARY should equal "involuntary"
✓ EXIT_TYPES.ABSCONDING should equal "absconding"

Test Group: Voluntary Exit Reasons
✓ Should have 15 voluntary exit reasons
✓ Should contain "Better Career Opportunity"
✓ Should contain "Retirement"
✓ Should contain "Work-Life Balance"

Test Group: Involuntary Exit Reasons
✓ Should have 11 involuntary exit reasons
✓ Should contain "Performance Issues"
✓ Should contain "ATL - Resign"
✓ Should contain "Misconduct"

... (all tests passing)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Passed: 27
✗ Failed: 0
Total Tests: 27

🎉 All tests passed!
```

## Database Queries

### Get All Working Employees
```sql
SELECT * FROM employees WHERE working_status = 'working';
```

### Get All Relieved Employees
```sql
SELECT * FROM employees WHERE working_status = 'relieved';
```

### Get Employees by Exit Type
```sql
SELECT * FROM employees 
WHERE working_status = 'relieved' 
  AND exit_type = 'voluntary';
```

### Get Exit Statistics
```sql
SELECT 
  exit_type,
  COUNT(*) as count,
  GROUP_CONCAT(DISTINCT exit_reason SEPARATOR '; ') as reasons
FROM employees
WHERE working_status = 'relieved'
GROUP BY exit_type;
```

### Get Most Common Exit Reasons
```sql
SELECT 
  exit_type,
  exit_reason,
  COUNT(*) as count
FROM employees
WHERE working_status = 'relieved' AND exit_reason IS NOT NULL
GROUP BY exit_type, exit_reason
ORDER BY count DESC
LIMIT 10;
```

## API Updates Needed

### Update Employee Controller

You'll need to update the employee controller to handle the new fields:

```typescript
// When initiating employee exit
async initiateExit(req: Request, res: Response) {
  const { employeeId, exitType, exitReason, dateOfExit, lwd } = req.body;
  
  // Validate exit type and reason
  if (!isValidExitReason(exitType, exitReason)) {
    return res.status(400).json({ 
      error: 'Invalid exit reason for the selected exit type' 
    });
  }
  
  // Update employee record
  await db.query(
    `UPDATE employees 
     SET exit_type = ?, 
         exit_reason = ?, 
         date_of_exit = ?, 
         lwd = ?,
         working_status = 'relieved'
     WHERE employee_id = ?`,
    [exitType, exitReason, dateOfExit, lwd, employeeId]
  );
  
  return res.json({ message: 'Exit initiated successfully' });
}
```

## Frontend Component Updates

### Employee Profile - Add Exit Information Section

When viewing an employee profile, show exit information if the employee is relieved:

```tsx
{employee.workingStatus === 'relieved' && (
  <Card>
    <CardHeader>
      <CardTitle>Exit Information</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <InfoRow label="Exit Type" value={getExitTypeLabel(employee.exitType)} />
        <InfoRow label="Exit Reason" value={employee.exitReason} />
        <InfoRow label="Date of Exit" value={formatDate(employee.dateOfExit)} />
        <InfoRow label="Last Working Day" value={formatDate(employee.lwd)} />
      </div>
    </CardContent>
  </Card>
)}
```

## Important Notes

1. **Working Status is Derived**: The `working_status` should be automatically determined based on whether `date_of_exit` is set or not.

2. **Absconding Has No Reason**: When exit type is "absconding", the `exit_reason` field typically remains NULL or empty.

3. **Data Integrity**: The migration maintains all existing data while updating the enum values.

4. **Backwards Compatibility**: The migration maps old status values to new ones before changing the enum definition.

## Rollback Instructions

If you need to rollback the migration:

```sql
-- Restore from backup
mysql -u hrms_user -p hrms_db < backup_before_exit_management_YYYYMMDD.sql
```

## Support

For issues or questions about this implementation, please refer to:
- Migration file: `server/sql/migrations/update_employee_exit_management.sql`
- Constants: `server/constants/exitReasons.ts`
- Test suite: `server/tests/test-exit-management.ts`
