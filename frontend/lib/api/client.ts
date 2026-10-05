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

/** Multipart upload variant — omits Content-Type so the browser sets the multipart boundary. */
export function apiUpload<T>(path: string, formData: FormData, options: Omit<ApiFetchOptions, "body"> = {}) {
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
