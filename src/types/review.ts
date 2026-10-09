export type ReviewStatus = 'progressing' | 'maintaining' | 'review'

export interface ExerciseReview {
  exerciseId: string
  exerciseName: string
  status: ReviewStatus
}
