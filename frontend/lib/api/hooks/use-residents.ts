import { useQuery, useQueryClient } from "@tanstack/react-query"
import { residentsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toResidentPayload, tagsToPayload, fromResidentDto } from "@/lib/api/adapters/resident.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { HouseholdPurok, Resident, ResidentFormValues, ResidentTagType } from "@/types"

export function useResidents(params?: { page?: number; pageSize?: number; search?: string; purokId?: string }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20, search: params?.search, purokId: params?.purokId }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.residents.list(queryParams),
    queryFn: () => residentsApi.list(queryParams),
  })
  return {
    residents: (data?.items ?? []).map((r) => fromResidentDto(r as never)),
    total: data?.total ?? 0,
    isLoading,
  }
}

/** Fetches every resident in one page — for pages that still filter/derive
 * client-side (e.g. household member pickers) rather than the paginated
 * DataTable flow. Fine at this barangay's realistic data volume. */
export function useAllResidents() {
  return useResidents({ pageSize: 5000 })
}

export function useResident(id: string | undefined) {
  const { data, isLoading } = useQuery<unknown>({
    queryKey: qk.residents.detail(id ?? ""),
    queryFn: () => residentsApi.get(id!),
    enabled: Boolean(id),
  })
  return { resident: data ? fromResidentDto(data as never) : undefined, isLoading }
}

export function useAddResident(options: { showSuccessMessage?: boolean } = {}) {
  return useApiMutation<Resident, { values: ResidentFormValues; puroks: HouseholdPurok[] }>({
    mutationFn: async ({ values, puroks }) => {
      const created = (await residentsApi.create(toResidentPayload(values, puroks))) as never
      if (values.tags.length > 0) {
        const tagged = await residentsApi.assignTags(fromResidentDto(created).id, tagsToPayload(values.tags))
        return fromResidentDto(tagged as never)
      }
      return fromResidentDto(created)
    },
    invalidates: [qk.residents.all],
    successMessage: options.showSuccessMessage === false ? undefined : "Resident added successfully.",
  })
}

export function useUpdateResident() {
  const queryClient = useQueryClient()
  return useApiMutation<Resident, { id: string; values: ResidentFormValues; puroks: HouseholdPurok[] }>({
    mutationFn: async ({ id, values, puroks }) => {
      await residentsApi.update(id, toResidentPayload(values, puroks))
      const tagged = await residentsApi.assignTags(id, tagsToPayload(values.tags))
      return fromResidentDto(tagged as never)
    },
    successMessage: "Resident record updated successfully.",
    onSuccess: (resident) => {
      queryClient.invalidateQueries({ queryKey: qk.residents.all })
      queryClient.setQueryData(qk.residents.detail(resident.id), resident)
    },
  })
}

export function useDeleteResident() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => residentsApi.delete(id),
    invalidates: [qk.residents.all],
    successMessage: "Resident record deleted.",
  })
}

export function useAssignResidentTags() {
  const queryClient = useQueryClient()
  return useApiMutation<Resident, { id: string; tags: ResidentTagType[] }>({
    mutationFn: async ({ id, tags }) => fromResidentDto((await residentsApi.assignTags(id, tagsToPayload(tags))) as never),
    successMessage: "Tags updated.",
    onSuccess: (resident) => {
      queryClient.invalidateQueries({ queryKey: qk.residents.all })
      queryClient.setQueryData(qk.residents.detail(resident.id), resident)
    },
  })
}

export function useUploadResidentPhoto() {
  const queryClient = useQueryClient()
  return useApiMutation<Resident, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => fromResidentDto((await residentsApi.uploadPhoto(id, file)) as never),
    onSuccess: (resident) => {
      queryClient.invalidateQueries({ queryKey: qk.residents.all })
      queryClient.setQueryData(qk.residents.detail(resident.id), resident)
    },
  })
}
