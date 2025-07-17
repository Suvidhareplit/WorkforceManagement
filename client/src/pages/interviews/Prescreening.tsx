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
import { CheckCircle, XCircle, Eye, FileText, Calendar, MapPin, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Prescreening() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState("");
  const [marks, setMarks] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { toast } = useToast();

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["/api/interviews/candidates"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: allClusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

  // Filter clusters based on selected city
  const clusters = allClusters?.filter((cluster: any) => {
    if (!cityFilter || cityFilter === "all") return true;
    const selectedCity = cities?.find((city: any) => city.name === cityFilter);
    return selectedCity && cluster.city_id === selectedCity.id;
  });

  const updatePrescreeningMutation = useMutation({
    mutationFn: async ({ id, marks, notes }: { id: number; marks: number; notes: string }) => {
      const benchmarkMet = marks >= 7;
      const status = benchmarkMet ? 'technical' : 'rejected';
      
      return await apiRequest("PATCH", `/api/interviews/candidates/${id}/screening`, {
        score: marks,
        benchmarkMet,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: "Prescreening completed successfully",
      });
      setSelectedCandidate(null);
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

  // Filter candidates to show only prescreening status and also those who were prescreened (both passed and failed)
  const filteredCandidates = candidates?.filter((candidate: any) => {
    const isPrescreeningOrScreened = candidate.status === 'prescreening' || 
      candidate.status === 'technical' || 
      (candidate.status === 'rejected' && candidate.screeningScore !== null);
    
    if (!isPrescreeningOrScreened) return false;
    if (cityFilter && cityFilter !== "all" && candidate.city !== cityFilter) return false;
    if (clusterFilter && clusterFilter !== "all" && candidate.cluster !== clusterFilter) return false;
    if (dateRange.from && new Date(candidate.createdAt) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(candidate.createdAt) > new Date(dateRange.to)) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Prescreening</h2>
        <p className="text-slate-600 mt-1">Review and verify candidate applications</p>
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
              <SelectItem value="all">All Cities</SelectItem>
              {cities?.map((city: any) => (
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
          <CardTitle>Prescreening Candidates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
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
              ) : !filteredCandidates || filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate: any) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-mono text-sm">{candidate.applicationId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.phone}</TableCell>
                    <TableCell>{candidate.city}</TableCell>
                    <TableCell>{candidate.cluster}</TableCell>
                    <TableCell>{candidate.role}</TableCell>
                    <TableCell>
                      {candidate.screeningScore !== null && candidate.screeningScore !== undefined ? (
                        <Badge 
                          variant={candidate.benchmarkMet ? 'default' : 'destructive'}
                          className={candidate.benchmarkMet ? 'bg-green-500' : ''}
                        >
                          {candidate.benchmarkMet ? 'Passed' : 'Failed'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {candidate.screeningScore ? (
                        <Badge variant={candidate.benchmarkMet ? 'default' : 'destructive'}>
                          {candidate.screeningScore}/10
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
                                setSelectedCandidate(candidate);
                                setNotes(candidate.prescreeningNotes || "");
                                setMarks(candidate.screeningScore ? candidate.screeningScore.toString() : "");
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
                                    <div><strong>Role:</strong> {candidate.role}</div>
                                    <div><strong>City:</strong> {candidate.city}</div>
                                    <div><strong>Cluster:</strong> {candidate.cluster}</div>
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
    </div>
  );
}
