import { useParams } from 'react-router-dom'
import { useOrganization } from '../hooks/use-organization'
import { useMembers } from '../hooks/use-members'
import { MemberList } from '../components/member-list'

export function DashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: org, isPending } = useOrganization(slug ?? '')
  const { data: members } = useMembers(slug ?? '')

  if (isPending) return <p>Loading...</p>
  if (!org) return <p>Organization not found.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{org.name}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        {members ? <MemberList members={members} /> : <p>Loading members...</p>}
      </section>
    </div>
  )
}
