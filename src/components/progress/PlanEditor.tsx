import { useRef, useState } from 'react'
import { createExercise, saveExercise } from '../../services/exercises'
import { savePlan } from '../../services/plans'
import { saveWarmup } from '../../services/warmup'
import type { Exercise } from '../../types/exercise'
import type { Plan, PlanExercise, PlanId, WeightNote } from '../../types/plan'
import type { Warmup } from '../../types/warmup'

interface PlanEditorProps {
  exercises: Exercise[]
  plans: Plan[]
  warmup: Warmup | null
  onExercisesChange: (exercises: Exercise[] | ((current: Exercise[]) => Exercise[])) => void
  onPlansChange: (plans: Plan[] | ((current: Plan[]) => Plan[])) => void
  onWarmupChange: (warmup: Warmup | ((current: Warmup | null) => Warmup | null)) => void
}

const WEIGHT_NOTES: WeightNote[] = ['', 'each hand', 'bodyweight', 'light resistance band']

export function PlanEditor({
  exercises,
  plans,
  warmup,
  onExercisesChange,
  onPlansChange,
  onWarmupChange,
}: PlanEditorProps) {
  const [openPlanId, setOpenPlanId] = useState<PlanId | 'warmup' | null>(plans[0]?.id ?? 'A')
  const [error, setError] = useState<string | null>(null)
  const planTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const exerciseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const warmupTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function updatePlan(next: Plan) {
    onPlansChange((current) => current.map((plan) => (plan.id === next.id ? next : plan)))
    window.clearTimeout(planTimer.current)
    planTimer.current = setTimeout(() => {
      void savePlan(next)
        .then(() => setError(null))
        .catch((cause: unknown) => {
          setError(cause instanceof Error ? cause.message : 'Could not save plan')
        })
    }, 400)
  }

  function updateExercise(next: Exercise) {
    onExercisesChange((current) => current.map((item) => (item.id === next.id ? next : item)))
    window.clearTimeout(exerciseTimer.current)
    exerciseTimer.current = setTimeout(() => {
      void saveExercise(next)
        .then(() => setError(null))
        .catch((cause: unknown) => {
          setError(cause instanceof Error ? cause.message : 'Could not save exercise')
        })
    }, 400)
  }

  function updateWarmup(next: Warmup) {
    onWarmupChange(next)
    window.clearTimeout(warmupTimer.current)
    warmupTimer.current = setTimeout(() => {
      void saveWarmup(next)
        .then(() => setError(null))
        .catch((cause: unknown) => {
          setError(cause instanceof Error ? cause.message : 'Could not save warm-up')
        })
    }, 400)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-fog/80">
        Editing a plan changes today&apos;s prescription only. Past workout logs stay as they were.
      </p>
      {error ? <p className="text-sm text-lime">{error}</p> : null}

      <section className="rounded-2xl border border-fog/20 bg-panel">
        <button
          type="button"
          onClick={() => setOpenPlanId((current) => (current === 'warmup' ? null : 'warmup'))}
          className="flex min-h-14 w-full items-center justify-between px-4 text-left text-lg font-semibold text-fog"
        >
          Warm-up
          <span className="text-sm font-medium text-fog/60">
            {openPlanId === 'warmup' ? 'Hide' : 'Edit'}
          </span>
        </button>
        {openPlanId === 'warmup' && warmup ? (
          <PlanFields
            plan={warmup}
            exercises={exercises}
            onChange={updateWarmup}
            onExerciseChange={updateExercise}
            onExerciseCreated={(exercise, nextPlan) => {
              onExercisesChange((current) =>
                [...current, exercise].sort((a, b) => a.name.localeCompare(b.name)),
              )
              updateWarmup(nextPlan)
            }}
          />
        ) : null}
      </section>

      {plans.map((plan) => (
        <section key={plan.id} className="rounded-2xl border border-fog/20 bg-panel">
          <button
            type="button"
            onClick={() => setOpenPlanId((current) => (current === plan.id ? null : plan.id))}
            className="flex min-h-14 w-full items-center justify-between px-4 text-left text-lg font-semibold text-fog"
          >
            {plan.name}
            <span className="text-sm font-medium text-fog/60">
              {openPlanId === plan.id ? 'Hide' : 'Edit'}
            </span>
          </button>

          {openPlanId === plan.id ? (
            <PlanFields
              plan={plan}
              exercises={exercises}
              onChange={updatePlan}
              onExerciseChange={updateExercise}
              onExerciseCreated={(exercise, nextPlan) => {
                onExercisesChange((current) =>
                  [...current, exercise].sort((a, b) => a.name.localeCompare(b.name)),
                )
                updatePlan(nextPlan)
              }}
            />
          ) : null}
        </section>
      ))}
    </div>
  )
}

