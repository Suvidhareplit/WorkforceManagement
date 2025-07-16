import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, Users, Clock, TrendingUp, ArrowUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const { data: hiringRequestsData, isLoading: loadingHiring } = useQuery({
    queryKey: ["/api/analytics/hiring"],
  });

  const { data: rolesData } = useQuery({
    queryKey: ["/api/master-data/role"],
  });

  const { data: citiesData } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clustersData } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

  // Filter hiring requests based on selected city
  const filteredHiringRequests = hiringRequestsData?.filter((req: any) => {
    const cityMatch = selectedCity === "all" || req.cityId === parseInt(selectedCity);
    return cityMatch && req.status === 'open';
  }) || [];

  // Get clusters for selected city
  const relevantClusters = selectedCity === "all" 
    ? clustersData || []
    : clustersData?.filter((cluster: any) => cluster.cityId === parseInt(selectedCity)) || [];

  // Calculate role-wise open positions by cluster
  const roleWiseOpenPositions = rolesData?.map((role: any) => {
    const roleRequests = filteredHiringRequests.filter((req: any) => req.roleId === role.id);
    
    // Calculate positions by cluster
    const clusterPositions: any = {};
    let totalPositions = 0;
    
    relevantClusters.forEach((cluster: any) => {
      const clusterRequests = roleRequests.filter((req: any) => req.clusterId === cluster.id);
      const positions = clusterRequests.reduce((sum: number, req: any) => 
        sum + (parseInt(req.numberOfPositions) || 0), 0
      );
      clusterPositions[cluster.id] = positions;
      totalPositions += positions;
    });
    
    return {
      roleId: role.id,
      roleName: role.name,
      clusterPositions,
      totalPositions
    };
  }).filter((role: any) => role.totalPositions > 0) || [];

  // Calculate metrics from hiring requests data (data is now in camelCase from API)
  const openPositions = hiringRequestsData && Array.isArray(hiringRequestsData) 
    ? hiringRequestsData.filter((req: any) => req.status === 'open')
        .reduce((sum: number, req: any) => sum + (parseInt(req.numberOfPositions) || 0), 0)
    : 0;
  
  const totalRequests = hiringRequestsData?.length || 0;
  const closedPositions = hiringRequestsData && Array.isArray(hiringRequestsData)
    ? hiringRequestsData.filter((req: any) => req.status === 'closed')
        .reduce((sum: number, req: any) => sum + (parseInt(req.numberOfPositions) || 0), 0)
    : 0;

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Hiring Dashboard</h2>
            <p className="text-slate-600 mt-1">Manage your recruitment pipeline and track hiring progress</p>
          </div>
          <Link href="/hiring/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Open Positions</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : openPositions}
                </p>
                <p className="text-slate-400 text-sm mt-1">Active positions</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Closed Positions</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : closedPositions}
                </p>
                <p className="text-slate-400 text-sm mt-1">Completed positions</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Candidates</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">--</p>
                <p className="text-slate-400 text-sm mt-1">In pipeline</p>
              </div>
              <div className="bg-cyan-100 p-3 rounded-lg">
                <Users className="text-cyan-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg. Time to Hire</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">--</p>
                <p className="text-slate-400 text-sm mt-1">No data available</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="text-amber-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">--</p>
                <p className="text-slate-400 text-sm mt-1">No data available</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <ArrowUp className="text-purple-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-wise Open Positions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Role-wise Open Positions by Cluster</CardTitle>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {citiesData?.map((city: any) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white">Role</TableHead>
                  {relevantClusters.map((cluster: any) => (
                    <TableHead key={cluster.id} className="text-center min-w-[120px]">
                      {cluster.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleWiseOpenPositions.length > 0 ? (
                  roleWiseOpenPositions.map((role: any) => (
                    <TableRow key={role.roleId}>
                      <TableCell className="font-medium sticky left-0 bg-white">
                        {role.roleName}
                      </TableCell>
                      {relevantClusters.map((cluster: any) => (
                        <TableCell key={cluster.id} className="text-center">
                          <span className={role.clusterPositions[cluster.id] > 0 ? "font-semibold text-blue-600" : "text-slate-300"}>
                            {role.clusterPositions[cluster.id] || "-"}
                          </span>
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <span className="font-bold text-slate-800">
                          {role.totalPositions}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={relevantClusters.length + 2} className="text-center text-slate-500">
                      No open positions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
