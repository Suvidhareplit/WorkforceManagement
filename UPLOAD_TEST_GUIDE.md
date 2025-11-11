# Onboarding Upload Testing Guide

## ✅ ALL FIXES APPLIED

### 1. Database Schema ✅
All required columns exist in the `onboarding` table:
- ✅ `employee_id` (VARCHAR 50)
- ✅ `user_id` (VARCHAR 20)
- ✅ `email` (VARCHAR 255)
- ✅ `father_dob` (DATE)
- ✅ `bank_name` (VARCHAR 255)
- ✅ `legal_entity` (VARCHAR 255)
- ✅ All family fields (wife, children)
- ✅ All statutory fields (UAN, ESIC)

### 2. Backend Fixes ✅
- ✅ Email field added to UPDATE query
- ✅ Comprehensive logging added
- ✅ Error tracking improved
- ✅ affectedRows check added

### 3. Frontend Fixes ✅
- ✅ N/A value handling
- ✅ Conditional validation (married → wife required)
- ✅ Pre-filled fields skip validation
- ✅ Data normalization (dates, gender, etc.)
- ✅ Comprehensive field validation

## 🧪 HOW TO TEST

### Step 1: Open Browser Console
1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Keep it open during upload

### Step 2: Prepare Test CSV

Create a file with this data (married candidate):
```csv
Employee ID,User ID (numbers only),Name (DO NOT EDIT),Phone Number (DO NOT EDIT),Email (DO NOT EDIT),Gender,Date of Birth (DD-MMM-YYYY),Blood Group,Marital Status,Name as per Aadhar,Aadhar Number,Father Name,Father DOB (DD-MMM-YYYY),Mother Name,Mother DOB (DD-MMM-YYYY),Wife Name,Wife DOB (DD-MMM-YYYY),Child 1 Name,Child 1 Gender (male/female),Child 1 DOB (DD-MMM-YYYY),Child 2 Name,Child 2 Gender (male/female),Child 2 DOB (DD-MMM-YYYY),PAN Number,Name as Per PAN,Account Number,IFSC Code,Name as per Bank,Bank Name,UAN Number (12 digits),ESIC IP Number (10 digits or N/A),Legal Entity,Present Address,Permanent Address,Emergency Contact Name,Emergency Contact Number,Relation with Emergency Contact,Nominee Name,Nominee Relation
,USR001,Sagar Kumar,1234567890,sagar@gmail.com,male,12-Aug-1990,O+,married,SAGAR KUMAR,123456789012,Father Name,15-Jan-1960,Mother Name,20-Feb-1962,Wife Name,10-May-1992,Child Name,male,05-Jun-2015,N/A,N/A,N/A,ABCDE1234F,SAGAR KUMAR,12345678901234,SBIN0001234,SAGAR KUMAR,State Bank of India,123456789012,N/A,Entity1,123 Main St,123 Main St,Emergency Contact,9876543210,Brother,Nominee Name,Spouse
```

Or for single candidate (no wife/children):
```csv
Employee ID,User ID (numbers only),Name (DO NOT EDIT),Phone Number (DO NOT EDIT),Email (DO NOT EDIT),Gender,Date of Birth (DD-MMM-YYYY),Blood Group,Marital Status,Name as per Aadhar,Aadhar Number,Father Name,Father DOB (DD-MMM-YYYY),Mother Name,Mother DOB (DD-MMM-YYYY),Wife Name,Wife DOB (DD-MMM-YYYY),Child 1 Name,Child 1 Gender (male/female),Child 1 DOB (DD-MMM-YYYY),Child 2 Name,Child 2 Gender (male/female),Child 2 DOB (DD-MMM-YYYY),PAN Number,Name as Per PAN,Account Number,IFSC Code,Name as per Bank,Bank Name,UAN Number (12 digits),ESIC IP Number (10 digits or N/A),Legal Entity,Present Address,Permanent Address,Emergency Contact Name,Emergency Contact Number,Relation with Emergency Contact,Nominee Name,Nominee Relation
,USR001,Sagar Kumar,1234567890,sagar@gmail.com,male,12-Aug-1990,O+,single,SAGAR KUMAR,123456789012,Father Name,15-Jan-1960,Mother Name,20-Feb-1962,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,ABCDE1234F,SAGAR KUMAR,12345678901234,SBIN0001234,SAGAR KUMAR,State Bank of India,123456789012,N/A,Entity1,123 Main St,123 Main St,Emergency Contact,9876543210,Brother,Nominee Name,Father
```

### Step 3: Upload File
1. Go to Training → Onboarding page
2. Click "Upload Onboarding Details"
3. Select your CSV file
4. **Watch the preview dialog** - should show validation results

### Step 4: Check Console Logs

**FRONTEND LOGS (Browser Console):**
```
=== FRONTEND: Sending upload request ===
Number of records: 1
First record sample: {
  employee_id: null,
  user_id: "USR001",
  name: "Sagar Kumar",
  mobile_number: "1234567890",
  email: "sagar@gmail.com",
  gender: "male",
  date_of_birth: "1990-08-12",
  blood_group: "O+",
  marital_status: "married",
  ...
}
API endpoint: /api/onboarding/onboarding/bulk-upload

=== FRONTEND: Received response ===
Response: {
  message: "Bulk upload completed",
  results: {
    success: 1,
    failed: 0,
    errors: []
  }
}
```

