import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TrainingSession } from "@/types";
import { HardHat, CheckCircle, XCircle, AlertTriangle, Mail, UserCheck } from "lucide-react";

export default function FieldTraining() {
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [managerId, setManagerId] = useState("");
  const [observationComments, setObservationComments] = useState("");
  const [fteStatus, setFteStatus] = useState("");
  const [fteComments, setFteComments] = useState("");
  const [dropoutReason, setDropoutReason] = useState("");
  const { toast } = useToast();

  const { data: fitCandidates, isLoading: loadingFit } = useQuery({
    queryKey: ["/api/training", { trainingType: "classroom", fitStatus: "fit" }],
  });

  const { data: fieldSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["/api/training", { trainingType: "field" }],
  });

  const { data: managers } = useQuery({
    queryKey: ["/api/users", { role: "manager" }],
  });

  const assignFieldTrainingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/training", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "Success",
        description: "Field training assigned and manager notified",
      });
      setSelectedSession(null);
      setManagerId("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign field training",
        variant: "destructive",
      });
    },
  });

  const updateFieldTrainingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/training/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "Success",
        description: "Field training status updated successfully",
      });
      setSelectedSession(null);
      setObservationComments("");
      setFteStatus("");
      setFteComments("");
      setDropoutReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update field training",
        variant: "destructive",
      });
    },
  });

  const confirmFTEMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/training/${id}/fte`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: "FTE status confirmed successfully",
      });
      setSelectedSession(null);
      setFteStatus("");
      setFteComments("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm FTE status",
        variant: "destructive",
      });
    },
  });

  const handleAssignFieldTraining = (classroomSession: TrainingSession) => {
    if (!managerId) {
      toast({
        title: "Error",
        description: "Please select a manager",
        variant: "destructive",
      });
      return;
    }

    assignFieldTrainingMutation.mutate({
      candidateId: classroomSession.candidateId,
      trainingType: "field",
      managerId: parseInt(managerId),
      status: "assigned",
      comments: "Candidate ready for field training after successful classroom completion",
    });
  };

  const handleUpdateFieldTraining = (session: TrainingSession) => {
    updateFieldTrainingMutation.mutate({
      id: session.id,
      data: {
        status: "in_progress",
        comments: observationComments,
      },
    });
  };

  const handleConfirmFTE = (session: TrainingSession) => {
    if (!fteStatus) {
      toast({
        title: "Error",
        description: "Please select FTE status",
        variant: "destructive",
      });
      return;
    }

    const updateData: any = {
      confirmed: fteStatus === "confirmed",
    };

    if (fteStatus === "not_confirmed") {
      updateData.dropoutReason = dropoutReason;
    }

    confirmFTEMutation.mutate({
      id: session.id,
      data: updateData,
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
        <h2 className="text-2xl font-bold text-slate-800">Field Training</h2>
        <p className="text-slate-600 mt-1">Manage field training assignments and FTE confirmations</p>
      </div>

      <div className="space-y-6">
        {/* Candidates Ready for Field Training */}
        <Card>
          <CardHeader>
            <CardTitle>Candidates Ready for Field Training</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Classroom Completed</TableHead>
                  <TableHead>Fitness Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingFit ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : fitCandidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No candidates ready for field training
                    </TableCell>
                  </TableRow>
                ) : (
                  fitCandidates?.map((session: TrainingSession) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.candidate?.name}
                      </TableCell>
                      <TableCell>{session.candidate?.role?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{session.candidate?.city?.name}</div>
                          <div className="text-slate-500">{session.candidate?.cluster?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.endDate 
                          ? format(new Date(session.endDate), "PPP")
                          : "In progress"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {session.fitStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session);
                                setManagerId("");
                              }}
                            >
                              <HardHat className="h-4 w-4 mr-2" />
                              Assign Field Training
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Field Training - {session.candidate?.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Employee Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {session.candidate?.name}</div>
                                    <div><strong>Role:</strong> {session.candidate?.role?.name}</div>
                                    <div><strong>Location:</strong> {session.candidate?.city?.name}, {session.candidate?.cluster?.name}</div>
                                    <div><strong>Phone:</strong> {session.candidate?.phone}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Training Progress</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Classroom:</strong> Completed</div>
                                    <div><strong>Fitness Status:</strong> {session.fitStatus}</div>
                                    <div><strong>Comments:</strong> {session.comments || "No comments"}</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label>Assign Manager</Label>
                                <Select value={managerId} onValueChange={setManagerId}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select operations manager" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {managers?.map((manager: any) => (
                                      <SelectItem key={manager.id} value={manager.id.toString()}>
                                        {manager.firstName} {manager.lastName} ({manager.username})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Notification Process
                                </h4>
                                <p className="text-sm text-blue-800">
                                  The selected manager will receive an email notification about the field training assignment 
                                  and can begin the observation and evaluation process.
                                </p>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleAssignFieldTraining(session)}
                                  disabled={!managerId || assignFieldTrainingMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {assignFieldTrainingMutation.isPending ? "Assigning..." : "Assign & Notify"}
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

        {/* Field Training Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Field Training Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>FTE Status</TableHead>
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
                ) : fieldSessions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No field training sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  fieldSessions?.map((session: TrainingSession) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.candidate?.name}
                      </TableCell>
                      <TableCell>{session.candidate?.role?.name}</TableCell>
                      <TableCell>
                        {session.manager ? 
                          `${session.manager.firstName} ${session.manager.lastName}` : 
                          "Not assigned"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {session.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {session.fteConfirmed ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Confirmed
                          </Badge>
                        ) : session.status === 'completed' ? (
                          <Badge variant="outline" className="text-amber-600">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Not applicable
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{
                                width: session.fteConfirmed ? '100%' :
                                       session.status === 'completed' ? '80%' : 
                                       session.status === 'in_progress' ? '50%' : 
                                       session.status === 'dropped_out' ? '25%' : '10%'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600">
                            {session.fteConfirmed ? '100%' :
                             session.status === 'completed' ? '80%' : 
                             session.status === 'in_progress' ? '50%' : 
                             session.status === 'dropped_out' ? '25%' : '10%'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {session.status === 'assigned' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setObservationComments("");
                                  }}
                                >
                                  <HardHat className="h-4 w-4 mr-2" />
                                  Start
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Start Field Training - {session.candidate?.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Training Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Employee:</strong> {session.candidate?.name}</div>
                                      <div><strong>Role:</strong> {session.candidate?.role?.name}</div>
                                      <div><strong>Manager:</strong> {session.manager?.firstName} {session.manager?.lastName}</div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="comments">Initial Observation Comments</Label>
                                    <Textarea
                                      id="comments"
                                      placeholder="Initial observations and training plan..."
                                      value={observationComments}
                                      onChange={(e) => setObservationComments(e.target.value)}
                                      rows={4}
                                    />
                                  </div>

                                  <div className="flex justify-end">
                                    <Button
                                      onClick={() => handleUpdateFieldTraining(session)}
                                      disabled={updateFieldTrainingMutation.isPending}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      {updateFieldTrainingMutation.isPending ? "Starting..." : "Start Training"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {session.status === 'completed' && !session.fteConfirmed && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setFteStatus("");
                                    setFteComments("");
                                    setDropoutReason("");
                                  }}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  FTE Decision
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>FTE Confirmation - {session.candidate?.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Training Summary</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><strong>Employee:</strong> {session.candidate?.name}</div>
                                        <div><strong>Role:</strong> {session.candidate?.role?.name}</div>
                                        <div><strong>Manager:</strong> {session.manager?.firstName} {session.manager?.lastName}</div>
                                        <div><strong>Duration:</strong> {session.duration || "Ongoing"}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Observation Comments</h4>
                                      <p className="text-sm text-slate-600">
                                        {session.comments || "No comments available"}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>FTE Confirmation</Label>
                                    <Select value={fteStatus} onValueChange={setFteStatus}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select FTE status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="confirmed">Confirm FTE</SelectItem>
                                        <SelectItem value="not_confirmed">Do Not Confirm</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="fteComments">FTE Decision Comments</Label>
                                    <Textarea
                                      id="fteComments"
                                      placeholder="Detailed assessment and reasoning for FTE decision..."
                                      value={fteComments}
                                      onChange={(e) => setFteComments(e.target.value)}
                                      rows={4}
                                    />
                                  </div>

                                  {fteStatus === "not_confirmed" && (
                                    <div>
                                      <Label htmlFor="dropout">Reason for Not Confirming FTE</Label>
                                      <Textarea
                                        id="dropout"
                                        placeholder="Specific reasons for not confirming full-time employment..."
                                        value={dropoutReason}
                                        onChange={(e) => setDropoutReason(e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                  )}

                                  <div className="bg-amber-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Important
                                    </h4>
                                    <p className="text-sm text-amber-800">
                                      {fteStatus === "confirmed" 
                                        ? "Confirming FTE will move the candidate to the HR Ops for final onboarding and employee record creation."
                                        : "Not confirming FTE will end the training process and record the dropout reason."}
                                    </p>
                                  </div>

                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedSession(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleConfirmFTE(session)}
                                      disabled={!fteStatus || confirmFTEMutation.isPending}
                                      className={fteStatus === "confirmed" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                                    >
                                      {confirmFTEMutation.isPending ? "Updating..." : "Confirm Decision"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {session.fteConfirmed && (
                            <Badge variant="outline" className="text-green-600">
                              FTE Confirmed
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
