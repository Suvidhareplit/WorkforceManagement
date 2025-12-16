import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Users, TrendingUp, AlertCircle, Edit, History, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface City {
  id: number;
  name: string;
}

interface Cluster {
  id: number;
  name: string;
  cityId: number;
}

interface Centre {
  id: number;
  name: string;
  clusterId: number;
  clusterName?: string;
  cityName?: string;
}

interface Designation {
  id: number;
  name: string;
  roleName: string;
  subDepartmentName: string;
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
  cityId: number;
  dau: number;
  bikesInCity: number;
  faultRatePercent: number;
  perMechanicCapacity: number;
  shrinkagePercent: number;
  useDau: boolean;
  useBic: boolean;
}

export default function ManpowerPlanning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [planningModalOpen, setPlanningModalOpen] = useState(false);
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [planningData, setPlanningData] = useState<Record<number, ManpowerPlan>>({});
  const [workshopData, setWorkshopData] = useState<WorkshopTechnicianPlan | null>(null);
  const [centreLastUpdated, setCentreLastUpdated] = useState<{ name: string; date: string } | null>(null);

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
    queryFn: async () => await apiRequest("/api/cities", { method: "GET" }),
  });

  const { data: clusters } = useQuery({
    queryKey: ["/api/clusters"],
    queryFn: async () => await apiRequest("/api/clusters", { method: "GET" }),
  });

  const { data: centres } = useQuery({
    queryKey: ["/api/centres"],
    queryFn: async () => await apiRequest("/api/centres", { method: "GET" }),
  });

  const { data: designations } = useQuery({
    queryKey: ["/api/designations"],
    queryFn: async () => await apiRequest("/api/designations", { method: "GET" }),
  });

  const { data: allPlanning } = useQuery({
    queryKey: ["/api/manpower-planning/all"],
    queryFn: async () => await apiRequest("/api/manpower-planning/all", { method: "GET" }),
  });

  const { data: existingPlans } = useQuery({
    queryKey: ["/api/manpower-planning/centre", selectedCentre?.id],
    queryFn: async () => {
      if (!selectedCentre?.id) return [];
      return await apiRequest(`/api/manpower-planning/centre/${selectedCentre.id}`, { method: "GET" });
    },
    enabled: !!selectedCentre?.id,
  });

  const { data: workshopPlanning } = useQuery({
    queryKey: ["/api/manpower-planning/workshop-technician"],
    queryFn: async () => await apiRequest("/api/manpower-planning/workshop-technician", { method: "GET" }),
  });

  const { data: clusterSummary } = useQuery({
    queryKey: ["/api/manpower-planning/cluster-summary", selectedCluster],
    queryFn: async () => {
      if (!selectedCluster) return null;
      return await apiRequest(`/api/manpower-planning/cluster/${selectedCluster}/summary`, { method: "GET" });
    },
    enabled: !!selectedCluster,
  });

  const safeCities = Array.isArray(cities) ? cities : [];
  const safeClusters = Array.isArray(clusters) ? clusters : [];
  const safeCentres = Array.isArray(centres) ? centres : [];
  const safeDesignations = Array.isArray(designations) ? designations : [];
  const safeAllPlanning = Array.isArray(allPlanning) ? allPlanning : [];
  const safeWorkshopData = Array.isArray(workshopPlanning) ? workshopPlanning : [];

  const planningDesignations = safeDesignations.filter((d: Designation) => d.manpowerPlanningRequired);

  const calculateRequiredTechnicians = (cityId: number) => {
    const cityWorkshop = safeWorkshopData.find((w: any) => w.cityId === cityId);
    if (!cityWorkshop) return 0;

    const baseValue = cityWorkshop.useBic ? (cityWorkshop.bikesInCity || 0) : (cityWorkshop.dau || 0);
    const outflowPercent = cityWorkshop.faultRatePercent || 8;
    const perMechanicCapacity = cityWorkshop.perMechanicCapacity || 10;
    const shrinkagePercent = cityWorkshop.shrinkagePercent || 15;

    const faultyBikes = baseValue * (outflowPercent / 100);
    const baseTechnicians = faultyBikes / perMechanicCapacity;
    const shrinkageFactor = 1 - (shrinkagePercent / 100);
    const withShrinkage = shrinkageFactor > 0 ? Math.ceil(baseTechnicians / shrinkageFactor) : Math.ceil(baseTechnicians);

    return withShrinkage;
  };

  const updateWorkshopData = (field: keyof WorkshopTechnicianPlan, value: any) => {
    setWorkshopData((prev) => ({
      ...(prev || {
        cityId: selectedCity || 0,
        dau: 0,
        bikesInCity: 0,
        faultRatePercent: 8,
        perMechanicCapacity: 10,
        shrinkagePercent: 15,
        useDau: true,
        useBic: false,
      }),
      [field]: value,
    }));
  };

  const saveWorkshopMutation = useMutation({
    mutationFn: async (data: WorkshopTechnicianPlan) => {
      return await apiRequest("/api/manpower-planning/workshop-technician", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/workshop-technician"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/cluster-summary"] });
      toast({
        title: "Success",
        description: "Workshop technician planning saved successfully",
      });
      setWorkshopModalOpen(false);
      setWorkshopData(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save workshop technician planning",
        variant: "destructive",
      });
    },
  });

  const filteredClusters = selectedCity
    ? safeClusters.filter((c: Cluster) => c.cityId === selectedCity)
    : [];

  const filteredCentres = selectedCluster
    ? safeCentres.filter((c: Centre) => c.clusterId === selectedCluster)
    : [];

  const getCentreStats = (centreId: number) => {
    const plans = safeAllPlanning.filter((p: any) => p.centreId === centreId);
    const totalShifts = plans.reduce((sum: number, p: any) => sum + (p.numShifts || 0), 0);
    const baseManpower = plans.reduce((sum: number, p: any) => sum + ((p.numShifts || 0) * (p.employeesPerShift || 0)), 0);
    return { totalShifts, baseManpower, designationsPlanned: plans.length };
  };

  const getClusterStats = (clusterId: number) => {
    const clusterCentres = safeCentres.filter((c: Centre) => c.clusterId === clusterId);
    const stats = clusterCentres.map((c: Centre) => getCentreStats(c.id));
    return {
      totalCentres: clusterCentres.length,
      totalShifts: stats.reduce((sum, s) => sum + s.totalShifts, 0),
      baseManpower: stats.reduce((sum, s) => sum + s.baseManpower, 0),
    };
  };

  const getCityStats = (cityId: number) => {
    const cityClusters = safeClusters.filter((c: Cluster) => c.cityId === cityId);
    const stats = cityClusters.map((c: Cluster) => getClusterStats(c.id));
    return {
      totalClusters: cityClusters.length,
      totalCentres: stats.reduce((sum, s) => sum + s.totalCentres, 0),
      totalShifts: stats.reduce((sum, s) => sum + s.totalShifts, 0),
      baseManpower: stats.reduce((sum, s) => sum + s.baseManpower, 0),
    };
  };

  const openCentrePlanning = (centre: Centre) => {
    setSelectedCentre(centre);
    setPlanningModalOpen(true);
    setPlanningData({});
  };

  const openWorkshopPlanning = (cityId: number) => {
    setSelectedCity(cityId);
    const existingWorkshop = safeWorkshopData.find((w: any) => w.cityId === cityId);
    if (existingWorkshop) {
      setWorkshopData(existingWorkshop);
    } else {
      setWorkshopData({
        cityId,
        dau: 0,
        bikesInCity: 0,
        faultRatePercent: 8,
        perMechanicCapacity: 10,
        shrinkagePercent: 15,
        useDau: true,
        useBic: false,
      });
    }
    setWorkshopModalOpen(true);
  };

  const getCityShrinkageForCentre = (): number => {
    if (!selectedCentre) return 15;
    const cluster = safeClusters.find((c: Cluster) => c.id === selectedCentre.clusterId);
    if (!cluster) return 15;
    const workshopData = safeWorkshopData.find((w: any) => w.cityId === cluster.cityId);
    return workshopData?.shrinkagePercent ?? 15;
  };

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
        if (plan.updatedByName && plan.updatedAt) {
          if (!latestUpdate || new Date(plan.updatedAt) > new Date(latestUpdate.date)) {
            latestUpdate = { name: plan.updatedByName, date: plan.updatedAt };
          }
        }
      });
      setPlanningData(initialData);
      setCentreLastUpdated(latestUpdate);
    } else {
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

  const savePlanningMutation = useMutation({
    mutationFn: async (data: { centreId: number; plans: ManpowerPlan[] }) => {
      return await apiRequest("/api/manpower-planning/centre", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/centre"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manpower-planning/cluster-summary"] });
      toast({
        title: "Success",
        description: "Manpower planning saved successfully",
      });
      setPlanningModalOpen(false);
      setSelectedCentre(null);
      setPlanningData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save manpower planning",
        variant: "destructive",
      });
    },
  });

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

  const calculateBaseManpower = (designationId: number) => {
    const plan = planningData[designationId];
    if (!plan) return 0;
    const shifts = plan.numShifts ?? 0;
    const employees = plan.employeesPerShift ?? 0;
    return shifts * employees;
  };

  const handleSavePlanning = () => {
    if (!selectedCentre) return;

    const plans = Object.values(planningData).filter(
      (plan) => plan.numShifts > 0 || plan.employeesPerShift > 0
    );

    savePlanningMutation.mutate({
      centreId: selectedCentre.id,
      plans,
    });
  };

  const handleSaveWorkshop = () => {
    if (!workshopData) return;
    saveWorkshopMutation.mutate(workshopData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manpower Planning</h1>
          <p className="text-gray-500">Manage workforce requirements across cities, clusters, and centres</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{safeCities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{safeClusters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Centres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{safeCentres.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Select City</Label>
          <Select
            value={selectedCity?.toString() || ""}
            onValueChange={(value) => {
              setSelectedCity(parseInt(value));
              setSelectedCluster(null);
              setSelectedCentre(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
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

        {selectedCity && (
          <div>
            <Label>Select Cluster</Label>
            <Select
              value={selectedCluster?.toString() || ""}
              onValueChange={(value) => {
                setSelectedCluster(parseInt(value));
                setSelectedCentre(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a cluster" />
              </SelectTrigger>
              <SelectContent>
                {filteredClusters.map((cluster: Cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id.toString()}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedCity && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {safeCities.find((c: City) => c.id === selectedCity)?.name} - Workshop Technician Planning
              </CardTitle>
              <Button onClick={() => openWorkshopPlanning(selectedCity)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const cityWorkshop = safeWorkshopData.find((w: any) => w.cityId === selectedCity);
              const requiredTechnicians = calculateRequiredTechnicians(selectedCity);
              
              if (!cityWorkshop) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No workshop technician planning configured for this city</p>
                    <p className="text-sm">Click Configure to set up planning parameters</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Using</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {cityWorkshop.useBic ? 'BIC' : 'DAU'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{cityWorkshop.useBic ? 'Bikes in City' : 'DAU'}</p>
                      <p className="text-lg font-semibold">
                        {cityWorkshop.useBic ? cityWorkshop.bikesInCity : cityWorkshop.dau}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fault Rate</p>
                      <p className="text-lg font-semibold">{cityWorkshop.faultRatePercent}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Per Mechanic Capacity</p>
                      <p className="text-lg font-semibold">{cityWorkshop.perMechanicCapacity}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Required Workshop Technicians</p>
                        <p className="text-xs text-blue-500 mt-1">
                          Formula: (({cityWorkshop.useBic ? cityWorkshop.bikesInCity : cityWorkshop.dau} × {cityWorkshop.faultRatePercent}%) ÷ {cityWorkshop.perMechanicCapacity}) / (1 - {cityWorkshop.shrinkagePercent}%)
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">{requiredTechnicians}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {selectedCluster && clusterSummary && Array.isArray(clusterSummary) && clusterSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {safeClusters.find((c: Cluster) => c.id === selectedCluster)?.name} - Cluster Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Total Shifts</TableHead>
                  <TableHead className="text-center">Total Employees</TableHead>
                  <TableHead className="text-center">Shrinkage %</TableHead>
                  <TableHead className="text-center">Final Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusterSummary.map((item: any) => (
                  <TableRow key={item.designationId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.designationName}</p>
                        <p className="text-sm text-gray-500">
                          {item.roleName} - {item.subDepartmentName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.totalShifts}</TableCell>
                    <TableCell className="text-center">{item.baseManpower}</TableCell>
                    <TableCell className="text-center">{item.shrinkagePercent}%</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        {item.totalWithShrinkage}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedCluster && (
        <Card>
          <CardHeader>
            <CardTitle>Centres in {safeClusters.find((c: Cluster) => c.id === selectedCluster)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCentres.map((centre: Centre) => {
                const stats = getCentreStats(centre.id);
                return (
                  <div
                    key={centre.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{centre.name}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Shifts: {stats.totalShifts}</span>
                        <span>Base Manpower: {stats.baseManpower}</span>
                        <span>Designations: {stats.designationsPlanned}</span>
                      </div>
                    </div>
                    <Button onClick={() => openCentrePlanning(centre)} size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Plan
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={planningModalOpen} onOpenChange={setPlanningModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manpower Planning - {selectedCentre?.name}
            </DialogTitle>
            {centreLastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated by {centreLastUpdated.name} on {new Date(centreLastUpdated.date).toLocaleString()}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 py-4">
            {planningDesignations.map((designation: Designation) => {
              const plan = planningData[designation.id];
              const isOperator = designation.name.toLowerCase() === 'operator';
              const baseManpower = calculateBaseManpower(designation.id);
              const shrinkagePercent = getCityShrinkageForCentre();
              const shrinkageFactor = 1 - (shrinkagePercent / 100);
              const finalRequired = shrinkageFactor > 0 ? Math.ceil(baseManpower / shrinkageFactor) : baseManpower;

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
                          <p className="text-xs text-gray-600 mt-1">
                            {isOperator 
                              ? `Formula: Trucks (${Math.floor((plan?.numShifts ?? 0) / 2)}) × 2 shifts × ${plan?.employeesPerShift ?? 1} emp/shift`
                              : `Formula: ${plan?.numShifts ?? 0} shifts × ${plan?.employeesPerShift ?? 0} emp/shift`
                            }
                          </p>
                        </div>
                        <div className={`text-2xl font-bold ${isOperator ? 'text-purple-600' : 'text-blue-600'}`}>
                          {baseManpower}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-900">
                              ⚠️ Final Required = Base / (1 - {shrinkagePercent}%) at cluster level
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanningModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlanning} disabled={savePlanningMutation.isPending}>
              {savePlanningMutation.isPending ? "Saving..." : "Save Planning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={workshopModalOpen} onOpenChange={setWorkshopModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Workshop Technician Planning - {safeCities.find((c: City) => c.id === selectedCity)?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <Label>Use DAU or BIC</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={workshopData?.useDau}
                      onChange={() => {
                        updateWorkshopData("useDau", true);
                        updateWorkshopData("useBic", false);
                      }}
                    />
                    <span>DAU (Daily Active Users)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={workshopData?.useBic}
                      onChange={() => {
                        updateWorkshopData("useDau", false);
                        updateWorkshopData("useBic", true);
                      }}
                    />
                    <span>BIC (Bikes in City)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>DAU (Daily Active Users)</Label>
                <Input
                  type="number"
                  min="0"
                  value={workshopData?.dau ?? 0}
                  onChange={(e) => updateWorkshopData("dau", parseInt(e.target.value) || 0)}
                  disabled={workshopData?.useBic}
                />
              </div>
              <div>
                <Label>BIC (Bikes in City)</Label>
                <Input
                  type="number"
                  min="0"
                  value={workshopData?.bikesInCity ?? 0}
                  onChange={(e) => updateWorkshopData("bikesInCity", parseInt(e.target.value) || 0)}
                  disabled={workshopData?.useDau}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fault Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={workshopData?.faultRatePercent ?? 8}
                  onChange={(e) => updateWorkshopData("faultRatePercent", parseFloat(e.target.value) || 8)}
                />
              </div>
              <div>
                <Label>Per Mechanic Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={workshopData?.perMechanicCapacity ?? 10}
                  onChange={(e) => updateWorkshopData("perMechanicCapacity", parseInt(e.target.value) || 10)}
                />
              </div>
            </div>

            <div>
              <Label>Shrinkage Percentage (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={workshopData?.shrinkagePercent ?? 15}
                onChange={(e) => updateWorkshopData("shrinkagePercent", parseFloat(e.target.value) || 15)}
              />
            </div>

            {workshopData && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-orange-900 mb-2">Required Workshop Technicians:</p>
                <p className="text-xs text-orange-700 mb-2">
                  Formula: (({workshopData.useBic ? workshopData.bikesInCity : workshopData.dau} × {workshopData.faultRatePercent}%) ÷ {workshopData.perMechanicCapacity}) / (1 - {workshopData.shrinkagePercent}%)
                </p>
                <div className="text-3xl font-bold text-orange-600">
                  {(() => {
                    const baseValue = workshopData.useBic ? workshopData.bikesInCity : workshopData.dau;
                    const faultyBikes = baseValue * (workshopData.faultRatePercent / 100);
                    const baseTechnicians = faultyBikes / workshopData.perMechanicCapacity;
                    const shrinkageFactor = 1 - (workshopData.shrinkagePercent / 100);
                    return shrinkageFactor > 0 ? Math.ceil(baseTechnicians / shrinkageFactor) : Math.ceil(baseTechnicians);
                  })()}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWorkshopModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWorkshop} disabled={saveWorkshopMutation.isPending}>
              {saveWorkshopMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
