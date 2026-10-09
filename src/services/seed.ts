import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { DEMO_GOBLET_SQUAT_LOGS, SEED_EXERCISES, SEED_PLANS, SEED_WARMUP } from '../data/seed'
import { getDb } from '../lib/firebase'
import type { WorkoutLog } from '../types/workoutLog'

export async function seedIfEmpty(): Promise<boolean> {
  const db = getDb()
  const existing = await getDocs(collection(db, 'exercises'))
  if (!existing.empty) return false

  const batch = writeBatch(db)
  for (const exercise of SEED_EXERCISES) {
    batch.set(doc(db, 'exercises', exercise.id), exercise)
  }
  for (const plan of SEED_PLANS) {
    batch.set(doc(db, 'plans', plan.id), plan)
  }
  batch.set(doc(db, 'warmups', 'default'), SEED_WARMUP)
  await batch.commit()
  return true
}

export async function ensureWarmupSeeded(): Promise<void> {
  const db = getDb()
  for (const exercise of SEED_EXERCISES) {
    const ref = doc(db, 'exercises', exercise.id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) {
      await setDoc(ref, exercise)
      continue
    }
    const storedName = String(snapshot.data()?.name ?? '')
    const leftoverDumbbell =
      storedName !== exercise.name &&
      /dumbbell/i.test(storedName) &&
      !/dumbbell/i.test(exercise.name)
    const storedInstructions = String(snapshot.data()?.instructions ?? '')
    const patch: { name?: string; instructions?: string } = {}
    if (leftoverDumbbell) patch.name = exercise.name
    if (!storedInstructions.trim() && exercise.instructions) {
      patch.instructions = exercise.instructions
    }
    if (Object.keys(patch).length > 0) {
      await setDoc(ref, patch, { merge: true })
    }
  }

  const warmupRef = doc(db, 'warmups', 'default')
  const warmupSnap = await getDoc(warmupRef)
  const existing = warmupSnap.data() as { exercises?: unknown[] } | undefined
  if (!warmupSnap.exists() || !existing?.exercises?.length) {
    await setDoc(warmupRef, SEED_WARMUP)
  }
}

export async function ensureGobletSquatDemoLogs(): Promise<void> {
  const db = getDb()
  const existing = await getDocs(collection(db, 'workoutLogs'))
  const gobletCount = existing.docs.filter((item) => {
    const log = item.data() as WorkoutLog
    return log.exercises?.some((entry) => entry.exerciseId === 'goblet-squat')
  }).length
  if (gobletCount >= 3) return

  for (const demo of DEMO_GOBLET_SQUAT_LOGS) {
    const ref = doc(db, 'workoutLogs', demo.id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) {
      await setDoc(ref, demo)
      continue
    }
    const log = snapshot.data() as WorkoutLog
    if (log.exercises.some((entry) => entry.exerciseId === 'goblet-squat')) continue
    await setDoc(ref, { ...log, exercises: [...log.exercises, ...demo.exercises] })
  }
}
