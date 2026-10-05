"use client"

import * as React from "react"
import { isToday } from "date-fns"
import { Building2, FileText, Gavel, Megaphone, ScrollText, ShieldAlert, Users, Users2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"
import { CaseTrendChart } from "@/components/dashboard/case-trend-chart"
import { ResidentsByTagChart } from "@/components/dashboard/residents-by-tag-chart"
import { useMe } from "@/lib/api/hooks/use-auth"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { useAllHouseholds } from "@/lib/api/hooks/use-households"
import { useAllCertificateRequests } from "@/lib/api/hooks/use-certificate-requests"
import { useAllComplaints } from "@/lib/api/hooks/use-complaints"
import { useAllBlotters } from "@/lib/api/hooks/use-blotters"
import { useAllAnnouncements } from "@/lib/api/hooks/use-announcements"
import { useStaff } from "@/lib/api/hooks/use-staff"
import { useActivityLogs } from "@/lib/api/hooks/use-activity-logs"

export default function OverviewPage() {
  const { data: session } = useMe()
  const { residents } = useAllResidents()
  const { households } = useAllHouseholds()
  const { certificateRequests } = useAllCertificateRequests()
  const { complaints } = useAllComplaints()
  const { blotters } = useAllBlotters()
  const { announcements } = useAllAnnouncements()
  const { staffMembers } = useStaff()
  const { total: activityLogCount } = useActivityLogs({ pageSize: 1 })

  const pendingCertificates = certificateRequests.filter((c) => c.status === "Pending" || c.status === "Processing").length
  const pendingComplaints = complaints.filter((c) => c.status === "New" || c.status === "Under Review").length
  const todayPendingCertificates = certificateRequests.filter((c) => (c.status === "Pending" || c.status === "Processing") && isToday(new Date(c.submittedAt))).length
  const todayPendingComplaints = complaints.filter((c) => (c.status === "New" || c.status === "Under Review") && isToday(new Date(c.submittedAt))).length

  const statCards = [
    { label: "Total Households", value: households.length, icon: Building2, href: "/dashboard/households" },
    { label: "Pending Documents Requests", value: pendingCertificates, icon: FileText, href: "/dashboard/certificates" },
    { label: "Blotter Records", value: blotters.length, icon: Gavel, href: "/dashboard/blotters" },
    { label: "Pending Complaints", value: pendingComplaints, icon: ShieldAlert, href: "/dashboard/complaints" },
    { label: "Today's Pending Documents Request", value: todayPendingCertificates, icon: FileText, href: "/dashboard/certificates" },
    { label: "Today's Pending Complaints", value: todayPendingComplaints, icon: ShieldAlert, href: "/dashboard/complaints" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={session?.role === "Administrator" ? "Administrator Dashboard" : "Staff Dashboard"} />

      <WelcomeBanner name={session?.name.split(" ")[0] ?? ""} pendingCount={pendingCertificates + pendingComplaints} />

      {session?.role === "Administrator" ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">System Overview</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Staff Accounts" value={staffMembers.length} icon={Users2} accent="navy" />
            <StatCard label="Total Residents" value={residents.length} icon={Users} accent="navy" />
            <StatCard label="Announcements Published" value={announcements.filter((a) => a.status === "Published").length} icon={Megaphone} accent="gold" />
            <StatCard label="Activity Log Entries" value={activityLogCount} icon={ScrollText} accent="navy" />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <DashboardStatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CaseTrendChart />
        <ResidentsByTagChart />
      </div>
    </div>
  )
}
