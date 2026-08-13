import { useState } from 'react'
import { toCsv, toJson } from '../../application/exportMovements.ts'
import type { Movement } from '../../domain/Movement.ts'
import type { StimulusId } from '../../domain/Stimulus.ts'
import { ActionsMenu } from '../components/ActionsMenu.tsx'
import { DescribeMovementDialog } from '../components/DescribeMovementDialog.tsx'
import { ManualEntryDialog, type ManualEntry } from '../components/ManualEntryDialog.tsx'
import { PrintHeader } from '../components/PrintHeader.tsx'
import { StimulusPad } from '../components/StimulusPad.tsx'
import { Timeline } from '../components/Timeline.tsx'
import { Toast } from '../components/Toast.tsx'
import { downloadFile } from '../downloadFile.ts'
import { formatTime, toLocalDayKey } from '../formatDay.ts'
import { useMovements } from '../hooks/useMovements.ts'
import { useNow } from '../hooks/useNow.ts'
import { movementLabel } from '../movementLabel.ts'

export const MovementTracker = () => {
  const {
    days,
    status,
    error,
    lastRegistered,
    register,
    describe,
    remove,
    dismissLastRegistered,
    dismissError,
    allMovements,
  } = useMovements()
  const now = useNow()
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [describing, setDescribing] = useState<Movement | null>(null)

  // Log first, describe after: the timestamp is what must never be lost while
  // the parent is holding a baby. The prompt is always offered, never required.
  const pickStimulus = async (stimulusId: StimulusId) => {
    const movement = await register({ stimulusId })

    if (movement) setDescribing(movement)
  }

  const todayKey = toLocalDayKey(now)
  const todayCount = days.find((day) => day.day === todayKey)?.movements.length ?? 0

  const exportAs = (format: 'csv' | 'json') => {
    const stamp = toLocalDayKey(now)

    if (format === 'csv')
      downloadFile(`baby-reactions-${stamp}.csv`, toCsv(allMovements), 'text/csv')
    else downloadFile(`baby-reactions-${stamp}.json`, toJson(allMovements), 'application/json')
  }

  const saveManualEntry = (entry: ManualEntry) => void register(entry)

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="wordmark">
          baby <em>reactions</em>
        </h1>

        <div className="app__meta">
          <span className="counter">
            <strong>{todayCount}</strong> hoy
          </span>

          <ActionsMenu
            actions={[
              { label: 'Registrar un movimiento anterior', onSelect: () => setManualEntryOpen(true) },
              {
                label: 'Exportar CSV',
                onSelect: () => exportAs('csv'),
                disabled: allMovements.length === 0,
              },
              {
                label: 'Exportar JSON (respaldo)',
                onSelect: () => exportAs('json'),
                disabled: allMovements.length === 0,
              },
              {
                label: 'Exportar PDF / imprimir',
                // The browser's own print flow offers "Guardar como PDF" and
                // costs zero kilobytes, which a PDF library would not.
                onSelect: () => window.print(),
                disabled: allMovements.length === 0,
              },
            ]}
          />
        </div>
      </header>

      <main className="app__main">
        <PrintHeader movements={allMovements} now={now} />

        {status === 'loading' ? (
          <p className="app__status">Abriendo el registro…</p>
        ) : (
          <Timeline
            days={days}
            now={now}
            latestId={lastRegistered?.id ?? null}
            onRemove={(id) => void remove(id)}
          />
        )}
      </main>

      <footer className="app__pad">
        <StimulusPad onPick={(stimulusId) => void pickStimulus(stimulusId)} disabled={status === 'failed'} />
      </footer>

      {lastRegistered ? (
        <Toast
          message={`${movementLabel(lastRegistered)} a las ${formatTime(
            lastRegistered.occurredAt,
          )}`}
          actionLabel="Deshacer"
          onAction={() => void remove(lastRegistered.id)}
          onDismiss={dismissLastRegistered}
        />
      ) : null}

      {error ? <Toast message={error} tone="alert" onDismiss={dismissError} /> : null}

      <ManualEntryDialog
        open={manualEntryOpen}
        onClose={() => setManualEntryOpen(false)}
        onSubmit={saveManualEntry}
      />

      <DescribeMovementDialog
        movement={describing}
        onSubmit={(description) => {
          const movement = describing
          setDescribing(null)
          if (movement) void describe(movement, description)
        }}
        onSkip={() => setDescribing(null)}
      />
    </div>
  )
}
