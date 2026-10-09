import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { TrendChart } from '../components/progress/TrendChart'
import {
  bestSession,
  prescriptionsFor,
  sessionsForExercise,
} from '../domain/exerciseStats'
import { progressSuggestion } from '../domain/suggestion'
import { useAppData } from '../hooks/useAppData'
import { formatWeight, parseRepsValue } from '../lib/format'
import { isUsableMediaUrl } from '../lib/media'
import { saveExercise } from '../services/exercises'
import { updateExercisePrescription } from '../services/plans'

function BackNav() {
  return (
    <nav className="grid grid-cols-2 gap-2" aria-label="Back">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-fog/30 bg-panel px-3 text-sm font-semibold text-fog"
      >
        <span aria-hidden>←</span>
        Home
      </Link>
      <Link
        to="/exercises"
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-fog/30 bg-panel px-3 text-sm font-semibold text-fog"
      >
        <span aria-hidden>←</span>
        Exercises
      </Link>
    </nav>
  )
}

export function ExerciseDetailPage() {
  const { exerciseId } = useParams()
  const { exercises, plans, logs, loading, error, reload, setExercises, setPlans } = useAppData()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  const exercise = exercises.find((item) => item.id === exerciseId) ?? null
  const plannedItems = exercise ? prescriptionsFor(exercise.id, plans) : []
  const planned = plannedItems[0] ?? null
  const history = useMemo(
    () => (exercise ? sessionsForExercise(exercise.id, logs) : []),
    [exercise, logs],
  )
  const oldest = history.at(-1)?.entry
  const best = bestSession(history.map((item) => item.entry))
  const suggestion = planned
    ? progressSuggestion(
        planned.reps,
        history.map((item) => item.entry),
        planned.weightNote,
      )
    : 'Add this exercise to a plan to get a suggestion.'

  const chronological = [...history].reverse()
  const weightPoints = chronological.map((item) => ({
    date: item.date,
    value: item.entry.actualWeight,
  }))
  const repsPoints = chronological.flatMap((item) => {
    const value = parseRepsValue(item.entry.actualReps)
    return value === null ? [] : [{ date: item.date, value }]
  })

  const [weight, setWeight] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [notes, setNotes] = useState('')
  const [variation, setVariation] = useState('')
  const [instructions, setInstructions] = useState('')
  const [gifUrl, setGifUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  useEffect(() => {
    if (!exercise || !planned) return
    setWeight(String(planned.weight))
    setSets(String(planned.sets))
    setReps(planned.reps)
    setNotes(exercise.notes)
    setVariation(exercise.variation)
    setInstructions(exercise.instructions)
    setGifUrl(exercise.gifUrl)
    setYoutubeUrl(exercise.youtubeUrl)
  }, [exercise, planned])

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!exercise || !planned) return
    setSaving(true)
    setSaveError(null)
    setSaveOk(false)
    try {
      const nextExercise = {
        ...exercise,
        notes: notes.trim(),
        variation: variation.trim(),
        instructions: instructions.trim(),
        gifUrl: gifUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
      }
      await saveExercise(nextExercise)
      const nextPlans = await updateExercisePrescription(
        exercise.id,
        { weight: Number(weight), sets: Number(sets), reps: reps.trim() },
        plans,
      )
      setExercises((current) =>
        current.map((item) => (item.id === nextExercise.id ? nextExercise : item)),
      )
      setPlans(nextPlans)
      setSaveOk(true)
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="px-4 py-8 text-base text-fog/80">Loading…</p>
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <p className="text-base text-lime">{error}</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="mt-4 min-h-12 rounded-xl bg-lime px-4 font-semibold text-app"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!exerciseId) {
    return <Navigate to="/exercises" replace />
  }

  if (!exercise) {
    return (
      <main className="px-4">
        <BackNav />
        <p className="mt-4 text-fog/80">That exercise was not found.</p>
      </main>
    )
  }

  return (
    <main className="px-4 pb-8">
      <BackNav />

      <h1 className="mt-3 text-3xl font-semibold text-fog">{exercise.name}</h1>
      {exercise.variation ? <p className="mt-1 text-fog/70">{exercise.variation}</p> : null}

      <section className="mt-6 rounded-2xl border border-fog/20 bg-panel p-4">
        {planned ? (
          <p className="text-xl font-semibold text-lime">
            {formatWeight(planned.weight, planned.weightNote)} · {planned.sets} sets · {planned.reps}{' '}
            reps
          </p>
        ) : (
          <p className="text-fog/80">Not in a current plan.</p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-sm font-semibold text-fog/70">Started</dt>
            <dd className="mt-1 text-fog">{oldest ? `${oldest.actualWeight} kg` : '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-fog/70">Best</dt>
            <dd className="mt-1 text-fog">
              {best ? `${best.actualWeight} kg × ${best.actualReps}` : '—'}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm font-semibold text-fog/70">Suggestion</p>
        <p className="mt-1 text-fog">{suggestion}</p>
      </section>

      <section className="mt-5 rounded-2xl border border-fog/20 bg-panel p-4">
        <h2 className="text-lg font-semibold text-fog">Instructions</h2>
        <p className="mt-2 text-fog/80">{exercise.instructions || 'Add a short description below.'}</p>
      </section>

      <section className="mt-5 rounded-2xl border border-fog/20 bg-panel p-4">
        <h2 className="text-lg font-semibold text-fog">Watch</h2>
        <div className="mt-3 space-y-4">
          <div>
            <p className="text-sm font-semibold text-fog/80">GIF</p>
            {isUsableMediaUrl(exercise.gifUrl) ? (
              <img src={exercise.gifUrl} alt="" className="mt-2 max-h-64 w-full rounded-xl object-contain" />
            ) : (
              <p className="mt-2 text-fog/70">Add a GIF URL below.</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-fog/80">YouTube demonstration</p>
            {isUsableMediaUrl(exercise.youtubeUrl) ? (
              <a
                href={exercise.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-12 items-center rounded-xl bg-lime px-4 font-semibold text-app"
              >
                Watch video
              </a>
            ) : (
              <p className="mt-2 text-fog/70">Add a YouTube URL below.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-2xl border border-fog/20 bg-panel p-3">
          <h2 className="text-sm font-semibold text-fog">Weight</h2>
          <TrendChart points={weightPoints} unit="kg" emptyLabel="Log two sessions to chart." />
        </div>
        <div className="min-w-0 rounded-2xl border border-fog/20 bg-panel p-3">
          <h2 className="text-sm font-semibold text-fog">Reps</h2>
          <TrendChart points={repsPoints} unit="" emptyLabel="Log two sessions to chart." />
        </div>
      </section>

      {planned ? (
        <form onSubmit={(event) => void handleSave(event)} className="mt-5 rounded-2xl border border-fog/20 bg-panel p-4">
          <h2 className="text-lg font-semibold text-fog">Edit exercise</h2>
          <p className="mt-1 text-sm text-fog/70">
            Saving updates the current prescription everywhere this exercise appears. Old workout logs stay as they were.
          </p>

          <label className="mt-4 block text-sm font-semibold text-fog">
            Weight (kg)
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-fog">
            Sets
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-fog">
            Reps
            <input
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-fog">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-fog/30 bg-app px-3 py-2 text-base text-fog"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-fog">
            Exercise variation
            <input
              value={variation}
              onChange={(event) => setVariation(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-fog">
            Instructions
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-fog/30 bg-app px-3 py-2 text-base text-fog"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-fog">
            GIF URL
            <input
              value={gifUrl}
              onChange={(event) => setGifUrl(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-fog">
            YouTube URL
            <input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-fog/30 bg-app px-3 text-base text-fog"
            />
          </label>

          {saveError ? <p className="mt-3 text-lime">{saveError}</p> : null}
          {saveOk ? <p className="mt-3 text-lime">Saved. Past logs were not changed.</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 min-h-12 w-full rounded-xl bg-lime font-semibold text-app disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      ) : null}
    </main>
  )
}
