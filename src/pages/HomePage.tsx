import { useMemo, useState } from 'react'
import { CardioSession } from '../components/cardio/CardioSession'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { LogResultForm } from '../components/workout/LogResultForm'
import { dayKindForDate, planIdForDate, todayHeadline } from '../domain/schedule'
import { useAppData } from '../hooks/useAppData'
import { useAuth } from '../lib/auth'
import { firstName, formatTodayHeading, localDateId } from '../lib/dates'
import { upsertLoggedExercise } from '../services/workoutLogs'
import type { Exercise } from '../types/exercise'
import type { PlanExercise } from '../types/plan'
import type { Difficulty } from '../types/workoutLog'

function checklistStorageKey(dateId: string) {
  return `home-checklist:${dateId}`
}

function readCheckedIds(dateId: string): string[] {
  try {
    const raw = sessionStorage.getItem(checklistStorageKey(dateId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function writeCheckedIds(dateId: string, ids: string[]) {
  try {
    sessionStorage.setItem(checklistStorageKey(dateId), JSON.stringify(ids))
  } catch {
    // Ignore quota or private-mode write failures.
  }
}

export function HomePage() {
  const { user } = useAuth()
  const { exercises, plans, warmup, logs, loading, error, reload, setLogs } = useAppData()
  const todayId = localDateId()
  const [checkedIds, setCheckedIds] = useState<string[]>(() => readCheckedIds(todayId))
  const [logging, setLogging] = useState<{ exercise: Exercise; planned: PlanExercise } | null>(null)
  const todayPlanId = planIdForDate()
  const todayKind = dayKindForDate()
  const todayPlan = plans.find((plan) => plan.id === todayPlanId) ?? null
  const todayLog = logs.find((log) => log.id === todayId) ?? null
  const loggedIds = new Set(todayLog?.exercises.map((entry) => entry.exerciseId) ?? [])
  const name = firstName(user?.displayName, user?.email)

  const warmupRows = useMemo(() => {
    if (!warmup) return []
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))
    return [...warmup.exercises]
      .sort((a, b) => a.order - b.order)
      .flatMap((planned) => {
        const exercise = byId.get(planned.exerciseId)
        return exercise ? [{ exercise, planned }] : []
      })
  }, [exercises, warmup])

  const rows = useMemo(() => {
    if (!todayPlan) return []
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))
    return [...todayPlan.exercises]
      .sort((a, b) => a.order - b.order)
      .flatMap((planned) => {
        const exercise = byId.get(planned.exerciseId)
        return exercise ? [{ exercise, planned }] : []
      })
  }, [exercises, todayPlan])

  function toggleChecked(id: string, checked: boolean) {
    setCheckedIds((current) => {
      const next = checked
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id)
      writeCheckedIds(todayId, next)
      return next
    })
  }

  async function saveLog(input: {
    actualWeight: number
    actualReps: string
    actualSets: number
    difficulty: Difficulty
    notes: string
  }) {
    if (!logging || !todayPlanId) return
    const next = await upsertLoggedExercise(todayPlanId, {
      exerciseId: logging.exercise.id,
      exerciseName: logging.exercise.name,
      plannedWeight: logging.planned.weight,
      plannedReps: logging.planned.reps,
      plannedSets: logging.planned.sets,
      ...input,
    })
    setLogs((current) => {
      const others = current.filter((log) => log.id !== next.id)
      return [next, ...others].sort((a, b) => b.workoutDate.localeCompare(a.workoutDate))
    })
    setLogging(null)
  }

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

  return (
    <main className="px-4">
      <section className="rounded-2xl border border-fog/20 bg-panel p-5">
        <h1 className="text-3xl font-semibold tracking-tight text-fog">Welcome, {name}</h1>
        <p className="mt-2 text-lg text-fog/80">Today is {formatTodayHeading()}</p>
        <p className="mt-3 text-xl font-medium text-lime">{todayHeadline(todayPlanId)}</p>
      </section>

      {todayKind === 'cardio' ? <CardioSession /> : null}

      {todayPlan ? (
        <>
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-fog">Warm-up</h2>
            {warmupRows.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-fog/30 p-4 text-fog/70">
                No warm-up exercises yet.
              </p>
            ) : (
              <div className="card-grid mt-3">
                {warmupRows.map(({ exercise, planned }) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    planned={planned}
                    checked={checkedIds.includes(`warmup-${exercise.id}`)}
                    showLog={false}
                    showWeight={false}
                    onCheck={(checked) => toggleChecked(`warmup-${exercise.id}`, checked)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-fog">Workout</h2>
            <div className="card-grid mt-3">
              {rows.map(({ exercise, planned }) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  planned={planned}
                  checked={checkedIds.includes(exercise.id)}
                  logged={loggedIds.has(exercise.id)}
                  onCheck={(checked) => toggleChecked(exercise.id, checked)}
                  onLog={() => setLogging({ exercise, planned })}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {logging ? (
        <LogResultForm
          exerciseName={logging.exercise.name}
          planned={logging.planned}
          weightNote={logging.planned.weightNote}
          onCancel={() => setLogging(null)}
          onSave={saveLog}
        />
      ) : null}
    </main>
  )
}
