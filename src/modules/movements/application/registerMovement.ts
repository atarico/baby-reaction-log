import { createMovement, type Movement } from '../domain/Movement.ts'
import type { MovementRepository } from '../domain/MovementRepository.ts'

export interface RegisterMovementDependencies {
  readonly repository: MovementRepository
  readonly now: () => Date
  readonly createId: () => string
}

export interface RegisterMovementInput {
  readonly stimulusId: string
  /** Defaults to the current time. */
  readonly occurredAt?: string
  readonly action?: string
  readonly detail?: string
}

export const registerMovement =
  ({ repository, now, createId }: RegisterMovementDependencies) =>
  async (input: RegisterMovementInput): Promise<Movement> => {
    const currentTime = now()
    const movement = createMovement(
      {
        id: createId(),
        stimulusId: input.stimulusId,
        occurredAt: input.occurredAt ?? currentTime.toISOString(),
        action: input.action,
        detail: input.detail,
      },
      currentTime,
    )

    await repository.save(movement)

    return movement
  }
