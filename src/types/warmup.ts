import type { PlanExercise } from './plan'

export interface Warmup {
  id: 'warmup'
  name: string
  exercises: PlanExercise[]
}
