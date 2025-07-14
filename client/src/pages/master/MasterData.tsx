import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { City, Cluster, Role, Vendor, Recruiter } from "@/types";
import { Plus, MapPin, Building2, Briefcase, Users, UserCheck, Edit } from "lucide-react";

export default function MasterData() {
  const [selectedCityId, setSelectedCityId] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<string>("");
  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    description: "",
    email: "",
    phone: "",
    contactPerson: "",
    commercialTerms: "",
    replacementPeriod: "",
    incentiveStructure: "",
    cityId: "1",
  });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    email: "",
    phone: "",
    contactPerson: "",
    commercialTerms: "",
    replacementPeriod: "",
    incentiveStructure: "",
    cityId: "1", // Default to first city to avoid empty string
  });
  const { toast } = useToast();

  const { data: cities = [], isLoading: loadingCities } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clusters = [], isLoading: loadingClusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["/api/master-data/role"],
  });

  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ["/api/master-data/vendor"],
  });

  const { data: recruiters = [], isLoading: loadingRecruiters } = useQuery({
    queryKey: ["/api/master-data/recruiter"],
  });

  // Ensure data is always an array to prevent map errors - SHOW ALL ITEMS INCLUDING INACTIVE
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeClusters = Array.isArray(clusters) ? clusters : [];
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const safeRecruiters = Array.isArray(recruiters) ? recruiters : [];

  const createCityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/master-data/city", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/city"] });
      toast({
        title: "Success",
        description: "City created successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create city",
        variant: "destructive",
      });
    },
  });

  const createClusterMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/master-data/cluster", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/cluster"] });
      toast({
        title: "Success",
        description: "Cluster created successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create cluster",
        variant: "destructive",
      });
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/master-data/role", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/role"] });
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/master-data/vendor", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/vendor"] });
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor",
        variant: "destructive",
      });
    },
  });

  const createRecruiterMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/master-data/recruiter", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/recruiter"] });
      toast({
        title: "Success",
        description: "Recruiter created successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recruiter",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      email: "",
      phone: "",
      contactPerson: "",
      commercialTerms: "",
      replacementPeriod: "",
      incentiveStructure: "",
      cityId: "1",
    });
    setSelectedCityId("");
  };

  const handleCreateCity = () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCityMutation.mutate({
      name: formData.name,
      code: formData.code.toUpperCase(),
    });
  };

  const handleCreateCluster = () => {
    if (!formData.name || !formData.code || !formData.cityId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createClusterMutation.mutate({
      name: formData.name,
      code: formData.code.toUpperCase(),
      cityId: parseInt(formData.cityId),
    });
  };

  const handleCreateRole = () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createRoleMutation.mutate({
      name: formData.name,
      code: formData.code.toUpperCase(),
      description: formData.description,
    });
  };

  const handleCreateVendor = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createVendorMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      contactPerson: formData.contactPerson,
      commercialTerms: formData.commercialTerms,
      replacementPeriod: formData.replacementPeriod ? parseInt(formData.replacementPeriod) : undefined,
    });
  };

  const handleCreateRecruiter = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createRecruiterMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      incentiveStructure: formData.incentiveStructure,
    });
  };

  // Edit and Delete handlers
  const handleEditCity = (city: City) => {
    setEditingItem(city);
    setEditType("city");
    setEditFormData({
      name: city.name,
      code: city.code,
      description: "",
      email: "",
      phone: "",
      contactPerson: "",
      commercialTerms: "",
      replacementPeriod: "",
      incentiveStructure: "",
      cityId: "1",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editType) return;
    
    try {
      const endpoint = `/api/master-data/${editType}/${editingItem.id}`;
      const updateData = {
        name: editFormData.name,
        code: editFormData.code,
        ...(editType === 'role' && { description: editFormData.description }),
        ...(editType === 'vendor' && { 
          email: editFormData.email,
          phone: editFormData.phone,
          contactPerson: editFormData.contactPerson,
          commercialTerms: editFormData.commercialTerms,
          replacementPeriod: editFormData.replacementPeriod ? parseInt(editFormData.replacementPeriod) : undefined
        }),
        ...(editType === 'recruiter' && { 
          email: editFormData.email,
          phone: editFormData.phone,
          incentiveStructure: editFormData.incentiveStructure
        }),
        ...(editType === 'cluster' && { cityId: parseInt(editFormData.cityId) })
      };

      await apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/master-data/${editType}`] });
      toast({
        title: "Success",
        description: `${editType.charAt(0).toUpperCase() + editType.slice(1)} updated successfully`,
      });
      
      setEditingItem(null);
      setEditType("");
      setEditFormData({
        name: "",
        code: "",
        description: "",
        email: "",
        phone: "",
        contactPerson: "",
        commercialTerms: "",
        replacementPeriod: "",
        incentiveStructure: "",
        cityId: "1",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleToggleCityStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/master-data/city/${id}/toggle-status`, {
        method: "PATCH",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/city"] });
      toast({
        title: "Success",
        description: `City ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update city status",
        variant: "destructive",
      });
    }
  };

  const handleEditCluster = (cluster: Cluster) => {
    setEditingItem(cluster);
    setEditType("cluster");
    setEditFormData({
      name: cluster.name,
      code: cluster.code,
      description: "",
      email: "",
      phone: "",
      contactPerson: "",
      commercialTerms: "",
      replacementPeriod: "",
      incentiveStructure: "",
      cityId: cluster.cityId.toString(),
    });
  };

  const handleToggleClusterStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/master-data/cluster/${id}/toggle-status`, {
        method: "PATCH",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/cluster"] });
      toast({
        title: "Success",
        description: `Cluster ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cluster status",
        variant: "destructive",
      });
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingItem(role);
    setEditType("role");
    setEditFormData({
      name: role.name,
      code: role.code,
      description: role.description || "",
      email: "",
      phone: "",
      contactPerson: "",
      commercialTerms: "",
      replacementPeriod: "",
      incentiveStructure: "",
      cityId: "1",
    });
  };

  const handleToggleRoleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/master-data/role/${id}/toggle-status`, {
        method: "PATCH",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/role"] });
      toast({
        title: "Success",
        description: `Role ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role status",
        variant: "destructive",
      });
    }
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingItem(vendor);
    setEditType("vendor");
    setEditFormData({
      name: vendor.name,
      code: "",
      description: "",
      email: vendor.email,
      phone: vendor.phone || "",
      contactPerson: vendor.contactPerson || "",
      commercialTerms: vendor.commercialTerms || "",
      replacementPeriod: vendor.replacementPeriod?.toString() || "",
      incentiveStructure: "",
      cityId: "1",
    });
  };

  const handleToggleVendorStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/master-data/vendor/${id}/toggle-status`, {
        method: "PATCH",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/vendor"] });
      toast({
        title: "Success",
        description: `Vendor ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor status",
        variant: "destructive",
      });
    }
  };

  const handleEditRecruiter = (recruiter: Recruiter) => {
    setEditingItem(recruiter);
    setEditType("recruiter");
    setEditFormData({
      name: recruiter.name,
      code: "",
      description: "",
      email: recruiter.email,
      phone: recruiter.phone || "",
      contactPerson: "",
      commercialTerms: "",
      replacementPeriod: "",
      incentiveStructure: recruiter.incentiveStructure || "",
      cityId: "1",
    });
  };

  const handleToggleRecruiterStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/master-data/recruiter/${id}/toggle-status`, {
        method: "PATCH",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/recruiter"] });
      toast({
        title: "Success",
        description: `Recruiter ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update recruiter status",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Master Data Management</h2>
        <p className="text-slate-600 mt-1">Manage all master data including cities, clusters, roles, vendors, and recruiters</p>
      </div>

      <Tabs defaultValue="cities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
        </TabsList>

        <TabsContent value="cities">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Cities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCities ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeCities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No cities found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeCities.map((city: City) => (
                        <TableRow key={city.id}>
                          <TableCell className="font-medium">{city.name}</TableCell>
                          <TableCell className="font-mono">{city.code}</TableCell>
                          <TableCell>
                            <Badge variant={city.isActive ? "default" : "secondary"}>
                              {city.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(city.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditCity(city)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {city.isActive ? "Active" : "Inactive"}
                                </span>
                                <Switch
                                  checked={city.isActive}
                                  onCheckedChange={() => handleToggleCityStatus(city.id, city.isActive)}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New City</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cityName">City Name</Label>
                  <Input
                    id="cityName"
                    placeholder="Enter city name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cityCode">City Code</Label>
                  <Input
                    id="cityCode"
                    placeholder="Enter city code (e.g., MUM)"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateCity}
                  disabled={createCityMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createCityMutation.isPending ? "Creating..." : "Create City"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clusters">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Clusters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingClusters ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeClusters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No clusters found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeClusters.map((cluster: Cluster) => (
                        <TableRow key={cluster.id}>
                          <TableCell className="font-medium">{cluster.name}</TableCell>
                          <TableCell className="font-mono">{cluster.code}</TableCell>
                          <TableCell>
                            {safeCities.find((city: City) => city.id === cluster.cityId)?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cluster.isActive ? "default" : "secondary"}>
                              {cluster.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditCluster(cluster)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {cluster.isActive ? "Active" : "Inactive"}
                                </span>
                                <Switch
                                  checked={cluster.isActive}
                                  onCheckedChange={() => handleToggleClusterStatus(cluster.id, cluster.isActive)}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Cluster</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clusterCity">City</Label>
                  <Select
                    value={formData.cityId}
                    onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeCities.map((city: City) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="clusterName">Cluster Name</Label>
                  <Input
                    id="clusterName"
                    placeholder="Enter cluster name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clusterCode">Cluster Code</Label>
                  <Input
                    id="clusterCode"
                    placeholder="Enter cluster code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateCluster}
                  disabled={createClusterMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createClusterMutation.isPending ? "Creating..." : "Create Cluster"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="w-80">Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingRoles ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : safeRoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No roles found
                          </TableCell>
                        </TableRow>
                      ) : (
                        safeRoles.map((role: Role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell className="font-mono">{role.code}</TableCell>
                            <TableCell className="w-80">
                              <div className="max-w-80 overflow-x-auto">
                                <div className="text-sm leading-5 whitespace-nowrap pr-4">
                                  {role.description || "No description"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={role.isActive ? "default" : "secondary"}>
                                {role.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditRole(role)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">
                                    {role.isActive ? "Active" : "Inactive"}
                                  </span>
                                  <Switch
                                    checked={role.isActive}
                                    onCheckedChange={() => handleToggleRoleStatus(role.id, role.isActive)}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    placeholder="Enter role name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roleCode">Role Code</Label>
                  <Input
                    id="roleCode"
                    placeholder="Enter role code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    placeholder="Enter role description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Vendors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingVendors ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeVendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No vendors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeVendors.map((vendor: Vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>{vendor.contactPerson || "N/A"}</TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>{vendor.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={vendor.isActive ? "default" : "secondary"}>
                              {vendor.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditVendor(vendor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {vendor.isActive ? "Active" : "Inactive"}
                                </span>
                                <Switch
                                  checked={vendor.isActive}
                                  onCheckedChange={() => handleToggleVendorStatus(vendor.id, vendor.isActive)}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Vendor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vendorName">Vendor Name</Label>
                  <Input
                    id="vendorName"
                    placeholder="Enter vendor name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vendorEmail">Email</Label>
                  <Input
                    id="vendorEmail"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vendorPhone">Phone</Label>
                  <Input
                    id="vendorPhone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="commercialTerms">Commercial Terms</Label>
                  <Textarea
                    id="commercialTerms"
                    placeholder="Enter commercial terms"
                    value={formData.commercialTerms}
                    onChange={(e) => setFormData({ ...formData, commercialTerms: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="replacementPeriod">Replacement Period (days)</Label>
                  <Input
                    id="replacementPeriod"
                    type="number"
                    placeholder="Enter replacement period"
                    value={formData.replacementPeriod}
                    onChange={(e) => setFormData({ ...formData, replacementPeriod: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateVendor}
                  disabled={createVendorMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createVendorMutation.isPending ? "Creating..." : "Create Vendor"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recruiters">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Recruiters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingRecruiters ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeRecruiters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No recruiters found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeRecruiters.map((recruiter: Recruiter) => (
                        <TableRow key={recruiter.id}>
                          <TableCell className="font-medium">{recruiter.name}</TableCell>
                          <TableCell>{recruiter.email}</TableCell>
                          <TableCell>{recruiter.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={recruiter.isActive ? "default" : "secondary"}>
                              {recruiter.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditRecruiter(recruiter)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {recruiter.isActive ? "Active" : "Inactive"}
                                </span>
                                <Switch
                                  checked={recruiter.isActive}
                                  onCheckedChange={() => handleToggleRecruiterStatus(recruiter.id, recruiter.isActive)}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Recruiter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recruiterName">Recruiter Name</Label>
                  <Input
                    id="recruiterName"
                    placeholder="Enter recruiter name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="recruiterEmail">Email</Label>
                  <Input
                    id="recruiterEmail"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="recruiterPhone">Phone</Label>
                  <Input
                    id="recruiterPhone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="incentiveStructure">Incentive Structure</Label>
                  <Textarea
                    id="incentiveStructure"
                    placeholder="Enter incentive structure details"
                    value={formData.incentiveStructure}
                    onChange={(e) => setFormData({ ...formData, incentiveStructure: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateRecruiter}
                  disabled={createRecruiterMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createRecruiterMutation.isPending ? "Creating..." : "Create Recruiter"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => {
        setEditingItem(null);
        setEditType("");
        setEditFormData({
          name: "",
          code: "",
          description: "",
          email: "",
          phone: "",
          contactPerson: "",
          commercialTerms: "",
          replacementPeriod: "",
          incentiveStructure: "",
          cityId: "1",
        });
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editType?.charAt(0).toUpperCase()}{editType?.slice(1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                placeholder="Enter name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>

            {editType !== "recruiter" && (
              <div>
                <Label htmlFor="editCode">Code</Label>
                <Input
                  id="editCode"
                  placeholder="Enter code"
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                />
              </div>
            )}

            {editType === "role" && (
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  placeholder="Enter description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            {editType === "cluster" && (
              <div>
                <Label htmlFor="editClusterCity">City</Label>
                <Select
                  value={editFormData.cityId}
                  onValueChange={(value) => setEditFormData({ ...editFormData, cityId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeCities.map((city: City) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(editType === "vendor" || editType === "recruiter") && (
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  placeholder="Enter email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
            )}

            {(editType === "vendor" || editType === "recruiter") && (
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  placeholder="Enter phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            )}

            {editType === "vendor" && (
              <>
                <div>
                  <Label htmlFor="editContactPerson">Contact Person</Label>
                  <Input
                    id="editContactPerson"
                    placeholder="Enter contact person"
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editCommercialTerms">Commercial Terms</Label>
                  <Input
                    id="editCommercialTerms"
                    placeholder="Enter commercial terms"
                    value={editFormData.commercialTerms}
                    onChange={(e) => setEditFormData({ ...editFormData, commercialTerms: e.target.value })}
                  />
                </div>
              </>
            )}

            {editType === "recruiter" && (
              <div>
                <Label htmlFor="editIncentiveStructure">Incentive Structure</Label>
                <Input
                  id="editIncentiveStructure"
                  placeholder="Enter incentive structure"
                  value={editFormData.incentiveStructure}
                  onChange={(e) => setEditFormData({ ...editFormData, incentiveStructure: e.target.value })}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setEditType("");
                  setEditFormData({
                    name: "",
                    code: "",
                    description: "",
                    email: "",
                    phone: "",
                    contactPerson: "",
                    commercialTerms: "",
                    replacementPeriod: "",
                    incentiveStructure: "",
                    cityId: "1",
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
