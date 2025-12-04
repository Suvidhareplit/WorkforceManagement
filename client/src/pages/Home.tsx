import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all employees
  const { data: employeesData } = useQuery({
    queryKey: ["/api/employees"],
  });
  
  const employees = (employeesData as any[]) || [];

  // Filter employees based on search query
  const filteredEmployees = employees.filter((emp: any) => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase();
    const name = (emp.name || "").toLowerCase();
    const mobile = (emp.mobileNumber || emp.mobile_number || "").toString();
    const employeeId = (emp.employeeId || emp.employee_id || "").toLowerCase();
    
    return (
      name.includes(query) ||
      mobile.includes(query) ||
      employeeId.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome {user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-purple-100">
          Search for employees by name, phone number, or employee ID
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search employees by name, phone number, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Search Results ({filteredEmployees.length})
          </h2>
          
          {filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No employees found matching "{searchQuery}"</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((employee: any) => (
                <Link key={employee.id} href={`/employee/${employee.employeeId || employee.employee_id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                            {(employee.name || "?").charAt(0).toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Employee Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {employee.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {employee.role || "N/A"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium">
                              Emp # {employee.employeeId || employee.employee_id}
                            </span>
                            <span>|</span>
                            <span>{employee.employmentType || employee.employment_type}</span>
                            {/* Exit Status - only show if exists */}
                            {(employee.exitStatus || employee.exit_status) && (
                              <>
                                <span>|</span>
                                <Badge 
                                  className={
                                    (employee.exitStatus || employee.exit_status) === 'initiated' 
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs'
                                      : (employee.exitStatus || employee.exit_status) === 'in_progress'
                                      ? 'bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs'
                                      : (employee.exitStatus || employee.exit_status) === 'completed'
                                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs'
                                  }
                                >
                                  Exit: {employee.exitStatus || employee.exit_status}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <Badge 
                            className={
                              (employee.workingStatus || employee.working_status) === 'working'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : (employee.workingStatus || employee.working_status) === 'relieved'
                                ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            }
                          >
                            {employee.workingStatus || employee.working_status || 'Active'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial State - No Search */}
      {!searchQuery.trim() && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">Start typing to search for employees</p>
            <p className="text-sm">You can search by name, phone number, or employee ID</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
