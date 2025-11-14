"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

// FIXED PATHS — match these to your actual structure
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("nexusUser");

    if (!user) {
      router.push("/gate");
      return;
    }

    const parsed = JSON.parse(user);

    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem("nexusUser");
      router.push("/gate");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
