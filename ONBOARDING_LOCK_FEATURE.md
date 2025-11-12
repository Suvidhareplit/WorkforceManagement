# Onboarding - Bulk Submission with Record Locking ✅

## 🎯 **FEATURE OVERVIEW**

This feature allows HR admins to mark multiple candidates as "onboarded" simultaneously with a confirmation dialog and automatic record locking to prevent future modifications.

---

## **1. KEY FEATURES**

### **✅ Bulk Selection**
- **Individual Checkboxes:** Each unlocked, pending record has a selection checkbox
- **Select All:** Master checkbox in table header selects all eligible records
- **Smart Filtering:** Only "Yet to be Onboarded" and unlocked records can be selected
- **Selection Count:** Badge shows how many records are currently selected
- **Submit Button:** Appears only when at least one record is selected

### **✅ Confirmation Dialog**
- **Pre-submission Validation:** Shows before marking records as onboarded
- **Submission Summary:** Displays count (single or bulk)
- **Comprehensive Disclaimer:** 4 key warnings about permanent locking
- **Acknowledgment Checklist:** User must read before submitting
- **Two-Step Process:** Select → Review → Confirm

### **✅ Record Locking**
- **Automatic:** Records locked immediately upon onboarding
- **Permanent:** Once locked, cannot be unlocked (admin-only override)
- **Visual Indicator:** 🔒 Locked badge in status column
- **Disabled Editing:** All checkboxes and edit functions disabled for locked records
- **Audit Trail:** Tracks who locked the record and when

---

## **2. USER INTERFACE**

### **Table Enhancements:**

#### **New "Select" Column:**
```
┌──────────┬────────┬──────────────────┬──────────┐
│ Select   │ Status │ Onboarded        │ ...      │
├──────────┼────────┼──────────────────┼──────────┤
│ [✓]      │ Select │ Yet to be        │          │
│ ─────────┤  All   │ Onboarded        │          │
│ [ ]      │ Status │ Yet to be        │          │
│          │        │ Onboarded        │          │
│ [ ]      │ Status │ Onboarded        │          │
│          │        │ 🔒 Locked        │          │
│ [✓]      │ Status │ Yet to be        │          │
│          │        │ Onboarded        │          │
└──────────┴────────┴──────────────────┴──────────┘
```

#### **Bulk Submit Button:**
```
┌─────────────────────────────────────────┐
│ Onboarding Records                      │
│                                         │
│  [2 selected]  [Submit 2 for Onboarding] │
└─────────────────────────────────────────┘
```

### **Confirmation Dialog:**

```
┌───────────────────────────────────────────────┐
│  ⚠️  Confirm Onboarding Submission            │
├───────────────────────────────────────────────┤
│                                               │
│  📋 Submission Summary                        │
│  You are about to mark 2 candidates as       │
│  onboarded.                                   │
│                                               │
│  ⚠️ IMPORTANT DISCLAIMER                      │
│  🔒 Record Locking: Once submitted, the       │
│     record(s) will be permanently locked.     │
│                                               │
│  ✓ Data Verification: Ensure all information │
│    is accurate.                               │
│                                               │
│  📋 Compliance: Confirm all documents are     │
│     completed.                                │
│                                               │
│  ⚠️ No Undo: This cannot be undone.           │
│                                               │
│  By clicking "Confirm & Submit", you          │
│  acknowledge:                                 │
│  • Verified all information                   │
│  • Completed all documentation                │
│  • Understand permanent locking               │
│  • Accept responsibility                      │
│                                               │
│  [ Cancel ]        [✓ Confirm & Submit]       │
└───────────────────────────────────────────────┘
```

---

## **3. WORKFLOWS**

### **Workflow 1: Single Record Onboarding**

```
1. User clicks "Onboarded" checkbox for a record
   ↓
2. Confirmation dialog appears with disclaimer
   ↓
3. User reviews and clicks "Confirm & Submit"
   ↓
4. Record marked as "onboarded"
5. Record locked (is_locked = TRUE)
6. locked_at = current timestamp
7. locked_by = current user ID
   ↓
8. Success toast: "1 record marked as onboarded and locked"
9. Table refreshes - record shows 🔒 Locked badge
10. Checkbox disabled - no further editing possible
```

