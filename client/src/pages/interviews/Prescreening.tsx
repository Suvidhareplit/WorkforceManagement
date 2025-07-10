import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@/types";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";

export default function Prescreening() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "applied" }],
  });

  const updatePrescreeningMutation = useMutation({
    mutationFn: async ({ id, approved, notes }: { id: number; approved: boolean; notes: string }) => {
      return await apiRequest("PATCH", `/api/interviews/candidates/${id}/prescreening`, {
        approved,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: "Prescreening status updated successfully",
      });
      setSelectedCandidate(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update prescreening status",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (candidate: Candidate) => {
    updatePrescreeningMutation.mutate({
      id: candidate.id,
      approved: true,
      notes,
    });
  };

  const handleReject = (candidate: Candidate) => {
    updatePrescreeningMutation.mutate({
      id: candidate.id,
      approved: false,
      notes,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Prescreening</h2>
        <p className="text-slate-600 mt-1">Review and verify candidate applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates Awaiting Prescreening</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Applied Date</TableHead>
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
              ) : candidates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No candidates awaiting prescreening
                  </TableCell>
                </TableRow>
              ) : (
                candidates?.map((candidate: Candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.phone}</TableCell>
                    <TableCell>{candidate.email || "Not provided"}</TableCell>
                    <TableCell>{candidate.role?.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{candidate.city?.name}</div>
                        <div className="text-slate-500">{candidate.cluster?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="capitalize">{candidate.resumeSource?.replace('_', ' ')}</div>
                        {candidate.vendor && (
                          <div className="text-slate-500">{candidate.vendor.name}</div>
                        )}
                        {candidate.recruiter && (
                          <div className="text-slate-500">{candidate.recruiter.name}</div>
                        )}
                        {candidate.referralName && (
                          <div className="text-slate-500">{candidate.referralName}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{candidate.qualification || "Not specified"}</TableCell>
                    <TableCell>
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setNotes("");
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
                                    <div><strong>Role:</strong> {candidate.role?.name}</div>
                                    <div><strong>City:</strong> {candidate.city?.name}</div>
                                    <div><strong>Cluster:</strong> {candidate.cluster?.name}</div>
                                    <div><strong>Source:</strong> {candidate.resumeSource?.replace('_', ' ')}</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Prescreening Notes</h4>
                                <Textarea
                                  placeholder="Add your notes about the candidate verification..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  rows={4}
                                />
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => handleReject(candidate)}
                                  disabled={updatePrescreeningMutation.isPending}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() => handleApprove(candidate)}
                                  disabled={updatePrescreeningMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
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
    </div>
  );
}
