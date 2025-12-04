import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingDown, TrendingUp, Users, UserMinus, Download, BarChart3 } from "lucide-react";

export default function AttritionAnalysis() {
  const [periodFilter, setPeriodFilter] = useState("monthly");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Mock data - replace with actual API call
  const { data: attritionData } = useQuery({
    queryKey: ["/api/management/attrition", periodFilter, departmentFilter],
    queryFn: async () => {
      // This will be replaced with actual API call
      return {
        overall: {
          rate: 12.5,
          trend: "up",
          total_exits: 45,
          total_employees: 360,
        },
        byDepartment: [
          { name: "Sales", rate: 18.2, exits: 15, employees: 82 },
          { name: "Operations", rate: 10.5, exits: 12, employees: 114 },
          { name: "Support", rate: 8.3, exits: 8, employees: 96 },
          { name: "Management", rate: 5.0, exits: 10, employees: 68 },
        ],
        byReason: [
          { reason: "Better Opportunity", count: 18, percentage: 40 },
          { reason: "Relocation", count: 10, percentage: 22 },
          { reason: "Personal Reasons", count: 8, percentage: 18 },
          { reason: "Performance", count: 5, percentage: 11 },
          { reason: "Other", count: 4, percentage: 9 },
        ],
      };
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Attrition Analysis</h2>
            <p className="text-slate-600 mt-1">Analyze employee turnover patterns and trends</p>
          </div>
          <Button variant="outline" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Analysis Filters</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Overall Attrition Rate</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {attritionData?.overall.rate || 0}%
                </p>
                <div className="flex items-center mt-2">
                  {attritionData?.overall.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <span className={`text-sm ${attritionData?.overall.trend === "up" ? "text-red-600" : "text-green-600"}`}>
                    vs last period
                  </span>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <BarChart3 className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Exits</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {attritionData?.overall.total_exits || 0}
                </p>
                <p className="text-slate-400 text-sm mt-2">This period</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <UserMinus className="text-orange-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {attritionData?.overall.total_employees || 0}
                </p>
                <p className="text-slate-400 text-sm mt-2">Active count</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Retention Rate</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {100 - (attritionData?.overall.rate || 0)}%
                </p>
                <p className="text-slate-400 text-sm mt-2">Current period</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Attrition */}
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Attrition by Department</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {attritionData?.byDepartment.map((dept: any) => (
              <div key={dept.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{dept.name}</h4>
                  <p className="text-sm text-slate-600">
                    {dept.exits} exits out of {dept.employees} employees
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-slate-200 rounded-full h-2 relative overflow-hidden">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-500 absolute top-0 left-0"
                      data-width={dept.rate}
                      style={{ width: `${Math.min(dept.rate, 100)}%` } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-lg font-bold text-slate-800 w-16 text-right">
                    {dept.rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exit Reasons */}
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Top Exit Reasons</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {attritionData?.byReason.map((reason: any, index: number) => (
              <div key={reason.reason} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-800">{reason.reason}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">{reason.count} exits</span>
                  <span className="font-semibold text-blue-600 w-16 text-right">
                    {reason.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
