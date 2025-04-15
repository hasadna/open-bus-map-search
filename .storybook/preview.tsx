import type { Preview } from '@storybook/react'
import { Suspense, useEffect } from 'react'
import { ThemeProvider, useTheme } from 'src/layout/ThemeContext'
import i18n from 'src/locale/allTranslations'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { locale, darkMode } = context.globals
      return (
        <Suspense>
          <ThemeProvider>
            <StoryBookWrapper locale={locale} darkMode={darkMode}>
              <Story />
            </StoryBookWrapper>
          </ThemeProvider>
        </Suspense>
      )
    },
  ],
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

export default preview

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
