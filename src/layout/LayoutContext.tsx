import { FC, PropsWithChildren, createContext, useContext, useState } from 'react'

export interface LayoutContextInterface {
  setDrawerOpen: (isOpen: boolean) => void
  drawerOpen: boolean
  triggerHeaderEvent?: (isSticky: boolean) => void
  headerEventTriggered?: boolean
}

export const LayoutCtx = createContext({} as LayoutContextInterface)

export const useHeaderEvent = () => {
  const context = useContext(LayoutCtx)
  if (!context) throw new Error('useEvent must be used within EventProvider')
  return context
}

const LayoutContext: FC<PropsWithChildren> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [eventTriggered, setHeaderEventTriggered] = useState(false)

  const triggerHeaderEvent = (isSticky: boolean) => {
    setHeaderEventTriggered(isSticky)
  }

  return (
    <LayoutCtx.Provider
      value={{
        drawerOpen,
        setDrawerOpen,
        triggerHeaderEvent,
        headerEventTriggered: eventTriggered,
      }}>
      {children}
    </LayoutCtx.Provider>
  )
}

export default LayoutContext
