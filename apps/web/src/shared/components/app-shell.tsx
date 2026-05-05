import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/use-auth'
import { OrgSwitcher } from './org-switcher'
import { useOrgStore } from '../../features/organization/stores/organization-store'
import { Button } from '@packages/ui'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const setSelectedOrg = useOrgStore((s) => s.setSelectedOrg)

  const match = location.pathname.match(/^\/dashboard\/([^/]+)/)
  const slug = match?.[1] ?? null
  setSelectedOrg(slug)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {session && (
        <header className="border-b">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-semibold">
                Home
              </Link>
              {slug && (
                <>
                  <Link to={`/dashboard/${slug}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link to={`/dashboard/${slug}/members`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Members
                  </Link>
                  <Link to={`/dashboard/${slug}/settings`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Settings
                  </Link>
                  <OrgSwitcher />
                </>
              )}
            </nav>
            <div className="flex items-center gap-4">
              {session.user?.email && (
                <span className="text-sm text-muted-foreground">{session.user.email}</span>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>
      )}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
