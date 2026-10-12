import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"

export interface DashboardStats {
  residents: { total: number; byTag: Record<string, number> }
  households: { total: number }
  certificates: { byStatus: Record<string, number>; pending: number }
  complaints: { byStatus: Record<string, number>; open: number }
  blotters: { byStatus: Record<string, number>; active: number }
  announcements: { published: number }
  today: { pendingCertificates: number; pendingComplaints: number }
  sixMonthTrend: { month: string; requests: number; complaints: number }[]
}

export function useDashboardStats() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: qk.dashboard.stats,
    queryFn: () => dashboardApi.stats() as Promise<DashboardStats>,
    staleTime: 30 * 1000,
  })
  return { stats: data, isLoading }
}

interface PublicStats {
  residents: number
  households: number
  puroks: number
  certificatesProcessed: number
  incidentsResolved: number
}

export function usePublicStats() {
  const { data, isLoading } = useQuery<PublicStats>({
    queryKey: [...qk.dashboard.stats, "public"],
    queryFn: () => dashboardApi.statsPublic() as Promise<PublicStats>,
    staleTime: 60 * 1000,
  })
  return { stats: data, isLoading }
}

export interface RevenueBreakdownRow {
  documentTypeId: string
  name: string
  price: string | number
  count: number
  revenue: string | number
}

export interface RevenueAnalytics {
  totals: { today: string | number; month: string | number; year: string | number; allTime: string | number }
  breakdown: {
    today: RevenueBreakdownRow[]
    month: RevenueBreakdownRow[]
    year: RevenueBreakdownRow[]
    allTime: RevenueBreakdownRow[]
  }
}

export interface MonthlyRevenueAnalytics {
  year: number
  total: number | string
  monthly: { month: number; revenue: number | string }[]
}

export function useRevenueAnalytics() {
  const { data, isLoading } = useQuery<RevenueAnalytics>({
    queryKey: qk.dashboard.revenue,
    queryFn: () => dashboardApi.revenue() as Promise<RevenueAnalytics>,
  })
  return { revenue: data, isLoading }
}

export function useMonthlyRevenue(year: string) {
  const { data, isLoading, isError } = useQuery<MonthlyRevenueAnalytics>({
    queryKey: qk.dashboard.monthlyRevenue(year),
    queryFn: () => dashboardApi.monthlyRevenue(year) as Promise<MonthlyRevenueAnalytics>,
    enabled: /^\d{4}$/.test(year) && Number(year) >= 2000 && Number(year) <= new Date().getFullYear(),
  })
  return { monthlyRevenue: data, isLoading, isError }
}
