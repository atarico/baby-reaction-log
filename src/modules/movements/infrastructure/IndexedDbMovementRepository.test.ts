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

  describe('records written by an older version of the app', () => {
    const putRawRecord = (record: Record<string, unknown>): Promise<void> =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('baby-moves-test')

        open.onsuccess = () => {
          const database = open.result
          const transaction = database.transaction('movements', 'readwrite')

          transaction.objectStore('movements').put(record)
          transaction.oncomplete = () => {
            database.close()
            resolve()
          }
          transaction.onerror = () => reject(transaction.error)
        }
        open.onerror = () => reject(open.error)
      })

    it('maps the legacy details field onto action', async () => {
      await putRawRecord({
        id: 'legacy-1',
        occurredAt: '2026-08-10T10:00:00.000Z',
        stimulusId: 'other',
        details: 'Cambio de pañal',
      })

      expect((await repository.findAll())[0].action).toBe('Cambio de pañal')
    })

    it('maps the legacy note field onto detail', async () => {
      await putRawRecord({
        id: 'legacy-1',
        occurredAt: '2026-08-10T10:00:00.000Z',
        stimulusId: 'light',
        note: 'Se sobresaltó',
      })

      expect((await repository.findAll())[0].detail).toBe('Se sobresaltó')
    })

    it('prefers the current fields when both shapes are present', async () => {
      await putRawRecord({
        id: 'legacy-1',
        occurredAt: '2026-08-10T10:00:00.000Z',
        stimulusId: 'other',
        details: 'viejo',
        note: 'vieja',
        action: 'nuevo',
        detail: 'nueva',
      })

      const [movement] = await repository.findAll()

      expect(movement.action).toBe('nuevo')
      expect(movement.detail).toBe('nueva')
    })

    it('does not leak the legacy fields into the returned movement', async () => {
      await putRawRecord({
        id: 'legacy-1',
        occurredAt: '2026-08-10T10:00:00.000Z',
        stimulusId: 'other',
        details: 'Cambio de pañal',
        note: 'Se movió',
      })

      expect(Object.keys((await repository.findAll())[0]).sort()).toEqual([
        'action',
        'detail',
        'id',
        'occurredAt',
        'stimulusId',
      ])
    })
  })

  it('survives a reconnection to the same database', async () => {
    await repository.save(movement('a', '2026-08-10T10:00:00.000Z'))
    repository.close()

    const reopened = new IndexedDbMovementRepository('baby-moves-test')

    expect((await reopened.findAll()).map((m) => m.id)).toEqual(['a'])
    reopened.close()
  })
})
