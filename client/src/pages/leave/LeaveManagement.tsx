import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar, Settings, FileText, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LeaveManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonModalData, setReasonModalData] = useState<any>(null);
  const [changeReason, setChangeReason] = useState("");

  // Load leave configs
  const { data: configs = [], isLoading: configsLoading } = useQuery({
    queryKey: ["/api/leave/config"],
    queryFn: async () => {
      const res = await apiRequest("/api/leave/config");
      return res.configs || [];
    },
  });

  // Load RH allocations
  const { data: rhAllocations = [] } = useQuery({
    queryKey: ["/api/leave/rh-allocation"],
    queryFn: async () => {
      const res = await apiRequest("/api/leave/rh-allocation");
      return res.allocations || [];
    },
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/leave/config/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...data, change_reason: changeReason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave/config"] });
      toast({ title: "Success", description: "Leave config updated successfully" });
      setReasonModalOpen(false);
      setReasonModalData(null);
      setChangeReason("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update config",
        variant: "destructive" 
      });
    },
  });

  const handleConfigEdit = (config: any, field: string, value: any) => {
    setReasonModalData({ ...config, [field]: value });
    setReasonModalOpen(true);
  };

  const handleReasonSubmit = () => {
    if (!changeReason || changeReason.length < 10) {
      toast({ 
        title: "Error", 
        description: "Reason must be at least 10 characters", 
        variant: "destructive" 
      });
      return;
    }
    if (reasonModalData) {
      updateConfigMutation.mutate(reasonModalData);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management System</h1>
        <p className="text-slate-600 mt-1">Configure leaves, policies, holidays, and track all changes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Leave Config
          </TabsTrigger>
          <TabsTrigger value="policy">
            <FileText className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="holiday">
            <Calendar className="h-4 w-4 mr-2" />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* LEAVE CONFIG TAB - FULLY FUNCTIONAL */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Leave Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="text-center py-12">Loading configurations...</div>
              ) : configs.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  No leave configurations found. Please run the database migration.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Leave Type</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Annual Quota</TableHead>
                        <TableHead>Monthly Accrual</TableHead>
                        <TableHead>Prorate</TableHead>
                        <TableHead>Eligibility (months)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configs.map((config: any) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-mono font-bold text-blue-600">
                            {config.leave_type}
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={config.display_name} 
                              onChange={(e) => handleConfigEdit(config, 'display_name', e.target.value)} 
                              className="max-w-[200px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={config.annual_quota || ''} 
                              onChange={(e) => handleConfigEdit(config, 'annual_quota', parseFloat(e.target.value))} 
                              className="max-w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              step="0.5" 
                              value={config.monthly_accrual || ''} 
                              onChange={(e) => handleConfigEdit(config, 'monthly_accrual', parseFloat(e.target.value))} 
                              className="max-w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={config.prorate_enabled} 
                              onCheckedChange={(checked) => handleConfigEdit(config, 'prorate_enabled', checked)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{config.eligibility_months} months</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.is_active ? "default" : "secondary"}>
                              {config.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* RH Allocations Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Restricted Holiday Allocations by City
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {rhAllocations.map((alloc: any) => (
                        <Card key={alloc.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                              {alloc.total_rh}
                            </div>
                            <p className="text-sm font-medium text-slate-700">{alloc.city}</p>
                            <p className="text-xs text-slate-500">Year {alloc.year}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POLICY TAB - Coming in Step 2 */}
        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle>Leave Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-slate-600">
                Policy management UI - Next step...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HOLIDAY TAB - Coming in Step 3 */}
        <TabsContent value="holiday">
          <Card>
            <CardHeader>
              <CardTitle>Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-slate-600">
                Holiday management UI - Next step...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT TAB - Coming in Step 4 */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-slate-600">
                Audit trail UI - Next step...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Reason Modal */}
      <Dialog open={reasonModalOpen} onOpenChange={setReasonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Reason Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Please provide a reason for this change (minimum 10 characters)</Label>
              <Textarea 
                value={changeReason} 
                onChange={(e) => setChangeReason(e.target.value)} 
                placeholder="Enter reason for change..." 
                rows={4} 
                className="mt-2"
              />
              <p className="text-xs text-slate-600 mt-1">
                {changeReason.length} / 10 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setReasonModalOpen(false);
                setReasonModalData(null);
                setChangeReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReasonSubmit} 
              disabled={changeReason.length < 10 || updateConfigMutation.isPending}
            >
              {updateConfigMutation.isPending ? "Saving..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
