import { useQuery } from "@tanstack/react-query"
import { activityLogsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { fromActivityLogDto } from "@/lib/api/adapters/log.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { ActivityLog } from "@/types"

export function useActivityLogs(params?: { page?: number; pageSize?: number }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 200 }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.activityLogs.list(queryParams),
    queryFn: () => activityLogsApi.list(queryParams) as Promise<PaginatedResult<unknown>>,
  })
  const activityLogs: ActivityLog[] = (data?.items ?? []).map((l) => fromActivityLogDto(l as never))
  return { activityLogs, total: data?.total ?? 0, isLoading }
}
