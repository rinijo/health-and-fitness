import { reviewExercises } from '../../domain/review'
import type { Exercise } from '../../types/exercise'
import type { ReviewStatus } from '../../types/review'
import type { WorkoutLog } from '../../types/workoutLog'

interface ReviewProgressProps {
  exercises: Exercise[]
  logs: WorkoutLog[]
}

const GROUPS: { status: ReviewStatus; title: string }[] = [
  { status: 'progressing', title: 'Progressing' },
  { status: 'maintaining', title: 'Maintaining' },
  { status: 'review', title: 'Review' },
]

export function ReviewProgress({ exercises, logs }: ReviewProgressProps) {
  const reviews = reviewExercises(exercises, logs)

  return (
    <div className="space-y-5">
      {GROUPS.map((group) => {
        const items = reviews.filter((item) => item.status === group.status)
        return (
          <section key={group.status}>
            <h2 className="text-lg font-semibold text-fog">
              {group.title}{' '}
              <span className="text-base font-normal text-fog/60">({items.length})</span>
            </h2>
            {items.length === 0 ? (
              <p className="mt-2 text-fog/70">None</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {items.map((item) => (
                  <li key={item.exerciseId} className="rounded-xl border border-fog/20 bg-panel px-4 py-3 text-fog">
                    {item.exerciseName}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
