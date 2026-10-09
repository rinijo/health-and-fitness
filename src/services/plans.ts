import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { getDb } from '../lib/firebase'
import type { Plan, PlanId } from '../types/plan'

const COLLECTION = 'plans'

export async function listPlans(): Promise<Plan[]> {
  const snapshot = await getDocs(collection(getDb(), COLLECTION))
  return snapshot.docs
    .map((item) => item.data() as Plan)
    .filter((plan): plan is Plan => plan.id === 'A' || plan.id === 'B' || plan.id === 'C')
    .sort((a, b) => a.id.localeCompare(b.id))
}

export async function getPlan(planId: PlanId): Promise<Plan | null> {
  const snapshot = await getDoc(doc(getDb(), COLLECTION, planId))
  return snapshot.exists() ? (snapshot.data() as Plan) : null
}

export async function savePlan(plan: Plan): Promise<void> {
  const exercises = [...plan.exercises]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index + 1 }))
  await setDoc(doc(getDb(), COLLECTION, plan.id), { ...plan, exercises })
}

export async function updateExercisePrescription(
  exerciseId: string,
  patch: { sets: number; reps: string; weight: number },
  plans: Plan[],
): Promise<Plan[]> {
  const nextPlans: Plan[] = []
  for (const plan of plans) {
    if (!plan.exercises.some((item) => item.exerciseId === exerciseId)) {
      nextPlans.push(plan)
      continue
    }
    const updated: Plan = {
      ...plan,
      exercises: plan.exercises.map((item) =>
        item.exerciseId === exerciseId ? { ...item, ...patch } : item,
      ),
    }
    await savePlan(updated)
    nextPlans.push(updated)
  }
  return nextPlans
}
