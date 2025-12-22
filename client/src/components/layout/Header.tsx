import { Bell, ChevronDown, User, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Header() {
  const { user, logout } = useAuth();

  // Fetch notifications from database
  const { data: notificationsData } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      return apiRequest('/api/notifications?unread=true');
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const unreadCount = notifications.length;

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'recruiter': return 'bg-green-100 text-green-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'trainer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get route based on notification type
  const getNotificationRoute = (type: string) => {
    switch (type) {
      case 'absconding':
      case 'showcause':
      case 'termination':
      case 'response':
        return '/management/attendance';
      case 'leave':
        return '/leave-management';
      case 'hiring':
        return '/hiring/requests';
      default:
        return '/';
    }
  };

  const handleNotificationClick = (notification: any) => {
    const route = getNotificationRoute(notification.type);
    window.location.href = route;
  };

  return (
    <header className="bg-white shadow-md border-b border-slate-200">
      <div className="max-w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Users className="text-blue-600 text-2xl" />
              <h1 className="text-xl font-bold text-slate-800">Yulite HRMS</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative cursor-pointer"
                >
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-semibold">Notifications</p>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  <>
                    {notifications.slice(0, 5).map((notification: any) => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className="flex flex-col items-start px-3 py-2 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <span className="font-medium text-sm">{notification.title}</span>
                        <span className="text-xs text-slate-500 line-clamp-2">{notification.message}</span>
                      </DropdownMenuItem>
                    ))}
                    {notifications.length > 5 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-center text-sm text-blue-600 cursor-pointer"
                          onClick={() => window.location.href = '/management/attendance'}
                        >
                          View all notifications
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="text-white text-sm" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-slate-700 font-medium">
                      {user?.name || user?.username || 'User'}
                    </span>
                    <Badge className={`text-xs ${getRoleBadgeColor(user?.role || '')}`}>
                      {user?.role}
                    </Badge>
                  </div>
                  <ChevronDown className="text-slate-600 text-sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
