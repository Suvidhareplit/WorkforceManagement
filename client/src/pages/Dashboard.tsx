import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Users, Clock, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: hiringAnalytics, isLoading: loadingHiring } = useQuery({
    queryKey: ["/api/analytics/hiring"],
  });

  const { data: pipeline, isLoading: loadingPipeline } = useQuery({
    queryKey: ["/api/analytics/pipeline"],
  });

  const { data: hiringRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/hiring"],
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Open Positions</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingHiring ? "..." : hiringAnalytics?.openPositions || 0}
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
                <p className="text-slate-600 text-sm font-medium">Active Candidates</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {loadingPipeline ? "..." : 
                    (pipeline?.applications + pipeline?.prescreening + pipeline?.technical) || 0}
                </p>
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
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/hiring/create">
              <Button
                variant="outline"
                className="h-24 w-full flex flex-col items-center justify-center space-y-2 border-dashed hover:border-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-6 w-6 text-slate-400" />
                <div className="text-center">
                  <p className="font-medium">Create Hiring Request</p>
                  <p className="text-sm text-slate-600">Start new recruitment process</p>
                </div>
              </Button>
            </Link>

            <Link href="/interviews/applications">
              <Button
                variant="outline"
                className="h-24 w-full flex flex-col items-center justify-center space-y-2 border-dashed hover:border-blue-600 hover:bg-blue-50"
              >
                <Users className="h-6 w-6 text-slate-400" />
                <div className="text-center">
                  <p className="font-medium">Add New Candidate</p>
                  <p className="text-sm text-slate-600">Register candidate application</p>
                </div>
              </Button>
            </Link>

            <Link href="/interviews/technical">
              <Button
                variant="outline"
                className="h-24 w-full flex flex-col items-center justify-center space-y-2 border-dashed hover:border-blue-600 hover:bg-blue-50"
              >
                <Clock className="h-6 w-6 text-slate-400" />
                <div className="text-center">
                  <p className="font-medium">Schedule Interview</p>
                  <p className="text-sm text-slate-600">Organize interview sessions</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hiring Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Hiring Requests</CardTitle>
              <Link href="/hiring/requests">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingRequests ? (
                <div className="text-center py-4">Loading...</div>
              ) : hiringRequests?.slice(0, 3).map((request: any) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="text-blue-600 h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{request.role?.name}</p>
                      <p className="text-sm text-slate-600">
                        {request.city?.name} • {request.cluster?.name} • {request.numberOfPositions} positions
                      </p>
                      <p className="text-xs text-slate-500">{request.requestId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={request.status === 'open' ? 'default' : 
                              request.status === 'closed' ? 'secondary' : 'destructive'}
                    >
                      {request.status}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{request.priority}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipeline && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span className="font-medium text-slate-800">Applications Received</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-slate-800">{pipeline.applications}</span>
                      <p className="text-xs text-slate-500">This week</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-cyan-600 rounded-full"></div>
                      <span className="font-medium text-slate-800">Prescreening</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-slate-800">{pipeline.prescreening}</span>
                      <p className="text-xs text-slate-500">In progress</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                      <span className="font-medium text-slate-800">Technical Round</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-slate-800">{pipeline.technical}</span>
                      <p className="text-xs text-slate-500">Scheduled</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <span className="font-medium text-slate-800">Selected</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-slate-800">{pipeline.selected}</span>
                      <p className="text-xs text-slate-500">Awaiting offer</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-slate-800">Onboarding</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-slate-800">{pipeline.onboarding}</span>
                      <p className="text-xs text-slate-500">In training</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Conversion Rate</span>
                      <span className="font-bold text-slate-400">--</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div className="bg-slate-300 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
