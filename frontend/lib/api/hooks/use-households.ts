import { useQuery, useQueryClient } from "@tanstack/react-query"
import { householdsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toHouseholdPayload, fromHouseholdDto } from "@/lib/api/adapters/household.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { Household, HouseholdFormValues } from "@/types"

export function useHouseholds(params?: { page?: number; pageSize?: number; search?: string; purokId?: string }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20, search: params?.search, purokId: params?.purokId }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.households.list(queryParams),
    queryFn: () => householdsApi.list(queryParams),
  })
  return {
    households: (data?.items ?? []).map((h) => fromHouseholdDto(h as never)),
    total: data?.total ?? 0,
    isLoading,
  }
}

/** Fetches every household in one page — for the household explorer/sidebar
 * views that group and filter client-side. Fine at this barangay's scale. */
export function useAllHouseholds() {
  return useHouseholds({ pageSize: 5000 })
}

export function useHousehold(id: string | undefined) {
  const { data, isLoading } = useQuery<unknown>({
    queryKey: qk.households.detail(id ?? ""),
    queryFn: () => householdsApi.get(id!),
    enabled: Boolean(id),
  })
  return { household: data ? fromHouseholdDto(data as never) : undefined, isLoading }
}

export function useAddHousehold(options: { showSuccessMessage?: boolean } = {}) {
  return useApiMutation<Household, HouseholdFormValues>({
    mutationFn: async (values) => fromHouseholdDto((await householdsApi.create(toHouseholdPayload(values))) as never),
    invalidates: [qk.households.all, qk.residents.all],
    successMessage: options.showSuccessMessage === false ? undefined : "Household added successfully.",
  })
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient()
  return useApiMutation<Household, { id: string; values: HouseholdFormValues }>({
    mutationFn: async ({ id, values }) => fromHouseholdDto((await householdsApi.update(id, toHouseholdPayload(values))) as never),
    successMessage: "Household updated successfully.",
    onSuccess: (household) => {
      queryClient.invalidateQueries({ queryKey: qk.households.all })
      queryClient.invalidateQueries({ queryKey: qk.residents.all })
      queryClient.setQueryData(qk.households.detail(household.id), household)
    },
  })
}

export function useDeleteHousehold() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => householdsApi.delete(id),
    invalidates: [qk.households.all, qk.residents.all],
    successMessage: "Household record deleted.",
  })
}

export function useArchiveHousehold() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => householdsApi.archive(id),
    invalidates: [qk.households.all],
    successMessage: "Household archived.",
  })
}

export function useRestoreHousehold() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => householdsApi.restore(id),
    invalidates: [qk.households.all],
    successMessage: "Household restored from archive.",
  })
}
