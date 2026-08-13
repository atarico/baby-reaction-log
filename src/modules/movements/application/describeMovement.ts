import { createMovement, type Movement } from '../domain/Movement.ts'
import type { MovementRepository } from '../domain/MovementRepository.ts'

export interface DescribeMovementDependencies {
  readonly repository: MovementRepository
  readonly now: () => Date
}

/**
 * Names the stimulus of a movement that was already registered as "other".
 * The timestamp is captured on the first tap, so nothing is lost if the parent
 * never gets around to naming it.
 */
export const describeMovement =
  ({ repository, now }: DescribeMovementDependencies) =>
  async (movement: Movement, details: string): Promise<Movement> => {
    const described = createMovement({ ...movement, details }, now())

    await repository.save(described)

    return described
  }
