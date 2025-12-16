import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Plus, Filter, Search, Download, ChevronLeft, ChevronRight, Edit } from "lucide-react";

export default function ViewHiringRequests() {
  const [filters, setFilters] = useState({
    cityId: "all",
    clusterId: "all",
    designationId: "all",
    status: "all",
    priority: "all",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { toast } = useToast();
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [editDesignationId, setEditDesignationId] = useState<string>("");
  const [editClusterId, setEditClusterId] = useState<string>("");
  const [editPriority, setEditPriority] = useState<string>("");

  // Fetch all designations for edit dropdown
  const { data: allDesignations = [] } = useQuery({
    queryKey: ["/api/designations"],
  });

  const { data: requestsResponse, isLoading } = useQuery({
    queryKey: ["/api/hiring"],
    queryFn: () => api.hiring.getRequests(),
    retry: 1,
  });

  const allRequests = (requestsResponse as any)?.data || [];

  // Apply filters
  const filteredRequests = allRequests.filter((request: any) => {
    const matchesCity = filters.cityId === "all" || request.cityId?.toString() === filters.cityId || request.city_id?.toString() === filters.cityId;
    const matchesCluster = filters.clusterId === "all" || request.clusterId?.toString() === filters.clusterId || request.cluster_id?.toString() === filters.clusterId;
    const matchesDesignation = filters.designationId === "all" || request.designationId?.toString() === filters.designationId || request.designation_id?.toString() === filters.designationId;
    const matchesStatus = filters.status === "all" || request.status === filters.status;
    const matchesPriority = filters.priority === "all" || request.priority === filters.priority;
    const matchesSearch = filters.search === "" || 
      (request.request_id || request.requestId || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.designation_name || request.designationName || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.city_name || request.cityName || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.cluster_name || request.clusterName || "").toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesCity && matchesCluster && matchesDesignation && matchesStatus && matchesPriority && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Extract unique cities, clusters, and designations from hiring requests data
  // This avoids separate API calls for filter dropdowns
  const cities = useMemo(() => {
    const uniqueCities = new Map();
    allRequests.forEach((req: any) => {
      const cityId = req.city_id || req.cityId;
      const cityName = req.city_name || req.cityName;
      if (cityId && cityName && !uniqueCities.has(cityId)) {
        uniqueCities.set(cityId, { id: cityId, name: cityName });
      }
    });
    return Array.from(uniqueCities.values());
  }, [allRequests]);

  const allClusters = useMemo(() => {
    const uniqueClusters = new Map();
    allRequests.forEach((req: any) => {
      const clusterId = req.cluster_id || req.clusterId;
      const clusterName = req.cluster_name || req.clusterName;
      const cityId = req.city_id || req.cityId;
      if (clusterId && clusterName && !uniqueClusters.has(clusterId)) {
        uniqueClusters.set(clusterId, { id: clusterId, name: clusterName, cityId });
      }
    });
    return Array.from(uniqueClusters.values());
  }, [allRequests]);

  const designations = useMemo(() => {
    const uniqueDesignations = new Map();
    allRequests.forEach((req: any) => {
      const designationId = req.designation_id || req.designationId;
      const designationName = req.designation_name || req.designationName;
      if (designationId && designationName && !uniqueDesignations.has(designationId)) {
        uniqueDesignations.set(designationId, { id: designationId, name: designationName });
      }
    });
    return Array.from(uniqueDesignations.values());
  }, [allRequests]);
  
  // Filter clusters by selected city
  const clusters = filters.cityId === "all" 
    ? allClusters 
    : allClusters.filter((cluster: any) => 
        cluster.cityId?.toString() === filters.cityId
      );

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await api.hiring.updateRequestStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hiring"] });
      toast({
        title: "Success",
        description: "Request status updated successfully",
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

  // Edit hiring request mutation
  const editRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/hiring/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hiring"] });
      toast({
        title: "Success",
        description: "Hiring request updated successfully",
      });
      setEditDialogOpen(false);
      setEditingRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hiring request",
        variant: "destructive",
      });
    },
  });

  // Open edit dialog
  const handleEditClick = (request: any) => {
    setEditingRequest(request);
    setEditDesignationId((request.designation_id || request.designationId)?.toString() || "");
    setEditClusterId((request.cluster_id || request.clusterId)?.toString() || "");
    setEditPriority(request.priority || "P2");
    setEditDialogOpen(true);
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editingRequest || !editDesignationId || !editClusterId) return;
    
    editRequestMutation.mutate({
      id: editingRequest.id,
      data: {
        designation_id: parseInt(editDesignationId),
        cluster_id: parseInt(editClusterId),
        priority: editPriority,
      },
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'called_off':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0':
        return 'text-red-600';
      case 'P1':
        return 'text-orange-600';
      case 'P2':
        return 'text-yellow-600';
      case 'P3':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Hiring Requests</h2>
            <p className="text-slate-600 mt-1">Manage and track all hiring requests</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/hiring/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Create Request
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.cityId}
              onValueChange={(value) => handleFilterChange({ ...filters, cityId: value, clusterId: "all" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {Array.isArray(cities) && cities.filter((city: any) => city.id && city.id.toString() && city.name).map((city: any) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.clusterId}
              onValueChange={(value) => handleFilterChange({ ...filters, clusterId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Clusters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters</SelectItem>
                {Array.isArray(clusters) && clusters.filter((cluster: any) => cluster.id && cluster.id.toString() && cluster.name).map((cluster: any) => (
                  <SelectItem key={cluster.id} value={cluster.id.toString()}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.designationId}
              onValueChange={(value) => handleFilterChange({ ...filters, designationId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Designations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {Array.isArray(designations) && designations.filter((d: any) => d.id && d.id.toString() && d.name).map((d: any) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="called_off">Called Off</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange({ ...filters, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="P0">P0 - Critical</SelectItem>
                <SelectItem value="P1">P1 - High</SelectItem>
                <SelectItem value="P2">P2 - Medium</SelectItem>
                <SelectItem value="P3">P3 - Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No hiring requests found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">
                      {request.request_id || request.requestId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.designation_name || request.designationName || 'Unknown Designation'}
                    </TableCell>
                    <TableCell>
                      {request.city_name || request.cityName || 'Unknown City'}
                    </TableCell>
                    <TableCell>
                      {request.cluster_name || request.clusterName || 'Unknown Cluster'}
                    </TableCell>
                    <TableCell>{request.no_of_openings || request.numberOfPositions}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">
                      {(request.request_type || request.requestType || '').replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {(request.status || '').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at || request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(request)}
                          title="Edit Request"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Select
                          value={request.status}
                          onValueChange={(status) =>
                            updateStatusMutation.mutate({ id: request.id, status })
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="called_off">Called Off</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination Controls */}
        {filteredRequests.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return page === 1 || 
                           page === totalPages || 
                           (page >= currentPage - 1 && page <= currentPage + 1);
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Hiring Request Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hiring Request</DialogTitle>
          </DialogHeader>
          
          {editingRequest && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-slate-600 mb-4">
                <span className="font-medium">Request ID:</span> {editingRequest.request_id || editingRequest.requestId}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-designation">Designation</Label>
                <Select value={editDesignationId} onValueChange={setEditDesignationId}>
                  <SelectTrigger id="edit-designation">
                    <SelectValue placeholder="Select Designation" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="max-h-[200px] overflow-y-auto">
                    {Array.isArray(allDesignations) && allDesignations.map((d: any) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name} {d.code ? `(${d.code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cluster">Cluster</Label>
                <Select value={editClusterId} onValueChange={setEditClusterId}>
                  <SelectTrigger id="edit-cluster">
                    <SelectValue placeholder="Select Cluster" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="max-h-[200px] overflow-y-auto">
                    {Array.isArray(allClusters) && allClusters.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger id="edit-priority">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 - Critical</SelectItem>
                    <SelectItem value="P1">P1 - High</SelectItem>
                    <SelectItem value="P2">P2 - Medium</SelectItem>
                    <SelectItem value="P3">P3 - Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={editRequestMutation.isPending || !editDesignationId || !editClusterId}
            >
              {editRequestMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
