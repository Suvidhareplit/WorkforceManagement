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
  const [tempStartDate, setTempStartDate] = useState<Date>();
  const [tempEndDate, setTempEndDate] = useState<Date>();
  const { toast } = useToast();

  // Fetch classroom training records
  const { data: classroomResponse, isLoading } = useQuery({
    queryKey: ["/api/training/classroom"],
  });

  const classrooms = classroomResponse?.data || [];

  // Fetch trainers for dropdown
  const { data: trainersResponse } = useQuery({
    queryKey: ["/api/master-data/trainer"],
  });

  const trainers = trainersResponse?.data || [];

  // Update classroom training mutation
  const updateClassroomMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/training/classroom/${id}`, {
        method: "PATCH",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/classroom"] });
      toast({
        title: "Success",
        description: "Classroom training updated successfully",
      });
      setEditingId(null);
      setEditData({});
      setTempStartDate(undefined);
      setTempEndDate(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update classroom training",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (classroom: any) => {
    setEditingId(classroom.id);
    setEditData({
      training_start_date: classroom.training_start_date,
      training_completion_date: classroom.training_completion_date,
      trainer_id: classroom.trainer_id,
      crt_feedback: classroom.crt_feedback,
      remarks: classroom.remarks,
      last_working_day: classroom.last_working_day,
      exit_date: classroom.exit_date,
      exit_reason: classroom.exit_reason,
    });
    if (classroom.training_start_date) {
      setTempStartDate(new Date(classroom.training_start_date));
    }
    if (classroom.training_completion_date) {
      setTempEndDate(new Date(classroom.training_completion_date));
    }
  };

  const handleSave = (id: number) => {
    const dataToSend = { ...editData };
    if (tempStartDate) {
      dataToSend.training_start_date = format(tempStartDate, "yyyy-MM-dd");
    }
    if (tempEndDate) {
      dataToSend.training_completion_date = format(tempEndDate, "yyyy-MM-dd");
    }
    updateClassroomMutation.mutate({ id, data: dataToSend });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setTempStartDate(undefined);
    setTempEndDate(undefined);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Classroom Training (CRT)</h2>
        <p className="text-slate-600 mt-1">Manage classroom training for candidates who completed induction</p>
      </div>

      {/* Classroom Training Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classroom Training Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Training Start</TableHead>
                  <TableHead>Training End</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>CRT Feedback</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Last Working Day</TableHead>
                  <TableHead>Exit Date</TableHead>
                  <TableHead>Exit Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : classrooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8">
                      No classroom training records found
                    </TableCell>
                  </TableRow>
                ) : (
                  classrooms.map((classroom: any) => (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">{classroom.name}</TableCell>
                      <TableCell>{classroom.mobile_number}</TableCell>
                      <TableCell>{classroom.city}</TableCell>
                      <TableCell>{classroom.role}</TableCell>
                      <TableCell>{classroom.manager_name || '-'}</TableCell>
                      
                      {/* Training Start Date */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn("w-[140px] justify-start text-left font-normal", !tempStartDate && "text-muted-foreground")}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {tempStartDate ? format(tempStartDate, "dd-MMM-yyyy") : "Pick date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={tempStartDate} onSelect={setTempStartDate} />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          classroom.training_start_date ? format(new Date(classroom.training_start_date), "dd-MMM-yyyy") : "-"
                        )}
                      </TableCell>

                      {/* Training End Date */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn("w-[140px] justify-start text-left font-normal", !tempEndDate && "text-muted-foreground")}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {tempEndDate ? format(tempEndDate, "dd-MMM-yyyy") : "Pick date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={tempEndDate} onSelect={setTempEndDate} />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          classroom.training_completion_date ? format(new Date(classroom.training_completion_date), "dd-MMM-yyyy") : "-"
                        )}
                      </TableCell>

                      {/* Trainer */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Select
                            value={editData.trainer_id?.toString() || classroom.trainer_id?.toString() || ''}
                            onValueChange={(value) => setEditData({...editData, trainer_id: parseInt(value)})}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Select Trainer" />
                            </SelectTrigger>
                            <SelectContent>
                              {trainers.map((trainer: any) => (
                                <SelectItem key={trainer.id} value={trainer.id.toString()}>
                                  {trainer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          trainers.find((t: any) => t.id === classroom.trainer_id)?.name || '-'
                        )}
                      </TableCell>

                      {/* CRT Feedback */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Select
                            value={editData.crt_feedback || classroom.crt_feedback || ''}
                            onValueChange={(value) => setEditData({...editData, crt_feedback: value})}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select Feedback" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fit">Fit</SelectItem>
                              <SelectItem value="not_fit_crt_rejection">Not Fit - CRT Rejection</SelectItem>
                              <SelectItem value="early_exit">Early Exit</SelectItem>
                              <SelectItem value="fit_need_observation">Fit - Need Observation</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          classroom.crt_feedback ? (
                            <Badge variant={classroom.crt_feedback === 'fit' || classroom.crt_feedback === 'fit_need_observation' ? 'default' : 'destructive'}>
                              {classroom.crt_feedback.replace(/_/g, ' ')}
                            </Badge>
                          ) : '-'
                        )}
                      </TableCell>

                      {/* Remarks */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Textarea
                            value={editData.remarks || classroom.remarks || ''}
                            onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                            className="w-[200px]"
                            rows={2}
                          />
                        ) : (
                          classroom.remarks || '-'
                        )}
                      </TableCell>

                      {/* Last Working Day */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Input
                            type="date"
                            value={editData.last_working_day || classroom.last_working_day || ''}
                            onChange={(e) => setEditData({...editData, last_working_day: e.target.value})}
                            className="w-[150px]"
                          />
                        ) : (
                          classroom.last_working_day ? format(new Date(classroom.last_working_day), "dd-MMM-yyyy") : "-"
                        )}
                      </TableCell>

                      {/* Exit Date */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Input
                            type="date"
                            value={editData.exit_date || classroom.exit_date || ''}
                            onChange={(e) => setEditData({...editData, exit_date: e.target.value})}
                            className="w-[150px]"
                          />
                        ) : (
                          classroom.exit_date ? format(new Date(classroom.exit_date), "dd-MMM-yyyy") : "-"
                        )}
                      </TableCell>

                      {/* Exit Reason */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <Select
                            value={editData.exit_reason || classroom.exit_reason || ''}
                            onValueChange={(value) => setEditData({...editData, exit_reason: value})}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Select Reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="crt_absconding">CRT Absconding</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          classroom.exit_reason || '-'
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        {editingId === classroom.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(classroom.id)}
                              disabled={updateClassroomMutation.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(classroom)}
                          >
                            <Edit className="h-4 w-4" />
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
