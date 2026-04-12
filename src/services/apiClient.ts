// ─────────────────────────────────────────────
//  API Client — HTTP client para backend futuro
//  Substitua BASE_URL e adicione auth headers
//  quando integrar Supabase / REST API
// ─────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options

  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    url = `${url}?${qs}`
  }

  // Inject auth token when available
  const token = typeof window !== 'undefined' ? localStorage.getItem('habitdb-auth-token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  }

  const res = await fetch(url, { ...init, headers })

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR'
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      code    = body?.error?.code    ?? code
      message = body?.error?.message ?? message
    } catch {}
    throw new ApiError(res.status, code, message)
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  get:    <T>(url: string, opts?: RequestOptions) =>
            request<T>(url, { ...opts, method: 'GET' }),
  post:   <T>(url: string, body: unknown, opts?: RequestOptions) =>
            request<T>(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown, opts?: RequestOptions) =>
            request<T>(url, { ...opts, method: 'PUT',  body: JSON.stringify(body) }),
  patch:  <T>(url: string, body: unknown, opts?: RequestOptions) =>
            request<T>(url, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string, opts?: RequestOptions) =>
            request<T>(url, { ...opts, method: 'DELETE' }),
}
