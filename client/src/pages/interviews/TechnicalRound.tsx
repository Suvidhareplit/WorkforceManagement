import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@/types";

export default function TechnicalRound() {
  const [candidateStatuses, setCandidateStatuses] = useState<{[key: number]: string}>({});
  const [candidateReasons, setCandidateReasons] = useState<{[key: number]: string}>({});
  const [candidateComments, setCandidateComments] = useState<{[key: number]: string}>({});
  const [submittedCandidates, setSubmittedCandidates] = useState<{[key: number]: boolean}>({});
  const [cityFilter, setCityFilter] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { toast } = useToast();

  // Get all candidates
  const { data: allCandidatesResponse, isLoading: candidatesLoading, refetch: refetchCandidates, error: candidatesError } = useQuery({
    queryKey: ["/api/interviews/candidates"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Extract data - handle both array and object response
  const allCandidates = Array.isArray(allCandidatesResponse) ? allCandidatesResponse : ((allCandidatesResponse as any)?.data || []);

  // Debug logging
  useEffect(() => {
    console.log('TechnicalRound - Raw Response:', allCandidatesResponse);
    console.log('TechnicalRound - Extracted Candidates:', allCandidates);
    console.log('TechnicalRound - Loading:', candidatesLoading);
    console.log('TechnicalRound - Error:', candidatesError);
  }, [allCandidatesResponse, allCandidates, candidatesLoading, candidatesError]);

  const { data: cities, isLoading: citiesLoading, refetch: refetchCities } = useQuery({
    queryKey: ["/api/master-data/city"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const { data: allClusters, isLoading: clustersLoading, refetch: refetchClusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const isLoading = candidatesLoading || citiesLoading || clustersLoading;

  // Force refetch on component mount
  useEffect(() => {
    refetchCandidates();
    refetchCities();
    refetchClusters();
  }, [refetchCandidates, refetchCities, refetchClusters]);

  // Filter clusters based on selected city
  const clusters = Array.isArray(allClusters) ? allClusters.filter((cluster: any) => {
    if (!cityFilter || cityFilter === "all") return true;
    const selectedCity = Array.isArray(cities) ? cities.find((city: any) => city.name === cityFilter) : null;
    return selectedCity && cluster.cityId === selectedCity.id;
  }) : [];

  // Filter candidates who went through technical interview (pending, selected, rejected)
  const filteredCandidates = Array.isArray(allCandidates) ? allCandidates.filter((candidate: any) => {
    // Show candidates in technical status OR those who were evaluated (selected/rejected with technical notes)
    const isTechnicalRelated = (candidate.status === 'technical' && (candidate.benchmarkMet === true || candidate.benchmarkMet === 1)) ||
           ((candidate.status === 'selected' || candidate.status === 'rejected') && candidate.technicalNotes);
    
    if (!isTechnicalRelated) return false;
    
    // Status filter (pending, selected, rejected)
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "pending" && candidate.technicalNotes) return false;
      if (statusFilter === "selected" && candidate.status !== 'selected') return false;
      if (statusFilter === "rejected" && candidate.status !== 'rejected') return false;
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

  const updateTechnicalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      return await apiRequest(`/api/interviews/candidates/${id}/technical`, {
        method: "PATCH",
        body: {
          status,
          notes,
        }
      });
    },
    onSuccess: (_, variables) => {
      // Clear state for this specific candidate
      setCandidateStatuses(prev => {
        const newState = { ...prev };
        delete newState[variables.id];
        return newState;
      });
      setCandidateReasons(prev => {
        const newState = { ...prev };
        delete newState[variables.id];
        return newState;
      });
      setCandidateComments(prev => {
        const newState = { ...prev };
        delete newState[variables.id];
        return newState;
      });
      // Mark as submitted
      setSubmittedCandidates(prev => ({ ...prev, [variables.id]: true }));
      
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      refetchCandidates(); // Force immediate refetch
      toast({
        title: "Success",
        description: "Technical round status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update technical status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (candidateId: number, status: string) => {
    setCandidateStatuses(prev => ({ ...prev, [candidateId]: status }));
    if (status === "selected") {
      // Set N/A for reason and comments when selected
      setCandidateReasons(prev => ({ ...prev, [candidateId]: "N/A" }));
      setCandidateComments(prev => ({ ...prev, [candidateId]: "N/A" }));
    } else {
      // Clear reason and comments when changing to not-selected
      setCandidateReasons(prev => ({ ...prev, [candidateId]: "" }));
      setCandidateComments(prev => ({ ...prev, [candidateId]: "" }));
    }
  };

  const handleReasonChange = (candidateId: number, reason: string) => {
    setCandidateReasons(prev => ({ ...prev, [candidateId]: reason }));
  };

  const handleCommentChange = (candidateId: number, comment: string) => {
    setCandidateComments(prev => ({ ...prev, [candidateId]: comment }));
  };

  const handleSubmit = (candidate: Candidate) => {
    const status = candidateStatuses[candidate.id];
    const comment = candidateComments[candidate.id];
    const reason = candidateReasons[candidate.id];

    if (!status) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    if (!comment && status !== "selected") {
      toast({
        title: "Error",
        description: "Comment is mandatory",
        variant: "destructive",
      });
      return;
    }

    if (status === "not-selected" && !reason) {
      toast({
        title: "Error",
        description: "Please select a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    const notes = status === "not-selected" ? `${reason}: ${comment}` : comment;

    updateTechnicalMutation.mutate({
      id: candidate.id,
      status: status === "selected" ? "selected" : "rejected",
      notes,
    });
  };

  // Show loading state on initial load
  if (isLoading && !allCandidates) {
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
        <h1 className="text-3xl font-bold text-slate-900">Technical Interview Assessment</h1>
        <p className="text-slate-600 mt-2">Evaluate technical competencies and determine candidate suitability for final selection</p>
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
              <Label htmlFor="statusFilter" className="text-sm font-medium text-slate-700">Interview Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
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

      {/* Technical Interview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technical Evaluation Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Candidate Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Location</TableHead>
                  <TableHead className="font-semibold text-slate-700">Position</TableHead>
                  <TableHead className="font-semibold text-slate-700">Cluster</TableHead>
                  <TableHead className="font-semibold text-slate-700">Interview Result</TableHead>
                  <TableHead className="font-semibold text-slate-700">Rejection Reason</TableHead>
                  <TableHead className="font-semibold text-slate-700">Interviewer Comments</TableHead>
                  <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(paginatedCandidates) || paginatedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No candidates for technical interview
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(paginatedCandidates) && paginatedCandidates.map((candidate: Candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium text-slate-900">{candidate.name}</TableCell>
                      <TableCell className="text-slate-700">{(candidate as any).cityName}</TableCell>
                      <TableCell className="text-slate-700">{(candidate as any).roleName}</TableCell>
                      <TableCell className="text-slate-700">{(candidate as any).clusterName}</TableCell>
                      <TableCell>
                        {(candidate as any).technicalNotes ? (
                          <Badge 
                            variant={(candidate as any).status === 'selected' ? 'default' : 'destructive'}
                            className={(candidate as any).status === 'selected' ? 'bg-green-500' : ''}
                          >
                            {(candidate as any).status === 'selected' ? 'Selected' : 'Rejected'}
                          </Badge>
                        ) : (
                          <Select
                            value={candidateStatuses[candidate.id] || ""}
                            onValueChange={(value) => handleStatusChange(candidate.id, value)}
                            disabled={submittedCandidates[candidate.id]}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="selected">Selected</SelectItem>
                              <SelectItem value="not-selected">Not Selected</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {(candidate as any).technicalNotes && ((candidate as any).status === 'rejected' || (candidate as any).technicalStatus === 'rejected') ? (
                          <span className="text-slate-700">{(candidate as any).technicalNotes.split(':')[0]}</span>
                        ) : candidateStatuses[candidate.id] === "selected" || submittedCandidates[candidate.id] ? (
                          <span className="text-slate-500">N/A</span>
                        ) : candidateStatuses[candidate.id] === "not-selected" ? (
                          <Select
                            value={candidateReasons[candidate.id] || ""}
                            onValueChange={(value) => handleReasonChange(candidate.id, value)}
                            disabled={submittedCandidates[candidate.id]}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Poor technical knowledge">Poor technical knowledge</SelectItem>
                              <SelectItem value="No relevant experience">No relevant experience</SelectItem>
                              <SelectItem value="Not okay with night shift">Not okay with night shift</SelectItem>
                              <SelectItem value="Basic English (Reading and Understanding)">Basic English (Reading and Understanding)</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(candidate as any).technicalNotes ? (
                          <span className="text-slate-700 text-sm">{(candidate as any).technicalNotes.split(':').slice(1).join(':').trim()}</span>
                        ) : (
                          <Textarea
                            value={candidateComments[candidate.id] || ""}
                            onChange={(e) => handleCommentChange(candidate.id, e.target.value)}
                            placeholder="Comments (mandatory)"
                            className="w-[200px] h-20"
                            disabled={candidateStatuses[candidate.id] === "selected" || submittedCandidates[candidate.id]}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {(candidate as any).technicalNotes ? (
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
                            Evaluated
                          </Badge>
                        ) : submittedCandidates[candidate.id] ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Submitted
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleSubmit(candidate)}
                            disabled={updateTechnicalMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Submit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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