import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  RefreshCw,
  Loader2,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react";

// Helper to calculate date range based on filters
const getDateRange = (viewType: string, selectedYear: string, selectedQuarter: string, selectedMonthRange: string) => {
  const currentDate = new Date();
  let startDate: Date;
  let endDate: Date;

  if (viewType === "months") {
    const numMonths = selectedMonthRange === "Last 3 Months" ? 3 :
                     selectedMonthRange === "Last 6 Months" ? 6 :
                     selectedMonthRange === "Last 9 Months" ? 9 : 12;
    
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - numMonths + 1, 1);
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  } else if (viewType === "quarter") {
    const quarterStartMonth: Record<string, number> = { "Q1": 0, "Q2": 3, "Q3": 6, "Q4": 9 };
    const startMonth = quarterStartMonth[selectedQuarter];
    startDate = new Date(parseInt(selectedYear), startMonth, 1);
    endDate = new Date(parseInt(selectedYear), startMonth + 3, 0);
  } else {
    // Year view
    startDate = new Date(parseInt(selectedYear), 0, 1);
    endDate = new Date(parseInt(selectedYear), 11, 31);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export default function ExitManagement() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState("months");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedMonthRange, setSelectedMonthRange] = useState("Last 3 Months");
  
  // Exit Process tab state
  const [exitStatusFilter, setExitStatusFilter] = useState("under_review");
  const [businessUnitFilter, setBusinessUnitFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [costCenterFilter, setCostCenterFilter] = useState("all");
  const [legalEntityFilter, setLegalEntityFilter] = useState("all");
  const [exitTypeFilter, setExitTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Exit Details Dialog state
  const [selectedExit, setSelectedExit] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Calculate date range based on filters
  const dateRange = useMemo(() => 
    getDateRange(viewType, selectedYear, selectedQuarter, selectedMonthRange),
    [viewType, selectedYear, selectedQuarter, selectedMonthRange]
  );

  // Fetch exit summary data from API
  const { data: exitSummaryResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['exit-summary', dateRange.startDate, dateRange.endDate, viewType],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        viewType
      });
      return await apiRequest(`/api/employees/exit-summary?${params}`, { method: 'GET' });
    }
  });

  // Fetch exit process list
  const { data: exitProcessResponse, isLoading: isLoadingProcess } = useQuery({
    queryKey: ['exit-process-list', exitStatusFilter, exitTypeFilter, departmentFilter, locationFilter, businessUnitFilter, costCenterFilter, legalEntityFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (exitStatusFilter !== 'all') params.append('status', exitStatusFilter);
      if (exitTypeFilter !== 'all') params.append('exitType', exitTypeFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (locationFilter !== 'all') params.append('location', locationFilter);
      if (businessUnitFilter !== 'all') params.append('businessUnit', businessUnitFilter);
      if (costCenterFilter !== 'all') params.append('costCenter', costCenterFilter);
      if (legalEntityFilter !== 'all') params.append('legalEntity', legalEntityFilter);
      if (searchQuery) params.append('search', searchQuery);
      return await apiRequest(`/api/employees/exit-process-list?${params}`, { method: 'GET' });
    }
  });

  const exitProcessList = exitProcessResponse?.data || [];
  const exitCounts = exitProcessResponse?.counts || { underReview: 0, inProgress: 0, exited: 0 };

  // Review exit mutation (initiated -> in_progress)
  const reviewExitMutation = useMutation({
    mutationFn: async (exitId: number) => {
      return await apiRequest(`/api/employees/exit/${exitId}/review`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-process-list'] });
      toast({
        title: "Exit Reviewed",
        description: "The exit request has been marked as reviewed and is now in progress.",
      });
      setIsDetailsDialogOpen(false);
      setSelectedExit(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review exit",
        variant: "destructive",
      });
    }
  });

  // Complete exit mutation (in_progress -> completed)
  const completeExitMutation = useMutation({
    mutationFn: async (exitId: number) => {
      return await apiRequest(`/api/employees/exit/${exitId}/complete`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-process-list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Exit Completed",
        description: "The exit has been approved and completed. Employee status updated to relieved.",
      });
      setIsDetailsDialogOpen(false);
      setSelectedExit(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete exit",
        variant: "destructive",
      });
    }
  });

  // Handle view details click
  const handleViewDetails = (exit: any) => {
    setSelectedExit(exit);
    setIsDetailsDialogOpen(true);
  };

  // Handle review exit (initiated -> in_progress)
  const handleReviewExit = () => {
    if (selectedExit) {
      reviewExitMutation.mutate(selectedExit.id);
    }
  };

  // Handle complete exit (in_progress -> completed)
  const handleCompleteExit = () => {
    if (selectedExit) {
      completeExitMutation.mutate(selectedExit.id);
    }
  };

  // Helper functions for row selection
  const handleSelectAll = () => {
    if (selectedRows.length === exitProcessList.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(exitProcessList.map((exit: any) => exit.id));
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const isAllSelected = exitProcessList.length > 0 && selectedRows.length === exitProcessList.length;

  // Helper to format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper to get exit type display
  const getExitTypeDisplay = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      voluntary: { label: 'Resignation', color: 'bg-blue-100 text-blue-700' },
      involuntary: { label: 'Termination', color: 'bg-red-100 text-red-700' },
      absconding: { label: 'Absconding', color: 'bg-orange-100 text-orange-700' }
    };
    return types[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  };

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: any }> = {
      initiated: { label: 'Needs to approve', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      completed: { label: 'Exited', color: 'bg-green-100 text-green-700', icon: CheckCircle }
    };
    return statuses[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
  };

  // Extract chart data from API response
  const chartData = exitSummaryResponse?.data || [];
  const apiTotals = exitSummaryResponse?.totals || { voluntary: 0, involuntary: 0, absconding: 0, total: 0 };
  
  // Calculate max value for chart scaling - use TOTAL per month
  const maxValue = Math.max(
    ...chartData.map((d: any) => d.voluntary + d.involuntary + d.absconding),
    1
  );

  // Use totals from API
  const totalVoluntary = apiTotals.voluntary;
  const totalInvoluntary = apiTotals.involuntary;
  const totalAbsconding = apiTotals.absconding;
  const grandTotal = apiTotals.total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800">Exit Management</h2>
        <p className="text-slate-600 mt-1">Comprehensive exit tracking and analytics</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="summary" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            Summary
          </TabsTrigger>
          <TabsTrigger value="exit-process" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            Exit Process
          </TabsTrigger>
          <TabsTrigger value="reverted-exits" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            Reverted Exits
          </TabsTrigger>
          <TabsTrigger value="bulk-actions" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            Bulk Actions
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">

          {/* Exit Type Analytics */}
          <Card className="shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Voluntary vs Involuntary vs Absconding
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* View Type Selector */}
                  <Select value={viewType} onValueChange={setViewType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Conditional Filters */}
                  {viewType === "months" && (
                    <Select value={selectedMonthRange} onValueChange={setSelectedMonthRange}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                        <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                        <SelectItem value="Last 9 Months">Last 9 Months</SelectItem>
                        <SelectItem value="Last 12 Months">Last 12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {viewType === "quarter" && (
                    <>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1">Q1</SelectItem>
                          <SelectItem value="Q2">Q2</SelectItem>
                          <SelectItem value="Q3">Q3</SelectItem>
                          <SelectItem value="Q4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  {viewType === "year" && (
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center h-80">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-500">Loading exit data...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="flex items-center justify-center h-80">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="text-red-500 text-lg font-medium">Failed to load data</div>
                    <p className="text-sm text-slate-500">Please try again later</p>
                    <button 
                      onClick={() => refetch()}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && chartData.length === 0 && (
                <div className="flex items-center justify-center h-80">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <BarChart3 className="h-12 w-12 text-slate-300" />
                    <div className="text-slate-500 text-lg font-medium">No exit data available</div>
                    <p className="text-sm text-slate-400">No exits recorded for the selected period</p>
                  </div>
                </div>
              )}

              {/* Chart - only show when data is available */}
              {!isLoading && !error && chartData.length > 0 && (
              <div className="space-y-8">
                {/* Chart Area */}
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 flex flex-col justify-between text-xs text-slate-400" style={{ height: '280px' }}>
                    <span>{maxValue}</span>
                    <span>{Math.floor(maxValue * 0.75)}</span>
                    <span>{Math.floor(maxValue * 0.5)}</span>
                    <span>{Math.floor(maxValue * 0.25)}</span>
                    <span>0</span>
                  </div>

                  {/* Chart */}
                  <div className="ml-12">
                    <div 
                      className="flex items-end justify-around"
                      style={{ 
                        height: '280px',
                        gap: chartData.length > 6 ? '1rem' : chartData.length > 3 ? '2rem' : '3rem' 
                      } as React.CSSProperties}
                    >
                      {chartData.map((data: any, index: number) => {
                        const total = data.voluntary + data.involuntary + data.absconding;
                        const voluntaryPercent = (data.voluntary / total) * 100;
                        const involuntaryPercent = (data.involuntary / total) * 100;
                        const abscondingPercent = (data.absconding / total) * 100;
                        const barHeight = (total / maxValue) * 100;
                        
                        return (
                          <div key={index} className="flex flex-col items-center h-full justify-end">
                            {/* Total Label on Top */}
                            <div className="mb-1 text-center">
                              <span className="text-sm font-bold text-slate-700">{total}</span>
                            </div>
                            
                            {/* Single Stacked Bar */}
                            <div 
                              className="flex flex-col-reverse relative cursor-pointer overflow-hidden"
                              style={{ 
                                height: `${barHeight}%`,
                                minHeight: '20px',
                                width: chartData.length > 9 ? '52px' : chartData.length > 6 ? '60px' : '72px'
                              } as React.CSSProperties}
                            >
                              {/* Voluntary Section (Bottom - Blue) */}
                              <div
                                className="w-full relative flex items-center justify-center"
                                style={{ 
                                  height: `${voluntaryPercent}%`,
                                  backgroundColor: '#5B9BD5'
                                } as React.CSSProperties}
                                title={`Voluntary: ${data.voluntary}`}
                              >
                                {voluntaryPercent > 15 && (
                                  <span className="text-white font-semibold text-xs">
                                    {data.voluntary}
                                  </span>
                                )}
                              </div>
                              
                              {/* Involuntary Section (Middle - Red) */}
                              <div
                                className="w-full relative flex items-center justify-center"
                                style={{ 
                                  height: `${involuntaryPercent}%`,
                                  backgroundColor: '#E57373'
                                } as React.CSSProperties}
                                title={`Involuntary: ${data.involuntary}`}
                              >
                                {involuntaryPercent > 15 && (
                                  <span className="text-white font-semibold text-xs">
                                    {data.involuntary}
                                  </span>
                                )}
                              </div>
                              
                              {/* Absconding Section (Top - Orange) */}
                              <div
                                className="w-full relative flex items-center justify-center"
                                style={{ 
                                  height: `${abscondingPercent}%`,
                                  backgroundColor: '#F5A623'
                                } as React.CSSProperties}
                                title={`Absconding: ${data.absconding}`}
                              >
                                {abscondingPercent > 15 && (
                                  <span className="text-white font-semibold text-xs">
                                    {data.absconding}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* X-axis Labels - Below the chart */}
                    <div 
                      className="flex items-center justify-around mt-3 border-t border-slate-200 pt-3"
                      style={{ 
                        gap: chartData.length > 6 ? '1rem' : chartData.length > 3 ? '2rem' : '3rem' 
                      } as React.CSSProperties}
                    >
                      {chartData.map((data: any, index: number) => (
                        <div 
                          key={index} 
                          className="text-xs font-medium text-slate-600 text-center"
                          style={{ 
                            width: chartData.length > 9 ? '52px' : chartData.length > 6 ? '60px' : '72px' 
                          } as React.CSSProperties}
                        >
                          {data.period}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: '#5B9BD5' }}></div>
                    <span className="text-sm text-slate-600">Voluntary</span>
                    <span className="text-sm font-semibold text-slate-700">({totalVoluntary})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: '#E57373' }}></div>
                    <span className="text-sm text-slate-600">Involuntary</span>
                    <span className="text-sm font-semibold text-slate-700">({totalInvoluntary})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: '#F5A623' }}></div>
                    <span className="text-sm text-slate-600">Absconding</span>
                    <span className="text-sm font-semibold text-slate-700">({totalAbsconding})</span>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="pt-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-slate-600" />
                      <span className="font-semibold text-slate-800">Total Exits</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-slate-800">
                        {grandTotal}
                      </span>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exit Process Tab */}
        <TabsContent value="exit-process">
          <Card className="shadow-md">
            {/* Status Tabs */}
            <div className="border-b border-slate-200 px-6 py-3">
              <div className="flex items-end gap-12">
                <button 
                  onClick={() => setExitStatusFilter('under_review')}
                  className={`flex flex-col pb-3 border-b-2 transition-colors min-w-0 ${
                    exitStatusFilter === 'under_review' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-sm">Under review ({exitCounts.underReview})</span>
                  <span className="text-xs text-slate-400 mt-0.5">Resignations & Terminations</span>
                </button>
                <button 
                  onClick={() => setExitStatusFilter('in_progress')}
                  className={`flex flex-col pb-3 border-b-2 transition-colors min-w-0 ${
                    exitStatusFilter === 'in_progress' 
                      ? 'border-green-600 text-green-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-sm">Exits in progress ({exitCounts.inProgress})</span>
                  <span className="text-xs text-slate-400 mt-0.5">Exit request approved</span>
                </button>
                <button 
                  onClick={() => setExitStatusFilter('exited')}
                  className={`flex flex-col pb-3 border-b-2 transition-colors min-w-0 ${
                    exitStatusFilter === 'exited' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-sm">Exited employees ({exitCounts.exited})</span>
                  <span className="text-xs text-slate-400 mt-0.5">Last working day passed</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-2 flex-wrap">
              {/* Business Unit Filter */}
              <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                <SelectTrigger className="w-[120px] h-9 bg-white border-slate-200 text-sm">
                  <SelectValue>
                    {businessUnitFilter === 'all' ? 'Business...' : businessUnitFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Business Units</SelectItem>
                  <SelectItem value="BU1">Business Unit 1</SelectItem>
                  <SelectItem value="BU2">Business Unit 2</SelectItem>
                  <SelectItem value="BU3">Business Unit 3</SelectItem>
                </SelectContent>
              </Select>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[120px] h-9 bg-white border-slate-200 text-sm">
                  <SelectValue>
                    {departmentFilter === 'all' ? 'Department' : departmentFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[120px] h-9 bg-white border-slate-200 text-sm">
                  <SelectValue>
                    {locationFilter === 'all' ? 'Location' : locationFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                </SelectContent>
              </Select>

              {/* Cost Center Filter */}
              <Select value={costCenterFilter} onValueChange={setCostCenterFilter}>
                <SelectTrigger className="w-[120px] h-9 bg-white border-slate-200 text-sm">
                  <SelectValue>
                    {costCenterFilter === 'all' ? 'Cost Center' : costCenterFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cost Centers</SelectItem>
                  <SelectItem value="CC001">CC001</SelectItem>
                  <SelectItem value="CC002">CC002</SelectItem>
                  <SelectItem value="CC003">CC003</SelectItem>
                </SelectContent>
              </Select>

              {/* Legal Entity Filter */}
              <Select value={legalEntityFilter} onValueChange={setLegalEntityFilter}>
                <SelectTrigger className="w-[120px] h-9 bg-white border-slate-200 text-sm">
                  <SelectValue>
                    {legalEntityFilter === 'all' ? 'Legal Entity' : legalEntityFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Legal Entities</SelectItem>
                  <SelectItem value="Entity1">Entity 1</SelectItem>
                  <SelectItem value="Entity2">Entity 2</SelectItem>
                  <SelectItem value="Entity3">Entity 3</SelectItem>
                </SelectContent>
              </Select>

              {/* Exit Type Filter */}
              <Select value={exitTypeFilter} onValueChange={setExitTypeFilter}>
                <SelectTrigger className="w-[100px] h-9 bg-white border-slate-200 text-sm">
                  <SelectValue>
                    {exitTypeFilter === 'all' ? 'Exit Type' : 
                      exitTypeFilter === 'voluntary' ? 'Resignation' :
                      exitTypeFilter === 'involuntary' ? 'Termination' : 'Absconding'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="voluntary">Resignation</SelectItem>
                  <SelectItem value="involuntary">Termination</SelectItem>
                  <SelectItem value="absconding">Absconding</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1" />
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search" 
                  className="pl-10 w-40 h-9 bg-white text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Select All & Send Reminder Row */}
            <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-slate-700">Select all</span>
              </label>
              
              {selectedRows.length > 0 && (
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  Send reminder
                </Button>
              )}
              
              <div className="flex-1" />
              
              <span className="text-sm text-slate-500">
                {exitProcessList.length} of {exitProcessList.length} records
              </span>
            </div>

            {/* Table */}
            <CardContent className="p-0">
              {isLoadingProcess ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : exitProcessList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Users className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-lg font-medium">No exit records found</p>
                  <p className="text-sm text-slate-400">No employees match the current filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="w-12 px-4 py-3"></th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exit Type</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notice Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason & Comment</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Working Day</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {exitProcessList.map((exit: any) => {
                        const exitType = getExitTypeDisplay(exit.exitType);
                        const status = getStatusBadge(exit.exitStatus);
                        const StatusIcon = status.icon;
                        const isSelected = selectedRows.includes(exit.id);
                        
                        return (
                          <tr key={exit.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-purple-50' : ''}`}>
                            <td className="px-4 py-4">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => handleSelectRow(exit.id)}
                                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                                  {exit.employeeName?.substring(0, 2)?.toUpperCase() || 'EM'}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">{exit.employeeName || 'Unknown'}</p>
                                  <p className="text-sm text-slate-500">{exit.designation || '-'}</p>
                                  <p className="text-xs text-slate-400">{exit.departmentName || '-'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`${exitType.color} font-medium`}>
                                {exitType.label}
                              </Badge>
                              <p className="text-xs text-slate-400 mt-1">Requested by HR</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-slate-700">{formatDate(exit.noticeDate)}</p>
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                              <p className="text-slate-700 truncate">{exit.exitReason || '-'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-slate-700">{formatDate(exit.lastWorkingDay)}</p>
                              <p className="text-xs text-slate-400">
                                {exit.exitStatus === 'completed' ? 'Exited' : 'To be Relieved'}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-4 w-4" />
                                <span className={`text-sm ${status.color} px-2 py-1 rounded`}>
                                  {status.label}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1"
                                onClick={() => handleViewDetails(exit)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {exitProcessList.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {exitProcessList.length} of {exitProcessList.length} records
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reverted Exits Tab */}
        <TabsContent value="reverted-exits">
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 text-lg">Reverted Exits will be displayed here</p>
              <p className="text-slate-400 mt-2">Track exits that were cancelled or reversed</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Actions Tab */}
        <TabsContent value="bulk-actions">
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 text-lg">Bulk Actions will be available here</p>
              <p className="text-slate-400 mt-2">Process multiple exits simultaneously</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Exit Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Exit Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedExit && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedExit.employeeName?.substring(0, 2)?.toUpperCase() || 'EM'}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{selectedExit.employeeName}</h3>
                  <p className="text-sm text-slate-500">{selectedExit.designation} • {selectedExit.departmentName}</p>
                  <p className="text-xs text-slate-400">Employee ID: {selectedExit.employeeId}</p>
                </div>
                <div className="ml-auto">
                  <Badge className={
                    selectedExit.exitStatus === 'initiated' ? 'bg-yellow-100 text-yellow-800' :
                    selectedExit.exitStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    selectedExit.exitStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedExit.exitStatus === 'initiated' ? 'Pending Approval' :
                     selectedExit.exitStatus === 'in_progress' ? 'In Progress' :
                     selectedExit.exitStatus === 'completed' ? 'Completed' : selectedExit.exitStatus}
                  </Badge>
                </div>
              </div>

              {/* Exit Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Exit Type</p>
                  <p className="font-medium text-slate-700">
                    {selectedExit.exitType === 'voluntary' ? 'Resignation' :
                     selectedExit.exitType === 'involuntary' ? 'Termination' : 
                     selectedExit.exitType === 'absconding' ? 'Absconding' : selectedExit.exitType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Exit Initiated Date</p>
                  <p className="font-medium text-slate-700">{formatDate(selectedExit.exitInitiatedDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Notice Date</p>
                  <p className="font-medium text-slate-700">{formatDate(selectedExit.noticeDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Last Working Day</p>
                  <p className="font-medium text-slate-700">{formatDate(selectedExit.lastWorkingDay)}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Reason for Exit</p>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedExit.exitReason || 'No reason provided'}</p>
              </div>

              {/* Discussion Details */}
              {selectedExit.discussionWithEmployee && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Discussion with Employee</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedExit.discussionWithEmployee}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Okay to Rehire</p>
                  <p className="font-medium text-slate-700">{selectedExit.okayToRehire || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Initiated By</p>
                  <p className="font-medium text-slate-700">{selectedExit.initiatedBy || 'HR'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {/* Under Review: Show "Reviewed" button to move to in_progress */}
            {selectedExit?.exitStatus === 'initiated' && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleReviewExit}
                disabled={reviewExitMutation.isPending}
              >
                {reviewExitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Reviewed
                  </>
                )}
              </Button>
            )}
            {/* In Progress: Show "Approve" button to complete the exit */}
            {selectedExit?.exitStatus === 'in_progress' && (
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleCompleteExit}
                disabled={completeExitMutation.isPending}
              >
                {completeExitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Complete Exit
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
