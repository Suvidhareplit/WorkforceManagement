import { Bell, ChevronDown, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-md border-b border-slate-200">
      <div className="max-w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Users className="text-blue-600 text-2xl" />
              <h1 className="text-xl font-bold text-slate-800">Blue Collar HRMS</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white text-sm" />
              </div>
              <span className="text-slate-700 font-medium">
                {user?.firstName || user?.username || 'User'}
              </span>
              <ChevronDown className="text-slate-600 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
