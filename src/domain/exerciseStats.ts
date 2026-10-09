import { parseRepsValue } from '../lib/format'
import type { Plan, PlanExercise } from '../types/plan'
import type { LoggedExercise, WorkoutLog } from '../types/workoutLog'

export interface SessionRow {
  date: string
  entry: LoggedExercise
}

export function sessionsForExercise(exerciseId: string, logs: WorkoutLog[]): SessionRow[] {
  return [...logs]
    .sort((a, b) => b.workoutDate.localeCompare(a.workoutDate))
    .flatMap((log) =>
      log.exercises
        .filter((entry) => entry.exerciseId === exerciseId)
        .map((entry) => ({ date: log.workoutDate, entry })),
    )
}

export function prescriptionsFor(exerciseId: string, plans: Plan[]): PlanExercise[] {
  return plans.flatMap((plan) => plan.exercises.filter((item) => item.exerciseId === exerciseId))
}

export function primaryPrescription(items: PlanExercise[]): PlanExercise | null {
  return items[0] ?? null
}

export function bestSession(entries: LoggedExercise[]): LoggedExercise | undefined {
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

export function planExerciseIds(plans: Plan[]): string[] {
  const ids = new Set<string>()
  for (const plan of plans) {
    for (const item of plan.exercises) ids.add(item.exerciseId)
  }
  return [...ids]
}
