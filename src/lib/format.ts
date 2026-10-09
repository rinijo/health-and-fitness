import type { PlanExercise, WeightNote } from '../types/plan'

export function formatWeight(weight: number, weightNote: WeightNote | string = ''): string {
  if (weightNote === 'bodyweight' || (weight === 0 && weightNote !== 'light resistance band')) {
    return 'Bodyweight'
  }
  if (weightNote === 'light resistance band') {
    return 'Light band'
  }
  if (weightNote === 'each hand') {
    return `${weight} kg each hand`
  }
  return `${weight} kg`
}

export function formatCurrentPrescription(planned: PlanExercise): string {
  const weight =
    planned.weightNote === 'bodyweight' ||
    (planned.weight === 0 && planned.weightNote !== 'light resistance band')
      ? 'Bodyweight'
      : planned.weightNote === 'light resistance band'
        ? 'Light band'
        : planned.weightNote === 'each hand'
          ? `${planned.weight}kg each hand`
          : `${planned.weight}kg`
  const timed = /\b(sec|min)\b/i.test(planned.reps)
  const reps = timed ? planned.reps : `${planned.reps} reps`
  return `Current: ${weight} - ${reps} - ${planned.sets} sets`
}

export function parseRepsValue(reps: string): number | null {
  if (!reps) return null
  const timed = reps.match(/(\d+(?:\.\d+)?)\s*sec/i)
  if (timed) return Number(timed[1])
  const numeric = reps.match(/(\d+(?:\.\d+)?)/)
  return numeric ? Number(numeric[1]) : null
}

export function difficultyLabel(value: string): string {
  if (value === 'too_hard') return 'Too hard'
  return value.charAt(0).toUpperCase() + value.slice(1)
}
