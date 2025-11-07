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

  // Download CSV template
  const downloadTemplate = () => {
    const headers = [
      "Name", "Mobile Number", "Email", "Gender", "Date of Birth (YYYY-MM-DD)",
      "Blood Group", "Marital Status", "PAN Number", "Name as Per PAN",
      "Account Number", "IFSC Code", "Name as per Bank", "Aadhar Number",
      "Name as per Aadhar", "Present Address", "Permanent Address",
      "Emergency Contact Number", "Emergency Contact Name", "Relation with Emergency Contact"
    ];

    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `onboarding_template_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Template downloaded successfully",
    });
  };

  // Handle CSV file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const jsonData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });

      // Transform data to match backend format
      const records = jsonData.map((row: any) => ({
        name: row['Name'],
        mobile_number: row['Mobile Number']?.toString(),
        email: row['Email'],
        gender: row['Gender']?.toLowerCase(),
        date_of_birth: row['Date of Birth (YYYY-MM-DD)'],
        blood_group: row['Blood Group'],
        marital_status: row['Marital Status']?.toLowerCase(),
        pan_number: row['PAN Number'],
        name_as_per_pan: row['Name as Per PAN'],
        account_number: row['Account Number']?.toString(),
        ifsc_code: row['IFSC Code'],
        name_as_per_bank: row['Name as per Bank'],
        aadhar_number: row['Aadhar Number']?.toString(),
        name_as_per_aadhar: row['Name as per Aadhar'],
        present_address: row['Present Address'],
        permanent_address: row['Permanent Address'],
        emergency_contact_number: row['Emergency Contact Number']?.toString(),
        emergency_contact_name: row['Emergency Contact Name'],
        emergency_contact_relation: row['Relation with Emergency Contact']
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">City</TableHead>
                  <TableHead className="font-semibold">Cluster</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Manager</TableHead>
                  <TableHead className="font-semibold">DOJ</TableHead>
                  <TableHead className="font-semibold">Gross Salary</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">DOB</TableHead>
                  <TableHead className="font-semibold">Blood Group</TableHead>
                  <TableHead className="font-semibold">Marital Status</TableHead>
                  <TableHead className="font-semibold">PAN Number</TableHead>
                  <TableHead className="font-semibold">Account Number</TableHead>
                  <TableHead className="font-semibold">Aadhar Number</TableHead>
                  <TableHead className="font-semibold">Emergency Contact</TableHead>
                  <TableHead className="font-semibold">Onboarded</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : onboardingRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-8">
                      No onboarding records found
                    </TableCell>
                  </TableRow>
                ) : (
                  onboardingRecords.map((record: any) => (
                    <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{record.name}</TableCell>
                      <TableCell>{record.mobileNumber || record.mobile_number || '-'}</TableCell>
                      <TableCell>{record.email || '-'}</TableCell>
                      <TableCell>{record.city || '-'}</TableCell>
                      <TableCell>{record.cluster || '-'}</TableCell>
                      <TableCell>{record.role || '-'}</TableCell>
                      <TableCell>{record.managerName || record.manager_name || '-'}</TableCell>
                      <TableCell>
                        {(record.dateOfJoining || record.date_of_joining)
                          ? format(new Date(record.dateOfJoining || record.date_of_joining), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {record.grossSalary || record.gross_salary
                          ? Number(record.grossSalary || record.gross_salary).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>{record.gender || '-'}</TableCell>
                      <TableCell>
                        {(record.dateOfBirth || record.date_of_birth)
                          ? format(new Date(record.dateOfBirth || record.date_of_birth), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>{record.bloodGroup || record.blood_group || '-'}</TableCell>
                      <TableCell>{record.maritalStatus || record.marital_status || '-'}</TableCell>
                      <TableCell>{record.panNumber || record.pan_number || '-'}</TableCell>
                      <TableCell>{record.accountNumber || record.account_number || '-'}</TableCell>
                      <TableCell>{record.aadharNumber || record.aadhar_number || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(record.emergencyContactName || record.emergency_contact_name) && (
                            <div>{record.emergencyContactName || record.emergency_contact_name}</div>
                          )}
                          {(record.emergencyContactNumber || record.emergency_contact_number) && (
                            <div className="text-slate-600">
                              {record.emergencyContactNumber || record.emergency_contact_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={(record.onboardingStatus || record.onboarding_status) === 'onboarded'}
                          onCheckedChange={(checked) => handleStatusChange(record.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
