import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Filter, Send, Users, Building, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface HiringRequest {
  id: number;
  requestId: string;
  cityId: number;
  cityName: string;
  clusterId: number;
  clusterName: string;
  roleId: number;
  roleName: string;
  numberOfPositions: number;
  priority: string;
  requestType: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Vendor {
  id: number;
  name: string;
  citySpocData?: {
    [cityId: number]: {
      name: string;
      email: string;
      phone: string;
      cityId: number;
      cityName: string;
    };
  };
}

export default function HiringAnalytics() {
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch hiring requests
  const { data: hiringRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/analytics/hiring"],
  });

  // Fetch vendors
  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ["/api/master-data/vendor"],
  });

  // Fetch cities for filtering
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  // Fetch roles for filtering
  const { data: roles = [] } = useQuery({
    queryKey: ["/api/master-data/role"],
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: {
      hiringRequestIds: number[];
      vendorId: string;
      cityId: string;
      customMessage?: string;
    }) => apiRequest("/api/analytics/send-email", "POST", data),
    onSuccess: (data) => {
      toast({
        title: "Email Sent Successfully",
        description: `Email sent to ${data.recipientName} (${data.recipientEmail}) for ${data.requestCount} hiring request(s)`,
      });
      setIsEmailDialogOpen(false);
      setSelectedRequests([]);
      setSelectedVendor("");
      setSelectedCity("");
      setCustomMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    },
  });

  // Filter hiring requests
  const filteredRequests = hiringRequests.filter((request: HiringRequest) => {
    return (
      (cityFilter === "all" || request.cityId.toString() === cityFilter) &&
      (roleFilter === "all" || request.roleId.toString() === roleFilter) &&
      (statusFilter === "all" || request.status === statusFilter)
    );
  });

  // Group requests by city for analytics summary
  const analyticsData = filteredRequests.reduce((acc: any, request: HiringRequest) => {
    const key = `${request.cityName}-${request.clusterName}-${request.roleName}`;
    if (!acc[key]) {
      acc[key] = {
        city: request.cityName,
        cluster: request.clusterName,
        role: request.roleName,
        totalPositions: 0,
        requestCount: 0,
        priorities: { high: 0, medium: 0, low: 0 },
        statuses: { open: 0, in_progress: 0, closed: 0 },
        cityId: request.cityId,
        roleId: request.roleId,
        clusterId: request.clusterId,
      };
    }
    acc[key].totalPositions += request.numberOfPositions;
    acc[key].requestCount += 1;
    if (request.priority in acc[key].priorities) {
      acc[key].priorities[request.priority as 'high' | 'medium' | 'low']++;
    }
    if (request.status in acc[key].statuses) {
      acc[key].statuses[request.status as 'open' | 'in_progress' | 'closed']++;
    }
    return acc;
  }, {});

  const handleSelectRequest = (requestId: number) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map((req: HiringRequest) => req.id));
    }
  };

  const getAvailableVendorsForCity = () => {
    if (!selectedCity) return vendors;
    return vendors.filter((vendor: Vendor) => 
      vendor.citySpocData && vendor.citySpocData[parseInt(selectedCity)]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingRequests || loadingVendors) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading hiring analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring Analytics</h1>
          <p className="text-muted-foreground">
            Analyze hiring requests by city, role, and cluster with vendor email functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={selectedRequests.length === 0}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Email ({selectedRequests.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Hiring Request Email</DialogTitle>
                <DialogDescription>
                  Send selected hiring requests to vendor city recruitment SPOCs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="city">Select City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose city" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(filteredRequests
                        .filter((req: HiringRequest) => selectedRequests.includes(req.id))
                        .map((req: HiringRequest) => req.cityId)))
                        .map(cityId => {
                          const city = cities.find((c: any) => c.id === cityId);
                          return city ? (
                            <SelectItem key={cityId} value={cityId.toString()}>
                              {city.name}
                            </SelectItem>
                          ) : null;
                        })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="vendor">Select Vendor</Label>
                  <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVendorsForCity().map((vendor: Vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                          {selectedCity && vendor.citySpocData?.[parseInt(selectedCity)] && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({vendor.citySpocData[parseInt(selectedCity)].name})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Custom Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add any additional notes or instructions..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (selectedVendor && selectedCity && selectedRequests.length > 0) {
                      sendEmailMutation.mutate({
                        hiringRequestIds: selectedRequests,
                        vendorId: selectedVendor,
                        cityId: selectedCity,
                        customMessage: customMessage || undefined,
                      });
                    }
                  }}
                  disabled={!selectedVendor || !selectedCity || sendEmailMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>City</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRequests.reduce((sum: number, req: HiringRequest) => sum + req.numberOfPositions, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Involved</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredRequests.map((req: HiringRequest) => req.cityId)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>City-Role-Cluster Analytics</CardTitle>
          <CardDescription>
            Grouped view of hiring requests with aggregated metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Total Positions</TableHead>
                <TableHead>Priority Breakdown</TableHead>
                <TableHead>Status Breakdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(analyticsData).map((item: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.city}</TableCell>
                  <TableCell>{item.cluster}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{item.requestCount}</TableCell>
                  <TableCell>{item.totalPositions}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.priorities.high > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                          H: {item.priorities.high}
                        </Badge>
                      )}
                      {item.priorities.medium > 0 && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                          M: {item.priorities.medium}
                        </Badge>
                      )}
                      {item.priorities.low > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          L: {item.priorities.low}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.statuses.open > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Open: {item.statuses.open}
                        </Badge>
                      )}
                      {item.statuses.in_progress > 0 && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                          Progress: {item.statuses.in_progress}
                        </Badge>
                      )}
                      {item.statuses.closed > 0 && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                          Closed: {item.statuses.closed}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Hiring Requests</CardTitle>
              <CardDescription>
                Detailed view with selection for email functionality
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedRequests.length === filteredRequests.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request: HiringRequest) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRequests.includes(request.id)}
                      onCheckedChange={() => handleSelectRequest(request.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{request.requestId}</TableCell>
                  <TableCell>{request.cityName}</TableCell>
                  <TableCell>{request.clusterName}</TableCell>
                  <TableCell>{request.roleName}</TableCell>
                  <TableCell>{request.numberOfPositions}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}