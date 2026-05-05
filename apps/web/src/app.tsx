import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/use-auth'
import { useOrganizations } from './features/organization/hooks/use-organization'
import { apiFetch } from './shared/lib/api'
import { LoginPage } from './features/auth/pages/login'
import { RegisterPage } from './features/auth/pages/register'
import { DashboardPage } from './features/organization/pages/dashboard'
import { SettingsPage } from './features/organization/pages/settings'
import { MembersPage } from './features/organization/pages/members'
import { AppShell } from './shared/components/app-shell'
import { Button, Input } from '@packages/ui'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function OrgSelectPage() {
  const { data: orgs, isPending, error } = useOrganizations()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  if (isPending) return <p className="p-8 text-center">Loading organizations...</p>

  if (error) {
    return (
      <div className="max-w-md mx-auto space-y-4 text-center">
        <p className="text-red-600">Failed to load organizations.</p>
        <Button onClick={() => navigate(0)}>Retry</Button>
      </div>
    )
  }

  if (orgs && orgs.length > 0) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Select Organization</h1>
        <div className="space-y-2">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => navigate(`/dashboard/${org.slug}`)}
              className="w-full text-left p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <p className="font-semibold">{org.name}</p>
              <p className="text-sm text-muted-foreground">{org.slug}</p>
            </button>
          ))}
        </div>
        <div className="text-center">
          <Button variant="outline" onClick={() => setShowCreate(true)}>
            Create New Organization
          </Button>
        </div>
      </div>
    )
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const org = await apiFetch<{ data: { slug: string } }>('/organization', {
        method: 'POST',
        body: { name, slug },
      })
      navigate(`/dashboard/${org.data.slug}`)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create organization')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {showCreate || !orgs?.length ? (
        <>
          <h1 className="text-2xl font-bold">Create Your First Organization</h1>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium">Organization Name</label>
              <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="org-slug" className="block text-sm font-medium">Slug</label>
              <Input id="org-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="my-org" />
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">You don't have any organizations yet.</p>
          <Button onClick={() => setShowCreate(true)}>Create Your First Organization</Button>
        </div>
      )}
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <p className="p-8 text-center">Loading...</p>

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/dashboard" element={isAuthenticated ? <OrgSelectPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/:slug" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/:slug/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/:slug/members" element={isAuthenticated ? <MembersPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
