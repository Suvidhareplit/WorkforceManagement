# Leave Management Frontend - Full Implementation Plan

## Current Status
✅ Backend: 100% Complete (13 APIs, database, audit trail)
⏳ Frontend: Placeholder only (needs full implementation)

## What User Sees Now
- 4 tabs with "coming soon" messages
- No data loading
- No forms or tables
- No API integration

## What User Wants
Full functional UI with:
1. Leave Config tab with table and inline editing
2. Policy tab with create/view/toggle
3. Holiday tab with add/delete
4. Audit tab with filters and details
5. All modals working
6. Complete API integration

## Implementation Required

### 1. Leave Config Tab
```typescript
- Load configs from /api/leave/config
- Display table with columns:
  * Leave Type
  * Display Name (editable input)
  * Annual Quota (editable number)
  * Monthly Accrual (editable number)
  * Prorate (toggle switch)
  * Eligibility Months (readonly)
  * Status badge
- On any change: Open Change Reason modal
- Show RH allocation cards below table
```

### 2. Policy Tab
```typescript
- Load policies from /api/leave/policy
- Display table with columns:
  * Policy Name
  * Policy Code
  * City
  * Employee Type
  * Effective Date
  * Status badge
  * Actions (View, Toggle)
- Create Policy button opens modal
- Preview button shows policy details
- Toggle opens confirm → reason modal
```

### 3. Holiday Tab
```typescript
- Year selector (2024, 2025, 2026)
- Load holidays from /api/leave/holiday?year=X
- Display table:
  * Date
  * Holiday Name
  * Type (Government/Restricted)
  * City
  * Delete button
- Add Holiday button opens modal
- Delete confirms → reason modal
```

### 4. Audit Tab
```typescript
- Filters:
  * Entity Type dropdown
  * Action Type dropdown
  * Start Date
  * End Date
- Load from /api/leave/audit with filters
- Display table:
  * Timestamp
  * Entity Type
  * Entity Name
  * Action
  * Changed By
  * Summary
  * View Details button
- View Details opens modal with old/new JSON
```

### 5. Modals Needed
```typescript
1. Change Reason Modal
   - Textarea (min 10 chars)
   - Cancel/Confirm buttons
   - Used for all edits

2. Create Policy Modal
   - Policy Name input
   - Policy Code input
   - Effective Date picker
   - City input
   - Employee Type select
   - Description textarea
   - On submit → reason modal

3. Create Holiday Modal
   - Holiday Name input
   - Date picker
   - Type select (Government/Restricted)
   - City input (optional)
   - On submit → reason modal

4. Policy Preview Modal
   - Show policy details
   - Table of leave types with allocations
   - Close button

5. Audit Detail Modal
   - Show full audit entry
   - Old value JSON
   - New value JSON
   - Reason text
   - Close button

6. Confirm Action Modal
   - Title
   - Message
   - Cancel/Confirm buttons
   - On confirm → reason modal
```

## File Size Considerations
The full implementation is ~700-800 lines of code, which exceeds token limits for a single write.

## Solution Options

### Option A: Split into Multiple Component Files (Recommended)
```
client/src/pages/leave/
├── LeaveManagement.tsx (main container, ~100 lines)
├── components/
│   ├── LeaveConfigTab.tsx (~150 lines)
│   ├── PolicyTab.tsx (~150 lines)
│   ├── HolidayTab.tsx (~100 lines)
│   ├── AuditTab.tsx (~100 lines)
│   └── modals/
│       ├── ChangeReasonModal.tsx (~50 lines)
│       ├── CreatePolicyModal.tsx (~100 lines)
│       ├── CreateHolidayModal.tsx (~80 lines)
│       ├── PolicyPreviewModal.tsx (~70 lines)
│       └── AuditDetailModal.tsx (~60 lines)
```

### Option B: Create Simplified Version First
- Basic tables with data loading
- Add forms/modals incrementally
- Test each feature as built

### Option C: Use Existing Code Generator
- Build with Cursor Composer
- Generate full file externally
- Copy into project

## Recommended Next Steps

1. **Create component folder structure**
2. **Implement LeaveConfigTab first** (most critical)
3. **Test API integration**
4. **Add other tabs incrementally**
5. **Implement modals last**

## Quick Start Implementation
Would you like me to:
A. Create the full working version split into components? (Best practice)
B. Create a simpler version with basic features first? (Fastest to see results)
C. Generate the complete 700-line file externally? (All-in-one but harder to maintain)

Choose an option and I'll proceed!
