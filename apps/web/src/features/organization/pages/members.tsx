import { useParams } from 'react-router-dom'
import { useMembers } from '../hooks/use-members'
import { MemberList } from '../components/member-list'

export function MembersPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: members, isPending } = useMembers(slug ?? '')

  if (isPending) return <p>Loading...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Members</h1>
      {members && members.length > 0 ? (
        <MemberList members={members} />
      ) : (
        <p className="text-muted-foreground">No members yet.</p>
      )}
    </div>
  )
}
