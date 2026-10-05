import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { geographyApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import type { HouseholdPurok, Sitio } from "@/types"

interface BackendSitio {
  id: string
  name: string
  puroks: { id: string; sitioId: string; name: string }[]
}

function useGeographyQuery() {
  return useQuery<BackendSitio[]>({
    queryKey: qk.geography.all,
    queryFn: () => geographyApi.listSitios() as Promise<BackendSitio[]>,
  })
}

/** Flattens the backend's nested sitio->puroks response into the two flat
 * arrays the existing dashboard components already expect. */
export function useSitios(): { sitios: Sitio[]; puroks: HouseholdPurok[]; isLoading: boolean } {
  const { data, isLoading } = useGeographyQuery()
  const sitios = useMemo<Sitio[]>(() => (data ?? []).map((s) => ({ id: s.id, name: s.name })), [data])
  const puroks = useMemo<HouseholdPurok[]>(() => (data ?? []).flatMap((s) => s.puroks), [data])
  return { sitios, puroks, isLoading }
}

export function useAddSitio() {
  return useApiMutation<Sitio, string>({
    mutationFn: (name) => geographyApi.addSitio(name) as Promise<Sitio>,
    invalidates: [qk.geography.all],
  })
}

export function useRenameSitio() {
  return useApiMutation<Sitio, { id: string; name: string }>({
    mutationFn: ({ id, name }) => geographyApi.renameSitio(id, name) as Promise<Sitio>,
    invalidates: [qk.geography.all],
  })
}

export function useDeleteSitio() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => geographyApi.deleteSitio(id),
    invalidates: [qk.geography.all],
  })
}

export function useAddPurok() {
  return useApiMutation<HouseholdPurok, { sitioId: string; name: string }>({
    mutationFn: ({ sitioId, name }) => geographyApi.addPurok(sitioId, name) as Promise<HouseholdPurok>,
    invalidates: [qk.geography.all],
  })
}

export function useRenamePurok() {
  return useApiMutation<HouseholdPurok, { id: string; name: string }>({
    mutationFn: ({ id, name }) => geographyApi.renamePurok(id, name) as Promise<HouseholdPurok>,
    invalidates: [qk.geography.all],
  })
}

export function useDeletePurok() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => geographyApi.deletePurok(id),
    invalidates: [qk.geography.all],
  })
}
