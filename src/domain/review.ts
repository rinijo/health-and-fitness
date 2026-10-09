import { parseRepsValue } from '../lib/format'
import type { Exercise } from '../types/exercise'
import type { ExerciseReview, ReviewStatus } from '../types/review'
import type { LoggedExercise, WorkoutLog } from '../types/workoutLog'

function isHard(entry: LoggedExercise): boolean {
  return entry.difficulty === 'hard' || entry.difficulty === 'too_hard'
}

function metPlan(entry: LoggedExercise): boolean {
  if (entry.actualSets < entry.plannedSets) return false
  const planned = parseRepsValue(entry.plannedReps)
  const actual = parseRepsValue(entry.actualReps)
  if (planned === null || actual === null) return entry.actualSets >= entry.plannedSets
  return actual >= planned
}

function failedTarget(entry: LoggedExercise): boolean {
  return !metPlan(entry)
}

function isEasyOrGood(entry: LoggedExercise): boolean {
  return entry.difficulty === 'easy' || entry.difficulty === 'good'
}

export function classifyExercise(logs: LoggedExercise[]): ReviewStatus {
  const recent = logs.slice(0, 3)
  if (recent.length >= 2) {
    const lastTwo = recent.slice(0, 2)
    if (lastTwo.every((entry) => isHard(entry) || failedTarget(entry))) {
      return 'review'
    }
  }

  if (recent.length > 0 && recent.every((entry) => metPlan(entry) && isEasyOrGood(entry))) {
    return 'progressing'
  }

  return 'maintaining'
}

export function reviewExercises(exercises: Exercise[], logs: WorkoutLog[]): ExerciseReview[] {
  const byDateDesc = [...logs].sort((a, b) => b.workoutDate.localeCompare(a.workoutDate))

  return exercises.map((exercise) => {
    const history = byDateDesc.flatMap((log) =>
      log.exercises.filter((entry) => entry.exerciseId === exercise.id),
    )
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      status: classifyExercise(history),
    }
  })
}
