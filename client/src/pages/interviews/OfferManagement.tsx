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
import { CalendarIcon, Send, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function OfferManagement() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [dateOfJoining, setDateOfJoining] = useState<Date>();
  const [grossSalary, setGrossSalary] = useState("");
  const { toast } = useToast();

  const { data: selectedCandidates, isLoading: loadingSelected } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "selected" }],
  });

  const { data: offeredCandidates, isLoading: loadingOffered } = useQuery({
    queryKey: ["/api/interviews/candidates", { status: "offered" }],
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, dateOfJoining, grossSalary }: { id: number; dateOfJoining: string; grossSalary: string }) => {
      return await apiRequest("PATCH", `/api/interviews/candidates/${id}/offer`, {
        dateOfJoining,
        grossSalary,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: "Offer sent successfully",
      });
      setSelectedCandidate(null);
      setDateOfJoining(undefined);
      setGrossSalary("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send offer",
        variant: "destructive",
      });
    },
  });

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
    if (candidate.resumeSource === 'vendor' && candidate.vendor) {
      return `Vendor: ${candidate.vendor.name}`;
    }
    if (candidate.resumeSource === 'field_recruiter' && candidate.recruiter) {
      return `Recruiter: ${candidate.recruiter.name}`;
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
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Technical Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSelected ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : selectedCandidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No selected candidates awaiting offers
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedCandidates?.map((candidate: Candidate) => (
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
                        <div className="text-sm">
                          <div>{candidate.phone}</div>
                          <div className="text-slate-500">{candidate.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getSourceDisplay(candidate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {candidate.screeningScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setDateOfJoining(undefined);
                                setGrossSalary("");
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
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Candidate Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {candidate.name}</div>
                                    <div><strong>Role:</strong> {candidate.role?.name}</div>
                                    <div><strong>Phone:</strong> {candidate.phone}</div>
                                    <div><strong>Email:</strong> {candidate.email}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Assessment Results</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Screening Score:</strong> {candidate.screeningScore}%</div>
                                    <div><strong>Technical Status:</strong> {candidate.technicalStatus}</div>
                                    <div><strong>Source:</strong> {getSourceDisplay(candidate)}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Date of Joining</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !dateOfJoining && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateOfJoining ? format(dateOfJoining, "PPP") : "Pick a date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
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
                                  <Label htmlFor="salary">Gross Salary (Annual)</Label>
                                  <Input
                                    id="salary"
                                    type="number"
                                    value={grossSalary}
                                    onChange={(e) => setGrossSalary(e.target.value)}
                                    placeholder="Enter salary amount"
                                  />
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
                ) : offeredCandidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No offered candidates
                    </TableCell>
                  </TableRow>
                ) : (
                  offeredCandidates?.map((candidate: Candidate) => (
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
