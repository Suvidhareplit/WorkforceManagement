import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Users, ArrowLeft, LayoutGrid, Briefcase, UserCircle, MapPin, Network, Wallet, MapPinned, ChevronRight, ChevronDown } from "lucide-react";

type ViewType = 'overview' | 'employees' | 'orgStructure' | 'departments' | 'subDepartments' | 'roles' | 'designations' | 'cities' | 'clusters' | 'centres' | 'costCentres';

export default function OrgDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [clusterFilter, setClusterFilter] = useState<string>("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>("all");
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("all");
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());

  const { data: orgData, isLoading } = useQuery({
    queryKey: ["/api/employees/org-hierarchy", cityFilter, clusterFilter, employmentTypeFilter, businessUnitFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cityFilter !== "all") params.append("city", cityFilter);
      if (clusterFilter !== "all") params.append("cluster", clusterFilter);
      if (employmentTypeFilter !== "all") params.append("employmentType", employmentTypeFilter);
      if (businessUnitFilter !== "all") params.append("business_unit", businessUnitFilter);
      params.append("_t", Date.now().toString()); // Cache buster
      const queryString = params.toString();
      const url = `/api/employees/org-hierarchy?${queryString}`;
      return await apiRequest(url, { method: "GET" });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  const { data: filterOptions } = useQuery({
    queryKey: ["/api/employees/filter-options"],
    queryFn: async () => await apiRequest("/api/employees/filter-options", { method: "GET" }),
  });

  const hierarchy = orgData?.hierarchy || [];
  const totalCount = orgData?.totalCount || 0;
  const masterCounts = orgData?.masterCounts || { departments: 0, subDepartments: 0, roles: 0, designations: 0, cities: 0, clusters: 0, centres: 0, costCentres: 0 };
  const citiesWithClusters = orgData?.citiesWithClusters || [];
  const centresList = orgData?.centresList || [];
  const costCentresList = orgData?.costCentresList || [];
  const cityWiseHeadcount = orgData?.cityWiseHeadcount || [];
  const clusterWiseHeadcount = orgData?.clusterWiseHeadcount || [];
  const clusterDesignationHeadcount = orgData?.clusterDesignationHeadcount || [];
  const cityDesignationHeadcount = orgData?.cityDesignationHeadcount || [];
  const businessUnits = orgData?.businessUnits || [];
  const cities = filterOptions?.cities || [];
  const clusters = filterOptions?.clusters || [];
  const employmentTypes = filterOptions?.employmentTypes || [];

  const resetFilters = () => { setCityFilter("all"); setClusterFilter("all"); setEmploymentTypeFilter("all"); setBusinessUnitFilter("all"); };

  // Helper function to group Workshop Technicians with breakdown display
  const groupDesignations = (designations: any[]) => {
    const workshopTechDesignations = ['Workshop Technician', 'Senior Workshop Technician', 'Associate Workshop Technician'];
    const workshopTechItems = designations.filter((d: any) => workshopTechDesignations.includes(d.designation));
    const workshopTechTotal = workshopTechItems.reduce((sum: number, d: any) => sum + d.count, 0);
    
    const otherDesignations = designations.filter((d: any) => !workshopTechDesignations.includes(d.designation));
    
    // Build breakdown string: "Associate Workshop Technician(20) + Workshop Technician(402) + Senior Workshop Technician(38)"
    const breakdownParts = workshopTechItems
      .sort((a: any, b: any) => b.count - a.count)
      .map((d: any) => `${d.designation}(${d.count})`);
    const breakdownLabel = breakdownParts.join('\n+ ');
    
    const result = workshopTechTotal > 0 
      ? [{ designation: breakdownLabel, count: workshopTechTotal, isWorkshopGroup: true }, ...otherDesignations]
      : otherDesignations;
    
    return result.sort((a: any, b: any) => b.count - a.count);
  };

  // Get clusters for a specific city
  const getCityClusters = (cityName: string) => {
    return clusterWiseHeadcount.filter((c: any) => c.city === cityName);
  };

  const handleMetricClick = (type: ViewType) => { 
    if (currentView === type) {
      setCurrentView('overview');
    } else {
      setCurrentView(type); 
    }
    setSelectedDepartment(null); 
    setSelectedSubDepartment(null); 
    setSelectedRole(null);
  };

  // Standard blue theme for all cards
  const metricCards = [
    { key: 'employees', label: 'Total Employees', count: totalCount, icon: Users },
    { key: 'orgStructure', label: 'Org Structure', count: '', icon: Network },
    { key: 'departments', label: 'Departments', count: masterCounts.departments, icon: Building2 },
    { key: 'subDepartments', label: 'Sub-Departments', count: masterCounts.subDepartments, icon: LayoutGrid },
    { key: 'roles', label: 'Roles', count: masterCounts.roles, icon: Briefcase },
    { key: 'designations', label: 'Designations', count: masterCounts.designations, icon: UserCircle },
    { key: 'cities', label: 'Cities & Clusters', count: `${masterCounts.cities} / ${masterCounts.clusters}`, icon: MapPin },
    { key: 'centres', label: 'Centres', count: masterCounts.centres, icon: MapPinned },
    { key: 'costCentres', label: 'Cost Centres', count: masterCounts.costCentres, icon: Wallet },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Workforce analytics and organizational structure</p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2 bg-white">
          <Users className="h-4 w-4 mr-2" />{totalCount.toLocaleString()} Employees
        </Badge>
      </div>

      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="All Cities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city: string) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={clusterFilter} onValueChange={setClusterFilter}>
              <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="All Clusters" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters</SelectItem>
                {clusters.map((cluster: string) => <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
              <SelectTrigger className="w-[180px] bg-white border-blue-200"><SelectValue placeholder="All Business Units" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Units</SelectItem>
                {(businessUnits || []).map((bu: string) => <SelectItem key={bu} value={bu}>{bu}</SelectItem>)}
              </SelectContent>
            </Select>
            {(cityFilter !== 'all' || clusterFilter !== 'all' || employmentTypeFilter !== 'all' || businessUnitFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500">Clear filters</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* First Row: Total Employees + City-wise Headcount */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Employees Card with YGO and 3P breakdown */}
        <div 
          onClick={() => handleMetricClick('employees')}
          className={`p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
            currentView === 'employees' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-md' 
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              currentView === 'employees' ? 'bg-blue-400/50' : 'bg-blue-500'
            }`}>
              <Users className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <div className={`text-3xl font-bold ${currentView === 'employees' ? 'text-white' : 'text-blue-600'}`}>
                {totalCount.toLocaleString()}
              </div>
              <div className={`text-sm font-medium mt-1 ${currentView === 'employees' ? 'text-blue-100' : 'text-gray-500'}`}>
                Total Employees
              </div>
            </div>
          </div>
          <div className={`mt-3 pt-3 border-t ${currentView === 'employees' ? 'border-blue-400/50' : 'border-gray-200'} flex justify-between text-sm`}>
            <div>
              <span className={`font-bold ${currentView === 'employees' ? 'text-white' : 'text-blue-600'}`}>
                {costCentresList.find((c: any) => c.name === 'YGO')?.employeeCount?.toLocaleString() || 0}
              </span>
              <span className={`ml-1 ${currentView === 'employees' ? 'text-blue-100' : 'text-gray-500'}`}>YGO</span>
            </div>
            <div>
              <span className={`font-bold ${currentView === 'employees' ? 'text-white' : 'text-purple-600'}`}>
                {(costCentresList.filter((c: any) => c.name !== 'YGO').reduce((sum: number, c: any) => sum + (c.employeeCount || 0), 0)).toLocaleString()}
              </span>
              <span className={`ml-1 ${currentView === 'employees' ? 'text-blue-100' : 'text-gray-500'}`}>3P</span>
            </div>
          </div>
        </div>
        
        {/* City-wise Headcount Cards */}
        {cityWiseHeadcount.map((cityData: any, index: number) => {
          const colors = [
            { bg: 'bg-gradient-to-r from-emerald-500 to-green-500', icon: 'bg-emerald-400/50', text: 'text-emerald-600' },
            { bg: 'bg-gradient-to-r from-purple-500 to-violet-500', icon: 'bg-purple-400/50', text: 'text-purple-600' },
            { bg: 'bg-gradient-to-r from-orange-500 to-amber-500', icon: 'bg-orange-400/50', text: 'text-orange-600' },
            { bg: 'bg-gradient-to-r from-cyan-500 to-teal-500', icon: 'bg-cyan-400/50', text: 'text-cyan-600' },
          ];
          const color = colors[index % colors.length];
          return (
            <div 
              key={cityData.city}
              onClick={() => setSelectedCity(selectedCity === cityData.city ? null : cityData.city)}
              className={`p-6 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                selectedCity === cityData.city 
                  ? 'bg-gray-100 border-gray-400 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${color.bg}`}>
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className={`text-3xl font-bold ${color.text}`}>
                  {(cityData.count || 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium mt-1 text-gray-500">
                  {cityData.city}
                </div>
                <div className="text-xs text-gray-400 mt-1 italic">Click to see Designation wise Head count</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* City Designation Headcount Table - Shows when a city is selected */}
      {selectedCity && (() => {
        const cityDesignations = groupDesignations(cityDesignationHeadcount.filter((d: any) => d.city === selectedCity));
        const cityClusters = getCityClusters(selectedCity);
        const totalHeadcount = cityDesignations.reduce((sum: number, d: any) => sum + d.count, 0);
        
        return (
          <Card className="shadow-sm border">
            <CardContent className="p-0">
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{selectedCity} - Designation Wise Head Count</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCity(null)} className="text-gray-500">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Close
                </Button>
              </div>
              <div className="flex">
                {/* Clusters List */}
                <div className="w-64 border-r p-4 bg-gray-50">
                  <div className="text-xs font-bold text-gray-900 mb-3">CLUSTERS IN {selectedCity.toUpperCase()}</div>
                  <div className="space-y-2">
                    {cityClusters.map((cluster: any) => (
                      <div key={cluster.name} className="flex items-center justify-between px-3 py-2 bg-white border rounded text-sm">
                        <span className="text-gray-700">{cluster.name}</span>
                        <span className="font-semibold text-gray-900">{cluster.employeeCount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Designation Table */}
                <div className="flex-1">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-900">Designation</th>
                        <th className="px-4 py-3 text-right font-bold text-gray-900 w-32">Head Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cityDesignations.map((d: any) => (
                        <tr key={d.designation} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700 whitespace-pre-line">{d.designation}</td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900 align-top">{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2">
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{totalHeadcount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Second Row: Other Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {metricCards.filter(card => card.key !== 'employees').map((card) => (
          <div 
            key={card.key} 
            onClick={() => handleMetricClick(card.key as ViewType)}
            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
              currentView === card.key 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
              currentView === card.key ? 'bg-blue-400' : 'bg-blue-500'
            }`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
            <div className={`text-xl font-bold ${currentView === card.key ? 'text-white' : 'text-blue-600'}`}>
              {card.count}
            </div>
            <div className={`text-xs mt-1 ${currentView === card.key ? 'text-blue-100' : 'text-gray-500'}`}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pivot Table - Overview */}
      {currentView === 'overview' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : hierarchy.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data found</div>
          ) : !selectedDepartment ? (
            /* Department List - Only show when no department selected */
            <Card className="shadow-sm border">
              <CardContent className="p-0">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h3 className="font-bold text-gray-900">PAN India Department Wise Head Count</h3>
                </div>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {hierarchy.map((dept: any) => (
                      <tr 
                        key={`dept-${dept.name}`}
                        className="border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedDepartment(dept.name)}
                      >
                        <td className="px-4 py-3 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            {dept.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900 w-20">{dept.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            /* Selected Department View */
            (() => {
              const dept = hierarchy.find((d: any) => d.name === selectedDepartment);
              if (!dept) return null;
              return (
                <>
                  {/* Department Header Card */}
                  <Card className="shadow-sm border-l-4 border-l-blue-500 bg-blue-50">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-bold text-gray-900">{dept.name}</h3>
                            <p className="text-sm text-blue-600">{dept.count} employees</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDepartment(null)} className="hover:bg-blue-100">
                          <ArrowLeft className="h-5 w-5 text-blue-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sub-Departments Summary - Compact inline */}
                  <div className="flex flex-wrap gap-2">
                    {(dept.children || []).map((subDept: any) => (
                      <div key={subDept.name} className="px-3 py-2 bg-white border rounded-lg flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-gray-900 text-sm">{subDept.name}</span>
                        <span className="text-xs text-gray-500">{subDept.count} • {(subDept.children || []).length} roles</span>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Table */}
                  <Card className="shadow-sm border">
                    <CardContent className="p-0">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="text-left px-4 py-3 font-bold text-gray-800">Sub-Department</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-800">Role</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-800">Designation</th>
                            <th className="text-center px-4 py-3 font-bold text-gray-800 w-20">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(dept.children || []).map((subDept: any, subIdx: number) => {
                            const isLastSubDept = subIdx === (dept.children || []).length - 1;
                            return (subDept.children || []).map((role: any, roleIdx: number) => {
                              // Group Workshop Technicians for this role
                              const roleDesignations = role.children || [];
                              const groupedDesignations = groupDesignations(roleDesignations.map((d: any) => ({ designation: d.name, count: d.count })));
                              
                              return groupedDesignations.map((des: any, idx: number) => {
                                const isLastRowOfSubDept = roleIdx === (subDept.children || []).length - 1 && idx === groupedDesignations.length - 1;
                                return (
                                  <tr key={`row-${subDept.name}-${role.name}-${des.designation}-${idx}`} 
                                      className={`hover:bg-gray-50 ${isLastRowOfSubDept && !isLastSubDept ? 'border-b-2 border-gray-400' : 'border-b border-gray-200'}`}>
                                    {idx === 0 && roleIdx === 0 ? (
                                      <td className="px-4 py-2 font-bold text-gray-900 align-top border-r border-gray-200" 
                                          rowSpan={(subDept.children || []).reduce((acc: number, r: any) => acc + groupDesignations((r.children || []).map((d: any) => ({ designation: d.name, count: d.count }))).length, 0)}>
                                        {subDept.name}
                                      </td>
                                    ) : null}
                                    {idx === 0 ? (
                                      <td className="px-4 py-2 text-gray-900 align-top border-r border-gray-200" rowSpan={groupedDesignations.length}>
                                        {role.name}
                                      </td>
                                    ) : null}
                                    <td className="px-4 py-2 text-gray-900 whitespace-pre-line">{des.designation || '-'}</td>
                                    <td className="px-4 py-2 text-center text-gray-900 font-medium align-top">{des.count}</td>
                                  </tr>
                                );
                              });
                            });
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </>
              );
            })()
          )}
        </div>
      )}

      {/* Cities View - Expanded with Clusters */}
      {currentView === 'cities' && (
        <Card className="shadow-sm"><CardContent className="p-0">
          {isLoading ? <div className="text-center py-8 text-gray-500">Loading...</div>
          : citiesWithClusters.length === 0 ? (
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cities.map((city: string) => (
                <div key={city} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500 text-white"><MapPin className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0"><h4 className="font-medium text-gray-900 truncate">{city}</h4></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-900 w-40">City</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Clusters</th>
              </tr>
            </thead>
            <tbody>
              {citiesWithClusters.map((city: any) => {
                const cityClusters = getCityClusters(city.name);
                return (
                  <tr key={city.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 font-bold text-gray-900 align-top border-r bg-blue-50">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        {city.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{cityClusters.reduce((sum: number, c: any) => sum + (c.employeeCount || 0), 0).toLocaleString()} employees</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {cityClusters.map((cluster: any) => (
                          <div key={cluster.name} className="px-3 py-2 bg-white border rounded-lg flex items-center gap-2">
                            <Network className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-700">{cluster.name}</span>
                            <span className="font-bold text-gray-900">({cluster.employeeCount})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </CardContent></Card>
      )}

      {/* Centres View - Grouped by City and Cluster */}
      {currentView === 'centres' && (
        <Card className="shadow-sm"><CardContent className="p-6">
          {isLoading ? <div className="text-center py-8 text-gray-500">Loading...</div>
          : centresList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPinned className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No centres found</p>
            </div>
          ) : (
          <div className="space-y-4">
            {/* Group centres by city, then by cluster */}
            {Object.entries(
              centresList.reduce((acc: any, centre: any) => {
                const city = centre.cityName || 'Unknown';
                if (!acc[city]) acc[city] = {};
                const cluster = centre.clusterName || 'Unknown';
                if (!acc[city][cluster]) acc[city][cluster] = [];
                acc[city][cluster].push(centre);
                return acc;
              }, {})
            ).map(([cityName, clusters]: [string, any]) => {
              const totalCentres = Object.values(clusters).flat().length;
              const isExpanded = expandedCities.has(cityName);
              const toggleCity = () => {
                setExpandedCities(prev => {
                  const next = new Set(prev);
                  if (next.has(cityName)) next.delete(cityName);
                  else next.add(cityName);
                  return next;
                });
              };
              return (
                <div key={cityName} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center gap-2 px-4 py-3 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={toggleCity}
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <h3 className="font-bold text-gray-900">{cityName}</h3>
                    <span className="text-sm text-gray-500">({totalCentres} centres)</span>
                  </div>
                  {isExpanded && (
                    <div className="p-4 space-y-4 border-t">
                      {Object.entries(clusters).map(([clusterName, clusterCentres]: [string, any]) => (
                        <div key={clusterName} className="space-y-2">
                          <div className="flex items-center gap-2 pl-2 border-l-2 border-purple-300">
                            <Network className="h-4 w-4 text-purple-500" />
                            <h4 className="font-semibold text-gray-800">{clusterName}</h4>
                            <span className="text-xs text-gray-500">({clusterCentres.length} centres)</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pl-6">
                            {clusterCentres.map((centre: any) => (
                              <div key={centre.id} className="p-3 border rounded-lg bg-white hover:shadow-sm">
                                <h5 className="font-medium text-gray-900 truncate text-sm">{centre.name}</h5>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </CardContent></Card>
      )}

      {/* Cost Centres View */}
      {currentView === 'costCentres' && (
        <Card className="shadow-sm"><CardContent className="p-6">
          {isLoading ? <div className="text-center py-8 text-gray-500">Loading...</div>
          : costCentresList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No cost centres found</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {costCentresList.map((cc: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500 text-white"><Wallet className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{cc.name}</h4>
                    <div className="text-xs text-gray-500"><span className="font-bold text-black text-base">{cc.employeeCount || 0}</span> employees</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent></Card>
      )}

      {/* Employees View */}
      {currentView === 'employees' && (
        <Card className="shadow-sm"><CardContent className="p-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-2xl font-bold text-gray-900">{totalCount.toLocaleString()}</p>
            <p className="text-gray-500">Total active employees</p>
          </div>
        </CardContent></Card>
      )}

      {/* Org Structure View - Nested Collapsible Tree Chart */}
      {currentView === 'orgStructure' && (
        <Card className="shadow-sm bg-gray-50 w-full max-w-[calc(100vw-3rem)] overflow-hidden">
          <CardContent className="p-6 overflow-auto max-h-[80vh] w-full">
          <div className="min-w-max pb-12">
            
            {/* Level 0: YGO Root - Centered */}
            <div className="flex justify-center mb-0 relative z-20">
              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-600 px-8 py-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-2xl">YGO</div>
                  </div>
                </div>
              </div>
              {/* Main vertical line from YGO - Stops at horizontal line level */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-[60px] bg-black z-0"></div>
            </div>

            {/* Level 1: Departments - Horizontal Row */}
            <div className="flex justify-center items-start mt-[120px] relative min-w-max">
              {hierarchy.map((dept: any, index: number) => {
                const isDeptExpanded = expandedCities.has(`org-dept-${dept.name}`);
                const isFirst = index === 0;
                const isLast = index === hierarchy.length - 1;
                const isOnly = hierarchy.length === 1;

                return (
                  <div key={dept.name} className="flex flex-col items-center relative px-6">
                    {/* Top Connectors Construction */}
                    <div className="absolute -top-[60px] left-0 w-full h-[60px] pointer-events-none">
                      {/* Left Horizontal Segment - Hidden for first item */}
                      {!isFirst && !isOnly && (
                        <div className="absolute top-0 left-0 w-1/2 h-px bg-black"></div>
                      )}
                      {/* Right Horizontal Segment - Hidden for last item */}
                      {!isLast && !isOnly && (
                        <div className="absolute top-0 right-0 w-1/2 h-px bg-black"></div>
                      )}
                      {/* Vertical Drop Line to Card */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[60px] bg-black"></div>
                    </div>
                     
                    {/* Department Card */}
                    <div 
                      className={`bg-white rounded-xl shadow-md border-2 px-5 py-4 cursor-pointer transition-all hover:shadow-lg relative z-10 ${isDeptExpanded ? 'border-green-600 bg-green-50' : 'border-green-400'}`}
                      onClick={() => {
                        setExpandedCities(prev => {
                          const next = new Set(prev);
                          const key = `org-dept-${dept.name}`;
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {isDeptExpanded ? <ChevronDown className="h-5 w-5 text-green-600" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">{dept.name}</div>
                          <div className="text-sm text-green-600 font-medium">{dept.count} employees</div>
                        </div>
                      </div>
                    </div>

                    {/* Level 2: Sub-Departments Container - Directly below Department */}
                    {isDeptExpanded && (dept.children || []).length > 0 && (
                      <div className="flex flex-col items-center mt-4 w-full">
                        {/* Vertical line from Dept to SubDepts */}
                        <div className="w-px h-6 bg-black mb-0"></div>
                        
                        {/* Horizontal Container for Sub-Depts */}
                        <div className="flex justify-center items-start relative">
                          {(dept.children || []).map((subDept: any, subIndex: number) => {
                            const isSubDeptExpanded = expandedCities.has(`org-subdept-${dept.name}-${subDept.name}`);
                            const isSubFirst = subIndex === 0;
                            const isSubLast = subIndex === (dept.children || []).length - 1;
                            const isSubOnly = (dept.children || []).length === 1;

                            return (
                              <div key={subDept.name} className="flex flex-col items-center px-3 relative">
                                {/* Connectors */}
                                <div className="absolute top-0 left-0 w-full h-4 pointer-events-none">
                                  {!isSubFirst && !isSubOnly && <div className="absolute top-0 left-0 w-1/2 h-px bg-black"></div>}
                                  {!isSubLast && !isSubOnly && <div className="absolute top-0 right-0 w-1/2 h-px bg-black"></div>}
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-black"></div>
                                </div>

                                {/* Spacer for connectors */}
                                <div className="h-4"></div>

                                {/* Sub-Department Card */}
                                <div 
                                  className={`bg-white rounded-lg shadow border-2 px-4 py-3 cursor-pointer transition-all hover:shadow-md w-64 relative z-10 ${isSubDeptExpanded ? 'border-purple-600 bg-purple-50' : 'border-purple-300'}`}
                                  onClick={() => {
                                    setExpandedCities(prev => {
                                      const next = new Set(prev);
                                      const key = `org-subdept-${dept.name}-${subDept.name}`;
                                      if (next.has(key)) next.delete(key);
                                      else next.add(key);
                                      return next;
                                    });
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    {isSubDeptExpanded ? <ChevronDown className="h-4 w-4 text-purple-600" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                    <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                      <LayoutGrid className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="min-w-0 overflow-hidden">
                                      <div className="font-semibold text-gray-800 text-sm truncate" title={subDept.name}>{subDept.name}</div>
                                      <div className="text-[10px] text-purple-600">{subDept.count} emp</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Level 3: Roles Container - Directly below Sub-Department */}
                                {isSubDeptExpanded && (subDept.children || []).length > 0 && (
                                  <div className="flex flex-col items-center mt-2 w-full">
                                    <div className="w-px h-4 bg-black mb-0"></div>
                                    
                                    {/* Roles - Horizontal Row */}
                                    <div className="flex justify-center items-start relative w-full">
                                      {(subDept.children || []).map((role: any, roleIndex: number) => {
                                        const isRoleExpanded = expandedCities.has(`org-role-${dept.name}-${subDept.name}-${role.name}`);
                                        const designations = role.children || [];
                                        const isRoleFirst = roleIndex === 0;
                                        const isRoleLast = roleIndex === (subDept.children || []).length - 1;
                                        const isRoleOnly = (subDept.children || []).length === 1;

                                        return (
                                          <div key={role.name} className="flex flex-col items-center px-2 relative">
                                            {/* Connectors */}
                                            <div className="absolute top-0 left-0 w-full h-4 pointer-events-none">
                                              {!isRoleFirst && !isRoleOnly && <div className="absolute top-0 left-0 w-1/2 h-px bg-black border-t border-dashed border-black"></div>}
                                              {!isRoleLast && !isRoleOnly && <div className="absolute top-0 right-0 w-1/2 h-px bg-black border-t border-dashed border-black"></div>}
                                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-black"></div>
                                            </div>

                                            {/* Spacer */}
                                            <div className="h-4"></div>

                                            {/* Role Card */}
                                            <div 
                                              className={`bg-white rounded border px-3 py-2 cursor-pointer transition-all hover:bg-orange-50 min-w-[160px] max-w-[200px] relative z-10 ${isRoleExpanded ? 'border-orange-500 shadow-sm' : 'border-orange-200'}`}
                                              onClick={() => {
                                                setExpandedCities(prev => {
                                                  const next = new Set(prev);
                                                  const key = `org-role-${dept.name}-${subDept.name}-${role.name}`;
                                                  if (next.has(key)) next.delete(key);
                                                  else next.add(key);
                                                  return next;
                                                });
                                              }}
                                            >
                                              <div className="flex items-center gap-2">
                                                {isRoleExpanded ? <ChevronDown className="h-3 w-3 text-orange-500" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
                                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                                  <Briefcase className="h-3 w-3 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-xs font-semibold text-gray-700 truncate" title={role.name}>{role.name}</div>
                                                </div>
                                                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold ml-1 flex-shrink-0">{designations.length}</span>
                                              </div>
                                            </div>

                                            {/* Level 4: Designations - Vertical List (Directly below Role) */}
                                            {isRoleExpanded && designations.length > 0 && (
                                              <div className="flex flex-col items-center mt-2 w-full">
                                                <div className="w-px h-2 bg-black mb-1"></div>
                                                <div className="flex flex-col gap-1 w-[95%]">
                                                  {designations.map((des: any) => (
                                                    <div key={des.name} className="bg-white px-2 py-1.5 rounded border border-gray-100 shadow-sm flex items-center justify-between gap-2">
                                                      <div className="flex items-center gap-1.5 min-w-0">
                                                        <UserCircle className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                        <span className="text-[11px] font-bold text-gray-800 truncate" title={des.name}>{des.name}</span>
                                                      </div>
                                                      <span className="text-[10px] text-gray-500 font-bold">{des.count}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Draw proper connector lines for level 1 (YGO to Departments) */}
            <div className="absolute top-[280px] left-0 w-full pointer-events-none" style={{ height: '0px' }}>
              {/* This is a hacky way to draw lines, ideally we'd use SVG. 
                  Given the request for "draw a line from Ygo to each departments", the vertical + horizontal + vertical approach is standard.
                  The current CSS-only approach with absolute positioning is tricky for dynamic widths. 
                  Let's try to improve the visual connection.
              */}
            </div>
          </div>
        </CardContent></Card>
      )}

      {/* Departments View */}
      {currentView === 'departments' && (
        <Card className="shadow-sm border">
          <CardContent className="p-0">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900">PAN India Department Wise Head Count</h3>
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {hierarchy.map((dept: any) => {
                  const isExpanded = expandedCities.has(`deptview-${dept.name}`);
                  return (
                    <tr 
                      key={`dept-${dept.name}`}
                      className="border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setExpandedCities(prev => {
                          const next = new Set(prev);
                          const key = `deptview-${dept.name}`;
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        });
                      }}
                    >
                      <td className="px-4 py-3 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                          {dept.name}
                        </div>
                        {isExpanded && (
                          <div className="mt-3 ml-6 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {(dept.children || []).map((subDept: any) => (
                              <div key={subDept.name} className="p-2 bg-gray-100 rounded text-sm">
                                <div className="font-medium text-gray-800">{subDept.name}</div>
                                <div className="text-xs text-gray-500">{subDept.count} employees</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900 w-20 align-top">{dept.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Sub-Departments View - Grouped by Department */}
      {currentView === 'subDepartments' && (
        <Card className="shadow-sm"><CardContent className="p-6">
          <div className="space-y-4">
            {hierarchy.map((dept: any) => {
              const subDepts = dept.children || [];
              const isExpanded = expandedCities.has(`dept-${dept.name}`);
              const toggleDept = () => {
                setExpandedCities(prev => {
                  const next = new Set(prev);
                  const key = `dept-${dept.name}`;
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                });
              };
              return (
                <div key={dept.name} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center gap-2 px-4 py-3 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={toggleDept}
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <h3 className="font-bold text-gray-900">{dept.name}</h3>
                    <span className="text-sm text-gray-500">({subDepts.length} sub-departments)</span>
                  </div>
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 border-t">
                      {subDepts.map((subDept: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg bg-white hover:shadow-sm">
                          <div className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-purple-500" />
                            <h4 className="font-medium text-gray-900 truncate text-sm">{subDept.name}</h4>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{subDept.count} employees</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent></Card>
      )}

      {/* Roles View - Grouped by Sub-Department */}
      {currentView === 'roles' && (
        <Card className="shadow-sm"><CardContent className="p-6">
          <div className="space-y-4">
            {hierarchy.flatMap((dept: any) => (dept.children || []).map((subDept: any) => ({ ...subDept, deptName: dept.name }))).map((subDept: any) => {
              const roles = subDept.children || [];
              const isExpanded = expandedCities.has(`subdept-${subDept.name}`);
              const toggleSubDept = () => {
                setExpandedCities(prev => {
                  const next = new Set(prev);
                  const key = `subdept-${subDept.name}`;
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                });
              };
              return (
                <div key={subDept.name} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center gap-2 px-4 py-3 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={toggleSubDept}
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                    <LayoutGrid className="h-5 w-5 text-purple-500" />
                    <h3 className="font-bold text-gray-900">{subDept.name}</h3>
                    <span className="text-sm text-gray-500">({roles.length} roles)</span>
                  </div>
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 border-t">
                      {roles.map((role: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg bg-white hover:shadow-sm">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            <h4 className="font-medium text-gray-900 truncate text-sm">{role.name}</h4>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{role.count} employees</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent></Card>
      )}

      {/* Designations View - Grouped by Role */}
      {currentView === 'designations' && (
        <Card className="shadow-sm"><CardContent className="p-6">
          <div className="space-y-4">
            {hierarchy.flatMap((dept: any) => 
              (dept.children || []).flatMap((subDept: any) => 
                (subDept.children || []).map((role: any) => ({ ...role, subDeptName: subDept.name }))
              )
            ).map((role: any) => {
              const designations = role.children || [];
              const isExpanded = expandedCities.has(`role-${role.name}`);
              const toggleRole = () => {
                setExpandedCities(prev => {
                  const next = new Set(prev);
                  const key = `role-${role.name}`;
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                });
              };
              return (
                <div key={role.name} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center gap-2 px-4 py-3 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={toggleRole}
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                    <Briefcase className="h-5 w-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                    <span className="text-sm text-gray-500">({designations.length} designations)</span>
                  </div>
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 border-t">
                      {designations.map((des: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg bg-white hover:shadow-sm">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-orange-500" />
                            <h4 className="font-medium text-gray-900 truncate text-sm">{des.name}</h4>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{des.count} employees</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent></Card>
      )}

      {/* PAN India Department Table - Always visible below expanded content */}
      {currentView !== 'overview' && currentView !== 'departments' && hierarchy.length > 0 && (
        <Card className="shadow-sm border mt-4">
          <CardContent className="p-0">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900">PAN India Department Wise Head Count</h3>
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {hierarchy.map((dept: any) => (
                  <tr 
                    key={`pan-dept-${dept.name}`}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        {dept.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900 w-20">{dept.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}