import type { PlanId } from '../types/plan'

export type DayKind = 'strength' | 'cardio' | 'dance'

const WEEKDAY_PLAN: Record<number, PlanId | null> = {
  0: null,
  1: null,
  2: 'A',
  3: null,
  4: 'B',
  5: null,
  6: 'C',
}

export function planIdForDate(date = new Date()): PlanId | null {
  return WEEKDAY_PLAN[date.getDay()] ?? null
}

export function dayKindForDate(date = new Date()): DayKind {
  if (date.getDay() === 0) return 'dance'
  if (planIdForDate(date)) return 'strength'
  return 'cardio'
}

const SESSION_TITLE: Record<PlanId, string> = {
  A: 'squat, press and curls',
  B: 'squat, push-up and shoulders',
  C: 'step-ups and hip thrusts',
}

export function sessionTitle(planId: PlanId): string {
  return SESSION_TITLE[planId]
}

export function planName(planId: PlanId): string {
  return `Plan ${planId}`
}

export function todayHeadline(planId: PlanId | null, date = new Date()): string {
  const kind = dayKindForDate(date)
  if (kind === 'dance') return "We're doing dance"
  if (kind === 'cardio') return "We're doing cardio and mobility"
  if (planId) return `We're doing ${sessionTitle(planId)}`
  return "We're doing cardio and mobility"
}
