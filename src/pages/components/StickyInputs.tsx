import { styled } from '@mui/material/styles'
import { type ReactNode, useEffect, useRef, useState } from 'react'

// Pinned filter section. Transparent at rest (matches the pre-PR baseline —
// no visible container box on the gaps page); becomes opaque using the MUI
// theme's default page background only once the scrollable ancestor has
// actually scrolled, which is exactly when content would otherwise bleed
// through. This avoids the visual regression Noam flagged while preserving
// the bleed-through fix earlier in #1528.
const Container = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  paddingBottom: 8,
  '&[data-stuck="true"]': {
    backgroundColor: theme.palette.background.default,
  },
}))

function findScrollableAncestor(el: HTMLElement): HTMLElement | null {
  let parent: HTMLElement | null = el.parentElement
  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

export const StickyInputs = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const scrollAncestor = findScrollableAncestor(el)
    const target: HTMLElement | Window = scrollAncestor ?? window
    const getScroll = () => (scrollAncestor ? scrollAncestor.scrollTop : window.scrollY)
    const check = () => setStuck(getScroll() > 0)
    check()
    target.addEventListener('scroll', check, { passive: true })
    return () => target.removeEventListener('scroll', check)
  }, [])

  return (
    <Container ref={ref} data-stuck={stuck ? 'true' : 'false'}>
      {children}
    </Container>
  )
}
