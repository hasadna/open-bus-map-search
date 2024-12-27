import { FC, PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import { ConfigProvider, theme } from 'antd'
import heIL from 'antd/es/locale/he_IL'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from 'src/locale/useLocalStorage'

export interface ThemeContextInterface {
  toggleTheme: () => void
  toggleLanguage: () => void
  isDarkTheme?: boolean
}

const ThemeContext = createContext({} as ThemeContextInterface)

const { defaultAlgorithm, darkAlgorithm } = theme

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage<boolean>('isDarkTheme')
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl')
  const { i18n } = useTranslation()

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme: boolean) => !prevTheme)
  }

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'he' : 'en'
    i18n.changeLanguage(newLanguage)
    setDirection(newLanguage === 'he' ? 'rtl' : 'ltr') // Update direction directly in MUI theme when language changes
  }

  const contextValue = {
    isDarkTheme,
    toggleLanguage,
    toggleTheme,
  }

  // Re-create the theme when the theme changes or the language changes
  const theme = useMemo(
    () =>
      createTheme({
        direction,
        palette: {
          mode: isDarkTheme ? 'dark' : 'light',
        },
      }),
    [isDarkTheme, direction],
  )

  return (
    <ConfigProvider
      direction={i18n.dir()}
      locale={heIL}
      theme={{
        algorithm: isDarkTheme ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorBgBase: isDarkTheme ? '#1c1d1c' : '#ffffff',
          colorTextBase: isDarkTheme ? '#ffffff' : '#000000',
        },
      }}>
      <MuiThemeProvider theme={theme}>
        <ScopedCssBaseline enableColorScheme>
          <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
        </ScopedCssBaseline>
      </MuiThemeProvider>
    </ConfigProvider>
  )
}

export const useTheme = () => useContext(ThemeContext)
