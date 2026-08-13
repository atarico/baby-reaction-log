import { describe, expect, it } from 'vitest'
import { createMovement, InvalidMovementError } from './Movement.ts'

const now = new Date('2026-08-12T18:00:00.000Z')

describe('createMovement', () => {
  it('creates a movement with the given id, stimulus and timestamp', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'cold-water', occurredAt: '2026-08-12T17:30:00.000Z' },
      now,
    )

    expect(movement).toEqual({
      id: 'mov-1',
      stimulusId: 'cold-water',
      occurredAt: '2026-08-12T17:30:00.000Z',
      note: undefined,
    })
  })

  it('normalizes the timestamp to ISO 8601 in UTC', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'light', occurredAt: '2026-08-12T17:30:00+02:00' },
      now,
    )

    expect(movement.occurredAt).toBe('2026-08-12T15:30:00.000Z')
  })

  it('keeps the details naming an "other" stimulus', () => {
    const movement = createMovement(
      {
        id: 'mov-1',
        stimulusId: 'other',
        occurredAt: now.toISOString(),
        details: '  Cambio de pañal  ',
      },
      now,
    )

    expect(movement.details).toBe('Cambio de pañal')
  })

  it('drops blank details', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'other', occurredAt: now.toISOString(), details: '   ' },
      now,
    )

    expect(movement.details).toBeUndefined()
  })

  it('allows an "other" movement that has not been named yet', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'other', occurredAt: now.toISOString() },
      now,
    )

    expect(movement.details).toBeUndefined()
  })

  it('trims the note and drops it when empty', () => {
    const withNote = createMovement(
      { id: 'mov-1', stimulusId: 'touch', occurredAt: now.toISOString(), note: '  kicked twice  ' },
      now,
    )
    const withBlankNote = createMovement(
      { id: 'mov-2', stimulusId: 'touch', occurredAt: now.toISOString(), note: '   ' },
      now,
    )

    expect(withNote.note).toBe('kicked twice')
    expect(withBlankNote.note).toBeUndefined()
  })

  const reasonOf = (draft: Parameters<typeof createMovement>[0]): unknown => {
    try {
      createMovement(draft, now)
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidMovementError)

      return (error as InvalidMovementError).reason
    }

    throw new Error('createMovement was expected to reject this draft')
  }

  it('rejects an unknown stimulus', () => {
    expect(reasonOf({ id: 'mov-1', stimulusId: 'telepathy', occurredAt: now.toISOString() })).toBe(
      'unknown-stimulus',
    )
  })

  it('rejects an unparsable timestamp', () => {
    expect(reasonOf({ id: 'mov-1', stimulusId: 'light', occurredAt: 'yesterday' })).toBe(
      'unparsable-date',
    )
  })

  it('rejects a timestamp in the future', () => {
    expect(
      reasonOf({ id: 'mov-1', stimulusId: 'light', occurredAt: '2026-08-12T18:00:01.000Z' }),
    ).toBe('future-date')
  })

  it('rejects an empty id', () => {
    expect(reasonOf({ id: '  ', stimulusId: 'light', occurredAt: now.toISOString() })).toBe(
      'empty-id',
    )
  })

  it('rejects details on a stimulus that is already named by the catalog', () => {
    expect(
      reasonOf({
        id: 'mov-1',
        stimulusId: 'light',
        occurredAt: now.toISOString(),
        details: 'Linterna del celular',
      }),
    ).toBe('details-not-allowed')
  })
})
