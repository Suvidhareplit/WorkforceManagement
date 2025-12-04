import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  FileSpreadsheet,
  Filter
} from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [format, setFormat] = useState("pdf");

  const reportCategories = [
    {
      title: "Hiring Reports",
      icon: Users,
      color: "blue",
      reports: [
        { id: "hiring-summary", name: "Hiring Summary Report", description: "Overview of all hiring activities" },
        { id: "open-positions", name: "Open Positions Report", description: "Current open positions by role and location" },
        { id: "time-to-hire", name: "Time to Hire Analysis", description: "Average time taken to fill positions" },
        { id: "candidate-pipeline", name: "Candidate Pipeline Report", description: "Status of candidates in the hiring process" },
      ],
    },
    {
      title: "Interview Reports",
      icon: ClipboardCheck,
      color: "purple",
      reports: [
        { id: "interview-feedback", name: "Interview Feedback Report", description: "Consolidated feedback from interviews" },
        { id: "prescreening-stats", name: "Prescreening Statistics", description: "Prescreening pass/fail rates" },
        { id: "technical-rounds", name: "Technical Round Analysis", description: "Technical interview performance metrics" },
        { id: "offer-acceptance", name: "Offer Acceptance Rate", description: "Acceptance vs rejection statistics" },
      ],
    },
    {
      title: "Training Reports",
      icon: GraduationCap,
      color: "green",
      reports: [
        { id: "training-completion", name: "Training Completion Report", description: "Status of ongoing training programs" },
        { id: "trainer-performance", name: "Trainer Performance Report", description: "Trainer feedback and ratings" },
        { id: "onboarding-stats", name: "Onboarding Statistics", description: "New hire onboarding progress" },
        { id: "certification-tracking", name: "Certification Tracking", description: "Employee certifications and renewals" },
      ],
    },
    {
      title: "Attrition & Exit Reports",
      icon: TrendingUp,
      color: "red",
      reports: [
        { id: "attrition-analysis", name: "Attrition Analysis Report", description: "Turnover rates and trends" },
        { id: "exit-interviews", name: "Exit Interview Summary", description: "Insights from exit interviews" },
        { id: "retention-metrics", name: "Retention Metrics", description: "Employee retention statistics" },
        { id: "department-attrition", name: "Department-wise Attrition", description: "Attrition breakdown by department" },
      ],
    },
    {
      title: "Analytics & Metrics",
      icon: BarChart3,
      color: "orange",
      reports: [
        { id: "headcount-report", name: "Headcount Report", description: "Current employee headcount analytics" },
        { id: "cost-analysis", name: "Hiring Cost Analysis", description: "Cost per hire and budget utilization" },
        { id: "diversity-report", name: "Diversity & Inclusion Report", description: "Workforce diversity metrics" },
        { id: "performance-trends", name: "Performance Trends", description: "Historical performance data" },
      ],
    },
  ];

  const handleGenerateReport = () => {
    console.log("Generating report:", { reportType, dateRange, format });
    // API call to generate report would go here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Reports</h2>
            <p className="text-slate-600 mt-1">Generate and download comprehensive reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportCategories.map((category) =>
                    category.reports.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleGenerateReport} 
            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md"
            disabled={!reportType}
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="space-y-6">
        {reportCategories.map((category) => {
          const IconComponent = category.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            green: "bg-green-100 text-green-600",
            red: "bg-red-100 text-red-600",
            orange: "bg-orange-100 text-orange-600",
          };

          return (
            <Card key={category.title} className="shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <div className={`p-2 rounded-lg mr-3 ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => setReportType(report.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {report.name}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                        </div>
                        <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full group-hover:bg-blue-50 group-hover:border-blue-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportType(report.id);
                          }}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Select Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