**BACKEND LOGS (Terminal):**
```
=== BACKEND: Received bulk upload request ===
Request body keys: [ 'records' ]
Number of records received: 1
First record sample: {
  "employee_id": null,
  "user_id": "USR001",
  "name": "Sagar Kumar",
  "mobile_number": "1234567890",
  ...
}

--- Processing record: Sagar Kumar ---
Searching by name and phone: Sagar Kumar, 1234567890
Found by name+phone: 5
Updating onboarding record for: Sagar Kumar (ID: 5)
Update result: { ... affectedRows: 1 ... }
✅ Successfully updated: Sagar Kumar

=== BACKEND: Upload complete ===
Success: 1, Failed: 0
```

### Step 5: Verify Database
Check if data was actually inserted:
```bash
mysql -u hrms_user -phrms_password hrms_db -e "
SELECT 
  id, name, email, user_id, 
  marital_status, wife_name, wife_dob,
  pan_number, uan_number, bank_name
FROM onboarding 
WHERE name = 'Sagar Kumar' 
LIMIT 1;"
```

## 🔍 WHAT TO LOOK FOR

### ✅ SUCCESS INDICATORS:
1. **Validation Preview Shows:**
   - ✓ 1 Valid rows (green)
   - OR ⚠ Warnings (yellow) but still uploadable
   - No ❌ Errors (red)

2. **Browser Console Shows:**
   - "=== FRONTEND: Sending upload request ==="
   - "Number of records: 1"
   - "=== FRONTEND: Received response ==="
   - "success: 1, failed: 0"

3. **Terminal Shows:**
   - "=== BACKEND: Received bulk upload request ==="
   - "Found by name+phone: [ID]"
   - "✅ Successfully updated: Sagar Kumar"
   - "Success: 1, Failed: 0"

4. **UI Shows:**
   - Toast: "✓ Success: 1 | ✗ Failed: 0"
   - Table refreshes with new data
   - Progress bar reaches 100%

5. **Database Shows:**
   - Row updated with new values
   - Dates in YYYY-MM-DD format
   - N/A values as NULL

### ❌ FAILURE INDICATORS:

#### If Record Not Found:
```
❌ Onboarding record not found for: Sagar Kumar
```
**Solution:** Make sure the candidate exists in the onboarding table with matching name and phone.

#### If Validation Errors:
```
Preview dialog shows red errors
```
**Solution:** Fix the CSV data according to error messages.

#### If Database Error:
```
Error: Unknown column 'xyz' in 'field list'
```
**Solution:** Run the migration script again or check column names.

#### If Type Mismatch:
```
Error: Incorrect date value: '...' for column 'date_of_birth'
```
**Solution:** Check date format is DD-MMM-YYYY and converts to YYYY-MM-DD.

## 📊 VALIDATION RULES SUMMARY

### CONDITIONAL VALIDATIONS:
- **If Married:** Wife Name & DOB are REQUIRED
- **If Single/Divorced/Widowed:** Wife Name & DOB are OPTIONAL

### REQUIRED FIELDS:
- Name OR Employee ID
- (Phone and Email are pre-filled, not validated)

### FORMAT VALIDATIONS:
- **Dates:** DD-MMM-YYYY (e.g., 12-Aug-2025) or N/A
- **Phone:** 10 digits (pre-filled, not validated)
- **Email:** valid@email.com (pre-filled, not validated)
- **Gender:** male, female, m, f
- **Marital Status:** single, married, divorced, widowed
- **Blood Group:** A+, A-, B+, B-, AB+, AB-, O+, O-
- **Aadhar:** 12 digits (numbers only)
- **PAN:** ABCDE1234F (5 letters, 4 digits, 1 letter)
- **IFSC:** SBIN0001234 (4 letters, 0, 6 alphanumeric)
- **Account Number:** 9-18 digits
- **UAN:** 12 digits (numbers only)
- **ESIC:** 10 digits or N/A

### OPTIONAL FIELDS (Can be N/A or empty):
- Wife Name/DOB (unless married)
- Child 1/2 Name/Gender/DOB
- Father/Mother Name/DOB
- All other fields

## 🚀 TESTING CHECKLIST

- [ ] Download template
- [ ] Fill with test data (married scenario)
- [ ] Upload and check validation preview
- [ ] Confirm upload
- [ ] Check browser console for frontend logs
- [ ] Check terminal for backend logs
- [ ] Verify success toast message
- [ ] Check table refreshes with data
- [ ] Verify database has new values
- [ ] Test with single candidate (no wife/children)
- [ ] Test with invalid data (should show errors)

## 📝 REPORT ISSUES

If upload still fails, provide:
1. Screenshot of validation preview
2. Browser console logs (copy all text)
3. Terminal backend logs (copy all text)
4. CSV file content (first row)
5. Database query result for the candidate

This will help identify the exact issue!
