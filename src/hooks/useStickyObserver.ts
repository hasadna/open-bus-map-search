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
        if (entry.boundingClientRect.bottom <= 86) {
          // Sticky has reached the top
          console.log('Sticky element is at the top!')
          // Trigger your event here
        } else {
          console.log('Sticky element is not at the top.')
        }
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
