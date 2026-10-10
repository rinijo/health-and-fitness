import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { SEED_EXERCISES, SEED_PLANS, SEED_WARMUP } from '../data/seed'
import { getDb } from '../lib/firebase'

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

const STARTING_WEIGHTS_RESET = 'starting-weights-2026-10-10'

export async function applyStartingWeightsReset(): Promise<void> {
  const db = getDb()
  const flagRef = doc(db, 'meta', 'reset')
  const flag = await getDoc(flagRef)
  if (flag.data()?.id === STARTING_WEIGHTS_RESET) return

  const logs = await getDocs(collection(db, 'workoutLogs'))
  await Promise.all(logs.docs.map((item) => deleteDoc(item.ref)))

  const batch = writeBatch(db)
  for (const plan of SEED_PLANS) {
    batch.set(doc(db, 'plans', plan.id), plan)
  }
  for (const exercise of SEED_EXERCISES) {
    batch.set(doc(db, 'exercises', exercise.id), exercise, { merge: true })
  }
  batch.set(doc(db, 'warmups', 'default'), SEED_WARMUP)
  batch.set(flagRef, { id: STARTING_WEIGHTS_RESET, appliedAt: new Date().toISOString() })
  await batch.commit()
}
