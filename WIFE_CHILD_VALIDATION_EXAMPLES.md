# Wife and Child Details Validation Examples

## ✅ CURRENT LOGIC (Already Working)

### **Scenario 1: Single/Unmarried - No Wife/Children** ✅
```csv
Marital Status: single
Wife Name: N/A
Wife DOB: N/A
Child 1 Name: N/A
Child 1 Gender: N/A
Child 1 DOB: N/A
Child 2 Name: N/A
Child 2 Gender: N/A
Child 2 DOB: N/A
```
**Result:** ✅ Valid - N/A accepted for all fields
**Database:** All fields stored as NULL
**Display:** Shows as `-` in table

---

### **Scenario 2: Married - WITH Wife Details** ✅
```csv
Marital Status: married
Wife Name: Priya Sharma
Wife DOB: 10-05-1992 OR 10-May-1992
Child 1 Name: N/A
Child 1 Gender: N/A
Child 1 DOB: N/A
```
**Result:** ✅ Valid - Wife details accepted, Children N/A accepted
**Database:** 
- Wife Name: "Priya Sharma"
- Wife DOB: "1992-05-10"
- Children fields: NULL
**Display:** 
- Wife Name: "Priya Sharma"
- Wife DOB: "10 May 1992"
- Child fields: `-`

---

### **Scenario 3: Married - WITH Wife AND Children** ✅
```csv
Marital Status: married
Wife Name: Priya Sharma
Wife DOB: 10-05-1992
Child 1 Name: Aarav Kumar
Child 1 Gender: male
Child 1 DOB: 15-08-2015
Child 2 Name: Ananya Kumar
Child 2 Gender: female
Child 2 DOB: 20-03-2018
```
**Result:** ✅ Valid - All details accepted
**Database:** All fields stored with actual values
**Display:** All fields show actual names, genders, and dates

---

### **Scenario 4: Married - Missing Wife Details** ❌
```csv
Marital Status: married
Wife Name: N/A
Wife DOB: N/A
```
**Result:** ❌ ERROR
**Errors:**
- "Wife Name is required when Marital Status is Married"
- "Wife DOB is required when Marital Status is Married"

---

### **Scenario 5: Married - Partial Wife Details** ❌
```csv
Marital Status: married
Wife Name: Priya Sharma
Wife DOB: N/A
```
**Result:** ❌ ERROR
**Error:** "Wife DOB is required when Marital Status is Married"

---

### **Scenario 6: Single - WITH Children (No Wife)** ✅
```csv
Marital Status: single
Wife Name: N/A
Wife DOB: N/A
Child 1 Name: Aarav Kumar
Child 1 Gender: male
Child 1 DOB: 15-08-2015
```
**Result:** ✅ Valid - Children can exist without wife
**Database:** 
- Wife fields: NULL
- Child 1: Actual values stored
**Use Case:** Single parent, divorced, etc.

---

## 📋 VALIDATION RULES SUMMARY

### **Mandatory When Married:**
- ✅ Wife Name (cannot be N/A)
- ✅ Wife DOB (cannot be N/A)

### **Always Optional:**
- ✅ Child 1 Name (can be N/A)
- ✅ Child 1 Gender (can be N/A)
- ✅ Child 1 DOB (can be N/A)
- ✅ Child 2 Name (can be N/A)
- ✅ Child 2 Gender (can be N/A)
- ✅ Child 2 DOB (can be N/A)

### **When Wife/Children PROVIDED:**
- ✅ Names must be valid text (not just N/A)
- ✅ Gender must be: male, female, m, f
- ✅ DOB must be valid date: DD-MM-YYYY or DD-MMM-YYYY

---

## 🔍 HOW N/A IS HANDLED

### **Frontend Processing:**
```javascript
// 1. trimOrNull() function
"N/A" → null
"  N/A  " → null (with spaces)
"na" → null (case insensitive)
"Priya" → "Priya" (actual value kept)

// 2. parseDateField() function
"N/A" → null
"25-08-1995" → "1995-08-25"
"25-Aug-1995" → "1995-08-25"
```

### **Backend Storage:**
```sql
NULL → Stored as NULL in database
"Priya" → Stored as 'Priya'
"1995-08-25" → Stored as DATE '1995-08-25'
```

### **Frontend Display:**
```
NULL → Shows as '-' in table
"Priya" → Shows as 'Priya'
"1995-08-25" → Shows as '25 Aug 1995'
```

---

## ✅ COMPLETE EXAMPLE CSV

```csv
Employee ID,User ID,Name,Phone,Email,Gender,Date of Birth,Blood Group,Marital Status,Name as per Aadhar,Aadhar Number,Father Name,Father DOB,Mother Name,Mother DOB,Wife Name,Wife DOB,Child 1 Name,Child 1 Gender,Child 1 DOB,Child 2 Name,Child 2 Gender,Child 2 DOB,PAN Number,Name as Per PAN,Account Number,IFSC Code,Name as per Bank,Bank Name,UAN Number,ESIC IP Number,Legal Entity,Present Address,Permanent Address,Emergency Contact Name,Emergency Contact Number,Relation with Emergency Contact,Nominee Name,Nominee Relation
YG0123,1234567,sagar K M,7411889572,kmsagar515@gmail.com,male,25-08-1995,O+,married,SAGAR K M,742482467235,Late Mahalingappa,15-01-1970,Manjula R,20-02-1972,Priya Sharma,10-05-1992,Aarav Kumar,male,15-08-2015,Ananya Kumar,female,20-03-2018,JCVPS6323A,SAGAR K M,560100300547,HDFC00000855,Sagar K M,HDFC,123456789012,N/A,YULU,Bangalore,Bangalore,Manjula,7026590193,Mother,Manjula,Mother
```

**This will:**
- ✅ Parse all dates correctly (numeric format)
- ✅ Save wife name "Priya Sharma"
- ✅ Save wife DOB "1992-05-10"
- ✅ Save child 1 details
- ✅ Save child 2 details
- ✅ Store ESIC as NULL (N/A)
- ✅ All fields display correctly in table

---

## 🚀 WHAT TO TEST

1. **Married with Wife only:**
   - Marital Status: married
   - Wife Name: Actual name
   - Wife DOB: Actual date
   - Children: N/A

2. **Married with Wife and Children:**
   - Marital Status: married
   - Wife Name: Actual name
   - Wife DOB: Actual date
   - Child 1: Name, Gender, DOB
   - Child 2: N/A OR actual details

3. **Single/Unmarried:**
   - Marital Status: single/unmarried
   - Wife: N/A
   - Children: N/A OR actual details (single parent)

**All these scenarios are ALREADY supported!** ✅
