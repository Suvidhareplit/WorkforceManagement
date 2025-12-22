import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download, Upload, AlertCircle, CheckCircle, FileSpreadsheet, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Employee table field definitions with validators
const EMPLOYEE_FIELDS: Record<string, { type: string; required: boolean; label: string; pattern?: RegExp; values?: string[] }> = {
  user_id: { type: 'string', required: true, label: 'User ID' },
  employee_id: { type: 'string', required: false, label: 'Employee ID' },
  name: { type: 'string', required: false, label: 'Name' },
  mobile_number: { type: 'string', required: false, label: 'Mobile Number', pattern: /^[0-9]{10}$/ },
  email: { type: 'email', required: false, label: 'Email' },
  city: { type: 'string', required: false, label: 'City' },
  cluster: { type: 'string', required: false, label: 'Cluster' },
  role: { type: 'string', required: false, label: 'Role' },
  designation: { type: 'string', required: false, label: 'Designation' },
  legal_entity: { type: 'string', required: false, label: 'Legal Entity' },
  business_unit_name: { type: 'string', required: false, label: 'Business Unit' },
  department_name: { type: 'string', required: false, label: 'Department' },
  sub_department_name: { type: 'string', required: false, label: 'Sub Department' },
  employment_type: { type: 'string', required: false, label: 'Employment Type' },
  manager_name: { type: 'string', required: false, label: 'Manager Name' },
  date_of_joining: { type: 'date', required: false, label: 'Date of Joining' },
  gross_salary: { type: 'number', required: false, label: 'Gross Salary' },
  resume_source: { type: 'string', required: false, label: 'Resume Source' },
  cost_centre: { type: 'string', required: false, label: 'Cost Centre' },
  vendor_name: { type: 'string', required: false, label: 'Vendor Name' },
  recruiter_name: { type: 'string', required: false, label: 'Recruiter Name' },
  referral_name: { type: 'string', required: false, label: 'Referral Name' },
  referral_contact: { type: 'string', required: false, label: 'Referral Contact' },
  referral_relation: { type: 'string', required: false, label: 'Referral Relation' },
  direct_source: { type: 'string', required: false, label: 'Direct Source' },
  gender: { type: 'enum', required: false, label: 'Gender', values: ['male', 'female', 'other'] },
  date_of_birth: { type: 'date', required: false, label: 'Date of Birth' },
  blood_group: { type: 'string', required: false, label: 'Blood Group' },
  marital_status: { type: 'enum', required: false, label: 'Marital Status', values: ['single', 'married', 'divorced', 'widowed', 'unmarried', 'none'] },
  physically_handicapped: { type: 'string', required: false, label: 'Physically Handicapped' },
  nationality: { type: 'string', required: false, label: 'Nationality' },
  international_worker: { type: 'string', required: false, label: 'International Worker' },
  pan_number: { type: 'string', required: false, label: 'PAN Number', pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ },
  name_as_per_pan: { type: 'string', required: false, label: 'Name as per PAN' },
  aadhar_number: { type: 'string', required: false, label: 'Aadhar Number', pattern: /^[0-9]{12}$/ },
  name_as_per_aadhar: { type: 'string', required: false, label: 'Name as per Aadhar' },
  account_number: { type: 'string', required: false, label: 'Account Number' },
  ifsc_code: { type: 'string', required: false, label: 'IFSC Code' },
  bank_name: { type: 'string', required: false, label: 'Bank Name' },
  present_address: { type: 'string', required: false, label: 'Present Address' },
  permanent_address: { type: 'string', required: false, label: 'Permanent Address' },
  emergency_contact_number: { type: 'string', required: false, label: 'Emergency Contact Number' },
  emergency_contact_name: { type: 'string', required: false, label: 'Emergency Contact Name' },
  emergency_contact_relation: { type: 'string', required: false, label: 'Emergency Contact Relation' },
  father_name: { type: 'string', required: false, label: 'Father Name' },
  uan_number: { type: 'string', required: false, label: 'UAN Number', pattern: /^[0-9]{12}$/ },
  esic_ip_number: { type: 'string', required: false, label: 'ESIC IP Number' },
  group_doj: { type: 'date', required: false, label: 'Group DOJ' },
  paygrade: { type: 'string', required: false, label: 'Pay Grade' },
  payband: { type: 'string', required: false, label: 'Pay Band' },
  working_status: { type: 'enum', required: false, label: 'Working Status', values: ['working', 'relieved'] },
};

interface ValidationError {
  row: number;
  userId: string;
  field: string;
  value: string;
  error: string;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: ValidationError[];
}

