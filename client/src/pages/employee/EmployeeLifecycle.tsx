import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Employee, EmployeeAction } from "@/types";
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, User, Settings } from "lucide-react";

export default function EmployeeLifecycle() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [actionType, setActionType] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [personalDetails, setPersonalDetails] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [employmentDetails, setEmploymentDetails] = useState("");
  const [govtIds, setGovtIds] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const { toast } = useToast();

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: pendingActions, isLoading: loadingActions } = useQuery({
    queryKey: ["/api/employees/actions", { status: "pending" }],
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Employee record created successfully",
      });
      setSelectedEmployee(null);
      resetForms();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee record",
        variant: "destructive",
      });
    },
  });

  const createActionMutation = useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: number; data: any }) => {
      return await apiRequest("POST", `/api/employees/${employeeId}/actions`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees/actions"] });
      toast({
        title: "Success",
        description: "Employee action created successfully",
      });
      setSelectedEmployee(null);
      setActionType("");
      setActionDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee action",
        variant: "destructive",
      });
    },
  });

  const approveActionMutation = useMutation({
    mutationFn: async ({ actionId, status }: { actionId: number; status: string }) => {
      return await apiRequest("PATCH", `/api/employees/actions/${actionId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees/actions"] });
      toast({
        title: "Success",
        description: "Action status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update action status",
        variant: "destructive",
      });
    },
  });

  const resetForms = () => {
    setPersonalDetails("");
    setContactDetails("");
    setEmploymentDetails("");
    setGovtIds("");
    setBankDetails("");
  };

  const handleCreateEmployee = () => {
    if (!selectedEmployee) return;

    const employeeData = {
      candidateId: selectedEmployee.candidateId,
      employeeId: `EMP${Date.now()}`, // Generate employee ID
      personalDetails,
      contactDetails,
      employmentDetails,
      govtIds,
      bankDetails,
      status: "active",
      joinDate: new Date().toISOString(),
    };

    createEmployeeMutation.mutate(employeeData);
  };

  const handleCreateAction = (employee: Employee) => {
    if (!actionType || !actionDescription) {
      toast({
        title: "Error",
        description: "Please provide action type and description",
        variant: "destructive",
      });
      return;
    }

    createActionMutation.mutate({
      employeeId: employee.id,
      data: {
        actionType,
        description: actionDescription,
      },
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'terminated':
        return 'destructive';
      case 'resigned':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getActionStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'pip':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'termination':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Employee Lifecycle Management</h2>
        <p className="text-slate-600 mt-1">Manage employee records, actions, and lifecycle events</p>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Employee Records</TabsTrigger>
          <TabsTrigger value="actions">Employee Actions</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEmployees ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : employees?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No employee records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees?.map((employee: Employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-mono">{employee.employeeId}</TableCell>
                        <TableCell className="font-medium">
                          {employee.candidate?.name || "N/A"}
                        </TableCell>
                        <TableCell>{employee.candidate?.role?.name || "N/A"}</TableCell>
                        <TableCell>
                          {employee.joinDate 
                            ? new Date(employee.joinDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(employee.status)}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setActionType("");
                                    setActionDescription("");
                                  }}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Actions
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Employee Actions - {employee.candidate?.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Employee Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><strong>ID:</strong> {employee.employeeId}</div>
                                        <div><strong>Name:</strong> {employee.candidate?.name}</div>
                                        <div><strong>Role:</strong> {employee.candidate?.role?.name}</div>
                                        <div><strong>Status:</strong> {employee.status}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Employment Info</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><strong>Join Date:</strong> {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "N/A"}</div>
                                        <div><strong>Location:</strong> {employee.candidate?.city?.name}, {employee.candidate?.cluster?.name}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Action Type</Label>
                                    <Select value={actionType} onValueChange={setActionType}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select action type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="PIP">Performance Improvement Plan (PIP)</SelectItem>
                                        <SelectItem value="Warning">Warning Notice</SelectItem>
                                        <SelectItem value="Termination">Termination Request</SelectItem>
                                        <SelectItem value="Transfer">Transfer Request</SelectItem>
                                        <SelectItem value="Promotion">Promotion</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="description">Action Description</Label>
                                    <Textarea
                                      id="description"
                                      placeholder="Detailed description of the action and reasoning..."
                                      value={actionDescription}
                                      onChange={(e) => setActionDescription(e.target.value)}
                                      rows={4}
                                    />
                                  </div>

                                  <div className="bg-amber-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-amber-900 mb-2">Approval Workflow</h4>
                                    <p className="text-sm text-amber-800">
                                      This action will be submitted for approval and will require manager/HR approval before being implemented.
                                    </p>
                                  </div>

                                  <div className="flex justify-end">
                                    <Button
                                      onClick={() => handleCreateAction(employee)}
                                      disabled={!actionType || !actionDescription || createActionMutation.isPending}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      {createActionMutation.isPending ? "Submitting..." : "Submit Action"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Employee Action History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">View and track all employee actions and their status.</p>
              {/* This would typically show a comprehensive list of all actions */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Action Approvals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingActions ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : pendingActions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No pending actions for approval
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingActions?.map((action: EmployeeAction) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium">
                          {/* This would need to be populated with employee name via relation */}
                          Employee #{action.employeeId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getActionTypeIcon(action.actionType)}
                            <span>{action.actionType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {action.description}
                        </TableCell>
                        <TableCell>
                          User #{action.requestedBy}
                        </TableCell>
                        <TableCell>
                          {new Date(action.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveActionMutation.mutate({ actionId: action.id, status: "approved" })}
                              disabled={approveActionMutation.isPending}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveActionMutation.mutate({ actionId: action.id, status: "rejected" })}
                              disabled={approveActionMutation.isPending}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
