import { ApiError, type ApiEnvelope } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api"

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])
const AUTH_EXEMPT_PATHS = new Set(["/auth/login", "/auth/refresh"])

function readCsrfCookie(): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": readCsrfCookie() ?? "" },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | undefined
  try {
    body = await res.json()
  } catch {
    // no JSON body (e.g. empty 204/file stream) — fall through below
  }

  if (body && "success" in body) {
    if (body.success) return body.data
    throw new ApiError(res.status, body.error.message, body.error.details)
  }

  if (!res.ok) {
    throw new ApiError(res.status, res.statusText || "Request failed")
  }

  return body as T
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** Set true for the retry pass itself, to avoid an infinite refresh loop. */
  _isRetry?: boolean
}

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  options: Omit<ApiFetchOptions, "body">,
  onProgress: (progress: UploadProgress) => void,
): Promise<T> {
  const { _isRetry, headers, ...rest } = options
  const method = (options.method ?? "POST").toUpperCase()
  const finalHeaders = new Headers(headers)
  if (MUTATING_METHODS.has(method)) {
    const csrf = readCsrfCookie()
    if (csrf) finalHeaders.set("X-CSRF-Token", csrf)
  }

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, `${API_URL}${path}`)
    xhr.withCredentials = true
    finalHeaders.forEach((value, key) => xhr.setRequestHeader(key, value))
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress({ loaded: event.loaded, total: event.total, percent: Math.round((event.loaded / event.total) * 100) })
      }
    }
    xhr.onerror = () => reject(new ApiError(0, "Upload failed because of a network error. Please try again."))
    xhr.onabort = () => reject(new ApiError(0, "Upload was cancelled."))
    xhr.onload = () => {
      const response = new Response(xhr.responseText || null, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: { "Content-Type": xhr.getResponseHeader("Content-Type") ?? "application/json" },
      })

      if (response.status === 401 && !_isRetry && !AUTH_EXEMPT_PATHS.has(path)) {
        void refreshSession()
          .then((refreshed) => {
            if (refreshed) {
              return apiFetch<T>(path, { ...rest, method, body: formData, _isRetry: true })
            }
            return parseEnvelope<T>(response)
          })
          .then(resolve, reject)
        return
      }

      void parseEnvelope<T>(response).then(resolve, reject)
    }

    xhr.send(formData)
  })
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, _isRetry, headers, ...rest } = options
  const method = (options.method ?? "GET").toUpperCase()

  const finalHeaders = new Headers(headers)
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json")
  }
  if (MUTATING_METHODS.has(method)) {
    const csrf = readCsrfCookie()
    if (csrf) finalHeaders.set("X-CSRF-Token", csrf)
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    method,
    credentials: "include",
    headers: finalHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  })

  if (res.status === 401 && !_isRetry && !AUTH_EXEMPT_PATHS.has(path)) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _isRetry: true })
    }
  }

  return parseEnvelope<T>(res)
}

/** Multipart upload variant — omits Content-Type so the browser sets the boundary. */
export function apiUpload<T>(
  path: string,
  formData: FormData,
  options: Omit<ApiFetchOptions, "body"> = {},
  onProgress?: (progress: UploadProgress) => void,
) {
  if (onProgress) return uploadWithProgress<T>(path, formData, options, onProgress)
  return apiFetch<T>(path, { ...options, method: options.method ?? "POST", body: formData })
}

export function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return ""
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}
