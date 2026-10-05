export interface ApiEnvelopeSuccess<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiEnvelopeError {
  success: false
  error: {
    message: string
    details?: unknown
  }
}

export type ApiEnvelope<T> = ApiEnvelopeSuccess<T> | ApiEnvelopeError

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}
