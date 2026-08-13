import type { Movement } from '../../domain/Movement.ts'
import { formatTime } from '../formatDay.ts'
import { movementLabel } from '../movementLabel.ts'
import { appearanceOf } from '../stimulusAppearance.ts'

interface TimelineEntryProps {
  readonly movement: Movement
  readonly isLatest: boolean
  readonly onRemove: (id: string) => void
}

export const TimelineEntry = ({ movement, isLatest, onRemove }: TimelineEntryProps) => {
  const { icon, hue } = appearanceOf(movement.stimulusId)
  const label = movementLabel(movement)

  return (
    <li
      className={`entry${isLatest ? ' entry--fresh' : ''}`}
      style={{ '--key-hue': hue } as React.CSSProperties}
    >
      <time className="entry__time" dateTime={movement.occurredAt}>
        {formatTime(movement.occurredAt)}
      </time>

      <span className="entry__dot" aria-hidden="true" />

      <div className="entry__body">
        <p className="entry__stimulus">
          <span className="entry__glyph" aria-hidden="true">
            {icon}
          </span>
          {label}
        </p>
        {movement.detail ? <p className="entry__detail">{movement.detail}</p> : null}
      </div>

      <button
        type="button"
        className="entry__remove"
        onClick={() => onRemove(movement.id)}
        aria-label={`Eliminar el movimiento de ${label} de las ${formatTime(movement.occurredAt)}`}
      >
        ✕
      </button>
    </li>
  )
}
