import { supabase } from './supabase'
import { useOrgStore } from '../../features/organization/stores/organization-store'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const TIMEOUT_MS = 10_000

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const orgId = useOrgStore.getState().selectedOrgId
    if (orgId) {
      headers['x-organization-id'] = orgId
    }

    const res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '')
      throw new Error(`API ${res.status}${errorBody ? `: ${errorBody}` : ''}`)
    }

    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}
