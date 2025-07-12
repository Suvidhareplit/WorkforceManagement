import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Users, Plus, Upload, Search, FileText } from "lucide-react";

interface UserFormData {
  name: string;
  phone: string;
  email: string;
  userId: string;
  role: string;
  managerId?: number | null;
  cityId?: number | null;
  clusterId?: number | null;
  password: string;
}

interface BulkUserData {
  users: UserFormData[];
}

export default function UserManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkUserText, setBulkUserText] = useState("");
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    phone: "",
    email: "",
    userId: "",
    role: "hr",
    managerId: null,
    cityId: null,
    clusterId: null,
    password: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch cities and other master data
  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ["/api/master-data/cities"],
  });

  const { data: clusters = [] } = useQuery<any[]>({
    queryKey: ["/api/master-data/clusters"],
  });

  // Ensure data is always an array to prevent map errors
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeClusters = Array.isArray(clusters) ? clusters : [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      apiRequest("/api/users", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Bulk create users mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (data: BulkUserData) =>
      apiRequest("/api/users/bulk", {
        method: "POST",
        body: data,
      }),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setBulkDialogOpen(false);
      setBulkUserText("");
      toast({
        title: "Bulk Import Complete",
        description: `Created ${response.created} users. ${response.errors.length} errors.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import users",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      apiRequest(`/api/users/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      userId: "",
      role: "hr",
      managerId: null,
      cityId: null,
      clusterId: null,
      password: "",
    });
  };

  const handleCreateUser = () => {
    // Validation
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push("Name is required");
    }
    
    if (!formData.phone || formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
      errors.push("Phone must be exactly 10 digits");
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    
    if (!formData.userId || !/^\d+$/.test(formData.userId)) {
      errors.push("User ID must be numeric only");
    }
    
    if (!formData.password.trim()) {
      errors.push("Password is required");
    }
    
    if (!formData.role) {
      errors.push("Role is required");
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    createUserMutation.mutate(formData);
  };

  const handleBulkImport = () => {
    try {
      const lines = bulkUserText.trim().split('\n');
      const users = lines.map((line, index) => {
        const [name, phone, email, userId, role, password] = line.split(',').map(s => s.trim());
        
        // Validation for each line
        if (!name) throw new Error(`Line ${index + 1}: Name is required`);
        if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
          throw new Error(`Line ${index + 1}: Phone must be exactly 10 digits`);
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error(`Line ${index + 1}: Invalid email address`);
        }
        if (!userId || !/^\d+$/.test(userId)) {
          throw new Error(`Line ${index + 1}: User ID must be numeric only`);
        }
        if (!password) throw new Error(`Line ${index + 1}: Password is required`);
        
        return {
          name,
          phone,
          email,
          userId,
          role: role || 'hr',
          password,
          managerId: null,
          cityId: null,
          clusterId: null,
        };
      });

      bulkCreateMutation.mutate({ users });
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message || "Invalid format. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'recruiter': return 'bg-green-100 text-green-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'trainer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Import Users</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>CSV Format</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Format: Name, Phone (10 digits), Email, User ID (numeric), Role, Password (one per line)
                  </p>
                  <Textarea
                    placeholder="John Doe, 1234567890, john@company.com, 12345, hr, password123"
                    value={bulkUserText}
                    onChange={(e) => setBulkUserText(e.target.value)}
                    rows={10}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkImport}
                    disabled={bulkCreateMutation.isPending}
                  >
                    {bulkCreateMutation.isPending ? "Importing..." : "Import Users"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (10 digits)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData(prev => ({ ...prev, phone: value }));
                    }}
                    placeholder="1234567890"
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                  {formData.phone && formData.phone.length !== 10 && (
                    <p className="text-sm text-red-500 mt-1">Phone must be exactly 10 digits</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@company.com"
                  />
                  {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <p className="text-sm text-red-500 mt-1">Please enter a valid email address</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="userId">User ID (numeric)</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, userId: value }));
                    }}
                    placeholder="12345"
                    pattern="[0-9]+"
                  />
                  {formData.userId && !/^\d+$/.test(formData.userId) && (
                    <p className="text-sm text-red-500 mt-1">User ID must be numeric only</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role || "hr"}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="manager">Manager</Label>
                  <Select
                    value={formData.managerId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, managerId: value ? parseInt(value) : null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Manager</SelectItem>
                      {users?.filter(u => u.role === 'manager' || u.role === 'admin').map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.userId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={formData.cityId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cityId: value ? parseInt(value) : null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No City</SelectItem>
                      {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cluster">Cluster</Label>
                  <Select
                    value={formData.clusterId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clusterId: value ? parseInt(value) : null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cluster (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Cluster</SelectItem>
                      {safeClusters.map((cluster) => (
                        <SelectItem key={cluster.id} value={cluster.id.toString()}>
                          {cluster.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.managerId ? `Manager ${user.managerId}` : '-'}
                  </TableCell>
                  <TableCell>
                    {user.cityId ? safeCities.find(c => c.id === user.cityId)?.name || `City ${user.cityId}` : '-'}
                  </TableCell>
                  <TableCell>
                    {user.clusterId ? safeClusters.find(c => c.id === user.clusterId)?.name || `Cluster ${user.clusterId}` : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label>User ID</Label>
                    <p className="font-medium">{selectedUser.userId}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Badge className={getRoleBadgeColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <Label>Manager</Label>
                    <p className="font-medium">
                      {selectedUser.managerId ? `Manager ${selectedUser.managerId}` : 'No Manager'}
                    </p>
                  </div>
                  <div>
                    <Label>City</Label>
                    <p className="font-medium">
                      {selectedUser.cityId ? cities?.find(c => c.id === selectedUser.cityId)?.name || `City ${selectedUser.cityId}` : 'No City'}
                    </p>
                  </div>
                  <div>
                    <Label>Cluster</Label>
                    <p className="font-medium">
                      {selectedUser.clusterId ? safeClusters.find(c => c.id === selectedUser.clusterId)?.name || `Cluster ${selectedUser.clusterId}` : 'No Cluster'}
                    </p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="audit">
                <UserAuditTrail userId={selectedUser.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserAuditTrail({ userId }: { userId: number }) {
  const { data: auditTrail = [], isLoading } = useQuery({
    queryKey: ["/api/users", userId, "audit"],
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading audit trail...</div>;
  }

  return (
    <div className="space-y-2">
      {auditTrail.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No audit trail available</p>
      ) : (
        auditTrail.map((entry: any, index: number) => (
          <div key={index} className="border rounded p-3 space-y-1">
            <div className="flex justify-between items-start">
              <span className="font-medium">{entry.action}</span>
              <span className="text-sm text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{entry.details}</p>
            {entry.changedBy && (
              <p className="text-xs text-gray-500">Changed by: User {entry.changedBy}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}