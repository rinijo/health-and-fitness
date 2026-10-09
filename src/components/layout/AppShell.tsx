import { Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const { signOutUser } = useAuth()

  return (
    <div className="mx-auto min-h-dvh max-w-6xl pb-24">
      <header className="flex justify-end px-4 pt-4 pb-1">
        <button
          type="button"
          onClick={() => void signOutUser()}
          className="min-h-11 rounded-xl px-3 text-sm font-semibold text-fog/70"
        >
          Sign out
        </button>
      </header>
      <Outlet />
      <BottomNav />
    </div>
  )
}
