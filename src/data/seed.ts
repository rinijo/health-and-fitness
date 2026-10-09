import type { Exercise } from '../types/exercise'
import type { Plan, PlanExercise, WeightNote } from '../types/plan'
import type { Warmup } from '../types/warmup'
import type { WorkoutLog } from '../types/workoutLog'
import { EXERCISE_INSTRUCTIONS } from './exerciseCopy'

function media(id: string) {
  return {
    instructions: EXERCISE_INSTRUCTIONS[id] ?? '',
    notes: '',
    variation: '',
  }
}

function item(
  exerciseId: string,
  sets: number,
  reps: string,
  weight: number,
  weightNote: WeightNote,
  order: number,
): PlanExercise {
  return { exerciseId, sets, reps, weight, weightNote, order }
}

export const SEED_EXERCISES: Exercise[] = [
  { id: 'goblet-squat', name: 'Goblet squat', ...media('goblet-squat') },
  { id: 'dumbbell-romanian-deadlift', name: 'Romanian deadlift', ...media('dumbbell-romanian-deadlift') },
  { id: 'one-arm-dumbbell-row', name: 'One-arm row', ...media('one-arm-dumbbell-row') },
  { id: 'dumbbell-chest-press', name: 'Chest press', ...media('dumbbell-chest-press') },
  { id: 'dumbbell-lateral-raise', name: 'Lateral raise', ...media('dumbbell-lateral-raise') },
  { id: 'dumbbell-biceps-curl', name: 'Biceps curl', ...media('dumbbell-biceps-curl') },
  { id: 'dead-bug-heel-tap', name: 'Dead-bug heel tap', ...media('dead-bug-heel-tap') },
  { id: 'farmer-carry', name: 'Farmer carry', ...media('farmer-carry') },
  { id: 'incline-push-up', name: 'Incline push-up', ...media('incline-push-up') },
  { id: 'seated-dumbbell-shoulder-press', name: 'Seated shoulder press', ...media('seated-dumbbell-shoulder-press') },
  { id: 'overhead-dumbbell-triceps-extension', name: 'Overhead triceps extension', ...media('overhead-dumbbell-triceps-extension') },
  { id: 'pallof-press', name: 'Pallof press', ...media('pallof-press') },
  { id: 'standing-calf-raise', name: 'Standing calf raise', ...media('standing-calf-raise') },
  { id: 'step-up', name: 'Step-up', ...media('step-up') },
  { id: 'dumbbell-hip-thrust', name: 'Hip thrust', ...media('dumbbell-hip-thrust') },
  { id: 'easy-movement', name: 'Easy movement', ...media('easy-movement') },
  { id: 'shoulder-circles', name: 'Shoulder circles', ...media('shoulder-circles') },
  { id: 'hip-hinge', name: 'Hip hinge', ...media('hip-hinge') },
  { id: 'bodyweight-squat', name: 'Bodyweight squat', ...media('bodyweight-squat') },
  { id: 'exercise-specific-rehearsal', name: 'Exercise-specific rehearsal', ...media('exercise-specific-rehearsal') },
]

export const SEED_WARMUP: Warmup = {
  id: 'warmup',
  name: 'Warm-up',
  exercises: [
    item('easy-movement', 1, '1 min', 0, 'bodyweight', 1),
    item('shoulder-circles', 1, '8 each direction', 0, 'bodyweight', 2),
    item('hip-hinge', 1, '8', 0, 'bodyweight', 3),
    item('bodyweight-squat', 1, '8', 0, 'bodyweight', 4),
    item('standing-calf-raise', 1, '10', 0, 'bodyweight', 5),
    item('exercise-specific-rehearsal', 1, '5 easy reps', 0, 'bodyweight', 6),
  ],
}

export const SEED_PLANS: Plan[] = [
  {
    id: 'A',
    name: 'Plan A',
    exercises: [
      item('goblet-squat', 3, '8', 4, '', 1),
      item('dumbbell-romanian-deadlift', 3, '8', 3, 'each hand', 2),
      item('one-arm-dumbbell-row', 3, '8/side', 4, '', 3),
      item('dumbbell-chest-press', 3, '8', 3, 'each hand', 4),
      item('dumbbell-lateral-raise', 2, '8', 1, 'each hand', 5),
      item('dumbbell-biceps-curl', 2, '8', 2, 'each hand', 6),
      item('dead-bug-heel-tap', 2, '8/side', 0, 'bodyweight', 7),
      item('farmer-carry', 2, '30 sec', 4, 'each hand', 8),
    ],
  },
  {
    id: 'B',
    name: 'Plan B',
    exercises: [
      item('goblet-squat', 3, '8', 4, '', 1),
      item('dumbbell-romanian-deadlift', 3, '8', 3, 'each hand', 2),
      item('one-arm-dumbbell-row', 3, '8/side', 4, '', 3),
      item('incline-push-up', 3, '8', 0, 'bodyweight', 4),
      item('seated-dumbbell-shoulder-press', 2, '8', 2, 'each hand', 5),
      item('overhead-dumbbell-triceps-extension', 2, '8', 2, '', 6),
      item('pallof-press', 2, '8/side', 0, 'light resistance band', 7),
      item('standing-calf-raise', 2, '10', 0, 'bodyweight', 8),
    ],
  },
  {
    id: 'C',
    name: 'Plan C',
    exercises: [
      item('step-up', 3, '8/leg', 0, 'bodyweight', 1),
      item('dumbbell-hip-thrust', 3, '8', 0, 'bodyweight', 2),
      item('dumbbell-chest-press', 3, '8', 3, 'each hand', 3),
      item('one-arm-dumbbell-row', 3, '8/side', 4, '', 4),
      item('seated-dumbbell-shoulder-press', 2, '8', 2, 'each hand', 5),
      item('dumbbell-lateral-raise', 2, '8', 1, 'each hand', 6),
      item('dead-bug-heel-tap', 2, '8/side', 0, 'bodyweight', 7),
      item('farmer-carry', 2, '30 sec', 4, 'each hand', 8),
    ],
  },
]

function gobletSession(
  date: string,
  actualReps: string,
  difficulty: WorkoutLog['exercises'][number]['difficulty'],
): WorkoutLog {
  return {
    id: date,
    workoutDate: date,
    createdAt: `${date}T10:00:00.000Z`,
    planId: 'A',
    exercises: [
      {
        exerciseId: 'goblet-squat',
        exerciseName: 'Goblet squat',
        plannedWeight: 4,
        plannedReps: '8',
        plannedSets: 3,
        actualWeight: 4,
        actualReps,
        actualSets: 3,
        difficulty,
        notes: '',
      },
    ],
  }
}

export const DEMO_GOBLET_SQUAT_LOGS: WorkoutLog[] = [
  gobletSession('2026-09-21', '8', 'good'),
  gobletSession('2026-09-28', '8', 'good'),
  gobletSession('2026-10-05', '10', 'easy'),
]
