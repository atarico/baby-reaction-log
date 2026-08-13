export interface Stimulus {
  readonly id: string
  readonly label: string
}

export const STIMULI = [
  { id: 'cold-water', label: 'Agua fría' },
  { id: 'warm-water', label: 'Agua tibia' },
  { id: 'light', label: 'Luz' },
  { id: 'touch', label: 'Tacto' },
  { id: 'sound', label: 'Sonido' },
  { id: 'voice', label: 'Voz' },
  { id: 'feeding', label: 'Alimentación' },
  { id: 'position-change', label: 'Cambio de posición' },
  { id: 'spontaneous', label: 'Espontáneo' },
  { id: 'other', label: 'Otro' },
] as const satisfies readonly Stimulus[]

export type StimulusId = (typeof STIMULI)[number]['id']

const STIMULI_BY_ID = new Map<string, Stimulus>(STIMULI.map((stimulus) => [stimulus.id, stimulus]))

export const isStimulusId = (value: string): value is StimulusId => STIMULI_BY_ID.has(value)

export const findStimulus = (id: string): Stimulus | undefined => STIMULI_BY_ID.get(id)
