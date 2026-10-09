import { useMemo, useState } from 'react'
import { formatDateLabel } from '../../lib/dates'
import { difficultyLabel, formatWeight, parseRepsValue } from '../../lib/format'
import type { Exercise } from '../../types/exercise'
import type { Plan } from '../../types/plan'
import type { LoggedExercise, WorkoutLog } from '../../types/workoutLog'

interface ExerciseProgressProps {
  exercises: Exercise[]
  plans: Plan[]
  logs: WorkoutLog[]
}

const RECENT_LIMIT = 8

export function ExerciseProgress({ exercises, plans, logs }: ExerciseProgressProps) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? '')
  const [showAll, setShowAll] = useState(false)

  const exercise = exercises.find((item) => item.id === exerciseId) ?? exercises[0] ?? null

  const history = useMemo(() => {
    if (!exercise) return []
    return logs
      .slice()
      .sort((a, b) => b.workoutDate.localeCompare(a.workoutDate))
      .flatMap((log) =>
        log.exercises
          .filter((entry) => entry.exerciseId === exercise.id)
          .map((entry) => ({ date: log.workoutDate, entry })),
      )
  }, [exercise, logs])

  const currentPlans = exercise
    ? plans.filter((plan) => plan.exercises.some((item) => item.exerciseId === exercise.id))
    : []

  const oldest = history.at(-1)?.entry
  const best = bestEntry(history.map((item) => item.entry))
  const visible = showAll ? history : history.slice(0, RECENT_LIMIT)

  if (!exercise) {
    return <p className="text-fog/80">No exercises yet.</p>
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-fog">
        Exercise
        <select
          value={exercise.id}
          onChange={(event) => {
            setExerciseId(event.target.value)
            setShowAll(false)
          }}
          className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-panel px-3 text-base text-fog"
        >
          {exercises.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <h2 className="mt-5 text-2xl font-semibold text-fog">{exercise.name}</h2>

      <dl className="mt-4 space-y-3 text-base text-fog">
        <div>
          <dt className="font-semibold">Starting</dt>
          <dd className="text-fog/80">
            {oldest
              ? `${oldest.actualSets} x ${oldest.actualReps} @ ${oldest.actualWeight} kg`
              : 'No history yet'}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Current plan</dt>
          <dd className="text-fog/80">
            {currentPlans.length === 0
              ? 'Not in a current plan'
              : currentPlans.map((plan) => {
                  const planned = plan.exercises.find((item) => item.exerciseId === exercise.id)
                  if (!planned) return null
                  return (
                    <p key={plan.id}>
                      {plan.name}: {planned.sets} x {planned.reps} @{' '}
                      {formatWeight(planned.weight, planned.weightNote)}
                    </p>
                  )
                })}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Best</dt>
          <dd className="text-fog/80">
            {best
              ? `${best.actualSets} x ${best.actualReps} @ ${best.actualWeight} kg`
              : 'No history yet'}
          </dd>
        </div>
      </dl>

      <h3 className="mt-6 text-lg font-semibold text-fog">History</h3>
      {visible.length === 0 ? (
        <p className="mt-2 text-fog/80">No logged results yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-fog/20 text-fog/60">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Weight</th>
                <th className="py-2 pr-3 font-medium">Reps</th>
                <th className="py-2 pr-3 font-medium">Sets</th>
                <th className="py-2 pr-3 font-medium">Difficulty</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ date, entry }) => (
                <tr key={`${date}-${entry.exerciseId}`} className="border-b border-fog/10">
                  <td className="py-3 pr-3">{formatDateLabel(date)}</td>
                  <td className="py-3 pr-3">{entry.actualWeight} kg</td>
                  <td className="py-3 pr-3">{entry.actualReps}</td>
                  <td className="py-3 pr-3">{entry.actualSets}</td>
                  <td className="py-3 pr-3">{difficultyLabel(entry.difficulty)}</td>
                  <td className="py-3">{entry.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showAll && history.length > RECENT_LIMIT ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 min-h-12 w-full rounded-xl border border-fog/30 font-semibold text-fog"
        >
          View all records
        </button>
      ) : null}
    </div>
  )
}

function bestEntry(entries: LoggedExercise[]): LoggedExercise | undefined {
  return entries.reduce<LoggedExercise | undefined>((best, entry) => {
    if (!best) return entry
    if (entry.actualWeight !== best.actualWeight) {
      return entry.actualWeight > best.actualWeight ? entry : best
    }
    const entryReps = parseRepsValue(entry.actualReps) ?? 0
    const bestReps = parseRepsValue(best.actualReps) ?? 0
    if (entryReps !== bestReps) return entryReps > bestReps ? entry : best
    return entry.actualSets > best.actualSets ? entry : best
  }, undefined)
}
