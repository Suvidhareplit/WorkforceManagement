# S3 File Attachments - Usage Examples for All Modules

## 📚 **Complete Integration Guide**

The S3 attachment system is now **project-wide** and works with **ALL modules**:
- ✅ Leave Management
- ✅ Employee/Onboarding
- ✅ Hiring/Recruitment
- ✅ Training
- ✅ Vendor Management
- ✅ Interview Feedback
- ✅ Any custom module

---

## 🎯 **How It Works**

### **Generic Entity-Based System:**
Every attachment is linked to an **entity** using:
- `entity_type`: The module (e.g., "EMPLOYEE", "HIRING", "TRAINING")
- `entity_id`: The ID of the specific record (e.g., employee ID, application ID)

This allows ANY module to upload and manage files!

---

## 💻 **Frontend Usage Examples**

### **1. Employee Document Upload (Onboarding)**

```tsx
import { FileUpload } from '@/components/FileUpload';

function EmployeeOnboarding({ employeeId }: { employeeId: number }) {
  return (
    <div className="space-y-6">
      <h2>Upload Required Documents</h2>
      
      {/* Aadhar Card */}
      <div>
        <h3>Aadhar Card</h3>
        <FileUpload
          entityType="EMPLOYEE"
          entityId={employeeId}
          employeeId={employeeId}
          category="CERTIFICATE"
          subcategory="AADHAR"
          title="Aadhar Card"
          accept=".pdf,.jpg,.jpeg,.png"
          onUploadComplete={(attachment) => {
            console.log('Aadhar uploaded:', attachment.id);
            // Save attachment.id to employee record
          }}
        />
      </div>

      {/* PAN Card */}
      <div>
        <h3>PAN Card</h3>
        <FileUpload
          entityType="EMPLOYEE"
          entityId={employeeId}
          employeeId={employeeId}
          category="CERTIFICATE"
          subcategory="PAN"
          title="PAN Card"
          accept=".pdf,.jpg,.jpeg,.png"
          onUploadComplete={(attachment) => {
            console.log('PAN uploaded:', attachment.id);
          }}
        />
      </div>

      {/* Resume */}
      <div>
        <h3>Resume/CV</h3>
        <FileUpload
          entityType="EMPLOYEE"
          entityId={employeeId}
          employeeId={employeeId}
          category="DOCUMENT"
          subcategory="RESUME"
          title="Resume"
          accept=".pdf,.doc,.docx"
          maxSizeMB={5}
          onUploadComplete={(attachment) => {
            console.log('Resume uploaded:', attachment.id);
          }}
        />
      </div>
    </div>
  );
}
```

### **2. Hiring/Recruitment Resume Upload**

```tsx
import { FileUpload } from '@/components/FileUpload';

function HiringApplicationForm({ applicationId }: { applicationId: number }) {
  return (
    <div>
      <h2>Submit Your Application</h2>
      
      {/* Candidate Resume */}
      <FileUpload
        entityType="HIRING"
        entityId={applicationId}
        category="DOCUMENT"
        subcategory="RESUME"
        title="Candidate Resume"
        accept=".pdf,.doc,.docx"
        maxSizeMB={10}
        onUploadComplete={(attachment) => {
          console.log('Resume uploaded:', attachment);
          // Update application status
          updateApplication(applicationId, { 
            resume_attachment_id: attachment.id 
          });
        }}
      />

      {/* Cover Letter (Optional) */}
      <FileUpload
        entityType="HIRING"
        entityId={applicationId}
        category="DOCUMENT"
        subcategory="COVER_LETTER"
        title="Cover Letter"
        accept=".pdf,.doc,.docx"
        onUploadComplete={(attachment) => {
          console.log('Cover letter uploaded:', attachment.id);
        }}
      />
    </div>
  );
}
```

### **3. Leave Application with Medical Certificate**

```tsx
import { FileUpload } from '@/components/FileUpload';

function LeaveApplicationForm({ 
  applicationId, 
  employeeId 
}: { 
  applicationId: number; 
  employeeId: number; 
}) {
  return (
    <div>
      <h2>Apply for Sick Leave</h2>
      
      {/* Medical Certificate */}
      <FileUpload
        entityType="LEAVE_APPLICATION"
        entityId={applicationId}
        employeeId={employeeId}
        category="DOCUMENT"
        subcategory="MEDICAL_CERTIFICATE"
        title="Medical Certificate"
        accept=".pdf,.jpg,.jpeg,.png"
        onUploadComplete={(attachment) => {
          console.log('Medical cert uploaded:', attachment.id);
          // Mark leave application as having document
          updateLeaveApplication(applicationId, {
            doc_submitted: true,
            medical_cert_id: attachment.id
          });
        }}
      />
    </div>
  );
}
```

