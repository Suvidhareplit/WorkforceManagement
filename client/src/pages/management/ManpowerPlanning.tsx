import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Building2,
  Users,
  X,
  RefreshCw,
  Trash2,
  Info,
  Wrench,
  History,
  Check,
} from "lucide-react";

interface City {
  id: number;
  name: string;
  code: string;
  clusterCount?: number;
}

interface Cluster {
  id: number;
  name: string;
  code: string;
  cityId: number;
  cityName?: string;
  centreCount?: number;
}

interface Centre {
  id: number;
  name: string;
  code: string;
  clusterId: number;
  clusterName?: string;
  isActive?: boolean;
}

interface Designation {
  id: number;
  name: string;
  code: string;
  roleName?: string;
  subDepartmentName?: string;
  manpowerPlanningRequired: boolean;
}

interface ManpowerPlan {
  id?: number;
  centreId: number;
  designationId: number;
  numShifts: number;
  employeesPerShift: number;
}

interface WorkshopTechnicianPlan {
  id?: number;
  cityId: number;
  cityName?: string;
  dau: number;
  bikesInCity: number;
  faultRatePercent: number;
  perMechanicCapacity: number;
  shrinkagePercent: number;
  useDau: boolean;
  useBic: boolean;
}

// Workshop technician designation names to exclude from regular planning
const WORKSHOP_TECHNICIAN_DESIGNATIONS = [
  'Associate Workshop Technician',
  'Workshop Technician',
  'Senior Workshop Technician',
];

