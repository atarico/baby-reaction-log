import { describe, expect, it } from 'vitest'
import { fromDateTimeInputValue, toDateTimeInputValue } from './dateTimeInput.ts'

describe('toDateTimeInputValue', () => {
  it('renders a date as the local value a datetime-local input expects', () => {
    // 15:00Z is 12:00 in America/Argentina/Buenos_Aires.
    expect(toDateTimeInputValue(new Date('2026-08-12T15:00:00.000Z'))).toBe('2026-08-12T12:00')
  })

  it('pads single digit months, days, hours and minutes', () => {
    expect(toDateTimeInputValue(new Date('2026-03-05T12:07:00.000Z'))).toBe('2026-03-05T09:07')
  })
})

describe('fromDateTimeInputValue', () => {
  it('reads the local value back as an ISO timestamp in UTC', () => {
    expect(fromDateTimeInputValue('2026-08-12T12:00')).toBe('2026-08-12T15:00:00.000Z')
  })

  it('round-trips with toDateTimeInputValue', () => {
    const date = new Date('2026-08-12T15:34:00.000Z')

    expect(fromDateTimeInputValue(toDateTimeInputValue(date))).toBe(date.toISOString())
  })

  it('rejects an unparsable value', () => {
    expect(() => fromDateTimeInputValue('')).toThrow(RangeError)
  })
})
