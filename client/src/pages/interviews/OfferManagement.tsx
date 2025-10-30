import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@/types";
import { CalendarIcon, Pencil, Download, Filter, Share2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function OfferManagement() {
  const [editingDOJ, setEditingDOJ] = useState<number | null>(null);
  const [editingGross, setEditingGross] = useState<number | null>(null);
  const [tempDOJ, setTempDOJ] = useState<Date | undefined>();
  const [tempGross, setTempGross] = useState("");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { toast } = useToast();

  const { data: selectedCandidatesResponse, isLoading: loadingSelected } = useQuery({
    queryKey: ["/api/interviews/candidates"],
    queryFn: async () => {
      // Fetch all candidates
      const response = await apiRequest("/api/interviews/candidates", { method: "GET" });
      return response;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });


  // Extract data from API responses and filter for selected and offered candidates
  const allCandidates = (selectedCandidatesResponse as any)?.data || [];
  const selectedCandidates = allCandidates.filter((c: any) => 
    c.status === 'selected' || c.status === 'offered'
  );

  console.log('📋 Offer Management Data:', {
    selectedCount: selectedCandidates.length,
    selectedCandidates: selectedCandidates.slice(0, 2)
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, dateOfJoining, grossSalary, sendOffer }: { id: number; dateOfJoining?: string; grossSalary?: string; sendOffer?: boolean }) => {
      console.log('🚀 Sending PATCH request:', {
        url: `/api/interviews/candidates/${id}/offer`,
        body: { dateOfJoining, grossSalary, sendOffer }
      });
      
      const result = await apiRequest(`/api/interviews/candidates/${id}/offer`, {
        method: "PATCH",
        body: {
          dateOfJoining,
          grossSalary,
          sendOffer,
        }
      });
      
      console.log('📥 PATCH response:', result);
      return result;
    },
    onSuccess: async (data) => {
      console.log('✅ Mutation success, updated candidate:', data);
      
      // Force invalidate and refetch
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/interviews/candidates"]
      });
      
      // Force a hard refetch
      await queryClient.refetchQueries({
        queryKey: ["/api/interviews/candidates"]
      });
      
      toast({
        title: "Success",
        description: "Offer details updated successfully",
      });
      setEditingDOJ(null);
      setEditingGross(null);
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update offer details",
        variant: "destructive",
      });
    },
  });

  const handleUpdateDOJ = (candidateId: number, date: Date | undefined) => {
    if (!date) return;
    // Format date as YYYY-MM-DD to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    console.log('🔵 Updating DOJ:', { candidateId, date: dateString, originalDate: date });
    updateOfferMutation.mutate({
      id: candidateId,
      dateOfJoining: dateString,
      sendOffer: false, // Explicitly set to false - don't change status
    });
    setEditingDOJ(null);
    setTempDOJ(undefined);
  };

  const handleUpdateGross = (candidateId: number, salary: string) => {
    if (!salary || salary.trim() === '') return;
    console.log('🔵 Updating Gross Salary:', { candidateId, salary });
    updateOfferMutation.mutate({
      id: candidateId,
      grossSalary: salary,
      sendOffer: false, // Explicitly set to false - don't change status
    });
    setEditingGross(null);
  };

  // Mark selection as shared
  const markSelectionShared = async () => {
    if (selectedCandidateIds.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update each selected candidate's status to 'offered'
      for (const candidateId of selectedCandidateIds) {
        await apiRequest(`/api/interviews/candidates/${candidateId}/offer`, {
          method: "PATCH",
          body: {
            sendOffer: true, // This will change status to 'offered'
          }
        });
      }

      // Refetch data
      await queryClient.refetchQueries({
        queryKey: ["/api/interviews/candidates"]
      });

      toast({
        title: "Success",
        description: `Selection shared for ${selectedCandidateIds.length} candidate(s)`,
      });

      setSelectedCandidateIds([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share selection",
        variant: "destructive",
      });
    }
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

  // Filter selected candidates
  const filteredSelectedCandidates = selectedCandidates.filter((candidate: any) => {
    if (cityFilter && cityFilter !== "all" && candidate.cityName !== cityFilter) return false;
    if (dateRange.from && new Date(candidate.createdAt) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(candidate.createdAt) > new Date(dateRange.to)) return false;
    return true;
  });

  // Get unique cities from candidates
  const uniqueCities = Array.from(new Set(selectedCandidates.map((c: any) => c.cityName).filter(Boolean)));

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedCandidateIds.length === filteredSelectedCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredSelectedCandidates.map((c: any) => c.id));
    }
  };

  // Toggle individual candidate
  const toggleCandidate = (id: number) => {
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  // Download CSV
  const downloadCSV = () => {
    const candidatesToDownload = filteredSelectedCandidates.filter((c: any) => 
      selectedCandidateIds.includes(c.id)
    );

    if (candidatesToDownload.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate to download",
        variant: "destructive",
      });
      return;
    }

    // CSV Headers
    const headers = [
      "Name",
      "City",
      "Cluster",
      "Role",
      "Phone Number",
      "Email ID",
      "Qualification",
      "Experience (Years)",
      "Source Type",
      "Source Name",
      "DOJ",
      "Gross Salary (Monthly)"
    ];

    // CSV Rows
    const rows = candidatesToDownload.map((candidate: any) => {
      const sourceType = candidate.resumeSource === 'vendor' ? 'Vendor' :
                        candidate.resumeSource === 'field_recruiter' ? 'Field Recruiter' :
                        candidate.resumeSource === 'referral' ? 'Referral' : 'Direct';
      
      const sourceName = candidate.resumeSource === 'vendor' ? candidate.vendorName :
                        candidate.resumeSource === 'field_recruiter' ? candidate.recruiterName :
                        candidate.resumeSource === 'referral' ? candidate.referralName : '-';

      return [
        candidate.name || '',
        candidate.cityName || '',
        candidate.clusterName || '',
        candidate.roleName || '',
        candidate.phone || '',
        candidate.email || '',
        candidate.qualification || '',
        candidate.experienceYears || '0',
        sourceType,
        sourceName || '',
        candidate.joiningDate ? format(new Date(candidate.joiningDate), 'dd-MMM-yyyy') : '',
        candidate.offeredSalary ? `₹${parseFloat(candidate.offeredSalary).toLocaleString('en-IN')}` : ''
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `selected_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Downloaded ${candidatesToDownload.length} candidate(s)`,
    });
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
            <div className="flex items-center justify-between">
              <CardTitle>Selected Candidates - Awaiting Offer</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={markSelectionShared}
                  disabled={selectedCandidateIds.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Selection Shared ({selectedCandidateIds.length})
                </Button>
                <Button
                  onClick={downloadCSV}
                  disabled={selectedCandidateIds.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV ({selectedCandidateIds.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">
                  <Filter className="inline h-4 w-4 mr-1" />
                  Filter by City
                </Label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {uniqueCities.map((city: any) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">From Date</Label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">To Date</Label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCandidateIds.length === filteredSelectedCandidates.length && filteredSelectedCandidates.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>Gross (Monthly)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSelected ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredSelectedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      No selected candidates awaiting offers
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSelectedCandidates.map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCandidateIds.includes(candidate.id)}
                          onCheckedChange={() => toggleCandidate(candidate.id)}
                        />
                      </TableCell>
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
                      <TableCell className="text-sm">
                        {candidate.qualification || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {candidate.experienceYears ? `${candidate.experienceYears} years` : '-'}
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
                                  disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                  }}
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
                              setTempDOJ(candidate.joiningDate ? new Date(candidate.joiningDate) : undefined);
                            }}
                          >
                            {candidate.joiningDate ? (
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{format(new Date(candidate.joiningDate), 'dd-MMM-yyyy')}</span>
                                <div className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span className="text-sm font-bold">EDIT</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-500">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="font-medium">Set Date</span>
                              </div>
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
                              setTempGross(candidate.offeredSalary ? candidate.offeredSalary.toString() : '');
                            }}
                          >
                            {candidate.offeredSalary ? (
                              <div className="flex items-center gap-3">
                                <span className="font-medium">₹{parseFloat(candidate.offeredSalary).toLocaleString('en-IN')}</span>
                                <div className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span className="text-sm font-bold">EDIT</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-500">
                                <span className="font-medium">Set Salary</span>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.status === 'offered' ? (
                          <Badge className="bg-purple-600">Selection Shared</Badge>
                        ) : (
                          <Badge className="bg-green-600">Selected</Badge>
                        )}
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
