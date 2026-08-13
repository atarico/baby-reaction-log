import type { Movement } from './Movement.ts'

/**
 * Port owned by the domain. Every storage adapter (in memory, IndexedDB, a
 * remote API one day) has to honour this contract, ordering included.
 */
export interface MovementRepository {
  save(movement: Movement): Promise<void>
  /** Movements from the most recent to the oldest. */
  findAll(): Promise<Movement[]>
  delete(id: string): Promise<void>
  clear(): Promise<void>
}