### **4. Training Certificate Upload**

```tsx
import { FileUpload } from '@/components/FileUpload';

function TrainingCompletion({ 
  trainingId, 
  employeeId 
}: { 
  trainingId: number; 
  employeeId: number; 
}) {
  return (
    <div>
      <h2>Upload Training Certificate</h2>
      
      <FileUpload
        entityType="TRAINING"
        entityId={trainingId}
        employeeId={employeeId}
        category="CERTIFICATE"
        subcategory="TRAINING_CERTIFICATE"
        title="Course Completion Certificate"
        accept=".pdf,.jpg,.jpeg,.png"
        onUploadComplete={(attachment) => {
          console.log('Certificate uploaded:', attachment.id);
          // Mark training as completed
          completeTraining(trainingId, {
            certificate_id: attachment.id,
            status: 'COMPLETED'
          });
        }}
      />
    </div>
  );
}
```

### **5. Vendor Document Upload**

```tsx
import { FileUpload } from '@/components/FileUpload';

function VendorRegistration({ vendorId }: { vendorId: number }) {
  return (
    <div className="space-y-6">
      <h2>Vendor Documents</h2>
      
      {/* GST Certificate */}
      <FileUpload
        entityType="VENDOR"
        entityId={vendorId}
        category="CERTIFICATE"
        subcategory="GST"
        title="GST Registration Certificate"
        accept=".pdf"
        onUploadComplete={(attachment) => {
          console.log('GST cert uploaded:', attachment.id);
        }}
      />

      {/* PAN Card */}
      <FileUpload
        entityType="VENDOR"
        entityId={vendorId}
        category="CERTIFICATE"
        subcategory="PAN"
        title="Vendor PAN Card"
        accept=".pdf,.jpg,.jpeg,.png"
        onUploadComplete={(attachment) => {
          console.log('PAN uploaded:', attachment.id);
        }}
      />

      {/* Agreement */}
      <FileUpload
        entityType="VENDOR"
        entityId={vendorId}
        category="DOCUMENT"
        subcategory="AGREEMENT"
        title="Vendor Agreement"
        accept=".pdf"
        onUploadComplete={(attachment) => {
          console.log('Agreement uploaded:', attachment.id);
        }}
      />
    </div>
  );
}
```

---

## 🔧 **Backend API Usage**

### **Upload File (All Modules)**

```bash
# Upload employee Aadhar
curl -X POST http://localhost:3000/api/attachments/upload \
  -F "file=@aadhar.pdf" \
  -F "entity_type=EMPLOYEE" \
  -F "entity_id=123" \
  -F "employee_id=123" \
  -F "attachment_category=CERTIFICATE" \
  -F "attachment_subcategory=AADHAR" \
  -F "title=Aadhar Card" \
  -F "description=Employee identity proof"

# Upload hiring resume
curl -X POST http://localhost:3000/api/attachments/upload \
  -F "file=@resume.pdf" \
  -F "entity_type=HIRING" \
  -F "entity_id=456" \
  -F "attachment_category=DOCUMENT" \
  -F "attachment_subcategory=RESUME" \
  -F "title=Candidate Resume"

# Upload training certificate
curl -X POST http://localhost:3000/api/attachments/upload \
  -F "file=@certificate.pdf" \
  -F "entity_type=TRAINING" \
  -F "entity_id=789" \
  -F "employee_id=123" \
  -F "attachment_category=CERTIFICATE" \
  -F "attachment_subcategory=TRAINING_CERTIFICATE"
```

### **Get All Files for an Entity**

```bash
# Get all employee documents
curl http://localhost:3000/api/attachments/entity/EMPLOYEE/123

# Get all hiring application files
curl http://localhost:3000/api/attachments/entity/HIRING/456

# Get all training certificates
curl http://localhost:3000/api/attachments/entity/TRAINING/789

# Response:
{
  "attachments": [
    {
      "id": 1,
      "entity_type": "EMPLOYEE",
      "entity_id": "123",
      "file_name": "aadhar.pdf",
      "file_size": 245678,
      "attachment_category": "CERTIFICATE",
      "attachment_subcategory": "AADHAR",
      "title": "Aadhar Card",
      "status": "VERIFIED",
      "created_at": "2025-11-12T10:30:00"
    },
    ...
  ],
  "count": 5
}
```

