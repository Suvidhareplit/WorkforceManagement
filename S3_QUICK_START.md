# S3 Attachments - Quick Start Guide 🚀

## ⚡ **TL;DR - Get Started in 2 Minutes**

### **1. Upload a File (Frontend)**

```tsx
import { FileUpload } from '@/components/FileUpload';

// For ANY module - just change entityType and entityId!
<FileUpload
  entityType="EMPLOYEE"     // EMPLOYEE, HIRING, TRAINING, VENDOR, LEAVE_APPLICATION
  entityId={123}            // Your record ID
  category="DOCUMENT"       // DOCUMENT, CERTIFICATE, PHOTO
  subcategory="RESUME"      // RESUME, AADHAR, PAN, MEDICAL_CERT, etc.
  onUploadComplete={(attachment) => {
    console.log('Uploaded:', attachment.id);
  }}
/>
```

### **2. Get Files for an Entity (Frontend)**

```tsx
// Get all files for employee 123
const response = await fetch('/api/attachments/entity/EMPLOYEE/123');
const { attachments } = await response.json();

// Get all files for hiring application 456
const response = await fetch('/api/attachments/entity/HIRING/456');
```

### **3. Download a File (Frontend)**

```tsx
// Get presigned download URL
const response = await fetch(`/api/attachments/${attachmentId}/download`);
const { presignedUrl } = await response.json();

// Open in new tab or download
window.open(presignedUrl, '_blank');
```

---

## 📋 **Entity Types (Modules)**

| Entity Type | Usage | Folder |
|------------|-------|--------|
| `EMPLOYEE` | Employee documents, onboarding | `employee-documents/` |
| `HIRING` | Resumes, cover letters | `hiring-resumes/` |
| `LEAVE_APPLICATION` | Medical certificates | `leave-attachments/` |
| `TRAINING` | Certificates, materials | `training-certificates/` |
| `VENDOR` | GST, PAN, agreements | `vendor-documents/` |
| `ONBOARDING` | Joining documents | `onboarding-docs/` |
| `INTERVIEW` | Feedback, notes | `interview-feedback/` |

---

## 🎯 **Common Categories & Subcategories**

### **EMPLOYEE Module:**
- `CERTIFICATE` + `AADHAR` - Aadhar card
- `CERTIFICATE` + `PAN` - PAN card  
- `PHOTO` + `PROFILE_PHOTO` - Profile picture
- `DOCUMENT` + `RESUME` - Resume/CV
- `DOCUMENT` + `OFFER_LETTER` - Offer letter
- `CERTIFICATE` + `EDUCATION` - Degree certificates

### **HIRING Module:**
- `DOCUMENT` + `RESUME` - Candidate resume
- `DOCUMENT` + `COVER_LETTER` - Cover letter

### **LEAVE Module:**
- `DOCUMENT` + `MEDICAL_CERTIFICATE` - Medical cert
- `DOCUMENT` + `SUPPORTING_DOCUMENT` - Other docs

### **TRAINING Module:**
- `CERTIFICATE` + `TRAINING_CERTIFICATE` - Certificate
- `DOCUMENT` + `TRAINING_MATERIAL` - Course materials

### **VENDOR Module:**
- `CERTIFICATE` + `GST` - GST certificate
- `CERTIFICATE` + `PAN` - Vendor PAN
- `DOCUMENT` + `AGREEMENT` - Contract/agreement

---

## 🔧 **API Endpoints**

### **Upload**
```
POST /api/attachments/upload
Body (multipart):
  - file: File
  - entity_type: string
  - entity_id: string
  - attachment_category: string (optional)
  - attachment_subcategory: string (optional)
```

### **Get Entity Files**
```
GET /api/attachments/entity/:entity_type/:entity_id
Example: GET /api/attachments/entity/EMPLOYEE/123
```

### **Get Employee Files**
```
GET /api/attachments/employee/:employee_id
Example: GET /api/attachments/employee/123
```

### **Download (Presigned URL)**
```
GET /api/attachments/:id/download
Returns: { presignedUrl, expiresIn, fileName }
```

