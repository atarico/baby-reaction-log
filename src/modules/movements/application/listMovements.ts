import type { Movement } from '../domain/Movement.ts'
import type { MovementRepository } from '../domain/MovementRepository.ts'

export interface ListMovementsDependencies {
  readonly repository: MovementRepository
}

export const listMovements =
  ({ repository }: ListMovementsDependencies) =>
  (): Promise<Movement[]> =>
    repository.findAll()