### **Workflow 2: Bulk Onboarding**

```
1. User clicks checkboxes to select multiple records
   OR clicks "Select All" checkbox
   ↓
2. "Submit X for Onboarding" button appears
   ↓
3. User clicks submit button
   ↓
4. Confirmation dialog shows:
   - "You are about to mark X candidates as onboarded"
   - Full disclaimer
   ↓
5. User reviews and clicks "Confirm & Submit"
   ↓
6. Backend processes all selected IDs:
   - Validates each record
   - Skips already onboarded/locked
   - Marks remaining as onboarded + locked
   ↓
7. Success toast: "X record(s) marked as onboarded and locked"
8. Table refreshes
9. Selected records now show 🔒 Locked
10. Selection cleared automatically
```

### **Workflow 3: Attempting to Edit Locked Record**

```
1. User tries to click onboarded checkbox on locked record
   ↓
2. Checkbox is disabled
   ↓
3. Tooltip shows: "Record is locked and cannot be modified"
   ↓
4. No action taken - prevents accidental changes
```

---

## **4. DATABASE SCHEMA**

### **New Columns in `onboarding` Table:**

```sql
-- Lock status
is_locked BOOLEAN DEFAULT FALSE
  COMMENT 'Locks the record once onboarded - prevents further editing'

-- Lock timestamp
locked_at TIMESTAMP NULL
  COMMENT 'When the record was locked'

-- Lock user
locked_by INT NULL
  COMMENT 'User ID who locked the record'
  CONSTRAINT fk_onboarding_locked_by 
    FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE SET NULL
```

### **Indexes:**
```sql
-- Performance indexes
CREATE INDEX idx_onboarding_locked ON onboarding(is_locked);
CREATE INDEX idx_onboarding_status_locked ON onboarding(onboarding_status, is_locked);
```

### **Sample Data:**
```
id: 1
name: John Doe
onboarding_status: onboarded
is_locked: 1
locked_at: 2025-11-12 13:45:00
locked_by: 5
```

---

## **5. API ENDPOINT**

### **POST /api/onboarding/bulk-onboard**

#### **Request:**
```json
{
  "ids": [1, 2, 3, 5, 8]
}
```

#### **Success Response:**
```json
{
  "message": "Onboarding submission complete",
  "successCount": 5,
  "results": {
    "success": 5,
    "failed": 0,
    "locked": 0,
    "alreadyOnboarded": 0,
    "errors": []
  }
}
```

#### **Partial Success Response:**
```json
{
  "message": "Onboarding submission complete",
  "successCount": 3,
  "results": {
    "success": 3,
    "failed": 1,
    "locked": 1,
    "alreadyOnboarded": 0,
    "errors": [
      {
        "id": 2,
        "error": "Record not found"
      },
      {
        "id": 5,
        "error": "Record is already locked"
      }
    ]
  }
}
```

#### **Backend Logic:**
```typescript
1. Validate request (ids array required)
2. For each ID:
   a. Check if record exists
   b. Check if already locked → skip
   c. Check if already onboarded → skip
   d. Update: onboarded + locked + timestamps
3. Return summary with success/error counts
```

---

## **6. BUSINESS RULES**

### **Selection Rules:**
✅ **CAN SELECT:**
- Records with status = "Yet to be Onboarded"
- Records with is_locked = FALSE

❌ **CANNOT SELECT:**
- Records with status = "Onboarded"
- Records with is_locked = TRUE
- Records that don't exist

### **Locking Rules:**
✅ **LOCKED WHEN:**
- User clicks "Confirm & Submit" in dialog
- Status changes to "onboarded"
- is_locked set to TRUE immediately

❌ **CANNOT UNLOCK:**
- No UI option to unlock
- Only database admin can unlock directly
- Permanent by design for data integrity

### **Editing Rules:**
✅ **BEFORE LOCKING:**
- Can check/uncheck "Onboarded"
- Can edit all fields
- Can upload new data

