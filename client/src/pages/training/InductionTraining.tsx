import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function InductionTraining() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  // Fetch induction training records
  const { data: inductionsResponse, isLoading } = useQuery({
    queryKey: ["/api/training/induction"],
  });

  const inductions = (inductionsResponse as any) || [];

  // Fetch trainers for dropdown
  const { data: trainersResponse } = useQuery({
    queryKey: ["/api/master-data/trainer"],
  });

  const trainers = (trainersResponse as any) || [];

  // Update induction mutation
  const updateInductionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/training/induction/${id}`, {
        method: "PATCH",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/induction"] });
      toast({
        title: "Success",
        description: "Induction record updated successfully",
      });
      setEditingId(null);
      setEditData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update induction",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (induction: any) => {
    setEditingId(induction.id);
    setEditData({
      joining_status: induction.joining_status,
      manager_name: induction.manager_name,
      induction_done_by: induction.induction_done_by,
      onboarding_form_filled: induction.onboarding_form_filled,
      uan_number_generated: induction.uan_number_generated,
      induction_status: induction.induction_status,
    });
  };

  const handleSave = (id: number) => {
    updateInductionMutation.mutate({ id, data: editData });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Induction Training</h2>
        <p className="text-slate-600 mt-1">Manage onboarding and induction process for candidates assigned to induction</p>
      </div>

      {/* Induction Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Induction Training Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Joining Status</TableHead>
                  <TableHead>Manager Name</TableHead>
                  <TableHead>Induction Done By</TableHead>
                  <TableHead>Onboarding Form</TableHead>
                  <TableHead>UAN Generated</TableHead>
                  <TableHead>Induction Status</TableHead>
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
                ) : inductions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8">
                      No induction records found
                    </TableCell>
                  </TableRow>
                ) : (
                  inductions.map((induction: any) => (
                    <TableRow key={induction.id}>
                      <TableCell className="font-medium">{induction.name}</TableCell>
                      <TableCell>{induction.mobile_number}</TableCell>
                      <TableCell>{induction.city}</TableCell>
                      <TableCell>{induction.cluster}</TableCell>
                      <TableCell>{induction.role}</TableCell>
                      <TableCell>
                        {induction.date_of_joining 
                          ? format(new Date(induction.date_of_joining), "dd-MMM-yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>₹{induction.gross_salary ? Number(induction.gross_salary).toLocaleString() : "-"}</TableCell>
                      
                      {/* Joining Status */}
                      <TableCell>
                        {editingId === induction.id ? (
                          <Select
                            value={editData.joining_status || induction.joining_status}
                            onValueChange={(value) => setEditData({...editData, joining_status: value})}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="joined">Joined</SelectItem>
                              <SelectItem value="not_joined">Not Joined</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={induction.joining_status === 'joined' ? 'default' : 'outline'}>
                            {induction.joining_status || 'pending'}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Manager Name */}
                      <TableCell>
                        {editingId === induction.id ? (
                          <Input
                            value={editData.manager_name || induction.manager_name || ''}
                            onChange={(e) => setEditData({...editData, manager_name: e.target.value})}
                            className="w-[150px]"
                          />
                        ) : (
                          induction.manager_name || '-'
                        )}
                      </TableCell>

                      {/* Induction Done By */}
                      <TableCell>
                        {editingId === induction.id ? (
                          <Select
                            value={editData.induction_done_by?.toString() || induction.induction_done_by?.toString() || ''}
                            onValueChange={(value) => setEditData({...editData, induction_done_by: parseInt(value)})}
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
                          trainers.find((t: any) => t.id === induction.induction_done_by)?.name || '-'
                        )}
                      </TableCell>

                      {/* Onboarding Form Filled */}
                      <TableCell>
                        {editingId === induction.id ? (
                          <Select
                            value={editData.onboarding_form_filled || induction.onboarding_form_filled}
                            onValueChange={(value) => setEditData({...editData, onboarding_form_filled: value})}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="ytb">YTB</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{induction.onboarding_form_filled || 'ytb'}</Badge>
                        )}
                      </TableCell>

                      {/* UAN Number Generated */}
                      <TableCell>
                        {editingId === induction.id ? (
                          <Select
                            value={editData.uan_number_generated || induction.uan_number_generated}
                            onValueChange={(value) => setEditData({...editData, uan_number_generated: value})}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="ytb">YTB</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{induction.uan_number_generated || 'ytb'}</Badge>
                        )}
                      </TableCell>

                      {/* Induction Status */}
                      <TableCell>
                        {editingId === induction.id ? (
                          <Select
                            value={editData.induction_status || induction.induction_status}
                            onValueChange={(value) => setEditData({...editData, induction_status: value})}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="ytb_completed">YTB Completed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge 
                            variant={induction.induction_status === 'completed' ? 'default' : 'outline'}
                            className={induction.induction_status === 'completed' ? 'bg-green-600' : ''}
                          >
                            {induction.induction_status || 'in_progress'}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        {editingId === induction.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(induction.id)}
                              disabled={updateInductionMutation.isPending}
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
                            onClick={() => handleEdit(induction)}
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
