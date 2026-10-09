import type { WeightNote } from '../types/plan'

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
