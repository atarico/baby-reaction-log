import { useEffect, useRef, useState } from 'react'
import type { MovementDescription } from '../../application/describeMovement.ts'
import { UNLISTED_STIMULUS_ID, type Movement } from '../../domain/Movement.ts'
import { formatTime } from '../formatDay.ts'
import { movementLabel } from '../movementLabel.ts'

interface DescribeMovementDialogProps {
  /** The movement being described, or null when the dialog is closed. */
  readonly movement: Movement | null
  readonly onSubmit: (description: MovementDescription) => void
  readonly onSkip: () => void
}

/**
 * Shown right AFTER the movement is already saved: the timestamp is never at
 * risk, describing what happened is optional follow-up work.
 */
export const DescribeMovementDialog = ({
  movement,
  onSubmit,
  onSkip,
}: DescribeMovementDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const [action, setAction] = useState('')
  const [detail, setDetail] = useState('')

  const isUnlisted = movement?.stimulusId === UNLISTED_STIMULUS_ID

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (movement) {
      setAction('')
      setDetail('')
      dialog.showModal()
      firstFieldRef.current?.focus()
    } else {
      dialog.close()
    }
  }, [movement])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()

    if (action.trim() === '' && detail.trim() === '') onSkip()
    else onSubmit({ action: isUnlisted ? action : undefined, detail })
  }

  return (
    <dialog ref={dialogRef} className="sheet" onClose={onSkip}>
      <form className="sheet__form" onSubmit={submit}>
        <h2 className="sheet__title">{movement ? movementLabel(movement) : ''}</h2>
        <p className="sheet__hint">
          Registrado a las {movement ? formatTime(movement.occurredAt) : '—'}. Agregue el detalle
          para tener un mejor control.
        </p>

        {isUnlisted ? (
          <label className="field">
            <span className="field__label">Acción</span>
            <input
              ref={firstFieldRef}
              className="field__control"
              type="text"
              placeholder="Cambio de posición"
              value={action}
              onChange={(event) => setAction(event.target.value)}
            />
          </label>
        ) : null}

        <label className="field">
          <span className="field__label">Detalle</span>
          <input
            ref={isUnlisted ? undefined : firstFieldRef}
            className="field__control"
            type="text"
            placeholder="Me recosté del lado izquierdo y se movió"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
          />
        </label>

        <div className="sheet__actions">
          <button type="button" className="button button--ghost" onClick={onSkip}>
            Omitir
          </button>
          <button type="submit" className="button button--primary">
            Guardar
          </button>
        </div>
      </form>
    </dialog>
  )
}