function PlanFields<T extends { id: string; name: string; exercises: PlanExercise[] }>({
  plan,
  exercises,
  onChange,
  onExerciseChange,
  onExerciseCreated,
}: {
  plan: T
  exercises: Exercise[]
  onChange: (plan: T) => void
  onExerciseChange: (exercise: Exercise) => void
  onExerciseCreated: (exercise: Exercise, plan: T) => void
}) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSets, setNewSets] = useState('3')
  const [newReps, setNewReps] = useState('8')
  const [newWeight, setNewWeight] = useState('0')
  const [newNote, setNewNote] = useState<WeightNote>('')
  const [existingId, setExistingId] = useState('')

  const usedIds = new Set(plan.exercises.map((item) => item.exerciseId))
  const unused = exercises.filter((item) => !usedIds.has(item.id))
  const ordered = [...plan.exercises].sort((a, b) => a.order - b.order)

  function replaceItem(exerciseId: string, patch: Partial<PlanExercise>) {
    onChange({
      ...plan,
      exercises: plan.exercises.map((item) =>
        item.exerciseId === exerciseId ? { ...item, ...patch } : item,
      ),
    })
  }

  function move(exerciseId: string, direction: -1 | 1) {
    const index = ordered.findIndex((item) => item.exerciseId === exerciseId)
    const swapWith = index + direction
    if (index < 0 || swapWith < 0 || swapWith >= ordered.length) return
    const next = ordered.map((item, itemIndex) => {
      if (itemIndex === index) return { ...item, order: swapWith + 1 }
      if (itemIndex === swapWith) return { ...item, order: index + 1 }
      return { ...item, order: itemIndex + 1 }
    })
    onChange({ ...plan, exercises: next })
  }

  async function addNew() {
    const exercise = await createExercise({
      name: newName.trim(),
      instructions: '',
      notes: '',
      variation: '',
    })
    const nextItem: PlanExercise = {
      exerciseId: exercise.id,
      sets: Number(newSets),
      reps: newReps,
      weight: Number(newWeight),
      weightNote: newNote,
      order: ordered.length + 1,
    }
    onExerciseCreated(exercise, { ...plan, exercises: [...plan.exercises, nextItem] })
    setAdding(false)
    setNewName('')
  }

  function addExisting() {
    if (!existingId) return
    onChange({
      ...plan,
      exercises: [
        ...plan.exercises,
        {
          exerciseId: existingId,
          sets: 3,
          reps: '8',
          weight: 0,
          weightNote: '',
          order: ordered.length + 1,
        },
      ],
    })
    setExistingId('')
  }

  return (
    <div className="space-y-4 border-t border-fog/20 px-4 pb-4 pt-2 text-fog">
      {ordered.map((item) => {
        const exercise = exercises.find((entry) => entry.id === item.exerciseId)
        if (!exercise) return null
        return (
          <article key={item.exerciseId} className="rounded-xl bg-app p-3">
            <label className="block text-sm font-semibold">
              Exercise
              <input
                value={exercise.name}
                onChange={(event) => onExerciseChange({ ...exercise, name: event.target.value })}
                className="mt-1 min-h-12 w-full rounded-xl border border-fog/30 bg-panel px-3 text-base text-fog"
              />
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <NumberField
                label="Sets"
                value={String(item.sets)}
                onChange={(value) => replaceItem(item.exerciseId, { sets: Number(value) })}
              />
              <TextField
                label="Reps"
                value={item.reps}
                onChange={(value) => replaceItem(item.exerciseId, { reps: value })}
              />
              <NumberField
                label="Weight"
                value={String(item.weight)}
                onChange={(value) => replaceItem(item.exerciseId, { weight: Number(value) })}
              />
            </div>
            <label className="mt-3 block text-sm font-semibold">
              Weight note
              <select
                value={item.weightNote}
                onChange={(event) =>
                  replaceItem(item.exerciseId, { weightNote: event.target.value as WeightNote })
                }
                className="mt-1 min-h-12 w-full rounded-xl border border-fog/30 bg-panel px-3 text-base text-fog"
              >
                {WEIGHT_NOTES.map((note) => (
                  <option key={note || 'none'} value={note}>
                    {note || 'kg'}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => move(item.exerciseId, -1)}
                className="min-h-11 rounded-xl border border-fog/30 px-3 text-sm font-semibold text-fog"
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => move(item.exerciseId, 1)}
                className="min-h-11 rounded-xl border border-fog/30 px-3 text-sm font-semibold text-fog"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...plan,
                    exercises: plan.exercises.filter((entry) => entry.exerciseId !== item.exerciseId),
                  })
                }
                className="ml-auto min-h-11 rounded-xl px-3 text-sm font-semibold text-lime"
              >
                Remove
              </button>
            </div>
          </article>
        )
      })}

      {unused.length > 0 ? (
        <div className="flex gap-2">
          <select
            value={existingId}
            onChange={(event) => setExistingId(event.target.value)}
            className="min-h-12 flex-1 rounded-xl border border-fog/30 bg-panel px-3 text-base text-fog"
          >
            <option value="">Add existing exercise</option>
            {unused.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addExisting}
            className="min-h-12 rounded-xl bg-lime px-4 font-semibold text-app"
          >
            Add
          </button>
        </div>
      ) : null}

      {adding ? (
        <div className="rounded-xl border border-fog/20 p-3">
          <TextField label="New exercise name" value={newName} onChange={setNewName} />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <NumberField label="Sets" value={newSets} onChange={setNewSets} />
            <TextField label="Reps" value={newReps} onChange={setNewReps} />
            <NumberField label="Weight" value={newWeight} onChange={setNewWeight} />
          </div>
          <label className="mt-2 block text-sm font-semibold">
            Weight note
            <select
              value={newNote}
              onChange={(event) => setNewNote(event.target.value as WeightNote)}
              className="mt-1 min-h-12 w-full rounded-xl border border-fog/30 bg-panel px-3 text-base text-fog"
            >
              {WEIGHT_NOTES.map((note) => (
                <option key={note || 'none'} value={note}>
                  {note || 'kg'}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="min-h-12 rounded-xl border border-fog/30 font-semibold text-fog"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!newName.trim()}
              onClick={() => void addNew()}
              className="min-h-12 rounded-xl bg-lime font-semibold text-app disabled:opacity-50"
            >
              Save exercise
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="min-h-12 w-full rounded-xl border border-dashed border-fog/40 font-semibold text-fog"
        >
          Add new exercise
        </button>
      )}
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="mt-3 block text-sm font-semibold">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-12 w-full rounded-xl border border-fog/30 bg-panel px-3 text-base text-fog"
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-12 w-full rounded-xl border border-fog/30 bg-panel px-3 text-base text-fog"
      />
    </label>
  )
}
