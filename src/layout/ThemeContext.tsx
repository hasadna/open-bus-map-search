import { ThemeProvider as MuiThemeProvider, ScopedCssBaseline, createTheme } from '@mui/material'
import { enUS, heIL } from '@mui/material/locale'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { enUS as dateEnUS, heIL as dateHeIL } from '@mui/x-date-pickers/locales'
import { ConfigProvider, ConfigProviderProps, theme as antdlgorithm } from 'antd'
import antdEnUS from 'antd/es/locale/en_US'
import antdHeIL from 'antd/es/locale/he_IL'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from 'usehooks-ts'
import dayjs from 'src/dayjs'

export interface ThemeContextInterface {
  toggleTheme: () => void
  toggleLanguage: () => void
  isDarkTheme?: boolean
}

const ThemeContext = createContext<ThemeContextInterface>({} as ThemeContextInterface)

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage<boolean>(
    'isDarkTheme',
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [language, setLanguage] = useLocalStorage<string>('language', 'he')
  const { i18n } = useTranslation()

  const toggleTheme = useCallback(() => setIsDarkTheme((prev) => !prev), [setIsDarkTheme])

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'en' ? 'he' : 'en'
    setLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
  }, [language, i18n, setLanguage])

  const contextValue = useMemo(
    () => ({ isDarkTheme, toggleLanguage, toggleTheme }),
    [isDarkTheme, toggleLanguage, toggleTheme],
  )

  useEffect(() => {
    if (!language) return
    i18n.changeLanguage(language)
    document.title = i18n.t('website_name')
    document.documentElement.dir = i18n.dir()
    document.documentElement.lang = language
    dayjs.locale(language)
  }, [language, i18n])

  const muiTheme = useMemo(() => {
    const isEnglish = language === 'en'
    const direction = isEnglish ? 'ltr' : 'rtl'
    return createTheme(
      { direction, palette: { mode: isDarkTheme ? 'dark' : 'light' } },
      isEnglish ? enUS : heIL,
      isEnglish ? dateEnUS : dateHeIL,
    )
  }, [isDarkTheme, language])

  const antdTheme = useMemo<ConfigProviderProps>(() => {
    return {
      direction: language === 'en' ? 'ltr' : 'rtl',
      locale: language === 'en' ? antdEnUS : antdHeIL,
      theme: {
        algorithm: isDarkTheme ? antdlgorithm.darkAlgorithm : antdlgorithm.defaultAlgorithm,
        token: {
          colorBgBase: isDarkTheme ? '#1c1d1c' : '#ffffff',
          colorTextBase: isDarkTheme ? '#ffffff' : '#000000',
        },
      },
    }
  }, [isDarkTheme, language])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language}>
      <ConfigProvider {...antdTheme}>
        <MuiThemeProvider theme={muiTheme}>
          <ScopedCssBaseline enableColorScheme>
            <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
          </ScopedCssBaseline>
        </MuiThemeProvider>
      </ConfigProvider>
    </LocalizationProvider>
  )
}

export const useTheme = () => useContext(ThemeContext)
