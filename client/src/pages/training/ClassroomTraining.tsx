import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Save, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ClassroomTraining() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  const { data: completedInduction, isLoading: loadingInduction } = useQuery({
    queryKey: ["/api/training", { trainingType: "induction", status: "completed" }],
  });

  const { data: classroomSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["/api/training", { trainingType: "classroom" }],
  });

  const createClassroomTrainingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest3("POST", "/api/training", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "Success",
        description: "Classroom training assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign classroom training",
        variant: "destructive",
      });
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: number; data: any }) => {
      return await apiRequest3("POST", `/api/training/${sessionId}/attendance`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
      setAttendanceDate(undefined);
      setIsPresent(false);
      setAttendanceNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    },
  });

  const updateFitnessMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest3("PATCH", `/api/training/${id}/fitness`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "Success",
        description: "Fitness status updated successfully",
      });
      setSelectedSession(null);
      setFitnessStatus("");
      setFitnessComments("");
      setDropoutReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update fitness status",
        variant: "destructive",
      });
    },
  });

  const assignClassroomTraining = (candidateId: number) => {
    const startDate = new Date();
    const endDate = addDays(startDate, 8); // 8 days including weekends

    createClassroomTrainingMutation.mutate({
      candidateId,
      trainingType: "classroom",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: 8,
      status: "assigned",
    });
  };

  const handleMarkAttendance = (session: TrainingSession) => {
    if (!attendanceDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    markAttendanceMutation.mutate({
      sessionId: session.id,
      data: {
        date: attendanceDate.toISOString(),
        present: isPresent,
        notes: attendanceNotes,
      },
    });
  };

  const handleFitnessUpdate = (session: TrainingSession) => {
    if (!fitnessStatus) {
      toast({
        title: "Error",
        description: "Please select fitness status",
        variant: "destructive",
      });
      return;
    }

    const updateData: any = {
      fitStatus: fitnessStatus,
      comments: fitnessComments,
    };

    if (fitnessStatus === "not_fit") {
      updateData.dropoutReason = dropoutReason;
    }

    updateFitnessMutation.mutate({
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
        <h2 className="text-2xl font-bold text-slate-800">Classroom Training</h2>
        <p className="text-slate-600 mt-1">Manage 8-day classroom training sessions with L&D team</p>
      </div>

      <div className="space-y-6">
        {/* Candidates Ready for Classroom Training */}
        <Card>
          <CardHeader>
            <CardTitle>Candidates Ready for Classroom Training</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Induction Completed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingInduction ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (completedInduction as any[])?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No candidates ready for classroom training
                    </TableCell>
                  </TableRow>
                ) : (
                  (completedInduction as any[])?.map((session: TrainingSession) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => assignClassroomTraining(session.candidateId)}
                          disabled={createClassroomTrainingMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Assign Training
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Classroom Training Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Classroom Training Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Training Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
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
                ) : (classroomSessions as any[])?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No classroom training sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  (classroomSessions as any[])?.map((session: TrainingSession) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.candidate?.name}
                      </TableCell>
                      <TableCell>{session.candidate?.role?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {session.startDate && (
                            <div>Start: {format(new Date(session.startDate), "PP")}</div>
                          )}
                          {session.endDate && (
                            <div>End: {format(new Date(session.endDate), "PP")}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {session.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {session.attendanceMarked ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-600" />
                          )}
                          <span className="text-sm">
                            {session.attendanceMarked ? "Marked" : "Pending"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{
                                width: session.status === 'completed' ? '100%' : 
                                       session.status === 'in_progress' ? '60%' : 
                                       session.status === 'dropped_out' ? '30%' : '10%'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600">
                            {session.status === 'completed' ? '100%' : 
                             session.status === 'in_progress' ? '60%' : 
                             session.status === 'dropped_out' ? '30%' : '10%'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSession(session);
                                  setAttendanceDate(undefined);
                                  setIsPresent(false);
                                  setAttendanceNotes("");
                                }}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Attendance
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mark Attendance - {session.candidate?.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Training Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Employee:</strong> {session.candidate?.name}</div>
                                      <div><strong>Role:</strong> {session.candidate?.role?.name}</div>
                                      <div><strong>Duration:</strong> {session.duration} days</div>
                                      <div><strong>Status:</strong> {session.status}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Training Period</h4>
                                    <div className="space-y-1 text-sm">
                                      {session.startDate && (
                                        <div><strong>Start:</strong> {format(new Date(session.startDate), "PPP")}</div>
                                      )}
                                      {session.endDate && (
                                        <div><strong>End:</strong> {format(new Date(session.endDate), "PPP")}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label>Attendance Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !attendanceDate && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {attendanceDate ? format(attendanceDate, "PPP") : "Pick a date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={attendanceDate}
                                        onSelect={setAttendanceDate}
                                        disabled={(date) =>
                                          date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="present"
                                    checked={isPresent}
                                    onCheckedChange={(checked) => setIsPresent(checked as boolean)}
                                  />
                                  <Label htmlFor="present">Present</Label>
                                </div>

                                <div>
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Any additional notes about attendance..."
                                    value={attendanceNotes}
                                    onChange={(e) => setAttendanceNotes(e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => handleMarkAttendance(session)}
                                    disabled={!attendanceDate || markAttendanceMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {markAttendanceMutation.isPending ? "Marking..." : "Mark Attendance"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSession(session);
                                  setFitnessStatus("");
                                  setFitnessComments("");
                                  setDropoutReason("");
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Fitness
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mark Fitness Status - {session.candidate?.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Training Summary</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Employee:</strong> {session.candidate?.name}</div>
                                      <div><strong>Role:</strong> {session.candidate?.role?.name}</div>
                                      <div><strong>Duration:</strong> {session.duration} days</div>
                                      <div><strong>Attendance:</strong> {session.attendanceMarked ? "Marked" : "Pending"}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Current Status</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Status:</strong> {session.status}</div>
                                      {session.fitStatus && (
                                        <div><strong>Previous Fitness:</strong> {session.fitStatus}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label>Fitness Status</Label>
                                  <Select value={fitnessStatus} onValueChange={setFitnessStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select fitness status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="fit">Fit for Field Training</SelectItem>
                                      <SelectItem value="not_fit">Not Fit</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="comments">Assessment Comments</Label>
                                  <Textarea
                                    id="comments"
                                    placeholder="Detailed assessment and feedback..."
                                    value={fitnessComments}
                                    onChange={(e) => setFitnessComments(e.target.value)}
                                    rows={4}
                                  />
                                </div>

                                {fitnessStatus === "not_fit" && (
                                  <div>
                                    <Label htmlFor="dropout">Dropout Reason</Label>
                                    <Textarea
                                      id="dropout"
                                      placeholder="Reason for not being fit for field training..."
                                      value={dropoutReason}
                                      onChange={(e) => setDropoutReason(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                )}

                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                                  <p className="text-sm text-blue-800">
                                    {fitnessStatus === "fit" 
                                      ? "Marking as fit will notify the operations manager for field training assignment."
                                      : "Marking as not fit will record the dropout and end the training process."}
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
                                    onClick={() => handleFitnessUpdate(session)}
                                    disabled={!fitnessStatus || updateFitnessMutation.isPending}
                                    className={fitnessStatus === "fit" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                                  >
                                    {updateFitnessMutation.isPending ? "Updating..." : "Update Status"}
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
    </div>
  );
}
