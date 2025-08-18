import type { Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
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

const preview: Preview = {
  beforeAll: () => {
    initialize({
      serviceWorker: {
        url: './serviceWorkerUrl.js',
      },
    })
  },
  loaders: [mswLoader],
  parameters: {
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
      },
    },
  },
  decorators: [
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
  ],
  tags: ['autodocs'],
}

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
}

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

export default preview
