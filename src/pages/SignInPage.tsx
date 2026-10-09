import { isFirebaseConfigured } from '../lib/firebase'
import { useAuth } from '../lib/auth'

export function SignInPage() {
  const { signIn, error } = useAuth()

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-fog">Strength Training</h1>
      <p className="mt-3 text-base leading-6 text-fog/80">
        Sign in with Google to see today&apos;s workout and log results.
      </p>

      {!isFirebaseConfigured ? (
        <p className="mt-8 rounded-2xl border border-fog/30 bg-panel p-4 text-base text-fog">
          Firebase is not configured. Copy <code>.env.example</code> to <code>.env</code> and add
          your project values.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void signIn()}
          className="mt-8 min-h-14 rounded-2xl bg-lime px-5 text-lg font-semibold text-app"
        >
          Sign in with Google
        </button>
      )}

      {error ? <p className="mt-5 rounded-2xl border border-fog/30 bg-panel p-4 text-base text-fog">{error}</p> : null}
    </main>
  )
}
