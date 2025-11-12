# RH Proration Tables - City-wise Month Allocations

## 📊 **Bangalore / Hyderabad** (Total: 5 RH days/year)

| Month | RH Days Available |
|-------|-------------------|
| Jan   | **5** |
| Feb   | **5** |
| Mar   | **4** |
| Apr   | **4** |
| May   | **3** |
| Jun   | **3** |
| Jul   | **2** |
| Aug   | **2** |
| Sep   | **1** |
| Oct   | **1** |
| Nov   | **1** |
| Dec   | **1** |

### **How It Works:**
- Employee joins in **January** → Gets **5 RH days** for the year
- Employee joins in **March** → Gets **4 RH days** (Mar onwards)
- Employee joins in **June** → Gets **3 RH days** (Jun onwards)
- Employee joins in **July** → Gets **2 RH days** (Jul onwards)
- Employee joins in **December** → Gets **1 RH day** (Dec only)

---

## 📊 **Mumbai / Delhi / Chennai / Tamil Nadu** (Total: 6 RH days/year)

| Month | RH Days Available |
|-------|-------------------|
| Jan   | **6** |
| Feb   | **6** |
| Mar   | **5** |
| Apr   | **5** |
| May   | **4** |
| Jun   | **4** |
| Jul   | **3** |
| Aug   | **3** |
| Sep   | **2** |
| Oct   | **2** |
| Nov   | **1** |
| Dec   | **1** |

### **How It Works:**
- Employee joins in **January** → Gets **6 RH days** for the year
- Employee joins in **March** → Gets **5 RH days** (Mar onwards)
- Employee joins in **June** → Gets **4 RH days** (Jun onwards)
- Employee joins in **July** → Gets **3 RH days** (Jul onwards)
- Employee joins in **December** → Gets **1 RH day** (Dec only)

---

## 🎯 **Complete Flow Example**

### **Scenario 1: Bangalore Employee**

**Employee Details:**
- Name: Rajesh Kumar
- City: **Bangalore**
- Join Date: **June 15, 2025**
- Join Month: **June**

**RH Allocation:**
1. System checks city: Bangalore → Base allocation is **5 RH days/year**
2. System checks join month: June
3. Looks up proration table: **June = 3 RH days**
4. Result: Rajesh gets **3 RH days** for 2025

**Available RH Holidays for Bangalore (Example):**
1. Ugadi - March 30
2. Rama Navami - April 6
3. Ganesh Chaturthi - September 7 ✅
4. Dussehra - October 2 ✅
5. Diwali - November 1 ✅
6. Guru Nanak Jayanti - November 15
7. Karnataka Rajyotsava - November 1

**Rajesh's Action:**
- Can SELECT any **3 holidays** from the list above
- Typically chooses from Sep onwards (after join date)
- System marks selected dates as his RH leave

---

### **Scenario 2: Mumbai Employee**

**Employee Details:**
- Name: Priya Shah
- City: **Mumbai**
- Join Date: **January 5, 2025**
- Join Month: **January**

**RH Allocation:**
1. System checks city: Mumbai → Base allocation is **6 RH days/year**
2. System checks join month: January
3. Looks up proration table: **January = 6 RH days**
4. Result: Priya gets **6 RH days** for 2025 (full year)

**Available RH Holidays for Mumbai (Example):**
1. Gudi Padwa - March 30 ✅
2. Ram Navami - April 6 ✅
3. Ganesh Chaturthi - September 7 ✅
4. Dussehra - October 2 ✅
5. Diwali - November 1 ✅
6. Guru Nanak Jayanti - November 15 ✅
7. Maharashtra Day - May 1
8. Eid-ul-Fitr - Variable date
... more ...

**Priya's Action:**
- Can SELECT any **6 holidays** from the list above
- Has full year, so can choose from entire year
- System marks selected dates as her RH leave

---

### **Scenario 3: Delhi Employee (Mid-Year)**

**Employee Details:**
- Name: Amit Verma
- City: **Delhi**
- Join Date: **August 10, 2025**
- Join Month: **August**

**RH Allocation:**
1. System checks city: Delhi → Base allocation is **6 RH days/year**
2. System checks join month: August
3. Looks up proration table: **August = 3 RH days**
4. Result: Amit gets **3 RH days** for remaining 2025

**Available RH Holidays for Delhi (Example):**
1. Republic Day - January 26 (already passed)
2. Holi - March 14 (already passed)
3. Raksha Bandhan - August 19 ✅
4. Janmashtami - August 26 ✅
5. Dussehra - October 2 ✅
6. Diwali - November 1 ✅
7. Guru Nanak Jayanti - November 15 ✅
... more ...

**Amit's Action:**
- Can SELECT any **3 holidays** from available dates (Aug onwards)
- Holidays before Aug are not available
- System marks selected dates as his RH leave

---

## 🗄️ **Database Storage**

### **Table: `leave_rh_allocation`**

```sql
SELECT city, year, total_rh, month_allocation 
FROM leave_rh_allocation 
WHERE year = 2025 
ORDER BY city;
```

