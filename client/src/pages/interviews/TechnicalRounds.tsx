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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@/types";

export default function TechnicalRounds() {
  const [technicalStatus, setTechnicalStatus] = useState("");
  const [technicalNotes, setTechnicalNotes] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { toast } = useToast();

  const { data: allCandidates, isLoading } = useQuery({
    queryKey: ["/api/interviews/candidates"],
  });

  // Filter only candidates who passed prescreening (benchmarkMet = true or 1)
  const candidates = (allCandidates as any[])?.filter((candidate: any) => 
    candidate.status === 'technical' && (candidate.benchmarkMet === true || candidate.benchmarkMet === 1)
  );

  const { data: cities } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: "Technical round result updated successfully",
      });
      setTechnicalStatus("");
      setTechnicalNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update technical round result",
        variant: "destructive",
      });
    },
  });

  const handleSubmitTechnical = (candidate: Candidate) => {
    if (!technicalStatus) {
      toast({
        title: "Invalid selection",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }
    
    updateTechnicalMutation.mutate({
      id: candidate.id,
      status: technicalStatus,
      notes: technicalNotes,
    });
  };

  const filteredCandidates = candidates?.filter((candidate: any) => {
    if (cityFilter && candidate.city !== cityFilter) return false;
    if (clusterFilter && candidate.cluster !== clusterFilter) return false;
    if (dateRange.from && new Date(candidate.createdAt) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(candidate.createdAt) > new Date(dateRange.to)) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Technical Rounds</h2>
        <p className="text-slate-600 mt-1">Evaluate candidates technical skills</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="cityFilter">City</Label>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger id="cityFilter">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {(cities as any[])?.map((city: any) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="clusterFilter">Cluster</Label>
          <Select value={clusterFilter} onValueChange={setClusterFilter}>
            <SelectTrigger id="clusterFilter">
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Clusters</SelectItem>
              {(clusters as any[])?.map((cluster: any) => (
                <SelectItem key={cluster.id} value={cluster.name}>
                  {cluster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="dateFrom">Date From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="dateTo">Date To</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates for Technical Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Application ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                <TableHead className="font-semibold text-slate-700">City</TableHead>
                <TableHead className="font-semibold text-slate-700">Cluster</TableHead>
                <TableHead className="font-semibold text-slate-700">Role</TableHead>
                <TableHead className="font-semibold text-slate-700">Prescreening Score</TableHead>
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
              ) : !filteredCandidates || filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No candidates for technical rounds
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate: any) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-mono text-sm text-slate-600">{candidate.applicationId || 'N/A'}</TableCell>
                    <TableCell className="font-medium text-slate-900">{candidate.name}</TableCell>
                    <TableCell className="text-slate-700">{candidate.phone}</TableCell>
                    <TableCell className="text-slate-700">{candidate.cityName}</TableCell>
                    <TableCell className="text-slate-700">{candidate.clusterName}</TableCell>
                    <TableCell className="text-slate-700">{candidate.roleName}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">
                        {candidate.screeningScore || 0}/10
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTechnicalStatus("");
                              setTechnicalNotes("");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Technical Evaluation - {candidate.name}</DialogTitle>
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
                                  <div><strong>Prescreening Score:</strong> 
                                    <Badge variant="default" className="ml-2 bg-green-600">
                                      {candidate.screeningScore}/10 - Passed
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {candidate.prescreeningNotes && (
                              <div className="bg-gray-50 p-3 rounded">
                                <h4 className="font-medium mb-1">Prescreening Notes</h4>
                                <p className="text-sm text-gray-700">{candidate.prescreeningNotes}</p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Technical Round Decision</h4>
                              <div className="mb-4">
                                <Label htmlFor="status">Status</Label>
                                <Select value={technicalStatus} onValueChange={setTechnicalStatus}>
                                  <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="selected">Selected</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add technical evaluation notes..."
                                  value={technicalNotes}
                                  onChange={(e) => setTechnicalNotes(e.target.value)}
                                  rows={4}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleSubmitTechnical(candidate)}
                                disabled={updateTechnicalMutation.isPending || !technicalStatus}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {updateTechnicalMutation.isPending ? "Submitting..." : "Submit Result"}
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
  );
}