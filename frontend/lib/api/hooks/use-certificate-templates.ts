import { useQuery } from "@tanstack/react-query"
import { certificateTemplatesApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toCertificateTemplatePayload, fromCertificateTemplateDto } from "@/lib/api/adapters/certificateTemplate.adapter"
import { useDocumentTypes } from "@/lib/api/hooks/use-document-types"
import type { BackendDocumentType } from "@/lib/api/hooks/use-document-types"
import type { CertificateTemplate, CertificateTemplateFormValues } from "@/types"

export function useCertificateTemplates() {
  const { data, isLoading } = useQuery<unknown[]>({
    queryKey: qk.certificateTemplates.all,
    queryFn: () => certificateTemplatesApi.list() as Promise<unknown[]>,
  })
  const { documentTypes } = useDocumentTypes()
  const templates: CertificateTemplate[] = (data ?? []).map((t) => fromCertificateTemplateDto(t as never))
  return { templates, documentTypes, isLoading }
}

export function useAddCertificateTemplate() {
  return useApiMutation<CertificateTemplate, { values: CertificateTemplateFormValues; documentTypes: BackendDocumentType[] }>({
    mutationFn: async ({ values, documentTypes }) =>
      fromCertificateTemplateDto((await certificateTemplatesApi.create(toCertificateTemplatePayload(values, documentTypes))) as never),
    invalidates: [qk.certificateTemplates.all],
    successMessage: "Template saved successfully.",
  })
}

export function useUpdateCertificateTemplate() {
  return useApiMutation<CertificateTemplate, { id: string; values: CertificateTemplateFormValues; documentTypes: BackendDocumentType[] }>({
    mutationFn: async ({ id, values, documentTypes }) =>
      fromCertificateTemplateDto((await certificateTemplatesApi.update(id, toCertificateTemplatePayload(values, documentTypes))) as never),
    invalidates: [qk.certificateTemplates.all],
    successMessage: "Template updated successfully.",
  })
}

export function useDeleteCertificateTemplate() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => certificateTemplatesApi.delete(id),
    invalidates: [qk.certificateTemplates.all],
    successMessage: "Template deleted.",
  })
}
