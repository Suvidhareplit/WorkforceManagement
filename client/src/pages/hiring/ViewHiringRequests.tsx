import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { HiringRequest } from "@/types";
import { Link } from "wouter";
import { Plus, Filter, Search, Download, Eye, Edit, X } from "lucide-react";

export default function ViewHiringRequests() {
  const [filters, setFilters] = useState({
    cityId: "all",
    clusterId: "all",
    roleId: "all",
    status: "all",
    priority: "all",
    search: "",
  });
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/hiring", filters],
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clusters = [] } = useQuery({
    queryKey: ["/api/master-data/city", filters.cityId, "clusters"],
    enabled: !!filters.cityId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["/api/master-data/role"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/hiring/${id}/status`, { status });
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Hiring Requests</h2>
            <p className="text-slate-600 mt-1">Manage and track all hiring requests</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/hiring/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Request
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
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
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.cityId}
              onValueChange={(value) => setFilters({ ...filters, cityId: value === "all" ? "" : value, clusterId: "all" })}
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
              onValueChange={(value) => setFilters({ ...filters, clusterId: value === "all" ? "" : value })}
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
              onValueChange={(value) => setFilters({ ...filters, roleId: value === "all" ? "" : value })}
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
              onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
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
              onValueChange={(value) => setFilters({ ...filters, priority: value === "all" ? "" : value })}
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
                <TableHead>Location</TableHead>
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
                  <TableCell colSpan={9} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : requests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No hiring requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests?.map((request: HiringRequest) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">
                      {request.requestId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.role?.name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{request.city?.name}</div>
                        <div className="text-slate-500">{request.cluster?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.numberOfPositions}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">
                      {request.requestType.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
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
      </Card>
    </div>
  );
}
