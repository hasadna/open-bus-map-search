import { useEffect, useRef, useState } from 'react'

export function useStickyObserver() {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(entry.boundingClientRect.bottom)
        setIsSticky(entry.boundingClientRect.bottom <= 86)
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

  return { sentinelRef, isSticky }
}
