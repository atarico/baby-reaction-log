import { useEffect, useState } from 'react'

/** Re-renders on an interval so relative timestamps stay honest. */
export const useNow = (everyMs = 30_000): Date => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), everyMs)

    return () => clearInterval(timer)
  }, [everyMs])

  return now
}
