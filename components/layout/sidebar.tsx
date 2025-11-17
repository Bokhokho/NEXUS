"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Upload,
  UserCheck,
  Users,
  Settings,
  FileText,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("nexusUser");
    if (u) setUser(JSON.parse(u));
  }, []);

  const isAdmin = user?.name === "Oussama Ahizoune";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/active-bids", label: "Active Bids", icon: Users },
    { href: "/dashboard/inactive-bids", label: "Inactive Bids", icon: UserCheck },
    { href: "/dashboard/importer", label: "Importer", icon: Upload },
    // Admin-only
    ...(isAdmin
      ? [
          { href: "/dashboard/team", label: "Team", icon: Users },
          { href: "/dashboard/contracts", label: "Contracts", icon: FileText },
          { href: "/dashboard/past-performances", label: "Past Performances", icon: Settings },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border hover:bg-accent"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static top-0 left-0 z-50 md:z-30 h-full md:h-auto flex flex-col border-r bg-card transition-all duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-20 w-64" : "md:w-64 w-64"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="NEXUS Logo"
              width={36}
              height={36}
              className="rounded-md"
              priority
            />
            {!collapsed && (
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NEXUS
              </span>
            )}
          </Link>

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:inline-flex p-2 rounded-md border hover:bg-accent"
            aria-label="Collapse sidebar"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
