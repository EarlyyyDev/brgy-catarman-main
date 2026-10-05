import { useQuery } from "@tanstack/react-query"
import { blotterTemplatesApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import type { BlotterTemplate, BlotterTemplateFormValues } from "@/types"

interface BackendBlotterTemplate {
  id: string
  name: string
  status: "ACTIVE" | "INACTIVE"
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  bodyHtml: string
  createdAt: string
  updatedAt: string
}

function fromDto(dto: BackendBlotterTemplate): BlotterTemplate {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status === "ACTIVE" ? "Active" : "Inactive",
    showBarangayLogo: dto.showBarangayLogo,
    showMunicipalLogo: dto.showMunicipalLogo,
    showBarangayDrySeal: dto.showBarangayDrySeal,
    logoSize: dto.logoSize,
    bodyHtml: dto.bodyHtml,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

function toPayload(values: BlotterTemplateFormValues) {
  return {
    name: values.name,
    status: values.status === "Active" ? "ACTIVE" : "INACTIVE",
    showBarangayLogo: values.showBarangayLogo,
    showMunicipalLogo: values.showMunicipalLogo,
    showBarangayDrySeal: values.showBarangayDrySeal,
    logoSize: values.logoSize,
    bodyHtml: values.bodyHtml,
  }
}

export function useBlotterTemplates() {
  const { data, isLoading } = useQuery<unknown[]>({
    queryKey: qk.blotterTemplates.all,
    queryFn: () => blotterTemplatesApi.list() as Promise<unknown[]>,
  })
  return { templates: (data ?? []).map((t) => fromDto(t as never)), isLoading }
}

export function useAddBlotterTemplate() {
  return useApiMutation<BlotterTemplate, BlotterTemplateFormValues>({
    mutationFn: async (values) => fromDto((await blotterTemplatesApi.create(toPayload(values))) as never),
    invalidates: [qk.blotterTemplates.all],
    successMessage: "Template saved successfully.",
  })
}

export function useUpdateBlotterTemplate() {
  return useApiMutation<BlotterTemplate, { id: string; values: BlotterTemplateFormValues }>({
    mutationFn: async ({ id, values }) => fromDto((await blotterTemplatesApi.update(id, toPayload(values))) as never),
    invalidates: [qk.blotterTemplates.all],
    successMessage: "Template updated successfully.",
  })
}

export function useDeleteBlotterTemplate() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => blotterTemplatesApi.delete(id),
    invalidates: [qk.blotterTemplates.all],
    successMessage: "Template deleted.",
  })
}
