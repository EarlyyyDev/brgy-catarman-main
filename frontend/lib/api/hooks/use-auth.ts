import { useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toAuthSession } from "@/lib/api/adapters/auth.adapter"
import { ApiError } from "@/lib/api/types"
import type { AuthSession } from "@/types"

/** Session hydration — the single source of truth for "who's logged in."
 * Re-derives from the httpOnly access-token cookie via GET /api/auth/me on
 * every mount, since client JS can never read that cookie directly. */
export function useMe() {
  return useQuery<AuthSession, ApiError>({
    queryKey: qk.auth.me,
    queryFn: async () => toAuthSession(await authApi.me()),
    retry: false,
    staleTime: 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useApiMutation<AuthSession, { email: string; password: string; rememberMe?: boolean }>({
    mutationFn: async (body) => toAuthSession(await authApi.login(body)),
    showErrorToast: false,
    onSuccess: (session) => {
      queryClient.setQueryData(qk.auth.me, session)
    },
  })
}

export function useForgotPasswordQuestions() {
  return useApiMutation<{ question1: string; question2: string }, string>({
    mutationFn: (email) => authApi.getForgotPasswordQuestions(email),
    showErrorToast: false,
  })
}

export function useResetPassword() {
  return useApiMutation<unknown, { email: string; answer1: string; answer2: string; newPassword: string }>({
    mutationFn: (body) => authApi.resetPassword(body),
    showErrorToast: false,
  })
}

export function useUpdateSecurityQuestions() {
  const queryClient = useQueryClient()
  return useApiMutation<unknown, { question1: string; answer1: string; question2: string; answer2: string }>({
    mutationFn: (body) => authApi.updateSecurityQuestions(body),
    showErrorToast: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.auth.me })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useApiMutation<unknown, void>({
    mutationFn: () => authApi.logout(),
    showErrorToast: false,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useChangeOwnPassword() {
  return useApiMutation<unknown, { currentPassword: string; newPassword: string }>({
    mutationFn: (body) => authApi.changePassword(body),
    showErrorToast: false,
  })
}

/** Self-service profile edits -- every role can rename/re-photo themselves
 * via /auth/me, unlike the admin-only /users/:id routes used by the Staff
 * Accounts page. Keeps the cached session in sync so the topbar/sidebar
 * reflect the change immediately without a refetch. */
export function useUpdateOwnProfile() {
  const queryClient = useQueryClient()
  return useApiMutation<AuthSession, string>({
    mutationFn: async (name) => toAuthSession(await authApi.updateProfile(name)),
    onSuccess: (session) => {
      queryClient.setQueryData(qk.auth.me, session)
    },
  })
}

export function useUpdateOwnAvatar() {
  const queryClient = useQueryClient()
  return useApiMutation<AuthSession, File>({
    mutationFn: async (file) => toAuthSession(await authApi.updateAvatar(file)),
    onSuccess: (session) => {
      queryClient.setQueryData(qk.auth.me, session)
    },
  })
}

export function useLogoutAll() {
  const queryClient = useQueryClient()
  return useApiMutation<unknown, void>({
    mutationFn: () => authApi.logoutAll(),
    showErrorToast: false,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
