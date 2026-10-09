import type { PlanId } from './plan'

export type Difficulty = 'easy' | 'good' | 'hard' | 'too_hard'

export interface LoggedExercise {
  exerciseId: string
  exerciseName: string
  plannedWeight: number
  plannedReps: string
  plannedSets: number
  actualWeight: number
  actualReps: string
  actualSets: number
  difficulty: Difficulty
  notes: string
}

export interface WorkoutLog {
  id: string
  workoutDate: string
  createdAt: string
  planId: PlanId
  exercises: LoggedExercise[]
}
