import { deleteMovement } from './application/deleteMovement.ts'
import { describeMovement } from './application/describeMovement.ts'
import { listMovements } from './application/listMovements.ts'
import { registerMovement } from './application/registerMovement.ts'
import { IndexedDbMovementRepository } from './infrastructure/IndexedDbMovementRepository.ts'

/**
 * Composition root of the movements module: the only place where the domain
 * meets a concrete adapter. Swapping IndexedDB for a remote API is a one-line
 * change here.
 */
const repository = new IndexedDbMovementRepository()

export const movementsModule = {
  register: registerMovement({
    repository,
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  }),
  describe: describeMovement({ repository, now: () => new Date() }),
  list: listMovements({ repository }),
  remove: deleteMovement({ repository }),
}
