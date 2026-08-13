import { describe, expect, it } from 'vitest'
import type { Movement } from '../domain/Movement.ts'
import { toCsv, toJson } from './exportMovements.ts'

const movement = (overrides: Partial<Movement> = {}): Movement => ({
  id: 'mov-1',
  stimulusId: 'cold-water',
  occurredAt: '2026-08-12T18:00:00.000Z',
  ...overrides,
})

const HEADER = 'id,occurred_at,stimulus,details,note'

describe('toCsv', () => {
  it('always writes the header row', () => {
    expect(toCsv([])).toBe(HEADER)
  })

  it('writes one row per movement', () => {
    const csv = toCsv([
      movement(),
      movement({ id: 'mov-2', stimulusId: 'light', occurredAt: '2026-08-12T19:00:00.000Z' }),
    ])

    expect(csv.split('\n')).toEqual([
      HEADER,
      'mov-1,2026-08-12T18:00:00.000Z,cold-water,,',
      'mov-2,2026-08-12T19:00:00.000Z,light,,',
    ])
  })

  it('writes the details naming an "other" stimulus', () => {
    const csv = toCsv([
      movement({ stimulusId: 'other', details: 'Cambio de pañal', note: 'muy activo' }),
    ])

    expect(csv.split('\n').at(1)).toBe(
      'mov-1,2026-08-12T18:00:00.000Z,other,Cambio de pañal,muy activo',
    )
  })

  it('quotes and escapes notes containing commas, quotes or newlines', () => {
    const csv = toCsv([movement({ note: 'kicked, hard "twice"\nthen slept' })])

    expect(csv).toBe(
      `${HEADER}\n` +
        'mov-1,2026-08-12T18:00:00.000Z,cold-water,,"kicked, hard ""twice""\nthen slept"',
    )
  })
})

describe('toJson', () => {
  it('serializes the movements as a pretty-printed array', () => {
    const movements = [movement()]

    expect(JSON.parse(toJson(movements))).toEqual(movements)
    expect(toJson(movements)).toContain('\n')
  })
})
