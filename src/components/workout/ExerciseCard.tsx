import { Link } from 'react-router-dom'
import { formatWeight } from '../../lib/format'
import type { Exercise } from '../../types/exercise'
import type { PlanExercise } from '../../types/plan'

interface ExerciseCardProps {
  exercise: Exercise
  planned: PlanExercise
  checked: boolean
  logged?: boolean
  showLog?: boolean
  showMedia?: boolean
  showWeight?: boolean
  onCheck: (checked: boolean) => void
  onLog?: () => void
}

export function ExerciseCard({
  exercise,
  planned,
  checked,
  logged = false,
  showLog = true,
  showMedia = true,
  showWeight = true,
  onCheck,
  onLog,
}: ExerciseCardProps) {
  const showActions = showMedia || (showLog && onLog)
  const detailTo = `/exercises/${exercise.id}`

  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-fog/20 bg-panel p-4 hover:border-lime/50">
      <Link
        to={detailTo}
        aria-label={`Open ${exercise.name}`}
        className="absolute inset-0 z-0 rounded-2xl"
      />
      <div className="flex items-start gap-3">
        <label className="relative z-10 flex min-h-12 min-w-12 items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheck(event.target.checked)}
            className="h-7 w-7 accent-lime"
          />
        </label>
        <div className="pointer-events-none min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-6 text-fog">{exercise.name}</h3>
          <p className="mt-1 text-base text-fog/80">
            {planned.sets} × {planned.reps}
          </p>
          {showWeight ? (
            <p className="text-base text-fog/80">{formatWeight(planned.weight, planned.weightNote)}</p>
          ) : null}
          {logged ? <p className="mt-1 text-sm font-medium text-lime">Logged today</p> : null}
        </div>
      </div>

      {showActions ? (
        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-4">
          {showMedia ? (
            <>
              <a
                href={exercise.gifUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl border border-fog/30 px-3 text-sm font-semibold text-fog"
              >
                GIF
              </a>
              <a
                href={exercise.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl border border-fog/30 px-3 text-sm font-semibold text-fog"
              >
                YouTube
              </a>
            </>
          ) : null}
          {showLog && onLog ? (
            <button
              type="button"
              onClick={onLog}
              className="ml-auto inline-flex min-h-11 items-center rounded-xl bg-lime px-4 text-sm font-semibold text-app"
            >
              Log Result
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
