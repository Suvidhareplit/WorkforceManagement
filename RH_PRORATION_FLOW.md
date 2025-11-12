# Restricted Holiday (RH) Proration & Management Flow

## 🎯 Complete Implementation Summary

### **1. RH Allocation by City**
Located in: **Leave Config Tab**

**Cities & Allocations:**
- Bangalore: **5 RH days/year**
- Hyderabad: **5 RH days/year**
- Mumbai: **6 RH days/year**
- Delhi: **6 RH days/year**
- Chennai: **6 RH days/year**
- Tamil Nadu: **6 RH days/year**

**Features:**
- Click any RH card → Opens **Month-wise Proration Modal**
- Shows breakdown: Jan=6, Feb=6, Mar=5, Apr=5, May=4, Jun=4, Jul=3, Aug=3, Sep=2, Oct=2, Nov=1, Dec=1
- Proration logic explained with examples

---

### **2. Month-wise Proration Logic**

**How It Works:**
```
Employee joins in January → Gets FULL allocation (5 or 6 RH days)
Employee joins in June → Gets ~50% allocation (2-3 RH days)
Employee joins in December → Gets 1 RH day only
```

**Database Storage:**
- Table: `leave_rh_allocation`
- Field: `month_allocation` (JSON)
- Example:
```json
{
  "Jan": 6, "Feb": 6, "Mar": 5, "Apr": 5,
  "May": 4, "Jun": 4, "Jul": 3, "Aug": 3,
  "Sep": 2, "Oct": 2, "Nov": 1, "Dec": 1
}
```

**Frontend Display:**
- Month cards showing allocation per month
- Join date determines how many RH days available
- Visual examples in modal

---

### **3. RH Holiday Date Management**
Located in: **Holiday Tab**

**Features:**
✅ **Year Selector** - View holidays for 2024, 2025, 2026, 2027
✅ **City Filter** - Filter by specific city or view all
✅ **Add Holiday** - Configure actual RH dates
✅ **Delete Holiday** - Remove with confirmation + reason

**Add Holiday Form:**
- Holiday Name (e.g., Diwali, Eid, Pongal)
- Holiday Date (date picker)
- Holiday Type (RH or Government)
- City (optional - makes it city-specific)
- State (optional)
- Description (optional)

**Database Storage:**
- Table: `leave_holidays`
- Fields: `holiday_name`, `holiday_date`, `holiday_type`, `city`, `state`
- Audit trail with change reason

---

### **4. Policy Assignment to Employees**

**When Policy is Assigned:**
1. Employee's **city** is identified
2. System fetches **RH allocation for that city** (5 or 6)
3. Employee's **join date** determines proration
4. Employee sees **only RH holidays for their city**

**Example Flow:**
```
Employee: John Doe
City: Bangalore
Join Date: June 15, 2025

Result:
- RH Allocation: 5 days (Bangalore base)
- Proration: Joined in June → Gets 3 RH days (prorated)
- Available Holidays: Only Bangalore RH holidays
- Selection: Can choose 3 out of available Bangalore RH dates
```

---

### **5. How Proration Applies**

**Scenario 1: Employee joins in January**
```
City: Mumbai (6 RH)
Join Month: January
Allocation: 6 RH days (full year)
Can select: 6 holidays from Mumbai RH list
```

**Scenario 2: Employee joins in July**
```
City: Bangalore (5 RH)
Join Month: July
Allocation: ~2-3 RH days (prorated for 6 months)
Can select: 2-3 holidays from Bangalore RH list
```

**Scenario 3: Employee joins in November**
```
City: Delhi (6 RH)
Join Month: November
Allocation: 1 RH day (prorated for 2 months)
Can select: 1 holiday from Delhi RH list
```

---

### **6. Technical Implementation**

**Backend API Endpoints:**
- `GET /api/leave/config` - Get leave configurations
- `GET /api/leave/rh-allocation` - Get RH allocations by city
- `GET /api/leave/holiday?year=2025&city=Bangalore` - Get holidays (filtered)
- `POST /api/leave/holiday` - Create new holiday
- `DELETE /api/leave/holiday/:id` - Delete holiday

