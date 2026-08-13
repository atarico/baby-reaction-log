import type { Movement } from './Movement.ts'

export interface MovementsOfDay {
  /** Local calendar day, formatted as YYYY-MM-DD. */
  readonly day: string
  readonly movements: readonly Movement[]
}

const toLocalDay = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

const byMostRecentFirst = (a: Movement, b: Movement): number =>
  b.occurredAt.localeCompare(a.occurredAt)

export const groupMovementsByDay = (movements: readonly Movement[]): MovementsOfDay[] => {
  const days = new Map<string, Movement[]>()

  for (const movement of movements) {
    const day = toLocalDay(movement.occurredAt)
    const movementsOfDay = days.get(day)

    if (movementsOfDay) movementsOfDay.push(movement)
    else days.set(day, [movement])
  }

  return [...days.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, movementsOfDay]) => ({
      day,
      movements: [...movementsOfDay].sort(byMostRecentFirst),
    }))
}
