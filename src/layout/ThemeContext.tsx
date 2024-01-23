import React, { FC, PropsWithChildren, createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import { ConfigProvider, theme } from 'antd'
import heIL from 'antd/es/locale/he_IL'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from 'src/locale/useLocalStorage'

export interface ThemeContextInterface {
  toggleTheme: () => void
  isDarkTheme: boolean
}

const ThemeContext = createContext({} as ThemeContextInterface)

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

const { defaultAlgorithm, darkAlgorithm } = theme

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { setItem, getItem } = useLocalStorage('isDarkTheme')
  const [isDarkTheme, setIsDarkTheme] = useState(getItem())

  const { i18n } = useTranslation()
  const toggleTheme = () => {
    setIsDarkTheme((prevTheme: boolean) => {
      const newTheme = !prevTheme
      setItem(String(newTheme))
      return newTheme
    })
  }

  const contextValue = {
    isDarkTheme,
    toggleTheme,
  }

  useEffect(() => {
    const storedTheme = getItem() === 'true'
    setIsDarkTheme(storedTheme || false)
  }, [])

  return (
    <ConfigProvider
      direction={i18n.dir()}
      locale={heIL}
      theme={{
        algorithm: isDarkTheme ? darkAlgorithm : defaultAlgorithm,
      }}>
      <MuiThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
        <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
      </MuiThemeProvider>
    </ConfigProvider>
  )
}

export const useTheme = () => {
  return useContext(ThemeContext)
}
