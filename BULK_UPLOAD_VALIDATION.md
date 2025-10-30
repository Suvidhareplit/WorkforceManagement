# Candidate Application - Open Position Validation

## Feature Overview
Both single and bulk candidate applications now validate that positions are open before allowing submissions. This ensures candidates are only added to active hiring requests.

## Validation Rules

### 1. Open Position Check
- **Rule**: Each candidate must have a corresponding open hiring request
- **Validation**: System checks if there's an open hiring request for the combination of:
  - City
  - Cluster  
  - Role

### 2. Behavior
- ✅ **Valid Entries**: Candidates with open positions are uploaded successfully
- ❌ **Invalid Entries**: Candidates without open positions are rejected with error message
- 📊 **Mixed Files**: Files can contain both valid and invalid entries - only valid ones are uploaded

## Error Messages

### No Open Position
```
No open position found for this combination of City, Cluster, and Role. Please create a hiring request first.
```

**When this occurs:**
- No hiring request exists for the city-cluster-role combination
- Hiring request exists but status is not 'open' (e.g., 'closed', 'called_off')

**Resolution:**
1. Go to Hiring Requests page
2. Create a new hiring request for the required city, cluster, and role
3. Ensure the status is 'open'
4. Re-upload the candidate

## Example Scenarios

### Scenario 1: All Valid Entries
**CSV Content:**
```csv
name,phone,aadharNumber,email,role,city,cluster,qualification,resumeSource,sourceName
John Doe,9876543210,111111111111,john@example.com,Quality Check Associate,Bangalore,Hebbal,Graduation,referral,Jane Smith
```

**Result:** ✅ All candidates uploaded successfully

### Scenario 2: Mixed Valid/Invalid Entries
**CSV Content:**
```csv
name,phone,aadharNumber,email,role,city,cluster,qualification,resumeSource,sourceName
John Doe,9876543210,111111111111,john@example.com,Quality Check Associate,Bangalore,Hebbal,Graduation,referral,Jane Smith
Jane Smith,9876543211,222222222222,jane@example.com,Workshop Technician,Bangalore,Hebbal,B.Tech,referral,Bob Johnson
```

**Assuming:**
- Open position exists for: Quality Check Associate + Bangalore + Hebbal ✅
- No open position for: Workshop Technician + Bangalore + Hebbal ❌

**Result:**
- ✅ John Doe uploaded successfully
- ❌ Jane Smith rejected with error: "No open position found for this combination of City, Cluster, and Role"

### Scenario 3: All Invalid Entries
**CSV Content:**
```csv
name,phone,aadharNumber,email,role,city,cluster,qualification,resumeSource,sourceName
John Doe,9876543210,111111111111,john@example.com,Bike Washer,Delhi,Connaught Place,Graduation,referral,Jane Smith
```

**Assuming:** No open position exists for this combination

**Result:** ❌ All candidates rejected with appropriate error messages

## Implementation Details

### Backend Changes

#### Single Application Validation
**File:** `server/controllers/interviewController.ts`

1. **Fetch Master Data**
   ```typescript
   const cities = await storage.getCities();
   const clusters = await storage.getClusters();
   const roles = await storage.getRoles();
   ```

2. **Validate Names to IDs**
   ```typescript
   const city = cities.find((c: any) => c.name.toLowerCase() === mappedData.city?.toLowerCase());
   const cluster = clusters.find((cl: any) => cl.name.toLowerCase() === mappedData.cluster?.toLowerCase());
   const role = roles.find((r: any) => r.name.toLowerCase() === mappedData.role?.toLowerCase());
   ```

3. **Check Open Position**
   ```typescript
   const openRequests = await storage.getHiringRequests({ 
     status: 'open',
     cityId: city.id,
     clusterId: cluster.id,
     roleId: role.id
   });
   
   if (!openRequests || openRequests.length === 0) {
     return res.status(400).json({ 
       message: `No open position found for ${role.name} in ${city.name} - ${cluster.name}. Please contact HR to create a hiring request first.` 
     });
   }
   ```

#### Bulk Upload Validation
**File:** `server/controllers/bulkUploadController.ts`

1. **Fetch Open Positions**
   ```typescript
   const hiringRequests = await storage.getHiringRequests({ status: 'open' });
   ```

2. **Create Position Map**
   ```typescript
   const openPositionsMap = new Map<string, any>();
   hiringRequests.forEach(request => {
     const key = `${request.cityId}-${request.clusterId}-${request.roleId}`;
     openPositionsMap.set(key, request);
   });
   ```

3. **Validate Each Row**
   ```typescript
   if (row.cityId && row.clusterId && row.roleId) {
     const positionKey = `${row.cityId}-${row.clusterId}-${row.roleId}`;
     const openPosition = openPositionsMap.get(positionKey);
     
     if (!openPosition) {
       row.errors.push({ 
         row: row.row, 
         field: 'position', 
         value: `${row.city} - ${row.cluster} - ${row.role}`, 
         message: `No open position found for this combination of City, Cluster, and Role. Please create a hiring request first.` 
       });
     }
   }
   ```

## Testing

### Test File
A test CSV file is provided: `test_bulk_upload_validation.csv`

This file contains:
- 2 valid entries (open positions exist)
- 2 invalid entries (no open positions)

### Expected Results
- Valid entries: Successfully uploaded
- Invalid entries: Rejected with error messages
- Total uploaded: 2 out of 4

## Best Practices

1. **Create Hiring Requests First**
   - Always create hiring requests before bulk uploading candidates
   - Ensure hiring requests are in 'open' status

2. **Verify Master Data**
   - Ensure cities, clusters, and roles exist in master data
   - Use exact names as they appear in the system

3. **Review Validation Report**
   - Check the validation report before confirming upload
   - Fix any errors and re-upload rejected entries

4. **Monitor Open Positions**
   - Keep track of which positions are open
   - Close positions when filled to prevent unnecessary uploads

## API Endpoints

### Validate Bulk Upload
- **Endpoint:** `POST /api/candidates/bulk-upload/validate`
- **Returns:** Validation report with errors for each row
- **New Validation:** Checks for open positions

### Process Bulk Upload
- **Endpoint:** `POST /api/candidates/bulk-upload/process`
- **Behavior:** Only uploads candidates that passed validation
- **Result:** Success/failure count with details
