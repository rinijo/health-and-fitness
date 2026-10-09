import { Link } from 'react-router-dom'
import { planExerciseIds, prescriptionsFor } from '../domain/exerciseStats'
import { useAppData } from '../hooks/useAppData'
import { formatWeight } from '../lib/format'

export function ProgressPage() {
  const { exercises, plans, loading, error, reload } = useAppData()

  if (loading) {
    return <p className="px-4 py-8 text-base text-fog/80">Loading…</p>
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <p className="text-base text-lime">{error}</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="mt-4 min-h-12 rounded-xl bg-lime px-4 font-semibold text-app"
        >
          Try again
        </button>
      </div>
    )
  }

  const ids = new Set(planExerciseIds(plans))
  const strengthExercises = exercises.filter((exercise) => ids.has(exercise.id))

  return (
    <main className="px-4">
      <h1 className="text-3xl font-semibold text-fog">Exercises</h1>
      <p className="mt-2 text-fog/80">Open an exercise for history, media, and a suggestion. Changes stay in your control.</p>
      <div className="card-grid mt-5">
        {strengthExercises.map((exercise) => {
          const planned = prescriptionsFor(exercise.id, plans)[0]
          return (
            <Link
              key={exercise.id}
              to={`/exercises/${exercise.id}`}
              className="rounded-2xl border border-fog/20 bg-panel p-4"
            >
              <h2 className="text-xl font-semibold text-fog">{exercise.name}</h2>
              {planned ? (
                <p className="mt-2 text-fog/80">
                  {formatWeight(planned.weight, planned.weightNote)} · {planned.sets} sets ·{' '}
                  {planned.reps} reps
                </p>
              ) : (
                <p className="mt-2 text-fog/70">No current prescription</p>
              )}
            </Link>
          )
        })}
      </div>
    </main>
  )
}
