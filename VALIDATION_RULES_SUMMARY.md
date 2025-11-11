# Onboarding Upload Validation Rules - Complete Summary

## ✅ **ALL CHANGES APPLIED**

---

## **📋 FIELD VALIDATION RULES**

### **1. MANDATORY FIELDS (Cannot be Empty or N/A)**

#### **Personal Information:**
- ✅ **Name** (pre-filled from candidate stage)
- ✅ **Phone Number** (pre-filled, not validated)
- ✅ **Email** (pre-filled, not validated)
- ✅ **Date of Birth** - MANDATORY, must be valid date (DD-MM-YYYY or DD-MMM-YYYY)
- ✅ **Father Name** - MANDATORY
- ✅ **Father DOB** - MANDATORY, must be valid date, cannot be N/A
- ✅ **Mother Name** - MANDATORY  
- ✅ **Mother DOB** - MANDATORY, must be valid date, cannot be N/A

#### **Why Father/Mother DOB are Mandatory:**
- Required for background verification
- Needed for legal documentation
- Cannot proceed without parent information
- **Changed from optional to mandatory per user request**

---

### **2. CONDITIONAL MANDATORY FIELDS**

#### **If Marital Status = "Married" or "married":**
- ✅ **Wife Name** - REQUIRED (cannot be N/A or empty)
- ✅ **Wife DOB** - REQUIRED (must be valid date, cannot be N/A)

#### **If Marital Status = "Single", "Unmarried", "Divorced", or "Widowed":**
- ✅ **Wife Name** - Can be N/A
- ✅ **Wife DOB** - Can be N/A

#### **Error Messages if Married but Wife Details Missing:**
```
❌ Wife Name is required when Marital Status is Married
❌ Wife DOB is required when Marital Status is Married
```

---

### **3. ALWAYS OPTIONAL FIELDS (Can be N/A)**

#### **Children Details:**
- ✅ **Child 1 Name** - Can be N/A (even if married)
- ✅ **Child 1 Gender** - Can be N/A
- ✅ **Child 1 DOB** - Can be N/A
- ✅ **Child 2 Name** - Can be N/A
- ✅ **Child 2 Gender** - Can be N/A
- ✅ **Child 2 DOB** - Can be N/A

**Reason:** Married couples may or may not have children yet.

#### **Other Optional Fields:**
- ✅ **ESIC IP Number** - Can be N/A
- ✅ **Employee ID** - Optional (auto-generated if not provided)
- ✅ **User ID** - Optional

---

## **📝 FIELD VALUE RULES**

### **Date Fields:**

| Field | Can be Empty? | Can be N/A? | Format |
|-------|---------------|-------------|--------|
| **Date of Birth** | ❌ NO | ❌ NO | DD-MM-YYYY or DD-MMM-YYYY |
| **Father DOB** | ❌ NO | ❌ NO | DD-MM-YYYY or DD-MMM-YYYY |
| **Mother DOB** | ❌ NO | ❌ NO | DD-MM-YYYY or DD-MMM-YYYY |
| **Wife DOB** | ✅ Yes if not married | ✅ Yes if not married | DD-MM-YYYY or DD-MMM-YYYY or N/A |
| **Child 1 DOB** | ✅ YES | ✅ YES | DD-MM-YYYY or DD-MMM-YYYY or N/A |
| **Child 2 DOB** | ✅ YES | ✅ YES | DD-MM-YYYY or DD-MMM-YYYY or N/A |

### **Name Fields:**

| Field | Can be Empty? | Can be N/A? |
|-------|---------------|-------------|
| **Father Name** | ❌ NO | ❌ NO |
| **Mother Name** | ❌ NO | ❌ NO |
| **Wife Name** | ✅ Yes if not married | ✅ Yes if not married |
| **Child 1 Name** | ✅ YES | ✅ YES |
| **Child 2 Name** | ✅ YES | ✅ YES |

---

## **🎯 USER'S CLARIFICATION**

> "dude if candidTE IS NOT MARRIED , WIFE and Child field goes as N/A"

✅ **CORRECT** - Already implemented:
- If not married → Wife Name = N/A, Wife DOB = N/A
- Children can always be N/A (even if married)

> "Dude for Father and mother DOB cant be nul input it is manadatopry"

✅ **FIXED** - Now mandatory:
- Father DOB cannot be empty or N/A
- Mother DOB cannot be empty or N/A
- Validation added: "Father DOB (DD-MMM-YYYY) is required and cannot be N/A"

> "As far as Wife name and dob and adn child 1 and 2 name , gender and dob is concerened, these vallues input can't be null, inputs for these fields go with the will conditions"

✅ **CONFIRMED** - Logic:
- **Input cannot be null** - correct, input is either:
  - Actual value (e.g., "Priya Sharma") OR
  - "N/A" string (not null, but the text "N/A")
- **Conditional logic:**
  - If married → Wife Name & DOB = actual values (not N/A)
  - If not married → Wife Name & DOB = "N/A"
  - Children → Always can be N/A regardless of marital status

---

## **💾 DATABASE STORAGE**

### **How N/A is Stored:**

