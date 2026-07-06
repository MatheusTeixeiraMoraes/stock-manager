"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import type { UserRole } from "@/types/database";

interface DashboardShellProps {
  role: UserRole;
  userName: string;
  children: React.ReactNode;
}

export default function DashboardShell({ role, userName, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar title="Stock Manager" userName={userName} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-canvas px-4 sm:px-6 lg:px-8 py-5 lg:py-8 safe-bottom">
          {children}
        </main>
      </div>
    </div>
  );
}
