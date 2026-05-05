import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../../shared/lib/api'
import type { OrgMember } from '@packages/types'

export function useMembers(orgSlug: string) {
  return useQuery({
    queryKey: ['members', orgSlug],
    queryFn: () =>
      apiFetch<{ ok: true; data: OrgMember[] }>(`/organization/${orgSlug}/members`).then((r) => r.data),
    enabled: !!orgSlug,
  })
}
