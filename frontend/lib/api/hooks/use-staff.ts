import { useQuery, useQueryClient } from "@tanstack/react-query"
import { usersApi, type BackendUser } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toStaffMember, staffFormToPayload } from "@/lib/api/adapters/staff.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { StaffFormValues, StaffMember } from "@/types"

export function useStaff(params?: { page?: number; pageSize?: number; search?: string }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 200, search: params?.search }
  const { data, isLoading } = useQuery<PaginatedResult<BackendUser>>({
    queryKey: qk.staff.list(queryParams),
    queryFn: () => usersApi.list(queryParams) as Promise<PaginatedResult<BackendUser>>,
  })
  const staffMembers: StaffMember[] = (data?.items ?? []).map(toStaffMember)
  return { staffMembers, total: data?.total ?? 0, isLoading }
}

export function useAddStaff() {
  return useApiMutation<{ user: StaffMember; temporaryPassword: string }, StaffFormValues>({
    mutationFn: async (values) => {
      const result = (await usersApi.create(staffFormToPayload(values))) as { user: BackendUser; temporaryPassword: string }
      return { user: toStaffMember(result.user), temporaryPassword: result.temporaryPassword }
    },
    invalidates: [qk.staff.all],
  })
}

export function useUpdateStaff() {
  return useApiMutation<StaffMember, { id: string; values: StaffFormValues }>({
    mutationFn: async ({ id, values }) => toStaffMember(await usersApi.update(id, staffFormToPayload(values)) as BackendUser),
    invalidates: [qk.staff.all],
    successMessage: "Staff account updated.",
  })
}

export function useDeleteStaff() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => usersApi.delete(id),
    invalidates: [qk.staff.all],
    successMessage: "Staff account deleted.",
  })
}

export function useToggleStaffStatus() {
  return useApiMutation<StaffMember, string>({
    mutationFn: async (id) => toStaffMember(await usersApi.toggleStatus(id) as BackendUser),
    invalidates: [qk.staff.all],
  })
}

export function useSetStaffPassword() {
  return useApiMutation<unknown, { id: string; newPassword: string }>({
    mutationFn: ({ id, newPassword }) => usersApi.setPassword(id, newPassword),
    successMessage: "Password updated.",
  })
}

/** For a staff member editing their own avatar — also refreshes the cached session. */
export function useUpdateOwnAvatar() {
  const queryClient = useQueryClient()
  return useApiMutation<StaffMember, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => toStaffMember(await usersApi.updateAvatar(id, file) as BackendUser),
    invalidates: [qk.staff.all],
    onSuccess: (staff) => {
      queryClient.setQueryData(qk.auth.me, (old: unknown) =>
        old && typeof old === "object" ? { ...old, avatarUrl: staff.avatarUrl } : old,
      )
    },
  })
}
