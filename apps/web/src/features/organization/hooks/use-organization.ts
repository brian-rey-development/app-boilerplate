import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../../shared/lib/api'
import type { Organization } from '@packages/types'

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiFetch<{ ok: true; data: Organization[] }>('/organization').then((r) => r.data),
  })
}

export function useOrganization(slug: string) {
  return useQuery({
    queryKey: ['organization', slug],
    queryFn: () => apiFetch<{ ok: true; data: Organization }>(`/organization/${slug}`).then((r) => r.data),
    enabled: !!slug,
  })
}
