
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest3, queryClient } from "@/lib/queryClient";

export default function EmployeeLifecycle() {
  const { toast } = useToast();

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: employeeActions, isLoading: loadingActions } = useQuery({
    queryKey: ["/api/employees/actions", { status: "pending" }],
  });

  const approveActionMutation = useMutation({
    mutationFn: async ({ actionId, status }: { actionId: number; status: string }) => {
      return await apiRequest3("PUT", `/api/employees/actions/${actionId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees/actions"] });
      toast({
        title: "Success",
        description: "Action updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update action",
        variant: "destructive",
      });
    },
  });

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
          <TabsTrigger value="actions">Action History</TabsTrigger>
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
                  ) : (employees as any[])?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No employee records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (employees as any[])?.map((employee: any) => (
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
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingActions ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (employeeActions as any[])?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No pending actions for approval
                      </TableCell>
                    </TableRow>
                  ) : (
                    (employeeActions as any[])?.map((action: any) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium">
                          Employee #{action.employeeId}
                        </TableCell>
                        <TableCell>
                          {action.actionType}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {action.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionStatusBadgeVariant(action.status)}>
                            {action.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveActionMutation.mutate({ actionId: action.id, status: "approved" })}
                              disabled={approveActionMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveActionMutation.mutate({ actionId: action.id, status: "rejected" })}
                              disabled={approveActionMutation.isPending}
                            >
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