export default function ManpowerPlanning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [expandedCities, setExpandedCities] = useState<Set<number>>(new Set());
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set());
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [planningModalOpen, setPlanningModalOpen] = useState(false);
  const [planningData, setPlanningData] = useState<Record<number, ManpowerPlan>>({});
  const [activeTab, setActiveTab] = useState("regular");
  const [workshopData, setWorkshopData] = useState<Record<number, WorkshopTechnicianPlan>>({});
  const [selectedClusterForSummary, setSelectedClusterForSummary] = useState<Cluster | null>(null);
  const [showClusterSummary, setShowClusterSummary] = useState(false);
  const [selectedHistoryCity, setSelectedHistoryCity] = useState<City | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  // Fetch clusters
  const { data: clusters = [] } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

  // Fetch centres
  const { data: centres = [] } = useQuery({
    queryKey: ["/api/centres"],
  });

  // Fetch designations with manpower planning required
  const { data: designationsData } = useQuery({
    queryKey: ["/api/designations"],
  });

  // Fetch existing manpower plans for selected centre
  const { data: existingPlans = [] } = useQuery({
    queryKey: ["/api/manpower-planning/centre", selectedCentre?.id],
    enabled: !!selectedCentre?.id,
  });

  // Fetch cluster summary for selected cluster
  const { data: clusterSummary = [] } = useQuery({
    queryKey: ["/api/manpower-planning/cluster", selectedClusterForSummary?.id, "summary"],
    queryFn: async () => await apiRequest(`/api/manpower-planning/cluster/${selectedClusterForSummary?.id}/summary`, { method: "GET" }),
    enabled: !!selectedClusterForSummary?.id && showClusterSummary,
  });

  const safeCities = Array.isArray(cities) ? cities : [];
  const safeClusters = Array.isArray(clusters) ? clusters : [];
  const safeCentres = Array.isArray(centres) ? centres : [];
  const safeDesignations = Array.isArray((designationsData as any)?.data || designationsData) 
    ? ((designationsData as any)?.data || designationsData) 
    : [];

  // Filter designations that require manpower planning (exclude workshop technicians)
  const planningDesignations = safeDesignations.filter(
    (d: Designation) => d.manpowerPlanningRequired && 
      !WORKSHOP_TECHNICIAN_DESIGNATIONS.some(wt => 
        d.name.toLowerCase().includes(wt.toLowerCase())
      )
  );

  // Fetch workshop technician planning data
  const { data: workshopPlanningData = [], refetch: refetchWorkshop } = useQuery({
    queryKey: ["/api/manpower-planning/workshop-technician"],
  });

  const safeWorkshopData = Array.isArray(workshopPlanningData) ? workshopPlanningData : [];

  // Calculate required workshop technicians
  // Formula: ((DAU × Outflow %) ÷ Per Mechanic Capacity) / (1 - Shrinkage %)
  const calculateRequiredTechnicians = (plan: WorkshopTechnicianPlan) => {
    const baseValue = plan.useBic ? plan.bikesInCity : plan.dau;
    const faultyBikes = baseValue * (plan.faultRatePercent / 100);
    const baseTechnicians = faultyBikes / plan.perMechanicCapacity;
    const shrinkageFactor = 1 - (plan.shrinkagePercent / 100);
    const withShrinkage = shrinkageFactor > 0 ? baseTechnicians / shrinkageFactor : baseTechnicians;
    return {
      base: Math.ceil(baseTechnicians),
      withShrinkage: Math.ceil(withShrinkage),
      exact: withShrinkage.toFixed(2)
    };
  };

  // Update workshop data for a city
  const updateWorkshopCityData = (cityId: number, field: string, value: any) => {
    setWorkshopData((prev) => ({
      ...prev,
      [cityId]: {
        ...prev[cityId],
        cityId,
        [field]: value,
      },
    }));
  };

  // Save workshop technician planning mutation
  const saveWorkshopMutation = useMutation({
    mutationFn: async (data: WorkshopTechnicianPlan) => {
      return await apiRequest("/api/manpower-planning/workshop-technician", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/workshop-technician"] });
      toast({
        title: "Success",
        description: "Workshop technician planning saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save workshop technician planning",
        variant: "destructive",
      });
    },
  });

  // Delete workshop technician planning mutation
  const deleteWorkshopMutation = useMutation({
    mutationFn: async (cityId: number) => {
      return await apiRequest(`/api/manpower-planning/workshop-technician/${cityId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/workshop-technician"] });
      toast({
        title: "Success",
        description: "Workshop technician planning deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete workshop technician planning",
        variant: "destructive",
      });
    },
  });

  // Handle save workshop planning for a city
  const handleSaveWorkshopCity = (cityId: number) => {
    // Get current data from the UI (combines local edits with existing/default values)
    const currentData = getWorkshopCityData(cityId);
    
    const dataToSave = {
      cityId: cityId,
      dau: currentData.dau,
      bikesInCity: currentData.bikesInCity,
      faultRatePercent: currentData.faultRatePercent,
      perMechanicCapacity: currentData.perMechanicCapacity,
      shrinkagePercent: currentData.shrinkagePercent,
      useDau: currentData.useDau,
      useBic: currentData.useBic,
    };
    
    console.log('Saving workshop data:', dataToSave);
    saveWorkshopMutation.mutate(dataToSave as WorkshopTechnicianPlan);
  };

  // Get workshop data for a city (from API or local state)
  const getWorkshopCityData = (cityId: number): WorkshopTechnicianPlan => {
    const localData = workshopData[cityId];
    const apiData = safeWorkshopData.find((w: any) => w.cityId === cityId);
    
    // If API data exists, use it (even if values are 0)
    // Only use defaults if no API data exists at all
    const hasApiData = !!apiData;
    
    return {
      cityId,
      dau: localData?.dau !== undefined ? localData.dau : (hasApiData ? (apiData.dau ?? 0) : 0),
      bikesInCity: localData?.bikesInCity !== undefined ? localData.bikesInCity : (hasApiData ? (apiData.bikesInCity ?? 0) : 0),
      faultRatePercent: localData?.faultRatePercent !== undefined ? localData.faultRatePercent : (hasApiData ? (apiData.faultRatePercent ?? 0) : 8),
      perMechanicCapacity: localData?.perMechanicCapacity !== undefined ? localData.perMechanicCapacity : (hasApiData ? (apiData.perMechanicCapacity ?? 1) : 8),
      shrinkagePercent: localData?.shrinkagePercent !== undefined ? localData.shrinkagePercent : (hasApiData ? (apiData.shrinkagePercent ?? 0) : 15),
      useDau: localData?.useDau !== undefined ? localData.useDau : (hasApiData ? (apiData.useDau ?? false) : true),
      useBic: localData?.useBic !== undefined ? localData.useBic : (hasApiData ? (apiData.useBic ?? false) : false),
    };
  };

  // Calculate totals for workshop summary
  const workshopTotals = safeCities.reduce((acc: any, city: City) => {
    const data = getWorkshopCityData(city.id);
    const result = calculateRequiredTechnicians(data);
    // Use the value that's actually being used for calculation (based on useBic checkbox)
    const baseValue = data.useBic ? data.bikesInCity : data.dau;
    return {
      totalCities: acc.totalCities + 1,
      totalDau: acc.totalDau + data.dau,
      totalBic: acc.totalBic + data.bikesInCity,
      totalBaseValue: acc.totalBaseValue + baseValue,
      totalTechnicians: acc.totalTechnicians + result.withShrinkage,
    };
  }, { totalCities: 0, totalDau: 0, totalBic: 0, totalBaseValue: 0, totalTechnicians: 0 });

  // Get clusters for a city
  const getClustersForCity = (cityId: number) => {
    return safeClusters.filter((c: Cluster) => c.cityId === cityId);
  };

  // Get centres for a cluster
  const getCentresForCluster = (clusterId: number) => {
    return safeCentres.filter((c: Centre) => c.clusterId === clusterId);
  };

  // Toggle city expansion
  const toggleCity = (cityId: number) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityId)) {
      newExpanded.delete(cityId);
    } else {
      newExpanded.add(cityId);
    }
    setExpandedCities(newExpanded);
  };

  // Toggle cluster expansion
  const toggleCluster = (clusterId: number) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedClusters(newExpanded);
  };

  // Open centre planning modal
  const openCentrePlanning = (centre: Centre) => {
    setSelectedCentre(centre);
    setPlanningModalOpen(true);
    // Clear planning data - will be populated by useEffect when existingPlans loads
    setPlanningData({});
  };

  // State for last updated info in centre planning
  const [centreLastUpdated, setCentreLastUpdated] = useState<{ name: string; date: string } | null>(null);

  // Get city-specific shrinkage percentage for the selected centre
  const getCityShrinkageForCentre = (): number => {
    if (!selectedCentre) return 15;
    // Find the cluster for this centre
    const cluster = safeClusters.find((c: Cluster) => c.id === selectedCentre.clusterId);
    if (!cluster) return 15;
    // Find the workshop data for this city
    const workshopData = safeWorkshopData.find((w: any) => w.cityId === cluster.cityId);
    return workshopData?.shrinkagePercent ?? 15;
  };

  // Populate planning data when existing plans are loaded
  useEffect(() => {
    if (!planningModalOpen || !selectedCentre) {
      return;
    }

    if (Array.isArray(existingPlans) && existingPlans.length > 0) {
      const initialData: Record<number, ManpowerPlan> = {};
      let latestUpdate: { name: string; date: string } | null = null;
      
      existingPlans.forEach((plan: any) => {
        initialData[plan.designationId] = {
          id: plan.id,
          centreId: plan.centreId,
          designationId: plan.designationId,
          numShifts: plan.numShifts ?? 0,
          employeesPerShift: plan.employeesPerShift ?? 0,
        };
        // Track the most recent update
        if (plan.updatedByName && plan.updatedAt) {
          if (!latestUpdate || new Date(plan.updatedAt) > new Date(latestUpdate.date)) {
            latestUpdate = { name: plan.updatedByName, date: plan.updatedAt };
          }
        }
      });
      setPlanningData(initialData);
      setCentreLastUpdated(latestUpdate);
    } else {
      // Initialize with 0 shifts for all planning designations when no existing data
      const initialData: Record<number, ManpowerPlan> = {};
      planningDesignations.forEach((designation: Designation) => {
        const isOperator = designation.name.toLowerCase() === 'operator';
        initialData[designation.id] = {
          centreId: selectedCentre.id,
          designationId: designation.id,
          numShifts: 0,
          employeesPerShift: isOperator ? 1 : 0,
        };
      });
      setPlanningData(initialData);
      setCentreLastUpdated(null);
    }
  }, [existingPlans, planningModalOpen, selectedCentre]);

  // Save manpower planning mutation
  const savePlanningMutation = useMutation({
    mutationFn: async (data: { centreId: number; plans: ManpowerPlan[] }) => {
      return await apiRequest("/api/manpower-planning/centre", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/centre", selectedCentre?.id] });
      toast({
        title: "Success",
        description: "Manpower planning saved successfully",
      });
      setPlanningModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save manpower planning",
        variant: "destructive",
      });
    },
  });

  // Handle save planning
  const handleSavePlanning = () => {
    if (!selectedCentre) return;
    
    // Include all plans (even with 0 shifts) so they get saved
    const plans = Object.values(planningData);
    
    savePlanningMutation.mutate({
      centreId: selectedCentre.id,
      plans,
    });
  };

  // Update planning data for a designation
  const updatePlanningData = (
    designationId: number,
    field: "numShifts" | "employeesPerShift",
    value: number
  ) => {
    setPlanningData((prev) => ({
      ...prev,
      [designationId]: {
        ...prev[designationId],
        centreId: selectedCentre?.id || 0,
        designationId,
        [field]: value,
        numShifts: field === "numShifts" ? value : (prev[designationId]?.numShifts ?? 0),
        employeesPerShift: field === "employeesPerShift" ? value : (prev[designationId]?.employeesPerShift ?? 0),
      },
    }));
  };

  // Calculate base manpower for a designation
  const calculateBaseManpower = (designationId: number) => {
    const plan = planningData[designationId];
    if (!plan) return 0;
    const shifts = plan.numShifts ?? 0;
    const employees = plan.employeesPerShift ?? 0;
    return shifts * employees;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage City, Cluster, Centre wise Manpower Planning
          </h1>
          <p className="text-gray-500 mt-1">
            Configure manpower requirements for each centre
          </p>
        </div>
        {/* Cities & Clusters Metric Card */}
        <Card className="w-48">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {safeCities.length} & {safeClusters.length}
            </p>
            <p className="text-sm text-gray-500">Cities & Clusters</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1">
          <TabsTrigger value="regular" className="flex items-center gap-2 data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            Regular Manpower Planning
          </TabsTrigger>
          <TabsTrigger value="workshop" className="flex items-center gap-2 data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            <Wrench className="h-4 w-4" />
            Workshop Technician Calculation - DAU & BIC based
          </TabsTrigger>
        </TabsList>

        {/* Regular Manpower Planning Tab */}
        <TabsContent value="regular">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Cities, Clusters & Centres
              </CardTitle>
            </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {safeCities.map((city: City) => {
              const cityClusters = getClustersForCity(city.id);
              const isExpanded = expandedCities.has(city.id);
              
              return (
                <div key={city.id} className="border-b last:border-b-0">
                  {/* City Row */}
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleCity(city.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <span className="font-semibold text-gray-900">{city.name}</span>
                      <span className="text-sm text-gray-500">
                        ({cityClusters.length} clusters)
                      </span>
                    </div>
                  </div>

                  {/* Clusters */}
                  {isExpanded && (
                    <div className="bg-gray-50 pl-8">
                      {cityClusters.map((cluster: Cluster) => {
                        const clusterCentres = getCentresForCluster(cluster.id);
                        const isClusterExpanded = expandedClusters.has(cluster.id);
                        
                        return (
                          <div key={cluster.id} className="border-t">
                            {/* Cluster Row */}
                            <div
                              className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-100"
                              onClick={() => toggleCluster(cluster.id)}
                            >
                              <div className="flex items-center gap-3">
                                {isClusterExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                                <Building2 className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-gray-800">{cluster.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({clusterCentres.length} centers)
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClusterForSummary(cluster);
                                  setShowClusterSummary(true);
                                }}
                              >
                                <Info className="h-4 w-4 mr-2" />
                                View Summary
                              </Button>
                            </div>

                            {/* Centres */}
                            {isClusterExpanded && (
                              <div className="bg-white pl-12 py-2">
                                {clusterCentres.length === 0 ? (
                                  <div className="px-6 py-3 text-gray-500 text-sm">
                                    No centres in this cluster
                                  </div>
                                ) : (
                                  clusterCentres.map((centre: Centre) => (
                                    <div
                                      key={centre.id}
                                      className="flex items-center justify-between px-6 py-3 border-t hover:bg-gray-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-gray-700">{centre.name}</span>
                                        <Badge variant={centre.isActive !== false ? "default" : "secondary"} className="text-xs">
                                          {centre.isActive !== false ? "Active" : "Inactive"}
                                        </Badge>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openCentrePlanning(centre);
                                        }}
                                      >
                                        <Users className="h-4 w-4 mr-2" />
                                        Center Planning
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {cityClusters.length === 0 && (
                        <div className="px-6 py-4 text-gray-500 text-sm">
                          No clusters in this city
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {safeCities.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No cities found in master data
              </div>
            )}
          </div>
        </CardContent>
          </Card>
        </TabsContent>

        {/* Workshop Technician Calculation Tab */}
        <TabsContent value="workshop">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Wrench className="h-5 w-5 text-[#2563EB]" />
                  Workshop Technician Calculation
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Configure DAU and capacity parameters to calculate required workshop technicians
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchWorkshop()} className="border-gray-200 hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Summary Cards - Moved to top with Yulu blue theme */}
              <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-xl p-5 mb-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-white/80 text-sm font-medium">Total Cities</p>
                    <p className="text-3xl font-bold text-white mt-1">{workshopTotals.totalCities}</p>
                  </div>
                  <div className="text-center border-x border-white/20">
                    <p className="text-white/80 text-sm font-medium">Total DAU</p>
                    <p className="text-3xl font-bold text-white mt-1">{workshopTotals.totalDau.toLocaleString()}</p>
                  </div>
                  <div className="text-center border-r border-white/20">
                    <p className="text-white/80 text-sm font-medium">Total BIC</p>
                    <p className="text-3xl font-bold text-white mt-1">{workshopTotals.totalBic.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/80 text-sm font-medium">Required Technicians</p>
                    <p className="text-3xl font-bold text-white mt-1">{workshopTotals.totalTechnicians}</p>
                  </div>
                </div>
              </div>

              {/* Calculation Formula Info - Compact */}
              <details className="bg-gray-50 border border-gray-200 rounded-lg mb-6 group" open>
                <summary className="flex items-center gap-2 p-3 cursor-pointer select-none">
                  <Info className="h-4 w-4 text-[#2563EB]" />
                  <span className="text-sm font-medium text-gray-700">Calculation Formula</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-3 pt-1 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      <strong>Required Workshop Technicians</strong> = ((<span className="text-[#2563EB] font-semibold">DAU or BIC</span> × Outflow %) ÷ Per Mechanic Capacity) / (1 - Shrinkage %)
                    </p>
                    {/* Master Toggle for All Cities */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Apply to all:</span>
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            safeCities.forEach((city: City) => {
                              updateWorkshopCityData(city.id, 'useBic', false);
                              updateWorkshopCityData(city.id, 'useDau', true);
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-l-md border border-gray-300 bg-white text-gray-600 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-colors"
                        >
                          All DAU
                        </button>
                        <button
                          onClick={() => {
                            safeCities.forEach((city: City) => {
                              updateWorkshopCityData(city.id, 'useBic', true);
                              updateWorkshopCityData(city.id, 'useDau', false);
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-r-md border-t border-r border-b border-gray-300 bg-white text-gray-600 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-colors"
                        >
                          All BIC
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                    <div>• <strong>DAU</strong>: Daily Active Users (bikes used daily)</div>
                    <div>• <strong>BIC</strong>: Bikes In City (total bikes)</div>
                    <div>• <strong>Outflow %</strong>: Bikes needing repair</div>
                    <div>• <strong>Shrinkage %</strong>: Leave/absence buffer</div>
                  </div>
                </div>
              </details>

              {/* Workshop Technician Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">CITY</TableHead>
                    <TableHead className="text-center font-semibold">DAU</TableHead>
                    <TableHead className="text-center font-semibold">BIC<br/>(BIKES IN CITY)</TableHead>
                    <TableHead className="text-center font-semibold">USE FOR<br/>CALCULATION</TableHead>
                    <TableHead className="text-center font-semibold">OUTFLOW<br/>%</TableHead>
                    <TableHead className="text-center font-semibold">PER MECHANIC<br/>CAPACITY</TableHead>
                    <TableHead className="text-center font-semibold">SHRINKAGE<br/>%</TableHead>
                    <TableHead className="text-center font-semibold text-[#2563EB]">REQUIRED<br/>WORKSHOP<br/>TECHNICIANS</TableHead>
                    <TableHead className="text-center font-semibold">LAST UPDATED</TableHead>
                    <TableHead className="text-center font-semibold">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeCities.map((city: City) => {
                    const data = getWorkshopCityData(city.id);
                    const result = calculateRequiredTechnicians(data);
                    const apiData = safeWorkshopData.find((w: any) => w.cityId === city.id);
                    
                    return (
                      <TableRow key={city.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{city.name}</p>
                            <p className="text-xs text-gray-500">Workshop Technician</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-2">
                            <Input
                              type="number"
                              className={`w-24 mx-auto text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${!data.useBic ? 'ring-2 ring-[#2563EB] bg-blue-50' : ''}`}
                              value={data.dau}
                              onChange={(e) => updateWorkshopCityData(city.id, 'dau', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-2">
                            <Input
                              type="number"
                              className={`w-24 mx-auto text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${data.useBic ? 'ring-2 ring-[#2563EB] bg-[#2563EB] text-white font-semibold rounded-full' : ''}`}
                              value={data.bikesInCity}
                              onChange={(e) => updateWorkshopCityData(city.id, 'bikesInCity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {/* Toggle between DAU and BIC */}
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => {
                                updateWorkshopCityData(city.id, 'useBic', false);
                                updateWorkshopCityData(city.id, 'useDau', true);
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-l-md border transition-colors ${
                                !data.useBic 
                                  ? 'bg-[#2563EB] text-white border-[#2563EB]' 
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              DAU
                            </button>
                            <button
                              onClick={() => {
                                updateWorkshopCityData(city.id, 'useBic', true);
                                updateWorkshopCityData(city.id, 'useDau', false);
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-r-md border-t border-r border-b transition-colors ${
                                data.useBic 
                                  ? 'bg-[#2563EB] text-white border-[#2563EB]' 
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              BIC
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-16 mx-auto text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={data.faultRatePercent}
                            onChange={(e) => updateWorkshopCityData(city.id, 'faultRatePercent', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-16 mx-auto text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={data.perMechanicCapacity}
                            onChange={(e) => updateWorkshopCityData(city.id, 'perMechanicCapacity', parseInt(e.target.value) || 1)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-16 mx-auto text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={data.shrinkagePercent}
                            onChange={(e) => updateWorkshopCityData(city.id, 'shrinkagePercent', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-[#2563EB] font-bold text-lg">
                            {result.withShrinkage}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({result.exact})
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            {apiData?.updatedByName ? (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">{apiData.updatedByName}</span>
                                <span className="text-gray-400 ml-1">
                                  ({apiData.updatedAt ? new Date(apiData.updatedAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : '-'})
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Not set</span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:bg-[#2563EB]/10"
                              onClick={() => {
                                setSelectedHistoryCity(city);
                                setShowHistoryModal(true);
                              }}
                            >
                              <History className="h-3 w-3 mr-1" />
                              History
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
                              onClick={() => handleSaveWorkshopCity(city.id)}
                              disabled={saveWorkshopMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => deleteWorkshopMutation.mutate(city.id)}
                              disabled={deleteWorkshopMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Centre Planning Modal */}
      <Dialog open={planningModalOpen} onOpenChange={setPlanningModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Manpower Planning - {selectedCentre?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlanningModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              Configure base manpower requirements for this center. Shrinkage will be applied at cluster level after summing all centers in the cluster.
              <span className="text-orange-600 block mt-1">
                Workshop Technician and Senior Workshop Technician roles are excluded as they have separate calculations.
              </span>
            </p>
            {centreLastUpdated && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 inline-block">
                Last updated by <span className="font-medium text-gray-700">{centreLastUpdated.name}</span> on{' '}
                {new Date(centreLastUpdated.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {planningDesignations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No designations marked for manpower planning. Please enable manpower planning for designations in Master Data.
              </div>
            ) : (
              planningDesignations.map((designation: Designation) => {
                const isOperator = designation.name.toLowerCase() === 'operator';
                const baseManpower = calculateBaseManpower(designation.id);
                const plan = planningData[designation.id];
                
                return (
                  <Card key={designation.id} className={`border ${isOperator ? 'border-purple-200 bg-purple-50/30' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{designation.name}</h4>
                          <p className="text-sm text-gray-500">
                            {designation.roleName} - {designation.subDepartmentName}
                          </p>
                        </div>
                        <Badge variant="outline" className={isOperator ? "text-purple-600 border-purple-200" : "text-green-600 border-green-200"}>
                          {isOperator ? 'Truck Based' : 'Requires Planning'}
                        </Badge>
                      </div>

                      {isOperator ? (
                        /* Operator - Truck based calculation */
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Number of Trucks</Label>
                            <Input
                              type="number"
                              min="0"
                              value={Math.floor((plan?.numShifts ?? 0) / 2)}
                              onChange={(e) => {
                                const trucks = parseInt(e.target.value) || 0;
                                setPlanningData((prev) => {
                                  const currentPlan = prev[designation.id] || {};
                                  return {
                                    ...prev,
                                    [designation.id]: {
                                      ...currentPlan,
                                      centreId: selectedCentre?.id || 0,
                                      designationId: designation.id,
                                      numShifts: trucks * 2,
                                      employeesPerShift: currentPlan.employeesPerShift ?? 1,
                                    },
                                  };
                                });
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <p className="text-xs text-purple-600 mt-1">Each truck = 2 shifts</p>
                          </div>
                          <div>
                            <Label>Employees per Shift</Label>
                            <Input
                              type="number"
                              min="0"
                              value={plan?.employeesPerShift ?? 1}
                              onChange={(e) => {
                                const employees = parseInt(e.target.value) || 0;
                                setPlanningData((prev) => {
                                  const currentPlan = prev[designation.id] || {};
                                  return {
                                    ...prev,
                                    [designation.id]: {
                                      ...currentPlan,
                                      centreId: selectedCentre?.id || 0,
                                      designationId: designation.id,
                                      numShifts: currentPlan.numShifts ?? 0,
                                      employeesPerShift: employees,
                                    },
                                  };
                                });
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Usually 1 per shift</p>
                          </div>
                        </div>
                      ) : (
                        /* Regular designation */
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Number of Shifts</Label>
                            <Select
                              value={(plan?.numShifts ?? 0).toString()}
                              onValueChange={(value) => {
                                const numShifts = parseInt(value);
                                setPlanningData((prev) => {
                                  const currentPlan = prev[designation.id] || {};
                                  const currentEmployees = currentPlan.employeesPerShift ?? 0;
                                  
                                  // Determine new employees value
                                  let newEmployees = currentEmployees;
                                  if (numShifts === 0) {
                                    newEmployees = 0;
                                  } else if (currentEmployees === 0) {
                                    newEmployees = 1;
                                  }
                                  
                                  return {
                                    ...prev,
                                    [designation.id]: {
                                      ...currentPlan,
                                      centreId: selectedCentre?.id || 0,
                                      designationId: designation.id,
                                      numShifts: numShifts,
                                      employeesPerShift: newEmployees,
                                    },
                                  };
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0 Shifts</SelectItem>
                                <SelectItem value="1">1 Shift</SelectItem>
                                <SelectItem value="2">2 Shifts</SelectItem>
                                <SelectItem value="3">3 Shifts</SelectItem>
                                <SelectItem value="4">4 Shifts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Employees per Shift</Label>
                            <Input
                              type="number"
                              min="0"
                              value={plan?.numShifts === 0 ? 0 : (plan?.employeesPerShift ?? 0)}
                              disabled={plan?.numShifts === 0}
                              onChange={(e) =>
                                updatePlanningData(
                                  designation.id,
                                  "employeesPerShift",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      )}

                      <div className={`rounded-lg p-3 ${isOperator ? 'bg-purple-50' : 'bg-blue-50'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${isOperator ? 'text-purple-900' : 'text-blue-900'}`}>
                              Base Manpower (This Center):
                            </p>
                            <p className={`text-xs ${isOperator ? 'text-purple-600' : 'text-blue-600'}`}>
                              {isOperator 
                                ? `Formula: Trucks (${Math.floor((plan?.numShifts ?? 0) / 2)}) × 2 shifts × ${plan?.employeesPerShift || 1} emp/shift`
                                : 'Formula: Shifts × Employees per Shift'
                              }
                            </p>
                          </div>
                          <span className={`text-xl font-bold ${isOperator ? 'text-purple-600' : 'text-blue-600'}`}>
                            {baseManpower}
                          </span>
                        </div>
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          ⚠️ Final Required = Base / (1 - {getCityShrinkageForCentre()}%) at cluster level
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {planningDesignations.length > 0 && (
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setPlanningModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlanning} disabled={savePlanningMutation.isPending}>
                {savePlanningMutation.isPending ? "Saving..." : "Save Planning"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cluster Summary Modal */}
      <Dialog open={showClusterSummary} onOpenChange={setShowClusterSummary}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              Cluster Manpower Summary - {selectedClusterForSummary?.name}
              <span className="text-orange-500 text-sm font-normal ml-2">
                (Formula: Base / (1 - {clusterSummary?.[0]?.shrinkagePercent ?? 15}%))
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {Array.isArray(clusterSummary) && clusterSummary.length > 0 ? (
              <>
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700" style={{ width: '30%' }}>ROLE</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700" style={{ width: '15%' }}>TOTAL SHIFTS</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700" style={{ width: '18%' }}>TOTAL EMPLOYEES</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700" style={{ width: '17%' }}>SHRINKAGE %</TableHead>
                      <TableHead className="text-center font-semibold text-orange-600" style={{ width: '20%' }}>FINAL REQUIRED</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusterSummary.map((row: any) => (
                      <TableRow key={row.designationId} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{row.designationName}</p>
                            <p className="text-xs text-gray-500">{row.roleName || 'Revenu & Ops'} - {row.subDepartmentName || 'Operations'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-gray-700">{row.totalShifts}</TableCell>
                        <TableCell className="text-center text-gray-700">{row.baseManpower}</TableCell>
                        <TableCell className="text-center text-gray-700">{row.shrinkagePercent}%</TableCell>
                        <TableCell className="text-center font-bold text-orange-600 text-lg">{row.totalWithShrinkage}</TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow className="bg-orange-50 font-bold">
                      <TableCell className="text-orange-700">TOTAL</TableCell>
                      <TableCell className="text-center text-orange-600">
                        {clusterSummary.reduce((sum: number, r: any) => sum + (r.totalShifts || 0), 0)}
                      </TableCell>
                      <TableCell className="text-center text-orange-600">
                        {clusterSummary.reduce((sum: number, r: any) => sum + (r.baseManpower || 0), 0)}
                      </TableCell>
                      <TableCell className="text-center text-orange-600">{clusterSummary?.[0]?.shrinkagePercent ?? 15}%</TableCell>
                      <TableCell className="text-center text-orange-600 text-xl">
                        {clusterSummary.reduce((sum: number, r: any) => sum + (r.totalWithShrinkage || 0), 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No manpower planning data found for this cluster. Please configure center planning first.
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowClusterSummary(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workshop History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#2563EB]" />
              Change History - {selectedHistoryCity?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {(() => {
              const apiData = safeWorkshopData.find((w: any) => w.cityId === selectedHistoryCity?.id);
              if (!apiData?.updatedByName) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <History className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No change history available</p>
                    <p className="text-xs mt-1">Changes will be tracked after the next update</p>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium">
                      {apiData.updatedByName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{apiData.updatedByName}</p>
                      <p className="text-xs text-gray-500">
                        {apiData.updatedAt ? new Date(apiData.updatedAt).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </p>
                      <p className="text-xs text-[#2563EB] mt-1">Latest update</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Full audit trail coming soon
                  </p>
                </div>
              );
            })()}
          </div>
          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
