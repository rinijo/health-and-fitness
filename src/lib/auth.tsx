import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isAllowedUser } from './allowedUser'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'

interface AuthContextValue {
  user: User | null
  ready: boolean
  error: string | null
  signIn: () => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function authMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code === 'auth/unauthorized-domain') {
    return 'This site is not an authorized domain. In Firebase Authentication settings, add localhost (and rinijo.github.io for GitHub Pages). Use http://localhost:5173 rather than 127.0.0.1.'
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled. In Firebase Authentication, enable the Google provider.'
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'The Google window was closed before sign-in finished. Try again.'
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Sign-in was cancelled. Try again.'
  }
  const message = error instanceof Error ? error.message : 'Google sign-in failed.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser && !isAllowedUser(nextUser)) {
        setError('This Google account is not allowed to use this app.')
        void signOut(auth)
        return
      }
      if (nextUser) setError(null)
      setUser(nextUser)
      setReady(true)
    })

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user && !isAllowedUser(result.user)) {
          setError('This Google account is not allowed to use this app.')
          return signOut(auth)
        }
        if (result?.user) setError(null)
      })
      .catch((cause: unknown) => {
        setError(authMessage(cause))
      })

    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      error,
      signIn: async () => {
        setError(null)
        const auth = getFirebaseAuth()
        const provider = new GoogleAuthProvider()
        try {
          await signInWithPopup(auth, provider)
        } catch (cause: unknown) {
          const code = typeof cause === 'object' && cause && 'code' in cause ? String(cause.code) : ''
          if (code === 'auth/popup-blocked') {
            await signInWithRedirect(auth, provider)
            return
          }
          setError(authMessage(cause))
        }
      },
      signOutUser: async () => {
        await signOut(getFirebaseAuth())
      },
    }),
    [error, ready, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
