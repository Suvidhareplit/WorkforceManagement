import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Bike, ChevronDown, ChevronRight, Download } from "lucide-react";

export default function ManpowerAnalysis() {
  const [useBic, setUseBic] = useState<boolean>(false);
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());

  // Bikes per employee analysis
  const { data: bikesAnalysis, isLoading: bikesLoading } = useQuery({
    queryKey: ["/api/manpower-planning/bikes-per-employee", useBic],
    queryFn: async () => await apiRequest(`/api/manpower-planning/bikes-per-employee?useBic=${useBic}`, { method: "GET" }),
  });

  // City-wise manpower analysis
  const { data: cityAnalysis, isLoading: cityLoading } = useQuery({
    queryKey: ["/api/manpower-planning/city-analysis"],
    queryFn: async () => await apiRequest("/api/manpower-planning/city-analysis", { method: "GET" }),
  });

  const toggleCity = (cityId: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityId)) {
      newExpanded.delete(cityId);
    } else {
      newExpanded.add(cityId);
    }
    setExpandedCities(newExpanded);
  };

  const downloadCSV = (data: any[], filename: string) => {
    const headers = ['Role', 'Planning Type', 'Base Manpower', 'Required Manpower', 'Current Active Headcount', 'Surplus/Deficit', 'Shrinkage %'];
    const rows = data.map((d: any) => [
      d.designationName,
      d.planningType || 'Shift Based',
      d.baseManpower ?? 'N/A',
      d.requiredManpower ?? 'N/A',
      d.currentHeadcount ?? 0,
      d.surplusDeficit ?? 'N/A',
      d.shrinkagePercent ? `${d.shrinkagePercent.toFixed(1)}%` : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSurplusDeficit = (value: number | null) => {
    if (value === null) return <span className="text-gray-400">N/A</span>;
    if (value > 0) {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">+{value}</Badge>;
    } else if (value < 0) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{value}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">0</Badge>;
  };

  const renderDesignationTable = (designations: any[], totals: any, workshopTechnicianRequired?: number) => {
    // Workshop technician designation names to combine
    const workshopTechnicianNames = ['Workshop Technician', 'Senior Workshop Technician', 'Associate Workshop Technician'];
    
    // Filter and process designations
    const filteredDesignations = designations.filter((d: any) => d.currentHeadcount > 0 || d.isPlanned);
    
    // Separate workshop technicians from others
    const workshopTechnicians = filteredDesignations.filter((d: any) => 
      workshopTechnicianNames.some(wt => d.designationName.toLowerCase().includes(wt.toLowerCase()))
    );
    const otherDesignations = filteredDesignations.filter((d: any) => 
      !workshopTechnicianNames.some(wt => d.designationName.toLowerCase().includes(wt.toLowerCase()))
    );
    
    // Get combined headcount for all workshop technicians
    const combinedWorkshopHeadcount = workshopTechnicians.reduce((sum: number, d: any) => sum + d.currentHeadcount, 0);
    
    // Use the single workshopTechnicianRequired value from backend (not sum of individual)
    const workshopRequired = workshopTechnicianRequired || 0;
    const isWorkshopPlanned = workshopRequired > 0;
    
    // Combine workshop technicians into one row with single required value
    const combinedWorkshopTechnician = (workshopTechnicians.length > 0 || isWorkshopPlanned) ? {
      designationId: 'workshop-combined',
      designationName: 'Workshop Technician + Senior Workshop Technician + Associate Workshop Technician',
      isPlanned: isWorkshopPlanned,
      planningType: 'As per BIC',
      baseManpower: null,
      requiredManpower: workshopRequired,
      currentHeadcount: combinedWorkshopHeadcount,
      surplusDeficit: isWorkshopPlanned ? combinedWorkshopHeadcount - workshopRequired : null,
      shrinkagePercent: null
    } : null;
    
    // Separate planned and unplanned designations
    const plannedDesignations = otherDesignations.filter((d: any) => d.isPlanned);
    const unplannedDesignations = otherDesignations.filter((d: any) => !d.isPlanned);
    
    // Sort both groups by current headcount in descending order
    const sortedPlanned = [...plannedDesignations].sort((a: any, b: any) => {
      return (b.currentHeadcount || 0) - (a.currentHeadcount || 0);
    });
    const sortedUnplanned = [...unplannedDesignations].sort((a: any, b: any) => {
      return (b.currentHeadcount || 0) - (a.currentHeadcount || 0);
    });
    
    // Build final list: planned first, then workshop technician (if planned), then unplanned
    const finalDesignations: any[] = [...sortedPlanned];
    if (combinedWorkshopTechnician && combinedWorkshopTechnician.isPlanned) {
      // Insert workshop technician in correct position within planned designations
      const insertIndex = finalDesignations.findIndex(
        (d: any) => (d.currentHeadcount || 0) < (combinedWorkshopTechnician.currentHeadcount || 0)
      );
      if (insertIndex === -1) {
        finalDesignations.push(combinedWorkshopTechnician);
      } else {
        finalDesignations.splice(insertIndex, 0, combinedWorkshopTechnician);
      }
    }
    finalDesignations.push(...sortedUnplanned);
    if (combinedWorkshopTechnician && !combinedWorkshopTechnician.isPlanned) {
      // Insert workshop technician in correct position within unplanned designations
      const unplannedStartIndex = sortedPlanned.length;
      const insertIndex = finalDesignations.slice(unplannedStartIndex).findIndex(
        (d: any) => (d.currentHeadcount || 0) < (combinedWorkshopTechnician.currentHeadcount || 0)
      );
      if (insertIndex === -1) {
        finalDesignations.push(combinedWorkshopTechnician);
      } else {
        finalDesignations.splice(unplannedStartIndex + insertIndex, 0, combinedWorkshopTechnician);
      }
    }
    
    return (
    <Table className="w-full">
      <TableHeader>
        <TableRow className="bg-cyan-600">
          <TableHead className="text-white font-semibold" style={{ width: '30%' }}>ROLE</TableHead>
          <TableHead className="text-white font-semibold text-center" style={{ width: '25%' }}>REQUIRED MANPOWER</TableHead>
          <TableHead className="text-white font-semibold text-center" style={{ width: '25%' }}>CURRENT ACTIVE HEADCOUNT</TableHead>
          <TableHead className="text-white font-semibold text-center" style={{ width: '20%' }}>SURPLUS OR DEFICIT</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {finalDesignations.map((designation: any) => (
          <TableRow key={designation.designationId} className="hover:bg-gray-50 border-b">
            <TableCell>
              <div>
                <p className="font-medium text-gray-900">{designation.designationName}</p>
                <Badge 
                  variant="outline" 
                  className={designation.isPlanned 
                    ? "text-cyan-600 border-cyan-200 bg-cyan-50 text-xs mt-1" 
                    : "text-yellow-600 border-yellow-200 bg-yellow-50 text-xs mt-1"
                  }
                >
                  {designation.planningType || 'Shift Based'}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="text-center">
              {designation.isPlanned ? (
                <div>
                  <p className="font-bold text-gray-900 text-lg">{designation.requiredManpower}</p>
                  {designation.baseManpower && designation.shrinkagePercent && (
                    <p className="text-xs text-gray-500">Base: {designation.baseManpower} + {designation.shrinkagePercent}% shrinkage</p>
                  )}
                </div>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                  Manpower Planning Not Set
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-center font-semibold text-gray-900 text-lg">
              {designation.currentHeadcount}
            </TableCell>
            <TableCell className="text-center">
              {renderSurplusDeficit(designation.surplusDeficit)}
            </TableCell>
          </TableRow>
        ))}
        {/* Total Row */}
        <TableRow className="bg-cyan-700 text-white font-bold">
          <TableCell className="text-white font-bold">TOTAL</TableCell>
          <TableCell className="text-center text-white font-bold text-lg">{totals.requiredManpower}</TableCell>
          <TableCell className="text-center text-white font-bold text-lg">{totals.currentHeadcount}</TableCell>
          <TableCell className="text-center">
            {totals.surplusDeficit !== null && (
              <Badge className={totals.surplusDeficit >= 0 ? "bg-blue-200 text-blue-800" : "bg-red-200 text-red-800"}>
                {totals.surplusDeficit >= 0 ? '+' : ''}{totals.surplusDeficit}
              </Badge>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manpower Analysis</h1>
        <p className="text-gray-500">Workforce efficiency metrics and analysis</p>
      </div>

      {/* Bikes Per Employee Analysis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bikes Per Employee Analysis</h2>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${!useBic ? 'text-blue-600' : 'text-gray-400'}`}>DAU</span>
            <Switch
              checked={useBic}
              onCheckedChange={setUseBic}
            />
            <span className={`text-sm font-medium ${useBic ? 'text-blue-600' : 'text-gray-400'}`}>BIC</span>
          </div>
        </div>
        
        {bikesLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : !bikesAnalysis || !bikesAnalysis.cityWise || bikesAnalysis.cityWise.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No data available. Please add DAU/BIC data in Manpower Planning first.</div>
        ) : (
          <div className="space-y-4">
            {/* PAN India Summary */}
            <Card className="shadow-sm border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Bike className="h-5 w-5" />
                      <span className="font-bold text-lg">
                        PAN India ({(bikesAnalysis.cityWise || []).map((c: any) => c.cityName.substring(0, 3).toUpperCase()).join('+')})
                      </span>
                    </div>
                    <p className="text-blue-100 text-sm">Consolidated bikes per employee ratio</p>
                    <div className="flex gap-16 mt-6">
                      <div>
                        <p className="text-blue-200 text-sm">Total Bikes</p>
                        <p className="text-3xl font-bold mt-1">{(bikesAnalysis.panIndia?.totalBikes || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold mt-1">{(bikesAnalysis.panIndia?.totalEmployees || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-6xl font-bold">{(bikesAnalysis.panIndia?.ratio || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* City-wise Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(bikesAnalysis.cityWise || []).map((city: any) => (
                <Card key={city.cityId} className="shadow-sm border hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-gray-900 text-lg">{city.cityName}</span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Bikes:</span>
                        <span className="font-semibold text-gray-900 text-lg">{(city.bikes || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Employees:</span>
                        <span className="font-semibold text-gray-900 text-lg">{(city.employees || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-gray-500">Ratio:</span>
                        <span className="font-bold text-blue-600 text-xl">{(city.ratio || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manpower Analysis by City */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Manpower Analysis by City</h2>
        </div>
        
        {cityLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : !cityAnalysis ? (
          <div className="text-center py-8 text-gray-500">No data available.</div>
        ) : (
          <div className="space-y-2">
            {/* PAN India Accordion */}
            <div className="border rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-700 text-white"
              >
                <div onClick={() => toggleCity('panIndia')} className="flex-1">
                  <span className="font-bold text-lg">
                    PAN India ({cityAnalysis.cities?.map((c: any) => c.cityName.substring(0, 3).toUpperCase()).join('+')})
                  </span>
                  <p className="text-cyan-100 text-sm">Consolidated view across all cities</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadCSV(cityAnalysis.panIndia.designations, 'PAN_India_Manpower_Analysis.csv');
                    }}
                    className="p-2 hover:bg-cyan-800 rounded-lg transition-colors"
                    title="Download CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <div onClick={() => toggleCity('panIndia')}>
                    {expandedCities.has('panIndia') ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>
              {expandedCities.has('panIndia') && cityAnalysis.panIndia && (
                <div className="p-4 bg-white">
                  {renderDesignationTable(cityAnalysis.panIndia.designations, cityAnalysis.panIndia.totals, cityAnalysis.cities?.reduce((sum: number, c: any) => sum + (c.workshopTechnicianRequired || 0), 0))}
                </div>
              )}
            </div>

            {/* City Accordions */}
            {cityAnalysis.cities?.map((city: any) => (
              <div key={city.cityId} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer bg-gradient-to-r from-cyan-100 to-cyan-200 hover:from-cyan-200 hover:to-cyan-300"
                >
                  <span className="font-bold text-gray-900 flex-1" onClick={() => toggleCity(city.cityId.toString())}>{city.cityName}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadCSV(city.designations, `${city.cityName}_Manpower_Analysis.csv`);
                      }}
                      className="p-2 hover:bg-cyan-300 rounded-lg transition-colors"
                      title="Download CSV"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                    <div onClick={() => toggleCity(city.cityId.toString())}>
                      {expandedCities.has(city.cityId.toString()) ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedCities.has(city.cityId.toString()) && (
                  <div className="p-4 bg-white">
                    {renderDesignationTable(city.designations, city.totals, city.workshopTechnicianRequired)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
