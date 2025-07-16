import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, Users, Clock, TrendingUp, ArrowUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState<string>("");

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
    if (!selectedCity) return false; // No city selected
    return req.cityId === parseInt(selectedCity) && req.status === 'open';
  }) || [];

  // Get clusters for selected city
  const allClusters = selectedCity 
    ? clustersData?.filter((cluster: any) => cluster.cityId === parseInt(selectedCity)) || []
    : [];

  // First pass: identify which clusters have open positions
  const clustersWithPositions = new Set<number>();
  const rolePositionsMap = new Map<number, Map<number, number>>();

  // Calculate positions for each role-cluster combination
  rolesData?.forEach((role: any) => {
    const roleRequests = filteredHiringRequests.filter((req: any) => req.roleId === role.id);
    const clusterMap = new Map<number, number>();
    
    allClusters.forEach((cluster: any) => {
      const clusterRequests = roleRequests.filter((req: any) => req.clusterId === cluster.id);
      const positions = clusterRequests.reduce((sum: number, req: any) => 
        sum + (parseInt(req.numberOfPositions) || 0), 0
      );
      
      if (positions > 0) {
        clusterMap.set(cluster.id, positions);
        clustersWithPositions.add(cluster.id);
      }
    });
    
    if (clusterMap.size > 0) {
      rolePositionsMap.set(role.id, clusterMap);
    }
  });

  // Get only clusters that have open positions
  const clustersWithOpenPositions = allClusters.filter((cluster: any) => 
    clustersWithPositions.has(cluster.id)
  );

  // Build final role-wise open positions data
  const roleWiseOpenPositions = rolesData?.map((role: any) => {
    const clusterMap = rolePositionsMap.get(role.id);
    if (!clusterMap) return null;
    
    const clusterPositions: any = {};
    let totalPositions = 0;
    
    clusterMap.forEach((positions, clusterId) => {
      clusterPositions[clusterId] = positions;
      totalPositions += positions;
    });
    
    return {
      roleId: role.id,
      roleName: role.name,
      clusterPositions,
      totalPositions
    };
  }).filter(role => role !== null) || [];

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
            <CardTitle>Open Positions - City wise_Role wise_Cluster wise</CardTitle>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a City" />
              </SelectTrigger>
              <SelectContent>
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
          {selectedCity ? (
            <div className="overflow-x-auto">
              <Table className="w-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white z-10">Role</TableHead>
                    {clustersWithOpenPositions.map((cluster: any) => (
                      <TableHead key={cluster.id} className="text-center px-4">
                        {cluster.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-semibold bg-slate-50 px-4">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleWiseOpenPositions.length > 0 ? (
                    <>
                      {roleWiseOpenPositions.map((role: any) => (
                        <TableRow key={role.roleId}>
                          <TableCell className="font-medium sticky left-0 bg-white z-10 pr-6">
                            {role.roleName}
                          </TableCell>
                          {clustersWithOpenPositions.map((cluster: any) => (
                            <TableCell key={cluster.id} className="text-center px-4">
                              <span className="font-semibold text-blue-600">
                                {role.clusterPositions[cluster.id] || "-"}
                              </span>
                            </TableCell>
                          ))}
                          <TableCell className="text-center bg-slate-50 px-4">
                            <span className="font-bold text-slate-800">
                              {role.totalPositions}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Grand Total Row */}
                      <TableRow className="border-t-2 border-slate-300 bg-slate-100">
                        <TableCell className="font-bold sticky left-0 bg-slate-100 z-10 pr-6">
                          Grand Total
                        </TableCell>
                        {clustersWithOpenPositions.map((cluster: any) => {
                          const clusterTotal = roleWiseOpenPositions.reduce((sum: number, role: any) => 
                            sum + (role.clusterPositions[cluster.id] || 0), 0
                          );
                          return (
                            <TableCell key={cluster.id} className="text-center font-bold px-4">
                              {clusterTotal}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center bg-slate-200 px-4">
                          <span className="font-bold text-lg text-blue-700">
                            {roleWiseOpenPositions.reduce((sum: number, role: any) => 
                              sum + role.totalPositions, 0
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={clustersWithOpenPositions.length + 2} className="text-center text-slate-500 py-8">
                        No open positions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Please select a city to view open positions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
