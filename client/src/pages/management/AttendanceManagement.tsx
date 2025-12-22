import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download, Upload, Bell, Mail, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function AttendanceManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCluster, setSelectedCluster] = useState("all");
  
  // Dialog states
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedLetterType, setSelectedLetterType] = useState("");

  // Fetch cities
  const { data: citiesResponse } = useQuery({
    queryKey: ['/api/master-data/city'],
  });
  const cities = (citiesResponse as any)?.data || [];

  // Fetch clusters
  const { data: clustersResponse } = useQuery({
    queryKey: ['/api/master-data/cluster'],
  });
  const clusters = (clustersResponse as any)?.data || [];

  // Fetch attendance records
  const { data: attendanceResponse, isLoading: loadingAttendance } = useQuery({
    queryKey: ['/api/attendance', selectedYear, selectedMonth, selectedDay, selectedCity, selectedCluster],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedDay && selectedDay !== 'all') params.append('day', selectedDay);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedCluster && selectedCluster !== 'all') params.append('cluster', selectedCluster);
      return apiRequest(`/api/attendance?${params.toString()}`);
    },
  });
  const attendanceRecords = (attendanceResponse as any)?.data || [];

  // Fetch absconding cases
  const { data: abscondingResponse, isLoading: loadingAbsconding } = useQuery({
    queryKey: ['/api/attendance/absconding', selectedYear, selectedMonth, selectedCity, selectedCluster],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedCluster && selectedCluster !== 'all') params.append('cluster', selectedCluster);
      return apiRequest(`/api/attendance/absconding?${params.toString()}`);
    },
  });
  const abscondingCases = (abscondingResponse as any)?.data || [];

  // Fetch working employees for download
  const { data: workingEmployeesData, isLoading: loadingEmployees, error: employeesError } = useQuery({
    queryKey: ['/api/attendance', 'working-employees'],
  });
  
  console.log('Working employees query:', { data: workingEmployeesData, loading: loadingEmployees, error: employeesError });
  
  // The default queryFn extracts response.data.data, so workingEmployeesData IS the array directly
  const workingEmployees = (workingEmployeesData as any[]) || [];

  // Bulk upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (records: any[]) => {
      return apiRequest('/api/attendance/bulk-upload', {
        method: 'POST',
        body: JSON.stringify({ records }),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Upload Complete",
        description: data.message || "Attendance records uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/absconding'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload attendance records",
        variant: "destructive",
      });
    },
  });

  // Notify manager mutation
  const notifyMutation = useMutation({
    mutationFn: async (caseId: number) => {
      return apiRequest(`/api/attendance/absconding/${caseId}/notify`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "Manager has been notified about the absconding case",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/absconding'] });
      setNotifyDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Notification Failed",
        description: error.message || "Failed to notify manager",
        variant: "destructive",
      });
    },
  });

  // Manager response mutation
  const managerResponseMutation = useMutation({
    mutationFn: async ({ caseId, aware, sendShowcause }: { caseId: number; aware: boolean; sendShowcause: boolean }) => {
      return apiRequest(`/api/attendance/absconding/${caseId}/manager-response`, {
        method: 'POST',
        body: JSON.stringify({ aware, sendShowcause }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Response Recorded",
        description: "Manager response has been recorded",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/absconding'] });
    },
  });

  // Send letter mutation
  const sendLetterMutation = useMutation({
    mutationFn: async ({ caseId, letterType }: { caseId: number; letterType: string }) => {
      return apiRequest(`/api/attendance/absconding/${caseId}/send-letter`, {
        method: 'POST',
        body: JSON.stringify({ letterType }),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Letter Sent",
        description: data.message || "Letter has been sent to the employee",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/absconding'] });
      setLetterDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Letter",
        description: error.message || "Failed to send letter",
        variant: "destructive",
      });
    },
  });

  // Download working employees list
  const downloadTemplate = () => {
    console.log('Working employees data:', workingEmployees);
    
    if (!Array.isArray(workingEmployees) || workingEmployees.length === 0) {
      toast({
        title: "No Data",
        description: "No working employees found to download",
        variant: "destructive",
      });
      return;
    }
    
    const headers = ['User ID', 'Name', 'City', 'Cluster'];
    const rows = workingEmployees.map((emp: any) => [
      emp.userId || emp.user_id || '', 
      emp.name || '', 
      emp.city || '', 
      emp.cluster || ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `active_employees_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const records = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          userId: values[0],
          name: values[1],
          date: values[2],
          status: values[3],
        };
      }).filter(r => r.userId && r.date && r.status);

      if (records.length > 0) {
        uploadMutation.mutate(records);
      } else {
        toast({
          title: "Invalid File",
          description: "No valid attendance records found in the file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'lop': return 'text-orange-600 bg-orange-50';
      case 'sl': case 'el': case 'cl': return 'text-blue-600 bg-blue-50';
      case 'ul': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  // Get absconding case status color
  const getCaseStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'manager_notified': return 'text-blue-600';
      case 'manager_aware': return 'text-green-600';
      case 'showcause_pending': return 'text-orange-600';
      case 'showcause_sent': return 'text-purple-600';
      case 'terminated': return 'text-red-600';
      case 'resolved': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance & Absconding Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Working Employees
              </Button>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Attendance
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload attendance CSV file"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {days.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city: any) => (
                  <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCluster} onValueChange={setSelectedCluster}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters</SelectItem>
                {clusters.map((cluster: any) => (
                  <SelectItem key={cluster.id} value={cluster.name}>{cluster.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="absconding">
            Absconding Management
            {abscondingCases.filter((c: any) => c.status !== 'resolved').length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {abscondingCases.filter((c: any) => c.status !== 'resolved').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardContent className="pt-6">
              {loadingAttendance ? (
                <div className="text-center py-8 text-slate-500">Loading attendance records...</div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No attendance records found for the selected filters</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.userId}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.city}</TableCell>
                          <TableCell>{record.cluster}</TableCell>
                          <TableCell>{record.attendanceDate ? format(new Date(record.attendanceDate), 'dd MMM yyyy') : '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(record.status)}`}>
                              {record.status?.toUpperCase()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Absconding Tab */}
        <TabsContent value="absconding">
          <Card>
            <CardContent className="pt-6">
              {loadingAbsconding ? (
                <div className="text-center py-8 text-slate-500">Loading absconding cases...</div>
              ) : abscondingCases.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No absconding cases found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {abscondingCases.map((caseItem: any) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">{caseItem.userId}</TableCell>
                          <TableCell>{caseItem.name}</TableCell>
                          <TableCell>{caseItem.city}</TableCell>
                          <TableCell>{caseItem.cluster}</TableCell>
                          <TableCell>{caseItem.managerName || '-'}</TableCell>
                          <TableCell>{caseItem.startDate ? format(new Date(caseItem.startDate), 'dd MMM yyyy') : '-'}</TableCell>
                          <TableCell>{caseItem.consecutiveDays}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${getCaseStatusColor(caseItem.status)}`}>
                              {caseItem.status?.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {caseItem.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCase(caseItem);
                                    setNotifyDialogOpen(true);
                                  }}
                                >
                                  <Bell className="h-4 w-4 mr-1" />
                                  Notify
                                </Button>
                              )}
                              {caseItem.status === 'manager_notified' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => managerResponseMutation.mutate({ caseId: caseItem.id, aware: true, sendShowcause: false })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Aware
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-orange-600"
                                    onClick={() => managerResponseMutation.mutate({ caseId: caseItem.id, aware: true, sendShowcause: true })}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Showcause
                                  </Button>
                                </div>
                              )}
                              {(caseItem.status === 'showcause_pending' || caseItem.status === 'manager_aware') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCase(caseItem);
                                    setLetterDialogOpen(true);
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  Send Letter
                                </Button>
                              )}
                              {caseItem.letterType && (
                                <span className="text-xs text-slate-500">
                                  {caseItem.letterType === 'show_cause' ? 'Show Cause Sent' : 'Terminated'}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notify Manager Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify Manager</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Send notification to manager about absconding case for:</p>
            <p className="font-semibold mt-2">{selectedCase?.name} ({selectedCase?.userId})</p>
            <p className="text-sm text-slate-500 mt-1">
              {selectedCase?.consecutiveDays} consecutive days of absence starting {selectedCase?.startDate ? format(new Date(selectedCase.startDate), 'dd MMM yyyy') : ''}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedCase && notifyMutation.mutate(selectedCase.id)}>
              <Bell className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Letter Dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Letter</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p>Select letter type to send to:</p>
            <p className="font-semibold">{selectedCase?.name} ({selectedCase?.email})</p>
            
            <Select value={selectedLetterType} onValueChange={setSelectedLetterType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Letter Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show_cause">Show Cause Notice</SelectItem>
                <SelectItem value="absconding_terminated">Absconding Terminated Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedCase && selectedLetterType && sendLetterMutation.mutate({ caseId: selectedCase.id, letterType: selectedLetterType })}
              disabled={!selectedLetterType}
            >
              <FileText className="h-4 w-4 mr-2" />
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
