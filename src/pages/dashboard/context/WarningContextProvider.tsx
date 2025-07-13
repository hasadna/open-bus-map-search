// WarningContext.tsx
import React, { createContext, useState, useContext } from 'react'

type WarningContextType = {
  value: boolean
  setValue: (val: boolean) => void
}

const WarningContext = createContext<WarningContextType | undefined>(undefined)

export const useWarningContext = () => {
  const ctx = useContext(WarningContext)
  if (!ctx) throw new Error('useWarningContext must be used within ErrorProvider')
  return ctx
}

export const WarningContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState(false)

  return <WarningContext.Provider value={{ value, setValue }}>{children}</WarningContext.Provider>
}
