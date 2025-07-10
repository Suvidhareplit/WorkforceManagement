import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowUp, 
  ArrowDown,
  BarChart3,
  PieChart,
  Download,
  Filter
} from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [cityFilter, setCityFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: hiringAnalytics, isLoading: loadingHiring } = useQuery({
    queryKey: ["/api/analytics/hiring", { dateRange, cityFilter, roleFilter }],
  });

  const { data: pipeline, isLoading: loadingPipeline } = useQuery({
    queryKey: ["/api/analytics/pipeline"],
  });

  const { data: vendorPerformance, isLoading: loadingVendors } = useQuery({
    queryKey: ["/api/analytics/vendors"],
  });

  const { data: recruiterPerformance, isLoading: loadingRecruiters } = useQuery({
    queryKey: ["/api/analytics/recruiters"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/master-data/cities"],
  });

  const { data: roles } = useQuery({
    queryKey: ["/api/master-data/roles"],
  });

  const { data: vendors } = useQuery({
    queryKey: ["/api/master-data/vendors"],
  });

  const { data: recruiters } = useQuery({
    queryKey: ["/api/master-data/recruiters"],
  });

  // Mock data for demonstration - in real app this would come from API
  const timeToHireData = [
    { period: "This Week", days: 18, trend: "down", change: -2 },
    { period: "Last Week", days: 20, trend: "up", change: 1 },
    { period: "This Month", days: 19, trend: "down", change: -1 },
    { period: "Last Month", days: 20, trend: "up", change: 3 },
  ];

  const conversionRates = {
    applicationToScreening: 65,
    screeningToTechnical: 45,
    technicalToSelected: 30,
    selectedToJoined: 85,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Analytics & Reports</h2>
            <p className="text-slate-600 mt-1">Comprehensive insights into hiring performance and trends</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">City</label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {cities?.map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {roles?.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hiring">Hiring Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Performance</TabsTrigger>
          <TabsTrigger value="recruiters">Recruiter Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Open Positions</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {loadingHiring ? "..." : hiringAnalytics?.openPositions || 247}
                    </p>
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Briefcase className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Active Candidates</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {loadingPipeline ? "..." : 
                        (pipeline?.applications + pipeline?.prescreening + pipeline?.technical) || 1532}
                    </p>
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +8% from last week
                    </p>
                  </div>
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <Users className="text-cyan-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Avg. Time to Hire</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">18 days</p>
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      -2 days from target
                    </p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Clock className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">84%</p>
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +3% from last quarter
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Hiring Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-slate-500">Hiring trends chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Source Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-slate-500">Source distribution chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Application to Screening</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${conversionRates.applicationToScreening}%` }}></div>
                    </div>
                    <span className="text-sm font-bold">{conversionRates.applicationToScreening}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Screening to Technical</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${conversionRates.screeningToTechnical}%` }}></div>
                    </div>
                    <span className="text-sm font-bold">{conversionRates.screeningToTechnical}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Technical to Selected</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${conversionRates.technicalToSelected}%` }}></div>
                    </div>
                    <span className="text-sm font-bold">{conversionRates.technicalToSelected}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Selected to Joined</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${conversionRates.selectedToJoined}%` }}></div>
                    </div>
                    <span className="text-sm font-bold">{conversionRates.selectedToJoined}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring">
          <div className="space-y-6">
            {/* Time to Hire Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Time to Hire Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {timeToHireData.map((item, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="text-sm text-slate-600">{item.period}</div>
                      <div className="text-2xl font-bold text-slate-800 mt-1">{item.days} days</div>
                      <div className={`text-sm mt-1 flex items-center ${
                        item.trend === 'up' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.trend === 'up' ? (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(item.change)} days
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hiring by City/Role */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring by City</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mumbai</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                        <span className="text-sm font-bold">185</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Delhi</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                        <span className="text-sm font-bold">148</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bangalore</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                        <span className="text-sm font-bold">112</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Chennai</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                        </div>
                        <span className="text-sm font-bold">74</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hiring by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Field Technician</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                        </div>
                        <span className="text-sm font-bold">156</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Delivery Executive</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <span className="text-sm font-bold">127</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security Guard</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                        </div>
                        <span className="text-sm font-bold">98</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maintenance Worker</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                        </div>
                        <span className="text-sm font-bold">68</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Pipeline Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pipeline && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="bg-blue-100 p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold text-blue-600">{pipeline.applications}</div>
                      </div>
                      <div className="text-sm font-medium">Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-cyan-100 p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold text-cyan-600">{pipeline.prescreening}</div>
                      </div>
                      <div className="text-sm font-medium">Prescreening</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-amber-100 p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold text-amber-600">{pipeline.technical}</div>
                      </div>
                      <div className="text-sm font-medium">Technical</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold text-green-600">{pipeline.selected}</div>
                      </div>
                      <div className="text-sm font-medium">Selected</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold text-purple-600">{pipeline.onboarding}</div>
                      </div>
                      <div className="text-sm font-medium">Onboarding</div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Pipeline Trends (Last 30 Days)</h4>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500">Pipeline trends chart would be displayed here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Candidates Sourced</TableHead>
                    <TableHead>Interviewed</TableHead>
                    <TableHead>Selected</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg. Time to Fill</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingVendors ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading vendor performance data...
                      </TableCell>
                    </TableRow>
                  ) : vendors?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No vendor performance data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendors?.slice(0, 5).map((vendor: any) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>45</TableCell>
                        <TableCell>32</TableCell>
                        <TableCell>18</TableCell>
                        <TableCell>16</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            35.6%
                          </Badge>
                        </TableCell>
                        <TableCell>22 days</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Excellent
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters">
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recruiter Name</TableHead>
                    <TableHead>Candidates Sourced</TableHead>
                    <TableHead>Interviewed</TableHead>
                    <TableHead>Selected</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Incentive Earned</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRecruiters ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading recruiter performance data...
                      </TableCell>
                    </TableRow>
                  ) : recruiters?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No recruiter performance data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    recruiters?.slice(0, 5).map((recruiter: any) => (
                      <TableRow key={recruiter.id}>
                        <TableCell className="font-medium">{recruiter.name}</TableCell>
                        <TableCell>28</TableCell>
                        <TableCell>21</TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>11</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            39.3%
                          </Badge>
                        </TableCell>
                        <TableCell>₹15,400</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Good
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
