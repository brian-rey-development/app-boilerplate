import { useNavigate } from 'react-router-dom'

export function OrgSwitcher() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      Switch Organization
    </button>
  )
}
