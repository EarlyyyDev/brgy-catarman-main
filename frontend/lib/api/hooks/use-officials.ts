import { useQuery } from "@tanstack/react-query"
import { officialsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toOfficial, officialToPayload } from "@/lib/api/adapters/directory.adapter"
import type { Official } from "@/types"

function useOfficialsQuery(key: readonly unknown[], fetcher: () => Promise<unknown>) {
  const { data, isLoading } = useQuery<Official[]>({
    queryKey: key,
    queryFn: async () => ((await fetcher()) as unknown[]).map((o) => toOfficial(o as never)),
  })
  return { officials: data ?? [], isLoading }
}

export function useOfficials() {
  return useOfficialsQuery(qk.officials.all, officialsApi.list)
}

export function usePublicOfficials() {
  return useOfficialsQuery(qk.officials.public, officialsApi.listPublic)
}

export function useAddOfficial() {
  return useApiMutation<Official, Omit<Official, "id">>({
    mutationFn: async (values) => toOfficial((await officialsApi.create(officialToPayload(values))) as never),
    invalidates: [qk.officials.all, qk.officials.public],
    successMessage: "Official added.",
  })
}

export function useUpdateOfficial() {
  return useApiMutation<Official, { id: string; values: Partial<Omit<Official, "id">> }>({
    mutationFn: async ({ id, values }) => toOfficial((await officialsApi.update(id, values)) as never),
    invalidates: [qk.officials.all, qk.officials.public],
    successMessage: "Official updated.",
  })
}

export function useDeleteOfficial() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => officialsApi.delete(id),
    invalidates: [qk.officials.all, qk.officials.public],
    successMessage: "Official removed.",
  })
}
