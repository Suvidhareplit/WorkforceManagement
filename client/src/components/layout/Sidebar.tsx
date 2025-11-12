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
  BookOpen,
  HardHat,
  UserCheck,
  Database,
  Calendar,
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

  return (
    <aside className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
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
