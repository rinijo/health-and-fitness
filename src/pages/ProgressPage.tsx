import { Link } from 'react-router-dom'
import { planExerciseIds, prescriptionsFor } from '../domain/exerciseStats'
import { PLAN_WEEKDAY, planName, sessionTitle } from '../domain/schedule'
import { useAppData } from '../hooks/useAppData'
import { formatCurrentPrescription, formatWeight } from '../lib/format'
import type { PlanId } from '../types/plan'

const PLAN_ORDER: PlanId[] = ['A', 'B', 'C']

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
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))
  const orderedPlans = PLAN_ORDER.flatMap((id) => {
    const plan = plans.find((item) => item.id === id)
    return plan ? [plan] : []
  })

  return (
    <main className="px-4 pb-8">
      <h1 className="text-3xl font-semibold text-fog">Exercises</h1>
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
                <p className="mt-2 text-fog/80">{formatCurrentPrescription(planned)}</p>
              ) : (
                <p className="mt-2 text-fog/70">No current prescription</p>
              )}
            </Link>
          )
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-fog">Plans</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-fog/20 bg-panel">
          <table className="w-full min-w-[28rem] text-left">
            <thead>
              <tr className="border-b border-fog/20 text-sm text-fog/70">
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Day</th>
                <th className="px-4 py-3 font-semibold">Exercises</th>
              </tr>
            </thead>
            <tbody>
              {orderedPlans.map((plan) => {
                const rows = [...plan.exercises]
                  .sort((a, b) => a.order - b.order)
                  .map((item) => ({
                    name: byId.get(item.exerciseId)?.name ?? item.exerciseId,
                    detail: `${formatWeight(item.weight, item.weightNote)} · ${item.sets} × ${item.reps}`,
                  }))

                return (
                  <tr key={plan.id} className="border-b border-fog/20 last:border-b-0 align-top">
                    <td className="px-4 py-3 font-semibold text-fog whitespace-nowrap">
                      {planName(plan.id)}
                      <span className="mt-1 block text-sm font-normal text-fog/70">
                        {sessionTitle(plan.id)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-fog whitespace-nowrap">{PLAN_WEEKDAY[plan.id]}</td>
                    <td className="px-4 py-3 text-fog">
                      <ol className="list-decimal space-y-1 pl-4">
                        {rows.map((row) => (
                          <li key={row.name}>
                            {row.name}
                            <span className="block text-sm text-fog/70">{row.detail}</span>
                          </li>
                        ))}
                      </ol>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
