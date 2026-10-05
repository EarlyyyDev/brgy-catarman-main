import { useQuery, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toSystemSettings } from "@/lib/api/adapters/settings.adapter"
import type { SystemSettings } from "@/types"

const FALLBACK_SETTINGS = toSystemSettings({})

/** Admin dashboard settings (includes SMTP fields) — requires an authenticated admin session. */
export function useSettings() {
  const { data, isLoading } = useQuery<SystemSettings>({
    queryKey: qk.settings.admin,
    queryFn: async () => toSystemSettings((await settingsApi.get()) as Record<string, unknown>),
  })
  return { settings: data ?? FALLBACK_SETTINGS, isLoading }
}

/** Public-safe settings (branding/contact info only, no SMTP) — usable pre-auth (login page, public site).
 * refetchOnWindowFocus is turned back on (the app default disables it) so an
 * admin who has the public site open in one tab while editing settings in
 * another sees the change as soon as they switch tabs, instead of needing a
 * manual hard refresh -- invalidation from useUpdateSettings only reaches
 * the QueryClient in the tab where the edit happened. */
export function usePublicSettings() {
  const { data, isLoading } = useQuery<SystemSettings>({
    queryKey: qk.settings.public,
    queryFn: async () => toSystemSettings((await settingsApi.getPublic()) as Record<string, unknown>),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
  return { settings: data ?? FALLBACK_SETTINGS, isLoading }
}

export function useSubmitContactForm() {
  return useApiMutation<unknown, { name: string; email: string; subject: string; message: string }>({
    mutationFn: (values) => settingsApi.submitContactForm(values),
    successMessage: "Your message has been sent. The barangay office will get back to you shortly.",
  })
}

/** Uploads a locally-selected image (data: URL from FileDropzone/crop dialogs)
 * and returns its real, persisted URL -- these must never be saved directly
 * as raw base64 in a settings field, since that both bloats the DB row far
 * past what's sane and can exceed the JSON body size limit outright. */
export function useUploadSettingsImage() {
  return useApiMutation<{ url: string }, File>({
    mutationFn: (file) => settingsApi.uploadImage(file),
    showErrorToast: false,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useApiMutation<SystemSettings, Partial<SystemSettings>>({
    mutationFn: async (values) => toSystemSettings((await settingsApi.update(values)) as Record<string, unknown>),
    onSuccess: (settings) => {
      queryClient.setQueryData(qk.settings.admin, settings)
      queryClient.invalidateQueries({ queryKey: qk.settings.public })
    },
  })
}