export default function BulkUpdates() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch working employees for download template
  const { data: workingEmployees, isLoading } = useQuery({
    queryKey: ['/api/employees', { working_status: 'working' }],
    queryFn: async () => {
      return apiRequest('/api/employees?working_status=working');
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: any[]) => {
      return apiRequest('/api/employees/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ updates }),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Bulk Update Complete",
        description: data.message || `Successfully updated ${data.success} employees`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setUploadResult(data);
      setPreviewData(null);
      setValidationErrors([]);
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Update Failed",
        description: error.message || "Failed to update employees",
        variant: "destructive",
      });
    },
  });

  // Download template with working employees
  const downloadTemplate = () => {
    const employees = Array.isArray(workingEmployees) ? workingEmployees : [];
    
    if (employees.length === 0) {
      toast({
        title: "No Data",
        description: "No working employees found to download",
        variant: "destructive",
      });
      return;
    }

    const headers = ['user_id', 'employee_id', 'name'];
    const rows = employees.map((emp: any) => [
      emp.user_id || '',
      emp.employee_id || '',
      emp.name || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map((cell: string) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `working_employees_template_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: `Downloaded ${employees.length} working employees. Add columns to update.`,
    });
  };

  // Validate a single field value
  const validateField = (field: string, value: string): string | null => {
    const fieldDef = EMPLOYEE_FIELDS[field];
    if (!fieldDef) return `Unknown field: ${field}`;

    // Skip empty values for non-required fields
    if (!value || value.trim() === '') {
      if (fieldDef.required) return `${fieldDef.label} is required`;
      return null;
    }

    const trimmedValue = value.trim();

    switch (fieldDef.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) return `Invalid email format`;
        break;
      case 'number':
        if (isNaN(Number(trimmedValue))) return `Must be a number`;
        break;
      case 'date':
        // Accept multiple date formats
        const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/;
        if (!dateRegex.test(trimmedValue)) return `Invalid date format (use YYYY-MM-DD or DD/MM/YYYY)`;
        break;
      case 'enum':
        if (fieldDef.values && !fieldDef.values.includes(trimmedValue.toLowerCase())) {
          return `Must be one of: ${fieldDef.values.join(', ')}`;
        }
        break;
      case 'string':
        if (fieldDef.pattern && !fieldDef.pattern.test(trimmedValue)) {
          return `Invalid format for ${fieldDef.label}`;
        }
        break;
    }

    return null;
  };

  // Parse CSV text
  const parseCSV = (csvText: string): { headers: string[]; rows: string[][] } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/ /g, '_'));
    
    // Parse rows
    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length > 0 && values.some(v => v)) {
        rows.push(values);
      }
    }

    return { headers, rows };
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadResult(null);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const { headers, rows } = parseCSV(csvText);

        if (!headers.includes('user_id')) {
          toast({
            title: "Invalid CSV",
            description: "CSV must contain 'user_id' column as the unique identifier",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        // Validate all fields
        const errors: ValidationError[] = [];
        const validUpdates: any[] = [];

        rows.forEach((row, rowIndex) => {
          const update: any = {};
          let hasError = false;
          let userId = '';

          headers.forEach((header, colIndex) => {
            const value = row[colIndex] || '';
            
            if (header === 'user_id') {
              userId = value;
              update.user_id = value;
            } else if (EMPLOYEE_FIELDS[header]) {
              const error = validateField(header, value);
              if (error) {
                errors.push({
                  row: rowIndex + 2,
                  userId,
                  field: header,
                  value,
                  error,
                });
                hasError = true;
              } else if (value.trim()) {
                update[header] = value.trim();
              }
            }
          });

          if (!hasError && Object.keys(update).length > 1) {
            validUpdates.push(update);
          }
        });

        setPreviewData(validUpdates);
        setValidationErrors(errors);
        setIsProcessing(false);

        if (errors.length > 0) {
          toast({
            title: "Validation Errors Found",
            description: `${errors.length} errors found. Please fix and re-upload.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "CSV Validated",
            description: `${validUpdates.length} records ready to update.`,
          });
        }
      } catch (error) {
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Execute bulk update
  const executeBulkUpdate = () => {
    if (!previewData || previewData.length === 0) return;
    bulkUpdateMutation.mutate(previewData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bulk Updates</h1>
          <p className="text-slate-500">Update employee details in bulk using CSV</p>
        </div>
      </div>

      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to use Bulk Updates</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Download the template CSV with working employees (User ID, Employee ID, Name)</li>
            <li>Add columns for the fields you want to update (e.g., city, cluster, manager_name)</li>
            <li>Fill in the values for each employee using User ID as the identifier</li>
            <li>Upload the CSV file - it will be validated before updating</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Download & Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription>
              Download CSV with working employees to use as template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={downloadTemplate} 
              disabled={isLoading}
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : `Download Template (${Array.isArray(workingEmployees) ? workingEmployees.length : 0} employees)`}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Updates
            </CardTitle>
            <CardDescription>
              Upload CSV file with updated employee data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Select CSV File'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Available Fields Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Fields</CardTitle>
          <CardDescription>
            These are the column headers you can use in your CSV (use exact names)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EMPLOYEE_FIELDS).map(([key, field]) => (
              <span 
                key={key} 
                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-mono"
                title={field.label}
              >
                {key}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Validation Errors ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationErrors.map((error, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{error.row}</TableCell>
                      <TableCell>{error.userId}</TableCell>
                      <TableCell className="font-mono text-xs">{error.field}</TableCell>
                      <TableCell className="text-red-600">{error.value || '(empty)'}</TableCell>
                      <TableCell className="text-red-600">{error.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Data */}
      {previewData && previewData.length > 0 && validationErrors.length === 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Ready to Update ({previewData.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Fields to Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 10).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{row.user_id}</TableCell>
                      <TableCell>
                        {Object.entries(row)
                          .filter(([k]) => k !== 'user_id')
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {previewData.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-slate-500">
                        ... and {previewData.length - 10} more records
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button 
              onClick={executeBulkUpdate}
              disabled={bulkUpdateMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {bulkUpdateMutation.isPending ? 'Updating...' : `Update ${previewData.length} Employees`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Card className={uploadResult.failed > 0 ? 'border-yellow-200' : 'border-green-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Update Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
                <div className="text-sm text-green-700">Successful</div>
              </div>
              {uploadResult.failed > 0 && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{uploadResult.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
