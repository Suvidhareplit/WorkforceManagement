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
  const [createPolicyModalOpen, setCreatePolicyModalOpen] = useState(false);
  const [policyFormData, setPolicyFormData] = useState({
    policy_name: "",
    policy_code: "",
    description: "",
    effective_from: "",
    city: "",
    employee_type: "ALL",
  });
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Load leave configs
  const { data: configs = [], isLoading: configsLoading, error: configsError } = useQuery({
    queryKey: ["/api/leave/config"],
    queryFn: async () => {
      console.log("Fetching leave configs from /api/leave/config");
      const res = await apiRequest("/api/leave/config", { method: "GET" });
      console.log("Leave configs response:", res);
      return res.configs || [];
    },
    retry: 1,
  });

  // Load policies
  const { data: policies = [], isLoading: policiesLoading } = useQuery({
    queryKey: ["/api/leave/policy"],
    queryFn: async () => {
      const res = await apiRequest("/api/leave/policy", { method: "GET" });
      return res.policies || [];
    },
  });

  // Load RH allocations
  const { data: rhAllocations = [] } = useQuery({
    queryKey: ["/api/leave/rh-allocation"],
    queryFn: async () => {
      const res = await apiRequest("/api/leave/rh-allocation", { method: "GET" });
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

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      const mappings = configs.map((config: any) => ({
        leave_type: config.leave_type,
        is_enabled: true,
        allocation_override: null,
      }));
      return await apiRequest("/api/leave/policy", {
        method: "POST",
        body: JSON.stringify({ ...data, leave_mappings: mappings, change_reason: changeReason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave/policy"] });
      toast({ title: "Success", description: "Policy created successfully" });
      setCreatePolicyModalOpen(false);
      setReasonModalOpen(false);
      setChangeReason("");
      setPolicyFormData({
        policy_name: "",
        policy_code: "",
        description: "",
        effective_from: "",
        city: "",
        employee_type: "ALL",
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create policy", variant: "destructive" });
    },
  });

  // Toggle policy mutation
  const togglePolicyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/leave/policy/${id}/toggle-status`, {
        method: "PATCH",
        body: JSON.stringify({ change_reason: changeReason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave/policy"] });
      toast({ title: "Success", description: "Policy status updated" });
      setConfirmModalOpen(false);
      setReasonModalOpen(false);
      setChangeReason("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

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
    } else if (policyFormData.policy_name) {
      createPolicyMutation.mutate(policyFormData);
    } else if (confirmAction) {
      confirmAction.execute();
    }
  };

  const handleCreatePolicy = () => {
    setCreatePolicyModalOpen(true);
  };

  const handleTogglePolicy = (policy: any) => {
    setConfirmAction({
      title: policy.is_active ? "Deactivate Policy" : "Activate Policy",
      message: `Are you sure you want to ${policy.is_active ? 'deactivate' : 'activate'} "${policy.policy_name}"?`,
      execute: () => togglePolicyMutation.mutate(policy.id),
    });
    setConfirmModalOpen(true);
  };

  const confirmWithReason = () => {
    setConfirmModalOpen(false);
    setReasonModalData(null);
    setReasonModalOpen(true);
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
              ) : configsError ? (
                <div className="text-center py-12 text-red-600">
                  <p className="font-semibold">Error loading configurations</p>
                  <p className="text-sm mt-2">{(configsError as any)?.message || "Failed to fetch data"}</p>
                  <p className="text-xs mt-2 text-slate-600">Check console for details</p>
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <p>No leave configurations found.</p>
                  <p className="text-sm mt-2">API returned empty array. Check database.</p>
                </div>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b-2">
                          <TableHead className="font-bold text-slate-700">Leave Type</TableHead>
                          <TableHead className="font-bold text-slate-700">Display Name</TableHead>
                          <TableHead className="font-bold text-slate-700">Annual Quota</TableHead>
                          <TableHead className="font-bold text-slate-700">Monthly Accrual</TableHead>
                          <TableHead className="font-bold text-slate-700">Prorate</TableHead>
                          <TableHead className="font-bold text-slate-700">Eligibility</TableHead>
                          <TableHead className="font-bold text-slate-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {configs.map((config: any) => (
                          <TableRow key={config.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-mono font-bold text-blue-600 text-sm">
                              {config.leaveType || config.leave_type}
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={config.displayName || config.display_name || ''} 
                                onChange={(e) => handleConfigEdit(config, 'display_name', e.target.value)} 
                                className="max-w-[220px] border-slate-300 focus:border-blue-500"
                                placeholder="Enter display name"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                value={config.annualQuota || config.annual_quota || ''} 
                                onChange={(e) => handleConfigEdit(config, 'annual_quota', parseFloat(e.target.value))} 
                                className="max-w-[100px] border-slate-300 focus:border-blue-500 text-center"
                                placeholder="0"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                step="0.5" 
                                value={config.monthlyAccrual || config.monthly_accrual || ''} 
                                onChange={(e) => handleConfigEdit(config, 'monthly_accrual', parseFloat(e.target.value))} 
                                className="max-w-[100px] border-slate-300 focus:border-blue-500 text-center"
                                placeholder="0"
                              />
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={config.prorateEnabled || config.prorate_enabled || false} 
                                onCheckedChange={(checked) => handleConfigEdit(config, 'prorate_enabled', checked)} 
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-semibold">
                                {config.eligibilityMonths || config.eligibility_months || 0} months
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={(config.isActive || config.is_active) ? "default" : "secondary"}
                                className={(config.isActive || config.is_active) ? "bg-green-600" : "bg-slate-400"}
                              >
                                {(config.isActive || config.is_active) ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* RH Allocations Section */}
                  <div className="mt-10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      Restricted Holiday Allocations by City
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {rhAllocations.map((alloc: any) => {
                        const totalRh = alloc.totalRh || alloc.total_rh || 0;
                        const city = alloc.city || '';
                        const year = alloc.year || 2025;
                        return (
                          <Card key={alloc.id} className="border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
                            <CardContent className="pt-6 text-center">
                              <div className="text-4xl font-extrabold text-blue-600 mb-2">
                                {totalRh}
                              </div>
                              <p className="text-base font-bold text-slate-800">{city}</p>
                              <p className="text-xs text-slate-500 mt-1">Year {year}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POLICY TAB - FULLY FUNCTIONAL */}
        <TabsContent value="policy">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Leave Policies</CardTitle>
              <Button onClick={handleCreatePolicy}>
                <FileText className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="text-center py-12">Loading policies...</div>
              ) : policies.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  No policies found. Create your first policy!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Employee Type</TableHead>
                      <TableHead>Effective From</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy: any) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-semibold">{policy.policy_name}</TableCell>
                        <TableCell className="font-mono text-sm">{policy.policy_code}</TableCell>
                        <TableCell>{policy.city || 'All Cities'}</TableCell>
                        <TableCell>{policy.employee_type}</TableCell>
                        <TableCell>{new Date(policy.effective_from).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={policy.is_active ? "default" : "secondary"}>
                            {policy.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTogglePolicy(policy)}
                          >
                            {policy.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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

      {/* Confirm Action Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">{confirmAction?.message}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmWithReason}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Policy Modal */}
      <Dialog open={createPolicyModalOpen} onOpenChange={setCreatePolicyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Leave Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Policy Name *</Label>
                <Input 
                  value={policyFormData.policy_name} 
                  onChange={(e) => setPolicyFormData({ ...policyFormData, policy_name: e.target.value })} 
                  placeholder="e.g., Default Policy 2025"
                />
              </div>
              <div>
                <Label>Policy Code *</Label>
                <Input 
                  value={policyFormData.policy_code} 
                  onChange={(e) => setPolicyFormData({ ...policyFormData, policy_code: e.target.value.toUpperCase() })} 
                  placeholder="e.g., POLICY2025"
                />
              </div>
            </div>
            <div>
              <Label>Effective From *</Label>
              <Input 
                type="date" 
                value={policyFormData.effective_from} 
                onChange={(e) => setPolicyFormData({ ...policyFormData, effective_from: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City (optional)</Label>
                <Input 
                  value={policyFormData.city} 
                  onChange={(e) => setPolicyFormData({ ...policyFormData, city: e.target.value })} 
                  placeholder="Leave empty for all cities"
                />
              </div>
              <div>
                <Label htmlFor="employee-type-select">Employee Type</Label>
                <select 
                  id="employee-type-select"
                  aria-label="Employee Type"
                  className="w-full border rounded px-3 py-2" 
                  value={policyFormData.employee_type} 
                  onChange={(e) => setPolicyFormData({ ...policyFormData, employee_type: e.target.value })}
                >
                  <option value="ALL">All</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={policyFormData.description} 
                onChange={(e) => setPolicyFormData({ ...policyFormData, description: e.target.value })} 
                placeholder="Policy description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePolicyModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (!policyFormData.policy_name || !policyFormData.policy_code || !policyFormData.effective_from) {
                  toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
                  return;
                }
                setCreatePolicyModalOpen(false);
                setReasonModalOpen(true);
              }}
            >
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