❌ **AFTER LOCKING:**
- Cannot check/uncheck "Onboarded"
- Cannot edit any fields
- Cannot re-upload data for that record
- Cannot select for bulk operations

---

## **7. VALIDATION & ERROR HANDLING**

### **Frontend Validation:**
```typescript
// No records selected
if (selectedRecords.size === 0) {
  toast: "No Records Selected - Please select at least one record"
  return;
}

// Locked record selection attempt
if (record.is_locked) {
  checkbox.disabled = true;
  tooltip: "Record is locked"
}

// Already onboarded selection attempt
if (record.onboarding_status === 'onboarded') {
  checkbox.disabled = true;
  tooltip: "Already onboarded"
}
```

### **Backend Validation:**
```typescript
// Invalid request
if (!Array.isArray(ids) || ids.length === 0) {
  400 Bad Request: "Invalid request: ids array is required"
}

// Record not found
if (!record) {
  Skip + Add to errors: "Record not found"
}

// Already locked
if (record.is_locked) {
  Skip + Add to errors: "Record is already locked"
}

// Already onboarded
if (record.onboarding_status === 'onboarded') {
  Skip + Count as "alreadyOnboarded"
}
```

### **Error Messages:**
```
✅ Success: "5 record(s) marked as onboarded and locked"
⚠️ Partial: "3 of 5 records submitted (2 errors)"
❌ Error: "Failed to submit onboarding"
🔒 Locked: "Record is already locked"
✓ Already: "Record is already onboarded"
```

---

## **8. SECURITY & AUDIT**

### **Audit Trail:**
```sql
SELECT 
  o.id,
  o.name,
  o.onboarding_status,
  o.is_locked,
  o.locked_at,
  u.username as locked_by_user
FROM onboarding o
LEFT JOIN users u ON o.locked_by = u.id
WHERE o.is_locked = TRUE;
```

**Output:**
```
| ID | Name      | Status    | Locked | Locked At           | Locked By |
|----|-----------|-----------|--------|---------------------|-----------|
| 1  | John Doe  | onboarded | TRUE   | 2025-11-12 13:45:00 | admin     |
| 3  | Jane Smith| onboarded | TRUE   | 2025-11-12 14:20:00 | hr_user   |
```

### **Permission Requirements:**
- **View Onboarding:** Any authenticated user
- **Submit Onboarding:** Authenticated user with onboarding access
- **Unlock Record:** Database admin only (manual SQL required)

### **Data Integrity:**
- **Foreign Key:** locked_by → users(id) ensures valid user references
- **Cascading:** ON DELETE SET NULL preserves lock record even if user deleted
- **Indexes:** Fast queries for locked/unlocked filtering

---

## **9. TESTING CHECKLIST**

### **✅ Functional Testing:**
- [x] Single record confirmation works
- [x] Bulk selection works (multiple records)
- [x] Select All checkbox works
- [x] Deselect All works
- [x] Submit button appears when records selected
- [x] Submit button hidden when no records selected
- [x] Selection count badge shows correct number
- [x] Confirmation dialog shows for single record
- [x] Confirmation dialog shows for bulk records
- [x] Disclaimer displays all 4 points
- [x] Cancel button closes dialog without changes
- [x] Confirm & Submit locks records
- [x] Locked badge appears after submission
- [x] Checkboxes disabled for locked records
- [x] Already onboarded records cannot be selected
- [x] Tooltips show correct messages

### **✅ Backend Testing:**
- [x] Bulk onboard API endpoint works
- [x] Validates locked status before updating
- [x] Sets is_locked = TRUE
- [x] Sets locked_at timestamp
- [x] Sets locked_by user ID
- [x] Skips already locked records
- [x] Skips already onboarded records
- [x] Returns correct success count
- [x] Returns errors for failed records
- [x] Handles invalid IDs gracefully

### **✅ Edge Cases:**
- [x] Empty selection (shows error)
- [x] All records already locked (shows message)
- [x] Mix of locked and unlocked (only unlocked submitted)
- [x] Non-existent IDs (skipped with error)
- [x] User deleted after locking (locked_by = NULL, record persists)
- [x] Concurrent submissions (database handles atomically)

