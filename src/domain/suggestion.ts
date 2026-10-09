import { parseRepsValue } from '../lib/format'
import type { WeightNote } from '../types/plan'
import type { LoggedExercise } from '../types/workoutLog'

const START_REPS = 8
const TOP_REPS = 12

export interface SuggestionPlan {
  reps: string
  weight: number
  sets: number
  weightNote: WeightNote
}

function isHard(entry: LoggedExercise): boolean {
  return entry.difficulty === 'hard' || entry.difficulty === 'too_hard'
}

function hasRepsInReserve(entry: LoggedExercise): boolean {
  return entry.difficulty === 'easy' || entry.difficulty === 'good'
}

function reachedTarget(entry: LoggedExercise, planned: SuggestionPlan): boolean {
  if (entry.actualSets < planned.sets) return false
  const plannedReps = parseRepsValue(planned.reps) ?? parseRepsValue(entry.plannedReps)
  const actual = parseRepsValue(entry.actualReps)
  if (plannedReps === null || actual === null) return false
  return actual >= plannedReps
}

function isTimed(reps: string): boolean {
  return /\bsec\b/i.test(reps) || /\bmin\b/i.test(reps)
}

function repsWithSuffix(plannedReps: string, count: number): string {
  const suffix = plannedReps.replace(/^\d+(?:\.\d+)?/, '')
  return `${count}${suffix}`
}

function canAddLoad(weightNote: WeightNote): boolean {
  return weightNote !== 'bodyweight' && weightNote !== 'light resistance band'
}

function hitWithTechnique(entries: LoggedExercise[], planned: SuggestionPlan): boolean {
  return entries.every((entry) => reachedTarget(entry, planned) && hasRepsInReserve(entry))
}

export function progressSuggestion(
  planned: SuggestionPlan,
  recentNewestFirst: LoggedExercise[],
): string {
  const atThisWeight = recentNewestFirst.filter(
    (entry) => entry.actualWeight === planned.weight,
  )

  if (atThisWeight.length < 3) {
    return recentNewestFirst.length >= 3
      ? 'Log a few more sessions at this weight before a suggestion.'
      : 'Log a few more sessions before a suggestion.'
  }

  const lastThree = atThisWeight.slice(0, 3)
  const strugglingCount = lastThree.filter(
    (entry) => isHard(entry) || !reachedTarget(entry, planned),
  ).length

  if (strugglingCount >= 2) {
    return 'Keep the current weight rather than increasing it.'
  }

  if (isTimed(planned.reps)) {
    if (!hitWithTechnique(lastThree, planned)) {
      return 'Stay with the current prescription for now. You remain in control of the plan.'
    }
    return 'You have been hitting the planned time. Consider a small increase in load or time next session.'
  }

  const currentReps = parseRepsValue(planned.reps)
  if (currentReps === null) {
    return 'Stay with the current prescription for now. You remain in control of the plan.'
  }

  const startLabel = repsWithSuffix(planned.reps, START_REPS)
  const topLabel = repsWithSuffix(planned.reps, TOP_REPS)

  if (currentReps < START_REPS) {
    if (!hitWithTechnique(lastThree, planned)) {
      return 'Stay with the current prescription for now. You remain in control of the plan.'
    }
    return `Start at ${startLabel} and climb one rep at a time toward ${topLabel} before adding weight.`
  }

  if (currentReps < TOP_REPS) {
    if (!hitWithTechnique(lastThree, planned)) {
      return 'Stay with the current prescription for now. You remain in control of the plan.'
    }
    const nextLabel = repsWithSuffix(planned.reps, currentReps + 1)
    return `You've consistently reached ${planned.reps}. Consider ${nextLabel} next session (8 → 9 → 10 → 11 → 12). Add weight only after ${topLabel} with good technique and about 2–3 reps in reserve.`
  }

  if (!hitWithTechnique(lastThree, planned)) {
    return `Stay at ${topLabel} until you can perform them with good technique and still have about 2–3 reps in reserve.`
  }

  if (!canAddLoad(planned.weightNote)) {
    return `You've reached ${topLabel} with good technique and about 2–3 reps in reserve. Consider adding a small load next session and returning to ${startLabel}.`
  }

  return `You've reached ${topLabel} with good technique and about 2–3 reps in reserve. Consider increasing the weight next session and returning to ${startLabel}.`
}
