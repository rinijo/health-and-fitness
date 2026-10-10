import { useCallback, useEffect, useState } from 'react'
import { listExercises } from '../services/exercises'
import { listPlans } from '../services/plans'
import { applyStartingWeightsReset, ensureWarmupSeeded, seedIfEmpty } from '../services/seed'
import { getWarmup } from '../services/warmup'
import { listWorkoutLogs } from '../services/workoutLogs'
import type { Exercise } from '../types/exercise'
import type { Plan } from '../types/plan'
import type { Warmup } from '../types/warmup'
import type { WorkoutLog } from '../types/workoutLog'

export function useAppData() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [warmup, setWarmup] = useState<Warmup | null>(null)
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      await seedIfEmpty()
      await ensureWarmupSeeded()
      await applyStartingWeightsReset()
      const [nextExercises, nextPlans, nextWarmup, nextLogs] = await Promise.all([
        listExercises(),
        listPlans(),
        getWarmup(),
        listWorkoutLogs(),
      ])
      setExercises(nextExercises)
      setPlans(nextPlans)
      setWarmup(nextWarmup)
      setLogs(nextLogs)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    exercises,
    plans,
    warmup,
    logs,
    loading,
    error,
    reload,
    setExercises,
    setPlans,
    setWarmup,
    setLogs,
  }
}
