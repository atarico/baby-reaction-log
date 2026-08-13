import { describe, expect, it } from 'vitest'
import type { Movement } from '../domain/Movement.ts'
import { movementLabel } from './movementLabel.ts'

const movement = (overrides: Partial<Movement> = {}): Movement => ({
  id: 'mov-1',
  stimulusId: 'cold-water',
  occurredAt: '2026-08-12T18:00:00.000Z',
  ...overrides,
})

describe('movementLabel', () => {
  it('uses the catalog label of a known stimulus', () => {
    expect(movementLabel(movement())).toBe('Agua fría')
  })

  it('prefers the action when the stimulus was named by hand', () => {
    expect(movementLabel(movement({ stimulusId: 'other', action: 'Cambio de pañal' }))).toBe(
      'Cambio de pañal',
    )
  })

  it('falls back to the catalog label when "other" was never named', () => {
    expect(movementLabel(movement({ stimulusId: 'other' }))).toBe('Otro')
  })
})
