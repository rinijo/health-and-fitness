import { doc, getDoc, setDoc } from 'firebase/firestore'
import { SEED_WARMUP } from '../data/seed'
import { getDb } from '../lib/firebase'
import type { Warmup } from '../types/warmup'

const REF = ['warmups', 'default'] as const

export async function getWarmup(): Promise<Warmup> {
  const snapshot = await getDoc(doc(getDb(), ...REF))
  if (!snapshot.exists()) {
    await setDoc(doc(getDb(), ...REF), SEED_WARMUP)
    return SEED_WARMUP
  }
  return snapshot.data() as Warmup
}

export async function saveWarmup(warmup: Warmup): Promise<void> {
  const exercises = [...warmup.exercises]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index + 1 }))
  await setDoc(doc(getDb(), ...REF), { ...warmup, id: 'warmup', exercises })
}
