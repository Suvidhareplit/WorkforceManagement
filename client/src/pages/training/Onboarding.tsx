import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download, Upload, AlertCircle, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { format } from "date-fns";

export default function Onboarding() {
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch onboarding records
  const { data: onboardingResponse, isLoading } = useQuery({
    queryKey: ["/api/onboarding/onboarding"],
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const onboardingRecords = (onboardingResponse as any) || [];

  // Update onboarding status mutation
  const updateOnboardingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/onboarding/onboarding/${id}`, {
        method: "PATCH",
        body: { onboarding_status: status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/onboarding"] });
      toast({
        title: "Success",
        description: "Onboarding status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Download CSV template with prefilled data for pending onboarding candidates
  const downloadTemplate = () => {
    // Filter pending onboarding candidates (fit or fit_need_refresher_training)
    const pendingCandidates = onboardingRecords.filter((record: any) => 
      (record.onboardingStatus || record.onboarding_status) === 'yet_to_be_onboarded'
    );

    if (pendingCandidates.length === 0) {
      toast({
        title: "No Records",
        description: "No pending onboarding candidates found",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      // BASIC DETAILS
      "Employee ID",
      "User ID (numbers only)",
      "Name (DO NOT EDIT)", 
      "Phone Number (DO NOT EDIT)", 
      "Email (DO NOT EDIT)", 
      "Gender", 
      "Date of Birth (DD-MMM-YYYY)",
      "Blood Group", 
      "Marital Status",
      "Name as per Aadhar", 
      "Aadhar Number",
      "Father Name",
      "Father DOB (DD-MMM-YYYY)",
      "Mother Name",
      "Mother DOB (DD-MMM-YYYY)",
      "Wife Name",
      "Wife DOB (DD-MMM-YYYY)",
      "Child 1 Name",
      "Child 1 Gender (male/female)",
      "Child 1 DOB (DD-MMM-YYYY)",
      "Child 2 Name",
      "Child 2 Gender (male/female)",
      "Child 2 DOB (DD-MMM-YYYY)",
      "Nominee Name",
      "Nominee Relation",
      "Present Address", 
      "Permanent Address",
      "Emergency Contact Name", 
      "Emergency Contact Number", 
      "Relation with Emergency Contact",
      // JOB DETAILS
      "City (DO NOT EDIT)", 
      "Cluster (DO NOT EDIT)", 
      "Role (DO NOT EDIT)", 
      "Reporting Manager (DO NOT EDIT)", 
      "Date of Joining (DO NOT EDIT)", 
      "Gross Salary (DO NOT EDIT)",
      "Resume Source Type (DO NOT EDIT)",
      "Resume Source Name (DO NOT EDIT)",
      "Cost Centre (DO NOT EDIT)",
      "Function (DO NOT EDIT)",
      "Business Unit (DO NOT EDIT)",
      "Department (DO NOT EDIT)",
      "Sub Department (DO NOT EDIT)",
      "Legal Entity",
      // FINANCIAL DETAILS
      "PAN Number", 
      "Name as Per PAN",
      "Account Number", 
      "IFSC Code",
      "Name as per Bank", 
      "Bank Name",
      "UAN Number (12 digits)",
      "ESIC IP Number (10 digits or N/A)"
    ];

    const rows = pendingCandidates.map((record: any) => {
      // Format resume source type and name
      const sourceType = record.resumeSource || record.resume_source;
      let resumeSourceType = '';
      let resumeSourceName = '';
      
      if (sourceType === 'vendor') {
        resumeSourceType = 'Vendor';
        resumeSourceName = record.vendorName || record.vendor_name || '';
      } else if (sourceType === 'field_recruiter') {
        resumeSourceType = 'Field Recruiter';
        resumeSourceName = record.recruiterName || record.recruiter_name || '';
      } else if (sourceType === 'referral') {
        resumeSourceType = 'Referral';
        resumeSourceName = record.referralName || record.referral_name || '';
      } else if (sourceType === 'direct') {
        resumeSourceType = 'Direct';
        resumeSourceName = record.directSource || record.direct_source || '';
      } else if (sourceType) {
        resumeSourceType = sourceType;
      }

      return [
        // BASIC DETAILS
        record.employeeId || record.employee_id || '',
        record.userId || record.user_id || '',
        record.name || '',
        record.mobileNumber || record.mobile_number || '',
        record.candidateEmail || record.candidate_email || record.email || '',
        record.gender || '',
        record.dateOfBirth || record.date_of_birth ? format(new Date(record.dateOfBirth || record.date_of_birth), 'dd-MMM-yyyy') : '',
        record.bloodGroup || record.blood_group || '',
        record.maritalStatus || record.marital_status || '',
        record.nameAsPerAadhar || record.name_as_per_aadhar || '',
        record.aadharNumber || record.aadhar_number || '',
        record.fatherName || record.father_name || '',
        record.fatherDob || record.father_dob ? format(new Date(record.fatherDob || record.father_dob), 'dd-MMM-yyyy') : '',
        record.motherName || record.mother_name || '',
        record.motherDob || record.mother_dob ? format(new Date(record.motherDob || record.mother_dob), 'dd-MMM-yyyy') : '',
        record.wifeName || record.wife_name || '',
        record.wifeDob || record.wife_dob ? format(new Date(record.wifeDob || record.wife_dob), 'dd-MMM-yyyy') : '',
        record.child1Name || record.child1_name || '',
        record.child1Gender || record.child1_gender || '',
        record.child1Dob || record.child1_dob ? format(new Date(record.child1Dob || record.child1_dob), 'dd-MMM-yyyy') : '',
        record.child2Name || record.child2_name || '',
        record.child2Gender || record.child2_gender || '',
        record.child2Dob || record.child2_dob ? format(new Date(record.child2Dob || record.child2_dob), 'dd-MMM-yyyy') : '',
        record.nomineeName || record.nominee_name || '',
        record.nomineeRelation || record.nominee_relation || '',
        record.presentAddress || record.present_address || '',
        record.permanentAddress || record.permanent_address || '',
        record.emergencyContactName || record.emergency_contact_name || '',
        record.emergencyContactNumber || record.emergency_contact_number || '',
        record.emergencyContactRelation || record.emergency_contact_relation || '',
        // JOB DETAILS
        record.city || '',
        record.cluster || '',
        record.role || '',
        record.managerName || record.manager_name || '',
        record.dateOfJoining || record.date_of_joining ? format(new Date(record.dateOfJoining || record.date_of_joining), 'yyyy-MM-dd') : '',
        record.grossSalary || record.gross_salary || '',
        resumeSourceType,
        resumeSourceName,
        record.costCentre || record.cost_centre || '',
        record.functionName || record.function_name || '',
        record.businessUnitName || record.business_unit_name || '',
        record.departmentName || record.department_name || '',
        record.subDepartmentName || record.sub_department_name || '',
        record.legalEntity || record.legal_entity || '',
        // FINANCIAL DETAILS
        record.panNumber || record.pan_number || '',
        record.nameAsPerPan || record.name_as_per_pan || '',
        record.accountNumber || record.account_number || '',
        record.ifscCode || record.ifsc_code || '',
        record.nameAsPerBank || record.name_as_per_bank || '',
        record.bankName || record.bank_name || '',
        record.uanNumber || record.uan_number || '',
        record.esicIpNumber || record.esic_ip_number || ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `onboarding_pending_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Template downloaded with ${pendingCandidates.length} pending candidate(s)`,
    });
  };

  // Handle CSV file upload
  // Validation functions
  const parseDateDDMMMYYYY = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    try {
      // Parse DD-MMM-YYYY format (e.g., 12-Aug-2025)
      const parts = dateStr.trim().split('-');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const year = parseInt(parts[2]);
      
      const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const month = months[monthStr];
      if (month === undefined || isNaN(day) || isNaN(year)) return null;
      
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const validateRecord = (row: any, index: number) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field: Name or Employee ID
    if (!row['Name (DO NOT EDIT)']?.trim() && !row['Employee ID']?.trim()) {
      errors.push('Either Name or Employee ID is required');
    }

    // Phone number validation
    if (!row['Phone Number (DO NOT EDIT)']?.trim()) {
      errors.push('Phone Number is required');
    }

    // Gender validation
    if (row['Gender'] && !['male', 'female', 'm', 'f'].includes(row['Gender'].toLowerCase().trim())) {
      errors.push(`Invalid Gender: "${row['Gender']}" (should be male/female)`);
    }

    // Date validations
    const dateFields = [
      'Date of Birth (DD-MMM-YYYY)',
      'Father DOB (DD-MMM-YYYY)',
      'Mother DOB (DD-MMM-YYYY)',
      'Wife DOB (DD-MMM-YYYY)',
      'Child 1 DOB (DD-MMM-YYYY)',
      'Child 2 DOB (DD-MMM-YYYY)'
    ];

    dateFields.forEach(field => {
      const value = row[field];
      if (value && value.trim() !== '') {
        const parsed = parseDateDDMMMYYYY(value);
        if (!parsed) {
          errors.push(`Invalid date format for ${field}: "${value}" (should be DD-MMM-YYYY, e.g., 12-Aug-2025)`);
        }
      }
    });

    // Aadhar validation (12 digits)
    if (row['Aadhar Number'] && row['Aadhar Number'].replace(/\s/g, '').length !== 12) {
      errors.push(`Invalid Aadhar Number: "${row['Aadhar Number']}" (should be 12 digits)`);
    }

    // PAN validation (10 characters)
    if (row['PAN Number'] && row['PAN Number'].trim().length !== 10) {
      warnings.push(`PAN Number "${row['PAN Number']}" should be 10 characters`);
    }

    // UAN validation (12 digits)
    if (row['UAN Number (12 digits)'] && row['UAN Number (12 digits)'].replace(/\s/g, '').length !== 12) {
      warnings.push(`UAN Number should be 12 digits, got: "${row['UAN Number (12 digits)']}"`);
    }

    // ESIC validation (10 digits or N/A)
    const esic = row['ESIC IP Number (10 digits or N/A)'];
    if (esic && esic.toUpperCase() !== 'N/A' && esic.replace(/\s/g, '').length !== 10) {
      warnings.push(`ESIC IP Number should be 10 digits or N/A, got: "${esic}"`);
    }

    return { rowIndex: index + 1, row, errors, warnings, status: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success' };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const text = await file.text();
      
      // Parse CSV properly handling quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];
          
          if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const lines = text.split('\n').filter(line => line.trim());
      const headers = parseCSVLine(lines[0]);
      
      const jsonData = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index] || '';
        });
        return obj;
      });

      // Validate all rows
      const validatedData = jsonData.map((row, index) => validateRecord(row, index));
      
      // Set validation results
      setValidationErrors(validatedData);
      setPreviewData(validatedData);
      setShowPreview(true);
      setUploading(false);

      // Show summary
      const errorCount = validatedData.filter(v => v.status === 'error').length;
      const warningCount = validatedData.filter(v => v.status === 'warning').length;
      const successCount = validatedData.filter(v => v.status === 'success').length;

      toast({
        title: "File Validated",
        description: `✓ ${successCount} valid | ⚠ ${warningCount} warnings | ✗ ${errorCount} errors`,
      });

      event.target.value = '';
    } catch (error) {
      toast({
        title: "File Parse Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  // Actual upload after validation
  const confirmUpload = async () => {
    const validRows = validationErrors.filter(v => v.status !== 'error');
    
    if (validRows.length === 0) {
      toast({
        title: "Cannot Upload",
        description: "No valid rows to upload. Please fix errors first.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Transform validated data to backend format
      const records = validRows.map(({ row }) => {
        const parseDateField = (fieldName: string) => {
          const value = row[fieldName];
          if (!value || value.trim() === '') return null;
          const parsed = parseDateDDMMMYYYY(value);
          return parsed ? format(parsed, 'yyyy-MM-dd') : null;
        };

        return {
          employee_id: row['Employee ID']?.trim() || null,
          user_id: row['User ID (numbers only)']?.trim() || null,
          name: row['Name (DO NOT EDIT)']?.trim(),
          mobile_number: row['Phone Number (DO NOT EDIT)']?.trim().replace(/\D/g, ''),
          email: (row['Email (DO NOT EDIT)'] || row['Email'])?.trim().toLowerCase(),
          gender: row['Gender']?.trim().toLowerCase(),
          date_of_birth: parseDateField('Date of Birth (DD-MMM-YYYY)'),
          blood_group: row['Blood Group']?.trim(),
          marital_status: row['Marital Status']?.trim().toLowerCase(),
          name_as_per_aadhar: row['Name as per Aadhar']?.trim(),
          aadhar_number: row['Aadhar Number']?.trim().replace(/\s/g, ''),
          father_name: row['Father Name']?.trim(),
          father_dob: parseDateField('Father DOB (DD-MMM-YYYY)'),
          mother_name: row['Mother Name']?.trim(),
          mother_dob: parseDateField('Mother DOB (DD-MMM-YYYY)'),
          wife_name: row['Wife Name']?.trim(),
          wife_dob: parseDateField('Wife DOB (DD-MMM-YYYY)'),
          child1_name: row['Child 1 Name']?.trim(),
          child1_gender: row['Child 1 Gender (male/female)']?.trim().toLowerCase(),
          child1_dob: parseDateField('Child 1 DOB (DD-MMM-YYYY)'),
          child2_name: row['Child 2 Name']?.trim(),
          child2_gender: row['Child 2 Gender (male/female)']?.trim().toLowerCase(),
          child2_dob: parseDateField('Child 2 DOB (DD-MMM-YYYY)'),
          nominee_name: row['Nominee Name']?.trim(),
          nominee_relation: row['Nominee Relation']?.trim(),
          present_address: row['Present Address']?.trim(),
          permanent_address: row['Permanent Address']?.trim(),
          emergency_contact_name: row['Emergency Contact Name']?.trim(),
          emergency_contact_number: row['Emergency Contact Number']?.trim().replace(/\D/g, ''),
          emergency_contact_relation: row['Relation with Emergency Contact']?.trim(),
          legal_entity: row['Legal Entity']?.trim(),
          pan_number: row['PAN Number']?.trim().toUpperCase(),
          name_as_per_pan: row['Name as Per PAN']?.trim(),
          account_number: row['Account Number']?.trim(),
          ifsc_code: row['IFSC Code']?.trim().toUpperCase(),
          name_as_per_bank: row['Name as per Bank']?.trim(),
          bank_name: row['Bank Name']?.trim(),
          uan_number: row['UAN Number (12 digits)']?.trim().replace(/\s/g, ''),
          esic_ip_number: row['ESIC IP Number (10 digits or N/A)']?.trim()
        };
      });

      const response = await apiRequest('/api/onboarding/onboarding/bulk-upload', {
        method: 'POST',
        body: { records }
      });

      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/onboarding"] });

      toast({
        title: "Upload Complete",
        description: `✓ Success: ${(response as any).results.success} | ✗ Failed: ${(response as any).results.failed}`,
      });

      if ((response as any).results.errors.length > 0) {
        console.error('Upload errors:', (response as any).results.errors);
      }

      setShowPreview(false);
      setPreviewData([]);
      setValidationErrors([]);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = (id: number, checked: boolean) => {
    const status = checked ? 'onboarded' : 'yet_to_be_onboarded';
    updateOnboardingMutation.mutate({ id, status });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Onboarding</h2>
        <p className="text-slate-600 mt-2 text-sm">Manage onboarding process for fit candidates from field training</p>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Onboarding Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Yet to be Onboarded Candidates
            </Button>
            <div className="flex flex-col gap-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Upload Onboarding Details
                  </span>
                </Button>
              </label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading && <span className="text-sm text-slate-600">Uploading...</span>}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Download the list of candidates yet to be onboarded, fill in their details, and upload the completed file.
          </p>
        </CardContent>
      </Card>

      {/* Onboarding Records Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-xl font-semibold text-slate-800">Onboarding Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {/* BASIC DETAILS */}
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Employee ID</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">User ID</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Mobile</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[180px] whitespace-nowrap px-3 py-2">Email</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[80px] whitespace-nowrap px-3 py-2">Gender</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">Blood Group</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Marital Status</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[160px] whitespace-nowrap px-3 py-2">Name as Per Aadhar</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[140px] whitespace-nowrap px-3 py-2">Aadhar Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Father Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">Father DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Mother Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">Mother DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Wife Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">Wife DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Child 1 Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Child 1 Gender</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">Child 1 DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Child 2 Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Child 2 Gender</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">Child 2 DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[130px] whitespace-nowrap px-3 py-2">Nominee Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[140px] whitespace-nowrap px-3 py-2">Nominee Relation</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[200px] px-3 py-2">Present Address</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[200px] px-3 py-2">Permanent Address</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[140px] whitespace-nowrap px-3 py-2">Emergency Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Emergency Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Emergency Relation</TableHead>
                  {/* JOB DETAILS */}
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">City</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">Cluster</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[180px] whitespace-nowrap px-3 py-2">Role</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Manager</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">DOJ</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Gross Salary</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[160px] whitespace-nowrap px-3 py-2">Resume Source Type</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[170px] whitespace-nowrap px-3 py-2">Resume Source Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Cost Centre</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[180px] whitespace-nowrap px-3 py-2">Function</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Business Unit</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Department</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Sub Department</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[130px] whitespace-nowrap px-3 py-2">Legal Entity</TableHead>
                  {/* FINANCIAL DETAILS */}
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">PAN Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Name as Per PAN</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[140px] whitespace-nowrap px-3 py-2">Account Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">IFSC Code</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Name as per Bank</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[130px] whitespace-nowrap px-3 py-2">Bank Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">UAN Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-amber-100 text-left align-top min-w-[130px] whitespace-nowrap px-3 py-2">ESIC IP Number</TableHead>
                  {/* STATUS */}
                  <TableHead className="font-semibold border border-gray-300 bg-gray-50 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Status</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-gray-50 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">Onboarded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={54} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : onboardingRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={54} className="text-center py-8">
                      No onboarding records found
                    </TableCell>
                  </TableRow>
                ) : (
                  onboardingRecords.map((record: any) => {
                    // Format resume source type and name
                    const sourceType = record.resumeSource || record.resume_source;
                    let resumeSourceType = '-';
                    let resumeSourceName = '-';
                    
                    if (sourceType === 'vendor') {
                      resumeSourceType = 'Vendor';
                      resumeSourceName = record.vendorName || record.vendor_name || '-';
                    } else if (sourceType === 'field_recruiter') {
                      resumeSourceType = 'Field Recruiter';
                      resumeSourceName = record.recruiterName || record.recruiter_name || '-';
                    } else if (sourceType === 'referral') {
                      resumeSourceType = 'Referral';
                      resumeSourceName = record.referralName || record.referral_name || '-';
                    } else if (sourceType === 'direct') {
                      resumeSourceType = 'Direct';
                      resumeSourceName = record.directSource || record.direct_source || '-';
                    } else if (sourceType) {
                      resumeSourceType = sourceType;
                    }

                    return (
                    <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                      {/* BASIC DETAILS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.employeeId || record.employee_id || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.userId || record.user_id || '-'}</TableCell>
                      <TableCell className="font-medium text-slate-900 border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] break-words leading-tight">{record.name}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.mobileNumber || record.mobile_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[180px] break-words leading-tight text-sm">{record.email || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.gender || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.dateOfBirth || record.date_of_birth)
                          ? format(new Date(record.dateOfBirth || record.date_of_birth), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.bloodGroup || record.blood_group || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.maritalStatus || record.marital_status || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nameAsPerAadhar || record.name_as_per_aadhar || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.aadharNumber || record.aadhar_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.fatherName || record.father_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.fatherDob || record.father_dob)
                          ? format(new Date(record.fatherDob || record.father_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.motherName || record.mother_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.motherDob || record.mother_dob)
                          ? format(new Date(record.motherDob || record.mother_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.wifeName || record.wife_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.wifeDob || record.wife_dob)
                          ? format(new Date(record.wifeDob || record.wife_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child1Name || record.child1_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child1Gender || record.child1_gender || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.child1Dob || record.child1_dob)
                          ? format(new Date(record.child1Dob || record.child1_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child2Name || record.child2_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child2Gender || record.child2_gender || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.child2Dob || record.child2_dob)
                          ? format(new Date(record.child2Dob || record.child2_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nomineeName || record.nominee_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nomineeRelation || record.nominee_relation || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[200px] text-xs leading-tight break-words line-clamp-3">
                          {record.presentAddress || record.present_address || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[200px] text-xs leading-tight break-words line-clamp-3">
                          {record.permanentAddress || record.permanent_address || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.emergencyContactName || record.emergency_contact_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.emergencyContactNumber || record.emergency_contact_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.emergencyContactRelation || record.emergency_contact_relation || '-'}</TableCell>
                      {/* JOB DETAILS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.city || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.cluster || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[180px] text-sm leading-tight break-words">{record.role || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.managerName || record.manager_name || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.dateOfJoining || record.date_of_joining)
                          ? format(new Date(record.dateOfJoining || record.date_of_joining), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {record.grossSalary || record.gross_salary
                          ? Number(record.grossSalary || record.gross_salary).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{resumeSourceType}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[170px] text-sm leading-tight break-words">{resumeSourceName}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[120px] text-sm leading-tight break-words">{record.costCentre || record.cost_centre || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[180px] text-sm leading-tight break-words">{record.functionName || record.function_name || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.businessUnitName || record.business_unit_name || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.departmentName || record.department_name || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.subDepartmentName || record.sub_department_name || '-'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[130px] text-sm leading-tight break-words">{record.legalEntity || record.legal_entity || '-'}</div>
                      </TableCell>
                      {/* FINANCIAL DETAILS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.panNumber || record.pan_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nameAsPerPan || record.name_as_per_pan || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.accountNumber || record.account_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.ifscCode || record.ifsc_code || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nameAsPerBank || record.name_as_per_bank || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.bankName || record.bank_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.uanNumber || record.uan_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.esicIpNumber || record.esic_ip_number || '-'}</TableCell>
                      {/* STATUS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <Badge
                          variant={
                            (record.onboardingStatus || record.onboarding_status) === 'onboarded'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {(record.onboardingStatus || record.onboarding_status) === 'onboarded'
                            ? 'Onboarded'
                            : 'Yet to be Onboarded'}
                        </Badge>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <Checkbox
                          checked={(record.onboardingStatus || record.onboarding_status) === 'onboarded'}
                          onCheckedChange={(checked) => handleStatusChange(record.id, checked as boolean)}
                        />
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Validation Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Validation Results
              <Badge variant={validationErrors.filter(v => v.status === 'error').length > 0 ? 'destructive' : 'default'}>
                {previewData.length} rows
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Review validation results before uploading. Rows with errors will be skipped.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{validationErrors.filter(v => v.status === 'success').length}</p>
                      <p className="text-sm text-muted-foreground">Valid Rows</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">{validationErrors.filter(v => v.status === 'warning').length}</p>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">{validationErrors.filter(v => v.status === 'error').length}</p>
                      <p className="text-sm text-muted-foreground">Errors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Validation Details */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Row</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[150px]">Name</TableHead>
                    <TableHead className="w-[120px]">Phone</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((validation) => (
                    <TableRow key={validation.rowIndex} className={
                      validation.status === 'error' ? 'bg-red-50' :
                      validation.status === 'warning' ? 'bg-yellow-50' :
                      'bg-green-50'
                    }>
                      <TableCell className="font-medium">{validation.rowIndex}</TableCell>
                      <TableCell>
                        {validation.status === 'success' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        )}
                        {validation.status === 'warning' && (
                          <Badge variant="outline" className="text-yellow-700 border-yellow-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Warn
                          </Badge>
                        )}
                        {validation.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {validation.row['Name (DO NOT EDIT)'] || '-'}
                      </TableCell>
                      <TableCell>
                        {validation.row['Phone Number (DO NOT EDIT)'] || '-'}
                      </TableCell>
                      <TableCell>
                        {validation.errors.length > 0 && (
                          <div className="space-y-1">
                            {validation.errors.map((error: string, idx: number) => (
                              <div key={idx} className="text-sm text-red-700 flex items-start gap-1">
                                <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {validation.warnings.length > 0 && (
                          <div className="space-y-1">
                            {validation.warnings.map((warning: string, idx: number) => (
                              <div key={idx} className="text-sm text-yellow-700 flex items-start gap-1">
                                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {validation.status === 'success' && (
                          <span className="text-sm text-green-700">No issues</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUpload}
              disabled={uploading || validationErrors.filter(v => v.status !== 'error').length === 0}
            >
              {uploading ? 'Uploading...' : `Upload ${validationErrors.filter(v => v.status !== 'error').length} Valid Rows`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