### **✅ UI/UX Testing:**
- [x] Loading states show during submission
- [x] Success toast displays correct message
- [x] Error toast displays on failure
- [x] Table refreshes after submission
- [x] Selection cleared after successful submission
- [x] Lock icon visible in status column
- [x] Disabled checkboxes have visual feedback
- [x] Tooltips are helpful and clear

---

## **10. USAGE INSTRUCTIONS**

### **For HR Admins:**

#### **To Onboard Single Candidate:**
1. Find the candidate in the table
2. Check if status is "Yet to be Onboarded"
3. Click the "Onboarded" checkbox
4. Review the confirmation dialog carefully
5. Read all 4 disclaimer points
6. Click "Confirm & Submit"
7. Wait for success message
8. Verify 🔒 Locked badge appears

#### **To Onboard Multiple Candidates:**
1. Review candidates to ensure data is complete
2. Click individual checkboxes for each candidate
   OR click "Select All" checkbox
3. Verify selection count is correct
4. Click "Submit X for Onboarding" button
5. Review confirmation dialog
6. Read disclaimer carefully
7. Click "Confirm & Submit"
8. Wait for success message (shows count)
9. Verify all selected records now show 🔒 Locked

#### **If Mistake After Locking:**
- Contact database administrator
- Provide record ID and reason for unlock
- Admin must manually unlock via SQL
- Discouraged - should verify before submitting

### **For Developers:**

#### **To Add Lock Check in Other Features:**
```typescript
// Check if record is locked before allowing edit
if (record.is_locked || record.is_locked) {
  return toast({
    title: "Cannot Edit",
    description: "This record is locked",
    variant: "destructive"
  });
}
```

#### **To Query Locked Records:**
```sql
-- Get all locked records
SELECT * FROM onboarding WHERE is_locked = TRUE;

-- Get recently locked (last 24 hours)
SELECT * FROM onboarding 
WHERE is_locked = TRUE 
  AND locked_at >= NOW() - INTERVAL 24 HOUR;

-- Get records locked by specific user
SELECT * FROM onboarding WHERE locked_by = 5;
```

#### **To Manually Unlock (Admin Only):**
```sql
-- ⚠️ USE WITH EXTREME CAUTION
UPDATE onboarding 
SET is_locked = FALSE,
    locked_at = NULL,
    locked_by = NULL
WHERE id = 1;
```

---

## **11. BENEFITS**

✅ **Data Integrity:**
- Prevents accidental modifications to completed records
- Ensures onboarded data remains consistent
- Audit trail for compliance

✅ **User Safety:**
- Confirmation dialog prevents mistakes
- Clear warnings before permanent actions
- No "oops" moments

✅ **Efficiency:**
- Bulk operations save time
- Select multiple candidates at once
- One confirmation for all

✅ **Compliance:**
- Track who completed onboarding
- Timestamp for audit purposes
- Permanent record of approval

✅ **Professional:**
- Clear workflows
- Proper disclaimers
- Enterprise-grade UX

---

## **12. TROUBLESHOOTING**

### **Issue: "Submit" button not appearing**
**Solution:** Check that at least one unlocked, pending record is selected

### **Issue: Cannot select a record**
**Causes:**
- Record is already onboarded → Expected behavior
- Record is locked → Expected behavior
- Check status column for 🔒 badge

### **Issue: Confirmation dialog not closing after submit**
**Solution:** Wait for API response (may take a few seconds for bulk)

### **Issue: Need to unlock a record**
**Solution:** Contact database administrator with:
- Record ID
- Candidate name
- Reason for unlock
- Required only in exceptional cases

### **Issue: "Already locked" error**
**Solution:** Record was locked previously - this is expected and safe to ignore

---

## **✅ FEATURE COMPLETE!**

**Status:** 🎉 **Ready for Production**

**Last Updated:** November 12, 2025

**Version:** 1.0

**Author:** Sagar K M

---

## **QUICK REFERENCE**

```
📋 SELECT → ⚠️ REVIEW → ✓ CONFIRM → 🔒 LOCK
```

**Remember:** Once locked, records cannot be easily unlocked. Always verify data before submitting!