### **Get All Files for an Employee**

```bash
# Get all files uploaded by/for employee 123
curl http://localhost:3000/api/attachments/employee/123

# Returns files from ALL modules for this employee:
# - Employee documents (Aadhar, PAN, Resume)
# - Leave attachments (Medical certificates)
# - Training certificates
# - etc.
```

### **Get Download URL (Presigned)**

```bash
# Get secure download URL
curl http://localhost:3000/api/attachments/45/download

# Response:
{
  "presignedUrl": "https://bucket.s3.region.amazonaws.com/...?signature=...",
  "expiresIn": 3600,
  "fileName": "aadhar.pdf",
  "fileType": "application/pdf"
}

# Use presigned URL in browser or download:
curl -o aadhar.pdf "https://bucket.s3.region.amazonaws.com/...?signature=..."
```

### **Delete Attachment**

```bash
curl -X DELETE http://localhost:3000/api/attachments/45

# Response:
{
  "message": "Attachment deleted successfully",
  "attachment_id": 45
}
```

### **Verify Attachment (Admin)**

```bash
curl -X POST http://localhost:3000/api/attachments/45/verify

# Response:
{
  "message": "Attachment verified successfully",
  "attachment_id": 45
}
```

---

## 📋 **Database Queries**

### **Get All Attachments for an Employee**

```sql
SELECT * FROM attachments 
WHERE employee_id = 123 AND is_active = TRUE
ORDER BY created_at DESC;
```

### **Get All Files for a Hiring Application**

```sql
SELECT * FROM attachments 
WHERE entity_type = 'HIRING' AND entity_id = '456' AND is_active = TRUE;
```

### **Get All Verified Documents**

```sql
SELECT * FROM attachments 
WHERE is_verified = TRUE AND status = 'VERIFIED'
ORDER BY verified_at DESC;
```

### **Get All Pending Verifications**

```sql
SELECT a.*, e.name as employee_name
FROM attachments a
LEFT JOIN employees e ON a.employee_id = e.id
WHERE a.status = 'PENDING' AND a.is_active = TRUE
ORDER BY a.created_at ASC;
```

### **Get File Count by Module**

```sql
SELECT 
  entity_type,
  COUNT(*) as file_count,
  SUM(file_size) as total_size_bytes,
  ROUND(SUM(file_size) / 1024 / 1024, 2) as total_size_mb
FROM attachments 
WHERE is_active = TRUE
GROUP BY entity_type
ORDER BY file_count DESC;
```

---

## 🎨 **Pre-defined Templates**

### **Get Templates for a Module**

```bash
# Get employee document templates
curl http://localhost:3000/api/attachments/templates/EMPLOYEE

# Response:
{
  "templates": [
    {
      "id": 3,
      "entity_type": "EMPLOYEE",
      "template_name": "Aadhar Card",
      "template_code": "AADHAR",
      "category": "CERTIFICATE",
      "subcategory": "IDENTITY_PROOF",
      "is_required": true,
      "max_file_size_mb": 10,
      "allowed_extensions": [".pdf", ".jpg", ".png"],
      "icon": "CreditCard",
      "color": "orange",
      "help_text": "Upload Aadhar card (both sides)"
    },
    ...
  ]
}
```

### **Render Templates in UI**

```tsx
import { useQuery } from '@tanstack/react-query';
import { FileUpload } from '@/components/FileUpload';

function EmployeeDocumentUpload({ employeeId }: { employeeId: number }) {
  const { data: templates } = useQuery({
    queryKey: ['attachment-templates', 'EMPLOYEE'],
    queryFn: async () => {
      const response = await fetch('/api/attachments/templates/EMPLOYEE');
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      <h2>Required Documents</h2>
      {templates?.templates.map((template: any) => (
        <div key={template.id}>
          <h3>
            {template.template_name}
            {template.is_required && <span className="text-red-500">*</span>}
          </h3>
          <p className="text-sm text-gray-600">{template.help_text}</p>
          
          <FileUpload
            entityType="EMPLOYEE"
            entityId={employeeId}
            employeeId={employeeId}
            category={template.category}
            subcategory={template.subcategory}
            title={template.template_name}
            accept={template.allowed_extensions.join(',')}
            maxSizeMB={template.max_file_size_mb}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 **Advanced Use Cases**

### **1. Multiple Files for One Entity**

```tsx
// Upload multiple training materials
const materials = [
  { file: pdfFile, title: 'Course Material - Part 1' },
  { file: pptFile, title: 'Presentation Slides' },
  { file: videoFile, title: 'Demo Video' }
];

