import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
// Removed HiringRequest import since backend returns snake_case fields
import { Link } from "wouter";
import { Plus, Filter, Search, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function ViewHiringRequests() {
  const [filters, setFilters] = useState({
    cityId: "all",
    clusterId: "all",
    roleId: "all",
    status: "all",
    priority: "all",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { toast } = useToast();

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
    const matchesRole = filters.roleId === "all" || request.roleId?.toString() === filters.roleId || request.role_id?.toString() === filters.roleId;
    const matchesStatus = filters.status === "all" || request.status === filters.status;
    const matchesPriority = filters.priority === "all" || request.priority === filters.priority;
    const matchesSearch = filters.search === "" || 
      (request.request_id || request.requestId || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.role_name || request.roleName || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.city_name || request.cityName || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.cluster_name || request.clusterName || "").toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesCity && matchesCluster && matchesRole && matchesStatus && matchesPriority && matchesSearch;
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



  const { data: citiesResponse } = useQuery({
    queryKey: ["/api/master-data/city"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: clustersResponse } = useQuery({
    queryKey: ["/api/master-data/cluster"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: rolesResponse } = useQuery({
    queryKey: ["/api/master-data/role"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const cities = (citiesResponse as any) || [];
  const allClusters = (clustersResponse as any) || [];
  const roles = (rolesResponse as any) || [];
  
  // Filter clusters by selected city
  const clusters = filters.cityId === "all" 
    ? allClusters 
    : allClusters.filter((cluster: any) => 
        cluster.cityId?.toString() === filters.cityId || 
        cluster.city_id?.toString() === filters.cityId
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
              value={filters.roleId}
              onValueChange={(value) => handleFilterChange({ ...filters, roleId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Array.isArray(roles) && roles.filter((role: any) => role.id && role.id.toString() && role.name).map((role: any) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
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
                <TableHead>Role</TableHead>
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
                      {request.role_name || request.roleName || 'Unknown Role'}
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
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
    </div>
  );
}
