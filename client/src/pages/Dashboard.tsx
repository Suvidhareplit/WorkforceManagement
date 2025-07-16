import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Users, Clock, TrendingUp, ArrowUp } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: hiringRequestsData, isLoading: loadingHiring } = useQuery({
    queryKey: ["/api/analytics/hiring"],
  });

  // Calculate metrics from hiring requests data (data is now in camelCase from API)
  const openPositions = hiringRequestsData && Array.isArray(hiringRequestsData) 
    ? hiringRequestsData.filter((req: any) => req.status === 'open')
        .reduce((sum: number, req: any) => sum + (parseInt(req.numberOfPositions) || 0), 0)
    : 0;
  
  const totalRequests = hiringRequestsData?.length || 0;
  const closedPositions = hiringRequestsData && Array.isArray(hiringRequestsData)
    ? hiringRequestsData.filter((req: any) => req.status === 'closed')
        .reduce((sum: number, req: any) => sum + (parseInt(req.numberOfPositions) || 0), 0)
    : 0;

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Hiring Dashboard</h2>
            <p className="text-slate-600 mt-1">Manage your recruitment pipeline and track hiring progress</p>
          </div>
          <Link href="/hiring/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Open Positions</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : openPositions}
                </p>
                <p className="text-slate-400 text-sm mt-1">Active positions</p>
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
                <p className="text-slate-600 text-sm font-medium">Closed Positions</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : closedPositions}
                </p>
                <p className="text-slate-400 text-sm mt-1">Completed positions</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Candidates</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">--</p>
                <p className="text-slate-400 text-sm mt-1">In pipeline</p>
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
                <p className="text-2xl font-bold text-slate-800 mt-1">--</p>
                <p className="text-slate-400 text-sm mt-1">No data available</p>
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
                <p className="text-2xl font-bold text-slate-800 mt-1">--</p>
                <p className="text-slate-400 text-sm mt-1">No data available</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <ArrowUp className="text-purple-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
