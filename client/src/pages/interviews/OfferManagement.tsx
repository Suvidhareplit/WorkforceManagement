import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@/types";
import { CalendarIcon, Send } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function OfferManagement() {
  const [dateOfJoining, setDateOfJoining] = useState<Date>();
  const [grossSalary, setGrossSalary] = useState("");
  const [editingDOJ, setEditingDOJ] = useState<number | null>(null);
  const [editingGross, setEditingGross] = useState<number | null>(null);
  const [tempDOJ, setTempDOJ] = useState<Date | undefined>();
  const [tempGross, setTempGross] = useState("");
  const { toast } = useToast();

  const { data: selectedCandidatesResponse, isLoading: loadingSelected } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "selected" }],
    queryFn: async () => {
      const response = await apiRequest("/api/interviews/candidates?status=selected", { method: "GET" });
      return response;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: offeredCandidatesResponse, isLoading: loadingOffered } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "offered" }],
    queryFn: async () => {
      const response = await apiRequest("/api/interviews/candidates?status=offered", { method: "GET" });
      return response;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Extract data from API responses
  const selectedCandidates = (selectedCandidatesResponse as any)?.data || [];
  const offeredCandidates = (offeredCandidatesResponse as any)?.data || [];

  console.log('📋 Offer Management Data:', {
    selectedCount: selectedCandidates.length,
    offeredCount: offeredCandidates.length,
    selectedCandidates: selectedCandidates.slice(0, 2),
    offeredCandidates: offeredCandidates.slice(0, 2)
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, dateOfJoining, grossSalary }: { id: number; dateOfJoining?: string; grossSalary?: string }) => {
      return await apiRequest(`/api/interviews/candidates/${id}/offer`, {
        method: "PATCH",
        body: {
          dateOfJoining,
          grossSalary,
        }
      });
    },
    onSuccess: () => {
      // Just invalidate - let React Query handle the refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/interviews/candidates');
        }
      });
      
      toast({
        title: "Success",
        description: "Offer details updated successfully",
      });
      setEditingDOJ(null);
      setEditingGross(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update offer details",
        variant: "destructive",
      });
    },
  });

  const handleUpdateDOJ = (candidateId: number, date: Date | undefined) => {
    if (!date) return;
    updateOfferMutation.mutate({
      id: candidateId,
      dateOfJoining: date.toISOString(),
    });
    setEditingDOJ(null);
  };

  const handleUpdateGross = (candidateId: number, salary: string) => {
    if (!salary || salary.trim() === '') return;
    updateOfferMutation.mutate({
      id: candidateId,
      grossSalary: salary,
    });
    setEditingGross(null);
  };

  const handleSendOffer = (candidate: Candidate) => {
    if (!dateOfJoining || !grossSalary) {
      toast({
        title: "Error",
        description: "Please provide date of joining and salary",
        variant: "destructive",
      });
      return;
    }

    updateOfferMutation.mutate({
      id: candidate.id,
      dateOfJoining: dateOfJoining.toISOString(),
      grossSalary,
    });
  };

  const getSourceDisplay = (candidate: Candidate) => {
    if (candidate.resumeSource === 'vendor' && candidate.vendorName) {
      return `Vendor: ${candidate.vendorName}`;
    }
    if (candidate.resumeSource === 'field_recruiter' && candidate.recruiterName) {
      return `Recruiter: ${candidate.recruiterName}`;
    }
    if (candidate.resumeSource === 'referral' && candidate.referralName) {
      return `Referral: ${candidate.referralName}`;
    }
    return candidate.resumeSource?.replace('_', ' ') || 'Direct';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Offer Management</h2>
        <p className="text-slate-600 mt-1">Manage job offers and onboarding for selected candidates</p>
      </div>

      <div className="space-y-6">
        {/* Selected Candidates */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Candidates - Awaiting Offer</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Interview Status</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>Gross (Monthly)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSelected ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (selectedCandidates as any[])?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No selected candidates awaiting offers
                    </TableCell>
                  </TableRow>
                ) : (
                  (selectedCandidates as any[])?.map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.cityName || candidate.city?.name || '-'}</TableCell>
                      <TableCell>{candidate.clusterName || candidate.cluster?.name || '-'}</TableCell>
                      <TableCell>{candidate.roleName || candidate.role?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.phone}</div>
                          <div className="text-slate-500">{candidate.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getSourceDisplay(candidate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          Selected
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {editingDOJ === candidate.id ? (
                          <div className="space-y-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {tempDOJ ? format(tempDOJ, 'dd-MMM-yyyy') : 'Select date'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={tempDOJ}
                                  onSelect={setTempDOJ}
                                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (tempDOJ) {
                                    handleUpdateDOJ(candidate.id, tempDOJ);
                                  }
                                }}
                                disabled={!tempDOJ}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingDOJ(null);
                                  setTempDOJ(undefined);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-slate-100 p-2 rounded flex items-center gap-2"
                            onClick={() => {
                              setEditingDOJ(candidate.id);
                              setTempDOJ(candidate.dateOfJoining ? new Date(candidate.dateOfJoining) : undefined);
                            }}
                          >
                            {candidate.dateOfJoining ? (
                              <>
                                <span>{format(new Date(candidate.dateOfJoining), 'dd-MMM-yyyy')}</span>
                                <span className="text-xs text-slate-400">(click to edit)</span>
                              </>
                            ) : (
                              <span className="text-slate-400">Click to set</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {editingGross === candidate.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">₹</span>
                              <Input
                                type="text"
                                value={tempGross}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  setTempGross(value);
                                }}
                                placeholder="Enter amount"
                                className="w-32"
                                autoFocus
                              />
                            </div>
                            {tempGross && (
                              <p className="text-xs text-slate-600">
                                ₹{parseInt(tempGross).toLocaleString('en-IN')}/month
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (tempGross) {
                                    handleUpdateGross(candidate.id, tempGross);
                                  }
                                }}
                                disabled={!tempGross}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingGross(null);
                                  setTempGross('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-slate-100 p-2 rounded flex items-center gap-2"
                            onClick={() => {
                              setEditingGross(candidate.id);
                              setTempGross(candidate.grossSalary || '');
                            }}
                          >
                            {candidate.grossSalary ? (
                              <>
                                <span>₹{parseInt(candidate.grossSalary).toLocaleString('en-IN')}</span>
                                <span className="text-xs text-slate-400">(click to edit)</span>
                              </>
                            ) : (
                              <span className="text-slate-400">Click to set</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Pre-populate with existing values
                                setDateOfJoining(candidate.dateOfJoining ? new Date(candidate.dateOfJoining) : undefined);
                                setGrossSalary(candidate.grossSalary || "");
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Offer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Job Offer - {candidate.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                <h4 className="font-medium mb-3">Candidate Details</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                  <div><strong>Name:</strong> {candidate.name}</div>
                                  <div><strong>City:</strong> {candidate.cityName || candidate.city?.name}</div>
                                  <div><strong>Cluster:</strong> {candidate.clusterName || candidate.cluster?.name}</div>
                                  <div><strong>Role:</strong> {candidate.roleName || candidate.role?.name}</div>
                                  <div><strong>Phone:</strong> {candidate.phone}</div>
                                  <div><strong>Email:</strong> {candidate.email}</div>
                                  <div><strong>Source:</strong> {getSourceDisplay(candidate)}</div>
                                  <div><strong>Interview Status:</strong> <Badge variant="default" className="bg-green-600">Selected</Badge></div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label className="text-base font-medium">Date of Joining (DOJ) <span className="text-red-500">*</span></Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal mt-2",
                                          !dateOfJoining && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateOfJoining ? format(dateOfJoining, "PPP") : "Select date of joining"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={dateOfJoining}
                                        onSelect={setDateOfJoining}
                                        disabled={(date) =>
                                          date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <div>
                                  <Label htmlFor="salary" className="text-base font-medium">Gross Salary (Monthly) <span className="text-red-500">*</span></Label>
                                  <div className="relative mt-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                                      Gross Rs.
                                    </span>
                                    <Input
                                      id="salary"
                                      type="text"
                                      value={grossSalary}
                                      onChange={(e) => {
                                        // Only allow numbers
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setGrossSalary(value);
                                      }}
                                      placeholder="Enter monthly amount (e.g., 25000)"
                                      className="pl-24"
                                    />
                                  </div>
                                  {grossSalary && (
                                    <p className="text-sm text-slate-600 mt-1">
                                      Monthly: ₹{parseInt(grossSalary).toLocaleString('en-IN')} | Annual: ₹{(parseInt(grossSalary) * 12).toLocaleString('en-IN')}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Offer Process</h4>
                                <p className="text-sm text-blue-800">
                                  {candidate.resumeSource === 'vendor' 
                                    ? "Selection notification will be sent to the vendor with DOJ and salary details."
                                    : "Offer letter will be sent directly to the candidate with DOJ and salary details."}
                                </p>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleSendOffer(candidate)}
                                  disabled={!dateOfJoining || !grossSalary || updateOfferMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  {updateOfferMutation.isPending ? "Sending..." : "Send Offer"}
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

        {/* Offered Candidates */}
        <Card>
          <CardHeader>
            <CardTitle>Offered Candidates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Offer Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingOffered ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (offeredCandidates as any[])?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No offered candidates
                    </TableCell>
                  </TableRow>
                ) : (
                  (offeredCandidates as any[])?.map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.role?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.phone}</div>
                          <div className="text-slate-500">{candidate.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.dateOfJoining 
                          ? format(new Date(candidate.dateOfJoining), "PPP")
                          : "Not set"}
                      </TableCell>
                      <TableCell className="font-mono">
                        ₹{candidate.grossSalary ? Number(candidate.grossSalary).toLocaleString() : "Not set"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getSourceDisplay(candidate)}
                      </TableCell>
                      <TableCell>
                        {new Date(candidate.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Offered
                        </Badge>
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
