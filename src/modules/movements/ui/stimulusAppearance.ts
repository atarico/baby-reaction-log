import type { StimulusId } from '../domain/Stimulus.ts'

export interface StimulusAppearance {
  readonly icon: string
  /** Hue used for the chip and the timeline dot, kept desaturated for night use. */
  readonly hue: number
}

const APPEARANCES: Record<StimulusId, StimulusAppearance> = {
  'cold-water': { icon: '❄', hue: 199 },
  'warm-water': { icon: '≋', hue: 24 },
  light: { icon: '☀', hue: 48 },
  touch: { icon: '✶', hue: 336 },
  sound: { icon: '◉', hue: 268 },
  voice: { icon: '❝', hue: 288 },
  feeding: { icon: '◑', hue: 88 },
  'position-change': { icon: '⤿', hue: 168 },
  spontaneous: { icon: '✦', hue: 38 },
  other: { icon: '⁘', hue: 12 },
}

export const appearanceOf = (id: StimulusId): StimulusAppearance => APPEARANCES[id]
