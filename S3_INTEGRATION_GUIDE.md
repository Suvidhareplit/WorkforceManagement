# Amazon S3 Integration Guide - Leave Management Attachments

## 📋 **Overview**

Complete AWS S3 integration for file attachments in the Leave Management System. Supports medical certificates, supporting documents, and other attachments with secure presigned URLs.

---

## ✅ **What's Implemented**

### **Backend:**
- ✅ S3 Service (`server/services/s3Service.ts`)
- ✅ Multer middleware for file uploads (`server/middleware/uploadMiddleware.ts`)
- ✅ Attachment controller with full CRUD (`server/controllers/attachmentController.ts`)
- ✅ Database tables for metadata (`leave_attachments`, `leave_applications`)
- ✅ API routes for upload/download/delete
- ✅ Presigned URLs for secure access
- ✅ File type validation
- ✅ Size limits (10MB default)
- ✅ Audit trail integration

### **Frontend:**
- ✅ FileUpload component (`client/src/components/FileUpload.tsx`)
- ✅ Upload progress indicator
- ✅ File preview
- ✅ Drag & drop support (ready)
- ✅ Success/error notifications

### **Database:**
- ✅ `leave_attachments` table
- ✅ `leave_applications` table (for future use)
- ✅ Indexes and foreign keys
- ✅ Soft delete support

---

## 🚀 **Setup Instructions**

### **Step 1: Install Dependencies**
```bash
cd server
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer multer-s3 uuid
```

✅ **Already done!**

### **Step 2: Run Database Migration**
```bash
mysql -u hrms_user -phrms_password hrms_db < server/sql/migrations/add_leave_attachments_table.sql
```

✅ **Already done!**

### **Step 3: Create AWS S3 Bucket**

1. **Go to AWS Console**: https://aws.amazon.com/s3/
2. **Create Bucket:**
   - Click "Create bucket"
   - Bucket name: `hrms-leave-attachments-prod` (must be globally unique)
   - Region: `ap-south-1` (Mumbai) or closest to your users
   - Block all public access: ✅ **ENABLED** (security best practice)
   - Bucket versioning: ✅ **ENABLED** (optional but recommended)
   - Encryption: ✅ **ENABLED** (use SSE-S3)
   - Click "Create bucket"

3. **Set CORS Policy:**
   - Go to Bucket > Permissions > CORS
   - Paste this:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
   - Click "Save changes"

### **Step 4: Create IAM User**

1. **Go to IAM Console**: https://console.aws.amazon.com/iam/
2. **Create User:**
   - Click "Users" > "Add users"
   - User name: `hrms-s3-uploader`
   - Access type: ✅ **Programmatic access**
   - Click "Next: Permissions"

3. **Attach Policy:**
   - Option A: Use `AmazonS3FullAccess` (easier but more permissions)
   - Option B: Create custom policy (recommended):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket",
           "s3:HeadObject"
         ],
         "Resource": [
           "arn:aws:s3:::hrms-leave-attachments-prod/*",
           "arn:aws:s3:::hrms-leave-attachments-prod"
         ]
       }
     ]
   }
   ```
   - Click "Next" > "Create user"

4. **Save Credentials:**
   - ⚠️ **IMPORTANT**: Copy Access Key ID and Secret Access Key
   - You won't see the secret key again!
   - Store securely (password manager recommended)

### **Step 5: Configure Environment Variables**

1. **Copy .env.example:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file:**
   ```bash
   # AWS S3 Configuration
   AWS_REGION=ap-south-1
   AWS_S3_REGION=ap-south-1
   AWS_S3_BUCKET=hrms-leave-attachments-prod
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

3. **Restart Server:**
   ```bash
   npm run dev
   ```

4. **Check Console:**
   ```
   🔧 Initializing S3 service...
   ✅ S3 Service initialized - Region: ap-south-1, Bucket: hrms-leave-attachments-prod
   ```

---

## 🧪 **Testing**

### **Test 1: Check S3 Status**
```bash
curl http://localhost:3000/api/attachments/status
```

**Expected Response:**
```json
{
  "configured": true,
  "message": "S3 service is ready for file uploads",
  "bucket": "hrms-leave-attachments-prod",
  "region": "ap-south-1"
}
```

### **Test 2: Upload a File**
```bash
curl -X POST http://localhost:3000/api/attachments/upload \
  -F "file=@/path/to/test.pdf" \
  -F "employee_id=1" \
  -F "attachment_type=MEDICAL_CERTIFICATE" \
  -F "description=Test upload"
```

