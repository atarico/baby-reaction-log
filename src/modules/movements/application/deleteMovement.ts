import type { MovementRepository } from '../domain/MovementRepository.ts'

export interface DeleteMovementDependencies {
  readonly repository: MovementRepository
}

export const deleteMovement =
  ({ repository }: DeleteMovementDependencies) =>
  (id: string): Promise<void> =>
    repository.delete(id)
