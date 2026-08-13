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
      action: undefined,
      detail: undefined,
    })
  })

  it('normalizes the timestamp to ISO 8601 in UTC', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'light', occurredAt: '2026-08-12T17:30:00+02:00' },
      now,
    )

    expect(movement.occurredAt).toBe('2026-08-12T15:30:00.000Z')
  })

  it('trims the detail and keeps it for any stimulus', () => {
    const movement = createMovement(
      {
        id: 'mov-1',
        stimulusId: 'position-change',
        occurredAt: now.toISOString(),
        detail: '  Me recosté del lado izquierdo y se movió  ',
      },
      now,
    )

    expect(movement.detail).toBe('Me recosté del lado izquierdo y se movió')
  })

  it('drops a blank detail', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'light', occurredAt: now.toISOString(), detail: '   ' },
      now,
    )

    expect(movement.detail).toBeUndefined()
  })

  it('allows a movement with no detail yet', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'light', occurredAt: now.toISOString() },
      now,
    )

    expect(movement.detail).toBeUndefined()
  })

  it('trims the action naming an "other" stimulus', () => {
    const movement = createMovement(
      {
        id: 'mov-1',
        stimulusId: 'other',
        occurredAt: now.toISOString(),
        action: '  Cambio de pañal  ',
      },
      now,
    )

    expect(movement.action).toBe('Cambio de pañal')
  })

  it('drops a blank action', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'other', occurredAt: now.toISOString(), action: '   ' },
      now,
    )

    expect(movement.action).toBeUndefined()
  })

  it('allows an "other" movement that has not been named yet', () => {
    const movement = createMovement(
      { id: 'mov-1', stimulusId: 'other', occurredAt: now.toISOString() },
      now,
    )

    expect(movement.action).toBeUndefined()
  })

  it('accepts an action and a detail together on an "other" movement', () => {
    const movement = createMovement(
      {
        id: 'mov-1',
        stimulusId: 'other',
        occurredAt: now.toISOString(),
        action: 'Cambio de posición',
        detail: 'Me recosté del lado izquierdo y se movió',
      },
      now,
    )

    expect(movement.action).toBe('Cambio de posición')
    expect(movement.detail).toBe('Me recosté del lado izquierdo y se movió')
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

  it('rejects an action on a stimulus that the catalog already names', () => {
    expect(
      reasonOf({
        id: 'mov-1',
        stimulusId: 'light',
        occurredAt: now.toISOString(),
        action: 'Linterna del celular',
      }),
    ).toBe('action-not-allowed')
  })
})
