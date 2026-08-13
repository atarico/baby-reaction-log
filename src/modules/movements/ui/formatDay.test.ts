import { describe, expect, it } from 'vitest'
import { formatDayLabel, toLocalDayKey } from './formatDay.ts'

const today = new Date('2026-08-12T15:00:00.000Z')

describe('toLocalDayKey', () => {
  it('formats a date as its local YYYY-MM-DD key', () => {
    expect(toLocalDayKey(new Date('2026-08-12T15:00:00.000Z'))).toBe('2026-08-12')
  })

  it('uses the local day, not the UTC one', () => {
    // 00:30Z is still the previous day in America/Argentina/Buenos_Aires.
    expect(toLocalDayKey(new Date('2026-08-12T00:30:00.000Z'))).toBe('2026-08-11')
  })
})

describe('formatDayLabel', () => {
  it('labels the current day as Hoy', () => {
    expect(formatDayLabel('2026-08-12', today)).toBe('Hoy')
  })

  it('labels the previous day as Ayer', () => {
    expect(formatDayLabel('2026-08-11', today)).toBe('Ayer')
  })

  it('spells out any older day', () => {
    expect(formatDayLabel('2026-08-03', today)).toBe('lun 3 ago 2026')
  })
})
