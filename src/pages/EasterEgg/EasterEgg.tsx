import { createContext, useState } from 'react'
import useKonami from 'use-konami'

export const FadeContext = createContext(false)

export function EasterEgg({ children, code }: { children?: React.ReactNode; code: string }) {
  const [show, setShow] = useState(false)
  const [fade, setFade] = useState(false)
  useKonami({
    onUnlock: () => {
      setShow(true)
      setTimeout(() => {
        setFade(true)
      }, 9000)
      setTimeout(() => {
        setShow(false)
        setFade(false)
      }, 10000)
    },
    sequence: code.split(''),
  })
  return show && <FadeContext.Provider value={fade}>{children}</FadeContext.Provider>
}
