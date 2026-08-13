import { InvalidMovementError, type InvalidMovementReason } from '../domain/Movement.ts'

const MESSAGES: Record<InvalidMovementReason, string> = {
  'empty-id': 'No se pudo generar un identificador para el registro.',
  'unknown-stimulus': 'Ese estímulo no existe en el catálogo.',
  'unparsable-date': 'La fecha y hora ingresadas no son válidas.',
  'future-date': 'No se puede registrar un movimiento en el futuro.',
  'action-not-allowed': 'Solo el estímulo "Otro" lleva una acción escrita a mano.',
}

export const errorMessage = (cause: unknown): string => {
  if (cause instanceof InvalidMovementError) return MESSAGES[cause.reason]

  return 'No se pudo guardar el registro. Intente nuevamente.'
}
