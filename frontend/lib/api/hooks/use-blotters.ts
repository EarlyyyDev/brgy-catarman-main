import { useQuery, useQueryClient } from "@tanstack/react-query"
import { blottersApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toBlotterPayload, fromBlotterDto, blotterStatusToBackend, hearingStatusToBackend } from "@/lib/api/adapters/blotter.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { Blotter, BlotterFormValues, BlotterStatus, HearingStatus, StaffMember } from "@/types"

export function useBlotters(params?: { page?: number; pageSize?: number; search?: string; status?: string }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20, search: params?.search, status: params?.status }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.blotters.list(queryParams),
    queryFn: () => blottersApi.list(queryParams),
  })
  return { blotters: (data?.items ?? []).map((b) => fromBlotterDto(b as never)), total: data?.total ?? 0, isLoading }
}

export function useAllBlotters() {
  return useBlotters({ pageSize: 5000 })
}

export function useBlotter(id: string | undefined) {
  const { data, isLoading } = useQuery<unknown>({
    queryKey: qk.blotters.detail(id ?? ""),
    queryFn: () => blottersApi.get(id!),
    enabled: Boolean(id),
  })
  return { blotter: data ? fromBlotterDto(data as never) : undefined, isLoading }
}

export function useAddBlotter() {
  return useApiMutation<Blotter, { values: BlotterFormValues; staff: StaffMember[] }>({
    mutationFn: async ({ values, staff }) => fromBlotterDto((await blottersApi.create(toBlotterPayload(values, staff))) as never),
    invalidates: [qk.blotters.all],
    successMessage: "Blotter case filed successfully.",
  })
}

export function useUpdateBlotter() {
  const queryClient = useQueryClient()
  return useApiMutation<Blotter, { id: string; values: BlotterFormValues; staff: StaffMember[] }>({
    mutationFn: async ({ id, values, staff }) => fromBlotterDto((await blottersApi.update(id, toBlotterPayload(values, staff))) as never),
    successMessage: "Blotter case updated successfully.",
    onSuccess: (blotter) => {
      queryClient.invalidateQueries({ queryKey: qk.blotters.all })
      queryClient.setQueryData(qk.blotters.detail(blotter.id), blotter)
    },
  })
}

export function useUpdateBlotterStatus() {
  const queryClient = useQueryClient()
  return useApiMutation<Blotter, { id: string; status: BlotterStatus; resolution?: string }>({
    mutationFn: async ({ id, status, resolution }) =>
      fromBlotterDto((await blottersApi.updateStatus(id, { status: blotterStatusToBackend[status], resolution })) as never),
    onSuccess: (blotter) => {
      queryClient.invalidateQueries({ queryKey: qk.blotters.all })
      queryClient.setQueryData(qk.blotters.detail(blotter.id), blotter)
    },
    successMessage: "Case status updated.",
  })
}

export function useArchiveBlotter() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => blottersApi.archive(id),
    invalidates: [qk.blotters.all],
    successMessage: "Blotter case archived.",
  })
}

export function useDeleteBlotter() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => blottersApi.delete(id),
    invalidates: [qk.blotters.all],
    successMessage: "Blotter case deleted.",
  })
}

export function useAddHearing() {
  const queryClient = useQueryClient()
  return useApiMutation<unknown, { id: string; date: string; notes?: string }>({
    mutationFn: ({ id, date, notes }) => blottersApi.addHearing(id, { date, notes }),
    successMessage: "Hearing scheduled.",
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: qk.blotters.all })
      queryClient.invalidateQueries({ queryKey: qk.blotters.detail(id) })
    },
  })
}

export function useUpdateHearingStatus() {
  const queryClient = useQueryClient()
  return useApiMutation<unknown, { id: string; hearingId: string; status: HearingStatus }>({
    mutationFn: ({ id, hearingId, status }) => blottersApi.updateHearingStatus(id, hearingId, { status: hearingStatusToBackend[status] }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: qk.blotters.all })
      queryClient.invalidateQueries({ queryKey: qk.blotters.detail(id) })
    },
  })
}

export function useAddCaseNote() {
  const queryClient = useQueryClient()
  return useApiMutation<unknown, { id: string; note: string }>({
    mutationFn: ({ id, note }) => blottersApi.addNote(id, { note }),
    successMessage: "Case note added.",
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: qk.blotters.all })
      queryClient.invalidateQueries({ queryKey: qk.blotters.detail(id) })
    },
  })
}
