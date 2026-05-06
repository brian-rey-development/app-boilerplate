import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { initSentry, Sentry } from './shared/lib/sentry'
import './index.css'

initSentry()

function ErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Something went wrong</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px', maxWidth: '400px' }}>
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={resetError}
        style={{ padding: '10px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
      >
        Try Again
      </button>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