**Expected Response:**
```json
{
  "message": "File uploaded successfully",
  "attachment": {
    "id": 1,
    "employee_id": 1,
    "file_name": "test.pdf",
    "file_key": "leave-attachments/test-uuid.pdf",
    "file_url": "https://hrms-leave-attachments-prod.s3.ap-south-1.amazonaws.com/...",
    "file_size": 12345,
    "file_type": "application/pdf",
    "attachment_type": "MEDICAL_CERTIFICATE"
  }
}
```

### **Test 3: Get Presigned URL**
```bash
curl http://localhost:3000/api/attachments/1/download
```

**Expected Response:**
```json
{
  "presignedUrl": "https://hrms-leave-attachments-prod.s3.ap-south-1.amazonaws.com/...?X-Amz-...",
  "expiresIn": 3600,
  "fileName": "test.pdf",
  "fileType": "application/pdf"
}
```

### **Test 4: List Employee Attachments**
```bash
curl http://localhost:3000/api/attachments/employee/1
```

### **Test 5: Delete Attachment**
```bash
curl -X DELETE http://localhost:3000/api/attachments/1
```

---

## 🎨 **Frontend Integration**

### **Option 1: Use FileUpload Component**
```tsx
import { FileUpload } from '@/components/FileUpload';

function LeaveApplicationForm() {
  const handleUploadComplete = (attachment: any) => {
    console.log('File uploaded:', attachment);
    // Save attachment ID to your leave application
  };

  return (
    <div>
      <h3>Upload Medical Certificate</h3>
      <FileUpload
        employeeId={123}
        attachmentType="MEDICAL_CERTIFICATE"
        onUploadComplete={handleUploadComplete}
        maxSizeMB={10}
      />
    </div>
  );
}
```

### **Option 2: Custom Upload**
```tsx
const handleUpload = async (file: File, employeeId: number) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('employee_id', employeeId.toString());
  formData.append('attachment_type', 'SUPPORTING_DOCUMENT');

  const response = await fetch('/api/attachments/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.attachment;
};
```

---

## 📁 **File Structure**

```
WorkforceManagement/
├── server/
│   ├── services/
│   │   └── s3Service.ts              ✅ S3 client & operations
│   ├── middleware/
│   │   └── uploadMiddleware.ts       ✅ Multer config
│   ├── controllers/
│   │   └── attachmentController.ts   ✅ Upload/download logic
│   ├── routes/
│   │   └── attachmentRoutes.ts       ✅ API endpoints
│   └── sql/migrations/
│       └── add_leave_attachments_table.sql  ✅ DB schema
├── client/
│   └── src/
│       └── components/
│           └── FileUpload.tsx        ✅ Upload UI component
├── .env.example                      ✅ Config template
└── S3_INTEGRATION_GUIDE.md          ✅ This file
```

---

## 🔐 **Security Features**

### **1. Presigned URLs (Already Implemented)**
- Files accessed via temporary presigned URLs
- URLs expire after 1 hour (configurable)
- No direct S3 bucket access from frontend

### **2. File Type Validation**
- Allowed: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX
- Rejected: EXE, SH, JS, etc.

### **3. Size Limits**
- Max 10MB per file (configurable)
- Enforced at middleware level

### **4. Access Control**
- S3 bucket blocks all public access
- Only authenticated users can upload
- Employee-specific access (future enhancement)

### **5. Audit Trail**
- All uploads tracked in database
- Who uploaded, when, file details
- Soft delete (files can be recovered)

---

## 📊 **Database Schema**

### **leave_attachments Table**
```sql
CREATE TABLE leave_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    leave_application_id INT NULL,        -- Future: link to application
    employee_id INT NOT NULL,
    file_name VARCHAR(255),
    file_key VARCHAR(500) UNIQUE,         -- S3 key (path)
    file_url VARCHAR(1000),                -- Full S3 URL
    file_size INT,                         -- Bytes
    file_type VARCHAR(100),                -- MIME type
    attachment_type ENUM(...),             -- Category
    description TEXT,
    s3_bucket VARCHAR(255),
    s3_region VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,        -- Soft delete
    is_verified BOOLEAN DEFAULT FALSE,     -- Admin approval
    verified_by INT NULL,
    verified_at DATETIME NULL,
    uploaded_by INT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME NULL
);
```

---

## 🛠️ **API Endpoints**

### **Upload File**
```
POST /api/attachments/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- employee_id: number (required)
- attachment_type: enum (optional)
- description: string (optional)

Response: 201 Created
{
  "message": "File uploaded successfully",
  "attachment": { ... },
  "s3": { fileKey, fileUrl, ... }
}
```

