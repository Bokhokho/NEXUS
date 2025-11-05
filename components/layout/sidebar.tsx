"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Upload, 
  UserCheck, 
  Users, 
  Activity,
  Settings,
  FileText,
  HelpCircle,
  Bell,
  User,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/importer", label: "Importer", icon: Upload },
  { href: "/dashboard/responsive", label: "Responsive", icon: UserCheck },
  { href: "/dashboard/sourcing", label: "Sourcing", icon: Users },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sorcerer
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
