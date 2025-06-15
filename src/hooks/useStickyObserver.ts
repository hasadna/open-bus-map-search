import { useEffect, useRef, useState } from 'react'
import { useHeaderEvent } from 'src/layout/LayoutContext'

export function useStickyObserver() {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [isSticky, setIsSticky] = useState(false)

  const { triggerHeaderEvent } = useHeaderEvent()

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        root: null,
        threshold: [0],
      },
    )

    observer.observe(sentinelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (triggerHeaderEvent) {
      triggerHeaderEvent(isSticky)
    }
  }, [isSticky])

  return { sentinelRef, isSticky }
}
