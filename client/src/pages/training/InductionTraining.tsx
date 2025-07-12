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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate, TrainingSession } from "@/types";
import { CalendarIcon, Play, Users, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function InductionTraining() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: joinedCandidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "joined" }],
  });

  const { data: trainingSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["/api/training", { trainingType: "induction" }],
  });

  const createTrainingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/training", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "Success",
        description: "Induction training assigned successfully",
      });
      setSelectedCandidate(null);
      setStartDate(undefined);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign training",
        variant: "destructive",
      });
    },
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/training/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "Success",
        description: "Training session updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update training",
        variant: "destructive",
      });
    },
  });

  const handleAssignTraining = (candidate: Candidate) => {
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive",
      });
      return;
    }

    createTrainingMutation.mutate({
      candidateId: candidate.id,
      trainingType: "induction",
      startDate: startDate.toISOString(),
      duration: 1, // 1 day for induction
      status: "assigned",
      comments: notes,
    });
  };

  const handleStartTraining = (sessionId: number) => {
    updateTrainingMutation.mutate({
      id: sessionId,
      data: { status: "in_progress" },
    });
  };

  const handleCompleteTraining = (sessionId: number) => {
    updateTrainingMutation.mutate({
      id: sessionId,
      data: { status: "completed", endDate: new Date().toISOString() },
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'outline';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'default';
      case 'dropped_out':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Induction Training</h2>
        <p className="text-slate-600 mt-1">Manage onboarding and induction process for new joiners</p>
      </div>

      <div className="space-y-6">
        {/* New Joiners - Awaiting Induction */}
        <Card>
          <CardHeader>
            <CardTitle>New Joiners - Awaiting Induction</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCandidates ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : joinedCandidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No new joiners awaiting induction
                    </TableCell>
                  </TableRow>
                ) : (
                  joinedCandidates?.map((candidate: Candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.role?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.city?.name}</div>
                          <div className="text-slate-500">{candidate.cluster?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.dateOfJoining 
                          ? format(new Date(candidate.dateOfJoining), "PPP")
                          : "Not set"}
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
                                setStartDate(undefined);
                                setNotes("");
                              }}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Assign Induction
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Induction Training - {candidate.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Employee Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {candidate.name}</div>
                                    <div><strong>Role:</strong> {candidate.role?.name}</div>
                                    <div><strong>DOJ:</strong> {candidate.dateOfJoining 
                                      ? format(new Date(candidate.dateOfJoining), "PPP") 
                                      : "Not set"}</div>
                                    <div><strong>Salary:</strong> ₹{candidate.grossSalary ? Number(candidate.grossSalary).toLocaleString() : "Not set"}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Induction Details</h4>
                                  <div className="space-y-1 text-sm text-slate-600">
                                    <div>• HR orientation and company policies</div>
                                    <div>• Document collection and verification</div>
                                    <div>• System access setup</div>
                                    <div>• Welcome session</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label>Induction Start Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={startDate}
                                      onSelect={setStartDate}
                                      disabled={(date) =>
                                        date < new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>

                              <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Any specific instructions or requirements..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleAssignTraining(candidate)}
                                  disabled={!startDate || createTrainingMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {createTrainingMutation.isPending ? "Assigning..." : "Assign Induction"}
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

        {/* Induction Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Induction Training Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSessions ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : trainingSessions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No induction sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  trainingSessions?.map((session: TrainingSession) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.candidate?.name}
                      </TableCell>
                      <TableCell>{session.candidate?.role?.name}</TableCell>
                      <TableCell>
                        {session.startDate 
                          ? format(new Date(session.startDate), "PPP")
                          : "Not scheduled"}
                      </TableCell>
                      <TableCell>{session.duration} day(s)</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {session.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{
                                width: session.status === 'completed' ? '100%' : 
                                       session.status === 'in_progress' ? '50%' : '0%'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600">
                            {session.status === 'completed' ? '100%' : 
                             session.status === 'in_progress' ? '50%' : '0%'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {session.status === 'assigned' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartTraining(session.id)}
                              disabled={updateTrainingMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          )}
                          {session.status === 'in_progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteTraining(session.id)}
                              disabled={updateTrainingMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          )}
                          {session.status === 'completed' && (
                            <Badge variant="outline" className="text-green-600">
                              Completed
                            </Badge>
                          )}
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
    </div>
  );
}
