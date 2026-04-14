import { createContext, FC, PropsWithChildren, useMemo, useState } from 'react'

export interface LayoutContextInterface {
  setDrawerOpen: (isOpen: boolean) => void
  drawerOpen: boolean
}
export const LayoutCtx = createContext({} as LayoutContextInterface)
const LayoutContext: FC<PropsWithChildren> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const value = useMemo(() => ({ drawerOpen, setDrawerOpen }), [drawerOpen])
  return <LayoutCtx.Provider value={value}>{children}</LayoutCtx.Provider>
}
export default LayoutContext
