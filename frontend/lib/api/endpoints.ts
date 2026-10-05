import { apiFetch, apiUpload, buildQueryString } from "./client"
import type { ListParams, PaginatedResult } from "./types"

// ─────────────────────────── AUTH ───────────────────────────

export interface BackendUser {
  id: string
  name: string
  email: string
  role: "STAFF" | "ADMINISTRATOR"
  position: string
  avatarUrl?: string | null
  status?: string
  contactNumber?: string | null
  mustChangePassword?: boolean
  lastLogin?: string | null
  securityQuestionsSet?: boolean
  securityQuestion1?: string
  securityQuestion2?: string
}

export const authApi = {
  me: () => apiFetch<BackendUser>("/auth/me"),
  login: (body: { email: string; password: string; rememberMe?: boolean }) =>
    apiFetch<BackendUser>("/auth/login", { method: "POST", body }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  logoutAll: () => apiFetch("/auth/logout-all", { method: "POST" }),
  getForgotPasswordQuestions: (email: string) =>
    apiFetch<{ question1: string; question2: string }>("/auth/forgot-password/questions", {
      method: "POST",
      body: { email },
    }),
  resetPassword: (body: { email: string; answer1: string; answer2: string; newPassword: string }) =>
    apiFetch("/auth/reset-password", { method: "POST", body }),
  updateSecurityQuestions: (body: { question1: string; answer1: string; question2: string; answer2: string }) =>
    apiFetch("/auth/me/security-questions", { method: "PATCH", body }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiFetch("/auth/change-password", { method: "POST", body }),
  updateProfile: (name: string) => apiFetch<BackendUser>("/auth/me", { method: "PATCH", body: { name } }),
  updateAvatar: (file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)
    return apiUpload<BackendUser>("/auth/me/avatar", formData, { method: "PATCH" })
  },
}

// ─────────────────────────── USERS (STAFF) ───────────────────────────

export const usersApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<BackendUser>>(`/users${buildQueryString(params)}`),
  get: (id: string) => apiFetch(`/users/${id}`),
  create: (body: unknown) => apiFetch("/users", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/users/${id}`, { method: "PATCH", body }),
  toggleStatus: (id: string) => apiFetch(`/users/${id}/status`, { method: "PATCH" }),
  setPassword: (id: string, newPassword: string) =>
    apiFetch(`/users/${id}/password`, { method: "PATCH", body: { newPassword } }),
  updateAvatar: (id: string, file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)
    return apiUpload(`/users/${id}/avatar`, formData, { method: "PATCH" })
  },
  delete: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── GEOGRAPHY ───────────────────────────

export const geographyApi = {
  listSitios: () => apiFetch("/geography/sitios"),
  addSitio: (name: string) => apiFetch("/geography/sitios", { method: "POST", body: { name } }),
  renameSitio: (id: string, name: string) => apiFetch(`/geography/sitios/${id}`, { method: "PATCH", body: { name } }),
  deleteSitio: (id: string) => apiFetch(`/geography/sitios/${id}`, { method: "DELETE" }),
  addPurok: (sitioId: string, name: string) =>
    apiFetch(`/geography/sitios/${sitioId}/puroks`, { method: "POST", body: { name } }),
  renamePurok: (id: string, name: string) => apiFetch(`/geography/puroks/${id}`, { method: "PATCH", body: { name } }),
  deletePurok: (id: string) => apiFetch(`/geography/puroks/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── RESIDENTS ───────────────────────────

export const residentsApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/residents${buildQueryString(params)}`),
  get: (id: string) => apiFetch(`/residents/${id}`),
  create: (body: unknown) => apiFetch("/residents", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/residents/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiFetch(`/residents/${id}`, { method: "DELETE" }),
  assignTags: (id: string, tags: unknown) => apiFetch(`/residents/${id}/tags`, { method: "PUT", body: { tags } }),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData()
    formData.append("photo", file)
    return apiUpload(`/residents/${id}/photo`, formData)
  },
  // Public/anonymous -- minimal identity-verification lookup used by the
  // certificate-request and incident-report forms.
  searchPublic: (query: string) =>
    apiFetch<{ id: string; fullName: string; purok: string; sitio: string }[]>(
      `/public/residents/search${buildQueryString({ q: query })}`,
    ),
}

// ─────────────────────────── HOUSEHOLDS ───────────────────────────

export const householdsApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/households${buildQueryString(params)}`),
  get: (id: string) => apiFetch(`/households/${id}`),
  create: (body: unknown) => apiFetch("/households", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/households/${id}`, { method: "PATCH", body }),
  archive: (id: string) => apiFetch(`/households/${id}/archive`, { method: "PATCH" }),
  restore: (id: string) => apiFetch(`/households/${id}/restore`, { method: "PATCH" }),
  delete: (id: string) => apiFetch(`/households/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── DOCUMENT TYPES ───────────────────────────

export const documentTypesApi = {
  list: () => apiFetch("/document-types"),
  listPublic: () => apiFetch("/public/document-types"),
  create: (body: unknown) => apiFetch("/document-types", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/document-types/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiFetch(`/document-types/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── CERTIFICATE TEMPLATES ───────────────────────────

export const certificateTemplatesApi = {
  list: () => apiFetch("/certificate-templates"),
  get: (id: string) => apiFetch(`/certificate-templates/${id}`),
  create: (body: unknown) => apiFetch("/certificate-templates", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/certificate-templates/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiFetch(`/certificate-templates/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── CERTIFICATE REQUESTS ───────────────────────────

export const certificateRequestsApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/certificate-requests${buildQueryString(params)}`),
  get: (id: string) => apiFetch(`/certificate-requests/${id}`),
  submitWalkIn: (body: unknown) => apiFetch("/certificate-requests/walk-in", { method: "POST", body }),
  updateStatus: (id: string, body: unknown) =>
    apiFetch(`/certificate-requests/${id}/status`, { method: "PATCH", body }),
  uploadRequirement: (id: string, file: File, name: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("name", name)
    return apiUpload(`/certificate-requests/${id}/requirements`, formData)
  },
  delete: (id: string) => apiFetch(`/certificate-requests/${id}`, { method: "DELETE" }),
  // Public/anonymous
  submitPublic: (body: unknown) => apiFetch("/public/certificate-requests", { method: "POST", body }),
  uploadRequirementPublic: (id: string, file: File, name: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("name", name)
    return apiUpload(`/public/certificate-requests/${id}/requirements`, formData)
  },
  track: (referenceNumber: string) => apiFetch(`/public/certificate-requests/track/${referenceNumber}`),
}

// ─────────────────────────── COMPLAINTS ───────────────────────────

export const complaintsApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/complaints${buildQueryString(params)}`),
  get: (id: string) => apiFetch(`/complaints/${id}`),
  updateStatus: (id: string, body: unknown) => apiFetch(`/complaints/${id}/status`, { method: "PATCH", body }),
  addPhoto: (id: string, formData: FormData) => apiUpload(`/complaints/${id}/photos`, formData),
  // Public/anonymous
  submitPublic: (body: unknown) => apiFetch("/public/complaints", { method: "POST", body }),
  addPhotoPublic: (id: string, formData: FormData) => apiUpload(`/public/complaints/${id}/photos`, formData),
  track: (referenceNumber: string) => apiFetch(`/public/complaints/track/${referenceNumber}`),
}

// ─────────────────────────── BLOTTERS ───────────────────────────

export const blottersApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/blotters${buildQueryString(params)}`),
  get: (id: string) => apiFetch(`/blotters/${id}`),
  create: (body: unknown) => apiFetch("/blotters", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/blotters/${id}`, { method: "PATCH", body }),
  updateStatus: (id: string, body: unknown) => apiFetch(`/blotters/${id}/status`, { method: "PATCH", body }),
  archive: (id: string) => apiFetch(`/blotters/${id}/archive`, { method: "PATCH" }),
  delete: (id: string) => apiFetch(`/blotters/${id}`, { method: "DELETE" }),
  addHearing: (id: string, body: unknown) => apiFetch(`/blotters/${id}/hearings`, { method: "POST", body }),
  updateHearingStatus: (id: string, hearingId: string, body: unknown) =>
    apiFetch(`/blotters/${id}/hearings/${hearingId}`, { method: "PATCH", body }),
  addNote: (id: string, body: unknown) => apiFetch(`/blotters/${id}/notes`, { method: "POST", body }),
}

export const blotterTemplatesApi = {
  list: () => apiFetch("/blotter-templates"),
  get: (id: string) => apiFetch(`/blotter-templates/${id}`),
  create: (body: unknown) => apiFetch("/blotter-templates", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/blotter-templates/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiFetch(`/blotter-templates/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── ANNOUNCEMENTS + ENGAGEMENT ───────────────────────────

export const announcementsApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/announcements${buildQueryString(params)}`),
  get: (id: string, viewerKey?: string) => apiFetch(`/announcements/${id}${buildQueryString({ viewerKey })}`),
  create: (body: unknown) => apiFetch("/announcements", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/announcements/${id}`, { method: "PATCH", body }),
  togglePin: (id: string) => apiFetch(`/announcements/${id}/pin`, { method: "PATCH" }),
  delete: (id: string) => apiFetch(`/announcements/${id}`, { method: "DELETE" }),
  deleteComment: (commentId: string) => apiFetch(`/announcements/comments/${commentId}`, { method: "DELETE" }),
  uploadAttachment: (id: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiUpload(`/announcements/${id}/attachments`, formData)
  },
  addComment: (id: string, body: unknown) => apiFetch(`/announcements/${id}/comments`, { method: "POST", body }),
  addReply: (commentId: string, body: unknown) =>
    apiFetch(`/announcements/comments/${commentId}/replies`, { method: "POST", body }),
  setPostReaction: (id: string, body: unknown) => apiFetch(`/announcements/${id}/reaction`, { method: "PUT", body }),
  setCommentReaction: (commentId: string, body: unknown) =>
    apiFetch(`/announcements/comments/${commentId}/reaction`, { method: "PUT", body }),

  // Public/anonymous mirrors
  listPublished: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/public/announcements${buildQueryString(params)}`),
  getPublic: (id: string, viewerKey?: string) => apiFetch(`/public/announcements/${id}${buildQueryString({ viewerKey })}`),
  addCommentPublic: (id: string, body: unknown) =>
    apiFetch(`/public/announcements/${id}/comments`, { method: "POST", body }),
  addReplyPublic: (commentId: string, body: unknown) =>
    apiFetch(`/public/comments/${commentId}/replies`, { method: "POST", body }),
  setPostReactionPublic: (id: string, body: unknown) =>
    apiFetch(`/public/announcements/${id}/reaction`, { method: "PUT", body }),
  setCommentReactionPublic: (commentId: string, body: unknown) =>
    apiFetch(`/public/comments/${commentId}/reaction`, { method: "PUT", body }),
}

// ─────────────────────────── DIRECTORY (OFFICIALS / EMERGENCY CONTACTS / ACTIVITIES) ───────────────────────────

export const officialsApi = {
  list: () => apiFetch("/officials"),
  listPublic: () => apiFetch("/public/officials"),
  create: (body: unknown) => apiFetch("/officials", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/officials/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiFetch(`/officials/${id}`, { method: "DELETE" }),
}

export const emergencyContactsApi = {
  list: () => apiFetch("/emergency-contacts"),
  listPublic: () => apiFetch("/public/emergency-contacts"),
  create: (body: unknown) => apiFetch("/emergency-contacts", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/emergency-contacts/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiFetch(`/emergency-contacts/${id}`, { method: "DELETE" }),
}

export const activitiesApi = {
  list: () => apiFetch("/activities"),
  listPublic: () => apiFetch("/public/activities"),
  create: (body: unknown) => apiFetch("/activities", { method: "POST", body }),
  update: (id: string, body: unknown) => apiFetch(`/activities/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiFetch(`/activities/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── SETTINGS ───────────────────────────

export const settingsApi = {
  get: () => apiFetch("/settings"),
  getPublic: () => apiFetch("/public/settings"),
  update: (body: unknown) => apiFetch("/settings", { method: "PATCH", body }),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiUpload<{ url: string }>("/settings/upload", formData)
  },
  submitContactForm: (body: unknown) => apiFetch("/public/contact", { method: "POST", body }),
}

// ─────────────────────────── BACKUPS ───────────────────────────

export const backupsApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/backups${buildQueryString(params)}`),
  create: () => apiFetch("/backups", { method: "POST" }),
  downloadUrl: (id: string) => `${process.env.NEXT_PUBLIC_API_URL ?? "/api"}/backups/${id}/download`,
  restore: (id: string) => apiFetch(`/backups/${id}/restore`, { method: "POST" }),
  delete: (id: string) => apiFetch(`/backups/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── ACTIVITY LOGS ───────────────────────────

export const activityLogsApi = {
  list: (params?: ListParams) => apiFetch<PaginatedResult<unknown>>(`/activity-logs${buildQueryString(params)}`),
}

// ─────────────────────────── NOTIFICATIONS ───────────────────────────

export const notificationsApi = {
  list: (params?: ListParams) => apiFetch(`/notifications${buildQueryString(params)}`),
  create: (body: unknown) => apiFetch("/notifications", { method: "POST", body }),
  markRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch("/notifications/read-all", { method: "PATCH" }),
  delete: (id: string) => apiFetch(`/notifications/${id}`, { method: "DELETE" }),
}

// ─────────────────────────── DASHBOARD ───────────────────────────

export const dashboardApi = {
  stats: () => apiFetch("/dashboard/stats"),
  statsPublic: () => apiFetch("/public/stats"),
  revenue: () => apiFetch("/dashboard/revenue"),
  monthlyRevenue: (year: string) => apiFetch(`/dashboard/revenue/monthly?year=${encodeURIComponent(year)}`),
}

// ─────────────────────────── AI ASSISTANT ───────────────────────────

export const aiAssistantApi = {
  chat: (message: string, history?: { role: "user" | "assistant"; text: string }[]) =>
    apiFetch<{ text: string }>("/public/ai-assistant/chat", { method: "POST", body: { message, history } }),
}
