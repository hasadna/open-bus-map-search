// ErrorContext.tsx
import React, { createContext, useState, useContext } from 'react'

type ErrorContextType = {
  value: boolean
  setValue: (val: boolean) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useErrorContext must be used within ErrorProvider')
  return ctx
}

export const ErrorContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState(false)

  return <ErrorContext.Provider value={{ value, setValue }}>{children}</ErrorContext.Provider>
}
