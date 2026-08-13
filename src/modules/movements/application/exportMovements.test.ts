import { describe, expect, it } from 'vitest'
import type { Movement } from '../domain/Movement.ts'
import { toCsv, toJson } from './exportMovements.ts'

const movement = (overrides: Partial<Movement> = {}): Movement => ({
  id: 'mov-1',
  stimulusId: 'cold-water',
  occurredAt: '2026-08-12T18:00:00.000Z',
  ...overrides,
})

const HEADER = 'id,occurred_at,stimulus,action,detail'

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

  it('writes the detail of any stimulus', () => {
    const csv = toCsv([movement({ stimulusId: 'position-change', detail: 'Lado izquierdo' })])

    expect(csv.split('\n').at(1)).toBe(
      'mov-1,2026-08-12T18:00:00.000Z,position-change,,Lado izquierdo',
    )
  })

  it('writes the action naming an "other" stimulus', () => {
    const csv = toCsv([
      movement({ stimulusId: 'other', action: 'Cambio de pañal', detail: 'Muy activo' }),
    ])

    expect(csv.split('\n').at(1)).toBe(
      'mov-1,2026-08-12T18:00:00.000Z,other,Cambio de pañal,Muy activo',
    )
  })

  it('quotes and escapes fields containing commas, quotes or newlines', () => {
    const csv = toCsv([movement({ detail: 'kicked, hard "twice"\nthen slept' })])

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
