import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { ApiError } from "./types"

interface UseApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn"> {
  mutationFn: (variables: TVariables) => Promise<TData>
  /** Query keys to invalidate on success. Can depend on the mutation result/variables. */
  invalidates?: QueryKey[] | ((data: TData, variables: TVariables) => QueryKey[])
  /** Toast shown on success. Omit for silent success. */
  successMessage?: string | ((data: TData, variables: TVariables) => string)
  /** Set false to suppress the default error toast (e.g. when the caller renders inline form errors instead). */
  showErrorToast?: boolean
}

export function useApiMutation<TData, TVariables = void>({
  mutationFn,
  invalidates,
  successMessage,
  showErrorToast = true,
  onSuccess,
  onError,
  ...options
}: UseApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient()

  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, onMutateResult, context) => {
      const keys = typeof invalidates === "function" ? invalidates(data, variables) : invalidates
      keys?.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))

      if (successMessage) {
        toast.success(typeof successMessage === "function" ? successMessage(data, variables) : successMessage)
      }

      onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      if (showErrorToast) {
        toast.error(error instanceof ApiError ? error.message : "Something went wrong. Please try again.")
      }
      onError?.(error, variables, onMutateResult, context)
    },
    ...options,
  })
}
