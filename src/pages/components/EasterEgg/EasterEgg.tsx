import { createContext, useState } from 'react'
import useKonami from 'use-konami'

export const FadeContext = createContext(false)

export function EasterEgg({
  children,
  code,
  onShow,
  autohide = true,
}: {
  children?: React.ReactNode
  code: string
  autohide?: boolean
  onShow?: () => void
}) {
  const [show, setShow] = useState(false)
  const [fade, setFade] = useState(false)
  useKonami({
    onUnlock: () => {
      setShow(true)
      onShow?.()
      if (autohide) {
        setTimeout(() => {
          setFade(true)
        }, 9000)
        setTimeout(() => {
          setShow(false)
          setFade(false)
        }, 10000)
      }
    },
    sequence: code.split(''),
  })
  return show && <FadeContext.Provider value={fade}>{children}</FadeContext.Provider>
}