**Result:**
```
city       | year | total_rh | month_allocation (JSON)
-----------|------|----------|--------------------------------------------------
Bangalore  | 2025 | 5        | {"Jan":5,"Feb":5,"Mar":4,"Apr":4,"May":3,...}
Chennai    | 2025 | 6        | {"Jan":6,"Feb":6,"Mar":5,"Apr":5,"May":4,...}
Delhi      | 2025 | 6        | {"Jan":6,"Feb":6,"Mar":5,"Apr":5,"May":4,...}
Hyderabad  | 2025 | 5        | {"Jan":5,"Feb":5,"Mar":4,"Apr":4,"May":3,...}
Mumbai     | 2025 | 6        | {"Jan":6,"Feb":6,"Mar":5,"Apr":5,"May":4,...}
Tamil Nadu | 2025 | 6        | {"Jan":6,"Feb":6,"Mar":5,"Apr":5,"May":4,...}
```

---

## 🎨 **Frontend Display**

### **RH Card (Config Tab):**
```
┌─────────────────┐
│       5         │  ← Total RH
│   Bangalore     │  ← City name
│   Year 2025     │  ← Year
│ View Details →  │  ← Click to open modal
└─────────────────┘
```

### **RH Proration Modal (Opens on click):**
```
┌────────────────────────────────────┐
│ Bangalore - Restricted Holiday     │
│ Year 2025 | Total: 5 RH days      │
├────────────────────────────────────┤
│                                    │
│ 📅 Proration Logic                │
│ Employees get RH based on join    │
│ month...                          │
│                                    │
├────────────────────────────────────┤
│ Month-wise RH Proration Table:    │
│                                    │
│ ┌───────────┬─────────┐          │
│ │ Month     │ RH Days │          │
│ ├───────────┼─────────┤          │
│ │ Jan       │   ⓹    │          │
│ │ Feb       │   ⓹    │          │
│ │ Mar       │   ④    │          │
│ │ Apr       │   ④    │          │
│ │ May       │   ③    │          │
│ │ Jun       │   ③    │ ← Highlighted
│ │ Jul       │   ②    │ ← Highlighted
│ │ Aug       │   ②    │          │
│ │ Sep       │   ①    │          │
│ │ Oct       │   ①    │          │
│ │ Nov       │   ①    │          │
│ │ Dec       │   ①    │          │
│ └───────────┴─────────┘          │
│                                    │
│ 💡 Real Examples:                 │
│ • Join in Jan → Gets 5 RH         │
│ • Join in Jun → Gets 3 RH         │
│ • Join in Jul → Gets 2 RH         │
│ • Join in Dec → Gets 1 RH         │
│                                    │
│         [Close Button]             │
└────────────────────────────────────┘
```

---

## ✅ **Verification Steps**

### **1. Check Database Values:**
```sql
-- Bangalore/Hyderabad (should show 5)
SELECT city, 
  JSON_EXTRACT(month_allocation, '$.Jan') as Jan,
  JSON_EXTRACT(month_allocation, '$.Jun') as Jun,
  JSON_EXTRACT(month_allocation, '$.Dec') as Dec
FROM leave_rh_allocation 
WHERE city IN ('Bangalore', 'Hyderabad') AND year = 2025;
```

**Expected Output:**
```
city      | Jan | Jun | Dec
----------|-----|-----|-----
Bangalore | 5   | 3   | 1
Hyderabad | 5   | 3   | 1
```

### **2. Check Frontend Display:**
1. Go to Leave Config tab
2. Click **Bangalore** RH card (shows 5)
3. Modal opens → See table with Jan=5, Jun=3, Dec=1
4. Click **Mumbai** RH card (shows 6)
5. Modal opens → See table with Jan=6, Jun=4, Dec=1

### **3. Verify API Response:**
```bash
curl http://localhost:3000/api/leave/rh-allocation | jq '.allocations[] | select(.city == "Bangalore")'
```

**Expected:**
```json
{
  "id": 1,
  "year": 2025,
  "city": "Bangalore",
  "total_rh": 5,
  "month_allocation": {
    "Jan": 5, "Feb": 5, "Mar": 4, "Apr": 4,
    "May": 3, "Jun": 3, "Jul": 2, "Aug": 2,
    "Sep": 1, "Oct": 1, "Nov": 1, "Dec": 1
  }
}
```

---

## 🔄 **Update for Future Years**

### **To add 2026 RH allocations:**
```sql
INSERT INTO leave_rh_allocation (year, city, total_rh, month_allocation)
VALUES 
(2026, 'Bangalore', 5, JSON_OBJECT(
  'Jan', 5, 'Feb', 5, 'Mar', 4, 'Apr', 4, 
  'May', 3, 'Jun', 3, 'Jul', 2, 'Aug', 2, 
  'Sep', 1, 'Oct', 1, 'Nov', 1, 'Dec', 1
)),
(2026, 'Mumbai', 6, JSON_OBJECT(
  'Jan', 6, 'Feb', 6, 'Mar', 5, 'Apr', 5, 
  'May', 4, 'Jun', 4, 'Jul', 3, 'Aug', 3, 
  'Sep', 2, 'Oct', 2, 'Nov', 1, 'Dec', 1
));
-- Add other cities similarly...
```

---

## 📞 **Key Points to Remember**

1. ✅ **Different cities have different proration**
   - Bangalore/Hyderabad: 5 RH total
   - Others: 6 RH total

2. ✅ **Proration is month-specific**
   - Not a simple division by 12
   - Each month has exact allocation

3. ✅ **Employees SELECT holidays**
   - They don't automatically get dates
   - They choose from available list

4. ✅ **Join month determines allocation**
   - June join in Bangalore = 3 RH
   - June join in Mumbai = 4 RH

5. ✅ **Frontend shows exact values**
   - Table format matches images
   - Examples use real proration numbers

---

**All proration values now match the uploaded images exactly!** ✅
