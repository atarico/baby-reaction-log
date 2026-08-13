import { isStimulusId, type StimulusId } from './Stimulus.ts'

export interface Movement {
  readonly id: string
  readonly occurredAt: string
  readonly stimulusId: StimulusId
  /** Names the stimulus when it is not in the catalog. Only valid for `other`. */
  readonly details?: string
  readonly note?: string
}

export interface MovementDraft {
  readonly id: string
  readonly occurredAt: string
  readonly stimulusId: string
  readonly details?: string
  readonly note?: string
}

/** The one stimulus whose real name has to be typed in by hand. */
export const UNLISTED_STIMULUS_ID = 'other'

/**
 * Stable codes instead of prose: the domain stays free of any presentation
 * language, and the UI decides how to word each failure.
 */
export type InvalidMovementReason =
  | 'empty-id'
  | 'unknown-stimulus'
  | 'unparsable-date'
  | 'future-date'
  | 'details-not-allowed'

export class InvalidMovementError extends Error {
  readonly reason: InvalidMovementReason

  constructor(reason: InvalidMovementReason, detail: string) {
    super(`Invalid movement [${reason}]: ${detail}`)
    this.name = 'InvalidMovementError'
    this.reason = reason
  }
}

const blankToUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()

  return trimmed === '' ? undefined : trimmed
}

export const createMovement = (draft: MovementDraft, now: Date): Movement => {
  const id = draft.id.trim()
  if (id === '') throw new InvalidMovementError('empty-id', 'the id cannot be empty')

  if (!isStimulusId(draft.stimulusId)) {
    throw new InvalidMovementError('unknown-stimulus', `unknown stimulus "${draft.stimulusId}"`)
  }

  const occurredAt = new Date(draft.occurredAt)
  if (Number.isNaN(occurredAt.getTime())) {
    throw new InvalidMovementError('unparsable-date', `"${draft.occurredAt}" is not a valid date`)
  }
  if (occurredAt.getTime() > now.getTime()) {
    throw new InvalidMovementError('future-date', 'a movement cannot happen in the future')
  }

  const details = blankToUndefined(draft.details)
  if (details !== undefined && draft.stimulusId !== UNLISTED_STIMULUS_ID) {
    throw new InvalidMovementError(
      'details-not-allowed',
      `"${draft.stimulusId}" is already named by the catalog`,
    )
  }

  return {
    id,
    occurredAt: occurredAt.toISOString(),
    stimulusId: draft.stimulusId,
    details,
    note: blankToUndefined(draft.note),
  }
}
