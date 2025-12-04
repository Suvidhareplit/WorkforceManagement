import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  List,
  TrendingUp,
  UserPlus,
  ClipboardCheck,
  MessageSquare,
  Handshake,
  GraduationCap,
  BookOpen,
  HardHat,
  UserCheck,
  Database,
  Calendar,
  Home,
  ChevronDown,
  ChevronRight,
  LogOut,
  BarChart3,
  FileText,
} from "lucide-react";

const menuItems = [
  {
    title: "OVERVIEW",
    items: [
      {
        icon: Home,
        label: "Home",
        href: "/home",
      },
    ],
  },
  {
    title: "HIRING",
    items: [
      {
        icon: LayoutDashboard,
        label: "Hiring Metrics",
        href: "/",
      },
      {
        icon: Plus,
        label: "Create Request",
        href: "/hiring/create",
      },
      {
        icon: List,
        label: "View Requests",
        href: "/hiring/requests",
      },
      {
        icon: TrendingUp,
        label: "Open Mandates Overview",
        href: "/analytics/hiring",
      },
    ],
  },
  {
    title: "INTERVIEWS",
    items: [
      {
        icon: UserPlus,
        label: "Candidate Applications",
        href: "/interviews/applications",
      },
      {
        icon: ClipboardCheck,
        label: "Prescreening",
        href: "/interviews/prescreening",
      },
      {
        icon: MessageSquare,
        label: "Technical Rounds",
        href: "/interviews/technical",
      },
      {
        icon: Handshake,
        label: "Offer Management",
        href: "/interviews/offers",
      },
    ],
  },
  {
    title: "TRAINING",
    items: [
      {
        icon: GraduationCap,
        label: "Induction",
        href: "/training/induction",
      },
      {
        icon: BookOpen,
        label: "Classroom Training",
        href: "/training/classroom",
      },
      {
        icon: HardHat,
        label: "Field Training",
        href: "/training/field",
      },
      {
        icon: UserCheck,
        label: "Onboarding",
        href: "/training/onboarding",
      },
    ],
  },
  {
    title: "EXIT MANAGEMENT",
    items: [
      {
        icon: LogOut,
        label: "Exit Management",
        href: "/management/exit",
      },
    ],
  },
  {
    title: "ATTRITION ANALYSIS",
    items: [
      {
        icon: BarChart3,
        label: "Attrition Analysis",
        href: "/management/attrition",
      },
    ],
  },
  {
    title: "REPORTS",
    items: [
      {
        icon: FileText,
        label: "Reports",
        href: "/management/reports",
      },
    ],
  },
  {
    title: "SECURITY MANAGEMENT",
    items: [
      {
        icon: UserCheck,
        label: "User Management",
        href: "/management/users",
      },
      {
        icon: Database,
        label: "Master Data",
        href: "/master-data",
      },
      {
        icon: Calendar,
        label: "Leave Management",
        href: "/leave-management",
      },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    OVERVIEW: true, // Always keep overview open
    HIRING: false,
    INTERVIEWS: false,
    TRAINING: false,
    "EXIT MANAGEMENT": false,
    "ATTRITION ANALYSIS": false,
    "REPORTS": false,
    "SECURITY MANAGEMENT": false,
  });

  const toggleSection = (sectionTitle: string) => {
    // Don't allow collapsing OVERVIEW
    if (sectionTitle === "OVERVIEW") return;
    
    setOpenSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-full overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((section) => {
            const isOpen = openSections[section.title];
            const isOverview = section.title === "OVERVIEW";
            
            return (
              <div key={section.title} className="space-y-1">
                <div
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg mb-1",
                    isOverview 
                      ? "cursor-default" 
                      : "cursor-pointer hover:bg-slate-100 transition-all duration-200 group"
                  )}
                >
                  <h3 className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isOverview 
                      ? "text-gray-500" 
                      : "text-gray-600 group-hover:text-gray-800"
                  )}>
                    {section.title}
                  </h3>
                  {!isOverview && (
                    isOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )
                  )}
                </div>
                
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="space-y-1 pt-1">
                    {section.items.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                              isActive
                                ? "text-blue-600 bg-blue-50 font-medium"
                                : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
