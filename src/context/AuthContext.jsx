import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  initializeAuth,
  loginAsGuest,
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
} from '../services/authService'
import { isFirebaseConfigured } from '../services/firebase-config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribe = () => {}

    const bootstrap = async () => {
      try {
        await initializeAuth()
        unsubscribe = subscribeToAuthChanges((nextUser) => {
          setUser(nextUser)
          setLoading(false)
        })
      } catch (err) {
        setError(err?.message || 'Unable to initialize auth service.')
        setLoading(false)
      }
    }

    bootstrap()

    return () => unsubscribe()
  }, [])

  const runAuthAction = async (action) => {
    setError('')
    try {
      const result = await action()
      if (!result?.ok) {
        if (result?.reason === 'missing_firebase_env') {
          setError('Firebase env is missing on this deploy. Add VITE_FIREBASE_* in Vercel and redeploy.')
        } else {
          setError('Authentication is not available right now. Please try guest mode.')
        }
      } else if (result?.mode === 'local-guest' && !isFirebaseConfigured) {
        setError('Firebase is not configured yet. You are signed in with local guest mode.')
      }
      return result
    } catch (err) {
      if (err?.code === 'auth/configuration-not-found') {
        setError('Firebase Auth is not enabled/configured for this project. Enable Google/Anonymous providers in Firebase Console.')
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase Auth. Add your Vercel domain in Authorized domains.')
      } else {
        setError(err?.message || 'Authentication failed.')
      }
      return { ok: false }
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isFirebaseConfigured,
      loginWithGoogle: () => runAuthAction(signInWithGoogle),
      loginWithEmail: (email, password) => runAuthAction(() => loginWithEmail(email, password)),
      registerWithEmail: (email, password) => runAuthAction(() => registerWithEmail(email, password)),
      loginAsGuest: () => runAuthAction(loginAsGuest),
      logout: () => runAuthAction(signOutUser),
      clearError: () => setError(''),
    }),
    [user, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
