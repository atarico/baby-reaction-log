const DAY_IN_MS = 24 * 60 * 60 * 1000

const fullDayFormatter = new Intl.DateTimeFormat('es', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('es', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const fullDateFormatter = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Spelled out in full — for a document someone reads on paper. */
export const formatFullDate = (isoTimestamp: string): string =>
  fullDateFormatter.format(new Date(isoTimestamp))

export const toLocalDayKey = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

const dayKeyOffsetBy = (days: number, from: Date): string =>
  toLocalDayKey(new Date(from.getTime() + days * DAY_IN_MS))

export const formatDayLabel = (dayKey: string, now: Date): string => {
  if (dayKey === toLocalDayKey(now)) return 'Hoy'
  if (dayKey === dayKeyOffsetBy(-1, now)) return 'Ayer'

  return fullDayFormatter.format(new Date(`${dayKey}T12:00:00`)).replaceAll(',', '')
}

export const formatTime = (isoTimestamp: string): string =>
  timeFormatter.format(new Date(isoTimestamp))
