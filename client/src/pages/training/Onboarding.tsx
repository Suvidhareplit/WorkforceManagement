import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download, Upload, AlertCircle, CheckCircle2, AlertTriangle, X, UserCheck, Lock, Check, FileCheck, Loader2, UserPlus } from "lucide-react";
import { format } from "date-fns";

export default function Onboarding() {
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMigrationMode, setIsMigrationMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'single' | 'bulk'>('single');
  const [singleRecordId, setSingleRecordId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch onboarding records
  const { data: onboardingResponse, isLoading } = useQuery({
    queryKey: ["/api/onboarding/onboarding"],
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 min
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  const onboardingRecords = (onboardingResponse as any) || [];

  // Fetch employees to check profile creation status
  const { data: employeesResponse } = useQuery({
    queryKey: ["/api/employees"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const employees = (employeesResponse as any) || [];
  
  // Helper function to check if profile exists for an onboarding record
  const hasProfile = (onboardingId: number) => {
    return employees.some((emp: any) => emp.onboarding_id === onboardingId);
  };

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

  // Bulk onboarding submission mutation (with locking)
  const bulkOnboardingMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return await apiRequest('/api/onboarding/bulk-onboard', {
        method: "POST",
        body: { ids }
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/onboarding"] });
      setSelectedRecords(new Set());
      setShowConfirmDialog(false);
      toast({
        title: "Success",
        description: `${data.successCount || 0} record(s) marked as onboarded and locked`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit onboarding",
        variant: "destructive",
      });
    },
  });

  // Create employee profile mutation (direct creation without dialog)
  const createEmployeeProfileMutation = useMutation({
    mutationFn: async (onboarding_id: number) => {
      return await apiRequest('/api/employees/profile', {
        method: "POST",
        body: { onboarding_id }
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: `Employee profile created successfully for ${data.data?.name || 'candidate'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee profile",
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
      "Physically Handicapped (Yes/No)",
      "Nationality",
      "International Worker (Yes/No)",
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
      "Legal Entity",
      "Business Unit (DO NOT EDIT)",
      "Function (DO NOT EDIT)",
      "Department (DO NOT EDIT)",
      "Sub Department (DO NOT EDIT)",
      "Employment Type (DO NOT EDIT)",
      "City (DO NOT EDIT)", 
      "Cluster (DO NOT EDIT)", 
      "Role (DO NOT EDIT)", 
      "Reporting Manager (DO NOT EDIT)", 
      "Date of Joining (DO NOT EDIT)", 
      "Gross Salary (DO NOT EDIT)",
      "Resume Source Type (DO NOT EDIT)",
      "Resume Source Name (DO NOT EDIT)",
      "Cost Centre (DO NOT EDIT)",
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

      // Calculate employment type based on resume source
      const employmentType = sourceType === 'vendor' ? 'Contract' : 'Permanent';

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
        record.physicallyHandicapped || record.physically_handicapped || '',
        record.nationality || 'Indian',
        record.internationalWorker || record.international_worker || '',
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
        record.legalEntity || record.legal_entity || '',
        record.businessUnitName || record.business_unit_name || '',
        record.functionName || record.function_name || '',
        record.departmentName || record.department_name || '',
        record.subDepartmentName || record.sub_department_name || '',
        employmentType,
        record.city || '',
        record.cluster || '',
        record.role || '',
        record.managerName || record.manager_name || '',
        record.dateOfJoining || record.date_of_joining ? format(new Date(record.dateOfJoining || record.date_of_joining), 'yyyy-MM-dd') : '',
        record.grossSalary || record.gross_salary || '',
        resumeSourceType,
        resumeSourceName,
        record.costCentre || record.cost_centre || '',
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
  // Helper function to get value from row with flexible column name matching
  const getColumnValue = (row: any, ...possibleNames: string[]): any => {
    for (const name of possibleNames) {
      if (row[name] !== undefined) {
        return row[name];
      }
    }
    return undefined;
  };

  // Validation functions
  const parseDateDDMMMYYYY = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    try {
      // Parse multiple formats:
      // - DD-MMM-YYYY (e.g., 12-Aug-2025)
      // - DD-MM-YYYY (e.g., 25-08-1995)
      // - DD/MM/YYYY (e.g., 25/08/1995)
      // - YYYY-MM-DD (e.g., 1995-08-25)
      const trimmed = dateStr.trim();
      
      // Split by dash or slash
      let parts = trimmed.includes('-') ? trimmed.split('-') : trimmed.split('/');
      if (parts.length !== 3) return null;
      
      let day: number, monthStr: string, year: number;
      
      // Check if it's YYYY-MM-DD format (year > 1000 in first position)
      if (parseInt(parts[0]) > 1000) {
        // YYYY-MM-DD format
        year = parseInt(parts[0]);
        monthStr = parts[1];
        day = parseInt(parts[2]);
      } else {
        // DD-MM-YYYY or DD/MM/YYYY format
        day = parseInt(parts[0]);
        monthStr = parts[1];
        year = parseInt(parts[2]);
      }
      
      let month: number;
      
      // Check if month is numeric (DD-MM-YYYY or YYYY-MM-DD format)
      const monthNum = parseInt(monthStr);
      if (!isNaN(monthNum)) {
        // Numeric month: 01-12 → 0-11 for Date constructor
        month = monthNum - 1;
        if (month < 0 || month > 11) return null;
      } else {
        // Text month: Jan, Feb, etc.
        const months: { [key: string]: number } = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        month = months[monthStr];
        if (month === undefined) return null;
      }
      
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) return null;
      
      return date;
    } catch {
      return null;
    }
  };

  // Auto-matching: Find similar candidates in the database
  const findMatchingSuggestions = (row: any) => {
    const name = row['Name (DO NOT EDIT)']?.trim().toLowerCase();
    const phone = row['Phone Number (DO NOT EDIT)']?.trim().replace(/\D/g, '');
    const employeeId = row['Employee ID']?.trim();
    
    const suggestions: any[] = [];

    if (!name && !phone && !employeeId) return suggestions;

    onboardingRecords.forEach((record: any) => {
      const dbName = (record.name || '').toLowerCase();
      const dbPhone = (record.mobileNumber || record.mobile_number || '').replace(/\D/g, '');
      const dbEmployeeId = record.employeeId || record.employee_id;

      let score = 0;
      const reasons: string[] = [];

      // Exact matches
      if (employeeId && dbEmployeeId === employeeId) {
        score += 100;
        reasons.push('Exact Employee ID match');
      }
      if (phone && dbPhone === phone) {
        score += 80;
        reasons.push('Exact phone match');
      }
      
      // Name similarity (contains)
      if (name && dbName.includes(name)) {
        score += 50;
        reasons.push('Name contains match');
      } else if (name && name.includes(dbName)) {
        score += 40;
        reasons.push('Partial name match');
      }

      if (score > 0) {
        suggestions.push({
          record,
          score,
          reasons: reasons.join(', ')
        });
      }
    });

    // Sort by score and return top 3
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const validateRecord = (row: any, index: number) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions = findMatchingSuggestions(row);

    // DEBUG: Log actual column values
    console.log(`\n=== Validating Row ${index + 1} ===`);
    const dobValue = getColumnValue(row, 'Date of Birth (DD-MMM-YYYY)', 'Date of Birth (YYYY-MM-DD)', 'Date of Birth', 'DOB');
    const fatherDobValue = getColumnValue(row, 'Father DOB (DD-MMM-YYYY)', 'Father DOB (YYYY-MM-DD)', 'Father DOB');
    const motherDobValue = getColumnValue(row, 'Mother DOB (DD-MMM-YYYY)', 'Mother DOB (YYYY-MM-DD)', 'Mother DOB');
    console.log('Date of Birth value:', dobValue);
    console.log('Father DOB value:', fatherDobValue);
    console.log('Mother DOB value:', motherDobValue);
    console.log('Father Name:', row['Father Name']);
    console.log('Mother Name:', row['Mother Name']);
    console.log('All columns in row:', Object.keys(row));

    // Required field: Name or Employee ID
    if (!row['Name (DO NOT EDIT)']?.trim() && !row['Employee ID']?.trim()) {
      errors.push('Either Name or Employee ID is required');
    }

    // Phone number - already validated in candidate stage, skip validation
    // Email - already validated in candidate stage, skip validation

    // Check if no matching record found (for informational purposes)
    if (suggestions.length === 0 && row['Name (DO NOT EDIT)']?.trim()) {
      warnings.push('No matching candidate found in database. Make sure this candidate completed Field Training.');
    }

    // Gender validation
    if (row['Gender'] && !['male', 'female', 'm', 'f'].includes(row['Gender'].toLowerCase().trim())) {
      errors.push(`Invalid Gender: "${row['Gender']}" (should be male, female, m, or f)`);
    }

    // Marital Status validation
    const validMaritalStatuses = ['single', 'married', 'divorced', 'widowed', 'unmarried'];
    if (row['Marital Status'] && !validMaritalStatuses.includes(row['Marital Status'].toLowerCase().trim())) {
      errors.push(`Invalid Marital Status: "${row['Marital Status']}" (should be single/unmarried/married/divorced/widowed)`);
    }

    // Physically Handicapped validation (Yes/No only)
    if (row['Physically Handicapped (Yes/No)']) {
      const physicallyHandicapped = row['Physically Handicapped (Yes/No)'].toLowerCase().trim();
      if (!['yes', 'no'].includes(physicallyHandicapped)) {
        errors.push(`Invalid Physically Handicapped: "${row['Physically Handicapped (Yes/No)']}" (should be Yes or No only)`);
      }
    }

    // International Worker validation (Yes/No only)
    if (row['International Worker (Yes/No)']) {
      const internationalWorker = row['International Worker (Yes/No)'].toLowerCase().trim();
      if (!['yes', 'no'].includes(internationalWorker)) {
        errors.push(`Invalid International Worker: "${row['International Worker (Yes/No)']}" (should be Yes or No only)`);
      }
    }

    // Blood Group validation
    if (row['Blood Group']) {
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A POSITIVE', 'A NEGATIVE', 'B POSITIVE', 'B NEGATIVE', 'AB POSITIVE', 'AB NEGATIVE', 'O POSITIVE', 'O NEGATIVE'];
      const bloodGroup = row['Blood Group'].trim().toUpperCase().replace(' ', '');
      const normalized = bloodGroup.replace('POSITIVE', '+').replace('NEGATIVE', '-');
      if (!validBloodGroups.map(bg => bg.replace(' ', '')).includes(bloodGroup) && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(normalized)) {
        errors.push(`Invalid Blood Group: "${row['Blood Group']}" (should be A+, A-, B+, B-, AB+, AB-, O+, or O-)`);
      }
    }

    // Marital Status Conditional Validations
    const maritalStatus = row['Marital Status']?.toLowerCase().trim();
    if (maritalStatus === 'married') {
      // If married, wife name and DOB are mandatory
      if (!row['Wife Name']?.trim() || row['Wife Name']?.trim().toLowerCase() === 'n/a') {
        errors.push('Wife Name is required when Marital Status is Married');
      }
      if (!row['Wife DOB (DD-MMM-YYYY)']?.trim() || row['Wife DOB (DD-MMM-YYYY)']?.trim().toLowerCase() === 'n/a') {
        errors.push('Wife DOB is required when Marital Status is Married');
      }
    }

    // Child Gender validation (only if provided)
    if (row['Child 1 Gender (male/female)']?.trim() && !['male', 'female', 'm', 'f', 'n/a'].includes(row['Child 1 Gender (male/female)'].toLowerCase().trim())) {
      errors.push(`Invalid Child 1 Gender: "${row['Child 1 Gender (male/female)']}" (should be male, female, or N/A)`);
    }
    if (row['Child 2 Gender (male/female)']?.trim() && !['male', 'female', 'm', 'f', 'n/a'].includes(row['Child 2 Gender (male/female)'].toLowerCase().trim())) {
      errors.push(`Invalid Child 2 Gender: "${row['Child 2 Gender (male/female)']}" (should be male, female, or N/A)`);
    }

    // Mandatory date fields validation (cannot be empty or N/A)
    // Exception: If Father/Mother name contains "Late" (deceased), DOB is optional
    const fatherName = row['Father Name']?.toLowerCase() || '';
    const motherName = row['Mother Name']?.toLowerCase() || '';
    const isFatherLate = fatherName.includes('late');
    const isMotherLate = motherName.includes('late');
    
    // Note: We detect "Late" but don't add warnings - it's handled silently
    // The validation logic below will skip DOB requirement if "Late" is detected
    
    // Date of Birth - always mandatory (use flexible column matching)
    if (!dobValue || dobValue.trim() === '' || dobValue.trim().toLowerCase() === 'n/a' || dobValue.trim().toLowerCase() === 'na') {
      errors.push('Date of Birth is required and cannot be N/A');
    }
    
    // Father DOB - mandatory unless Father name contains "Late"
    if (!isFatherLate) {
      if (!fatherDobValue || fatherDobValue.trim() === '' || fatherDobValue.trim().toLowerCase() === 'n/a' || fatherDobValue.trim().toLowerCase() === 'na') {
        errors.push('Father DOB is required and cannot be N/A (unless Father name contains "Late")');
      }
    }
    
    // Mother DOB - mandatory unless Mother name contains "Late"
    if (!isMotherLate) {
      if (!motherDobValue || motherDobValue.trim() === '' || motherDobValue.trim().toLowerCase() === 'n/a' || motherDobValue.trim().toLowerCase() === 'na') {
        errors.push('Mother DOB is required and cannot be N/A (unless Mother name contains "Late")');
      }
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
        // Skip N/A values for optional dates
        const normalizedValue = value.trim().toLowerCase();
        
        // Check if this field can be N/A
        const canBeNA = 
          field === 'Wife DOB (DD-MMM-YYYY)' || 
          field === 'Child 1 DOB (DD-MMM-YYYY)' || 
          field === 'Child 2 DOB (DD-MMM-YYYY)' ||
          (field === 'Father DOB (DD-MMM-YYYY)' && isFatherLate) ||
          (field === 'Mother DOB (DD-MMM-YYYY)' && isMotherLate);
        
        if ((normalizedValue === 'n/a' || normalizedValue === 'na') && canBeNA) {
          return; // Skip validation for N/A in optional fields
        }
        
        const parsed = parseDateDDMMMYYYY(value);
        if (!parsed) {
          errors.push(`Invalid date format for ${field}: "${value}" (should be DD-MMM-YYYY like 12-Aug-2025 OR DD-MM-YYYY like 25-08-1995, or N/A)`);
        } else {
          // Date reasonableness checks
          const today = new Date();
          const age = (today.getTime() - parsed.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          
          if (field === 'Date of Birth (DD-MMM-YYYY)') {
            if (parsed > today) {
              errors.push(`Date of Birth cannot be in the future: "${value}"`);
            } else if (age > 100) {
              warnings.push(`Date of Birth seems too old (${Math.floor(age)} years): "${value}"`);
            } else if (age < 18) {
              warnings.push(`Candidate age is less than 18 years (${Math.floor(age)} years)`);
            }
          }
          
          // Parent DOB checks (optional fields)
          if ((field === 'Father DOB (DD-MMM-YYYY)' || field === 'Mother DOB (DD-MMM-YYYY)') && parsed > today) {
            errors.push(`${field.split(' ')[0]} Date of Birth cannot be in the future: "${value}"`);
          }
          
          // Wife DOB checks
          if (field === 'Wife DOB (DD-MMM-YYYY)') {
            if (parsed > today) {
              errors.push(`Wife Date of Birth cannot be in the future: "${value}"`);
            }
            // Additional check: If married, wife DOB already validated as required above
          }
          
          // Child DOB checks (optional fields)
          if ((field === 'Child 1 DOB (DD-MMM-YYYY)' || field === 'Child 2 DOB (DD-MMM-YYYY)') && parsed > today) {
            errors.push(`${field.split(' ')[0]} ${field.split(' ')[1]} Date of Birth cannot be in the future: "${value}"`);
          }
        }
      }
    });

    // Aadhar validation (12 digits, numbers only)
    if (row['Aadhar Number']) {
      const aadhar = row['Aadhar Number'].replace(/\s/g, '');
      if (!/^\d{12}$/.test(aadhar)) {
        errors.push(`Invalid Aadhar Number: "${row['Aadhar Number']}" (must be exactly 12 digits, numbers only)`);
      }
    }

    // PAN validation (format: ABCDE1234F)
    if (row['PAN Number']) {
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panPattern.test(row['PAN Number'].trim().toUpperCase())) {
        errors.push(`Invalid PAN format: "${row['PAN Number']}" (should be like ABCDE1234F - 5 letters, 4 digits, 1 letter)`);
      }
    }

    // Account Number validation (9-18 digits)
    if (row['Account Number']) {
      const account = row['Account Number'].trim();
      if (!/^\d{9,18}$/.test(account)) {
        errors.push(`Invalid Account Number: "${row['Account Number']}" (should be 9-18 digits)`);
      }
    }

    // IFSC Code validation (format: ABCD0123456 - typically 11 characters, 4 letters + rest alphanumeric)
    if (row['IFSC Code']) {
      const ifscTrimmed = row['IFSC Code'].trim().toUpperCase();
      // Accept 11 character standard IFSC: 4 letters + 7 alphanumeric
      const ifscPattern = /^[A-Z]{4}[0-9A-Z]{7,11}$/;
      if (!ifscPattern.test(ifscTrimmed) || ifscTrimmed.length < 11) {
        errors.push(`Invalid IFSC Code: "${row['IFSC Code']}" (should be 4 letters + 7-11 alphanumeric characters, e.g., SBIN0001234)`);
      }
    }

    // UAN validation (12 digits, numbers only) - CRITICAL ERROR
    if (row['UAN Number (12 digits)']) {
      const uan = row['UAN Number (12 digits)'].replace(/\s/g, '');
      if (!/^\d{12}$/.test(uan)) {
        errors.push(`Invalid UAN Number: "${row['UAN Number (12 digits)']}" (must be exactly 12 digits, numbers only)`);
      }
    }

    // ESIC validation (10 digits or N/A) - CRITICAL ERROR
    const esic = row['ESIC IP Number (10 digits or N/A)'];
    if (esic && esic.trim().toUpperCase() !== 'N/A') {
      const esicDigits = esic.replace(/\s/g, '');
      if (!/^\d{10}$/.test(esicDigits)) {
        errors.push(`Invalid ESIC IP Number: "${esic}" (must be exactly 10 digits or N/A)`);
      }
    }

    return { 
      rowIndex: index + 1, 
      row, 
      errors, 
      warnings, 
      suggestions,
      status: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success' 
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isMigration: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Set migration mode
    setIsMigrationMode(isMigration);

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
    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate progress for user feedback
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      // Transform validated data to backend format
      const records = validRows.map(({ row }) => {
        const parseDateField = (...possibleFieldNames: string[]) => {
          const value = getColumnValue(row, ...possibleFieldNames);
          console.log(`Parsing date field (tried: ${possibleFieldNames.join(', ')}):`, value);
          if (!value || value.trim() === '') {
            console.log(`  → Empty, returning null`);
            return null;
          }
          // Handle N/A values
          const normalizedValue = value.trim().toLowerCase();
          if (normalizedValue === 'n/a' || normalizedValue === 'na') {
            console.log(`  → N/A value, returning null`);
            return null;
          }
          
          const parsed = parseDateDDMMMYYYY(value);
          const result = parsed ? format(parsed, 'yyyy-MM-dd') : null;
          console.log(`  → Parsed result:`, result);
          return result;
        };

        const trimOrNull = (value: any) => {
          if (!value || value.trim() === '') return null;
          const trimmed = value.trim();
          // Handle N/A values
          if (trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'na') return null;
          return trimmed;
        };

        const normalizeGender = (value: any) => {
          if (!value || value.trim() === '') return null;
          const gender = value.trim().toLowerCase();
          if (gender === 'n/a' || gender === 'na') return null;
          if (gender === 'm' || gender === 'male') return 'male';
          if (gender === 'f' || gender === 'female') return 'female';
          return gender;
        };

        const normalizeYesNo = (value: any) => {
          if (!value || value.trim() === '') return null;
          const normalized = value.trim().toLowerCase();
          if (normalized === 'yes' || normalized === 'y') return 'Yes';
          if (normalized === 'no' || normalized === 'n') return 'No';
          return value.trim(); // Return as-is if not recognized
        };

        const normalizeMaritalStatus = (value: any) => {
          if (!value || value.trim() === '') return null;
          const status = value.trim().toLowerCase();
          // Convert "unmarried" to "single" for database compatibility
          if (status === 'unmarried') return 'single';
          return status;
        };

        console.log('Raw CSV row:', row);
        
        const transformedRecord = {
          employee_id: trimOrNull(row['Employee ID']),
          user_id: trimOrNull(row['User ID (numbers only)']),
          name: trimOrNull(row['Name (DO NOT EDIT)']),
          mobile_number: row['Phone Number (DO NOT EDIT)']?.trim().replace(/\D/g, '') || null,
          email: trimOrNull(row['Email (DO NOT EDIT)'] || row['Email'])?.toLowerCase(),
          gender: normalizeGender(row['Gender']),
          date_of_birth: parseDateField('Date of Birth (DD-MMM-YYYY)', 'Date of Birth (YYYY-MM-DD)', 'Date of Birth', 'DOB'),
          blood_group: trimOrNull(row['Blood Group'])?.toUpperCase().replace('POSITIVE', '+').replace('NEGATIVE', '-').replace(' ', ''),
          marital_status: normalizeMaritalStatus(row['Marital Status']),
          physically_handicapped: normalizeYesNo(row['Physically Handicapped (Yes/No)']),
          nationality: trimOrNull(row['Nationality']) || 'Indian',
          international_worker: normalizeYesNo(row['International Worker (Yes/No)']),
          name_as_per_aadhar: trimOrNull(row['Name as per Aadhar']),
          aadhar_number: row['Aadhar Number'] ? row['Aadhar Number'].trim().replace(/\s/g, '') : null,
          father_name: trimOrNull(row['Father Name']),
          father_dob: parseDateField('Father DOB (DD-MMM-YYYY)', 'Father DOB (YYYY-MM-DD)', 'Father DOB'),
          mother_name: trimOrNull(row['Mother Name']),
          mother_dob: parseDateField('Mother DOB (DD-MMM-YYYY)', 'Mother DOB (YYYY-MM-DD)', 'Mother DOB'),
          wife_name: trimOrNull(row['Wife Name']),
          wife_dob: parseDateField('Wife DOB (DD-MMM-YYYY)', 'Wife DOB (YYYY-MM-DD)', 'Wife DOB'),
          child1_name: trimOrNull(row['Child 1 Name']),
          child1_gender: normalizeGender(row['Child 1 Gender (male/female)']),
          child1_dob: parseDateField('Child 1 DOB (DD-MMM-YYYY)', 'Child 1 DOB (YYYY-MM-DD)', 'Child 1 DOB'),
          child2_name: trimOrNull(row['Child 2 Name']),
          child2_gender: normalizeGender(row['Child 2 Gender (male/female)']),
          child2_dob: parseDateField('Child 2 DOB (DD-MMM-YYYY)', 'Child 2 DOB (YYYY-MM-DD)', 'Child 2 DOB'),
          nominee_name: trimOrNull(row['Nominee Name']),
          nominee_relation: trimOrNull(row['Nominee Relation']),
          present_address: trimOrNull(row['Present Address']),
          permanent_address: trimOrNull(row['Permanent Address']),
          emergency_contact_name: trimOrNull(row['Emergency Contact Name']),
          emergency_contact_number: row['Emergency Contact Number'] ? row['Emergency Contact Number'].trim().replace(/\D/g, '') : null,
          emergency_contact_relation: trimOrNull(row['Relation with Emergency Contact']),
          legal_entity: trimOrNull(row['Legal Entity']),
          pan_number: trimOrNull(row['PAN Number'])?.toUpperCase(),
          name_as_per_pan: trimOrNull(row['Name as Per PAN']),
          account_number: trimOrNull(row['Account Number']),
          ifsc_code: trimOrNull(row['IFSC Code'])?.toUpperCase(),
          name_as_per_bank: trimOrNull(row['Name as per Bank']),
          bank_name: trimOrNull(row['Bank Name']),
          uan_number: row['UAN Number (12 digits)'] ? row['UAN Number (12 digits)'].trim().replace(/\s/g, '') : null,
          esic_ip_number: trimOrNull(row['ESIC IP Number (10 digits or N/A)'])
        };
        
        console.log('Transformed record:', transformedRecord);
        return transformedRecord;
      });

      const apiEndpoint = isMigrationMode 
        ? '/api/onboarding/onboarding/migration-upload'
        : '/api/onboarding/onboarding/bulk-upload';
      
      console.log('=== FRONTEND: Sending upload request ===');
      console.log('Upload mode:', isMigrationMode ? 'MIGRATION' : 'REGULAR');
      console.log('Number of records:', records.length);
      console.log('First record sample:', records[0]);
      console.log('API endpoint:', apiEndpoint);
      
      const response = await apiRequest(apiEndpoint, {
        method: 'POST',
        body: { records }
      });

      console.log('=== FRONTEND: Received response ===');
      console.log('Response:', response);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/onboarding"] });

      toast({
        title: "Upload Complete",
        description: `✓ Success: ${(response as any).results.success} | ✗ Failed: ${(response as any).results.failed}`,
      });

      if ((response as any).results.errors.length > 0) {
        console.error('Upload errors:', (response as any).results.errors);
      }

      // Wait a moment to show 100% before closing
      setTimeout(() => {
        setShowPreview(false);
        setPreviewData([]);
        setValidationErrors([]);
        setUploadProgress(0);
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setIsProcessing(false);
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
    if (checked) {
      // Show confirmation dialog before marking as onboarded
      setSingleRecordId(id);
      setConfirmAction('single');
      setShowConfirmDialog(true);
    } else {
      // Allow unchecking without confirmation (if not locked)
      updateOnboardingMutation.mutate({ id, status: 'yet_to_be_onboarded' });
    }
  };

  // Toggle single record selection
  const toggleRecordSelection = (id: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  // Select all unlocked pending records
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const unlockedPending = onboardingRecords
        .filter((r: any) => 
          (r.onboardingStatus || r.onboarding_status) === 'yet_to_be_onboarded' && 
          !(r.isLocked || r.is_locked)
        )
        .map((r: any) => r.id);
      setSelectedRecords(new Set(unlockedPending));
    } else {
      setSelectedRecords(new Set());
    }
  };

  // Handle bulk submission
  const handleBulkSubmit = () => {
    if (selectedRecords.size === 0) {
      toast({
        title: "No Records Selected",
        description: "Please select at least one record to submit",
        variant: "destructive",
      });
      return;
    }
    setConfirmAction('bulk');
    setShowConfirmDialog(true);
  };

  // Confirm and submit
  const handleConfirmSubmit = () => {
    if (confirmAction === 'single' && singleRecordId) {
      bulkOnboardingMutation.mutate([singleRecordId]);
    } else if (confirmAction === 'bulk') {
      bulkOnboardingMutation.mutate(Array.from(selectedRecords));
    }
  };

  // Get count of unlocked pending records
  const unlockedPendingCount = onboardingRecords.filter((r: any) =>
    (r.onboardingStatus || r.onboarding_status) === 'yet_to_be_onboarded' &&
    !(r.isLocked || r.is_locked)
  ).length;

  const allSelectedCount = selectedRecords.size;
  const allUnlockedSelected = unlockedPendingCount > 0 && allSelectedCount === unlockedPendingCount;

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
          <div className="flex gap-4 flex-wrap">
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
            <div className="flex flex-col gap-2">
              <label htmlFor="migration-upload" className="cursor-pointer">
                <Button variant="default" className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700" asChild>
                  <span>
                    <UserCheck className="h-4 w-4" />
                    Migration Upload (Existing Employees)
                  </span>
                </Button>
              </label>
              <Input
                id="migration-upload"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, true)}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            <strong>Regular Upload:</strong> For new candidates who completed all stages.<br/>
            <strong>Migration Upload:</strong> For existing employees - auto-creates all previous stage records.
          </p>
          <p className="text-sm text-slate-600">
            Download the list of candidates yet to be onboarded, fill in their details, and upload the completed file.
          </p>
        </CardContent>
      </Card>

      {/* Onboarding Records Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-white border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-800">Onboarding Records</CardTitle>
            {selectedRecords.size > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {selectedRecords.size} selected
                </Badge>
                <Button 
                  onClick={handleBulkSubmit} 
                  className="flex items-center gap-2"
                  disabled={bulkOnboardingMutation.isPending}
                >
                  <UserCheck className="h-4 w-4" />
                  Submit {selectedRecords.size} for Onboarding
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {/* SELECTION COLUMN - FROZEN */}
                  <TableHead className="font-semibold border border-gray-300 bg-gray-50 text-center align-top min-w-[80px] whitespace-nowrap px-3 py-2 sticky left-0 z-20">
                    <div className="flex flex-col items-center gap-1">
                      <span>Select</span>
                      <Checkbox 
                        checked={allUnlockedSelected}
                        onCheckedChange={handleSelectAll}
                        disabled={unlockedPendingCount === 0}
                        title={unlockedPendingCount === 0 ? "No unlocked records to select" : "Select all unlocked pending records"}
                      />
                    </div>
                  </TableHead>
                  {/* BASIC DETAILS - FROZEN COLUMNS */}
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2 sticky left-[80px] z-20">Employee ID</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2 sticky left-[200px] z-20">User ID</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2 sticky left-[300px] z-20">Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2 sticky left-[450px] z-20">Mobile</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[180px] whitespace-nowrap px-3 py-2">Email</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">Gender</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">DOB</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">Blood Group</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Marital Status</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[140px] whitespace-nowrap px-3 py-2">Physically Handicapped</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Nationality</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[140px] whitespace-nowrap px-3 py-2">International Worker</TableHead>
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
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[500px] px-3 py-2">Present Address</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[500px] px-3 py-2">Permanent Address</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[140px] whitespace-nowrap px-3 py-2">Emergency Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Emergency Number</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-blue-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Emergency Relation</TableHead>
                  {/* JOB DETAILS */}
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[130px] whitespace-nowrap px-3 py-2">Entity</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Business Unit</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[180px] whitespace-nowrap px-3 py-2">Function</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Department</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Sub Department</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[130px] whitespace-nowrap px-3 py-2">Employment Type</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">City</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[100px] whitespace-nowrap px-3 py-2">Cluster</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[180px] whitespace-nowrap px-3 py-2">Role</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Manager</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[110px] whitespace-nowrap px-3 py-2">DOJ</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Gross Salary</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[160px] whitespace-nowrap px-3 py-2">Resume Source Type</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[170px] whitespace-nowrap px-3 py-2">Resume Source Name</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[120px] whitespace-nowrap px-3 py-2">Cost Centre</TableHead>
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
                  <TableHead className="font-semibold border border-gray-300 bg-gray-50 text-left align-top min-w-[150px] whitespace-nowrap px-3 py-2">Onboarding action</TableHead>
                  <TableHead className="font-semibold border border-gray-300 bg-green-100 text-left align-top min-w-[180px] whitespace-nowrap px-3 py-2">Profile creation Action</TableHead>
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
                      resumeSourceName = record.vendorName || record.vendor_name || 'N/A';
                    } else if (sourceType === 'field_recruiter') {
                      resumeSourceType = 'Field Recruiter';
                      resumeSourceName = record.recruiterName || record.recruiter_name || 'N/A';
                    } else if (sourceType === 'referral') {
                      resumeSourceType = 'Referral';
                      resumeSourceName = record.referralName || record.referral_name || 'N/A';
                    } else if (sourceType === 'direct') {
                      resumeSourceType = 'Direct';
                      resumeSourceName = record.directSource || record.direct_source || 'N/A';
                    } else if (sourceType) {
                      resumeSourceType = sourceType;
                    }

                    // Calculate employment type based on resume source
                    const employmentType = sourceType === 'vendor' ? 'Contract' : 'Permanent';

                    return (
                    <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                      {/* SELECTION COLUMN - FROZEN */}
                      <TableCell className="border border-gray-300 text-center align-top px-3 py-2 sticky left-0 z-10 bg-white">
                        <Checkbox
                          checked={selectedRecords.has(record.id)}
                          onCheckedChange={() => toggleRecordSelection(record.id)}
                          disabled={
                            (record.onboardingStatus || record.onboarding_status) === 'onboarded' ||
                            (record.isLocked || record.is_locked)
                          }
                          title={
                            (record.isLocked || record.is_locked) 
                              ? "Record is locked" 
                              : (record.onboardingStatus || record.onboarding_status) === 'onboarded'
                              ? "Already onboarded"
                              : "Select for bulk submission"
                          }
                        />
                      </TableCell>
                      {/* BASIC DETAILS - FROZEN COLUMNS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap sticky left-[80px] z-10 bg-white">{record.employeeId || record.employee_id || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap sticky left-[200px] z-10 bg-white">{record.userId || record.user_id || 'N/A'}</TableCell>
                      <TableCell className="font-medium text-slate-900 border border-gray-300 text-left align-top px-3 py-2 sticky left-[300px] z-10 bg-white">
                        <div className="max-w-[150px] break-words leading-tight">{record.name}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap sticky left-[450px] z-10 bg-white">{record.mobileNumber || record.mobile_number || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[180px] break-words leading-tight text-sm">{record.email || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.gender || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.dateOfBirth || record.date_of_birth)
                          ? format(new Date(record.dateOfBirth || record.date_of_birth), "dd-MMM-yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.bloodGroup || record.blood_group || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.maritalStatus || record.marital_status || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.physicallyHandicapped || record.physically_handicapped || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nationality || 'Indian'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.internationalWorker || record.international_worker || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nameAsPerAadhar || record.name_as_per_aadhar || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.aadharNumber || record.aadhar_number || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.fatherName || record.father_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.fatherDob || record.father_dob)
                          ? format(new Date(record.fatherDob || record.father_dob), "dd-MMM-yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.motherName || record.mother_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.motherDob || record.mother_dob)
                          ? format(new Date(record.motherDob || record.mother_dob), "dd-MMM-yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.wifeName || record.wife_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.wifeDob || record.wife_dob)
                          ? format(new Date(record.wifeDob || record.wife_dob), "dd-MMM-yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child1Name || record.child1_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child1Gender || record.child1_gender || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.child1Dob || record.child1_dob)
                          ? format(new Date(record.child1Dob || record.child1_dob), "dd-MMM-yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child2Name || record.child2_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.child2Gender || record.child2_gender || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.child2Dob || record.child2_dob)
                          ? format(new Date(record.child2Dob || record.child2_dob), "dd-MMM-yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nomineeName || record.nominee_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nomineeRelation || record.nominee_relation || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="w-full text-xs leading-tight break-words">
                          {record.presentAddress || record.present_address || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="w-full text-xs leading-tight break-words">
                          {record.permanentAddress || record.permanent_address || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.emergencyContactName || record.emergency_contact_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.emergencyContactNumber || record.emergency_contact_number || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.emergencyContactRelation || record.emergency_contact_relation || 'N/A'}</TableCell>
                      {/* JOB DETAILS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[130px] text-sm leading-tight break-words">{record.legalEntity || record.legal_entity || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.businessUnitName || record.business_unit_name || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[180px] text-sm leading-tight break-words">{record.functionName || record.function_name || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.departmentName || record.department_name || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.subDepartmentName || record.sub_department_name || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{employmentType}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.city || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.cluster || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[180px] text-sm leading-tight break-words">{record.role || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[150px] text-sm leading-tight break-words">{record.managerName || record.manager_name || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {(record.dateOfJoining || record.date_of_joining)
                          ? format(new Date(record.dateOfJoining || record.date_of_joining), "dd-MMM-yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">
                        {record.grossSalary || record.gross_salary
                          ? Number(record.grossSalary || record.gross_salary).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{resumeSourceType}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[170px] text-sm leading-tight break-words">{resumeSourceName}</div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="max-w-[120px] text-sm leading-tight break-words">{record.costCentre || record.cost_centre || 'N/A'}</div>
                      </TableCell>
                      {/* FINANCIAL DETAILS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.panNumber || record.pan_number || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nameAsPerPan || record.name_as_per_pan || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.accountNumber || record.account_number || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.ifscCode || record.ifsc_code || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.nameAsPerBank || record.name_as_per_bank || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.bankName || record.bank_name || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.uanNumber || record.uan_number || 'N/A'}</TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2 whitespace-nowrap">{record.esicIpNumber || record.esic_ip_number || 'N/A'}</TableCell>
                      {/* STATUS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <div className="flex items-center gap-2">
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
                          {(record.isLocked || record.is_locked) && (
                            <Badge variant="secondary" className="text-xs font-medium flex items-center gap-1 bg-slate-700 text-white">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        <Checkbox
                          checked={(record.onboardingStatus || record.onboarding_status) === 'onboarded'}
                          onCheckedChange={(checked) => handleStatusChange(record.id, checked as boolean)}
                          disabled={(record.isLocked || record.is_locked)}
                          title={(record.isLocked || record.is_locked) ? "Record is locked and cannot be modified" : "Mark as onboarded"}
                        />
                      </TableCell>
                      {/* ACTIONS */}
                      <TableCell className="border border-gray-300 text-left align-top px-3 py-2">
                        {(record.onboardingStatus || record.onboarding_status) === 'onboarded' ? (
                          hasProfile(record.id) ? (
                            <Badge className="bg-blue-600 hover:bg-blue-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Profile Created
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => createEmployeeProfileMutation.mutate(record.id)}
                              disabled={createEmployeeProfileMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {createEmployeeProfileMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Create Profile
                                </>
                              )}
                            </Button>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">Complete onboarding first</span>
                        )}
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
                        {validation.row['Name (DO NOT EDIT)'] || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {validation.row['Phone Number (DO NOT EDIT)'] || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {/* Errors */}
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
                          {/* Warnings */}
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
                          {/* Auto-Match Suggestions */}
                          {validation.suggestions && validation.suggestions.length > 0 && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-center gap-1 text-xs font-medium text-blue-700 mb-1">
                                <UserCheck className="h-3 w-3" />
                                Matching Candidates Found:
                              </div>
                              {validation.suggestions.slice(0, 2).map((suggestion: any, idx: number) => (
                                <div key={idx} className="text-xs text-blue-600 ml-4 mt-1">
                                  ✓ {suggestion.record.name} | {suggestion.record.mobileNumber || suggestion.record.mobile_number}
                                  <br />
                                  <span className="text-blue-500 text-[10px]">({suggestion.reasons})</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Success */}
                          {validation.status === 'success' && validation.errors.length === 0 && validation.warnings.length === 0 && (
                            <span className="text-sm text-green-700">No issues</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="flex-col items-stretch gap-4">
            {/* Progress Bar */}
            {isProcessing && (
              <div className="w-full">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Upload Progress</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
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
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Confirm Onboarding Submission
            </DialogTitle>
            <DialogDescription className="text-base">
              Please review the following disclaimer before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Submission Summary</h4>
              <p className="text-blue-800">
                {confirmAction === 'single' 
                  ? 'You are about to mark 1 candidate as onboarded.'
                  : `You are about to mark ${selectedRecords.size} candidates as onboarded.`}
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
              <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                IMPORTANT DISCLAIMER
              </h4>
              <ul className="space-y-2 text-sm text-amber-900">
                <li className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Record Locking:</strong> Once submitted, the record(s) will be <strong>permanently locked</strong> and cannot be edited or reversed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Data Verification:</strong> Ensure all candidate information is accurate and complete before proceeding.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Compliance:</strong> By submitting, you confirm that all required documents and verifications are completed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>No Undo:</strong> This action cannot be undone. Contact system administrator if changes are needed after submission.</span>
                </li>
              </ul>
            </div>

            {/* Confirmation Text */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                By clicking <strong>"Confirm & Submit"</strong> below, you acknowledge that you have:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                <li>Verified all candidate information is accurate</li>
                <li>Completed all required documentation</li>
                <li>Understand that records will be locked permanently</li>
                <li>Accept responsibility for this submission</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowConfirmDialog(false);
                setSingleRecordId(null);
              }}
              disabled={bulkOnboardingMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSubmit}
              disabled={bulkOnboardingMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkOnboardingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm & Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
