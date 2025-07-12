import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Employee, ExitRecord } from "@/types";
import { CalendarIcon, LogOut, FileText, DollarSign, CheckCircle, AlertTriangle, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ExitManagement() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [exitType, setExitType] = useState("");
  const [exitDate, setExitDate] = useState<Date>();
  const [exitReason, setExitReason] = useState("");
  const [exitInterview, setExitInterview] = useState("");
  const [finalSettlement, setFinalSettlement] = useState("");
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const { toast } = useToast();

  const { data: activeEmployees, isLoading: loadingEmployees } = useQuery({
    queryKey: ["/api/employees", { status: "active" }],
  });

  const { data: exitRecords, isLoading: loadingExits } = useQuery({
    queryKey: ["/api/exit-records"],
  });

  const createExitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/exit-records", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exit-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Exit record created successfully",
      });
      setSelectedEmployee(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create exit record",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setExitType("");
    setExitDate(undefined);
    setExitReason("");
    setExitInterview("");
    setFinalSettlement("");
    setHandoverCompleted(false);
  };

  const handleCreateExit = (employee: Employee) => {
    if (!exitType || !exitDate || !exitReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const exitData = {
      employeeId: employee.id,
      exitType,
      exitDate: exitDate.toISOString(),
      reason: exitReason,
      exitInterview,
      finalSettlement: finalSettlement ? parseFloat(finalSettlement) : undefined,
      handoverCompleted,
    };

    createExitMutation.mutate(exitData);
  };

  const getExitTypeBadgeVariant = (exitType: string) => {
    switch (exitType) {
      case 'voluntary':
        return 'default';
      case 'termination':
        return 'destructive';
      case 'absconding':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getExitTypeIcon = (exitType: string) => {
    switch (exitType) {
      case 'voluntary':
        return <LogOut className="h-4 w-4" />;
      case 'termination':
        return <AlertTriangle className="h-4 w-4" />;
      case 'absconding':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Mock analytics data - in real app this would come from API
  const exitAnalytics = {
    totalExits: exitRecords?.length || 0,
    voluntaryExits: exitRecords?.filter((exit: ExitRecord) => exit.exitType === 'voluntary').length || 0,
    terminations: exitRecords?.filter((exit: ExitRecord) => exit.exitType === 'termination').length || 0,
    absconding: exitRecords?.filter((exit: ExitRecord) => exit.exitType === 'absconding').length || 0,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Exit & Attrition Management</h2>
        <p className="text-slate-600 mt-1">Manage employee exits, conduct exit interviews, and track attrition analytics</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Employees</TabsTrigger>
          <TabsTrigger value="exits">Exit Records</TabsTrigger>
          <TabsTrigger value="analytics">Exit Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Employees - Exit Processing</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Tenure</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEmployees ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : activeEmployees?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No active employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeEmployees?.map((employee: Employee) => {
                      const tenure = employee.joinDate 
                        ? Math.floor((new Date().getTime() - new Date(employee.joinDate).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono">{employee.employeeId}</TableCell>
                          <TableCell className="font-medium">
                            {employee.candidate?.name || "N/A"}
                          </TableCell>
                          <TableCell>{employee.candidate?.role?.name || "N/A"}</TableCell>
                          <TableCell>{employee.candidate?.cluster?.name || "N/A"}</TableCell>
                          <TableCell>
                            {employee.joinDate 
                              ? new Date(employee.joinDate).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>{tenure} days</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    resetForm();
                                  }}
                                >
                                  <LogOut className="h-4 w-4 mr-2" />
                                  Process Exit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Process Employee Exit - {employee.candidate?.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Employee Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><strong>ID:</strong> {employee.employeeId}</div>
                                        <div><strong>Name:</strong> {employee.candidate?.name}</div>
                                        <div><strong>Role:</strong> {employee.candidate?.role?.name}</div>
                                        <div><strong>Location:</strong> {employee.candidate?.city?.name}, {employee.candidate?.cluster?.name}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Employment Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><strong>Join Date:</strong> {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "N/A"}</div>
                                        <div><strong>Tenure:</strong> {tenure} days</div>
                                        <div><strong>Status:</strong> {employee.status}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Exit Type</Label>
                                      <Select value={exitType} onValueChange={setExitType}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select exit type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="voluntary">Voluntary Resignation</SelectItem>
                                          <SelectItem value="termination">Termination</SelectItem>
                                          <SelectItem value="absconding">Absconding</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label>Exit Date</Label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !exitDate && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {exitDate ? format(exitDate, "PPP") : "Pick a date"}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <Calendar
                                            mode="single"
                                            selected={exitDate}
                                            onSelect={setExitDate}
                                            disabled={(date) =>
                                              date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="reason">Exit Reason</Label>
                                    <Textarea
                                      id="reason"
                                      placeholder="Detailed reason for exit..."
                                      value={exitReason}
                                      onChange={(e) => setExitReason(e.target.value)}
                                      rows={3}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="interview">Exit Interview Notes</Label>
                                    <Textarea
                                      id="interview"
                                      placeholder="Exit interview feedback and insights..."
                                      value={exitInterview}
                                      onChange={(e) => setExitInterview(e.target.value)}
                                      rows={4}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="settlement">Final Settlement Amount</Label>
                                    <Input
                                      id="settlement"
                                      type="number"
                                      placeholder="Enter settlement amount"
                                      value={finalSettlement}
                                      onChange={(e) => setFinalSettlement(e.target.value)}
                                    />
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="handover"
                                      checked={handoverCompleted}
                                      onCheckedChange={(checked) => setHandoverCompleted(checked as boolean)}
                                    />
                                    <Label htmlFor="handover">Handover completed</Label>
                                  </div>

                                  <div className="bg-amber-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-amber-900 mb-2">Exit Process</h4>
                                    <p className="text-sm text-amber-800">
                                      Processing this exit will update the employee status, send exit notifications, 
                                      and initiate the final settlement process.
                                    </p>
                                  </div>

                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedEmployee(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleCreateExit(employee)}
                                      disabled={!exitType || !exitDate || !exitReason || createExitMutation.isPending}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {createExitMutation.isPending ? "Processing..." : "Process Exit"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exits">
          <Card>
            <CardHeader>
              <CardTitle>Exit Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Exit Type</TableHead>
                    <TableHead>Exit Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Settlement</TableHead>
                    <TableHead>Handover</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingExits ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : exitRecords?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No exit records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    exitRecords?.map((exit: ExitRecord) => (
                      <TableRow key={exit.id}>
                        <TableCell className="font-medium">
                          {/* This would need employee relation */}
                          Employee #{exit.employeeId}
                        </TableCell>
                        <TableCell>Role Info</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getExitTypeIcon(exit.exitType)}
                            <Badge variant={getExitTypeBadgeVariant(exit.exitType)}>
                              {exit.exitType.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(exit.exitDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {exit.reason}
                        </TableCell>
                        <TableCell>
                          {exit.finalSettlement 
                            ? `₹${Number(exit.finalSettlement).toLocaleString()}`
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          {exit.handoverCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Exit Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Total Exits</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{exitAnalytics.totalExits}</p>
                      <p className="text-slate-500 text-sm mt-1">This month</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <TrendingDown className="text-slate-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Voluntary Exits</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{exitAnalytics.voluntaryExits}</p>
                      <p className="text-green-600 text-sm mt-1">
                        {exitAnalytics.totalExits > 0 
                          ? `${Math.round((exitAnalytics.voluntaryExits / exitAnalytics.totalExits) * 100)}%`
                          : "0%"} of total
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <LogOut className="text-blue-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Terminations</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{exitAnalytics.terminations}</p>
                      <p className="text-red-600 text-sm mt-1">
                        {exitAnalytics.totalExits > 0 
                          ? `${Math.round((exitAnalytics.terminations / exitAnalytics.totalExits) * 100)}%`
                          : "0%"} of total
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <AlertTriangle className="text-red-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Absconding</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{exitAnalytics.absconding}</p>
                      <p className="text-amber-600 text-sm mt-1">
                        {exitAnalytics.totalExits > 0 
                          ? `${Math.round((exitAnalytics.absconding / exitAnalytics.totalExits) * 100)}%`
                          : "0%"} of total
                      </p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <TrendingDown className="text-amber-600 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exit Trends Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Exit Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-slate-500">Exit trends chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Exit Reasons */}
            <Card>
              <CardHeader>
                <CardTitle>Common Exit Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Better opportunity</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                      <span className="text-sm text-slate-600">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Salary issues</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                      <span className="text-sm text-slate-600">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Work environment</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm text-slate-600">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Personal reasons</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                      <span className="text-sm text-slate-600">30%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
