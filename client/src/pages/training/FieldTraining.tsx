import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function FieldTraining() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  // Fetch field training records
  const { data: fieldResponse, isLoading } = useQuery({
    queryKey: ["/api/training/field"],
  });

  const fields = fieldResponse?.data || [];

  // Update field training mutation
  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/training/field/${id}`, {
        method: "PATCH",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/field"] });
      toast({
        title: "Success",
        description: "Field training updated successfully",
      });
      setEditingId(null);
      setEditData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update field training",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (field: any) => {
    setEditingId(field.id);
    setEditData({
      buddy_aligned: field.buddy_aligned,
      buddy_name: field.buddy_name,
      buddy_phone_number: field.buddy_phone_number,
      manager_feedback: field.manager_feedback,
      ft_feedback: field.ft_feedback,
      rejection_reason: field.rejection_reason,
      absconding: field.absconding,
      last_reporting_date: field.last_reporting_date,
    });
  };

  const handleSave = (id: number) => {
    updateFieldMutation.mutate({ id, data: editData });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Field Training (FT)</h2>
        <p className="text-slate-600 mt-1">Manage field training for candidates who completed classroom training</p>
      </div>

      {/* Field Training Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Field Training Records</CardTitle>
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
                  <TableHead>Training Dates</TableHead>
                  <TableHead>Buddy Aligned</TableHead>
                  <TableHead>Buddy Name</TableHead>
                  <TableHead>Buddy Phone</TableHead>
                  <TableHead>Manager Feedback</TableHead>
                  <TableHead>FT Feedback</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Absconding</TableHead>
                  <TableHead>Last Reporting Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8">
                      No field training records found
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field: any) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.name}</TableCell>
                      <TableCell>{field.mobile_number}</TableCell>
                      <TableCell>{field.city}</TableCell>
                      <TableCell>{field.role}</TableCell>
                      <TableCell>{field.manager_name || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {field.training_start_date && <div>Start: {format(new Date(field.training_start_date), "dd-MMM-yyyy")}</div>}
                          {field.training_completion_date && <div>End: {format(new Date(field.training_completion_date), "dd-MMM-yyyy")}</div>}
                        </div>
                      </TableCell>
                      
                      {/* Buddy Aligned */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Select
                            value={editData.buddy_aligned || field.buddy_aligned}
                            onValueChange={(value) => setEditData({...editData, buddy_aligned: value})}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={field.buddy_aligned === 'yes' ? 'default' : 'outline'}>
                            {field.buddy_aligned || 'no'}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Buddy Name */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Input
                            value={editData.buddy_name || field.buddy_name || ''}
                            onChange={(e) => setEditData({...editData, buddy_name: e.target.value})}
                            className="w-[150px]"
                          />
                        ) : (
                          field.buddy_name || '-'
                        )}
                      </TableCell>

                      {/* Buddy Phone */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Input
                            value={editData.buddy_phone_number || field.buddy_phone_number || ''}
                            onChange={(e) => setEditData({...editData, buddy_phone_number: e.target.value})}
                            className="w-[130px]"
                          />
                        ) : (
                          field.buddy_phone_number || '-'
                        )}
                      </TableCell>

                      {/* Manager Feedback */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Textarea
                            value={editData.manager_feedback || field.manager_feedback || ''}
                            onChange={(e) => setEditData({...editData, manager_feedback: e.target.value})}
                            className="w-[200px]"
                            rows={2}
                          />
                        ) : (
                          field.manager_feedback || '-'
                        )}
                      </TableCell>

                      {/* FT Feedback */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Select
                            value={editData.ft_feedback || field.ft_feedback || ''}
                            onValueChange={(value) => setEditData({...editData, ft_feedback: value})}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select Feedback" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fit">Fit</SelectItem>
                              <SelectItem value="not_fit_ft_rejection">Not Fit - FT Rejection</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          field.ft_feedback ? (
                            <Badge variant={field.ft_feedback === 'fit' ? 'default' : 'destructive'}>
                              {field.ft_feedback.replace(/_/g, ' ')}
                            </Badge>
                          ) : '-'
                        )}
                      </TableCell>

                      {/* Rejection Reason */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Textarea
                            value={editData.rejection_reason || field.rejection_reason || ''}
                            onChange={(e) => setEditData({...editData, rejection_reason: e.target.value})}
                            className="w-[200px]"
                            rows={2}
                          />
                        ) : (
                          field.rejection_reason || '-'
                        )}
                      </TableCell>

                      {/* Absconding */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Select
                            value={editData.absconding || field.absconding}
                            onValueChange={(value) => setEditData({...editData, absconding: value})}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={field.absconding === 'yes' ? 'destructive' : 'outline'}>
                            {field.absconding || 'no'}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Last Reporting Date */}
                      <TableCell>
                        {editingId === field.id ? (
                          <Input
                            type="date"
                            value={editData.last_reporting_date || field.last_reporting_date || ''}
                            onChange={(e) => setEditData({...editData, last_reporting_date: e.target.value})}
                            className="w-[150px]"
                          />
                        ) : (
                          field.last_reporting_date ? format(new Date(field.last_reporting_date), "dd-MMM-yyyy") : "-"
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        {editingId === field.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(field.id)}
                              disabled={updateFieldMutation.isPending}
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
                            onClick={() => handleEdit(field)}
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
