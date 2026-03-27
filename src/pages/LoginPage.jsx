import { useState } from 'react'
import GlassPanel from '../components/common/GlassPanel'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, error, isFirebaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const withBusyState = async (action) => {
    setIsSubmitting(true)
    await action()
    setIsSubmitting(false)
  }

  return (
    <div className="login-page">
      <GlassPanel className="login-panel">
        <h1>Campus Pay V6</h1>
        <p className="login-subtitle">Sign in to continue</p>

        {!isFirebaseConfigured ? (
          <p className="login-warning">
            Firebase config missing. Add VITE_FIREBASE_* variables in your Vercel project and local .env file.
          </p>
        ) : null}

        {error ? <p className="login-error">{error}</p> : null}

        <button
          className="login-btn primary"
          onClick={() => withBusyState(loginWithGoogle)}
          disabled={isSubmitting}
        >
          Continue with Google
        </button>

        <div className="login-divider">or</div>

        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </label>

        <div className="login-actions">
          <button
            className="login-btn"
            onClick={() => withBusyState(() => loginWithEmail(email, password))}
            disabled={isSubmitting}
          >
            Sign In
          </button>
          <button
            className="login-btn"
            onClick={() => withBusyState(() => registerWithEmail(email, password))}
            disabled={isSubmitting}
          >
            Register
          </button>
        </div>

        <button
          className="login-btn ghost"
          onClick={() => withBusyState(loginAsGuest)}
          disabled={isSubmitting}
        >
          Continue as Guest
        </button>
      </GlassPanel>
    </div>
  )
}
