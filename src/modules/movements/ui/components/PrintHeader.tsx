import type { Movement } from '../../domain/Movement.ts'
import { formatFullDate, formatTime } from '../formatDay.ts'

interface PrintHeaderProps {
  /** Sorted from the most recent to the oldest. */
  readonly movements: readonly Movement[]
  readonly now: Date
}

/**
 * Only ever visible on paper. The screen has a wordmark; a printed sheet handed
 * to a pediatrician needs to say what it is, how many entries it holds and the
 * period it covers.
 */
export const PrintHeader = ({ movements, now }: PrintHeaderProps) => {
  const newest = movements.at(0)
  const oldest = movements.at(-1)

  return (
    <header className="print-header">
      <h1 className="print-header__title">Registro de reacciones</h1>

      <p className="print-header__period">
        {oldest && newest
          ? `${movements.length} registros · del ${formatFullDate(
              oldest.occurredAt,
            )} al ${formatFullDate(newest.occurredAt)}`
          : 'Sin registros'}
      </p>

      <p className="print-header__generated">
        Generado el {formatFullDate(now.toISOString())} a las {formatTime(now.toISOString())}
      </p>
    </header>
  )
}
