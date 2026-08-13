import type { Movement } from '../domain/Movement.ts'

const CSV_HEADER = 'id,occurred_at,stimulus,details,note'

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
        movement.details ?? '',
        movement.note ?? '',
      ]
        .map(escapeCsvField)
        .join(','),
    ),
  ].join('\n')

export const toJson = (movements: readonly Movement[]): string => JSON.stringify(movements, null, 2)
