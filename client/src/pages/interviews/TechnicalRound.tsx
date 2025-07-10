import { useState } from "react";
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
import { CheckCircle, XCircle, Eye, Star } from "lucide-react";

export default function TechnicalRound() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [screeningScore, setScreeningScore] = useState("");
  const [technicalNotes, setTechnicalNotes] = useState("");
  const { toast } = useToast();

  const { data: prescreenedCandidates, isLoading: loadingPrescreened } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "prescreening" }],
  });

  const { data: technicalCandidates, isLoading: loadingTechnical } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "technical" }],
  });

  const updateScreeningMutation = useMutation({
    mutationFn: async ({ id, score, benchmarkMet }: { id: number; score: number; benchmarkMet: boolean }) => {
      return await apiRequest("PATCH", `/api/interviews/candidates/${id}/screening`, {
        score,
        benchmarkMet,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: "Screening scores updated successfully",
      });
      setSelectedCandidate(null);
      setScreeningScore("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update screening scores",
        variant: "destructive",
      });
    },
  });

  const updateTechnicalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      return await apiRequest("PATCH", `/api/interviews/candidates/${id}/technical`, {
        status,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: "Technical round status updated successfully",
      });
      setSelectedCandidate(null);
      setTechnicalNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update technical status",
        variant: "destructive",
      });
    },
  });

  const handleScreeningSubmit = (candidate: Candidate) => {
    const score = parseFloat(screeningScore);
    const benchmarkMet = score >= 70; // Assuming 70% is the benchmark
    
    updateScreeningMutation.mutate({
      id: candidate.id,
      score,
      benchmarkMet,
    });
  };

  const handleTechnicalSelect = (candidate: Candidate) => {
    updateTechnicalMutation.mutate({
      id: candidate.id,
      status: "selected",
      notes: technicalNotes,
    });
  };

  const handleTechnicalReject = (candidate: Candidate) => {
    updateTechnicalMutation.mutate({
      id: candidate.id,
      status: "rejected",
      notes: technicalNotes,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Technical Round</h2>
        <p className="text-slate-600 mt-1">Conduct screening assessments and technical interviews</p>
      </div>

      <div className="space-y-6">
        {/* Screening Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Role-wise Screening Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Prescreening Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingPrescreened ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : prescreenedCandidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No candidates awaiting screening assessment
                    </TableCell>
                  </TableRow>
                ) : (
                  prescreenedCandidates?.map((candidate: Candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.role?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.city?.name}</div>
                          <div className="text-slate-500">{candidate.cluster?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {candidate.prescreeningNotes || "No notes"}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setScreeningScore("");
                              }}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Assess
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Screening Assessment - {candidate.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Candidate Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {candidate.name}</div>
                                    <div><strong>Role:</strong> {candidate.role?.name}</div>
                                    <div><strong>Qualification:</strong> {candidate.qualification}</div>
                                    <div><strong>Phone:</strong> {candidate.phone}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Prescreening Notes</h4>
                                  <p className="text-sm text-slate-600">
                                    {candidate.prescreeningNotes || "No notes available"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="score">Screening Score (0-100)</Label>
                                <Input
                                  id="score"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={screeningScore}
                                  onChange={(e) => setScreeningScore(e.target.value)}
                                  placeholder="Enter score"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                  Benchmark: 70% (candidates scoring 70+ will proceed to technical round)
                                </p>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleScreeningSubmit(candidate)}
                                  disabled={!screeningScore || updateScreeningMutation.isPending}
                                >
                                  Submit Score
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Technical Interview */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Interview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Screening Score</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTechnical ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : technicalCandidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No candidates for technical interview
                    </TableCell>
                  </TableRow>
                ) : (
                  technicalCandidates?.map((candidate: Candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.role?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {candidate.screeningScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.city?.name}</div>
                          <div className="text-slate-500">{candidate.cluster?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.phone}</div>
                          <div className="text-slate-500">{candidate.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setTechnicalNotes("");
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Interview
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Technical Interview - {candidate.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Candidate Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {candidate.name}</div>
                                    <div><strong>Role:</strong> {candidate.role?.name}</div>
                                    <div><strong>Qualification:</strong> {candidate.qualification}</div>
                                    <div><strong>Screening Score:</strong> {candidate.screeningScore}%</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Contact Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Phone:</strong> {candidate.phone}</div>
                                    <div><strong>Email:</strong> {candidate.email}</div>
                                    <div><strong>Location:</strong> {candidate.city?.name}, {candidate.cluster?.name}</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="notes">Interview Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Enter interview feedback and assessment..."
                                  value={technicalNotes}
                                  onChange={(e) => setTechnicalNotes(e.target.value)}
                                  rows={4}
                                />
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => handleTechnicalReject(candidate)}
                                  disabled={updateTechnicalMutation.isPending}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() => handleTechnicalSelect(candidate)}
                                  disabled={updateTechnicalMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Select
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
