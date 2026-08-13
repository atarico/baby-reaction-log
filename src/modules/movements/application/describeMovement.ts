import { createMovement, type Movement } from '../domain/Movement.ts'
import type { MovementRepository } from '../domain/MovementRepository.ts'

export interface DescribeMovementDependencies {
  readonly repository: MovementRepository
  readonly now: () => Date
}

export interface MovementDescription {
  /** Only meaningful for the unlisted stimulus. */
  readonly action?: string
  readonly detail?: string
}

/**
 * Fills in what happened on a movement that is ALREADY registered. The
 * timestamp is captured on the first tap, so nothing is lost if the parent
 * never gets around to describing it.
 */
export const describeMovement =
  ({ repository, now }: DescribeMovementDependencies) =>
  async (movement: Movement, description: MovementDescription): Promise<Movement> => {
    const described = createMovement({ ...movement, ...description }, now())

    await repository.save(described)

    return described
  }
