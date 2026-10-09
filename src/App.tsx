import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { useAuth } from './lib/auth'
import { ExerciseDetailPage } from './pages/ExerciseDetailPage'
import { HomePage } from './pages/HomePage'
import { ProgressPage } from './pages/ProgressPage'
import { SignInPage } from './pages/SignInPage'

function LegacyExerciseRedirect() {
  const { exerciseId } = useParams()
  return <Navigate to={`/exercises/${exerciseId}`} replace />
}

export function App() {
  const { user, ready } = useAuth()

  if (!ready) {
    return <p className="px-5 py-16 text-center text-fog/80">Loading…</p>
  }

  if (!user) {
    return <SignInPage />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/exercises" element={<ProgressPage />} />
        <Route path="/exercises/:exerciseId" element={<ExerciseDetailPage />} />
        <Route path="/progress" element={<Navigate to="/exercises" replace />} />
        <Route path="/progress/:exerciseId" element={<LegacyExerciseRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
