import { useCallback, useEffect, useMemo, useState } from 'react'
import type { RegisterMovementInput } from '../../application/registerMovement.ts'
import { groupMovementsByDay, type MovementsOfDay } from '../../domain/groupMovementsByDay.ts'
import type { Movement } from '../../domain/Movement.ts'
import { movementsModule } from '../../movementsModule.ts'
import { errorMessage } from '../errorMessage.ts'

export type MovementsStatus = 'loading' | 'ready' | 'failed'

const byMostRecentFirst = (a: Movement, b: Movement): number =>
  b.occurredAt.localeCompare(a.occurredAt)

export interface UseMovements {
  readonly days: MovementsOfDay[]
  readonly status: MovementsStatus
  readonly error: string | null
  readonly lastRegistered: Movement | null
  readonly register: (input: RegisterMovementInput) => Promise<Movement | null>
  readonly describe: (movement: Movement, details: string) => Promise<void>
  readonly remove: (id: string) => Promise<void>
  readonly dismissLastRegistered: () => void
  readonly dismissError: () => void
  readonly allMovements: Movement[]
}

export const useMovements = (): UseMovements => {
  const [movements, setMovements] = useState<Movement[]>([])
  const [status, setStatus] = useState<MovementsStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [lastRegistered, setLastRegistered] = useState<Movement | null>(null)

  useEffect(() => {
    let abandoned = false

    movementsModule
      .list()
      .then((stored) => {
        if (abandoned) return
        setMovements(stored)
        setStatus('ready')
      })
      .catch((cause: unknown) => {
        if (abandoned) return
        setError(errorMessage(cause))
        setStatus('failed')
      })

    return () => {
      abandoned = true
    }
  }, [])

  const register = useCallback(async (input: RegisterMovementInput) => {
    try {
      const movement = await movementsModule.register(input)

      setMovements((current) => [movement, ...current].sort(byMostRecentFirst))
      setLastRegistered(movement)
      setError(null)

      return movement
    } catch (cause) {
      setError(errorMessage(cause))

      return null
    }
  }, [])

  const describe = useCallback(async (movement: Movement, details: string) => {
    try {
      const described = await movementsModule.describe(movement, details)

      setMovements((current) =>
        current.map((candidate) => (candidate.id === described.id ? described : candidate)),
      )
      setLastRegistered((current) => (current?.id === described.id ? described : current))
      setError(null)
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await movementsModule.remove(id)

      setMovements((current) => current.filter((movement) => movement.id !== id))
      setLastRegistered((current) => (current?.id === id ? null : current))
      setError(null)
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }, [])

  const days = useMemo(() => groupMovementsByDay(movements), [movements])

  return {
    days,
    status,
    error,
    lastRegistered,
    register,
    describe,
    remove,
    dismissLastRegistered: useCallback(() => setLastRegistered(null), []),
    dismissError: useCallback(() => setError(null), []),
    allMovements: movements,
  }
}