### **Delete**
```
DELETE /api/attachments/:id
```

### **Get Templates**
```
GET /api/attachments/templates/:entity_type
Example: GET /api/attachments/templates/EMPLOYEE
```

---

## 💡 **Real Examples**

### **Example 1: Employee Aadhar Upload**

```tsx
<FileUpload
  entityType="EMPLOYEE"
  entityId={employeeId}
  employeeId={employeeId}
  category="CERTIFICATE"
  subcategory="AADHAR"
  title="Aadhar Card"
  accept=".pdf,.jpg,.png"
  maxSizeMB={5}
  onUploadComplete={(attachment) => {
    // Save to employee record
    updateEmployee({ aadhar_attachment_id: attachment.id });
  }}
/>
```

### **Example 2: Hiring Resume Upload**

```tsx
<FileUpload
  entityType="HIRING"
  entityId={applicationId}
  category="DOCUMENT"
  subcategory="RESUME"
  title="Candidate Resume"
  accept=".pdf,.doc,.docx"
  onUploadComplete={(attachment) => {
    updateApplication({ resume_id: attachment.id });
  }}
/>
```

### **Example 3: Leave Medical Certificate**

```tsx
<FileUpload
  entityType="LEAVE_APPLICATION"
  entityId={leaveId}
  employeeId={employeeId}
  category="DOCUMENT"
  subcategory="MEDICAL_CERTIFICATE"
  title="Medical Certificate"
  onUploadComplete={(attachment) => {
    updateLeaveApplication({ 
      doc_submitted: true,
      medical_cert_id: attachment.id 
    });
  }}
/>
```

---

## 🗄️ **Database**

### **Table: `attachments`**
All file metadata stored here.

### **Table: `attachment_templates`**
Pre-defined templates for each module (Aadhar, PAN, Resume, etc.)

### **Common Queries:**

```sql
-- Get all employee files
SELECT * FROM attachments 
WHERE entity_type = 'EMPLOYEE' AND entity_id = '123';

-- Get all hiring resumes
SELECT * FROM attachments 
WHERE entity_type = 'HIRING' AND attachment_subcategory = 'RESUME';

-- Get pending verifications
SELECT * FROM attachments 
WHERE status = 'PENDING' AND is_active = TRUE;
```

---

## ⚙️ **Setup S3 (Optional)**

### **If S3 NOT configured:**
- ✅ System works normally
- ✅ Shows "S3 not configured" message
- ✅ No crashes

### **To enable S3:**

1. **Create S3 bucket** in AWS Console
2. **Create IAM user** with S3 permissions
3. **Update .env:**
```bash
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```
4. **Restart server**

See `S3_INTEGRATION_GUIDE.md` for detailed setup.

---

## 🎓 **Best Practices**

1. ✅ **Always use specific subcategories** (AADHAR, not just DOCUMENT)
2. ✅ **Set proper file size limits** (5MB for images, 10MB for PDFs)
3. ✅ **Restrict file types** (only PDF for certificates)
4. ✅ **Add titles** for better organization
5. ✅ **Mark confidential docs** as confidential
6. ✅ **Verify important documents** (admin verification)

---

## 📚 **More Documentation**

- **S3_INTEGRATION_GUIDE.md** - Complete S3 setup guide
- **S3_USAGE_EXAMPLES.md** - Detailed examples for all modules
- **RH_PRORATION_TABLES.md** - Leave management specific

---

## ✅ **Checklist**

Before using attachments in your module:

- [ ] Decide entity_type name (EMPLOYEE, HIRING, etc.)
- [ ] Determine categories/subcategories needed
- [ ] Add FileUpload component to your form
- [ ] Handle onUploadComplete callback
- [ ] Store attachment IDs in your module's database
- [ ] Add download/view functionality
- [ ] (Optional) Create templates in attachment_templates table

---

## 🚀 **You're Ready!**

S3 attachments work with **ANY module** in the project.  
Just provide `entityType` and `entityId`!

**Happy uploading!** 🎉
