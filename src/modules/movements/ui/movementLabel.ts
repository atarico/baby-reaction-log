import type { Movement } from '../domain/Movement.ts'
import { findStimulus } from '../domain/Stimulus.ts'

/** What the parent actually reads: the typed-in name wins over the catalog one. */
export const movementLabel = (movement: Movement): string =>
  movement.action ?? findStimulus(movement.stimulusId)?.label ?? movement.stimulusId
