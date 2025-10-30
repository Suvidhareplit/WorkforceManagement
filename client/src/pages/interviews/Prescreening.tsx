import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@/types";
import { Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Prescreening() {
  const [notes, setNotes] = useState("");
  const [marks, setMarks] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { toast } = useToast();

  const { data: candidatesResponse, isLoading: candidatesLoading, refetch: refetchCandidates, error: candidatesError } = useQuery({
    queryKey: ["/api/interviews/candidates"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: citiesResponse, isLoading: citiesLoading, refetch: refetchCities } = useQuery({
    queryKey: ["/api/master-data/city"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const { data: clustersResponse, isLoading: clustersLoading, refetch: refetchClusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  // Extract data from API responses
  // The axios interceptor already extracts .data, so candidatesResponse IS the array
  const candidates = Array.isArray(candidatesResponse) ? candidatesResponse : ((candidatesResponse as any)?.data || []);
  const cities = Array.isArray(citiesResponse) ? citiesResponse : ((citiesResponse as any)?.data || []);
  const allClusters = Array.isArray(clustersResponse) ? clustersResponse : ((clustersResponse as any)?.data || []);

  const isLoading = candidatesLoading || citiesLoading || clustersLoading;

  // Force refetch on component mount
  useEffect(() => {
    refetchCandidates();
    refetchCities();
    refetchClusters();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Prescreening - Raw Response:', candidatesResponse);
    console.log('Prescreening - Extracted Candidates:', candidates);
    console.log('Prescreening - Filtered Logic - Has screeningScore:', 
      candidates.filter((c: any) => c.screeningScore !== null && c.screeningScore !== undefined).length);
    console.log('Prescreening - Loading:', candidatesLoading);
    console.log('Prescreening - Error:', candidatesError);
  }, [candidatesResponse, candidates, candidatesLoading, candidatesError]);

  // Filter clusters based on selected city
  const clusters = Array.isArray(allClusters) ? allClusters.filter((cluster: any) => {
    if (!cityFilter || cityFilter === "all") return true;
    const selectedCity = Array.isArray(cities) ? cities.find((city: any) => city.name === cityFilter) : null;
    return selectedCity && cluster.city_id === selectedCity.id;
  }) : [];

  const updatePrescreeningMutation = useMutation({
    mutationFn: async ({ id, marks, notes }: { id: number; marks: number; notes: string }) => {
      return await apiRequest(`/api/interviews/candidates/${id}/prescreening`, {
        method: "PATCH",
        body: {
          score: marks,
          notes,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      refetchCandidates(); // Force immediate refetch
      toast({
        title: "Success",
        description: "Prescreening completed successfully",
      });
      setNotes("");
      setMarks("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update prescreening status",
        variant: "destructive",
      });
    },
  });

  const handleSubmitMarks = (candidate: Candidate) => {
    const marksNum = parseInt(marks);
    
    if (!marks || isNaN(marksNum) || marksNum < 0 || marksNum > 10) {
      toast({
        title: "Invalid marks",
        description: "Please enter marks between 0 and 10",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Submitting prescreening:', { id: candidate.id, marks: marksNum, notes });
    updatePrescreeningMutation.mutate({
      id: candidate.id,
      marks: marksNum,
      notes,
    });
  };

  // Filter candidates to show prescreening history (applied, pending, passed, rejected)
  const filteredCandidates = Array.isArray(candidates) ? candidates.filter((candidate: any) => {
    // Show ALL candidates who have been prescreened (have a screening score)
    // OR candidates pending prescreening (status = 'applied')
    // This ensures prescreened candidates remain visible regardless of their current status
    const hasBeenPrescreened = candidate.screeningScore !== null && candidate.screeningScore !== undefined;
    const isPendingPrescreening = candidate.status === 'applied';
    
    if (!hasBeenPrescreened && !isPendingPrescreening) return false;
    
    // Status filter (pending, passed, rejected) - Based on PRESCREENING results
    if (statusFilter && statusFilter !== "all") {
      // Pending: Not yet evaluated in prescreening (no screening score)
      if (statusFilter === "pending" && candidate.screeningScore !== null) return false;
      
      // Passed: Passed prescreening benchmark (moved to technical or benchmarkMet = true)
      if (statusFilter === "passed") {
        const passedPrescreening = (candidate.benchmarkMet === true || candidate.benchmarkMet === 1) && candidate.screeningScore !== null;
        if (!passedPrescreening) return false;
      }
      
      // Rejected: Failed prescreening benchmark (benchmarkMet = false)
      // Show regardless of current status - they failed prescreening
      if (statusFilter === "rejected") {
        const rejectedAtPrescreening = (candidate.benchmarkMet === false || candidate.benchmarkMet === 0) && 
                                        candidate.screeningScore !== null;
        if (!rejectedAtPrescreening) return false;
      }
    }
    
    if (cityFilter && cityFilter !== "all" && candidate.cityName !== cityFilter) return false;
    if (clusterFilter && clusterFilter !== "all" && candidate.clusterName !== clusterFilter) return false;
    if (dateRange.from && new Date(candidate.createdAt) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(candidate.createdAt) > new Date(dateRange.to)) return false;
    return true;
  }) : [];

  // Pagination
  const totalPages = Math.ceil((filteredCandidates.length || 0) / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Show loading state on initial load
  if (isLoading && !candidates) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Candidate Prescreening</h1>
        <p className="text-slate-600 mt-2">Evaluate and assess candidate qualifications for technical interview progression</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter Candidates</CardTitle>
        </CardHeader>
        <CardContent>
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="cityFilter" className="text-sm font-medium text-slate-700">City</Label>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger id="cityFilter">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {(cities as any[])?.map((city: any) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="clusterFilter" className="text-sm font-medium text-slate-700">Cluster</Label>
          <Select value={clusterFilter} onValueChange={setClusterFilter}>
            <SelectTrigger id="clusterFilter">
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clusters</SelectItem>
              {clusters?.map((cluster: any) => (
                <SelectItem key={cluster.id} value={cluster.name}>
                  {cluster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="statusFilter" className="text-sm font-medium text-slate-700">Screening Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700">Application Date From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="dateTo" className="text-sm font-medium text-slate-700">Application Date To</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
      </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Candidate Evaluation Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Application ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Candidate Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Contact Number</TableHead>
                <TableHead className="font-semibold text-slate-700">Aadhar Number</TableHead>
                <TableHead className="font-semibold text-slate-700">Location</TableHead>
                <TableHead className="font-semibold text-slate-700">Cluster</TableHead>
                <TableHead className="font-semibold text-slate-700">Position</TableHead>
                <TableHead className="font-semibold text-slate-700">Evaluation Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Assessment Score</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(paginatedCandidates) || paginatedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                Array.isArray(paginatedCandidates) && paginatedCandidates.map((candidate: any) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-mono text-sm text-slate-600">{candidate.applicationId || 'N/A'}</TableCell>
                    <TableCell className="font-medium text-slate-900">{candidate.name}</TableCell>
                    <TableCell className="text-slate-700">{candidate.phone}</TableCell>
                    <TableCell className="font-mono text-sm text-slate-600">{candidate.aadharNumber || 'N/A'}</TableCell>
                    <TableCell className="text-slate-700">{candidate.cityName}</TableCell>
                    <TableCell className="text-slate-700">{candidate.clusterName}</TableCell>
                    <TableCell className="text-slate-700">{candidate.roleName}</TableCell>
                    <TableCell>
                      {candidate.prescreening_score !== null && candidate.prescreening_score !== undefined ? (
                        <Badge 
                          variant={candidate.prescreening_result === 'pass' ? 'default' : 'destructive'}
                          className={candidate.prescreening_result === 'pass' ? 'bg-green-500' : ''}
                        >
                          {candidate.prescreening_result === 'pass' ? 'Passed' : 'Failed'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {candidate.prescreening_score ? (
                        <Badge variant={candidate.prescreening_result === 'pass' ? 'default' : 'destructive'}>
                          {candidate.prescreening_score}/10
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNotes(candidate.prescreening_notes || "");
                                setMarks(candidate.prescreening_score ? candidate.prescreening_score.toString() : "");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Prescreening Review - {candidate.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Personal Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {candidate.name}</div>
                                    <div><strong>Phone:</strong> {candidate.phone}</div>
                                    <div><strong>Email:</strong> {candidate.email || "Not provided"}</div>
                                    <div><strong>Qualification:</strong> {candidate.qualification || "Not specified"}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Job Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Role:</strong> {candidate.roleName}</div>
                                    <div><strong>City:</strong> {candidate.cityName}</div>
                                    <div><strong>Cluster:</strong> {candidate.clusterName}</div>
                                    <div><strong>Source:</strong> {candidate.resumeSource?.replace('_', ' ')}</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Prescreening Evaluation</h4>
                                <div className="mb-4">
                                  <Label htmlFor="marks">Marks (out of 10)</Label>
                                  <Input
                                    id="marks"
                                    type="number"
                                    min="0"
                                    max="10"
                                    placeholder="Enter marks out of 10"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                    className="mt-1"
                                  />
                                  {marks && (
                                    <p className={`mt-2 text-sm ${parseInt(marks) >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                                      Result: {parseInt(marks) >= 7 ? 'Pass (Will proceed to technical round)' : 'Fail (Will be rejected)'}
                                    </p>
                                  )}
                                </div>
                                
                                <div>
                                  <Label htmlFor="notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Add your notes about the candidate..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleSubmitMarks(candidate)}
                                  disabled={updatePrescreeningMutation.isPending || !marks}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {updatePrescreeningMutation.isPending ? "Submitting..." : "Submit Marks"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCandidates?.length || 0)} of {filteredCandidates?.length || 0} candidates
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