**Database Tables:**
1. **leave_config** - Base leave type configurations
2. **leave_rh_allocation** - City-wise RH counts + month allocations
3. **leave_holidays** - Actual RH dates (Diwali, Eid, etc.)
4. **leave_policy_master** - Policy definitions
5. **leave_policy_mapping** - Leave types enabled per policy
6. **employee_leave_policy** - Policy assigned to employees
7. **leave_audit_trail** - All changes tracked

---

### **7. UI/UX Features**

**Leave Config Tab:**
- RH cards showing allocation per city
- "View Details →" link on hover
- Click card → Opens proration modal
- Month-wise breakdown in grid layout

**Holiday Tab:**
- Year dropdown (2024-2027)
- City filter dropdown
- "Add Holiday" button
- Table with Name, Date, Type, City, State, Actions
- Delete button with confirmation
- Empty state: "No holidays configured"

**Modals:**
1. **RH Proration Modal** - Month cards + examples
2. **Add Holiday Modal** - Form with all fields
3. **Confirm Action Modal** - Delete confirmation
4. **Change Reason Modal** - Mandatory for all changes

---

### **8. Testing the Flow**

**Step 1: View RH Allocations**
1. Go to Leave Management → Leave Config tab
2. Scroll down to "Restricted Holiday Allocations by City"
3. Click any city card (e.g., Bangalore - 5)
4. Modal opens showing month-wise breakdown

**Step 2: Add RH Holidays**
1. Go to Holiday tab
2. Select Year: 2025
3. Click "Add Holiday"
4. Fill form:
   - Name: Diwali
   - Date: 2025-11-01
   - Type: RH
   - City: Bangalore
5. Click "Add Holiday" → Reason modal → Enter reason → Confirm
6. Holiday added to list

**Step 3: View Holidays by City**
1. Holiday tab
2. City filter: Select "Bangalore"
3. See only Bangalore holidays
4. Change to "Mumbai" → See Mumbai holidays

**Step 4: Year Selection**
1. Holiday tab
2. Year dropdown: Select 2026
3. See 2026 holidays
4. Switch back to 2025

---

### **9. Policy Assignment Logic (Backend)**

When creating a policy for an employee:
```javascript
// Get employee details
const employee = await getEmployeeById(empId);
const city = employee.city; // "Bangalore"
const joinDate = new Date(employee.join_date); // "2025-06-15"
const joinMonth = joinDate.getMonth() + 1; // 6 (June)

// Get RH allocation for city
const rhAlloc = await getRHAllocationForCity(city, 2025);
// Result: { total_rh: 5, month_allocation: { Jun: 4, Jul: 3, ... } }

// Calculate prorated RH
const availableRH = rhAlloc.month_allocation[monthName(joinMonth)];
// Result: 4 RH days (joined in June)

// Get RH holidays for city
const rhHolidays = await getHolidaysForCity(city, 2025, 'RH');
// Result: [Diwali, Ganesh Chaturthi, Ugadi, ...]

// Assign to employee
await assignLeavePolicy({
  employee_id: empId,
  policy_id: policyId,
  rh_allocation: availableRH,
  available_rh_holidays: rhHolidays.map(h => h.id)
});
```

---

### **10. Future Enhancements**

**Planned Features:**
- [ ] Employee self-service: Select RH holidays from available list
- [ ] Auto-suggest RH dates based on past years
- [ ] Bulk upload RH holidays from CSV/Excel
- [ ] Calendar view of all holidays
- [ ] RH utilization reports per city
- [ ] Email notifications when new RH added

---

## ✅ **COMPLETE STATUS**

| Feature | Status | Tab |
|---------|--------|-----|
| RH Allocation by City | ✅ Done | Config |
| Month-wise Proration Display | ✅ Done | Config (Modal) |
| Add RH Holidays | ✅ Done | Holiday |
| Delete RH Holidays | ✅ Done | Holiday |
| Year Filter | ✅ Done | Holiday |
| City Filter | ✅ Done | Holiday |
| Change Reason Tracking | ✅ Done | All |
| Audit Trail | ✅ Done | Backend |
| Policy Creation | ✅ Done | Policy |
| Policy Assignment Logic | 🔄 Backend Ready | - |

---

## 🚀 **REFRESH BROWSER TO SEE ALL FEATURES!**