### **Get Presigned URL**
```
GET /api/attachments/:id/download?expiresIn=3600

Response: 200 OK
{
  "presignedUrl": "https://...",
  "expiresIn": 3600,
  "fileName": "...",
  "fileType": "..."
}
```

### **List Employee Attachments**
```
GET /api/attachments/employee/:employee_id

Response: 200 OK
{
  "attachments": [...]
}
```

### **Delete Attachment**
```
DELETE /api/attachments/:id

Response: 200 OK
{
  "message": "Attachment deleted successfully",
  "attachment_id": 1
}
```

### **Verify Attachment (Admin)**
```
POST /api/attachments/:id/verify

Response: 200 OK
{
  "message": "Attachment verified successfully"
}
```

### **Check S3 Status**
```
GET /api/attachments/status

Response: 200 OK
{
  "configured": true,
  "bucket": "...",
  "region": "..."
}
```

---

## 💰 **AWS Pricing (Approximate)**

### **Free Tier (First 12 months):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests
- 100 GB data transfer out

### **After Free Tier:**
- Storage: $0.023 per GB/month (ap-south-1)
- PUT/POST: $0.005 per 1,000 requests
- GET: $0.0004 per 1,000 requests
- Data transfer: $0.10 per GB

### **Example Cost:**
- 1,000 files @ 2MB each = 2 GB storage
- 10,000 downloads/month
- **Cost: ~$0.05/month** (after free tier)

---

## ⚠️ **Important Notes**

### **1. If S3 is NOT Configured:**
- System still works perfectly
- File uploads are disabled
- UI shows "S3 not configured" message
- No errors or crashes

### **2. Security Best Practices:**
- ✅ Never commit .env file
- ✅ Use IAM user (not root account)
- ✅ Enable MFA on AWS account
- ✅ Rotate credentials periodically
- ✅ Monitor S3 bucket access logs
- ✅ Enable bucket encryption
- ✅ Set lifecycle policies (auto-delete old files)

### **3. Production Deployment:**
- Use environment variables (not .env file)
- Set bucket lifecycle: Delete files older than 2 years
- Enable S3 access logging
- Use CloudFront CDN for faster downloads
- Monitor costs with AWS Cost Explorer

---

## 🚀 **Next Steps**

### **Immediate (Can do now):**
- ✅ Test file upload with cURL
- ✅ Check S3 status endpoint
- ✅ View uploaded files in AWS console

### **Future Enhancements:**
- [ ] Add to Leave Application form
- [ ] Show attachments in Leave Applications list
- [ ] Employee can download their own attachments
- [ ] Admin can verify documents
- [ ] Automatic thumbnail generation (images)
- [ ] OCR for medical certificates (AWS Textract)
- [ ] Virus scanning (AWS S3 ClamAV)

---

## 🆘 **Troubleshooting**

### **Problem: "S3 service not configured"**
**Solution:**
- Check .env file has all S3 variables
- Restart server after updating .env
- Check console for initialization message

### **Problem: "Access Denied" from S3**
**Solution:**
- Verify IAM user has correct permissions
- Check bucket policy allows IAM user
- Verify credentials in .env are correct

### **Problem: "File too large"**
**Solution:**
- Default limit is 10MB
- Edit `uploadMiddleware.ts` to increase
- Consider S3 multipart upload for large files

### **Problem: CORS errors in browser**
**Solution:**
- Add your domain to S3 CORS policy
- Include http://localhost:3000 for development
- Clear browser cache

---

## ✅ **Completion Checklist**

- [x] Install AWS SDK packages
- [x] Create S3 service
- [x] Create upload middleware
- [x] Create attachment controller
- [x] Create API routes
- [x] Add to server routes
- [x] Initialize S3 in server
- [x] Run database migration
- [x] Create FileUpload component
- [x] Create .env.example
- [ ] Create AWS S3 bucket (You do this)
- [ ] Create IAM user (You do this)
- [ ] Add credentials to .env (You do this)
- [ ] Test file upload
- [ ] Integrate with Leave Management UI

---

## 📞 **Support**

**AWS Documentation:**
- S3: https://docs.aws.amazon.com/s3/
- IAM: https://docs.aws.amazon.com/iam/
- SDK: https://docs.aws.amazon.com/sdk-for-javascript/

**Contact:**
- For code issues: Check server logs
- For AWS issues: AWS Support or community forums

---

**🎉 S3 Integration is ready! Add your credentials and start uploading!**
