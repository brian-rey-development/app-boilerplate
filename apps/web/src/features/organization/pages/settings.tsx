import { useParams } from 'react-router-dom'
import { useOrganization } from '../hooks/use-organization'

export function SettingsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: org, isPending } = useOrganization(slug ?? '')

  if (isPending) return <p>Loading...</p>
  if (!org) return <p>Organization not found.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p>Manage settings for {org.name}.</p>
    </div>
  )
}
