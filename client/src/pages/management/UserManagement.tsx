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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Users, UserPlus, Eye, Edit, Trash2 } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  managerId: z.string().optional(),
  cityId: z.string().optional(),
  clusterId: z.string().optional(),
});

const bulkUserSchema = z.object({
  csvData: z.string().min(1, "CSV data is required"),
});

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'list'>('single');
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const { toast } = useToast();

  // Fetch master data
  const { data: cities } = useQuery({
    queryKey: ["/api/master-data/cities"],
  });

  const { data: clusters } = useQuery({
    queryKey: ["/api/master-data/cities", selectedCityId, "clusters"],
    enabled: !!selectedCityId,
  });

  const { data: managers } = useQuery({
    queryKey: ["/api/users"],
    select: (data: any[]) => data?.filter(user => ['admin', 'hr', 'manager'].includes(user.role)),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: activeTab === 'list',
  });

  // Single user form
  const singleUserForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      role: "",
      managerId: "",
      cityId: "",
      clusterId: "",
    },
  });

  // Bulk user form
  const bulkUserForm = useForm<z.infer<typeof bulkUserSchema>>({
    resolver: zodResolver(bulkUserSchema),
    defaultValues: {
      csvData: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
        role: data.role,
      };

      if (data.managerId) payload.managerId = parseInt(data.managerId);
      if (data.cityId) payload.cityId = parseInt(data.cityId);
      if (data.clusterId) payload.clusterId = parseInt(data.clusterId);

      return await apiRequest("POST", "/api/users", payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      singleUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const bulkCreateUsersMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/users/bulk", { csvData: data.csvData });
    },
    onSuccess: (response: any) => {
      toast({
        title: "Success",
        description: `${response.created} users created successfully`,
      });
      bulkUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create users",
        variant: "destructive",
      });
    },
  });

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    singleUserForm.setValue("clusterId", "");
  };

  const handleSingleUserSubmit = (data: z.infer<typeof userSchema>) => {
    createUserMutation.mutate(data);
  };

  const handleBulkUserSubmit = (data: z.infer<typeof bulkUserSchema>) => {
    bulkCreateUsersMutation.mutate(data);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'hr':
        return 'default';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-600 mt-1">Manage system users and access controls</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Single User</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Bulk Upload</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>All Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...singleUserForm}>
                <form onSubmit={singleUserForm.handleSubmit(handleSingleUserSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={singleUserForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleUserForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={singleUserForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleUserForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={singleUserForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleUserForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={singleUserForm.control}
                      name="role"
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
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                              <SelectItem value="recruiter">Recruiter</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="trainer">Trainer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleUserForm.control}
                      name="managerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manager (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Manager" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No Manager</SelectItem>
                              {managers?.filter((manager: any) => manager.id && manager.id.toString()).map((manager: any) => (
                                <SelectItem key={manager.id} value={manager.id.toString()}>
                                  {manager.firstName} {manager.lastName} ({manager.role})
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
                      control={singleUserForm.control}
                      name="cityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City (Optional)</FormLabel>
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
                              <SelectItem value="">No City</SelectItem>
                              {cities?.filter((city: any) => city.id && city.id.toString()).map((city: any) => (
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
                      control={singleUserForm.control}
                      name="clusterId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cluster (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Cluster" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No Cluster</SelectItem>
                              {clusters?.filter((cluster: any) => cluster.id && cluster.id.toString()).map((cluster: any) => (
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

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => singleUserForm.reset()}>
                      Reset
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createUserMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk User Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">CSV Format Instructions</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Upload users in CSV format with the following columns:
                </p>
                <code className="text-xs bg-white p-2 rounded border block">
                  username,email,firstName,lastName,phone,password,role,managerId,cityId,clusterId
                </code>
                <p className="text-xs text-slate-500 mt-2">
                  Note: managerId, cityId, and clusterId are optional (use empty values for optional fields)
                </p>
              </div>

              <Form {...bulkUserForm}>
                <form onSubmit={bulkUserForm.handleSubmit(handleBulkUserSubmit)} className="space-y-6">
                  <FormField
                    control={bulkUserForm.control}
                    name="csvData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CSV Data</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your CSV data here..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => bulkUserForm.reset()}>
                      Clear
                    </Button>
                    <Button 
                      type="submit"
                      disabled={bulkCreateUsersMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {bulkCreateUsersMutation.isPending ? "Uploading..." : "Upload Users"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : users?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.city?.name || '-'}</div>
                            <div className="text-slate-500">{user.cluster?.name || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}