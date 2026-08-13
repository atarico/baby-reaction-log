import { beforeEach, describe, expect, it } from 'vitest'
import { InvalidMovementError, type Movement } from '../domain/Movement.ts'
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository.ts'
import { describeMovement } from './describeMovement.ts'

const now = new Date('2026-08-12T18:00:00.000Z')

const otherMovement = (): Movement => ({
  id: 'mov-1',
  stimulusId: 'other',
  occurredAt: '2026-08-12T17:00:00.000Z',
})

describe('describeMovement', () => {
  let repository: InMemoryMovementRepository
  let describe_: ReturnType<typeof describeMovement>

  beforeEach(async () => {
    repository = new InMemoryMovementRepository()
    describe_ = describeMovement({ repository, now: () => now })
    await repository.save(otherMovement())
  })

  it('names the stimulus of an already registered movement', async () => {
    const described = await describe_(otherMovement(), 'Cambio de pañal')

    expect(described.details).toBe('Cambio de pañal')
  })

  it('persists the description without duplicating the movement', async () => {
    await describe_(otherMovement(), 'Cambio de pañal')

    const stored = await repository.findAll()

    expect(stored).toHaveLength(1)
    expect(stored[0].details).toBe('Cambio de pañal')
  })

  it('keeps the original id and timestamp untouched', async () => {
    const described = await describe_(otherMovement(), 'Cambio de pañal')

    expect(described.id).toBe('mov-1')
    expect(described.occurredAt).toBe('2026-08-12T17:00:00.000Z')
  })

  it('clears the description when given a blank value', async () => {
    await describe_(otherMovement(), 'Cambio de pañal')
    await describe_(otherMovement(), '   ')

    expect((await repository.findAll())[0].details).toBeUndefined()
  })

  it('refuses to describe a stimulus that the catalog already names', async () => {
    const light: Movement = { id: 'mov-2', stimulusId: 'light', occurredAt: now.toISOString() }

    await expect(describe_(light, 'Linterna')).rejects.toThrow(InvalidMovementError)
  })
})
