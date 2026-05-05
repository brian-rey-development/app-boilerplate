import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../../shared/lib/supabase'
import { Button } from '@packages/ui'
import { Input } from '@packages/ui'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); return }

    navigate('/dashboard')
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setError(null)
    const { error: err } = await supabase.auth.signInWithOAuth({ provider })
    if (err) setError(err.message)
  }

  async function handleResetPassword() {
    if (!email) { setError('Enter your email address first.'); return }
    setError(null)
    setResetSent(false)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email)
    if (err) { setError(err.message); return }
    setResetSent(true)
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {resetSent && <p className="text-sm text-green-600">Check your email for password reset instructions.</p>}
        <Button type="submit" className="w-full">Sign In</Button>
      </form>

      <div className="space-y-2">
        <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth('google')}>
          Continue with Google
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth('github')}>
          Continue with GitHub
        </Button>
      </div>

      <div className="text-sm text-center space-y-1">
        <button type="button" onClick={handleResetPassword} className="text-primary hover:underline">
          Forgot password?
        </button>
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
