import { FC, PropsWithChildren, createContext, useContext, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme, ScopedCssBaseline } from '@mui/material'
import { heIL, enUS } from '@mui/material/locale'
import { heIL as dateHeIL, enUS as dateEnUS } from '@mui/x-date-pickers/locales'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { ConfigProvider, theme } from 'antd'
import antdHeIL from 'antd/es/locale/he_IL'
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
  const { i18n } = useTranslation()

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme: boolean) => !prevTheme)
  }

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'he' : 'en'
    i18n.changeLanguage(newLanguage)
  }

  const contextValue = {
    isDarkTheme,
    toggleLanguage,
    toggleTheme,
  }

  // Re-create the theme when the theme changes or the language changes
  const theme = useMemo(() => {
    const direction = i18n.language === 'he' ? 'rtl' : 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = i18n.language
    return createTheme(
      {
        direction,
        palette: {
          mode: isDarkTheme ? 'dark' : 'light',
        },
      },
      i18n.language === 'he' ? heIL : enUS,
      i18n.language === 'he' ? dateHeIL : dateEnUS,
    )
  }, [isDarkTheme, i18n.language])

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
      <ConfigProvider
        direction={i18n.language === 'he' ? 'rtl' : 'ltr'}
        locale={antdHeIL}
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
    </LocalizationProvider>
  )
}

export const useTheme = () => useContext(ThemeContext)
