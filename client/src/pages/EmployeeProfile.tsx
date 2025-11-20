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
  MoreVertical,
  FileEdit,
  LogOut,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeProfile() {
  const [, params] = useRoute("/employee/:employeeId");
  const employeeId = params?.employeeId;
  const { toast } = useToast();

  // Fetch all employees and find the specific one
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const employees = (employeesResponse as any) || [];
  const employee = employees.find(
    (emp: any) => (emp.employeeId || emp.employee_id) === employeeId
  );

  // Action handlers
  const handleWriteNote = () => {
    toast({
      title: "Write Internal Note",
      description: "Internal note feature coming soon...",
    });
  };

  const handleInitiateExit = () => {
    toast({
      title: "Initiate Exit",
      description: "Employee exit process feature coming soon...",
    });
  };

  const handleAddToPIP = () => {
    toast({
      title: "Add Employee to PIP",
      description: "Performance Improvement Plan feature coming soon...",
    });
  };

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
        <CardContent className="p-8 relative">
          {/* Action Menu - Top Right */}
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleWriteNote} className="cursor-pointer">
                  <FileEdit className="h-4 w-4 mr-3 text-gray-600" />
                  <span>Write Internal Note</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleInitiateExit} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-3 text-gray-600" />
                  <span>Initiate Exit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddToPIP} className="cursor-pointer">
                  <Flag className="h-4 w-4 mr-3 text-gray-600" />
                  <span>Add Employee to PIP</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
              
              <div className="flex flex-wrap gap-4 text-sm mb-4">
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

              {/* Additional Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-4">
                <div>
                  <p className="text-xs text-purple-200 uppercase mb-1">Business Unit</p>
                  <p className="text-sm font-medium">{employee.businessUnitName || employee.business_unit_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-200 uppercase mb-1">Department</p>
                  <p className="text-sm font-medium">{employee.departmentName || employee.department_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-200 uppercase mb-1">Cost Centre</p>
                  <p className="text-sm font-medium">{employee.costCentre || employee.cost_centre || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-200 uppercase mb-1">Reporting Manager</p>
                  <p className="text-sm font-medium">{employee.managerName || employee.manager_name || "N/A"}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Job Details */}
            <div className="space-y-6">
              {/* Job Details Card */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Employee Number</p>
                      <p className="text-sm font-medium text-gray-900">{employee.employeeId || employee.employee_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Date of Joining</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(employee.dateOfJoining || employee.date_of_joining)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 uppercase mb-1">Job Title - Primary</p>
                      <p className="text-sm font-medium text-gray-900">{employee.role || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 uppercase mb-1">Job Title - Secondary</p>
                      <p className="text-sm font-medium text-gray-900">-Not Set-</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">In Probation?</p>
                      <p className="text-sm font-medium text-gray-900">No</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Notice Period</p>
                      <p className="text-sm font-medium text-gray-900">Permanent employees Notice Period (1 Months)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Worker Type</p>
                      <p className="text-sm font-medium text-gray-900">{employee.employmentType || employee.employment_type || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Time Type</p>
                      <p className="text-sm font-medium text-gray-900">Full Time</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Contract Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          Not Applicable
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Pay Grade</p>
                      <p className="text-sm font-medium text-gray-900">{employee.paygrade || "-Not Set-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Pay Band</p>
                      <p className="text-sm font-medium text-gray-900">{employee.payband || "-Not Set-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Time Card */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">Employee Time</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                      Managing shift-based pay? <span className="text-blue-600 font-medium cursor-pointer hover:underline">Learn</span> how to set up and manage shift allowance policies.
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Shift</p>
                        <p className="text-sm font-medium text-gray-900">Rotational Shift - Yuzen</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Weekly Off Policy</p>
                        <p className="text-sm font-medium text-gray-900">Scheduled Weekly Off</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Leave Plan</p>
                        <p className="text-sm font-medium text-gray-900">Yuzen Leave Plan Without Leave Types</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Holiday Calendar</p>
                        <p className="text-sm font-medium text-gray-900">Bangalore Holiday List</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Attendance Number</p>
                        <p className="text-sm font-medium text-gray-900">{employee.employeeId || employee.employee_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Payroll Time Source</p>
                        <p className="text-sm font-medium text-gray-900">Attendance</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Organization */}
            <div>
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">Organization</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Business Unit</p>
                    <p className="text-sm font-medium text-gray-900">{employee.businessUnitName || employee.business_unit_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Department</p>
                    <p className="text-sm font-medium text-gray-900">{employee.departmentName || employee.department_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">{employee.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Cost Center</p>
                    <p className="text-sm font-medium text-gray-900">{employee.costCentre || employee.cost_centre || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Legal Entity</p>
                    <p className="text-sm font-medium text-gray-900">{employee.legalEntity || employee.legal_entity || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Dotted Line Manager</p>
                    <p className="text-sm font-medium text-gray-900">-Not Set-</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Reports To</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {(employee.managerName || employee.manager_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{employee.managerName || employee.manager_name || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Manager of Manager (L2 Manager)</p>
                    <p className="text-sm font-medium text-gray-900">-Not Set-</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Direct Reports</p>
                    <p className="text-sm font-medium text-gray-900">0 Employees</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
