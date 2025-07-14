import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { City, Cluster, Role, Vendor, Recruiter } from "@/types";
import { Plus, MapPin, Building2, Briefcase, Users, UserCheck, Edit, Settings, Database, Activity } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50">
      {/* Enhanced Header */}
      <div className="mb-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Master Data Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Configure and manage core system data across all modules
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Cities</span>
              </div>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{safeCities.length}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Clusters</span>
              </div>
              <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">{safeClusters.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Roles</span>
              </div>
              <p className="text-xl font-bold text-purple-800 dark:text-purple-200">{safeRoles.length}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Vendors</span>
              </div>
              <p className="text-xl font-bold text-orange-800 dark:text-orange-200">{safeVendors.length}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Recruiters</span>
              </div>
              <p className="text-xl font-bold text-indigo-800 dark:text-indigo-200">{safeRecruiters.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="cities" className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <TabsList className="grid w-full grid-cols-5 bg-slate-50 dark:bg-slate-800">
              <TabsTrigger 
                value="cities" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Cities
              </TabsTrigger>
              <TabsTrigger 
                value="clusters"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Clusters
              </TabsTrigger>
              <TabsTrigger 
                value="roles"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger 
                value="vendors"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Vendors
              </TabsTrigger>
              <TabsTrigger 
                value="recruiters"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Recruiters
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cities" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <Card className="xl:col-span-3 shadow-md border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-blue-900 dark:text-blue-100">City Management</CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                          Manage geographical locations and territories
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                      {safeCities.filter(c => c.isActive).length} Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow className="border-slate-200 dark:border-slate-700">
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Code</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Created</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingCities ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <div className="flex items-center justify-center space-x-3">
                                <Activity className="h-5 w-5 animate-spin text-blue-600" />
                                <span className="text-slate-600 dark:text-slate-400">Loading cities...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : safeCities.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <div className="flex flex-col items-center space-y-3">
                                <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                <span className="text-slate-500 dark:text-slate-400 font-medium">No cities found</span>
                                <span className="text-slate-400 dark:text-slate-500 text-sm">Create your first city to get started</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          safeCities.map((city: City, index) => (
                            <TableRow 
                              key={city.id} 
                              className={`hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors border-slate-100 dark:border-slate-700 ${
                                index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/30'
                              }`}
                            >
                              <TableCell className="font-semibold text-slate-800 dark:text-slate-200 py-4">
                                {city.name}
                              </TableCell>
                              <TableCell className="font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-xs font-medium w-fit">
                                {city.code}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={city.isActive ? "default" : "secondary"}
                                  className={city.isActive 
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" 
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-600"
                                  }
                                >
                                  <div className={`w-2 h-2 rounded-full mr-2 ${city.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                  {city.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400">
                                {new Date(city.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditCity(city)}
                                    className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                      {city.isActive ? "Active" : "Inactive"}
                                    </span>
                                    <Switch
                                      checked={city.isActive}
                                      onCheckedChange={() => handleToggleCityStatus(city.id, city.isActive)}
                                      className="data-[state=checked]:bg-blue-600"
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

              <Card className="shadow-md border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Add New City</CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300">
                        Create a new geographical location
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="cityName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      City Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cityName"
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cityCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      City Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cityCode"
                      placeholder="3-letter code (e.g., MUM, DEL, BLR)"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      maxLength={3}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    onClick={handleCreateCity}
                    disabled={createCityMutation.isPending || !formData.name || !formData.code}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {createCityMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Create City</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clusters" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <Card className="xl:col-span-3 shadow-md border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/30 border-b border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-600 rounded-lg">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-emerald-900 dark:text-emerald-100">Cluster Management</CardTitle>
                        <CardDescription className="text-emerald-700 dark:text-emerald-300">
                          Manage operational areas within cities
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                      {safeClusters.filter(c => c.isActive).length} Active
                    </Badge>
                  </div>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
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
                          <TableCell className="max-w-xs truncate">
                            {role.description || "No description"}
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
        </Tabs>
      </div>
    </div>
  );
}
