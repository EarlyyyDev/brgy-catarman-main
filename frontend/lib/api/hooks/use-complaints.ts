import { useQuery, useQueryClient } from "@tanstack/react-query"
import { complaintsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toSubmitComplaintPayload, fromComplaintDto, complaintStatusToBackend } from "@/lib/api/adapters/complaint.adapter"
import { dataUrlToFile } from "@/lib/api/adapters/file.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { Complaint, ComplaintStatus, EvidencePhoto, IncidentCategory } from "@/types"

export function useComplaints(params?: { page?: number; pageSize?: number; search?: string; status?: string }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20, search: params?.search, status: params?.status }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.complaints.list(queryParams),
    queryFn: () => complaintsApi.list(queryParams),
  })
  return { complaints: (data?.items ?? []).map((c) => fromComplaintDto(c as never)), total: data?.total ?? 0, isLoading }
}

export function useAllComplaints() {
  return useComplaints({ pageSize: 5000 })
}

function buildPhotoFormData(
  dataUrl: string,
  filename: string,
  type: "REPORTER_CAPTURE" | "EVIDENCE",
  source: "LIVE_CAMERA" | "FILE_UPLOAD" = "LIVE_CAMERA",
) {
  const formData = new FormData()
  formData.append("photo", dataUrlToFile(dataUrl, filename))
  formData.append("type", type)
  formData.append("source", source)
  return formData
}

export function useSubmitComplaint() {
  return useApiMutation<
    Complaint,
    {
      values: {
        reporterName: string
        residentId: string
        captchaToken: string
        reporterPhone: string
        reporterEmail: string
        reportedPerson?: string
        category: IncidentCategory
        otherCategoryLabel?: string
        location: string
        incidentDate: string
        incidentTime: string
        description: string
      }
      reporterPhotoDataUrl: string
      evidencePhotos: EvidencePhoto[]
      onProgress?: (message: string, progress?: number) => void
    }
  >({
    mutationFn: async ({ values, reporterPhotoDataUrl, evidencePhotos, onProgress }) => {
      onProgress?.("Verifying your details and saving the report...")
      const created = fromComplaintDto((await complaintsApi.submitPublic(toSubmitComplaintPayload(values))) as never)
      onProgress?.("Uploading your identity verification photo...")
      await complaintsApi.addPhotoPublic(
        created.id,
        buildPhotoFormData(reporterPhotoDataUrl, "reporter-photo.jpg", "REPORTER_CAPTURE"),
        ({ percent }) => onProgress?.("Sending your identity verification photo...", percent),
      )
      for (let i = 0; i < evidencePhotos.length; i++) {
        const photo = evidencePhotos[i]
        const mimeType = photo.dataUrl.match(/^data:(image\/[^;]+);base64,/)?.[1]
        const extension = mimeType?.split("/")[1] ?? "jpeg"
        onProgress?.(`Uploading evidence photo ${i + 1} of ${evidencePhotos.length}...`)
        await complaintsApi.addPhotoPublic(
          created.id,
          buildPhotoFormData(photo.dataUrl, `evidence-${i + 1}.${extension}`, "EVIDENCE", photo.source),
          ({ percent }) => onProgress?.(`Sending evidence photo ${i + 1} of ${evidencePhotos.length}...`, percent),
        )
      }
      onProgress?.("Finishing your report and preparing its reference number...")
      return created
    },
    showErrorToast: false,
  })
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient()
  return useApiMutation<Complaint, { id: string; status: ComplaintStatus; staffNotes?: string }>({
    mutationFn: async ({ id, status, staffNotes }) =>
      fromComplaintDto((await complaintsApi.updateStatus(id, { status: complaintStatusToBackend[status], staffNotes })) as never),
    onSuccess: (complaint) => {
      queryClient.invalidateQueries({ queryKey: qk.complaints.all })
      queryClient.setQueryData(qk.complaints.detail(complaint.id), complaint)
    },
    successMessage: "Complaint status updated.",
  })
}

export function useTrackComplaint(referenceNumber: string | undefined) {
  const { data, isLoading, isError } = useQuery<unknown>({
    queryKey: qk.complaints.track(referenceNumber ?? ""),
    queryFn: () => complaintsApi.track(referenceNumber!),
    enabled: Boolean(referenceNumber),
    retry: false,
  })
  return { complaint: data ? fromComplaintDto(data as never) : undefined, isLoading, isError }
}
