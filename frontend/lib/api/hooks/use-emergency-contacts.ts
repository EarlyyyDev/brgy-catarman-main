import { useQuery } from "@tanstack/react-query"
import { emergencyContactsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toEmergencyContact, emergencyContactToPayload } from "@/lib/api/adapters/directory.adapter"
import type { EmergencyContact } from "@/types"

function useEmergencyContactsQuery(key: readonly unknown[], fetcher: () => Promise<unknown>) {
  const { data, isLoading } = useQuery<EmergencyContact[]>({
    queryKey: key,
    queryFn: async () => ((await fetcher()) as unknown[]).map((c) => toEmergencyContact(c as never)),
  })
  return { emergencyContacts: data ?? [], isLoading }
}

export function useEmergencyContacts() {
  return useEmergencyContactsQuery(qk.emergencyContacts.all, emergencyContactsApi.list)
}

export function usePublicEmergencyContacts() {
  return useEmergencyContactsQuery(qk.emergencyContacts.public, emergencyContactsApi.listPublic)
}

export function useAddEmergencyContact() {
  return useApiMutation<EmergencyContact, Omit<EmergencyContact, "id">>({
    mutationFn: async (values) => toEmergencyContact((await emergencyContactsApi.create(emergencyContactToPayload(values))) as never),
    invalidates: [qk.emergencyContacts.all, qk.emergencyContacts.public],
    successMessage: "Emergency contact added.",
  })
}

export function useUpdateEmergencyContact() {
  return useApiMutation<EmergencyContact, { id: string; values: Partial<Omit<EmergencyContact, "id">> }>({
    mutationFn: async ({ id, values }) => toEmergencyContact((await emergencyContactsApi.update(id, values)) as never),
    invalidates: [qk.emergencyContacts.all, qk.emergencyContacts.public],
    successMessage: "Emergency contact updated.",
  })
}

export function useDeleteEmergencyContact() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => emergencyContactsApi.delete(id),
    invalidates: [qk.emergencyContacts.all, qk.emergencyContacts.public],
    successMessage: "Emergency contact removed.",
  })
}
