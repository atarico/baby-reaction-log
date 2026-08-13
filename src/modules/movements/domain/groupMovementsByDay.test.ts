import { describe, expect, it } from 'vitest'
import type { Movement } from './Movement.ts'
import { groupMovementsByDay } from './groupMovementsByDay.ts'

const movement = (id: string, occurredAt: string): Movement => ({
  id,
  stimulusId: 'touch',
  occurredAt,
})

describe('groupMovementsByDay', () => {
  it('returns no groups for an empty list', () => {
    expect(groupMovementsByDay([])).toEqual([])
  })

  it('groups movements that share the same local calendar day', () => {
    const groups = groupMovementsByDay([
      movement('a', '2026-08-12T10:00:00.000Z'),
      movement('b', '2026-08-12T12:00:00.000Z'),
      movement('c', '2026-08-11T09:00:00.000Z'),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0].movements.map((m) => m.id)).toEqual(['b', 'a'])
    expect(groups[1].movements.map((m) => m.id)).toEqual(['c'])
  })

  it('orders groups from the most recent day to the oldest', () => {
    const groups = groupMovementsByDay([
      movement('old', '2026-08-01T10:00:00.000Z'),
      movement('recent', '2026-08-12T10:00:00.000Z'),
    ])

    expect(groups.map((group) => group.movements[0].id)).toEqual(['recent', 'old'])
  })

  it('orders movements inside a group from the most recent to the oldest', () => {
    const groups = groupMovementsByDay([
      movement('early', '2026-08-12T12:00:00.000Z'),
      movement('late', '2026-08-12T23:00:00.000Z'),
      movement('mid', '2026-08-12T15:00:00.000Z'),
    ])

    expect(groups[0].movements.map((m) => m.id)).toEqual(['late', 'mid', 'early'])
  })

  it('keys each group by its local calendar day', () => {
    const [group] = groupMovementsByDay([movement('a', '2026-08-12T12:00:00.000Z')])
    const expectedDay = new Date('2026-08-12T12:00:00.000Z')

    expect(group.day).toBe(
      [
        expectedDay.getFullYear(),
        String(expectedDay.getMonth() + 1).padStart(2, '0'),
        String(expectedDay.getDate()).padStart(2, '0'),
      ].join('-'),
    )
  })
})
