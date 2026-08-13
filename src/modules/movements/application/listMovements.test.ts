import { beforeEach, describe, expect, it } from 'vitest'
import type { Movement } from '../domain/Movement.ts'
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository.ts'
import { deleteMovement } from './deleteMovement.ts'
import { listMovements } from './listMovements.ts'

const movement = (id: string, occurredAt: string): Movement => ({
  id,
  stimulusId: 'touch',
  occurredAt,
})

describe('listMovements', () => {
  let repository: InMemoryMovementRepository

  beforeEach(() => {
    repository = new InMemoryMovementRepository()
  })

  it('returns an empty list when nothing was registered', async () => {
    expect(await listMovements({ repository })()).toEqual([])
  })

  it('returns the movements from the most recent to the oldest', async () => {
    await repository.save(movement('old', '2026-08-10T10:00:00.000Z'))
    await repository.save(movement('new', '2026-08-12T10:00:00.000Z'))
    await repository.save(movement('mid', '2026-08-11T10:00:00.000Z'))

    const movements = await listMovements({ repository })()

    expect(movements.map((m) => m.id)).toEqual(['new', 'mid', 'old'])
  })
})

describe('deleteMovement', () => {
  let repository: InMemoryMovementRepository

  beforeEach(() => {
    repository = new InMemoryMovementRepository()
  })

  it('removes the movement with the given id', async () => {
    await repository.save(movement('a', '2026-08-12T10:00:00.000Z'))
    await repository.save(movement('b', '2026-08-12T11:00:00.000Z'))

    await deleteMovement({ repository })('a')

    expect((await repository.findAll()).map((m) => m.id)).toEqual(['b'])
  })

  it('leaves the repository untouched when the id is unknown', async () => {
    await repository.save(movement('a', '2026-08-12T10:00:00.000Z'))

    await deleteMovement({ repository })('ghost')

    expect((await repository.findAll()).map((m) => m.id)).toEqual(['a'])
  })
})
