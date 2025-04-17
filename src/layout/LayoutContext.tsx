import { PropsWithChildren, createContext, useState } from 'react'

export interface LayoutContextInterface {
  setDrawerOpen: (isOpen: boolean) => void
  drawerOpen: boolean
}
export const LayoutCtx = createContext({} as LayoutContextInterface)

const LayoutContext = ({ children }: PropsWithChildren) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  return <LayoutCtx.Provider value={{ drawerOpen, setDrawerOpen }}>{children}</LayoutCtx.Provider>
}
export default LayoutContext
