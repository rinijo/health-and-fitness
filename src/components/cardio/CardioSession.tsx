import { CARDIO_BANK, CARDIO_PICK, CARDIO_WALK } from '../../data/cardioBank'

function ExerciseList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="text-base text-fog/90">
          {item}
        </li>
      ))}
    </ul>
  )
}

export function CardioSession() {
  return (
    <div className="mt-6 pb-8">
      <section className="rounded-2xl border border-fog/20 bg-panel p-5">
        <p className="text-sm font-semibold text-fog/70">First</p>
        <h2 className="mt-1 text-2xl font-semibold text-lime">{CARDIO_WALK.name}</h2>
        <p className="mt-1 text-lg text-fog">{CARDIO_WALK.duration}</p>
      </section>

      <p className="mt-6 text-fog/80">{CARDIO_PICK}</p>

      <div className="mt-4 space-y-4">
        {CARDIO_BANK.map((group) => (
          <section key={group.id} className="rounded-2xl border border-fog/20 bg-panel p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-fog">{group.title}</h2>
              {group.later ? (
                <span className="rounded-full bg-app px-2 py-0.5 text-xs font-semibold text-fog/70">
                  Later
                </span>
              ) : null}
            </div>
            {group.note ? <p className="mt-2 text-sm text-fog/70">{group.note}</p> : null}
            {group.items ? <ExerciseList items={group.items} /> : null}
            {group.sections?.map((section) => (
              <div key={section.title} className="mt-4">
                <h3 className="text-sm font-semibold text-lime">{section.title}</h3>
                <ExerciseList items={section.items} />
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
