import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const { toast } = useToast();

  // Get all candidates
  const { data: allCandidates, isLoading } = useQuery({
    queryKey: ["/api/interviews/candidates"],
  });

  // Filter only candidates who passed prescreening (benchmarkMet = true and status = 'technical')
  const technicalCandidates = (allCandidates as any[])?.filter((candidate: any) => 
    candidate.status === 'technical' && candidate.benchmarkMet === true
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Technical Round</h2>
        <p className="text-slate-600 mt-1">Conduct technical interviews for candidates who passed prescreening</p>
      </div>

      {/* Technical Interview */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !technicalCandidates || technicalCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No candidates for technical interview
                    </TableCell>
                  </TableRow>
                ) : (
                  technicalCandidates.map((candidate: Candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{(candidate as any).city?.name || candidate.city}</TableCell>
                      <TableCell>{(candidate as any).role?.name || candidate.role}</TableCell>
                      <TableCell>{(candidate as any).cluster?.name || candidate.cluster}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {candidateStatuses[candidate.id] === "selected" || submittedCandidates[candidate.id] ? (
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
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={candidateComments[candidate.id] || ""}
                          onChange={(e) => handleCommentChange(candidate.id, e.target.value)}
                          placeholder="Comments (mandatory)"
                          className="w-[200px] h-20"
                          disabled={candidateStatuses[candidate.id] === "selected" || submittedCandidates[candidate.id]}
                        />
                      </TableCell>
                      <TableCell>
                        {submittedCandidates[candidate.id] ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Submitted
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleSubmit(candidate)}
                            disabled={updateTechnicalMutation.isPending}
                            size="sm"
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
    </div>
  );
}