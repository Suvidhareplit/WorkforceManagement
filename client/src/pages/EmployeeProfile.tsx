import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building,
  CreditCard,
  User,
  Users,
  Heart,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmployeeProfile() {
  const [, params] = useRoute("/employee/:employeeId");
  const employeeId = params?.employeeId;

  // Fetch all employees and find the specific one
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const employees = (employeesResponse as any) || [];
  const employee = employees.find(
    (emp: any) => (emp.employeeId || emp.employee_id) === employeeId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Employee Not Found</h1>
        <Link href="/home">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <Link href="/home">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
      </Link>

      {/* Header Card with Employee Basic Info */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                {(employee.name || "?").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
              <p className="text-xl text-purple-100 mb-4">
                {employee.role || "N/A"}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{employee.mobileNumber || employee.mobile_number || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{employee.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Emp # {employee.employeeId || employee.employee_id}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Badge className="bg-white/20 hover:bg-white/20 text-white border-white/30">
                  {employee.employmentType || employee.employment_type || "N/A"}
                </Badge>
                <Badge 
                  className={
                    (employee.workingStatus || employee.working_status) === 'active'
                      ? 'bg-green-500 hover:bg-green-500 text-white'
                      : 'bg-red-500 hover:bg-red-500 text-white'
                  }
                >
                  {employee.workingStatus || employee.working_status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Sections */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="job">Job</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Employee ID" value={employee.employeeId || employee.employee_id} />
                <InfoRow label="Date of Joining" value={formatDate(employee.dateOfJoining || employee.date_of_joining)} />
                <InfoRow label="Role" value={employee.role} />
                <InfoRow label="Department" value={employee.departmentName || employee.department_name} />
                <InfoRow label="Manager" value={employee.managerName || employee.manager_name} />
                <InfoRow label="Working Status" value={employee.workingStatus || employee.working_status} />
              </CardContent>
            </Card>

            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organization Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Legal Entity" value={employee.legalEntity || employee.legal_entity} />
                <InfoRow label="Business Unit" value={employee.businessUnitName || employee.business_unit_name} />
                <InfoRow label="Function" value={employee.functionName || employee.function_name} />
                <InfoRow label="Sub Department" value={employee.subDepartmentName || employee.sub_department_name} />
                <InfoRow label="City" value={employee.city} />
                <InfoRow label="Cluster" value={employee.cluster} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Gender" value={employee.gender} />
                <InfoRow label="Date of Birth" value={formatDate(employee.dateOfBirth || employee.date_of_birth)} />
                <InfoRow label="Blood Group" value={employee.bloodGroup || employee.blood_group} />
                <InfoRow label="Marital Status" value={employee.maritalStatus || employee.marital_status} />
                <InfoRow label="Nationality" value={employee.nationality} />
                <InfoRow label="Physically Handicapped" value={employee.physicallyHandicapped || employee.physically_handicapped} />
                <InfoRow label="International Worker" value={employee.internationalWorker || employee.international_worker} />
              </CardContent>
            </Card>

            {/* Contact & Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Contact & Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Mobile" value={employee.mobileNumber || employee.mobile_number} />
                <InfoRow label="Email" value={employee.email} />
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Present Address</p>
                  <p className="text-sm text-gray-900">{employee.presentAddress || employee.present_address || "N/A"}</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Permanent Address</p>
                  <p className="text-sm text-gray-900">{employee.permanentAddress || employee.permanent_address || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Tab */}
        <TabsContent value="job" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Employment Type" value={employee.employmentType || employee.employment_type} />
                <InfoRow label="Date of Joining" value={formatDate(employee.dateOfJoining || employee.date_of_joining)} />
                <InfoRow label="Group DOJ" value={formatDate(employee.groupDoj || employee.group_doj)} />
                <InfoRow label="Gross Salary" value={employee.grossSalary ? `₹${parseFloat(employee.grossSalary || employee.gross_salary).toLocaleString('en-IN')}` : 'N/A'} />
                <InfoRow label="Cost Centre" value={employee.costCentre || employee.cost_centre} />
                <InfoRow label="Resume Source" value={employee.resumeSource || employee.resume_source} />
              </CardContent>
            </Card>

            {/* Vendor/Recruiter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Source Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Vendor" value={employee.vendorName || employee.vendor_name} />
                <InfoRow label="Recruiter" value={employee.recruiterName || employee.recruiter_name} />
                <InfoRow label="Paygrade" value={employee.paygrade} />
                <InfoRow label="Payband" value={employee.payband} />
                <InfoRow label="Assets" value={employee.assets} />
                <InfoRow label="Documents" value={employee.documents} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Identity Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="PAN Number" value={employee.panNumber || employee.pan_number} />
                <InfoRow label="Name as per PAN" value={employee.nameAsPerPan || employee.name_as_per_pan} />
                <InfoRow label="Aadhar Number" value={employee.aadharNumber || employee.aadhar_number} />
                <InfoRow label="Name as per Aadhar" value={employee.nameAsPerAadhar || employee.name_as_per_aadhar} />
                <InfoRow label="UAN Number" value={employee.uanNumber || employee.uan_number} />
                <InfoRow label="ESIC IP Number" value={employee.esicIpNumber || employee.esic_ip_number} />
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Bank Name" value={employee.bankName || employee.bank_name} />
                <InfoRow label="Account Number" value={employee.accountNumber || employee.account_number} />
                <InfoRow label="IFSC Code" value={employee.ifscCode || employee.ifsc_code} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Contact Name" value={employee.emergencyContactName || employee.emergency_contact_name} />
              <InfoRow label="Contact Number" value={employee.emergencyContactNumber || employee.emergency_contact_number} />
              <InfoRow label="Relation" value={employee.emergencyContactRelation || employee.emergency_contact_relation} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Component for Info Rows
function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value || "N/A"}</span>
    </div>
  );
}
