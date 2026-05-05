import type { OrgMember } from '@packages/types'

export function MemberList({ members }: { members: OrgMember[] }) {
  return (
    <ul className="divide-y">
      {members.map((m) => (
        <li key={m.userId} className="py-3 flex justify-between items-center">
          {/* TODO: join user profile data to display name/email instead of raw UUID */}
          <span className="font-medium">{m.userId}</span>
          <span className="text-sm text-muted-foreground capitalize">{m.role}</span>
        </li>
      ))}
    </ul>
  )
}
