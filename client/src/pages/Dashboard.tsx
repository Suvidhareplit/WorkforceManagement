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
  const [selectedCluster, setSelectedCluster] = useState<string>("all");

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

  // Filter hiring requests based on selected city and cluster
  const filteredHiringRequests = hiringRequestsData?.filter((req: any) => {
    const cityMatch = selectedCity === "all" || req.cityId === parseInt(selectedCity);
    const clusterMatch = selectedCluster === "all" || req.clusterId === parseInt(selectedCluster);
    return cityMatch && clusterMatch && req.status === 'open';
  }) || [];

  // Calculate role-wise open positions
  const roleWiseOpenPositions = rolesData?.map((role: any) => {
    const openRequests = filteredHiringRequests.filter((req: any) => req.roleId === role.id);
    const totalOpenPositions = openRequests.reduce((sum: number, req: any) => 
      sum + (parseInt(req.numberOfPositions) || 0), 0
    );
    return {
      roleId: role.id,
      roleName: role.name,
      openPositions: totalOpenPositions,
      requests: openRequests.length
    };
  }) || [];

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
            <CardTitle>Role-wise Open Positions</CardTitle>
            <div className="flex gap-4">
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
              
              <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clusters</SelectItem>
                  {clustersData?.filter((cluster: any) => 
                    selectedCity === "all" || cluster.cityId === parseInt(selectedCity)
                  ).map((cluster: any) => (
                    <SelectItem key={cluster.id} value={cluster.id.toString()}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Open Positions</TableHead>
                <TableHead className="text-center">Active Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleWiseOpenPositions.length > 0 ? (
                roleWiseOpenPositions.map((role: any) => (
                  <TableRow key={role.roleId}>
                    <TableCell className="font-medium">{role.roleName}</TableCell>
                    <TableCell className="text-center">
                      <span className={role.openPositions > 0 ? "font-semibold text-blue-600" : "text-slate-400"}>
                        {role.openPositions}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={role.requests > 0 ? "text-slate-600" : "text-slate-400"}>
                        {role.requests}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
