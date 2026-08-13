import type { Movement } from '../domain/Movement.ts'

const CSV_HEADER = 'id,occurred_at,stimulus,action,detail'

const escapeCsvField = (value: string): string =>
  /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value

export const toCsv = (movements: readonly Movement[]): string =>
  [
    CSV_HEADER,
    ...movements.map((movement) =>
      [
        movement.id,
        movement.occurredAt,
        movement.stimulusId,
        movement.action ?? '',
        movement.detail ?? '',
      ]
        .map(escapeCsvField)
        .join(','),
    ),
  ].join('\n')

export const toJson = (movements: readonly Movement[]): string => JSON.stringify(movements, null, 2)
