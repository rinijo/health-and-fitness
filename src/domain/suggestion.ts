import { parseRepsValue } from '../lib/format'
import type { WeightNote } from '../types/plan'
import type { LoggedExercise } from '../types/workoutLog'

const START_REPS = 8
const TOP_REPS = 12

function isHard(entry: LoggedExercise): boolean {
  return entry.difficulty === 'hard' || entry.difficulty === 'too_hard'
}

function hasRepsInReserve(entry: LoggedExercise): boolean {
  return entry.difficulty === 'easy' || entry.difficulty === 'good'
}

function reachedPlannedReps(entry: LoggedExercise, plannedReps: string): boolean {
  const planned = parseRepsValue(plannedReps) ?? parseRepsValue(entry.plannedReps)
  const actual = parseRepsValue(entry.actualReps)
  if (planned === null || actual === null) return false
  return actual >= planned
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

function hitWithTechnique(entries: LoggedExercise[], plannedReps: string): boolean {
  return entries.every(
    (entry) => reachedPlannedReps(entry, plannedReps) && hasRepsInReserve(entry),
  )
}

export function progressSuggestion(
  plannedReps: string,
  recentNewestFirst: LoggedExercise[],
  weightNote: WeightNote = '',
): string {
  if (recentNewestFirst.length < 3) {
    return 'Log a few more sessions before a suggestion.'
  }

  const lastThree = recentNewestFirst.slice(0, 3)
  const strugglingCount = lastThree.filter(
    (entry) => isHard(entry) || !reachedPlannedReps(entry, plannedReps),
  ).length

  if (strugglingCount >= 2) {
    return 'Keep the current weight rather than increasing it.'
  }

  if (isTimed(plannedReps)) {
    if (!hitWithTechnique(lastThree, plannedReps)) {
      return 'Stay with the current prescription for now. You remain in control of the plan.'
    }
    return 'You have been hitting the planned time. Consider a small increase in load or time next session.'
  }

  const currentReps = parseRepsValue(plannedReps)
  if (currentReps === null) {
    return 'Stay with the current prescription for now. You remain in control of the plan.'
  }

  const startLabel = repsWithSuffix(plannedReps, START_REPS)
  const topLabel = repsWithSuffix(plannedReps, TOP_REPS)

  if (currentReps < START_REPS) {
    if (!hitWithTechnique(lastThree, plannedReps)) {
      return 'Stay with the current prescription for now. You remain in control of the plan.'
    }
    return `Start at ${startLabel} and climb one rep at a time toward ${topLabel} before adding weight.`
  }

  if (currentReps < TOP_REPS) {
    if (!hitWithTechnique(lastThree, plannedReps)) {
      return 'Stay with the current prescription for now. You remain in control of the plan.'
    }
    const nextLabel = repsWithSuffix(plannedReps, currentReps + 1)
    return `You've consistently reached ${plannedReps}. Consider ${nextLabel} next session (8 → 9 → 10 → 11 → 12). Add weight only after ${topLabel} with good technique and about 2–3 reps in reserve.`
  }

  if (!hitWithTechnique(lastThree, plannedReps)) {
    return `Stay at ${topLabel} until you can perform them with good technique and still have about 2–3 reps in reserve.`
  }

  if (!canAddLoad(weightNote)) {
    return `You've reached ${topLabel} with good technique and about 2–3 reps in reserve. Consider adding a small load next session and returning to ${startLabel}.`
  }

  return `You've reached ${topLabel} with good technique and about 2–3 reps in reserve. Consider increasing the weight next session and returning to ${startLabel}.`
}
