"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import type { UserRole } from "@/types"

export function DashboardShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardTopbar role={role} />
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block print:hidden">
          <div className="fixed top-16 h-[calc(100vh-4rem)] w-64">
            <DashboardSidebar role={role} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 bg-muted/30 px-4 py-6 sm:px-6 lg:px-8 print:p-0">{children}</main>
      </div>
    </div>
  )
}
