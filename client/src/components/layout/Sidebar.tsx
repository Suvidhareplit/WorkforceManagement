import { Link, useLocation } from "wouter";
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
  Users,
  BookOpen,
  HardHat,
  UserCheck,
  LogOut,
  Database,
} from "lucide-react";

const menuItems = [
  {
    title: "OVERVIEW",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/",
      },
    ],
  },
  {
    title: "HIRING",
    items: [
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
        label: "Hiring Analytics",
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
    ],
  },
  {
    title: "EMPLOYEE",
    items: [
      {
        icon: Users,
        label: "Employee Lifecycle",
        href: "/employees/lifecycle",
      },
      {
        icon: LogOut,
        label: "Exit Management",
        href: "/employees/exit",
      },
    ],
  },
  {
    title: "MANAGEMENT",
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
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
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
          ))}
        </nav>
      </div>
    </aside>
  );
}
