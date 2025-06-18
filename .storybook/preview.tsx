import type { Parameters, Decorator } from '@storybook/react-vite'
import type { GlobalTypes } from 'storybook/internal/csf'
import { Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from 'src/layout/ThemeContext'
import i18n from 'src/locale/allTranslations'
import 'src/index.css'
import 'src/App.scss'
import 'leaflet/dist/leaflet.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})

queryClient.setQueryData(['version'], '1.2.3')

export const parameters = {
  eyes: {
    beforeCaptureScreenshot: async () => {
      await waitFor(
        () => {
          if (document.querySelector('.ant-skeleton')) {
            throw new Error('Skeleton still visible')
          }
        },
        { timeout: 5000 },
      )
    },
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
  },
  options: {
    storySort: {
      method: 'alphabetical',
      order: [],
    },
  },
} satisfies Parameters

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'he',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'he', title: 'עברית' },
        { value: 'en', title: 'English' },
      ],
      showName: true,
    },
  },
  darkMode: {
    name: 'Dark Mode',
    description: 'Enable dark mode',
    defaultValue: false,
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: false, title: 'Light' },
        { value: true, title: 'Dark' },
      ],
      showName: true,
    },
  },
} satisfies GlobalTypes

export const decorators = [
  (Story, context) => {
    const { locale, darkMode } = context.globals
    return (
      <Suspense fallback={null}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <StoryBookWrapper locale={locale} darkMode={darkMode}>
                <Story />
              </StoryBookWrapper>
            </ThemeProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </Suspense>
    )
  },
] satisfies Decorator[]

const StoryBookWrapper = ({
  darkMode,
  locale,
  children,
}: {
  darkMode?: boolean
  locale?: string
  children: React.ReactNode
}) => {
  const { isDarkTheme, toggleTheme } = useTheme()

  useEffect(() => {
    if (isDarkTheme !== darkMode) {
      toggleTheme()
    }
  }, [darkMode, isDarkTheme, toggleTheme])

  useEffect(() => {
    i18n.changeLanguage(locale)
  }, [locale])

  return children
}
