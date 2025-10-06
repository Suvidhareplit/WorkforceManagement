import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
import { useLocation } from "wouter";

const formSchema = z.object({
  cityId: z.string().min(1, "City is required"),
  clusterId: z.string().min(1, "Cluster is required"),
  roleId: z.string().min(1, "Role is required"),
  numberOfPositions: z.string().min(1, "Number of positions is required"),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  requestType: z.enum(["backfill", "fresh", "training_attrition"]),
  requestDate: z.string().min(1, "Request date is required"),
  notes: z.string().optional(),
});

export default function CreateHiringRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  // Redirect to login if not authenticated
  if (!user) {
    setLocation('/');
    return null;
  }

  const { data: cities = [] } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clusters = [] } = useQuery({
    queryKey: [`/api/master-data/city/${selectedCityId}/clusters`],
    enabled: !!selectedCityId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["/api/master-data/role"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cityId: "",
      clusterId: "",
      roleId: "",
      numberOfPositions: "",
      priority: "P1",
      requestType: "fresh",
      requestDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/hiring", {
        method: "POST",
        body: JSON.stringify({
          cityId: parseInt(data.cityId),
          clusterId: parseInt(data.clusterId),
          roleId: parseInt(data.roleId),
          numberOfPositions: parseInt(data.numberOfPositions),
          priority: data.priority,
          requestType: data.requestType,
          requestDate: data.requestDate,
          notes: data.notes,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hiring"] });
      toast({
        title: "Success",
        description: "Hiring request(s) created successfully",
      });
      setLocation("/hiring/requests");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hiring request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createRequestMutation.mutate(data);
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    form.setValue("clusterId", ""); // Reset cluster when city changes
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Create Hiring Request</h2>
        <p className="text-slate-600 mt-1">Submit a new recruitment request for your team</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Hiring Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {Array.isArray(cities) && cities.filter((city: any) => city.id && city.id.toString() && city.name).map((city: any) => (
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
                          {Array.isArray(clusters) && clusters.filter((cluster: any) => cluster.id && cluster.id.toString() && cluster.name).map((cluster: any) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {Array.isArray(roles) && roles.filter((role: any) => role.id && role.id.toString() && role.name).map((role: any) => (
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
                  name="numberOfPositions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Positions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Enter number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="P0">P0 - Critical</SelectItem>
                          <SelectItem value="P1">P1 - High</SelectItem>
                          <SelectItem value="P2">P2 - Medium</SelectItem>
                          <SelectItem value="P3">P3 - Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="backfill">Backfill</SelectItem>
                          <SelectItem value="fresh">Fresh Requirement</SelectItem>
                          <SelectItem value="training_attrition">Training Attrition</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Any additional requirements or notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/hiring/requests")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createRequestMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createRequestMutation.isPending ? "Creating..." : "Create Request"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
