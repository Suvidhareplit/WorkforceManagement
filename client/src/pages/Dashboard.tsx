import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, Users, TrendingUp, XCircle, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState<string>("5"); // Default to Bangalore (ID: 5)
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  console.log('🏠 Dashboard component rendering...');

  // Fetch data from APIs with refetch on window focus
  const { data: citiesResponse } = useQuery({
    queryKey: ['/api/master-data/city'],
    queryFn: () => api.masterData.getCities(),
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch when component mounts
  });

  const { data: designationsResponse } = useQuery({
    queryKey: ['/api/designations'],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: clustersResponse } = useQuery({
    queryKey: ['/api/master-data/cluster'],
    queryFn: () => api.masterData.getClusters(),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: hiringResponse, isLoading: loadingHiring } = useQuery({
    queryKey: ['/api/hiring'],
    queryFn: () => api.hiring.getRequests(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Fetch classroom training data
  const { data: classroomResponse, isLoading: loadingClassroom } = useQuery({
    queryKey: ['/api/training/classroom'],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Fetch field training data
  const { data: fieldResponse, isLoading: loadingField } = useQuery({
    queryKey: ['/api/training/field'],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Fetch induction training data for joined candidates count
  const { data: inductionResponse } = useQuery({
    queryKey: ['/api/training/induction'],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Extract data from API responses
  const citiesData = (citiesResponse as any)?.data || [];
  const designationsData = Array.isArray(designationsResponse) ? designationsResponse : (designationsResponse as any)?.data || [];
  const clustersData = (clustersResponse as any)?.data || [];
  const hiringRequestsData = (hiringResponse as any)?.data || [];
  const classroomData = Array.isArray(classroomResponse) ? classroomResponse : (classroomResponse as any)?.data || [];
  const fieldData = Array.isArray(fieldResponse) ? fieldResponse : (fieldResponse as any)?.data || [];
  const inductionData = Array.isArray(inductionResponse) ? inductionResponse : (inductionResponse as any)?.data || [];

  console.log('📊 Dashboard Data:', {
    citiesCount: citiesData.length,
    designationsCount: designationsData.length,
    clustersCount: clustersData.length,
    hiringRequestsCount: hiringRequestsData.length,
    selectedCity,
    citiesData: citiesData.slice(0, 3),
    hiringRequestsData: hiringRequestsData.slice(0, 3)
  });

  // Filter hiring requests based on selected city and priority
  const filteredHiringRequests = (hiringRequestsData as any[])?.filter((req: any) => {
    if (!selectedCity) return false; // No city selected
    const cityMatch = req.city_id === parseInt(selectedCity) && req.status === 'open';
    const priorityMatch = selectedPriority === 'all' || req.priority === selectedPriority;
    return cityMatch && priorityMatch;
  }) || [];

  // Get clusters for selected city
  const allClusters = selectedCity 
    ? (clustersData as any[])?.filter((cluster: any) => cluster.city_id === parseInt(selectedCity)) || []
    : [];

  // First pass: identify which clusters have open positions
  const clustersWithPositions = new Set<number>();
  const designationPositionsMap = new Map<number, Map<number, number>>();

  // Calculate positions for each designation-cluster combination
  (designationsData as any[])?.forEach((designation: any) => {
    const designationRequests = filteredHiringRequests.filter((req: any) => 
      req.designation_id === designation.id || req.designationId === designation.id
    );
    const clusterMap = new Map<number, number>();
    
    allClusters.forEach((cluster: any) => {
      const clusterRequests = designationRequests.filter((req: any) => req.cluster_id === cluster.id);
      const positions = clusterRequests.reduce((sum: number, req: any) => 
        sum + (parseInt(req.no_of_openings) || 0), 0
      );
      
      if (positions > 0) {
        clusterMap.set(cluster.id, positions);
        clustersWithPositions.add(cluster.id);
      }
    });
    
    if (clusterMap.size > 0) {
      designationPositionsMap.set(designation.id, clusterMap);
    }
  });

  // Get only clusters that have open positions
  const clustersWithOpenPositions = allClusters.filter((cluster: any) => 
    clustersWithPositions.has(cluster.id)
  );

  // Build final designation-wise open positions data with additional metrics
  const designationWiseOpenPositions = (designationsData as any[])?.map((designation: any) => {
    const clusterMap = designationPositionsMap.get(designation.id);
    if (!clusterMap) return null;
    
    const clusterPositions: any = {};
    let totalPositions = 0;
    
    clusterMap.forEach((positions: number, clusterId: number) => {
      clusterPositions[clusterId] = positions;
      totalPositions += positions;
    });
    
    // Calculate Total Raised for this designation (all hiring requests, not just open)
    const designationRequests = hiringRequestsData.filter((req: any) => 
      req.designation_id === designation.id || req.designationId === designation.id
    );
    const totalRaised = designationRequests.reduce((sum: number, req: any) => 
      sum + (parseInt(req.no_of_openings) || 0), 0
    );
    
    // Calculate Closed (joined candidates) for this designation
    const closedCount = inductionData.filter((record: any) => 
      (record.joiningStatus || record.joining_status) === 'joined' &&
      (record.designation === designation.name || record.role === designation.name)
    ).length;
    
    // YTB Hired = Raised - Closed
    const ytbHired = totalRaised - closedCount;
    
    // Under CRT count for this designation
    const underCRT = classroomData.filter((record: any) => 
      ((record.crtFeedback || record.crt_feedback) === 'under_classroom_training') &&
      (record.designation === designation.name || record.role === designation.name)
    ).length;
    
    // Under FT count for this designation
    const underFT = fieldData.filter((record: any) => 
      ((record.ftFeedback || record.ft_feedback) === 'under_field_training') &&
      (record.designation === designation.name || record.role === designation.name)
    ).length;
    
    return {
      designationId: designation.id,
      designationName: designation.name,
      clusterPositions,
      totalPositions,
      totalRaised,
      closedCount,
      ytbHired,
      underCRT,
      underFT
    };
  }).filter(d => d !== null) || [];

  // Total positions raised (all time - sum of all no_of_openings)
  const totalPositionsRaised = hiringRequestsData && Array.isArray(hiringRequestsData)
    ? hiringRequestsData.reduce((sum: number, req: any) => sum + (parseInt(req.no_of_openings) || 0), 0)
    : 0;

  // Closed positions = count of joined candidates from induction_training
  const closedPositions = inductionData.filter((record: any) => 
    (record.joiningStatus || record.joining_status) === 'joined'
  ).length;

  // Called off positions (sum of no_of_openings where status is 'called_off')
  const calledOffPositions = hiringRequestsData && Array.isArray(hiringRequestsData)
    ? hiringRequestsData.filter((req: any) => req.status === 'called_off')
        .reduce((sum: number, req: any) => sum + (parseInt(req.no_of_openings) || 0), 0)
    : 0;

  // Pan India Open Positions = Total Positions Raised - Joined Count
  const panIndiaOpenPositions = totalPositionsRaised - closedPositions;

  // YTD Hired = Closed positions (same as closed, represents hired/filled positions)
  const ytdHired = closedPositions;

  // Employees under Classroom Training (crt_feedback = 'under_classroom_training')
  const underClassroomTraining = classroomData.filter((record: any) => 
    (record.crtFeedback || record.crt_feedback) === 'under_classroom_training'
  ).length;

  // Employees under Field Training (ft_feedback = 'under_field_training')
  const underFieldTraining = fieldData.filter((record: any) => 
    (record.ftFeedback || record.ft_feedback) === 'under_field_training'
  ).length;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Hiring Dashboard</h2>
            <p className="text-slate-600 mt-1">Manage your recruitment pipeline and track hiring progress</p>
          </div>
          <Link href="/hiring/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Create New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* 1. Pan India Total Positions Raised */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pan India Positions Raised</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : totalPositionsRaised}
                </p>
                <p className="text-slate-400 text-sm mt-1">All time raised</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <TrendingUp className="text-indigo-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Pan India Closed Positions */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pan India Closed Positions</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : closedPositions}
                </p>
                <p className="text-slate-400 text-sm mt-1">Completed positions</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Pan India Called Off Positions */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pan India Called Off</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : calledOffPositions}
                </p>
                <p className="text-slate-400 text-sm mt-1">Cancelled positions</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Pan India Open Positions */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pan India Open Positions</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : panIndiaOpenPositions}
                </p>
                <p className="text-slate-400 text-sm mt-1">Current active</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. YTD Hired */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">YTD Hired</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : ytdHired}
                </p>
                <p className="text-slate-400 text-sm mt-1">Positions filled</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Users className="text-emerald-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Row 2: Training */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Under Classroom Training */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Under Classroom Training</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingClassroom ? "..." : underClassroomTraining}
                </p>
                <p className="text-slate-400 text-sm mt-1">Employees in CRT</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <GraduationCap className="text-amber-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Under Field Training */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Under Field Training</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingField ? "..." : underFieldTraining}
                </p>
                <p className="text-slate-400 text-sm mt-1">Employees in FT</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Designation-wise Open Positions Table */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Open Positions - City wise_Designation wise_Cluster wise</CardTitle>
            <div className="flex gap-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a City" />
                </SelectTrigger>
                <SelectContent>
                  {(citiesData as any[])?.map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
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
          </div>
        </CardHeader>
        <CardContent>
          {selectedCity ? (
            <div className="overflow-x-auto">
              <Table className="w-auto">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="sticky left-0 bg-slate-50 z-10 font-semibold">Designation</TableHead>
                    <TableHead className="text-center font-semibold bg-green-50 px-3">Total Raised</TableHead>
                    <TableHead className="text-center font-semibold bg-green-50 px-3">Closed</TableHead>
                    <TableHead className="text-center font-semibold bg-green-50 px-3">YTB Hired</TableHead>
                    {clustersWithOpenPositions.map((cluster: any) => (
                      <TableHead key={cluster.id} className="text-center px-4">
                        {cluster.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-semibold bg-slate-50 px-4">Total</TableHead>
                    <TableHead className="text-center font-semibold bg-amber-50 px-3">Under CRT</TableHead>
                    <TableHead className="text-center font-semibold bg-amber-50 px-3">Under FT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {designationWiseOpenPositions.length > 0 ? (
                    <>
                      {designationWiseOpenPositions.map((designation: any) => (
                        <TableRow key={designation.designationId}>
                          <TableCell className="font-medium sticky left-0 bg-white z-10 pr-6">
                            {designation.designationName}
                          </TableCell>
                          <TableCell className="text-center bg-green-50 px-3">
                            <span className="font-semibold text-slate-700">{designation.totalRaised}</span>
                          </TableCell>
                          <TableCell className="text-center bg-green-50 px-3">
                            <span className="font-semibold text-green-600">{designation.closedCount}</span>
                          </TableCell>
                          <TableCell className="text-center bg-green-50 px-3">
                            <span className="font-semibold text-orange-600">{designation.ytbHired}</span>
                          </TableCell>
                          {clustersWithOpenPositions.map((cluster: any) => (
                            <TableCell key={cluster.id} className="text-center px-4">
                              <span className="font-semibold text-blue-600">
                                {designation.clusterPositions[cluster.id] || "-"}
                              </span>
                            </TableCell>
                          ))}
                          <TableCell className="text-center bg-slate-50 px-4">
                            <span className="font-bold text-slate-800">
                              {designation.totalPositions}
                            </span>
                          </TableCell>
                          <TableCell className="text-center bg-amber-50 px-3">
                            <span className="font-semibold text-amber-600">{designation.underCRT}</span>
                          </TableCell>
                          <TableCell className="text-center bg-amber-50 px-3">
                            <span className="font-semibold text-amber-600">{designation.underFT}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Grand Total Row */}
                      <TableRow className="border-t-2 border-slate-300 bg-slate-100">
                        <TableCell className="font-bold sticky left-0 bg-slate-100 z-10 pr-6">
                          Grand Total
                        </TableCell>
                        <TableCell className="text-center bg-green-100 px-3">
                          <span className="font-bold text-slate-700">
                            {designationWiseOpenPositions.reduce((sum: number, d: any) => sum + d.totalRaised, 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center bg-green-100 px-3">
                          <span className="font-bold text-green-600">
                            {designationWiseOpenPositions.reduce((sum: number, d: any) => sum + d.closedCount, 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center bg-green-100 px-3">
                          <span className="font-bold text-orange-600">
                            {designationWiseOpenPositions.reduce((sum: number, d: any) => sum + d.ytbHired, 0)}
                          </span>
                        </TableCell>
                        {clustersWithOpenPositions.map((cluster: any) => {
                          const clusterTotal = designationWiseOpenPositions.reduce((sum: number, d: any) => 
                            sum + (d.clusterPositions[cluster.id] || 0), 0
                          );
                          return (
                            <TableCell key={cluster.id} className="text-center font-bold px-4">
                              {clusterTotal}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center bg-slate-200 px-4">
                          <span className="font-bold text-lg text-blue-700">
                            {designationWiseOpenPositions.reduce((sum: number, d: any) => 
                              sum + d.totalPositions, 0
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center bg-amber-100 px-3">
                          <span className="font-bold text-amber-600">
                            {designationWiseOpenPositions.reduce((sum: number, d: any) => sum + d.underCRT, 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center bg-amber-100 px-3">
                          <span className="font-bold text-amber-600">
                            {designationWiseOpenPositions.reduce((sum: number, d: any) => sum + d.underFT, 0)}
                          </span>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={clustersWithOpenPositions.length + 7} className="text-center text-slate-500 py-8">
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
