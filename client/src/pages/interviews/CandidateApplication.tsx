import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const candidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  roleId: z.string().min(1, "Role is required"),
  cityId: z.string().min(1, "City is required"),
  clusterId: z.string().min(1, "Cluster is required"),
  qualification: z.string().min(1, "Qualification is required"),
  resumeSource: z.string().min(1, "Resume source is required"),
  vendorId: z.string().optional(),
  recruiterId: z.string().optional(),
  referralName: z.string().optional(),
});

export default function CandidateApplication() {
  const [view, setView] = useState<'form' | 'list'>('form');
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const { toast } = useToast();

  const { data: cities } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

  const { data: roles } = useQuery({
    queryKey: ["/api/master-data/role"],
  });

  const { data: vendors } = useQuery({
    queryKey: ["/api/master-data/vendor"],
    enabled: selectedSource === "vendor",
  });

  const { data: recruiters } = useQuery({
    queryKey: ["/api/master-data/recruiter"],
    enabled: selectedSource === "field_recruiter",
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["/api/interviews/candidates"],
    enabled: view === 'list',
  });

  const form = useForm<z.infer<typeof candidateSchema>>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      roleId: "",
      cityId: "",
      clusterId: "",
      qualification: "",
      resumeSource: "",
      vendorId: "",
      recruiterId: "",
      referralName: "",
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        roleId: parseInt(data.roleId),
        cityId: parseInt(data.cityId),
        clusterId: parseInt(data.clusterId),
        qualification: data.qualification,
        resumeSource: data.resumeSource,
      };

      if (data.vendorId) payload.vendorId = parseInt(data.vendorId);
      if (data.recruiterId) payload.recruiterId = parseInt(data.recruiterId);
      if (data.referralName) payload.referralName = data.referralName;

      return await apiRequest("POST", "/api/interviews/candidates", payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: data.message || "Candidate application submitted successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof candidateSchema>) => {
    // Add validation based on resume source
    if (data.resumeSource === "vendor" && !data.vendorId) {
      toast({
        title: "Validation Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
      return;
    }
    if (data.resumeSource === "field_recruiter" && !data.recruiterId) {
      toast({
        title: "Validation Error", 
        description: "Please select a recruiter",
        variant: "destructive",
      });
      return;
    }
    if (data.resumeSource === "referral" && !data.referralName) {
      toast({
        title: "Validation Error",
        description: "Please enter referral name",
        variant: "destructive",
      });
      return;
    }
    
    createCandidateMutation.mutate(data);
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    form.setValue("clusterId", "");
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    form.setValue("vendorId", "");
    form.setValue("recruiterId", "");
    form.setValue("referralName", "");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'applied':
        return 'default';
      case 'prescreening':
        return 'secondary';
      case 'technical':
        return 'outline';
      case 'selected':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'offered':
        return 'default';
      case 'joined':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Candidate Applications</h2>
            <p className="text-slate-600 mt-1">Manage candidate applications and submissions</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={view === 'form' ? 'default' : 'outline'}
              onClick={() => setView('form')}
            >
              Application Form
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
            >
              View Applications
            </Button>
          </div>
        </div>
      </div>

      {view === 'form' ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>New Candidate Application</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (as per Aadhar)</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(roles) ? roles : []).map((role: any) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleCityChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(cities) ? cities : []).map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clusterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cluster</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Cluster" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(clusters) ? clusters : [])
                              .filter((cluster: any) => selectedCityId ? cluster.cityId === parseInt(selectedCityId) : true)
                              .map((cluster: any) => (
                                <SelectItem key={cluster.id} value={cluster.id.toString()}>
                                  {cluster.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Qualification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="8th - 10th">8th - 10th</SelectItem>
                          <SelectItem value="11th - 12th">11th - 12th</SelectItem>
                          <SelectItem value="Graduation">Graduation</SelectItem>
                          <SelectItem value="B.Tech">B.Tech</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="ITI">ITI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumeSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Source</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSourceChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="field_recruiter">Field Recruiter</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="direct">Direct Application</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedSource === "vendor" && (
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Vendor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(vendors) ? vendors : []).map((vendor: any) => (
                              <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedSource === "field_recruiter" && (
                  <FormField
                    control={form.control}
                    name="recruiterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Recruiter Name</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Recruiter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(recruiters) ? recruiters : []).map((recruiter: any) => (
                              <SelectItem key={recruiter.id} value={recruiter.id.toString()}>
                                {recruiter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedSource === "referral" && (
                  <FormField
                    control={form.control}
                    name="referralName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of the person who referred" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createCandidateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createCandidateMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Candidate Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : candidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates?.map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-mono text-sm">{candidate.applicationId || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>{candidate.roleName || candidate.role?.name}</TableCell>
                      <TableCell>{candidate.cityName || candidate.city?.name}</TableCell>
                      <TableCell>{candidate.clusterName || candidate.cluster?.name}</TableCell>
                      <TableCell className="capitalize">
                        {candidate.resumeSource?.replace('_', ' ') || candidate.sourcingChannel?.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
