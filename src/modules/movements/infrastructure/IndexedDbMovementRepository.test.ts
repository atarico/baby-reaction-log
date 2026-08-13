import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Movement } from '../domain/Movement.ts'
import { IndexedDbMovementRepository } from './IndexedDbMovementRepository.ts'

const movement = (id: string, occurredAt: string): Movement => ({
  id,
  stimulusId: 'touch',
  occurredAt,
})

describe('IndexedDbMovementRepository', () => {
  let repository: IndexedDbMovementRepository

  beforeEach(async () => {
    repository = new IndexedDbMovementRepository('baby-moves-test')
    await repository.clear()
  })

  afterEach(() => {
    repository.close()
  })

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([])
  })

  it('persists a movement and reads it back', async () => {
    const saved = movement('a', '2026-08-12T10:00:00.000Z')

    await repository.save(saved)

    expect(await repository.findAll()).toEqual([saved])
  })

  it('returns the movements from the most recent to the oldest', async () => {
    await repository.save(movement('old', '2026-08-10T10:00:00.000Z'))
    await repository.save(movement('new', '2026-08-12T10:00:00.000Z'))
    await repository.save(movement('mid', '2026-08-11T10:00:00.000Z'))

    expect((await repository.findAll()).map((m) => m.id)).toEqual(['new', 'mid', 'old'])
  })

  it('overwrites a movement saved twice with the same id', async () => {
    await repository.save(movement('a', '2026-08-10T10:00:00.000Z'))
    await repository.save(movement('a', '2026-08-11T10:00:00.000Z'))

    const movements = await repository.findAll()

    expect(movements).toHaveLength(1)
    expect(movements[0].occurredAt).toBe('2026-08-11T10:00:00.000Z')
  })

  it('deletes a movement by id', async () => {
    await repository.save(movement('a', '2026-08-10T10:00:00.000Z'))
    await repository.save(movement('b', '2026-08-11T10:00:00.000Z'))

    await repository.delete('a')

    expect((await repository.findAll()).map((m) => m.id)).toEqual(['b'])
  })

  it('survives a reconnection to the same database', async () => {
    await repository.save(movement('a', '2026-08-10T10:00:00.000Z'))
    repository.close()

    const reopened = new IndexedDbMovementRepository('baby-moves-test')

    expect((await reopened.findAll()).map((m) => m.id)).toEqual(['a'])
    reopened.close()
  })
})
