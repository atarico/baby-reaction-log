import { beforeEach, describe, expect, it } from 'vitest'
import { InvalidMovementError } from '../domain/Movement.ts'
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository.ts'
import { registerMovement } from './registerMovement.ts'

describe('registerMovement', () => {
  let repository: InMemoryMovementRepository
  let ids: string[]
  let register: ReturnType<typeof registerMovement>

  beforeEach(() => {
    repository = new InMemoryMovementRepository()
    ids = ['id-1', 'id-2', 'id-3']
    register = registerMovement({
      repository,
      now: () => new Date('2026-08-12T18:00:00.000Z'),
      createId: () => ids.shift() ?? 'exhausted',
    })
  })

  it('stamps the movement with the current time when no timestamp is given', async () => {
    const movement = await register({ stimulusId: 'cold-water' })

    expect(movement.occurredAt).toBe('2026-08-12T18:00:00.000Z')
    expect(movement.stimulusId).toBe('cold-water')
  })

  it('honours an explicit timestamp', async () => {
    const movement = await register({
      stimulusId: 'light',
      occurredAt: '2026-08-12T17:00:00.000Z',
    })

    expect(movement.occurredAt).toBe('2026-08-12T17:00:00.000Z')
  })

  it('assigns a unique id to every movement', async () => {
    const first = await register({ stimulusId: 'touch' })
    const second = await register({ stimulusId: 'touch' })

    expect(first.id).toBe('id-1')
    expect(second.id).toBe('id-2')
  })

  it('persists the movement in the repository', async () => {
    const movement = await register({ stimulusId: 'sound', note: 'startled' })

    expect(await repository.findAll()).toEqual([movement])
  })

  it('persists nothing when the movement is invalid', async () => {
    await expect(register({ stimulusId: 'telepathy' })).rejects.toThrow(InvalidMovementError)
    expect(await repository.findAll()).toEqual([])
  })
})
