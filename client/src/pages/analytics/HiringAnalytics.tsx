import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { api } from "@/lib/api";

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
  const [selectedCityRows, setSelectedCityRows] = useState<{[cityId: string]: string[]}>({});
  const [isCityEmailDialogOpen, setIsCityEmailDialogOpen] = useState(false);
  const [selectedCityForEmail, setSelectedCityForEmail] = useState<string>("");
  
  const { toast } = useToast();

  // Fetch hiring requests - use hiring API instead of analytics
  const { data: hiringRequestsResponse, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/hiring"],
    queryFn: () => api.hiring.getRequests(),
  });

  // Fetch vendors - handle empty response gracefully
  const { data: vendorsResponse, isLoading: loadingVendors } = useQuery({
    queryKey: ["/api/master-data/vendor"],
    queryFn: () => api.masterData.getVendors(),
    retry: false,
  });

  // Fetch cities for filtering
  const { data: citiesResponse } = useQuery({
    queryKey: ["/api/master-data/city"],
    queryFn: () => api.masterData.getCities(),
  });

  // Fetch roles for filtering
  const { data: rolesResponse } = useQuery({
    queryKey: ["/api/master-data/role"],
    queryFn: () => api.masterData.getRoles(),
  });

  // Extract data from API responses with safe fallbacks
  const hiringRequests = (hiringRequestsResponse as any)?.data || [];
  const vendors = (vendorsResponse as any)?.data || [];
  const cities = (citiesResponse as any)?.data || [];
  const roles = (rolesResponse as any)?.data || [];

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (data: {
      hiringRequestIds: number[];
      vendorId: string;
      cityId: string;
      customMessage?: string;
    }) => {
      const formData = new FormData();
      formData.append('hiringRequestIds', JSON.stringify(data.hiringRequestIds));
      formData.append('vendorId', data.vendorId);
      formData.append('cityId', data.cityId);
      if (data.customMessage) {
        formData.append('customMessage', data.customMessage);
      }
      // TODO: Implement proper email sending API call
      // const response = await api.hiring.sendEmail(data);
      // return response;
      return { success: true, message: "Email functionality not implemented yet" };
    },
    onSuccess: (data) => {
      toast({
        title: "Email Sent Successfully",
        description: data.message || "Email sent successfully",
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
  const filteredRequests = (hiringRequests as any[])?.filter((request: any) => {
    const cityId = request.city_id || request.cityId;
    const roleId = request.role_id || request.roleId;
    return (
      (cityFilter === "all" || (cityId && cityId.toString() === cityFilter)) &&
      (roleFilter === "all" || (roleId && roleId.toString() === roleFilter)) &&
      (statusFilter === "all" || request.status === statusFilter)
    );
  });

  // Group requests by city for detailed analytics
  const cityAnalytics = filteredRequests.reduce((acc: any, request: any) => {
    const cityKey = request.city_name || request.cityName;
    const roleKey = request.role_name || request.roleName;
    const clusterKey = request.cluster_name || request.clusterName;
    
    if (!acc[cityKey]) {
      acc[cityKey] = {
        cityId: request.city_id || request.cityId,
        cityName: request.city_name || request.cityName,
        roles: {},
        clusters: new Set(),
        totalOpenPositions: 0,
      };
    }
    
    if (!acc[cityKey].roles[roleKey]) {
      acc[cityKey].roles[roleKey] = {
        roleId: request.role_id || request.roleId,
        roleName: request.role_name || request.roleName,
        clusters: {},
        totalOpenPositions: 0,
      };
    }
    
    if (!acc[cityKey].roles[roleKey].clusters[clusterKey]) {
      acc[cityKey].roles[roleKey].clusters[clusterKey] = {
        clusterId: request.cluster_id || request.clusterId,
        clusterName: request.cluster_name || request.clusterName,
        openPositions: 0,
        totalRequests: 0,
      };
    }
    
    // Add cluster to city clusters set
    acc[cityKey].clusters.add(clusterKey);
    
    // Only count open positions (not closed)
    const numberOfPositions = request.number_of_positions || request.numberOfPositions;
    if (request.status !== 'closed') {
      acc[cityKey].roles[roleKey].clusters[clusterKey].openPositions += numberOfPositions;
      acc[cityKey].roles[roleKey].totalOpenPositions += numberOfPositions;
      acc[cityKey].totalOpenPositions += numberOfPositions;
    }
    
    acc[cityKey].roles[roleKey].clusters[clusterKey].totalRequests += 1;
    
    return acc;
  }, {});

  // Convert clusters set to array for each city
  Object.keys(cityAnalytics).forEach(cityKey => {
    cityAnalytics[cityKey].clustersArray = Array.from(cityAnalytics[cityKey].clusters).sort();
  });

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
      setSelectedRequests(filteredRequests.map((req: any) => req.id));
    }
  };

  const handleSelectCityRow = (cityId: string, roleId: string) => {
    setSelectedCityRows(prev => {
      const currentCitySelections = prev[cityId] || [];
      const isSelected = currentCitySelections.includes(roleId);
      
      if (isSelected) {
        // Remove from selection
        const newSelections = currentCitySelections.filter(id => id !== roleId);
        if (newSelections.length === 0) {
          const { [cityId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [cityId]: newSelections };
      } else {
        // Add to selection
        return { ...prev, [cityId]: [...currentCitySelections, roleId] };
      }
    });
  };

  const handleSelectAllCityRows = (cityId: string) => {
    const cityKey = Object.keys(cityAnalytics as any).find(key => (cityAnalytics as any)[key].cityId.toString() === cityId);
    const cityData = cityKey ? (cityAnalytics as any)[cityKey] : null;
    if (!cityData) return;
    
    const allRoleIds = Object.values(cityData.roles).map((role: any) => role.roleId.toString());
    const currentSelections = selectedCityRows[cityId] || [];
    
    if (currentSelections.length === allRoleIds.length) {
      // Deselect all
      const { [cityId]: _, ...rest } = selectedCityRows;
      setSelectedCityRows(rest);
    } else {
      // Select all
      setSelectedCityRows(prev => ({ ...prev, [cityId]: allRoleIds }));
    }
  };

  const openCityEmailDialog = (cityId: string) => {
    setSelectedCityForEmail(cityId);
    setIsCityEmailDialogOpen(true);
  };

  const getVendorsForCity = (cityId: string) => {
    return (vendors as any[]).filter((vendor: any) => 
      vendor.citySpocData && vendor.citySpocData[parseInt(cityId)]
    );
  };

  const getAvailableVendorsForCity = () => {
    if (!selectedCity) return (vendors as any[]);
    return (vendors as any[]).filter((vendor: any) => 
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
                          const city = (cities as any[]).find((c: any) => c.id === cityId);
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

      {/* City Email Dialog */}
      <Dialog open={isCityEmailDialogOpen} onOpenChange={setIsCityEmailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send to City Vendors</DialogTitle>
            <DialogDescription>
              Send selected hiring requirements to all available vendors for this city
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Selected City:</h4>
              <p className="text-blue-800">
                {selectedCityForEmail && (Object.values(cityAnalytics as any).find((city: any) => 
                  city.cityId.toString() === selectedCityForEmail
                ) as any)?.cityName}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Roles:</h4>
              <div className="space-y-1">
                {selectedCityForEmail && (selectedCityRows[selectedCityForEmail] || []).map((roleId: string) => {
                  const cityData = Object.values(cityAnalytics as any).find((city: any) => 
                    city.cityId.toString() === selectedCityForEmail
                  );
                  const roleData = cityData && Object.values((cityData as any).roles).find((role: any) => 
                    role.roleId.toString() === roleId
                  );
                  return (
                    <div key={roleId} className="flex justify-between">
                      <span>{(roleData as any)?.roleName}</span>
                      <span className="font-semibold">{(roleData as any)?.totalOpenPositions} positions</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Available Vendors:</h4>
              <div className="space-y-2">
                {selectedCityForEmail && getVendorsForCity(selectedCityForEmail).map((vendor: Vendor) => (
                  <div key={vendor.id} className="flex justify-between items-center">
                    <span className="font-medium">{vendor.name}</span>
                    <span className="text-sm text-green-700">
                      {vendor.citySpocData?.[parseInt(selectedCityForEmail)]?.name} 
                      ({vendor.citySpocData?.[parseInt(selectedCityForEmail)]?.email})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="city-message">Custom Message (Optional)</Label>
              <Textarea
                id="city-message"
                placeholder="Add any additional notes or instructions for vendors..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                // TODO: Implement city vendor email sending
                console.log('Send to city vendors:', {
                  cityId: selectedCityForEmail,
                  selectedRoles: selectedCityRows[selectedCityForEmail],
                  vendors: getVendorsForCity(selectedCityForEmail),
                  customMessage
                });
                setIsCityEmailDialogOpen(false);
                setSelectedCityForEmail("");
                setCustomMessage("");
              }}
              disabled={!selectedCityForEmail || (selectedCityRows[selectedCityForEmail] || []).length === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send to {selectedCityForEmail ? getVendorsForCity(selectedCityForEmail).length : 0} Vendors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {(roles as any[]).map((role: any) => (
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
            <CardTitle className="text-sm font-medium">Total Hiring Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRequests
                .filter((req: HiringRequest) => req.status === 'open')
                .reduce((sum: number, req: HiringRequest) => sum + req.numberOfPositions, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Positions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRequests
                .filter((req: HiringRequest) => req.status === 'closed')
                .reduce((sum: number, req: HiringRequest) => sum + req.numberOfPositions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City-wise Analytics Tables */}
      {Object.entries(cityAnalytics).map(([cityKey, cityData]: [string, any]) => (
        <Card key={cityKey} className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold bg-blue-600 text-white px-4 py-2 rounded text-center">
                  {cityData?.cityName || 'Unknown City'}
                </CardTitle>
                <CardDescription className="mt-2">
                  Role-wise open positions by cluster
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllCityRows(cityData?.cityId?.toString() || '')}
                >
                  {(selectedCityRows[cityData?.cityId?.toString() || ''] || []).length === Object.keys(cityData?.roles || {}).length && Object.keys(cityData?.roles || {}).length > 0
                    ? "Deselect All" 
                    : "Select All"}
                </Button>
                <Button
                  size="sm"
                  disabled={(selectedCityRows[cityData?.cityId?.toString() || ''] || []).length === 0}
                  onClick={() => openCityEmailDialog(cityData?.cityId?.toString() || '')}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send to Vendors ({(selectedCityRows[cityData?.cityId?.toString() || ''] || []).length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={(selectedCityRows[cityData?.cityId?.toString() || ''] || []).length === Object.keys(cityData?.roles || {}).length && Object.keys(cityData?.roles || {}).length > 0}
                        onCheckedChange={() => handleSelectAllCityRows(cityData?.cityId?.toString() || '')}
                      />
                    </TableHead>
                    <TableHead className="bg-yellow-100 font-semibold">Role</TableHead>
                    {cityData?.clustersArray?.map((cluster: string) => (
                      <TableHead key={cluster} className="text-center min-w-[100px]">
                        {cluster}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-semibold bg-orange-100">
                      Total Open Positions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(cityData?.roles || {}).map(([roleKey, roleData]: [string, any]) => (
                    <TableRow key={roleKey}>
                      <TableCell>
                        <Checkbox
                          checked={(selectedCityRows[cityData?.cityId?.toString() || ''] || []).includes(roleData.roleId.toString())}
                          onCheckedChange={() => handleSelectCityRow(cityData?.cityId?.toString() || '', roleData.roleId.toString())}
                        />
                      </TableCell>
                      <TableCell className="font-medium bg-yellow-50">
                        {roleData.roleName}
                      </TableCell>
                      {cityData?.clustersArray?.map((cluster: string) => (
                        <TableCell key={cluster} className="text-center">
                          {roleData.clusters[cluster]?.openPositions || 0}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold bg-orange-50">
                        {roleData.totalOpenPositions}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50 font-semibold">
                    <TableCell></TableCell>
                    <TableCell className="font-bold">Cluster-wise Total</TableCell>
                    {cityData?.clustersArray?.map((cluster: string) => (
                      <TableCell key={cluster} className="text-center font-bold">
                        {Object.values(cityData?.roles || {}).reduce((sum: number, role: any) => 
                          sum + (role.clusters[cluster]?.openPositions || 0), 0
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold bg-orange-100">
                      {cityData?.totalOpenPositions || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

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