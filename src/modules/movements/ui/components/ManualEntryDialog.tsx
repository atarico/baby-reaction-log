import { useEffect, useRef, useState } from 'react'
import { UNLISTED_STIMULUS_ID } from '../../domain/Movement.ts'
import { STIMULI, type StimulusId } from '../../domain/Stimulus.ts'
import { fromDateTimeInputValue, toDateTimeInputValue } from '../dateTimeInput.ts'

export interface ManualEntry {
  readonly stimulusId: StimulusId
  readonly occurredAt: string
  readonly details?: string
  readonly note?: string
}

interface ManualEntryDialogProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onSubmit: (entry: ManualEntry) => void
}

export const ManualEntryDialog = ({ open, onClose, onSubmit }: ManualEntryDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [stimulusId, setStimulusId] = useState<StimulusId>(STIMULI[0].id)
  const [occurredAt, setOccurredAt] = useState(() => toDateTimeInputValue(new Date()))
  const [details, setDetails] = useState('')
  const [note, setNote] = useState('')
  const isUnlisted = stimulusId === UNLISTED_STIMULUS_ID

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      setOccurredAt(toDateTimeInputValue(new Date()))
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()

    onSubmit({
      stimulusId,
      occurredAt: fromDateTimeInputValue(occurredAt),
      details: isUnlisted ? details.trim() || undefined : undefined,
      note: note.trim() || undefined,
    })
    setDetails('')
    setNote('')
    onClose()
  }

  return (
    <dialog ref={dialogRef} className="sheet" onClose={onClose}>
      <form className="sheet__form" onSubmit={submit}>
        <h2 className="sheet__title">Registrar un movimiento anterior</h2>

        <label className="field">
          <span className="field__label">Estímulo</span>
          <select
            className="field__control"
            value={stimulusId}
            onChange={(event) => setStimulusId(event.target.value as StimulusId)}
          >
            {STIMULI.map((stimulus) => (
              <option key={stimulus.id} value={stimulus.id}>
                {stimulus.label}
              </option>
            ))}
          </select>
        </label>

        {isUnlisted ? (
          <label className="field">
            <span className="field__label">¿Cuál fue el estímulo?</span>
            <input
              className="field__control"
              type="text"
              placeholder="Cambio de pañal"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </label>
        ) : null}

        <label className="field">
          <span className="field__label">Fecha y hora</span>
          <input
            className="field__control"
            type="datetime-local"
            required
            max={toDateTimeInputValue(new Date())}
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Nota (opcional)</span>
          <input
            className="field__control"
            type="text"
            placeholder="Pateó dos veces, pierna derecha"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="sheet__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary">
            Guardar
          </button>
        </div>
      </form>
    </dialog>
  )
}
