import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore'
import { getDb } from '../lib/firebase'
import { localDateId } from '../lib/dates'
import type { PlanId } from '../types/plan'
import type { LoggedExercise, WorkoutLog } from '../types/workoutLog'

const COLLECTION = 'workoutLogs'

export async function listWorkoutLogs(): Promise<WorkoutLog[]> {
  const snapshot = await getDocs(query(collection(getDb(), COLLECTION), orderBy('workoutDate', 'desc')))
  return snapshot.docs.map((item) => item.data() as WorkoutLog)
}

export async function getWorkoutLog(dateId: string): Promise<WorkoutLog | null> {
  const snapshot = await getDoc(doc(getDb(), COLLECTION, dateId))
  return snapshot.exists() ? (snapshot.data() as WorkoutLog) : null
}

export async function upsertLoggedExercise(
  planId: PlanId,
  entry: LoggedExercise,
  dateId = localDateId(),
): Promise<WorkoutLog> {
  const existing = await getWorkoutLog(dateId)
  const now = new Date().toISOString()
  const exercises = existing
    ? [...existing.exercises.filter((item) => item.exerciseId !== entry.exerciseId), entry]
    : [entry]

  const log: WorkoutLog = {
    id: dateId,
    workoutDate: dateId,
    createdAt: existing?.createdAt ?? now,
    planId,
    exercises,
  }

  await setDoc(doc(getDb(), COLLECTION, dateId), log)
  return log
}
