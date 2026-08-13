import { useEffect, useRef, useState } from 'react'

interface DescribeOtherDialogProps {
  readonly open: boolean
  readonly onSubmit: (details: string) => void
  readonly onSkip: () => void
}

/**
 * Shown right AFTER an "other" movement is already saved: the timestamp is
 * never at risk, naming the stimulus is optional follow-up work.
 */
export const DescribeOtherDialog = ({ open, onSubmit, onSkip }: DescribeOtherDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [details, setDetails] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      setDetails('')
      dialog.showModal()
      inputRef.current?.focus()
    } else {
      dialog.close()
    }
  }, [open])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()

    const named = details.trim()
    if (named === '') onSkip()
    else onSubmit(named)
  }

  return (
    <dialog ref={dialogRef} className="sheet" onClose={onSkip}>
      <form className="sheet__form" onSubmit={submit}>
        <h2 className="sheet__title">¿Cuál fue el estímulo?</h2>
        <p className="sheet__hint">
          El movimiento ya quedó registrado con su hora. Escriba un nombre para poder distinguirlo
          más adelante.
        </p>

        <label className="field">
          <span className="field__label">Estímulo</span>
          <input
            ref={inputRef}
            className="field__control"
            type="text"
            placeholder="Cambio de pañal"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
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
