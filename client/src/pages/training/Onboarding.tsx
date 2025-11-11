import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download } from "lucide-react";
import { format } from "date-fns";

export default function Onboarding() {
  const [uploading, setUploading] = useState(false);
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
      "Candidate ID (DO NOT EDIT)",
      // BASIC DETAILS
      "Employee ID",
      "User ID (numbers only)",
      "Name (DO NOT EDIT)", 
      "Phone Number (DO NOT EDIT)", 
      "Email (DO NOT EDIT)", 
      "Gender", 
      "Date of Birth (YYYY-MM-DD)",
      "Blood Group", 
      "Marital Status",
      "Name as per Aadhar", 
      "Aadhar Number",
      "Father Name",
      "Father DOB (YYYY-MM-DD)",
      "Mother Name",
      "Mother DOB (YYYY-MM-DD)",
      "Wife Name",
      "Wife DOB (YYYY-MM-DD)",
      "Child 1 Name",
      "Child 1 Gender (male/female)",
      "Child 1 DOB (YYYY-MM-DD)",
      "Child 2 Name",
      "Child 2 Gender (male/female)",
      "Child 2 DOB (YYYY-MM-DD)",
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
        record.candidateId || record.candidate_id || '',
        // BASIC DETAILS
        record.employeeId || record.employee_id || '',
        record.userId || record.user_id || '',
        record.name || '',
        record.mobileNumber || record.mobile_number || '',
        record.candidateEmail || record.candidate_email || record.email || '',
        record.gender || '',
        record.dateOfBirth || record.date_of_birth ? format(new Date(record.dateOfBirth || record.date_of_birth), 'yyyy-MM-dd') : '',
        record.bloodGroup || record.blood_group || '',
        record.maritalStatus || record.marital_status || '',
        record.nameAsPerAadhar || record.name_as_per_aadhar || '',
        record.aadharNumber || record.aadhar_number || '',
        record.fatherName || record.father_name || '',
        record.fatherDob || record.father_dob ? format(new Date(record.fatherDob || record.father_dob), 'yyyy-MM-dd') : '',
        record.motherName || record.mother_name || '',
        record.motherDob || record.mother_dob ? format(new Date(record.motherDob || record.mother_dob), 'yyyy-MM-dd') : '',
        record.wifeName || record.wife_name || '',
        record.wifeDob || record.wife_dob ? format(new Date(record.wifeDob || record.wife_dob), 'yyyy-MM-dd') : '',
        record.child1Name || record.child1_name || '',
        record.child1Gender || record.child1_gender || '',
        record.child1Dob || record.child1_dob ? format(new Date(record.child1Dob || record.child1_dob), 'yyyy-MM-dd') : '',
        record.child2Name || record.child2_name || '',
        record.child2Gender || record.child2_gender || '',
        record.child2Dob || record.child2_dob ? format(new Date(record.child2Dob || record.child2_dob), 'yyyy-MM-dd') : '',
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

      // Transform data - only editable fields, include candidate_id for matching
      const records = jsonData.map((row: any) => ({
        candidate_id: row['Candidate ID (DO NOT EDIT)'],
        employee_id: row['Employee ID'],
        user_id: row['User ID (numbers only)'],
        name: row['Name (DO NOT EDIT)'],
        mobile_number: row['Phone Number (DO NOT EDIT)'],
        email: row['Email (DO NOT EDIT)'] || row['Email'],
        gender: row['Gender']?.toLowerCase(),
        date_of_birth: row['Date of Birth (YYYY-MM-DD)'],
        blood_group: row['Blood Group'],
        marital_status: row['Marital Status']?.toLowerCase(),
        name_as_per_aadhar: row['Name as per Aadhar'],
        aadhar_number: row['Aadhar Number'],
        father_name: row['Father Name'],
        father_dob: row['Father DOB (YYYY-MM-DD)'],
        mother_name: row['Mother Name'],
        mother_dob: row['Mother DOB (YYYY-MM-DD)'],
        wife_name: row['Wife Name'],
        wife_dob: row['Wife DOB (YYYY-MM-DD)'],
        child1_name: row['Child 1 Name'],
        child1_gender: row['Child 1 Gender (male/female)']?.toLowerCase(),
        child1_dob: row['Child 1 DOB (YYYY-MM-DD)'],
        child2_name: row['Child 2 Name'],
        child2_gender: row['Child 2 Gender (male/female)']?.toLowerCase(),
        child2_dob: row['Child 2 DOB (YYYY-MM-DD)'],
        nominee_name: row['Nominee Name'],
        nominee_relation: row['Nominee Relation'],
        present_address: row['Present Address'],
        permanent_address: row['Permanent Address'],
        emergency_contact_name: row['Emergency Contact Name'],
        emergency_contact_number: row['Emergency Contact Number'],
        emergency_contact_relation: row['Relation with Emergency Contact'],
        legal_entity: row['Legal Entity'],
        pan_number: row['PAN Number'],
        name_as_per_pan: row['Name as Per PAN'],
        account_number: row['Account Number'],
        ifsc_code: row['IFSC Code'],
        name_as_per_bank: row['Name as per Bank'],
        bank_name: row['Bank Name'],
        uan_number: row['UAN Number (12 digits)'],
        esic_ip_number: row['ESIC IP Number (10 digits or N/A)']
      }));

      // Send to backend
      const response = await apiRequest('/api/onboarding/onboarding/bulk-upload', {
        method: 'POST',
        body: { records }
      });

      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/onboarding"] });

      toast({
        title: "Upload Complete",
        description: `Success: ${(response as any).results.success}, Failed: ${(response as any).results.failed}`,
      });

      if ((response as any).results.errors.length > 0) {
        console.error('Upload errors:', (response as any).results.errors);
      }

      event.target.value = '';
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
              Download Template
            </Button>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="max-w-xs"
              />
              {uploading && <span className="text-sm text-slate-600">Uploading...</span>}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Download the template, fill in the candidate details, and upload the completed file.
          </p>
        </CardContent>
      </Card>

      {/* Onboarding Records Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-xl font-semibold text-slate-800">Onboarding Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {/* BASIC DETAILS */}
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Employee ID</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">User ID</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Mobile</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Email</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Gender</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Blood Group</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Marital Status</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Name as Per Aadhar</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Aadhar Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Father Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Father DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Mother Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Mother DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Wife Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Wife DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Child 1 Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Child 1 Gender</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Child 1 DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Child 2 Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Child 2 Gender</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Child 2 DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Nominee Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Nominee Relation</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Present Address</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Permanent Address</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Emergency Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Emergency Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-50">Emergency Relation</TableHead>
                  {/* JOB DETAILS */}
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">City</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Cluster</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Role</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Manager</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">DOJ</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Gross Salary</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Resume Source Type</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Resume Source Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Cost Centre</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Function</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Business Unit</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Department</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Sub Department</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-50">Legal Entity</TableHead>
                  {/* FINANCIAL DETAILS */}
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">PAN Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">Name as Per PAN</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">Account Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">IFSC Code</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">Name as per Bank</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">Bank Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">UAN Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-yellow-50">ESIC IP Number</TableHead>
                  {/* STATUS */}
                  <TableHead className="font-semibold border border-gray-300">Onboarded</TableHead>
                  <TableHead className="font-semibold border border-gray-300">Status</TableHead>
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
                      <TableCell className="border border-gray-300">{record.employeeId || record.employee_id || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.userId || record.user_id || '-'}</TableCell>
                      <TableCell className="font-medium text-slate-900 border border-gray-300">{record.name}</TableCell>
                      <TableCell className="border border-gray-300">{record.mobileNumber || record.mobile_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.email || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.gender || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        {(record.dateOfBirth || record.date_of_birth)
                          ? format(new Date(record.dateOfBirth || record.date_of_birth), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">{record.bloodGroup || record.blood_group || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.maritalStatus || record.marital_status || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.nameAsPerAadhar || record.name_as_per_aadhar || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.aadharNumber || record.aadhar_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.fatherName || record.father_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        {(record.fatherDob || record.father_dob)
                          ? format(new Date(record.fatherDob || record.father_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">{record.motherName || record.mother_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        {(record.motherDob || record.mother_dob)
                          ? format(new Date(record.motherDob || record.mother_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">{record.wifeName || record.wife_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        {(record.wifeDob || record.wife_dob)
                          ? format(new Date(record.wifeDob || record.wife_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">{record.child1Name || record.child1_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.child1Gender || record.child1_gender || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        {(record.child1Dob || record.child1_dob)
                          ? format(new Date(record.child1Dob || record.child1_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">{record.child2Name || record.child2_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.child2Gender || record.child2_gender || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        {(record.child2Dob || record.child2_dob)
                          ? format(new Date(record.child2Dob || record.child2_dob), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">{record.nomineeName || record.nominee_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.nomineeRelation || record.nominee_relation || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        <div className="text-sm max-w-xs truncate">
                          {record.presentAddress || record.present_address || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <div className="text-sm max-w-xs truncate">
                          {record.permanentAddress || record.permanent_address || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300">{record.emergencyContactName || record.emergency_contact_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.emergencyContactNumber || record.emergency_contact_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.emergencyContactRelation || record.emergency_contact_relation || '-'}</TableCell>
                      {/* JOB DETAILS */}
                      <TableCell className="border border-gray-300">{record.city || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.cluster || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.role || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.managerName || record.manager_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">
                        {(record.dateOfJoining || record.date_of_joining)
                          ? format(new Date(record.dateOfJoining || record.date_of_joining), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        {record.grossSalary || record.gross_salary
                          ? Number(record.grossSalary || record.gross_salary).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300">{resumeSourceType}</TableCell>
                      <TableCell className="border border-gray-300">{resumeSourceName}</TableCell>
                      <TableCell className="border border-gray-300">{record.costCentre || record.cost_centre || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.functionName || record.function_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.businessUnitName || record.business_unit_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.departmentName || record.department_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.subDepartmentName || record.sub_department_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.legalEntity || record.legal_entity || '-'}</TableCell>
                      {/* FINANCIAL DETAILS */}
                      <TableCell className="border border-gray-300">{record.panNumber || record.pan_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.nameAsPerPan || record.name_as_per_pan || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.accountNumber || record.account_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.ifscCode || record.ifsc_code || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.nameAsPerBank || record.name_as_per_bank || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.bankName || record.bank_name || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.uanNumber || record.uan_number || '-'}</TableCell>
                      <TableCell className="border border-gray-300">{record.esicIpNumber || record.esic_ip_number || '-'}</TableCell>
                      {/* STATUS */}
                      <TableCell className="border border-gray-300">
                        <Checkbox
                          checked={(record.onboardingStatus || record.onboarding_status) === 'onboarded'}
                          onCheckedChange={(checked) => handleStatusChange(record.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
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
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
