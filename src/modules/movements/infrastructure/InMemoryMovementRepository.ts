import type { Movement } from '../domain/Movement.ts'
import type { MovementRepository } from '../domain/MovementRepository.ts'

export class InMemoryMovementRepository implements MovementRepository {
  private readonly movements = new Map<string, Movement>()

  async save(movement: Movement): Promise<void> {
    this.movements.set(movement.id, movement)
  }

  async findAll(): Promise<Movement[]> {
    return [...this.movements.values()].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  }

  async delete(id: string): Promise<void> {
    this.movements.delete(id)
  }

  async clear(): Promise<void> {
    this.movements.clear()
  }
}