for (const material of materials) {
  const formData = new FormData();
  formData.append('file', material.file);
  formData.append('entity_type', 'TRAINING');
  formData.append('entity_id', trainingId.toString());
  formData.append('title', material.title);
  
  await fetch('/api/attachments/upload', {
    method: 'POST',
    body: formData
  });
}
```

### **2. Confidential Documents**

```tsx
// Upload confidential document (only HR can access)
<FileUpload
  entityType="EMPLOYEE"
  entityId={employeeId}
  category="DOCUMENT"
  subcategory="SALARY"
  title="Salary Slip"
  // Mark as confidential in backend
  onUploadComplete={(attachment) => {
    // Update attachment to be confidential
    fetch(`/api/attachments/${attachment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_confidential: true })
    });
  }}
/>
```

### **3. Document Expiration**

```tsx
// Upload certificate with expiration
const expiryDate = new Date('2026-12-31');

const formData = new FormData();
formData.append('file', certificateFile);
formData.append('entity_type', 'EMPLOYEE');
formData.append('entity_id', employeeId.toString());
formData.append('subcategory', 'MEDICAL_FITNESS');
formData.append('expires_at', expiryDate.toISOString());
```

### **4. Tagging Documents**

```tsx
const formData = new FormData();
formData.append('file', file);
formData.append('entity_type', 'EMPLOYEE');
formData.append('entity_id', employeeId.toString());
formData.append('tags', JSON.stringify(['urgent', 'verification-pending', 'confidential']));
```

---

## 📊 **S3 Folder Structure**

Files are automatically organized by module:

```
s3://your-bucket/
├── employee-documents/
│   ├── aadhar-uuid.pdf
│   ├── pan-uuid.jpg
│   └── resume-uuid.pdf
├── hiring-resumes/
│   ├── candidate-resume-uuid.pdf
│   └── cover-letter-uuid.docx
├── leave-attachments/
│   ├── medical-cert-uuid.pdf
│   └── supporting-doc-uuid.pdf
├── training-certificates/
│   ├── course-completion-uuid.pdf
│   └── training-material-uuid.pptx
├── vendor-documents/
│   ├── gst-cert-uuid.pdf
│   └── agreement-uuid.pdf
└── general-attachments/
    └── misc-uuid.pdf
```

---

## ✅ **Complete Workflow Example**

### **Scenario: New Employee Onboarding**

```tsx
import { FileUpload } from '@/components/FileUpload';
import { useQuery } from '@tanstack/react-query';

function NewEmployeeOnboarding({ employeeId }: { employeeId: number }) {
  // 1. Get required document templates
  const { data: templates } = useQuery({
    queryKey: ['templates', 'EMPLOYEE'],
    queryFn: () => fetch('/api/attachments/templates/EMPLOYEE').then(r => r.json())
  });

  // 2. Get already uploaded documents
  const { data: uploadedDocs, refetch } = useQuery({
    queryKey: ['employee-docs', employeeId],
    queryFn: () => 
      fetch(`/api/attachments/entity/EMPLOYEE/${employeeId}`).then(r => r.json())
  });

  // 3. Check which documents are missing
  const missingDocs = templates?.templates.filter((t: any) => 
    !uploadedDocs?.attachments.some((d: any) => 
      d.attachment_subcategory === t.template_code
    )
  );

  return (
    <div>
      <h1>Employee Onboarding - Documents</h1>
      
      {/* Show upload forms for missing docs */}
      {missingDocs?.map((template: any) => (
        <div key={template.id}>
          <h3>{template.template_name}</h3>
          <FileUpload
            entityType="EMPLOYEE"
            entityId={employeeId}
            employeeId={employeeId}
            category={template.category}
            subcategory={template.template_code}
            title={template.template_name}
            onUploadComplete={() => {
              refetch(); // Refresh list
            }}
          />
        </div>
      ))}

      {/* Show uploaded documents */}
      <h2>Uploaded Documents</h2>
      {uploadedDocs?.attachments.map((doc: any) => (
        <div key={doc.id}>
          <p>{doc.title}</p>
          <p>{doc.status}</p>
          <button onClick={() => downloadFile(doc.id)}>Download</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎉 **That's It!**

The S3 attachment system now works **project-wide**! Use it in:
- ✅ Employee management
- ✅ Hiring/recruitment
- ✅ Leave applications
- ✅ Training programs
- ✅ Vendor management
- ✅ Any custom module!

**Just provide `entityType` and `entityId` and you're done!**
