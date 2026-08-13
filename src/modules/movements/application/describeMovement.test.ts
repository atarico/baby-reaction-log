import { beforeEach, describe, expect, it } from 'vitest'
import { InvalidMovementError, type Movement } from '../domain/Movement.ts'
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository.ts'
import { describeMovement } from './describeMovement.ts'

const now = new Date('2026-08-12T18:00:00.000Z')

const movement = (stimulusId: Movement['stimulusId'] = 'other'): Movement => ({
  id: 'mov-1',
  stimulusId,
  occurredAt: '2026-08-12T17:00:00.000Z',
})

describe('describeMovement', () => {
  let repository: InMemoryMovementRepository
  let describe_: ReturnType<typeof describeMovement>

  beforeEach(async () => {
    repository = new InMemoryMovementRepository()
    describe_ = describeMovement({ repository, now: () => now })
    await repository.save(movement())
  })

  it('adds a detail to a movement of any stimulus', async () => {
    const light = movement('position-change')
    await repository.save(light)

    const described = await describe_(light, { detail: 'Me recosté del lado izquierdo' })

    expect(described.detail).toBe('Me recosté del lado izquierdo')
  })

  it('adds the action and the detail of an "other" movement at once', async () => {
    const described = await describe_(movement(), {
      action: 'Cambio de posición',
      detail: 'Me recosté del lado izquierdo y se movió',
    })

    expect(described.action).toBe('Cambio de posición')
    expect(described.detail).toBe('Me recosté del lado izquierdo y se movió')
  })

  it('persists the description without duplicating the movement', async () => {
    await describe_(movement(), { action: 'Cambio de pañal' })

    const stored = await repository.findAll()

    expect(stored).toHaveLength(1)
    expect(stored[0].action).toBe('Cambio de pañal')
  })

  it('keeps the original id and timestamp untouched', async () => {
    const described = await describe_(movement(), { detail: 'Se movió mucho' })

    expect(described.id).toBe('mov-1')
    expect(described.occurredAt).toBe('2026-08-12T17:00:00.000Z')
  })

  it('clears a description given a blank value', async () => {
    await describe_(movement(), { action: 'Cambio de pañal', detail: 'Se movió' })
    await describe_(movement(), { action: '   ', detail: '  ' })

    const [stored] = await repository.findAll()

    expect(stored.action).toBeUndefined()
    expect(stored.detail).toBeUndefined()
  })

  it('refuses an action on a stimulus that the catalog already names', async () => {
    const light = movement('light')
    await repository.save(light)

    await expect(describe_(light, { action: 'Linterna' })).rejects.toThrow(InvalidMovementError)
  })
})
