import { NavLink } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 3.5l8 7V20a1.5 1.5 0 0 1-1.5 1.5H14v-6H10v6H5.5A1.5 1.5 0 0 1 4 20z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ExercisesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 12h14M5 17h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const items = [
  { to: '/', label: 'Home', end: true, icon: HomeIcon },
  { to: '/exercises', label: 'Exercises', end: false, icon: ExercisesIcon },
] as const

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-fog/30 bg-panel pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-6xl">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-sm font-bold tracking-wide ${
                isActive ? 'bg-app text-lime' : 'text-fog hover:bg-fog/10'
              }`
            }
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
