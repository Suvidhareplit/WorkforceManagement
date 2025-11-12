import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  // Generic entity reference (works with ANY module)
  entityType: 'LEAVE_APPLICATION' | 'EMPLOYEE' | 'HIRING' | 'ONBOARDING' | 'TRAINING' | 'VENDOR' | 'INTERVIEW' | string;
  entityId: number | string;
  
  // Optional metadata
  employeeId?: number | string;
  userId?: number | string;
  category?: string;
  subcategory?: string;
  title?: string;
  
  // Legacy support
  attachmentType?: string;
  
  // Callbacks and config
  onUploadComplete?: (attachment: any) => void;
  onUploadError?: (error: any) => void;
  maxSizeMB?: number;
  accept?: string;
  showWarning?: boolean;
}

export function FileUpload({
  entityType,
  entityId,
  employeeId,
  userId,
  category = 'DOCUMENT',
  subcategory,
  title,
  attachmentType, // Legacy support
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx',
  showWarning = true,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setUploadedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Generic entity fields (works with ANY module)
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId.toString());
    
    // Optional fields
    if (employeeId) formData.append('employee_id', employeeId.toString());
    if (userId) formData.append('user_id', userId.toString());
    if (category) formData.append('attachment_category', category);
    if (subcategory) formData.append('attachment_subcategory', subcategory);
    if (title) formData.append('title', title);
    
    // Legacy support
    if (attachmentType) formData.append('attachment_type', attachmentType);
    
    formData.append('description', `Uploaded from ${entityType} module`);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      setUploadedFile(data.attachment);
      
      toast({
        title: 'Upload successful',
        description: `${selectedFile.name} uploaded successfully`,
      });

      if (onUploadComplete) {
        onUploadComplete(data.attachment);
      }

      // Reset after success
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
      setUploadProgress(0);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      {!selectedFile && !uploadedFile && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-500">
              PDF, DOC, DOCX, JPG, PNG (max {maxSizeMB}MB)
            </p>
          </label>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !uploadedFile && (
        <div className="border border-slate-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="h-10 w-10 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
                {uploading && (
                  <div className="mt-3">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!uploading && (
            <div className="mt-4 flex gap-2">
              <Button onClick={handleUpload} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button variant="outline" onClick={clearSelection}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Upload Success */}
      {uploadedFile && (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900">
                Upload Successful
              </p>
              <p className="text-sm text-green-700 mt-1">
                {uploadedFile.file_name} has been uploaded to secure storage
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* S3 Not Configured Warning (Optional) */}
      {showWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                S3 Configuration Required
              </p>
              <p className="text-xs text-amber-700 mt-1">
                File uploads require AWS S3 configuration. Contact your system administrator
                to enable this feature.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
