export type PlanId = 'A' | 'B' | 'C'

export type WeightNote = '' | 'each hand' | 'bodyweight' | 'light resistance band'

export interface PlanExercise {
  exerciseId: string
  sets: number
  reps: string
  weight: number
  weightNote: WeightNote
  order: number
}

export interface Plan {
  id: PlanId
  name: string
  exercises: PlanExercise[]
}
