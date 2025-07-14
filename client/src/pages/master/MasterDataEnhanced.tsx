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
    cityId: "1",
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

  // Ensure data is always an array to prevent map errors
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeClusters = Array.isArray(clusters) ? clusters : [];
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const safeRecruiters = Array.isArray(recruiters) ? recruiters : [];

  // Create mutations
  const createCityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/master-data/city", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-data/city"] });
      setFormData({ ...formData, name: "", code: "" });
      toast({
        title: "Success",
        description: "City created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create city",
        variant: "destructive",
      });
    },
  });

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
      code: formData.code,
    });
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

      <div className="max-w-7xl mx-auto px-6 pb-8">
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

          {/* Placeholder tabs for now */}
          <TabsContent value="clusters">
            <Card className="shadow-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-emerald-600" />
                  Clusters Coming Soon
                </CardTitle>
                <CardDescription>Enhanced cluster management will be available here</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card className="shadow-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Roles Coming Soon
                </CardTitle>
                <CardDescription>Enhanced role management will be available here</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card className="shadow-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  Vendors Coming Soon
                </CardTitle>
                <CardDescription>Enhanced vendor management will be available here</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="recruiters">
            <Card className="shadow-md border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-indigo-600" />
                  Recruiters Coming Soon
                </CardTitle>
                <CardDescription>Enhanced recruiter management will be available here</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}