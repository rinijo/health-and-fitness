import { useState, type FormEvent } from 'react'
import { formatWeight } from '../../lib/format'
import type { PlanExercise, WeightNote } from '../../types/plan'
import type { Difficulty } from '../../types/workoutLog'

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'good', label: 'Good' },
  { value: 'hard', label: 'Hard' },
  { value: 'too_hard', label: 'Too hard' },
]

interface LogResultFormProps {
  exerciseName: string
  planned: PlanExercise
  weightNote: WeightNote
  onCancel: () => void
  onSave: (input: {
    actualWeight: number
    actualReps: string
    actualSets: number
    difficulty: Difficulty
    notes: string
  }) => Promise<void>
}

export function LogResultForm({
  exerciseName,
  planned,
  weightNote,
  onCancel,
  onSave,
}: LogResultFormProps) {
  const [actualWeight, setActualWeight] = useState(String(planned.weight))
  const [actualReps, setActualReps] = useState(planned.reps)
  const [actualSets, setActualSets] = useState(String(planned.sets))
  const [difficulty, setDifficulty] = useState<Difficulty>('good')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({
        actualWeight: Number(actualWeight),
        actualReps: actualReps.trim(),
        actualSets: Number(actualSets),
        difficulty,
        notes: notes.trim(),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-app/80 p-3 sm:items-center">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-lg rounded-3xl border border-fog/20 bg-panel p-5 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-fog">Log result</h2>
        <p className="mt-1 text-fog/80">{exerciseName}</p>
        <p className="mt-1 text-sm text-fog/70">
          Planned: {planned.sets} x {planned.reps} @ {formatWeight(planned.weight, weightNote)}
        </p>

        <label className="mt-5 block text-sm font-semibold">
          Actual weight (kg)
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            required
            value={actualWeight}
            onChange={(event) => setActualWeight(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold">
          Actual reps
          <input
            type="text"
            required
            value={actualReps}
            onChange={(event) => setActualReps(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold">
          Actual sets
          <input
            type="number"
            inputMode="numeric"
            min="1"
            required
            value={actualSets}
            onChange={(event) => setActualSets(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Difficulty</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {DIFFICULTIES.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-12 items-center justify-center rounded-xl border text-base font-medium ${
                  difficulty === option.value
                    ? 'border-lime bg-lime text-app'
                    : 'border-fog/30 bg-app text-fog'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={option.value}
                  checked={difficulty === option.value}
                  onChange={() => setDifficulty(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block text-sm font-semibold">
          Notes (optional)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className="mt-2 w-full rounded-xl border border-fog/30 bg-app px-3 py-2 text-base text-fog"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-lime">{error}</p> : null}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-xl border border-fog/30 text-base font-semibold text-fog"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-xl bg-lime text-base font-semibold text-app disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
