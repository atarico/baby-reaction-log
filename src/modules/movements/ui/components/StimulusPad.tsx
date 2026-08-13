import { STIMULI, type StimulusId } from '../../domain/Stimulus.ts'
import { appearanceOf } from '../stimulusAppearance.ts'

interface StimulusPadProps {
  readonly onPick: (stimulusId: StimulusId) => void
  readonly disabled?: boolean
}

export const StimulusPad = ({ onPick, disabled = false }: StimulusPadProps) => (
  <div className="pad" role="group" aria-label="Registrar un movimiento según el estímulo">
    {STIMULI.map((stimulus) => {
      const { icon, hue } = appearanceOf(stimulus.id)

      return (
        <button
          key={stimulus.id}
          type="button"
          className="pad__key"
          style={{ '--key-hue': hue } as React.CSSProperties}
          onClick={() => onPick(stimulus.id)}
          disabled={disabled}
        >
          <span className="pad__glyph" aria-hidden="true">
            {icon}
          </span>
          <span className="pad__label">{stimulus.label}</span>
        </button>
      )
    })}
  </div>
)