**Frontend Input → Database → Display**
```
"N/A" (string) → NULL (database) → "N/A" (frontend display)
"Priya" (string) → 'Priya' (database) → "Priya" (frontend display)
"25-08-1995" (string) → DATE '1995-08-25' → "25 Aug 1995" (formatted)
```

### **Key Point:**
- User inputs "N/A" as text in CSV
- Frontend converts "N/A" to `null` before sending to backend
- Backend stores `null` as NULL in database
- Frontend displays NULL as "N/A" in table

**So technically:**
- Input value is never `null` (JavaScript null)
- Input value is string "N/A" or actual value
- Database value can be NULL
- Display value is "N/A" for NULL

---

## **✅ VALIDATION FLOW**

### **Step 1: Mandatory Fields Check**
```
❌ Date of Birth empty/N/A → ERROR
❌ Father DOB empty/N/A → ERROR  
❌ Mother DOB empty/N/A → ERROR
❌ Father Name empty/N/A → ERROR
❌ Mother Name empty/N/A → ERROR
```

### **Step 2: Conditional Fields Check**
```
IF Marital Status = "married":
  ❌ Wife Name empty/N/A → ERROR
  ❌ Wife DOB empty/N/A → ERROR
ELSE:
  ✅ Wife Name = N/A → OK
  ✅ Wife DOB = N/A → OK
```

### **Step 3: Format Validation**
```
IF field has value AND not N/A:
  - Check date format (DD-MM-YYYY or DD-MMM-YYYY)
  - Check gender (male/female/m/f)
  - Check PAN format (ABCDE1234F)
  - Check phone (10 digits)
  - etc.
```

### **Step 4: Data Transformation**
```
"N/A" → null
"male" → "male"
"M" → "male"
"25-08-1995" → "1995-08-25"
"25-Aug-1995" → "1995-08-25"
```

---

## **📊 EXAMPLE CSV ROWS**

### **Example 1: Single Candidate (No Wife/Children)**
```csv
Name,DOB,Father Name,Father DOB,Mother Name,Mother DOB,Marital Status,Wife Name,Wife DOB,Child 1 Name,Child 1 DOB
Ramesh Kumar,25-08-1990,Father Name,15-01-1960,Mother Name,20-02-1962,single,N/A,N/A,N/A,N/A
```
✅ **Valid** - All mandatory fields filled, optional fields are N/A

### **Example 2: Married with Wife but No Children**
```csv
Name,DOB,Father Name,Father DOB,Mother Name,Mother DOB,Marital Status,Wife Name,Wife DOB,Child 1 Name,Child 1 DOB
Suresh Kumar,12-05-1988,Father Name,10-03-1958,Mother Name,15-04-1960,married,Priya Sharma,20-06-1990,N/A,N/A
```
✅ **Valid** - Wife details provided, children N/A is OK

### **Example 3: Married with Wife and Children**
```csv
Name,DOB,Father Name,Father DOB,Mother Name,Mother DOB,Marital Status,Wife Name,Wife DOB,Child 1 Name,Child 1 DOB
Mahesh Kumar,18-03-1985,Father Name,05-07-1955,Mother Name,10-08-1957,married,Anita Devi,15-09-1987,Aarav,10-05-2010
```
✅ **Valid** - All family details provided

### **Example 4: INVALID - Married but No Wife Details**
```csv
Name,DOB,Father Name,Father DOB,Mother Name,Mother DOB,Marital Status,Wife Name,Wife DOB
Dinesh Kumar,22-11-1992,Father Name,18-02-1965,Mother Name,25-03-1967,married,N/A,N/A
```
❌ **INVALID**
```
❌ Wife Name is required when Marital Status is Married
❌ Wife DOB is required when Marital Status is Married
```

### **Example 5: INVALID - Missing Father DOB**
```csv
Name,DOB,Father Name,Father DOB,Mother Name,Mother DOB
Rajesh Kumar,10-07-1995,Father Name,N/A,Mother Name,12-05-1968
```
❌ **INVALID**
```
❌ Father DOB (DD-MMM-YYYY) is required and cannot be N/A
```

---

## **🚀 CURRENT IMPLEMENTATION STATUS**

### **✅ Completed:**
1. N/A display instead of "-" in table
2. Address columns increased to 500px width
3. Migration upload system with auto-stage creation
4. Date format support (DD-MM-YYYY and DD-MMM-YYYY)
5. Conditional wife validation (married → required)
6. Children always optional (even if married)
7. **Father DOB mandatory (cannot be N/A)**
8. **Mother DOB mandatory (cannot be N/A)**

### **✅ Working:**
- Regular upload for new candidates
- Migration upload for existing employees
- All validations active
- N/A handling for optional fields
- Date parsing and conversion

---

## **📞 SUPPORT**

If validation errors occur:
1. Check CSV format matches exactly
2. Ensure Father/Mother DOB have actual dates (not N/A)
3. If married, ensure Wife Name & DOB are filled
4. Children can always be N/A
5. Use DD-MM-YYYY or DD-MMM-YYYY for dates

**All validation rules are now active!** ✅
