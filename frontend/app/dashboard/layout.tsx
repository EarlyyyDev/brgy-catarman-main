"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMe } from "@/lib/api/hooks/use-auth"
import { DashboardShell } from "@/components/dashboard/shell"
import { BarangaySeal } from "@/components/shared/barangay-seal"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, isLoading, isError } = useMe()

  React.useEffect(() => {
    if (isError) {
      router.replace("/portal/a8K92LmX/login")
    }
  }, [isError, router])

  if (isLoading || isError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30">
        <BarangaySeal className="size-14 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  return <DashboardShell role={session.role}>{children}</DashboardShell>
}
