import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { City, Cluster, Role, Vendor, Recruiter, Paygroup, BusinessUnit, Department, SubDepartment } from "@/types";
import { MapPin, Building2, Briefcase, Users, UserCheck, Edit, Eye, DollarSign, Building, Layers, FolderTree } from "lucide-react";

import { useEffect } from "react";

export default function MasterData() {
  useEffect(() => {
    // Invalidate queries to ensure fresh data on component mount
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/city"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/cluster"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/paygroup"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/business-unit"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/department"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/sub-department"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/role"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/vendor"] });
    queryClient.invalidateQueries({ queryKey: ["/api/master-data/recruiter"] });
  }, []);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<string>("");
  const [vendorDetailsOpen, setVendorDetailsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    description: "",
    email: "",
    phone: "",
    contactPerson: "",
    commercialTerms: "",
    replacementPeriod: "",
    cityId: "1",
    jobDescriptionFile: null as File | null,
    paygroup: "",
    businessUnit: "",
    department: "",
    subDepartment: "",
    // Commercial terms
    managementFees: "",
    sourcingFee: "",
    replacementDays: "",
    // Contact details
    deliveryLeadName: "",
    deliveryLeadEmail: "",
    deliveryLeadPhone: "",
    businessHeadName: "",
    businessHeadEmail: "",
    businessHeadPhone: "",
    payrollSpocName: "",
    payrollSpocEmail: "",
    payrollSpocPhone: "",
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
    cityId: "1", // Default to first city to avoid empty string
    jobDescriptionFile: null as File | null,
    paygroup: "",
    businessUnit: "",
    department: "",
    subDepartment: "",
    // Commercial terms
    managementFees: "",
    sourcingFee: "",
    replacementDays: "",
    // Contact details
    deliveryLeadName: "",
    deliveryLeadEmail: "",
    deliveryLeadPhone: "",
    businessHeadName: "",
    businessHeadEmail: "",
    businessHeadPhone: "",
    payrollSpocName: "",
    payrollSpocEmail: "",
    payrollSpocPhone: "",
  });
  const { toast } = useToast();

  const { data: cities = [], isLoading: loadingCities } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clusters = [], isLoading: loadingClusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

  const { data: paygroups = [], isLoading: loadingPaygroups } = useQuery({
    queryKey: ["/api/master-data/paygroup"],
  });

  const { data: businessUnits = [], isLoading: loadingBusinessUnits } = useQuery({
    queryKey: ["/api/master-data/business-unit"],
  });

  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ["/api/master-data/department"],
  });

  const { data: subDepartments = [], isLoading: loadingSubDepartments } = useQuery({
    queryKey: ["/api/master-data/sub-department"],
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
  const safePaygroups = Array.isArray(paygroups) ? paygroups : [];
  const safeBusinessUnits = Array.isArray(businessUnits) ? businessUnits : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeSubDepartments = Array.isArray(subDepartments) ? subDepartments : [];
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
      // Explicitly format the data to ensure proper field names
      const formattedData = {
        name: data.name,
        code: data.code,
        city_id: data.cityId // Explicitly use snake_case for backend
      };
      return await apiRequest("/api/master-data/cluster", {
        method: "POST",
        body: formattedData,
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
    mutationFn: async (data: FormData) => {
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
    const newFormData = {
      name: "",
      code: "",
      description: "",
      email: "",
      phone: "",
      contactPerson: "",
      commercialTerms: "",
      replacementPeriod: "",
      cityId: "1",
      jobDescriptionFile: null,
      paygroup: "",
      businessUnit: "",
      department: "",
      // Commercial terms
      managementFees: "",
      sourcingFee: "",
      replacementDays: "",
      // Contact details
      deliveryLeadName: "",
      deliveryLeadEmail: "",
      deliveryLeadPhone: "",
      businessHeadName: "",
      businessHeadEmail: "",
      businessHeadPhone: "",
      payrollSpocName: "",
      payrollSpocEmail: "",
      payrollSpocPhone: "",
    };
    
    // Reset city-specific SPOC data
    safeCities.forEach((city: City) => {
      (newFormData as any)[`citySpoc_${city.id}_name`] = "";
      (newFormData as any)[`citySpoc_${city.id}_email`] = "";
      (newFormData as any)[`citySpoc_${city.id}_phone`] = "";
    });
    
    setFormData(newFormData as any);

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

  const handleCreateRole = async () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    console.log('Creating role with form data:', formData);

    const roleData = new FormData();
    roleData.append('name', formData.name);
    roleData.append('code', formData.code.toUpperCase());
    roleData.append('description', formData.description);
    roleData.append('paygroup', formData.paygroup || '');
    roleData.append('businessUnit', formData.businessUnit || '');
    roleData.append('department', formData.department || '');
    roleData.append('subDepartment', formData.subDepartment || '');
    if (formData.jobDescriptionFile) {
      roleData.append('jobDescriptionFile', formData.jobDescriptionFile);
    }
    
    console.log('FormData contents:');
    for (let [key, value] of roleData.entries()) {
      console.log(key, value);
    }
    
    try {
      console.log('Sending API request...');
      const result = await createRoleMutation.mutateAsync(roleData);
      console.log('API response:', result);
      setFormData({ ...formData, name: "", code: "", description: "", paygroup: "", businessUnit: "", department: "", subDepartment: "", jobDescriptionFile: null });
      // Reset file input
      const fileInput = document.getElementById('roleJD') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error("Error creating role:", error);
    }
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

    // Collect city-specific SPOC data
    const citySpocData = {};
    safeCities.forEach((city: City) => {
      const name = (formData as any)[`citySpoc_${city.id}_name`];
      const email = (formData as any)[`citySpoc_${city.id}_email`];
      const phone = (formData as any)[`citySpoc_${city.id}_phone`];
      
      if (name || email || phone) {
        (citySpocData as any)[city.id] = {
          name: name || "",
          email: email || "",
          phone: phone || "",
          cityId: city.id,
          cityName: city.name,
        };
      }
    });

    createVendorMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      contactPerson: formData.contactPerson,
      commercialTerms: formData.commercialTerms,
      // Commercial terms (removed duplicate replacementPeriod)
      managementFees: formData.managementFees ? parseFloat(formData.managementFees) : undefined,
      sourcingFee: formData.sourcingFee ? parseFloat(formData.sourcingFee) : undefined,
      replacementDays: formData.replacementDays ? parseInt(formData.replacementDays) : undefined,
      // Contact details
      deliveryLeadName: formData.deliveryLeadName,
      deliveryLeadEmail: formData.deliveryLeadEmail,
      deliveryLeadPhone: formData.deliveryLeadPhone,
      businessHeadName: formData.businessHeadName,
      businessHeadEmail: formData.businessHeadEmail,
      businessHeadPhone: formData.businessHeadPhone,
      payrollSpocName: formData.payrollSpocName,
      payrollSpocEmail: formData.payrollSpocEmail,
      payrollSpocPhone: formData.payrollSpocPhone,
      // City-specific SPOC data
      citySpocData,
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
      cityId: parseInt(formData.cityId),
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
    } as any);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editType) return;
    
    try {
      const endpoint = `/api/master-data/${editType}/${editingItem.id}`;
      
      // Handle file uploads for roles
      if (editType === 'role' && editFormData.jobDescriptionFile) {
        const formData = new FormData();
        formData.append('name', editFormData.name);
        formData.append('code', editFormData.code);
        formData.append('description', editFormData.description || '');
        if (editFormData.paygroup) formData.append('paygroupId', editFormData.paygroup);
        if (editFormData.businessUnit) formData.append('businessUnitId', editFormData.businessUnit);
        if (editFormData.department) formData.append('departmentId', editFormData.department);
        if (editFormData.subDepartment) formData.append('subDepartmentId', editFormData.subDepartment);
        formData.append('jobDescriptionFile', editFormData.jobDescriptionFile);
        
        await apiRequest(endpoint, {
          method: "PATCH",
          body: formData,
        });
      } else {
        // Handle regular updates
        const updateData = {
          name: editFormData.name,
          code: editFormData.code,
          ...(editType === 'role' && { 
            description: editFormData.description,
            paygroupId: editFormData.paygroup ? parseInt(editFormData.paygroup) : undefined,
            businessUnitId: editFormData.businessUnit ? parseInt(editFormData.businessUnit) : undefined,
            departmentId: editFormData.department ? parseInt(editFormData.department) : undefined,
            subDepartmentId: editFormData.subDepartment ? parseInt(editFormData.subDepartment) : undefined
          }),
          ...(editType === 'vendor' && { 
            email: editFormData.email,
            phone: editFormData.phone,
            contactPerson: editFormData.contactPerson,
            commercialTerms: editFormData.commercialTerms,
            replacementPeriod: editFormData.replacementPeriod ? parseInt(editFormData.replacementPeriod) : undefined,
            // Commercial terms
            managementFees: editFormData.managementFees ? parseFloat(editFormData.managementFees) : undefined,
            sourcingFee: editFormData.sourcingFee ? parseFloat(editFormData.sourcingFee) : undefined,
            replacementDays: editFormData.replacementDays ? parseInt(editFormData.replacementDays) : undefined,
            // Contact details
            deliveryLeadName: editFormData.deliveryLeadName,
            deliveryLeadEmail: editFormData.deliveryLeadEmail,
            deliveryLeadPhone: editFormData.deliveryLeadPhone,
            cityRecruitmentSpocName: (editFormData as any).cityRecruitmentSpocName,
            cityRecruitmentSpocEmail: (editFormData as any).cityRecruitmentSpocEmail,
            cityRecruitmentSpocPhone: (editFormData as any).cityRecruitmentSpocPhone,
            businessHeadName: editFormData.businessHeadName,
            businessHeadEmail: editFormData.businessHeadEmail,
            businessHeadPhone: editFormData.businessHeadPhone,
            payrollSpocName: editFormData.payrollSpocName,
            payrollSpocEmail: editFormData.payrollSpocEmail,
            payrollSpocPhone: editFormData.payrollSpocPhone,
          }),
          ...(editType === 'recruiter' && { 
            email: editFormData.email,
            phone: editFormData.phone,
            incentiveStructure: (editFormData as any).incentiveStructure
          }),
          ...(editType === 'cluster' && { city_id: parseInt(editFormData.cityId) }), // Use snake_case for backend
          ...(editType === 'department' && { 
            businessUnitId: editFormData.businessUnit ? parseInt(editFormData.businessUnit) : undefined
          }),
          ...(editType === 'sub-department' && { 
            departmentId: editFormData.department ? parseInt(editFormData.department) : undefined
          })
        };

        await apiRequest(endpoint, {
          method: "PATCH",
          body: JSON.stringify(updateData),
        });
      }
      
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
        jobDescriptionFile: null,
      } as any);
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
      description: cluster.description || "",
      email: "",
      phone: "",
      contactPerson: "",
      commercialTerms: "",
      replacementPeriod: "",
      incentiveStructure: "",
      cityId: cluster.cityId.toString(),
    } as any);
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
      ...editFormData,
      name: role.name,
      code: role.code,
      description: role.description || "",
      paygroup: role.paygroupId?.toString() || "",
      businessUnit: role.businessUnitId?.toString() || "",
      department: role.departmentId?.toString() || "",
      subDepartment: role.subDepartmentId?.toString() || "",
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

  const handleViewVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorDetailsOpen(true);
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
      replacementPeriod: (vendor as any).replacementPeriod?.toString() || "",
      incentiveStructure: "",
      cityId: "1",
      jobDescriptionFile: null,
      // Commercial terms
      managementFees: vendor.managementFees?.toString() || "",
      sourcingFee: vendor.sourcingFee?.toString() || "",
      replacementDays: vendor.replacementDays?.toString() || "",
      // Contact details
      deliveryLeadName: vendor.deliveryLeadName || "",
      deliveryLeadEmail: vendor.deliveryLeadEmail || "",
      deliveryLeadPhone: vendor.deliveryLeadPhone || "",

      businessHeadName: vendor.businessHeadName || "",
      businessHeadEmail: vendor.businessHeadEmail || "",
      businessHeadPhone: vendor.businessHeadPhone || "",
      payrollSpocName: vendor.payrollSpocName || "",
      payrollSpocEmail: vendor.payrollSpocEmail || "",
      payrollSpocPhone: vendor.payrollSpocPhone || "",
    } as any);
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
      cityId: recruiter.cityId?.toString() || "1",
      jobDescriptionFile: null,
    } as any);
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
        <TabsList className="grid w-full grid-cols-9 gap-1">
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="paygroups">Paygroups</TabsTrigger>
          <TabsTrigger value="business-units">Business Units</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="sub-departments">Sub Depts</TabsTrigger>
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
                            {new Date((city as any).createdAt).toLocaleDateString()}
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
                            {cluster.cityName || 'Not assigned'}
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

        {/* PAYGROUPS TAB */}
        <TabsContent value="paygroups">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Paygroups
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPaygroups ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safePaygroups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No paygroups found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safePaygroups.map((paygroup: Paygroup) => (
                        <TableRow key={paygroup.id}>
                          <TableCell className="font-medium">{paygroup.name}</TableCell>
                          <TableCell className="font-mono">{paygroup.code}</TableCell>
                          <TableCell>
                            <Badge variant={paygroup.isActive ? "default" : "secondary"}>
                              {paygroup.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(paygroup);
                                  setEditType("paygroup");
                                  setEditFormData({
                                    ...editFormData,
                                    name: paygroup.name,
                                    code: paygroup.code,
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={paygroup.isActive}
                                onCheckedChange={async () => {
                                  try {
                                    await apiRequest(`/api/master-data/paygroup/${paygroup.id}`, {
                                      method: "PATCH",
                                      body: { isActive: !paygroup.isActive },
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/master-data/paygroup"] });
                                    toast({
                                      title: "Success",
                                      description: `Paygroup ${!paygroup.isActive ? "activated" : "deactivated"} successfully`,
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: error.message || "Failed to update paygroup status",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              />
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
                <CardTitle>Add New Paygroup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paygroupName">Paygroup Name</Label>
                  <Input
                    id="paygroupName"
                    placeholder="Enter paygroup name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="paygroupCode">Paygroup Code</Label>
                  <Input
                    id="paygroupCode"
                    placeholder="Enter paygroup code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await apiRequest("/api/master-data/paygroup", {
                        method: "POST",
                        body: {
                          name: formData.name,
                          code: formData.code,
                        },
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/master-data/paygroup"] });
                      setFormData({ ...formData, name: "", code: "" });
                      toast({
                        title: "Success",
                        description: "Paygroup created successfully",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to create paygroup",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Paygroup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BUSINESS UNITS TAB */}
        <TabsContent value="business-units">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Business Units
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBusinessUnits ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeBusinessUnits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No business units found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeBusinessUnits.map((businessUnit: BusinessUnit) => (
                        <TableRow key={businessUnit.id}>
                          <TableCell className="font-medium">{businessUnit.name}</TableCell>
                          <TableCell className="font-mono">{businessUnit.code}</TableCell>
                          <TableCell>
                            <Badge variant={businessUnit.isActive ? "default" : "secondary"}>
                              {businessUnit.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(businessUnit);
                                  setEditType("business-unit");
                                  setEditFormData({
                                    ...editFormData,
                                    name: businessUnit.name,
                                    code: businessUnit.code,
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={businessUnit.isActive}
                                onCheckedChange={async () => {
                                  try {
                                    await apiRequest(`/api/master-data/business-unit/${businessUnit.id}`, {
                                      method: "PATCH",
                                      body: { isActive: !businessUnit.isActive },
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/master-data/business-unit"] });
                                    toast({
                                      title: "Success",
                                      description: `Business unit ${!businessUnit.isActive ? "activated" : "deactivated"} successfully`,
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: error.message || "Failed to update business unit status",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              />
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
                <CardTitle>Add New Business Unit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessUnitName">Business Unit Name</Label>
                  <Input
                    id="businessUnitName"
                    placeholder="Enter business unit name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="businessUnitCode">Business Unit Code</Label>
                  <Input
                    id="businessUnitCode"
                    placeholder="Enter business unit code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await apiRequest("/api/master-data/business-unit", {
                        method: "POST",
                        body: {
                          name: formData.name,
                          code: formData.code.toUpperCase(),
                        },
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/master-data/business-unit"] });
                      setFormData({ ...formData, name: "", code: "" });
                      toast({
                        title: "Success",
                        description: "Business unit created successfully",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to create business unit",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Business Unit
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DEPARTMENTS TAB */}
        <TabsContent value="departments">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Business Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingDepartments ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeDepartments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No departments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeDepartments.map((department: Department) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell className="font-mono">{department.code}</TableCell>
                          <TableCell className="text-sm">{department.businessUnitName || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={department.isActive ? "default" : "secondary"}>
                              {department.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(department);
                                  setEditType("department");
                                  setEditFormData({
                                    ...editFormData,
                                    name: department.name,
                                    code: department.code,
                                    businessUnit: department.businessUnitId?.toString() || "",
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={department.isActive}
                                onCheckedChange={async () => {
                                  try {
                                    await apiRequest(`/api/master-data/department/${department.id}`, {
                                      method: "PATCH",
                                      body: { isActive: !department.isActive },
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/master-data/department"] });
                                    toast({
                                      title: "Success",
                                      description: `Department ${!department.isActive ? "activated" : "deactivated"} successfully`,
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: error.message || "Failed to update department status",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              />
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
                <CardTitle>Add New Department</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    placeholder="Enter department name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="departmentCode">Department Code</Label>
                  <Input
                    id="departmentCode"
                    placeholder="Enter department code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="businessUnitSelect">Business Unit</Label>
                  <Select
                    value={formData.businessUnit || ""}
                    onValueChange={(value) => setFormData({ ...formData, businessUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeBusinessUnits.map((bu: BusinessUnit) => (
                        <SelectItem key={bu.id} value={bu.id.toString()}>
                          {bu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await apiRequest("/api/master-data/department", {
                        method: "POST",
                        body: {
                          name: formData.name,
                          code: formData.code,
                          businessUnitId: formData.businessUnit ? parseInt(formData.businessUnit) : null,
                        },
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/master-data/department"] });
                      setFormData({ ...formData, name: "", code: "", businessUnit: "" });
                      toast({
                        title: "Success",
                        description: "Department created successfully",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to create department",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Department
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SUB DEPARTMENTS TAB */}
        <TabsContent value="sub-departments">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderTree className="h-5 w-5 mr-2" />
                  Sub Departments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingSubDepartments ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeSubDepartments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No sub departments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeSubDepartments.map((subDepartment: SubDepartment) => (
                        <TableRow key={subDepartment.id}>
                          <TableCell className="font-medium">{subDepartment.name}</TableCell>
                          <TableCell className="font-mono">{subDepartment.code}</TableCell>
                          <TableCell className="text-sm">{subDepartment.departmentName || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={subDepartment.isActive ? "default" : "secondary"}>
                              {subDepartment.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(subDepartment);
                                  setEditType("sub-department");
                                  setEditFormData({
                                    ...editFormData,
                                    name: subDepartment.name,
                                    code: subDepartment.code,
                                    department: subDepartment.departmentId?.toString() || "",
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={subDepartment.isActive}
                                onCheckedChange={async () => {
                                  try {
                                    await apiRequest(`/api/master-data/sub-department/${subDepartment.id}`, {
                                      method: "PATCH",
                                      body: { isActive: !subDepartment.isActive },
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["/api/master-data/sub-department"] });
                                    toast({
                                      title: "Success",
                                      description: `Sub department ${!subDepartment.isActive ? "activated" : "deactivated"} successfully`,
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: error.message || "Failed to update sub department status",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              />
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
                <CardTitle>Add New Sub Department</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subDepartmentName">Sub Department Name</Label>
                  <Input
                    id="subDepartmentName"
                    placeholder="Enter sub department name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subDepartmentCode">Sub Department Code</Label>
                  <Input
                    id="subDepartmentCode"
                    placeholder="Enter sub department code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="departmentSelect">Department</Label>
                  <Select
                    value={formData.department || ""}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeDepartments.map((dept: Department) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await apiRequest("/api/master-data/sub-department", {
                        method: "POST",
                        body: {
                          name: formData.name,
                          code: formData.code,
                          departmentId: formData.department ? parseInt(formData.department) : null,
                        },
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/master-data/sub-department"] });
                      setFormData({ ...formData, name: "", code: "", department: "" });
                      toast({
                        title: "Success",
                        description: "Sub department created successfully",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to create sub department",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Sub Department
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
                        <TableHead>Business Unit</TableHead>
                        <TableHead>Paygroup</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Sub Department</TableHead>
                        <TableHead>Job Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingRoles ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : safeRoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            No roles found
                          </TableCell>
                        </TableRow>
                      ) : (
                        safeRoles.map((role: Role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell className="font-mono">{role.code}</TableCell>
                            <TableCell className="text-sm">{role.businessUnitName || '-'}</TableCell>
                            <TableCell className="text-sm">{role.paygroupName || '-'}</TableCell>
                            <TableCell className="text-sm">{role.departmentName || '-'}</TableCell>
                            <TableCell className="text-sm">{role.subDepartmentName || '-'}</TableCell>
                            <TableCell>
                              {(role as any).jobDescriptionFile ? (
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`/api/master-data/files/${(role as any).jobDescriptionFile}`, '_blank')}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Download JD
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-sm">No JD uploaded</span>
                              )}
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
                                    onCheckedChange={() => handleToggleRoleStatus(role.id!, role.isActive || false)}
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
                  <Label htmlFor="rolePaygroup">Paygroup</Label>
                  <Input
                    id="rolePaygroup"
                    placeholder="Enter paygroup"
                    value={formData.paygroup}
                    onChange={(e) => setFormData({ ...formData, paygroup: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roleBusinessUnit">Business Unit</Label>
                  <Input
                    id="roleBusinessUnit"
                    placeholder="Enter business unit"
                    value={formData.businessUnit}
                    onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roleDepartment">Department</Label>
                  <Input
                    id="roleDepartment"
                    placeholder="Enter department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roleSubDepartment">Sub Department</Label>
                  <Input
                    id="roleSubDepartment"
                    placeholder="Enter sub department"
                    value={formData.subDepartment}
                    onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roleJD">Job Description (PDF/DOC)</Label>
                  <Input
                    id="roleJD"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, jobDescriptionFile: file });
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Upload PDF or DOC file (max 5MB)
                  </p>
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
                                onClick={() => handleViewVendorDetails(vendor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditVendor(vendor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center space-x-2">
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

                {/* Commercial Terms Section */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Commercial Terms</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="managementFees">Management Fees (%)</Label>
                      <Input
                        id="managementFees"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.managementFees}
                        onChange={(e) => setFormData({ ...formData, managementFees: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sourcingFee">Sourcing Fee (%)</Label>
                      <Input
                        id="sourcingFee"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.sourcingFee}
                        onChange={(e) => setFormData({ ...formData, sourcingFee: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="replacementDays">Replacement Days</Label>
                      <Input
                        id="replacementDays"
                        type="number"
                        placeholder="0"
                        value={formData.replacementDays}
                        onChange={(e) => setFormData({ ...formData, replacementDays: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Contact Details</h3>
                  
                  {/* Delivery Lead */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Delivery Lead</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="deliveryLeadName">Name</Label>
                        <Input
                          id="deliveryLeadName"
                          placeholder="Enter name"
                          value={formData.deliveryLeadName}
                          onChange={(e) => setFormData({ ...formData, deliveryLeadName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryLeadEmail">Email</Label>
                        <Input
                          id="deliveryLeadEmail"
                          type="email"
                          placeholder="Enter email"
                          value={formData.deliveryLeadEmail}
                          onChange={(e) => setFormData({ ...formData, deliveryLeadEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryLeadPhone">Phone</Label>
                        <Input
                          id="deliveryLeadPhone"
                          placeholder="Enter phone"
                          value={formData.deliveryLeadPhone}
                          onChange={(e) => setFormData({ ...formData, deliveryLeadPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* City-specific Recruitment SPOCs */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">City Recruitment SPOCs</h4>
                    <div className="space-y-3">
                      {safeCities.map((city: City) => (
                        <div key={city.id} className="border rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="font-medium text-sm">{city.name}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`citySpoc_${city.id}_name`}>Name</Label>
                              <Input
                                id={`citySpoc_${city.id}_name`}
                                placeholder="Enter name"
                                value={(formData as any)[`citySpoc_${city.id}_name`] || ""}
                                onChange={(e) => setFormData({ ...formData, [`citySpoc_${city.id}_name`]: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`citySpoc_${city.id}_email`}>Email</Label>
                              <Input
                                id={`citySpoc_${city.id}_email`}
                                type="email"
                                placeholder="Enter email"
                                value={(formData as any)[`citySpoc_${city.id}_email`] || ""}
                                onChange={(e) => setFormData({ ...formData, [`citySpoc_${city.id}_email`]: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`citySpoc_${city.id}_phone`}>Phone</Label>
                              <Input
                                id={`citySpoc_${city.id}_phone`}
                                placeholder="Enter phone"
                                value={(formData as any)[`citySpoc_${city.id}_phone`] || ""}
                                onChange={(e) => setFormData({ ...formData, [`citySpoc_${city.id}_phone`]: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Head */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Business Head</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="businessHeadName">Name</Label>
                        <Input
                          id="businessHeadName"
                          placeholder="Enter name"
                          value={formData.businessHeadName}
                          onChange={(e) => setFormData({ ...formData, businessHeadName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessHeadEmail">Email</Label>
                        <Input
                          id="businessHeadEmail"
                          type="email"
                          placeholder="Enter email"
                          value={formData.businessHeadEmail}
                          onChange={(e) => setFormData({ ...formData, businessHeadEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessHeadPhone">Phone</Label>
                        <Input
                          id="businessHeadPhone"
                          placeholder="Enter phone"
                          value={formData.businessHeadPhone}
                          onChange={(e) => setFormData({ ...formData, businessHeadPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payroll SPOC */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Payroll SPOC</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="payrollSpocName">Name</Label>
                        <Input
                          id="payrollSpocName"
                          placeholder="Enter name"
                          value={formData.payrollSpocName}
                          onChange={(e) => setFormData({ ...formData, payrollSpocName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="payrollSpocEmail">Email</Label>
                        <Input
                          id="payrollSpocEmail"
                          type="email"
                          placeholder="Enter email"
                          value={formData.payrollSpocEmail}
                          onChange={(e) => setFormData({ ...formData, payrollSpocEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="payrollSpocPhone">Phone</Label>
                        <Input
                          id="payrollSpocPhone"
                          placeholder="Enter phone"
                          value={formData.payrollSpocPhone}
                          onChange={(e) => setFormData({ ...formData, payrollSpocPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
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
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingRecruiters ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : safeRecruiters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No recruiters found
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeRecruiters.map((recruiter: Recruiter) => {
                        const recruiterCity = safeCities.find(city => city.id === recruiter.cityId);
                        return (
                          <TableRow key={recruiter.id}>
                            <TableCell className="font-medium">{recruiter.name}</TableCell>
                            <TableCell>{recruiter.email}</TableCell>
                            <TableCell>{recruiter.phone || "N/A"}</TableCell>
                            <TableCell>{recruiterCity?.name || "N/A"}</TableCell>
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
                                  <Switch
                                    checked={recruiter.isActive}
                                    onCheckedChange={() => handleToggleRecruiterStatus(recruiter.id, recruiter.isActive)}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                  <Label htmlFor="recruiterCity">City</Label>
                  <Select value={formData.cityId} onValueChange={(value) => setFormData({ ...formData, cityId: value })}>
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
          jobDescriptionFile: null,
        } as any);
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
              <>
                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Input
                    id="editDescription"
                    placeholder="Enter description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editPaygroup">Paygroup</Label>
                  <Select
                    value={editFormData.paygroup}
                    onValueChange={(value) => setEditFormData({ ...editFormData, paygroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select paygroup" />
                    </SelectTrigger>
                    <SelectContent>
                      {safePaygroups.map((pg: Paygroup) => (
                        <SelectItem key={pg.id} value={pg.id.toString()}>
                          {pg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editBusinessUnit">Business Unit</Label>
                  <Select
                    value={editFormData.businessUnit}
                    onValueChange={(value) => setEditFormData({ ...editFormData, businessUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeBusinessUnits.map((bu: BusinessUnit) => (
                        <SelectItem key={bu.id} value={bu.id.toString()}>
                          {bu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <Select
                    value={editFormData.department}
                    onValueChange={(value) => setEditFormData({ ...editFormData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeDepartments.map((dept: Department) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editSubDepartment">Sub Department</Label>
                  <Select
                    value={editFormData.subDepartment}
                    onValueChange={(value) => setEditFormData({ ...editFormData, subDepartment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub department" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeSubDepartments.map((sd: SubDepartment) => (
                        <SelectItem key={sd.id} value={sd.id.toString()}>
                          {sd.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editJobDescription">Job Description (PDF/DOC)</Label>
                  <Input
                    id="editJobDescription"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditFormData({ ...editFormData, jobDescriptionFile: file });
                      }
                    }}
                    className="cursor-pointer"
                  />
                <p className="text-sm text-slate-500 mt-1">
                  Upload PDF or DOC file (max 5MB)
                </p>
                {editingItem?.jobDescriptionFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-slate-600">Current file:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/master-data/files/${editingItem.jobDescriptionFile}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Download Current JD
                    </Button>
                  </div>
                )}
              </div>
              </>
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

            {editType === "department" && (
              <div>
                <Label htmlFor="editDepartmentBusinessUnit">Business Unit</Label>
                <Select
                  value={editFormData.businessUnit}
                  onValueChange={(value) => setEditFormData({ ...editFormData, businessUnit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeBusinessUnits.map((bu: BusinessUnit) => (
                      <SelectItem key={bu.id} value={bu.id.toString()}>
                        {bu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editType === "sub-department" && (
              <div>
                <Label htmlFor="editSubDepartmentDepartment">Department</Label>
                <Select
                  value={editFormData.department}
                  onValueChange={(value) => setEditFormData({ ...editFormData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeDepartments.map((dept: Department) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
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
                  value={(editFormData as any).incentiveStructure}
                  onChange={(e) => setEditFormData({ ...editFormData, incentiveStructure: e.target.value } as any)}
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
                  } as any);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendor Details Dialog */}
      <Dialog open={vendorDetailsOpen} onOpenChange={setVendorDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedVendor?.name} - Vendor Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Vendor Name</Label>
                      <p className="text-sm font-semibold">{selectedVendor.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Contact Person</Label>
                      <p className="text-sm">{selectedVendor.contactPerson || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Email</Label>
                      <p className="text-sm">{selectedVendor.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Phone</Label>
                      <p className="text-sm">{selectedVendor.phone || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commercial Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Commercial Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-yellow-50">
                          <TableHead className="font-semibold border-r">Commercials</TableHead>
                          <TableHead className="font-semibold">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="border-r font-medium">Management fees</TableCell>
                          <TableCell>{selectedVendor.managementFees ? `${selectedVendor.managementFees}%` : "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="border-r font-medium">Sourcing Fee</TableCell>
                          <TableCell>{selectedVendor.sourcingFee ? `${selectedVendor.sourcingFee}%` : "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="border-r font-medium">Replacement Days</TableCell>
                          <TableCell>{selectedVendor.replacementDays ? `${selectedVendor.replacementDays} days` : "N/A"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-yellow-50">
                          <TableHead className="font-semibold border-r">Particulars</TableHead>
                          <TableHead className="font-semibold border-r">Delivery Lead</TableHead>
                          <TableHead className="font-semibold border-r">Business Head</TableHead>
                          <TableHead className="font-semibold">PAYROLL SPOC</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="border-r font-medium">Name</TableCell>
                          <TableCell className="border-r">{selectedVendor.deliveryLeadName || "N/A"}</TableCell>
                          <TableCell className="border-r">{selectedVendor.businessHeadName || "N/A"}</TableCell>
                          <TableCell>{selectedVendor.payrollSpocName || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="border-r font-medium">Email ID</TableCell>
                          <TableCell className="border-r">{selectedVendor.deliveryLeadEmail || "N/A"}</TableCell>
                          <TableCell className="border-r">{selectedVendor.businessHeadEmail || "N/A"}</TableCell>
                          <TableCell>{selectedVendor.payrollSpocEmail || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="border-r font-medium">Number</TableCell>
                          <TableCell className="border-r">{selectedVendor.deliveryLeadPhone || "N/A"}</TableCell>
                          <TableCell className="border-r">{selectedVendor.businessHeadPhone || "N/A"}</TableCell>
                          <TableCell>{selectedVendor.payrollSpocPhone || "N/A"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* City-specific Recruitment SPOCs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">City Recruitment SPOCs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safeCities.map((city: City) => (
                      <div key={city.id} className="border rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">{city.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-slate-600">Name</Label>
                            <p className="mt-1">
                              {selectedVendor.citySpocData?.[city.id]?.name || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-slate-600">Email</Label>
                            <p className="mt-1">
                              {selectedVendor.citySpocData?.[city.id]?.email || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-slate-600">Phone</Label>
                            <p className="mt-1">
                              {selectedVendor.citySpocData?.[city.id]?.phone || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Commercial Terms Notes</Label>
                    <p className="text-sm mt-1">{selectedVendor.commercialTerms || "No additional terms specified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Status</Label>
                    <Badge variant={selectedVendor.isActive ? "default" : "secondary"} className="mt-1">
                      {selectedVendor.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
