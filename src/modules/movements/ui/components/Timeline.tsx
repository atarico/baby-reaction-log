import type { MovementsOfDay } from '../../domain/groupMovementsByDay.ts'
import { formatDayLabel } from '../formatDay.ts'
import { TimelineEntry } from './TimelineEntry.tsx'

interface TimelineProps {
  readonly days: readonly MovementsOfDay[]
  readonly now: Date
  readonly latestId: string | null
  readonly onRemove: (id: string) => void
}

export const Timeline = ({ days, now, latestId, onRemove }: TimelineProps) => {
  if (days.length === 0) {
    return (
      <div className="timeline timeline--empty">
        <p className="timeline__empty-title">Todavía no hay registros</p>
        <p className="timeline__empty-hint">
          Toque un estímulo del panel inferior apenas el bebé se mueva. La hora se guarda
          automáticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="timeline">
      {days.map((day) => (
        <section className="day" key={day.day}>
          <header className="day__header">
            <h2 className="day__label">{formatDayLabel(day.day, now)}</h2>
            <span className="day__count">{day.movements.length}</span>
          </header>

          <ol className="day__entries">
            {day.movements.map((movement) => (
              <TimelineEntry
                key={movement.id}
                movement={movement}
                isLatest={movement.id === latestId}
                onRemove={onRemove}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
