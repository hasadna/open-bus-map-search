import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { createTheme, ThemeProvider as MuiThemeProvider, ScopedCssBaseline } from '@mui/material'
import { arEG, enUS, heIL, ruRU } from '@mui/material/locale'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { enUS as dateEnUS, heIL as dateHeIL, ruRU as dateRuRU } from '@mui/x-date-pickers/locales'
import { theme as antdlgorithm, ConfigProvider, ConfigProviderProps } from 'antd'
import antdArEG from 'antd/es/locale/ar_EG'
import antdEnUS from 'antd/es/locale/en_US'
import antdHeIL from 'antd/es/locale/he_IL'
import antdRuRU from 'antd/es/locale/ru_RU'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import rtlPlugin from 'stylis-plugin-rtl'
import { useLocalStorage } from 'usehooks-ts'
import dayjs from 'src/dayjs'
import { getLang, getPathWithoutLang } from 'src/locale/allTranslations'

// Direction-aware emotion caches: the RTL cache flips physical CSS (left↔right),
// the LTR cache uses emotion's default (prefixer only). Selecting the cache by the
// active language keeps MUI's generated styles in sync with the layout direction,
// so grouped components (ButtonGroup/ToggleButtonGroup) round their outer corners
// correctly without per-component dir="rtl" workarounds.
const cacheRtl = createCache({ key: 'muirtl', stylisPlugins: [rtlPlugin] })
const cacheLtr = createCache({ key: 'mui' })
const RTL_LANGUAGES = ['he', 'ar']

export interface ThemeContextInterface {
  toggleTheme: () => void
  setLanguage: (language: string) => void
  currentLanguage: string
  isDarkTheme?: boolean
}

const ThemeContext = createContext<ThemeContextInterface>({} as ThemeContextInterface)

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage<boolean>(
    'isDarkTheme',
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  const initialLang = getLang()
  const [language, setLanguage] = useLocalStorage<string>('language', () => initialLang)

  const { i18n } = useTranslation()
  const navigate = useNavigate()

  const toggleTheme = useCallback(() => setIsDarkTheme((prev) => !prev), [setIsDarkTheme])

  const emotionCache = RTL_LANGUAGES.includes(language) ? cacheRtl : cacheLtr

  const location = useLocation()

  const changeLanguage = useCallback(
    (newLanguage: string) => {
      setLanguage(newLanguage)
      const pathWithoutLang = getPathWithoutLang(location.pathname)
      navigate(`/${newLanguage}${pathWithoutLang}`)
    },
    [setLanguage, navigate, location],
  )

  const contextValue = useMemo(
    () => ({
      isDarkTheme,
      toggleTheme,
      setLanguage: changeLanguage,
      currentLanguage: language,
    }),
    [isDarkTheme, toggleTheme, changeLanguage, language],
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
    const langConfig = {
      he: {
        direction: 'rtl',
        muiLocale: heIL,
        dateLocale: {
          ...dateHeIL,
          components: {
            ...dateHeIL.components,
            MuiLocalizationProvider: {
              ...dateHeIL.components?.MuiLocalizationProvider,
              defaultProps: {
                ...dateHeIL.components?.MuiLocalizationProvider?.defaultProps,
                localeText: {
                  ...dateHeIL.components?.MuiLocalizationProvider?.defaultProps?.localeText,
                  previousMonth: 'החודש הקודם',
                  nextMonth: 'החודש הבא',
                },
              },
            },
          },
        },
      },
      en: { direction: 'ltr', muiLocale: enUS, dateLocale: dateEnUS },
      ru: { direction: 'ltr', muiLocale: ruRU, dateLocale: dateRuRU },
      ar: { direction: 'rtl', muiLocale: arEG, dateLocale: dateEnUS },
    } as const

    const { direction, muiLocale, dateLocale } =
      langConfig[language as keyof typeof langConfig] || langConfig.he
    return createTheme(
      {
        components: {
          MuiInputAdornment: {
            styleOverrides: {
              root: {
                marginRight: 8,
                marginLeft: 0,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                boxShadow: isDarkTheme
                  ? '0 4px 12px 0 rgba(0,0,0,0.7)'
                  : '0 4px 12px 0 rgba(0,0,0,0.12)',
                background: isDarkTheme ? 'linear-gradient(145deg, #252525, #141414)' : '',
                border: isDarkTheme ? '1px solid #e0e0e0' : '1px solid transparent',
                transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
              },
            },
          },
        },
        direction,
        palette: { mode: isDarkTheme ? 'dark' : 'light' },
      },
      muiLocale,
      dateLocale,
    )
  }, [isDarkTheme, language])

  const antdTheme = useMemo<ConfigProviderProps>(() => {
    const langConfig = {
      he: { direction: 'rtl', locale: antdHeIL },
      en: { direction: 'ltr', locale: antdEnUS },
      ru: { direction: 'ltr', locale: antdRuRU },
      ar: { direction: 'rtl', locale: antdArEG },
    } as const

    const { direction, locale } = langConfig[language as keyof typeof langConfig] || langConfig.he

    return {
      direction,
      locale,
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
    <CacheProvider value={emotionCache}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language}>
        <ConfigProvider {...antdTheme}>
          <MuiThemeProvider theme={muiTheme}>
            <ScopedCssBaseline enableColorScheme>
              <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
            </ScopedCssBaseline>
          </MuiThemeProvider>
        </ConfigProvider>
      </LocalizationProvider>
    </CacheProvider>
  )
}

export const useTheme = () => useContext(ThemeContext)
