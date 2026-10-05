import { useQuery, useQueryClient } from "@tanstack/react-query"
import { documentTypesApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"

export interface BackendDocumentType {
  id: string
  name: string
  code: string
  description?: string | null
  requirements: string[]
  fee: string | number
  validityDays?: number | null
  isActive: boolean
}

export function useDocumentTypes() {
  const { data, isLoading } = useQuery<BackendDocumentType[]>({
    queryKey: qk.documentTypes.all,
    queryFn: () => documentTypesApi.list() as Promise<BackendDocumentType[]>,
  })
  return { documentTypes: data ?? [], isLoading }
}

/** Public-safe mirror for pre-auth/anonymous consumers (e.g. the public
 * "Request Document" dialog) -- the authenticated /document-types endpoint
 * 401s for them, which silently breaks the documentTypeId lookup below. */
export function usePublicDocumentTypes() {
  const { data, isLoading } = useQuery<BackendDocumentType[]>({
    queryKey: qk.documentTypes.public,
    queryFn: () => documentTypesApi.listPublic() as Promise<BackendDocumentType[]>,
  })
  return { documentTypes: data ?? [], isLoading }
}

export function documentTypeIdByName(name: string, documentTypes: BackendDocumentType[]): string | undefined {
  return documentTypes.find((d) => d.name === name)?.id
}

export function useUpdateDocumentTypeFee() {
  const queryClient = useQueryClient()
  return useApiMutation<unknown, { id: string; fee: number }>({
    mutationFn: ({ id, fee }) => documentTypesApi.update(id, { fee }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.documentTypes.all })
    },
    successMessage: "Price updated.",
  })
}
