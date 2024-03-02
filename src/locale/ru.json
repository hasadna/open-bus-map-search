import { FC, PropsWithChildren, createContext, useState } from 'react'

export interface LayoutContextInterface {
  setDrawerOpen: (isOpen: boolean) => void
  drawerOpen: boolean
}
export const LayoutCtx = createContext({} as LayoutContextInterface)
const LayoutContext: FC<PropsWithChildren> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  return <LayoutCtx.Provider value={{ drawerOpen, setDrawerOpen }}>{children}</LayoutCtx.Provider>
}
export default LayoutContext
