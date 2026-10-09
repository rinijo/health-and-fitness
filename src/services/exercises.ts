import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { getDb } from '../lib/firebase'
import type { Exercise } from '../types/exercise'

const COLLECTION = 'exercises'

export async function listExercises(): Promise<Exercise[]> {
  const snapshot = await getDocs(collection(getDb(), COLLECTION))
  return snapshot.docs
    .map((item) => {
      const data = item.data() as Partial<Exercise>
      return {
        id: data.id ?? item.id,
        name: data.name ?? item.id,
        gifUrl: data.gifUrl ?? '',
        youtubeUrl: data.youtubeUrl ?? '',
        instructions: data.instructions ?? '',
        notes: data.notes ?? '',
        variation: data.variation ?? '',
      } satisfies Exercise
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function saveExercise(exercise: Exercise): Promise<void> {
  await setDoc(doc(getDb(), COLLECTION, exercise.id), exercise)
}

export async function createExercise(input: Omit<Exercise, 'id'>): Promise<Exercise> {
  const slug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const uniqueId = `${slug || 'exercise'}-${Date.now().toString(36)}`
  const exercise: Exercise = { id: uniqueId, ...input }
  await saveExercise(exercise)
  return exercise
}
